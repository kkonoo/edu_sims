// MCMC(랜덤워크 Metropolis) — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const MC = (function () {
  'use strict';

  const N = 5000; // 체인 길이(걸음 수)
  const BURN = 0.1; // 앞 10%는 번인으로 버림

  /* ---------- 목표분포 (2차원) ----------
   * logp(x, y): 비정규화 로그밀도 (Metropolis는 비율만 쓰므로 정규화상수가 필요 없음)
   * density(x, y): 정규화한 밀도 (등고선·테스트용), marg(x): x₁의 주변밀도 (히스토그램에 겹침)
   * sample(rng): 목표에서 독립으로 하나 (테스트에서 "정답" 수용률을 잴 때) */
  const TAU2 = 2 * Math.PI;
  function normal(rho) {
    const q = 1 - rho * rho;
    return {
      kind: 'norm', rho, box: [4, 4], // 그림 범위: x₁ ∈ [−4, 4], x₂ ∈ [−4, 4]
      logp: (x, y) => -(x * x - 2 * rho * x * y + y * y) / (2 * q),
      density: (x, y) => Math.exp(-(x * x - 2 * rho * x * y + y * y) / (2 * q)) / (TAU2 * Math.sqrt(q)),
      marg: (x) => Math.exp(-x * x / 2) / Math.sqrt(TAU2),
      sample(rng) { const a = rng.normal(), b = rng.normal(); return [a, rho * a + Math.sqrt(q) * b]; },
    };
  }

  // 두 봉우리: (−A, 0)과 (A, 0)에 중심을 둔 N(·, I)을 반반 섞음. A = 4면 τ ≈ 0.5로는 5000걸음 동안 거의 못 건너감
  const A = 4;
  function bimodal() {
    const comp = (x, y, c) => Math.exp(-((x - c) ** 2 + y * y) / 2);
    return {
      kind: 'bimodal', A, box: [8, 4],
      // 두 항 중 큰 쪽을 밖으로 빼서 계산 (멀리서 출발해도 log(0)이 되지 않게)
      logp(x, y) {
        const a = -((x + A) ** 2 + y * y) / 2, b = -((x - A) ** 2 + y * y) / 2, m = Math.max(a, b);
        return m + Math.log(Math.exp(a - m) + Math.exp(b - m));
      },
      density: (x, y) => (comp(x, y, -A) + comp(x, y, A)) / (2 * TAU2),
      marg: (x) => (Math.exp(-((x + A) ** 2) / 2) + Math.exp(-((x - A) ** 2) / 2)) / (2 * Math.sqrt(TAU2)),
      sample(rng) { const c = rng.uniform() < 0.5 ? -A : A; return [c + rng.normal(), rng.normal()]; },
    };
  }

  // 출발점: 체인 1은 목표에서 멀리 (번인이 보이게), 체인 4개면 네 모서리에 흩어 놓음
  const STARTS = {
    norm: [[-3, 3], [3, -3], [-3, -3], [3, 3]],
    bimodal: [[-5.5, 3], [5.5, -3], [-5.5, -3], [5.5, 3]],
  };

  /* ---------- 난수: 시드마다 한 번 뽑아 두고 τ를 바꿔도 같은 수를 씀 ----------
   * 체인 c의 걸음 t: 제안 = 현재 + τ·(z1, z2),  수용 여부: log u < log π(제안) − log π(현재) */
  function noise(seed, chains) {
    const rng = EduSim.rng(seed);
    return Array.from({ length: chains }, () => {
      const z1 = new Float64Array(N), z2 = new Float64Array(N), lu = new Float64Array(N);
      for (let t = 0; t < N; t++) { z1[t] = rng.normal(); z2[t] = rng.normal(); lu[t] = Math.log(rng.uniform()); }
      return { z1, z2, lu };
    });
  }

  // 랜덤워크 Metropolis 한 체인. 상태 x[0..N], y[0..N] (x[0] = 출발점), 걸음 t의 제안 (px[t], py[t])와 수용 여부 acc[t]
  // 기각되면 현재 값을 한 번 더 기록 (머무는 것도 한 걸음)
  function run(target, tau, start, z) {
    const x = new Float64Array(N + 1), y = new Float64Array(N + 1);
    const px = new Float64Array(N), py = new Float64Array(N), acc = new Uint8Array(N);
    x[0] = start[0]; y[0] = start[1];
    let cx = start[0], cy = start[1], lp = target.logp(cx, cy);
    for (let t = 0; t < N; t++) {
      const nx = cx + tau * z.z1[t], ny = cy + tau * z.z2[t], lq = target.logp(nx, ny);
      px[t] = nx; py[t] = ny;
      if (z.lu[t] < lq - lp) { cx = nx; cy = ny; lp = lq; acc[t] = 1; }
      x[t + 1] = cx; y[t + 1] = cy;
    }
    return { x, y, px, py, acc };
  }

  // n걸음까지의 수용률
  function acceptRate(chain, n) {
    let s = 0;
    for (let t = 0; t < n; t++) s += chain.acc[t];
    return n > 0 ? s / n : NaN;
  }

  // n걸음까지의 상태(출발점 포함 n + 1개) 중 번인을 뺀 구간 [from, n]
  const burnFrom = (n) => Math.floor(BURN * (n + 1));

  /* ---------- 진단: 교재 베이즈 W6의 split_rhat, ess_basic과 같은 정의 ---------- */
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const variance = (a) => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1); };

  // 각 체인을 앞 절반·뒤 절반으로 쪼갬 (길이가 홀수면 가운데 하나를 버림)
  function split(chains) {
    const n0 = chains[0].length, h = Math.floor(n0 / 2);
    return chains.flatMap((c) => [c.slice(0, h), c.slice(n0 - h)]);
  }

  // var⁺ = (n − 1)/n · W + (체인 평균들의 분산)
  function varPlus(chains) {
    const n = chains[0].length, m = chains.length;
    const W = mean(chains.map(variance));
    return ((n - 1) / n) * W + (m > 1 ? variance(chains.map(mean)) : 0);
  }

  function splitRhat(chains) {
    const sp = split(chains), n = sp[0].length;
    const W = mean(sp.map(variance)), B = n * variance(sp.map(mean));
    return Math.sqrt((((n - 1) / n) * W + B / n) / W);
  }

  // 자기공분산 Σᵢ cᵢ cᵢ₊ₖ (k = 0 … n − 1)를 FFT로 한 번에: 길이 2n 이상으로 0을 채워 원형 겹침을 없앰
  function autocov(c) {
    const n = c.length;
    let L = 1;
    while (L < 2 * n) L *= 2;
    const re = new Float64Array(L), im = new Float64Array(L);
    re.set(c);
    fft(re, im, false);
    for (let i = 0; i < L; i++) { re[i] = re[i] * re[i] + im[i] * im[i]; im[i] = 0; }
    fft(re, im, true);
    return re.subarray(0, n).map((v) => v / L);
  }
  // 제자리 radix-2 FFT (inverse면 켤레 방향, 나누기는 호출한 쪽에서)
  function fft(re, im, inverse) {
    const L = re.length;
    for (let i = 1, j = 0; i < L; i++) {
      let bit = L >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= L; len *= 2) {
      const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < L; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }

  // ESS: split → 체인별 자기공분산(분모 n)의 평균 → ρₜ = 1 − (W − 공분산ₜ)/var⁺
  // → 시차 0부터 둘씩 묶은 짝 합의 초기 단조 수열(Geyer) → 첫 음수 직전까지 → τ̂ = −1 + 2Σ, ESS = mn / τ̂
  function essBasic(chains) {
    const sp = split(chains), m = sp.length, n = sp[0].length;
    if (n < 2) return NaN;
    const W = mean(sp.map(variance)), vp = varPlus(sp);
    if (!(vp > 0) || !Number.isFinite(vp)) return NaN;
    const acov = new Float64Array(n);
    for (const c of sp) {
      const mu = mean(c);
      autocov(c.map((v) => v - mu)).forEach((v, k) => { acov[k] += v / n / m; });
    }
    const rho = (k) => 1 - (W - acov[k]) / vp;
    const nPair = Math.floor(n / 2);
    let sum = 0, prev = Infinity;
    for (let p = 0; p < nPair; p++) {
      const pair = Math.min(prev, rho(2 * p) + rho(2 * p + 1));
      if (pair < 0) break;
      sum += pair; prev = pair;
    }
    const tau = -1 + 2 * sum;
    return (m * n) / Math.max(tau, 1 / Math.log10(m * n));
  }

  return { N, BURN, A, normal, bimodal, STARTS, noise, run, acceptRate, burnFrom, split, varPlus, splitRhat, autocov, essBasic };
})();
