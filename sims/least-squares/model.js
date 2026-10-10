// 단순선형회귀(최소제곱)와 진단 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 점은 [[x, y], …]. 그림 범위는 0 ~ 10, 좌표는 0.1 단위. 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const LS = (function () {
  'use strict';

  const LO = 0, HI = 10;
  const P = 2; // 모수 개수 (절편, 기울기)

  const snap = (v) => Math.round(Math.min(HI, Math.max(LO, v)) * 10) / 10;

  // URL용 문자열 "x,y;x,y;…" ↔ 점 목록. 읽을 수 없는 조각은 버림
  function parse(str) {
    if (!str) return [];
    return str.split(';').map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([x, y]) => [snap(x), snap(y)]);
  }
  function serialize(pts) {
    return pts.map(([x, y]) => x + ',' + y).join(';');
  }

  // 최소제곱 직선과 진단값. 기울기를 정할 수 없으면(x가 모두 같음) ok = false
  //   잔차 e = y − ŷ,  σ̂² = Σe² / (n − 2)
  //   leverage h = 1/n + (x − x̄)² / Sxx        (hat 행렬의 대각 원소)
  //   표준화 잔차 r = e / (σ̂ √(1 − h))           (R의 rstandard)
  //   Cook 거리 D = r² h / (p (1 − h))           (R의 cooks.distance)
  function fit(pts) {
    const n = pts.length;
    if (n < 2) return { ok: false, n };
    let xbar = 0, ybar = 0;
    for (const [x, y] of pts) { xbar += x; ybar += y; }
    xbar /= n; ybar /= n;
    let sxx = 0, sxy = 0, syy = 0;
    for (const [x, y] of pts) {
      sxx += (x - xbar) * (x - xbar);
      sxy += (x - xbar) * (y - ybar);
      syy += (y - ybar) * (y - ybar);
    }
    if (sxx <= 1e-12) return { ok: false, n, xbar, ybar };
    const b1 = sxy / sxx, b0 = ybar - b1 * xbar;
    const fitted = pts.map(([x]) => b0 + b1 * x);
    const resid = pts.map(([, y], i) => y - fitted[i]);
    const rss = resid.reduce((s, e) => s + e * e, 0);
    const sigma = n > P ? Math.sqrt(rss / (n - P)) : NaN;
    const h = pts.map(([x]) => 1 / n + ((x - xbar) * (x - xbar)) / sxx);
    // h = 1이거나 σ̂ = 0이면 0/0 → NaN (R도 NaN)
    const rstd = resid.map((e, i) => e / (sigma * Math.sqrt(1 - h[i])));
    const cook = rstd.map((r, i) => (r * r * h[i]) / (P * (1 - h[i])));
    return {
      ok: true, n, b0, b1, xbar, ybar, sxx, fitted, resid, rss, sigma, h, rstd, cook,
      r2: syy > 0 ? 1 - rss / syy : NaN,
      hCut: (2 * P) / n, // leverage 기준 2p/n
    };
  }

  // i번째 점을 뺀 직선
  function fitWithout(pts, i) {
    return fit(pts.filter((_, j) => j !== i));
  }

  // 시드로 정해지는 연습용 데이터: y = b0 + b1 x + N(0, 0.8²), 점 12개
  function generate(seed, n = 12) {
    const rng = EduSim.rng(seed);
    const b0 = 0.5 + 2 * rng.uniform(), b1 = 0.4 + 0.4 * rng.uniform();
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = snap(0.5 + 9 * rng.uniform());
      pts.push([x, snap(Math.min(9.8, Math.max(0.2, b0 + b1 * x + 0.8 * rng.normal())))]);
    }
    return pts;
  }

  // 프리셋: 같은 바탕 데이터 10개 + 점 하나
  const BASE = '1,2.1;1.8,2.2;2.5,3.4;3.1,3.2;3.8,4.3;4.4,4.2;5.2,5.5;5.9,5.4;6.5,6.4;7.2,6.6';
  const PRESETS = {
    clean: BASE,
    outlier: BASE + ';4,8.5', // 가운데 x, 선에서 멀리: 잔차는 크지만 leverage는 작음
    leverage: BASE + ';9.8,8.9', // x가 멀지만 선 위: leverage는 크지만 잔차는 작음
    influential: BASE + ';9.8,2', // x가 멀고 선에서도 벗어남: Cook 거리가 큼
  };

  return { LO, HI, P, snap, parse, serialize, fit, fitWithout, generate, PRESETS };
})();
