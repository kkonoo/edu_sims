// 네트워크 null model(차수 보존 재배선) — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 그래프는 엣지 목록 [[u, v], …] (무방향, 노드 번호 0 … N − 1). 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const NN = (function () {
  'use strict';

  /* ---------- 데이터: Zachary karate club (networkx의 karate_club_graph와 같음: 노드 34개, 엣지 78개) ---------- */
  const N = 34;
  const NEIGHBORS = { // 번호가 큰 쪽 이웃만 적음
    0: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 17, 19, 21, 31], 1: [2, 3, 7, 13, 17, 19, 21, 30], 2: [3, 7, 8, 9, 13, 27, 28, 32],
    3: [7, 12, 13], 4: [6, 10], 5: [6, 10, 16], 6: [16], 8: [30, 32, 33], 9: [33], 13: [33], 14: [32, 33], 15: [32, 33],
    18: [32, 33], 19: [33], 20: [32, 33], 22: [32, 33], 23: [25, 27, 29, 32, 33], 24: [25, 27, 31], 25: [31], 26: [29, 33],
    27: [33], 28: [31, 33], 29: [32, 33], 30: [32, 33], 31: [32, 33], 32: [33],
  };
  const EDGES = Object.entries(NEIGHBORS).flatMap(([u, vs]) => vs.map((v) => [Number(u), v]));
  const M = EDGES.length;
  // 갈라진 두 파벌 (networkx의 club 속성): 0 = Mr. Hi, 1 = Officer
  const HI = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 16, 17, 19, 21];
  const CLUB = Array.from({ length: N }, (_, i) => (HI.includes(i) ? 0 : 1));
  // 그림의 노드 위치 (힘 기반 배치를 한 번 계산해 고정, 0 ~ 1)
  const POS = [[0.33, 0.326], [0.398, 0.264], [0.539, 0.409], [0.348, 0.443], [0.15, 0.482], [0.137, 0.271], [0.098, 0.347],
    [0.394, 0.492], [0.565, 0.25], [0.593, 0.556], [0.163, 0.401], [0.212, 0.078], [0.272, 0.569], [0.47, 0.355], [0.753, 0.049],
    [0.676, 0.04], [0.04, 0.213], [0.249, 0.181], [0.874, 0.135], [0.473, 0.157], [0.823, 0.076], [0.329, 0.095], [0.908, 0.209],
    [0.837, 0.418], [0.824, 0.601], [0.753, 0.622], [0.96, 0.351], [0.766, 0.481], [0.674, 0.518], [0.881, 0.309], [0.591, 0.137],
    [0.653, 0.435], [0.74, 0.22], [0.718, 0.282]];

  /* ---------- 지표 ---------- */
  function adjacency(edges, n = N) {
    const A = new Uint8Array(n * n);
    for (const [u, v] of edges) { A[u * n + v] = 1; A[v * n + u] = 1; }
    return A;
  }
  function degrees(edges, n = N) {
    const d = new Array(n).fill(0);
    for (const [u, v] of edges) { d[u]++; d[v]++; }
    return d;
  }
  // Tᵢ = 노드 i의 이웃끼리 이어진 엣지 수, 삼각형 수 = ΣTᵢ / 3
  // 평균 뭉침 계수 = 평균 Cᵢ, Cᵢ = Tᵢ / C(kᵢ, 2) (차수 2 미만이면 0, networkx와 같음)
  // transitivity = 3 × 삼각형 / ΣC(kᵢ, 2) — 분모는 차수만으로 정해져 재배선해도 그대로
  function metrics(edges, n = N) {
    const A = adjacency(edges, n), k = degrees(edges, n);
    const nb = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) { nb[u].push(v); nb[v].push(u); }
    let T3 = 0, sumC = 0, triples = 0;
    const local = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const L = nb[i];
      let t = 0;
      for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) t += A[L[a] * n + L[b]];
      const pairs = (k[i] * (k[i] - 1)) / 2;
      local[i] = pairs > 0 ? t / pairs : 0;
      T3 += t; sumC += local[i]; triples += pairs;
    }
    return { tri: T3 / 3, avgC: sumC / n, trans: triples > 0 ? T3 / triples : 0, local };
  }

  /* ---------- 차수 보존 재배선 ----------
   * 한 번의 시도: 엣지 두 개 (u, v), (x, y)를 고르고 (방향은 반반) (u, y), (x, v)로 맞바꿈.
   * 자기루프(u = y, x = v)나 이미 있는 엣지가 생기면 그 시도는 버림(그래프는 그대로).
   * 시도는 늘 난수 3개를 씀 → 시도 횟수만 늘리면 앞부분은 똑같이 진행됨.
   * 제안이 대칭(되돌리는 시도의 확률이 같음)이므로, 같은 차수를 가진 그래프 전체에서 고르게(균등) 섞임 */
  function rewire(edges0, attempts, rng, n = N) {
    const m = edges0.length, eu = new Int32Array(m), ev = new Int32Array(m), A = new Uint8Array(n * n);
    edges0.forEach(([u, v], i) => { eu[i] = u; ev[i] = v; A[u * n + v] = A[v * n + u] = 1; });
    let success = 0;
    for (let t = 0; t < attempts; t++) {
      const i = Math.floor(rng.uniform() * m);
      let j = Math.floor(rng.uniform() * (m - 1));
      if (j >= i) j++;
      const flip = rng.uniform() < 0.5;
      const u = eu[i], v = ev[i], x = flip ? ev[j] : eu[j], y = flip ? eu[j] : ev[j];
      if (u === y || x === v || A[u * n + y] || A[x * n + v]) continue;
      A[u * n + v] = A[v * n + u] = A[x * n + y] = A[y * n + x] = 0;
      A[u * n + y] = A[y * n + u] = A[x * n + v] = A[v * n + x] = 1;
      ev[i] = y; eu[j] = x; ev[j] = v; // (u, v) → (u, y),  (x, y) → (x, v)
      success++;
    }
    return { edges: Array.from(eu, (u, i) => [u, ev[i]]), success };
  }

  // null 그래프 i(0부터)는 원래 그래프에서 따로 출발하고, 난수는 시드 × 1000 + i
  const NMAX = 1000;
  const SWAPS = [0, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50]; // 재배선 시도 횟수 (× 엣지 수 m)
  const attemptsFor = (mult) => Math.round(mult * M);
  const nullGraph = (seed, i, attempts) => rewire(EDGES, attempts, EduSim.rng(seed * NMAX + i));

  // null 그래프 count개의 지표 (한 번에 계산해 두고 화면에서는 앞에서부터 n개를 씀)
  function nullMetrics(seed, attempts, count = NMAX) {
    const avgC = new Float64Array(count), tri = new Float64Array(count), trans = new Float64Array(count);
    let success = 0;
    for (let i = 0; i < count; i++) {
      const g = nullGraph(seed, i, attempts), mt = metrics(g.edges);
      avgC[i] = mt.avgC; tri[i] = mt.tri; trans[i] = mt.trans; success += g.success;
    }
    return { avgC, tri, trans, success };
  }

  // 처음 n개로 요약: 평균, 표준편차(n − 1로 나눔), Z = (관측 − 평균)/표준편차,
  // 경험적 p = (관측 이상인 null 수 + 1) / (n + 1) — 가장 작게 나올 수 있는 값은 1/(n + 1)
  function summary(values, n, obs) {
    let s = 0, ge = 0;
    for (let i = 0; i < n; i++) { s += values[i]; if (values[i] >= obs - 1e-12) ge++; }
    const mean = n > 0 ? s / n : NaN;
    let ss = 0;
    for (let i = 0; i < n; i++) ss += (values[i] - mean) ** 2;
    const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : NaN;
    const flat = !(sd > 1e-12 * Math.max(1, Math.abs(mean))); // 모두 같은 값(재배선 0번)이면 반올림 잡음만 남으므로 Z를 정할 수 없음
    return { n, mean, sd: flat ? 0 : sd, z: flat ? NaN : (obs - mean) / sd, ge, p: (ge + 1) / (n + 1), pMin: 1 / (n + 1) };
  }

  // 두 엣지 목록에 함께 있는 엣지의 비율 (재배선이 얼마나 섞었는지)
  function overlap(a, b) {
    const key = ([u, v]) => (u < v ? u * 1000 + v : v * 1000 + u);
    const set = new Set(a.map(key));
    return b.filter((e) => set.has(key(e))).length / b.length;
  }

  return { N, EDGES, M, CLUB, POS, adjacency, degrees, metrics, rewire, NMAX, SWAPS, attemptsFor, nullGraph, nullMetrics, summary, overlap };
})();
