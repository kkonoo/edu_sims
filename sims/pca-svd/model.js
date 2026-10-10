// PCA·SVD 저차원 근사 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 행렬은 { m, n, a } (a = 길이 m·n의 Float64Array, 행 우선: a[i·n + j]). 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const PS = (function () {
  'use strict';

  /* ---------- SVD: one-sided Jacobi (Hestenes) ----------
   * 열끼리 직교할 때까지 두 열씩 회전시킴: A V = (직교하는 열들) = U Σ.
   * 작은 특잇값까지 정확하고(상대오차) 코드가 짧음. 120 × 120에서 수십 ms.
   * 돌려주는 값: d(내림차순, 길이 r = min(m, n)), u[l](길이 m), v[l](길이 n), rank(σ > tol인 개수), sweeps(반복 횟수).
   * σ ≈ 0인 성분의 u는 정해지지 않으므로(R도 임의) rank 뒤의 u는 0 벡터로 둠 */
  function svd(M) {
    const tall = M.m >= M.n;
    const rows = tall ? M.m : M.n, cols = tall ? M.n : M.m; // 회전시킬 열: 길이 rows, 개수 cols
    const W = Array.from({ length: cols }, (_, j) => {
      const c = new Float64Array(rows);
      for (let i = 0; i < rows; i++) c[i] = tall ? M.a[i * M.n + j] : M.a[j * M.n + i];
      return c;
    });
    const V = Array.from({ length: cols }, (_, j) => { const c = new Float64Array(cols); c[j] = 1; return c; });
    const EPS = 1e-15;
    const sq = new Float64Array(cols); // 열의 제곱 길이: 회전할 때 공식으로 고치고, 반복마다 새로 계산(오차 누적 방지)
    let sweeps = 0;
    for (let sweep = 0; sweep < 60; sweep++) {
      sweeps++;
      let rotated = false;
      W.forEach((c, j) => { let s = 0; for (let i = 0; i < rows; i++) s += c[i] * c[i]; sq[j] = s; });
      for (let p = 0; p < cols - 1; p++) {
        for (let q = p + 1; q < cols; q++) {
          const a = W[p], b = W[q], alpha = sq[p], beta = sq[q];
          let gamma = 0;
          for (let i = 0; i < rows; i++) gamma += a[i] * b[i];
          if (gamma === 0 || Math.abs(gamma) <= EPS * Math.sqrt(alpha * beta)) continue;
          rotated = true;
          // [α γ; γ β]를 대각으로 만드는 회전 (대칭 Jacobi와 같은 t)
          const zeta = (beta - alpha) / (2 * gamma);
          const t = (zeta >= 0 ? 1 : -1) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
          const c = 1 / Math.sqrt(1 + t * t), s = c * t;
          for (let i = 0; i < rows; i++) { const x = a[i], y = b[i]; a[i] = c * x - s * y; b[i] = s * x + c * y; }
          const vp = V[p], vq = V[q];
          for (let i = 0; i < cols; i++) { const x = vp[i], y = vq[i]; vp[i] = c * x - s * y; vq[i] = s * x + c * y; }
          sq[p] = alpha - t * gamma;
          sq[q] = beta + t * gamma;
        }
      }
      if (!rotated) break;
    }
    const norms = W.map((c) => Math.sqrt(c.reduce((s, x) => s + x * x, 0)));
    const order = norms.map((_, j) => j).sort((x, y) => norms[y] - norms[x]);
    const d = new Float64Array(cols);
    const left = [], right = [];
    const tol = Math.max(rows, cols) * 1e-13 * (norms[order[0]] || 0);
    let rank = 0;
    order.forEach((j, l) => {
      d[l] = norms[j];
      const u = new Float64Array(rows);
      if (norms[j] > tol) { rank++; for (let i = 0; i < rows; i++) u[i] = W[j][i] / norms[j]; }
      left.push(u); right.push(V[j]);
    });
    // 가로로 긴 행렬은 Aᵀ를 분해했으므로 U와 V를 바꿈
    return tall ? { m: M.m, n: M.n, d, u: left, v: right, rank, sweeps } : { m: M.m, n: M.n, d, u: right, v: left, rank, sweeps };
  }

  /* ---------- 저랭크 근사 ---------- */
  // Aₖ = Σ_{l<k} σₗ uₗ vₗᵀ (+ 열 평균 mean을 더함: PCA로 복원할 때). 행 우선 Float64Array
  function approx(S, k, mean) {
    const { m, n } = S, out = new Float64Array(m * n);
    if (mean) for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) out[i * n + j] = mean[j];
    for (let l = 0; l < Math.min(k, S.d.length); l++) {
      const u = S.u[l], v = S.v[l], s = S.d[l];
      for (let i = 0; i < m; i++) {
        const su = s * u[i];
        if (su === 0) continue;
        for (let j = 0; j < n; j++) out[i * n + j] += su * v[j];
      }
    }
    return out;
  }

  // l번째(0부터) 랭크-1 조각 σₗ uₗ vₗᵀ
  function piece(S, l) {
    const { m, n } = S, out = new Float64Array(m * n), u = S.u[l], v = S.v[l], s = S.d[l];
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) out[i * n + j] = s * u[i] * v[j];
    return out;
  }

  // 에카르트–영: ‖A − Aₖ‖_F = √(Σ_{l≥k} σₗ²). 상대값은 ‖A‖_F = √(Σσ²)로 나눔
  function tailError(d, k) {
    let tail = 0, all = 0;
    d.forEach((s, l) => { all += s * s; if (l >= k) tail += s * s; });
    return { abs: Math.sqrt(tail), rel: all > 0 ? Math.sqrt(tail / all) : 0, kept: all > 0 ? 1 - tail / all : 1 };
  }

  // 저장량: m × n 대신 k(m + n + 1)개 (uₗ, vₗ, σₗ)
  const storage = (m, n, k) => (k * (m + n + 1)) / (m * n);

  const frob = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0));

  /* ---------- 열 중심화 (PCA) ---------- */
  function colMeans(M) {
    const mean = new Float64Array(M.n);
    for (let i = 0; i < M.m; i++) for (let j = 0; j < M.n; j++) mean[j] += M.a[i * M.n + j];
    return mean.map((x) => x / M.m);
  }
  function center(M, mean) {
    const a = new Float64Array(M.m * M.n);
    for (let i = 0; i < M.m; i++) for (let j = 0; j < M.n; j++) a[i * M.n + j] = M.a[i * M.n + j] - mean[j];
    return { m: M.m, n: M.n, a };
  }

  // 분해 한 번에 필요한 것 모두: center = true면 PCA(열 평균을 빼고 SVD, 복원할 때 다시 더함)
  function decompose(M, centered) {
    const mean = centered ? colMeans(M) : null;
    const S = svd(centered ? center(M, mean) : M);
    S.mean = mean;
    return S;
  }

  /* ---------- 데이터 1: 합성 이미지 (교재 선형대수 15장 그림과 같은 방식) ----------
   * 부드러운 무늬(잡음을 여러 번 평균) + 물결 sin·cos(랭크 1) + 정사각형(랭크 1) + 원 + 대각선 띠.
   * 축에 나란한 모양은 적은 조각으로, 비스듬한 모양과 잡음은 많은 조각이 있어야 살아남음 */
  const IMG_N = 120;
  function image(seed) {
    const N = IMG_N, rng = EduSim.rng(seed);
    let f = new Float64Array(N * N).map(() => rng.normal());
    for (let it = 0; it < 22; it++) { // 상하좌우 평균 (가장자리는 반대편과 이어짐)
      const g = new Float64Array(N * N);
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          g[y * N + x] = (f[y * N + x] + f[((y + 1) % N) * N + x] + f[((y + N - 1) % N) * N + x] +
            f[y * N + ((x + 1) % N)] + f[y * N + ((x + N - 1) % N)]) / 5;
        }
      }
      f = g;
    }
    const mu = f.reduce((s, v) => s + v, 0) / f.length;
    const sd = Math.sqrt(f.reduce((s, v) => s + (v - mu) ** 2, 0) / f.length);
    // 정사각형은 왼쪽 아래, 원은 오른쪽 위 근처 (시드마다 조금씩 이동, 반반 확률로 좌우를 바꿈)
    const flip = rng.uniform() < 0.5;
    const jit = () => (rng.uniform() - 0.5) * 16;
    const sq = { x: 36 + jit(), y: 84 + jit(), h: 15 };
    const dk = { x: 84 + jit(), y: 36 + jit(), r: 20 };
    if (flip) { sq.x = N - sq.x; dk.x = N - dk.x; }
    const ph1 = rng.uniform() * 2 * Math.PI, ph2 = rng.uniform() * 2 * Math.PI;
    const band = (rng.uniform() - 0.5) * 20; // 대각선 띠의 위치
    const a = new Float64Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const diag = flip ? Math.abs(x + y - N + band) : Math.abs(x - y + band);
        a[y * N + x] = 0.45 * (f[y * N + x] - mu) / sd +
          1.2 * Math.sin(x / 11 + ph1) * Math.cos(y / 17 + ph2) +
          (Math.abs(x - sq.x) < sq.h && Math.abs(y - sq.y) < sq.h ? 1.7 : 0) +
          ((x - dk.x) ** 2 + (y - dk.y) ** 2 < dk.r * dk.r ? 1.7 : 0) +
          (diag < 4 ? 1.2 : 0);
      }
    }
    return { m: N, n: N, a };
  }

  /* ---------- 데이터 2: 가상 세포 × 유전자 (HVG를 고른 뒤의 log 발현이라고 가정) ----------
   * 유형 A·B·C(흔함)와 D(드묾, 4%). 유형마다 표지 유전자 묶음이 올라감. H 유전자들은 유형과 무관.
   * 세포는 유형 순서로 정렬. 값 = max(0, 바탕 + 표지 효과 + 잡음) */
  const TYPES = ['A', 'B', 'C', 'D'];
  const COUNTS = [135, 90, 63, 12]; // 300개
  const BLOCKS = [['A', 8], ['B', 8], ['C', 8], ['D', 6], ['H', 10]]; // 40개
  const EFFECT = [2, 2, 2, 1.5]; // 표지 유전자가 올라가는 양. D는 작게 → 분산이 작아 scree에서 잡음 바로 위에 놓임
  const NOISE = 0.6;
  const GENES = BLOCKS.flatMap(([b, k]) => Array.from({ length: k }, (_, i) => b + (i + 1)));
  const GENE_BLOCK = BLOCKS.flatMap(([b, k], bi) => Array(k).fill(bi));

  function cells(seed) {
    const rng = EduSim.rng(seed + 50000); // 이미지와 다른 난수
    const n = GENES.length, m = COUNTS.reduce((s, c) => s + c, 0);
    const base = GENES.map(() => 0.4 + 1.6 * rng.uniform());
    const type = new Int8Array(m);
    let r = 0;
    COUNTS.forEach((c, t) => { for (let i = 0; i < c; i++) type[r++] = t; });
    const a = new Float64Array(m * n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const up = GENE_BLOCK[j] === type[i] ? EFFECT[type[i]] : 0;
        a[i * n + j] = Math.max(0, base[j] + up + NOISE * rng.normal());
      }
    }
    return { m, n, a, type };
  }

  return {
    svd, approx, piece, tailError, storage, frob, colMeans, center, decompose,
    IMG_N, image, TYPES, COUNTS, BLOCKS, GENES, GENE_BLOCK, EFFECT, NOISE, cells,
  };
})();
