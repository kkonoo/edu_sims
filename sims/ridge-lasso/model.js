// Ridge / Lasso 계산 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 목적함수는 glmnet과 같은 꼴 (X는 열마다 평균 0, (1/n)Σx² = 1로 표준화, y는 평균을 뺌):
//   Ridge: (1/2n)·‖y − Xβ‖² + (λ/2)·‖β‖₂²        Lasso: (1/2n)·‖y − Xβ‖² + λ·‖β‖₁
// 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const RL = (function () {
  'use strict';

  // 참 계수: 진짜 효과는 앞의 3개뿐, 나머지 9개는 잡음 변수
  // (n = 40, σ = 1.5: 시드 100개 중 약 88%에서 Lasso가 진짜 변수를 먼저 고르고, 최적 λ가 OLS보다 테스트 오차를 약 18% 줄임)
  const BETA = [3, -2, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const SIGMA = 1.5; // 잡음 표준편차
  const N = 40, NTEST = 1000;
  const BETA2 = [2, 0.6], SIGMA2 = 2, N2 = 50; // 기하 그림용 두 변수 데이터
  const LOG_GRID = Array.from({ length: 101 }, (_, i) => Math.round((-3 + i * 0.05) * 100) / 100); // log10 λ: −3 ~ 2

  /* ---------- 작은 선형대수 ---------- */
  // Ax = b (부분 피벗 가우스 소거). A는 바꾸지 않음
  function solve(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = M[r][n];
      for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
      x[r] = s / M[r][r];
    }
    return x;
  }
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const col = (X, j) => X.map((row) => row[j]);

  /* ---------- 데이터 ---------- */
  // 예측변수끼리 상관이 모두 ρ인 정규 데이터: xⱼ = √ρ·z₀ + √(1 − ρ)·zⱼ
  // 같은 시드면 ρ를 바꿔도 같은 난수를 써서 그림이 매끄럽게 바뀜
  function draw(rng, rho, n, beta, sigma) {
    const p = beta.length, X = [], y = [];
    for (let i = 0; i < n; i++) {
      const z0 = rng.normal();
      const row = [];
      for (let j = 0; j < p; j++) row.push(Math.sqrt(rho) * z0 + Math.sqrt(1 - rho) * rng.normal());
      X.push(row);
      y.push(dot(row, beta) + sigma * rng.normal());
    }
    return { X, y };
  }

  // 학습 데이터 기준으로 표준화하고, 같은 변환을 다른 데이터(테스트)에도 적용
  function standardize(train, others) {
    const n = train.X.length, p = train.X[0].length;
    const mean = [], sd = [];
    for (let j = 0; j < p; j++) {
      const c = col(train.X, j);
      const m = c.reduce((s, v) => s + v, 0) / n;
      mean.push(m);
      sd.push(Math.sqrt(c.reduce((s, v) => s + (v - m) * (v - m), 0) / n));
    }
    const ybar = train.y.reduce((s, v) => s + v, 0) / n;
    const tf = (d) => ({ X: d.X.map((row) => row.map((v, j) => (v - mean[j]) / sd[j])), y: d.y.map((v) => v - ybar) });
    return { train: tf(train), others: others.map(tf), ybar, mean, sd };
  }

  function generate(seed, rho) {
    const rng = EduSim.rng(seed);
    const tr = draw(rng, rho, N, BETA, SIGMA);
    const te = draw(rng, rho, NTEST, BETA, SIGMA);
    const s = standardize(tr, [te]);
    const rng2 = EduSim.rng(seed + 100000); // 기하 그림용은 따로 (시드는 99999까지라 겹치지 않음)
    const g = standardize(draw(rng2, rho, N2, BETA2, SIGMA2), []);
    return { train: s.train, test: s.others[0], two: g.train };
  }

  /* ---------- 추정 ---------- */
  const gram = (X) => {
    const n = X.length, p = X[0].length;
    return Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((s, row) => s + row[a] * row[b], 0) / n));
  };
  const xty = (X, y) => X[0].map((_, j) => X.reduce((s, row, i) => s + row[j] * y[i], 0) / X.length);

  // Ridge 닫힌 해: (XᵀX/n + λI)β = Xᵀy/n
  function ridge(d, lam, G = gram(d.X), c = xty(d.X, d.y)) {
    return solve(G.map((row, i) => row.map((v, j) => v + (i === j ? lam : 0))), c);
  }

  // 최소제곱 (λ = 0)
  const ols = (d) => ridge(d, 0);

  const soft = (z, t) => (z > t ? z - t : z < -t ? z + t : 0);

  // Lasso: 좌표 하강법. 열이 표준화돼 있어 βⱼ ← S(βⱼ + xⱼᵀr/n, λ)
  function lasso(d, lam, start) {
    const { X, y } = d, n = X.length, p = X[0].length;
    const beta = start ? start.slice() : new Array(p).fill(0);
    const r = y.map((v, i) => v - dot(X[i], beta));
    for (let sweep = 0; sweep < 10000; sweep++) {
      let maxStep = 0;
      for (let j = 0; j < p; j++) {
        let g = 0;
        for (let i = 0; i < n; i++) g += X[i][j] * r[i];
        const nb = soft(beta[j] + g / n, lam);
        const step = nb - beta[j];
        if (step !== 0) {
          for (let i = 0; i < n; i++) r[i] -= X[i][j] * step;
          beta[j] = nb;
          maxStep = Math.max(maxStep, Math.abs(step));
        }
      }
      if (maxStep < 1e-13) break;
    }
    return beta;
  }

  // 모든 계수가 0이 되는 가장 작은 λ
  const lambdaMax = (d) => Math.max(...xty(d.X, d.y).map(Math.abs));

  const fitBeta = (d, method, lam, start) => (method === 'ridge' ? ridge(d, lam) : lasso(d, lam, start));

  const mse = (d, beta) => d.y.reduce((s, v, i) => s + (v - dot(d.X[i], beta)) ** 2, 0) / d.y.length;

  // λ 격자 전체의 계수와 오차. Lasso는 큰 λ부터 앞의 해에서 출발(warm start)
  function path(data, method) {
    const out = new Array(LOG_GRID.length);
    const G = gram(data.train.X), c = xty(data.train.X, data.train.y);
    let start = null;
    for (let k = LOG_GRID.length - 1; k >= 0; k--) {
      const lam = 10 ** LOG_GRID[k];
      const beta = method === 'ridge' ? ridge(data.train, lam, G, c) : (start = lasso(data.train, lam, start));
      out[k] = { loglam: LOG_GRID[k], beta, train: mse(data.train, beta), test: mse(data.test, beta) };
    }
    return out;
  }

  /* ---------- 두 변수 기하 그림 ---------- */
  // RSS의 등고선: (β − β̂)ᵀ G (β − β̂) = c  (G = XᵀX/n). 점 목록으로
  function ellipse(center, G, c, m = 120) {
    const [[a, b], [, d]] = G;
    const tr = a + d, det = a * d - b * b, s = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + s, l2 = tr / 2 - s;
    const v1 = Math.abs(b) > 1e-12 ? [b, l1 - a] : [1, 0];
    const nv = Math.hypot(v1[0], v1[1]);
    const u = [v1[0] / nv, v1[1] / nv], w = [-u[1], u[0]];
    const r1 = Math.sqrt(c / l1), r2 = Math.sqrt(c / l2);
    return Array.from({ length: m + 1 }, (_, k) => {
      const th = (2 * Math.PI * k) / m, p = r1 * Math.cos(th), q = r2 * Math.sin(th);
      return [center[0] + p * u[0] + q * w[0], center[1] + p * u[1] + q * w[1]];
    });
  }

  function geometry(two, method, lam) {
    const G = gram(two.X);
    const bols = ols(two);
    const sol = fitBeta(two, method, lam);
    const diff = [sol[0] - bols[0], sol[1] - bols[1]];
    const level = diff[0] * (G[0][0] * diff[0] + G[0][1] * diff[1]) + diff[1] * (G[1][0] * diff[0] + G[1][1] * diff[1]);
    const t = method === 'ridge' ? Math.hypot(sol[0], sol[1]) : Math.abs(sol[0]) + Math.abs(sol[1]);
    return { G, bols, sol, level, t };
  }

  return { BETA, SIGMA, N, LOG_GRID, solve, gram, xty, generate, standardize, ridge, ols, lasso, soft, lambdaMax, fitBeta, mse, path, ellipse, geometry };
})();
