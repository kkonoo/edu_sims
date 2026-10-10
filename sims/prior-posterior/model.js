// 베이즈 갱신 (Beta–Binomial) 계산 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const BB = (function () {
  'use strict';

  // log Γ(x), Lanczos 근사 (g = 7, 9항). x < 0.5는 반사 공식
  const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    let s = LANCZOS[0];
    for (let i = 1; i < 9; i++) s += LANCZOS[i] / (x + i);
    const t = x + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(s);
  }

  function lbeta(a, b) {
    return lgamma(a) + lgamma(b) - lgamma(a + b);
  }

  // Beta(a, b) 밀도
  function dbeta(x, a, b) {
    if (x < 0 || x > 1) return 0;
    if (x === 0) return a < 1 ? Infinity : a === 1 ? b : 0;
    if (x === 1) return b < 1 ? Infinity : b === 1 ? a : 0;
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log1p(-x) - lbeta(a, b));
  }

  // 정규화 불완전 베타함수의 연분수 (modified Lentz)
  function betacf(x, a, b) {
    const TINY = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - (qab * x) / qap;
    if (Math.abs(d) < TINY) d = TINY;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 1000; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
      c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      h *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
      c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }

  // Beta(a, b) 누적확률 P(X ≤ x)
  function pbeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(a * Math.log(x) + b * Math.log1p(-x) - lbeta(a, b));
    // 연분수가 빨리 수렴하는 쪽을 골라 계산
    if (x < (a + 1) / (a + b + 2)) return (front * betacf(x, a, b)) / a;
    return 1 - (front * betacf(1 - x, b, a)) / b;
  }

  // Beta(a, b) 분위수: pbeta(x) = p 인 x를 이분법으로 (100번 → 오차 2⁻¹⁰⁰)
  function qbeta(p, a, b) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (pbeta(mid, a, b) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // 사전 평균 m과 사전 강도 s(= a + b, 가상의 관측 수)로 Beta(a, b)
  function priorFromMeanStrength(m, s) {
    return { a: m * s, b: (1 - m) * s };
  }

  // 사전 Beta(a, b) + n번 중 k번 성공 → 사후 Beta(a + k, b + n − k)
  // 사후 평균 = w·사전 평균 + (1 − w)·표본 비율,  w = (a + b) / (a + b + n)
  function update(a, b, n, k) {
    const a1 = a + k, b1 = b + n - k;
    return {
      a: a1,
      b: b1,
      mean: a1 / (a1 + b1),
      lo: qbeta(0.025, a1, b1), // 등꼬리 95% 신용구간
      hi: qbeta(0.975, a1, b1),
      w: (a + b) / (a + b + n),
      priorMean: a / (a + b),
      sampleProp: n > 0 ? k / n : NaN,
    };
  }

  // 참 성공확률 θ로 n번 시행했을 때 성공 수. 같은 시드면 같은 관측열이라
  // n을 늘려도 앞쪽 관측은 그대로이고, θ를 올리면 성공 수가 줄지 않음
  function drawSuccesses(theta, n, seed) {
    const rng = EduSim.rng(seed);
    let k = 0;
    for (let i = 0; i < n; i++) if (rng.uniform() < theta) k++;
    return k;
  }

  return { lgamma, lbeta, dbeta, pbeta, qbeta, priorFromMeanStrength, update, drawSuccesses };
})();
