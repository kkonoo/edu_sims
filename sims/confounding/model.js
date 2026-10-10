// 교란변수·배치효과 계산 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const CF = (function () {
  'use strict';

  const SIGMA = 1; // 잡음 표준편차
  const CONT = { K: 3, M: 20 }; // 연속 모드: 배치 3개 × 20
  const TREAT = { K: 2, M: 20 }; // 처리 모드: 배치 2개 × 20

  /* ---------- 최소제곱 (설계행렬의 열이 몇 개 안 되므로 정규방정식) ---------- */
  // X의 각 행 = [1, x, 배치 더미…]. 열이 서로 겹쳐(랭크 부족) 풀 수 없으면 ok = false
  function ols(X, y) {
    const n = X.length, p = X[0].length;
    const A = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((s, r) => s + r[a] * r[b], 0)));
    const scale = Math.max(...A.map((r, i) => Math.abs(r[i])));
    // [A | I]를 가우스-조르당으로 → A⁻¹ (피벗이 0에 가까우면 랭크 부족)
    const M = A.map((r, i) => [...r, ...Array.from({ length: p }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < p; c++) {
      let piv = c;
      for (let r = c + 1; r < p; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) < 1e-10 * scale) return { ok: false, n, p };
      [M[c], M[piv]] = [M[piv], M[c]];
      const d = M[c][c];
      for (let k = 0; k < 2 * p; k++) M[c][k] /= d;
      for (let r = 0; r < p; r++) {
        if (r === c) continue;
        const f = M[r][c];
        if (f !== 0) for (let k = 0; k < 2 * p; k++) M[r][k] -= f * M[c][k];
      }
    }
    const inv = M.map((r) => r.slice(p));
    const Xty = Array.from({ length: p }, (_, a) => X.reduce((s, r, i) => s + r[a] * y[i], 0));
    const coef = inv.map((r) => r.reduce((s, v, j) => s + v * Xty[j], 0));
    const rss = y.reduce((s, v, i) => s + (v - X[i].reduce((t, x, j) => t + x * coef[j], 0)) ** 2, 0);
    const df = n - p, s2 = rss / df;
    return { ok: true, n, p, df, coef, se: inv.map((r, i) => Math.sqrt(s2 * r[i])), sigma: Math.sqrt(s2) };
  }

  // t 분포의 97.5% 분위수 (Abramowitz & Stegun 26.7.5 급수). 자유도 30 이상에서 상대오차 10⁻⁷ 미만
  // — 이 시뮬레이터의 자유도는 56(연속)과 37(처리)뿐이라 충분함. 작은 자유도에는 쓰지 말 것
  function qt975(df) {
    const z = 1.959963984540054, z2 = z * z;
    const g1 = (z2 * z + z) / 4;
    const g2 = (5 * z2 * z2 * z + 16 * z2 * z + 3 * z) / 96;
    const g3 = (3 * z2 ** 3 * z + 19 * z2 * z2 * z + 17 * z2 * z - 15 * z) / 384;
    const g4 = (79 * z2 ** 4 * z + 776 * z2 ** 3 * z + 1482 * z2 * z2 * z - 1920 * z2 * z - 945 * z) / 92160;
    return z + g1 / df + g2 / df ** 2 + g3 / df ** 3 + g4 / df ** 4;
  }

  // 배치 무시(y ~ x)와 배치 보정(y ~ x + 배치)의 x 계수와 95% 신뢰구간
  function analyze(d) {
    const n = d.x.length, K = d.K;
    const naive = ols(d.x.map((x) => [1, x]), d.y);
    const adj = ols(d.x.map((x, i) => [1, x, ...Array.from({ length: K - 1 }, (_, k) => (d.batch[i] === k + 1 ? 1 : 0))]), d.y);
    const summary = (f) => {
      if (!f.ok) return { ok: false };
      const h = qt975(f.df) * f.se[1];
      return { ok: true, est: f.coef[1], se: f.se[1], lo: f.coef[1] - h, hi: f.coef[1] + h, coef: f.coef, df: f.df };
    };
    return { n, naive: summary(naive), adj: summary(adj) };
  }

  // 누락변수 편향: 배치를 빼면 x 계수의 기댓값은 β + γ·Σ(x − x̄)(g − ḡ)/Σ(x − x̄)²  (g = 배치 번호)
  function omittedBias(d, gamma) {
    const n = d.x.length;
    const xb = d.x.reduce((s, v) => s + v, 0) / n, gb = d.batch.reduce((s, v) => s + v, 0) / n;
    let sxg = 0, sxx = 0;
    d.x.forEach((x, i) => { sxg += (x - xb) * (d.batch[i] - gb); sxx += (x - xb) ** 2; });
    return (gamma * sxg) / sxx;
  }

  /* ---------- 데이터 ---------- */
  // 시드마다 잡음을 한 번만 뽑아 두고, 슬라이더 값으로 x, y를 만듦 → 슬라이더를 움직여도 점이 매끄럽게 움직임
  function noise(seed, n) {
    const rng = EduSim.rng(seed);
    return Array.from({ length: n }, () => ({ zx: rng.normal(), zy: rng.normal(), jit: rng.uniform() }));
  }

  // 연속 모드: 배치 k(0, 1, 2)의 x 평균은 (k − 1)·shift, y = βx + (k − 1)·γ + 잡음
  function makeCont(seed, beta, gamma, shift) {
    const { K, M } = CONT, z = noise(seed, K * M);
    const x = [], y = [], batch = [];
    for (let k = 0; k < K; k++) {
      for (let i = 0; i < M; i++) {
        const e = z[k * M + i], xi = (k - 1) * shift + e.zx;
        x.push(xi); y.push(beta * xi + (k - 1) * gamma + SIGMA * e.zy); batch.push(k);
      }
    }
    return { mode: 'cont', K, x, y, batch, jit: z.map((e) => e.jit) };
  }

  // 처리 모드: 배치 1에는 처리군이 frac 비율, 배치 2에는 1 − frac 비율 (전체 처리·대조는 반반)
  // y = β·처리 + γ·[배치 2] + 잡음
  function makeTreat(seed, beta, gamma, frac) {
    const { K, M } = TREAT, z = noise(seed + 100000, K * M); // 연속 모드와 다른 난수
    const x = [], y = [], batch = [];
    const nTreat = [Math.round(frac * M), M - Math.round(frac * M)];
    for (let k = 0; k < K; k++) {
      for (let i = 0; i < M; i++) {
        const t = i < nTreat[k] ? 1 : 0;
        x.push(t); y.push(beta * t + k * gamma + SIGMA * z[k * M + i].zy); batch.push(k);
      }
    }
    return { mode: 'treat', K, x, y, batch, jit: z.map((e) => e.jit), nTreat };
  }

  // 처리 모드 설계표: [배치][대조, 처리] 개수
  function designTable(d) {
    const t = Array.from({ length: d.K }, () => [0, 0]);
    d.x.forEach((x, i) => { t[d.batch[i]][x]++; });
    return t;
  }

  return { SIGMA, CONT, TREAT, ols, qt975, analyze, omittedBias, makeCont, makeTreat, designTable };
})();
