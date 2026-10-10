// MCMC: 제안 폭과 체인의 움직임 — 화면 연결과 그림. 계산은 model.js(MC)에 있습니다.
const $ = (id) => document.getElementById(id);

const TAUS = [0.02, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5, 7, 10, 15, 20];
const SPEEDS = [5, 20, 100, 500, 2500]; // 초당 걸음 수
const CHAIN_COLOR = ['--c1', '--c2', '--c3', '--c4'];
const RECENT = 30; // 최근 걸음을 선으로 이어 그릴 개수
const SLOW = 20; // 이 속도 이하(또는 멈춤)에서는 이번 제안을 화살표로 보여 줌

/* ---------- 체인: 목표·ρ·τ·시드가 바뀔 때만 다시 계산 (재생 중에는 보여 줄 걸음 수 n만 바뀜) ---------- */
let noiseCache = { seed: null }, chainCache = { key: null };
function chains(s) {
  if (noiseCache.seed !== s.seed) noiseCache = { seed: s.seed, z: MC.noise(s.seed, 4) }; // 체인 1개여도 4개분을 뽑음 → 1개 ↔ 4개에서 체인 1이 같음
  const key = [s.target, s.target === 'norm' ? s.rho : '', s.tau, s.seed].join(' ');
  if (chainCache.key !== key) {
    const tg = s.target === 'norm' ? MC.normal(s.rho) : MC.bimodal();
    chainCache = { key, tg, list: noiseCache.z.map((z, c) => MC.run(tg, s.tau, MC.STARTS[tg.kind][c], z)) };
  }
  return { tg: chainCache.tg, list: chainCache.list.slice(0, Number(s.chains)), key: key + ' ' + s.chains };
}

// 수용률·ESS·R̂. 재생 중에는 0.25초에 한 번만 다시 계산 (체인 4개 × 5000걸음이면 ESS 한 번에 수 ms)
let statCache = { key: null, t: 0 };
function stats(s, ch, playing) {
  const now = performance.now();
  if (playing && statCache.key === ch.key && now - statCache.t < 250) return statCache.v;
  const n = s.n, from = MC.burnFrom(n), len = n + 1 - from, m = ch.list.length;
  const kept = ch.list.map((c) => Array.from(c.x.subarray(from, n + 1)));
  const v = {
    acc: n > 0 ? ch.list.reduce((t, c) => t + MC.acceptRate(c, n), 0) / m : NaN,
    ess: len >= 20 ? MC.essBasic(kept) : NaN,
    rhat: m > 1 && len >= 20 ? MC.splitRhat(kept) : NaN,
    draws: len * m,
  };
  statCache = { key: ch.key, t: now, v };
  return v;
}

function colors() {
  const css = EduSim.css;
  return {
    chain: CHAIN_COLOR.map(css), ink: css('--ink'), ink2: css('--ink-2'), neutral: css('--c-neutral'),
    base: css('--line-strong'), surface: css('--surface'), page: css('--page'),
  };
}

// 캔버스를 그림 크기에 맞추고(고해상도 화면은 픽셀을 더 촘촘히) 그림 영역 밖은 잘라 냄
function prepCanvas(cv, W, H, clip) {
  const dpr = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath(); ctx.rect(clip[0], clip[1], clip[2], clip[3]); ctx.clip();
  return ctx;
}

// 쌓아 그리는 캔버스: 체인·그림 크기가 바뀌거나 n이 줄면(되감기) 비우고 처음부터
function layerFor(L, key, W, H, n) {
  const dpr = window.devicePixelRatio || 1;
  if (L.key !== key + ' ' + dpr || n < L.n) {
    L.cv.width = Math.round(W * dpr); L.cv.height = Math.round(H * dpr);
    L.ctx = L.cv.getContext('2d');
    L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L.key = key + ' ' + dpr; L.n = -1;
  }
  return L;
}
const visited = { key: null, n: -1, cv: document.createElement('canvas') };
const traced = { key: null, n: -1, cv: document.createElement('canvas') };

