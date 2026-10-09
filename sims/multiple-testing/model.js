// 다중검정 계산 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const MT = (function () {
  'use strict';

  // 상보오차함수 erfc(x). 아주 작은 꼬리확률도 상대오차 1e-13 이하 (Python math.erfc와 비교해 최대 4e-14).
  //  x < 2   : erf 급수 (모든 항이 양수라 상쇄 오차 없음)  erf(x) = 2/√π·e^(−x²)·Σ (2x²)ⁿ·x / (1·3·…·(2n+1))
  //  x ≥ 2   : 연분수 (modified Lentz)                      erfc(x) = e^(−x²)/√π · 1/(x + ½/(x + 1/(x + (3/2)/(x + …))))
  function erfc(x) {
    if (x < 0) return 2 - erfc(-x);
    if (x < 2) {
      const x2 = 2 * x * x;
      let term = x, sum = x;
      for (let n = 1; term > 1e-17 * sum; n++) {
        term *= x2 / (2 * n + 1);
        sum += term;
      }
      return 1 - (2 / Math.sqrt(Math.PI)) * Math.exp(-x * x) * sum;
    }
    let f = x, C = x, D = 0;
    for (let n = 1; n < 500; n++) {
      const a = n / 2;
      D = 1 / (x + a * D);
      C = x + a / C;
      const delta = C * D;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-16) break;
    }
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
  }

  // 양측 p값: p = 2·(1 − Φ(|z|)) = erfc(|z|/√2)
  function pTwoSided(z) {
    return erfc(Math.abs(z) / Math.SQRT2);
  }

  // 시드와 m에만 의존하는 밑바탕 난수. 슬라이더(π1, 효과 크기)를 움직여도 같은 잡음을 재사용해
  // 점들이 매번 새로 흔들리지 않고 "효과만" 바뀌게 함.
  let cache = null;
  function baseDraws(m, seed) {
    if (cache && cache.m === m && cache.seed === seed) return cache;
    const rng = EduSim.rng(seed);
    const noise = new Float64Array(m);
    const u = new Float64Array(m);
    for (let i = 0; i < m; i++) {
      noise[i] = rng.normal();
      u[i] = rng.uniform();
    }
    // u가 작은 순서. π1을 올리면 이 순서대로 하나씩 "효과 있음"이 됨
    const order = Array.from({ length: m }, (_, i) => i).sort((a, b) => u[a] - u[b]);
    cache = { m, seed, noise, order };
    return cache;
  }

  // 귀무: z ~ N(0,1), 대립: z ~ N(effect,1). 대립 개수는 정확히 m1 = round(π1·m)
  function simulate(m, pi1, effect, seed) {
    const base = baseDraws(m, seed);
    const m1 = Math.round(pi1 * m);
    const isAlt = new Uint8Array(m);
    for (let j = 0; j < m1; j++) isAlt[base.order[j]] = 1;
    const z = new Float64Array(m);
    const p = new Float64Array(m);
    for (let i = 0; i < m; i++) {
      z[i] = base.noise[i] + (isAlt[i] ? effect : 0);
      p[i] = pTwoSided(z[i]);
    }
    return { m, m1, z, p, isAlt };
  }

  // p값이 작은 순서의 인덱스
  function ascending(p) {
    return Array.from({ length: p.length }, (_, i) => i).sort((a, b) => p[a] - p[b]);
  }

  // 보정 없음: p ≤ α
  function rejectNone(p, alpha) {
    return p.map((x) => (x <= alpha ? 1 : 0));
  }

  // Bonferroni: p ≤ α/m
  function rejectBonferroni(p, alpha) {
    const cut = alpha / p.length;
    return p.map((x) => (x <= cut ? 1 : 0));
  }

  // Benjamini–Hochberg 단계 상향 절차: p(i) ≤ i/m·q 인 가장 큰 i = k, 작은 쪽 k개 기각
  // o: 이미 구해 둔 ascending(p)가 있으면 넘겨서 정렬을 한 번 줄임
  function rejectBH(p, q, o = ascending(p)) {
    const m = p.length;
    let k = 0;
    for (let i = m; i >= 1; i--) {
      if (p[o[i - 1]] <= (i / m) * q) { k = i; break; }
    }
    const reject = new Uint8Array(m);
    for (let i = 0; i < k; i++) reject[o[i]] = 1;
    return { reject, k };
  }

  // R의 p.adjust(p, method = "BH")를 그대로 옮김:
  //   i <- lp:1L; o <- order(p, decreasing = TRUE); ro <- order(o)
  //   pmin(1, cummin(n / i * p[o]))[ro]
  function adjustBH(p) {
    const n = p.length;
    const o = ascending(p).reverse(); // 큰 순서
    const out = new Float64Array(n);
    let run = Infinity;
    for (let j = 0; j < n; j++) {
      const i = n - j; // 순위 (큰 쪽부터 n, n−1, …, 1)
      run = Math.min(run, (n / i) * p[o[j]]);
      out[o[j]] = Math.min(1, run);
    }
    return out;
  }

  function decide(p, method, alpha, order) {
    if (method === 'bonf') return rejectBonferroni(p, alpha);
    if (method === 'bh') return rejectBH(p, alpha, order).reject;
    return rejectNone(p, alpha);
  }

  // 2×2 표와 요약 지표. 관찰 FDR(FDP)은 R = 0이면 0으로 정의 (BH 논문의 관례)
  function confusion(isAlt, reject) {
    let TP = 0, FP = 0, FN = 0, TN = 0;
    for (let i = 0; i < isAlt.length; i++) {
      if (isAlt[i]) reject[i] ? TP++ : FN++;
      else reject[i] ? FP++ : TN++;
    }
    const R = TP + FP, m1 = TP + FN;
    return {
      TP, FP, FN, TN, R, m0: FP + TN, m1, m: isAlt.length,
      fdp: R > 0 ? FP / R : 0,
      power: m1 > 0 ? TP / m1 : NaN,
    };
  }

  return { erfc, pTwoSided, simulate, ascending, rejectNone, rejectBonferroni, rejectBH, adjustBH, decide, confusion };
})();