/* ---------- 2D: 목표 등고선(Plot, 바뀔 때만) + 체인(캔버스, 매 프레임) ---------- */
let planeBg = { key: null };
function drawPlane(sim, s, C, ch) {
  const { tg, list } = ch, wrap = $('plane'), rem = EduSim.rem();
  const [bx, by] = tg.box;
  const ml = Math.round(rem * 2.2), mr = Math.round(rem * 0.8), mt = Math.round(rem * 1.5), mb = Math.round(rem * 2.3); // 위 여백: 축 이름 x₂가 눈금과 겹치지 않게
  const W = Math.min(EduSim.contentWidth(wrap.parentElement), Math.round(rem * (bx === by ? 30 : 40)));
  const iw = W - ml - mr, ih = Math.round((iw * by) / bx); // 가로세로 같은 축척 → 제안이 원 모양 그대로
  const H = ih + mt + mb;
  const key = [s.target, s.rho, W, rem, EduSim.lang].join(' ');
  if (planeBg.key !== key) {
    // 등고선: 봉우리 밀도의 e^(−r²/2)배 (r = 1, 2, 3 → 정규라면 마할라노비스 거리 1, 2, 3)
    const peak = tg.kind === 'norm' ? tg.density(0, 0) : tg.density(MC.A, 0);
    const plot = Plot.plot({
      width: W, height: H, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
      style: EduSim.plotStyle(),
      x: { domain: [-bx, bx], label: 'x₁', labelAnchor: 'center', labelArrow: 'none', ticks: 2 * bx / (bx > 4 ? 4 : 2) + 1 },
      y: { domain: [-by, by], label: 'x₂', labelArrow: 'none', ticks: 2 * by / 2 + 1 },
      marks: [
        Plot.frame({ stroke: C.base }),
        Plot.contour({
          x1: -bx, x2: bx, y1: -by, y2: by, value: tg.density,
          thresholds: [3, 2, 1].map((r) => peak * Math.exp((-r * r) / 2)),
          stroke: C.neutral, strokeOpacity: 0.55, fill: 'none',
        }),
      ],
    });
    wrap.querySelector('.bg').replaceChildren(plot);
    wrap.style.width = W + 'px';
    planeBg = { key, sx: plot.scale('x'), sy: plot.scale('y'), W, H, clip: [ml, mt, iw, ih] };
  }
  const { sx, sy } = planeBg;
  const X = (v) => sx.apply(v), Y = (v) => sy.apply(v);
  const n = s.n, k = rem / 16;
  // 지나온 자리: 따로 둔 캔버스에 쌓아 두고 새로 생긴 점만 더 그림 (점이 2만 개까지 늘어나도 프레임마다 가볍게)
  const layer = layerFor(visited, ch.key + ' ' + planeBg.key, planeBg.W, planeBg.H, n);
  if (n > layer.n) {
    const v = layer.ctx, d = 3 * k;
    v.save(); v.beginPath(); v.rect(...planeBg.clip); v.clip();
    v.globalAlpha = list.length > 1 ? 0.3 : 0.4;
    list.forEach((c, ci) => {
      v.fillStyle = C.chain[ci];
      for (let t = layer.n + 1; t <= n; t++) v.fillRect(X(c.x[t]) - d / 2, Y(c.y[t]) - d / 2, d, d);
    });
    v.restore();
    layer.n = n;
  }
  const ctx = prepCanvas(wrap.querySelector('canvas'), planeBg.W, planeBg.H, planeBg.clip);
  ctx.drawImage(layer.cv, 0, 0, planeBg.W, planeBg.H);
  const showProposal = n >= 1 && (!sim.isPlaying() || s.speed <= SLOW);
  list.forEach((c, ci) => {
    const col = C.chain[ci];
    // 최근 걸음
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = col; ctx.lineWidth = 1.3 * k;
    ctx.beginPath();
    for (let t = Math.max(0, n - RECENT); t <= n; t++) (t === Math.max(0, n - RECENT) ? ctx.moveTo : ctx.lineTo).call(ctx, X(c.x[t]), Y(c.y[t]));
    ctx.stroke();
    ctx.globalAlpha = 1;
    // 출발점 (마름모)
    const s0 = 5 * k, x0 = X(c.x[0]), y0 = Y(c.y[0]);
    ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.moveTo(x0, y0 - s0); ctx.lineTo(x0 + s0, y0); ctx.lineTo(x0, y0 + s0); ctx.lineTo(x0 - s0, y0); ctx.closePath(); ctx.stroke();
    // 이번 제안: 수용이면 실선 화살표, 기각이면 점선과 ×
    if (showProposal) {
      const ax = X(c.x[n - 1]), ay = Y(c.y[n - 1]), bxp = X(c.px[n - 1]), byp = Y(c.py[n - 1]);
      const ok = c.acc[n - 1] === 1;
      ctx.strokeStyle = ok ? C.ink : C.ink2; ctx.lineWidth = 1.6 * k;
      ctx.setLineDash(ok ? [] : [4 * k, 3 * k]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bxp, byp); ctx.stroke();
      ctx.setLineDash([]);
      const h = 6 * k;
      if (ok) {
        const a = Math.atan2(byp - ay, bxp - ax);
        ctx.fillStyle = C.ink;
        ctx.beginPath(); ctx.moveTo(bxp, byp);
        ctx.lineTo(bxp - h * Math.cos(a - 0.45), byp - h * Math.sin(a - 0.45));
        ctx.lineTo(bxp - h * Math.cos(a + 0.45), byp - h * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(bxp - h * 0.7, byp - h * 0.7); ctx.lineTo(bxp + h * 0.7, byp + h * 0.7);
        ctx.moveTo(bxp + h * 0.7, byp - h * 0.7); ctx.lineTo(bxp - h * 0.7, byp + h * 0.7); ctx.stroke();
      }
    }
    // 지금 위치
    ctx.fillStyle = col; ctx.strokeStyle = C.surface; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.arc(X(c.x[n]), Y(c.y[n]), 5 * k, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}

/* ---------- trace plot: 축(Plot, 눈금 범위가 바뀔 때만) + 번인 구간과 선(캔버스) ---------- */
const XMAX = [100, 200, 500, 1000, 2000, 5000]; // 가로축은 단계별로 넓힘 → 재생 중에 축을 매번 다시 그리지 않음
let traceBg = { key: null };
function drawTrace(sim, s, C, ch) {
  const { tg, list } = ch, wrap = $('trace'), rem = EduSim.rem();
  const W = EduSim.contentWidth(wrap.parentElement), H = Math.round(rem * 10);
  const ml = Math.round(rem * 2.4), mr = Math.round(rem * 0.9), mt = Math.round(rem * 1.5), mb = Math.round(rem * 2.3);
  const n = s.n, xmax = XMAX.find((v) => v >= n) || MC.N, from = MC.burnFrom(n), bx = tg.box[0];
  const key = [W, rem, xmax, bx, EduSim.lang].join(' ');
  if (traceBg.key !== key) {
    const plot = Plot.plot({
      width: W, height: H, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
      style: EduSim.plotStyle(),
      x: { domain: [0, xmax], label: sim.t('axisIter'), labelAnchor: 'center', labelArrow: 'none', ticks: W < rem * 24 ? 3 : 5 }, // 좁으면 "1,000"끼리 겹치지 않게
      y: { domain: [-bx, bx], label: 'x₁', labelArrow: 'none', ticks: 5, grid: true },
      marks: [Plot.ruleY([0], { stroke: C.base })],
    });
    wrap.querySelector('.bg').replaceChildren(plot);
    wrap.style.width = W + 'px';
    traceBg = { key, sx: plot.scale('x'), sy: plot.scale('y'), clip: [ml, mt, W - ml - mr, H - mt - mb] };
  }
  const { sx, sy, clip } = traceBg;
  // 선: 쌓아 그리는 캔버스에 새 구간만 이어 그림
  const layer = layerFor(traced, ch.key + ' ' + key, W, H, n);
  if (n > layer.n) {
    const v = layer.ctx, t0 = Math.max(0, layer.n);
    v.save(); v.beginPath(); v.rect(...clip); v.clip();
    v.lineWidth = 1.1 * (rem / 16); v.lineJoin = 'round';
    list.forEach((c, ci) => {
      v.strokeStyle = C.chain[ci];
      v.globalAlpha = list.length > 1 ? 0.8 : 1;
      v.beginPath();
      v.moveTo(sx.apply(t0), sy.apply(c.x[t0]));
      for (let t = t0 + 1; t <= n; t++) v.lineTo(sx.apply(t), sy.apply(c.x[t]));
      v.stroke();
    });
    v.restore();
    layer.n = n;
  }
  const ctx = prepCanvas(wrap.querySelector('canvas'), W, H, clip);
  if (from > 0) { // 번인 구간 (회색 띠와 이름)
    ctx.fillStyle = C.neutral; ctx.globalAlpha = 0.12;
    ctx.fillRect(sx.apply(0), clip[1], sx.apply(from) - sx.apply(0), clip[3]);
    ctx.globalAlpha = 1; ctx.fillStyle = C.ink2;
    ctx.font = Math.round(rem * 0.8) + 'px ' + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = 'top';
    ctx.fillText(sim.t('burn'), sx.apply(0) + 4, clip[1] + 4);
  }
  ctx.drawImage(layer.cv, 0, 0, W, H);
  ctx.restore();
}

/* ---------- 히스토그램 (번인 뺀 표본, 체인별로 쌓음) vs 목표의 주변분포 ---------- */
let histLast = { key: null, t: 0 };
function drawHist(sim, s, C, ch) {
  // 재생 중에는 0.1초에 한 번만 (히스토그램은 천천히 바뀜)
  const now = performance.now();
  if (sim.isPlaying() && histLast.key === ch.key && now - histLast.t < 100) return;
  histLast = { key: ch.key, t: now };
  const { tg, list } = ch, el = $('hist'), rem = EduSim.rem();
  const bx = tg.box[0], B = 48, w = (2 * bx) / B;
  const n = s.n, from = MC.burnFrom(n), total = (n + 1 - from) * list.length;
  const rows = [];
  list.forEach((c, ci) => {
    const cnt = new Array(B).fill(0);
    for (let t = from; t <= n; t++) {
      const b = Math.floor((c.x[t] + bx) / w);
      if (b >= 0 && b < B) cnt[b]++;
    }
    cnt.forEach((v, b) => { if (v) rows.push({ x1: -bx + b * w, x2: -bx + (b + 1) * w, y: v / (total * w), c: ci }); });
  });
  const curve = Array.from({ length: 201 }, (_, i) => { const x = -bx + (i * 2 * bx) / 200; return [x, tg.marg(x)]; });
  const peak = Math.max(...curve.map((d) => d[1]));
  const stacked = new Array(B).fill(0);
  rows.forEach((r) => { stacked[Math.round((r.x1 + bx) / w)] += r.y; });
  const ymax = Math.max(peak * 1.15, Math.max(...stacked) * 1.05);
  // 넓은 화면에서 2D 그림 옆에 놓일 때는 높이를 2D 그림에 맞춤 (카드 아래가 비지 않게)
  const beside = window.matchMedia('(min-width: 1040px)').matches && planeBg.H;
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: beside ? Math.max(Math.round(rem * 12), planeBg.H - Math.round(rem * 1.6)) : Math.round(rem * 12),
    marginLeft: Math.round(rem * 2.8), marginRight: Math.round(rem * 0.9), marginTop: Math.round(rem * 1.5), marginBottom: Math.round(rem * 2.3),
    style: EduSim.plotStyle(),
    x: { domain: [-bx, bx], label: 'x₁', labelAnchor: 'center', labelArrow: 'none', ticks: 5 },
    y: { domain: [0, ymax], label: sim.t('axisDensity'), labelArrow: 'none', ticks: 4, grid: true },
    marks: [
      Plot.rectY(rows, { x1: 'x1', x2: 'x2', y: 'y', fill: (d) => C.chain[d.c], fillOpacity: list.length > 1 ? 0.8 : 0.55, insetLeft: 0.5, insetRight: 0.5 }),
      Plot.ruleY([0], { stroke: C.base }),
      Plot.line(curve, { stroke: C.ink, strokeWidth: 2 }),
    ],
  }));
  $('hist-sw').style.background = list.length > 1
    ? 'linear-gradient(to right, ' + C.chain.map((col, i) => `${col} ${25 * i}% ${25 * (i + 1)}%`).join(', ') + ')'
    : C.chain[0];
  if (list.length === 1) $('hist-sw').style.opacity = 0.55; else $('hist-sw').style.opacity = 0.8;
}

const sim = EduSim.create({
  text: TEXT,
  params: {
    target: { options: ['norm', 'bimodal'], default: 'norm' },
    rho: { min: 0, max: 0.99, step: 0.01, default: 0.9 },
    tau: { values: TAUS, default: 1, format: (v) => String(v) },
    chains: { options: ['1', '4'], default: '1' },
    n: { min: 0, max: MC.N, step: 1, default: 500 },
    speed: { values: SPEEDS, default: 100, format: (v, sim) => sim.t('speedFmt', { v: EduSim.fmt(v) }) },
  },
  play: { param: 'n', speed: 'speed' },
  render(s, sim) {
    const norm = s.target === 'norm';
    $('ctrl-rho').hidden = !norm;
    $('presets-norm').hidden = !norm; $('presets-bimodal').hidden = norm;
    $('target-note').textContent = sim.t(norm ? 'noteNorm' : 'noteBimodal');
    $('stat-rhat-box').hidden = s.chains === '1';

    const ch = chains(s), C = colors();
    const st = stats(s, ch, sim.isPlaying());
    $('stat-n').innerHTML = EduSim.fmt(s.n) + ' <small>/ ' + EduSim.fmt(MC.N) + '</small>';
    $('stat-acc').textContent = EduSim.pct(st.acc, 1);
    $('stat-ess').innerHTML = Number.isFinite(st.ess)
      ? EduSim.fmt(st.ess, 0) + ' <small class="sub">' + sim.t('statEssOf', { m: EduSim.fmt(st.draws) }) + '</small>'
      : sim.t('tooShort');
    $('stat-rhat').textContent = Number.isFinite(st.rhat) ? EduSim.fmt(st.rhat, 2) : sim.t('tooShort');
    $('stat-rhat').classList.toggle('warn', Math.round(st.rhat * 100) / 100 > 1.01); // 보이는 값(소수 둘째 자리)으로 판단: 1.013은 "1.01"이라 경고 안 함

    drawPlane(sim, s, C, ch);
    drawTrace(sim, s, C, ch);
    drawHist(sim, s, C, ch);
  },
});
