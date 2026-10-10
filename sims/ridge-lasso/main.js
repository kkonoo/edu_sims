// Ridge와 Lasso — 화면 연결과 그래프. 계산은 model.js(RL)에 있습니다.
const $ = (id) => document.getElementById(id);
const P = RL.BETA.length;
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const xname = (j) => 'x' + String(j + 1).split('').map((c) => SUB[c]).join('');
const lamText = (lg) => String(Number((10 ** lg).toPrecision(2))); // log10 λ → "0.1", "0.16"
const isZero = (v) => Math.abs(v) < 1e-10;

// 데이터와 λ 경로는 시드·ρ·방법이 바뀔 때만 다시 계산 (λ만 움직이면 재사용)
let cache = { key: null };
function getCache(s) {
  const key = s.seed + '|' + s.rho;
  if (cache.key !== key) cache = { key, data: RL.generate(s.seed, s.rho), paths: {} };
  if (!cache.paths[s.method]) cache.paths[s.method] = RL.path(cache.data, s.method);
  return cache;
}

function colors() {
  const css = EduSim.css;
  return {
    sig: [css('--c1'), css('--c2'), css('--c3')], noise: css('--c-neutral'), test: css('--c4'), sol: css('--c2'), region: css('--c3'),
    contour: css('--c4'), ink: css('--ink'), ink2: css('--ink-2'), muted: css('--muted'), base: css('--line-strong'), surface: css('--surface'),
  };
}
const colorOf = (C, j) => (j < 3 ? C.sig[j] : C.noise);

function lamAxis(sim) {
  return { domain: [RL.LOG_GRID[0], RL.LOG_GRID[RL.LOG_GRID.length - 1]], ticks: [-3, -2, -1, 0, 1, 2], tickFormat: lamText, label: sim.t('axisLam'), labelAnchor: 'center', labelArrow: 'none' };
}
function margins(rem) {
  return { marginLeft: Math.round(rem * 2.8), marginRight: Math.round(rem * 1), marginTop: Math.round(rem * 1.6), marginBottom: Math.round(rem * 2.6) };
}

function drawPath(sim, s, path, k, C) {
  const el = $('path'), rem = EduSim.rem();
  const rows = [];
  path.forEach((e) => e.beta.forEach((b, j) => rows.push({ lg: e.loglam, j, b })));
  const vals = rows.map((d) => d.b).concat(s.truth === 'on' ? RL.BETA : []);
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = 0.08 * (hi - lo);
  const now = path[k];
  const ord = (a, b) => (a.j < 3) - (b.j < 3); // 잡음 선을 먼저(아래에) 그림
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 16), ...margins(rem),
    style: EduSim.plotStyle(),
    color: { type: 'identity' },
    x: lamAxis(sim),
    y: { domain: [lo - pad, hi + pad], grid: true, label: sim.t('axisCoef'), labelArrow: 'none' },
    marks: [
      Plot.ruleY([0], { stroke: C.base }),
      s.truth === 'on' ? Plot.ruleY(RL.BETA.slice(0, 3).map((b, j) => ({ b, j })), { y: 'b', stroke: (d) => C.sig[d.j], strokeDasharray: '4 4', strokeOpacity: 0.7 }) : null,
      Plot.line(rows.sort(ord), { x: 'lg', y: 'b', z: 'j', stroke: (d) => colorOf(C, d.j), strokeWidth: (d) => (d.j < 3 ? 2.5 : 1.5) }),
      Plot.ruleX([s.loglam], { stroke: C.ink, strokeWidth: 1.5 }),
      Plot.dot(now.beta.map((b, j) => ({ b, j })).sort(ord), { x: () => s.loglam, y: 'b', r: 4, fill: (d) => colorOf(C, d.j), stroke: C.surface, strokeWidth: 1.5 }),
      Plot.text([0, 1, 2].map((j) => ({ j, b: path[0].beta[j] })), {
        x: () => RL.LOG_GRID[0], y: 'b', text: (d) => xname(d.j), dx: 6, textAnchor: 'start', dy: -9,
        fill: C.ink, fontWeight: 700, stroke: C.surface, strokeWidth: 3, paintOrder: 'stroke',
      }),
      Plot.text([sim.t('olsEnd')], { frameAnchor: 'top-left', dy: -Math.round(rem * 1.3), fill: C.muted }),
      Plot.ruleX(path, Plot.pointerX({ x: 'loglam', stroke: C.ink2, strokeOpacity: 0.35 })),
      Plot.tip(path, Plot.pointerX({
        x: 'loglam', y: (d) => d.beta[0],
        title: (d) => 'λ = ' + lamText(d.loglam) + '\n' + [0, 1, 2].map((j) => xname(j) + ' ' + d.beta[j].toFixed(2)).join('   ') + '\n' +
          sim.t('statNonzero') + ' ' + d.beta.filter((b) => !isZero(b)).length + '/' + P,
      })),
    ],
  }));
}

function drawErr(sim, s, path, k, best, C) {
  const el = $('err'), rem = EduSim.rem();
  // y축 위쪽은 OLS 테스트 오차의 2배까지만: 계수가 모두 0일 때의 큰 오차 때문에 U자 바닥이 납작해지지 않게
  const hi = Math.min(Math.max(...path.map((e) => Math.max(e.train, e.test))), 2 * path[0].test);
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 17), ...margins(rem),
    style: EduSim.plotStyle(),
    x: lamAxis(sim),
    y: { domain: [0, hi * 1.05], grid: true, label: sim.t('axisMse'), labelArrow: 'none' }, // 위로 넘치는 부분은 잘림(clip)
    marks: [
      Plot.ruleY([0], { stroke: C.base }),
      Plot.line(path, { x: 'loglam', y: 'train', stroke: C.noise, strokeWidth: 2, clip: true }),
      Plot.line(path, { x: 'loglam', y: 'test', stroke: C.test, strokeWidth: 2.5, clip: true }),
      Plot.ruleX([s.loglam], { stroke: C.ink, strokeWidth: 1.5 }),
      Plot.dot([best], { x: 'loglam', y: 'test', r: 5, fill: C.test, stroke: C.surface, strokeWidth: 2 }),
      Plot.text([best], { x: 'loglam', y: 'test', text: () => sim.t('bestLabel'), dy: 14, fill: C.ink2, fontWeight: 600 }),
      Plot.dot([path[k]], { x: 'loglam', y: 'test', r: 4, fill: C.ink, stroke: C.surface, strokeWidth: 1.5, clip: true }),
      Plot.ruleX(path, Plot.pointerX({ x: 'loglam', stroke: C.ink2, strokeOpacity: 0.35 })),
      Plot.tip(path, Plot.pointerX({
        x: 'loglam', y: 'test',
        title: (d) => 'λ = ' + lamText(d.loglam) + '\n' + sim.t('legendTrain') + ' ' + d.train.toFixed(2) + '\n' + sim.t('legendTest') + ' ' + d.test.toFixed(2),
      })),
    ],
  }));
}

function drawGeo(sim, s, two, C) {
  const el = $('geo'), rem = EduSim.rem();
  const lam = 10 ** s.loglam;
  const g = RL.geometry(two, s.method, lam);
  const M = Math.max(1, 1.3 * Math.max(Math.abs(g.bols[0]), Math.abs(g.bols[1])));
  const W = Math.min(EduSim.contentWidth(el.parentElement), Math.round(rem * 24));
  el.style.width = W + 'px';
  const ml = Math.round(rem * 2.2), mr = Math.round(rem * 0.8), mt = Math.round(rem * 1.4), mb = Math.round(rem * 2.4);
  // 제약 영역: 위·아래 경계를 x에 대한 함수로 (마름모: t − |x|, 원: √(t² − x²))
  const t = g.t, region = [];
  for (let i = 0; i <= 120; i++) {
    const x = -t + (2 * t * i) / 120;
    const h = s.method === 'lasso' ? t - Math.abs(x) : Math.sqrt(Math.max(0, t * t - x * x));
    region.push({ x, y1: -h, y2: h });
  }
  // 등고선: 모양을 보여 주는 흐린 것 몇 개 + 지금 해를 지나는 진한 것
  const eig = (g.G[0][0] + g.G[1][1]) / 2;
  const faint = [0.15, 0.4, 0.8].map((f) => RL.ellipse(g.bols, g.G, f * f * M * M * eig));
  const marks = [
    Plot.ruleX([0], { stroke: C.base }), Plot.ruleY([0], { stroke: C.base }),
    ...faint.map((e) => Plot.line(e, { stroke: C.contour, strokeOpacity: 0.3, clip: true })),
    t > 1e-9 ? Plot.areaY(region, { x: 'x', y1: 'y1', y2: 'y2', fill: C.region, fillOpacity: 0.22, stroke: C.region, strokeWidth: 1.5 }) : null,
    g.level > 1e-12 ? Plot.line(RL.ellipse(g.bols, g.G, g.level), { stroke: C.contour, strokeWidth: 2.25, clip: true }) : null,
    Plot.dot([g.bols], { x: (d) => d[0], y: (d) => d[1], r: 5, fill: C.surface, stroke: C.ink, strokeWidth: 2 }),
    Plot.text([g.bols], { x: (d) => d[0], y: (d) => d[1], text: () => 'OLS', dx: 8, textAnchor: 'start', fill: C.ink2, fontWeight: 600 }),
    Plot.dot([g.sol], { x: (d) => d[0], y: (d) => d[1], r: 6, fill: C.sol, stroke: C.surface, strokeWidth: 2 }),
    Plot.tip([g.sol], Plot.pointer({ x: (d) => d[0], y: (d) => d[1], title: (d) => 'β₁ = ' + d[0].toFixed(3) + '\nβ₂ = ' + d[1].toFixed(3) })),
  ];
  el.replaceChildren(Plot.plot({
    width: W, height: W - ml - mr + mt + mb, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
    style: EduSim.plotStyle(),
    x: { domain: [-M, M], grid: true, label: sim.t('axisB1'), labelAnchor: 'center', labelArrow: 'none' },
    y: { domain: [-M, M], grid: true, label: sim.t('axisB2'), labelArrow: 'none' },
    marks,
  }));
  $('legend-region').textContent = sim.t(s.method === 'lasso' ? 'legendRegionL1' : 'legendRegionL2');
}

// 설명 속 그림: 지금 λ에 해당하는 사전분포 (설명을 펼쳤을 때만)
function drawPrior(sim, s, C) {
  const el = $('prior');
  if (!$('explain').open || el.clientWidth < 50) return;
  const rem = EduSim.rem(), lam = 10 ** s.loglam;
  const scale = (RL.SIGMA * RL.SIGMA) / (RL.N * lam); // τ² (Ridge) = b (Lasso) = σ²/(nλ)
  const tau = Math.sqrt(scale), b = scale;
  const R = Math.max(1, Math.min(4, 4 * Math.max(tau, b)));
  const rows = Array.from({ length: 241 }, (_, i) => {
    const x = -R + (2 * R * i) / 240;
    return { x, ridge: Math.exp((-x * x) / (2 * tau * tau)) / (tau * Math.sqrt(2 * Math.PI)), lasso: Math.exp(-Math.abs(x) / b) / (2 * b) };
  });
  const on = (m) => (s.method === m ? { strokeWidth: 2.5, strokeOpacity: 1 } : { strokeWidth: 1.5, strokeOpacity: 0.45 });
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 10), ...margins(rem),
    style: EduSim.plotStyle(),
    x: { domain: [-R, R], label: sim.t('axisPrior'), labelAnchor: 'center', labelArrow: 'none' },
    y: { grid: true, label: null },
    marks: [
      Plot.ruleY([0], { stroke: C.base }),
      Plot.line(rows, { x: 'x', y: 'ridge', stroke: C.sig[0], ...on('ridge') }),
      Plot.line(rows, { x: 'x', y: 'lasso', stroke: C.sig[1], ...on('lasso') }),
      // 선 이름 (오른쪽 위에 두 줄, 색 점 대신 글자 앞의 ━ 기호로 색을 이음)
      Plot.text(['━ ' + sim.t('priorRidge') + ', τ = ' + tau.toPrecision(2)], { frameAnchor: 'top-right', fill: C.sig[0], fontWeight: s.method === 'ridge' ? 700 : 400 }),
      Plot.text(['━ ' + sim.t('priorLasso') + ' = ' + b.toPrecision(2)], { frameAnchor: 'top-right', dy: Math.round(rem * 1.1), fill: C.sig[1], fontWeight: s.method === 'lasso' ? 700 : 400 }),
    ],
  }));
}

function drawCoefs(sim, s, beta, C) {
  const t = sim.t;
  const row = (j) => {
    const z = isZero(beta[j]);
    return '<tr class="' + (z ? 'zero' : '') + '"><td><span class="sw" style="background:' + colorOf(C, j) + '"></span>' + xname(j) + '</td>' +
      '<td class="v">' + (z ? '0' : beta[j].toFixed(2)) + '</td>' +
      '<td class="t">' + (s.truth === 'on' ? t('truthOf', { v: RL.BETA[j] }) : '') + '</td></tr>';
  };
  $('coefs').innerHTML = Array.from({ length: P }, (_, j) => row(j)).join('');
}

const sim = EduSim.create({
  text: TEXT,
  params: {
    method: { options: ['ridge', 'lasso'], default: 'lasso' },
    loglam: { min: -3, max: 2, step: 0.05, default: -1, format: (v) => lamText(v) },
    rho: { min: 0, max: 0.9, step: 0.05, default: 0.3 },
    truth: { options: ['on', 'off'], default: 'on' },
  },
  render(s, sim) {
    const c = getCache(s);
    const path = c.paths[s.method];
    const k = Math.round((s.loglam - RL.LOG_GRID[0]) / 0.05); // 슬라이더 눈금 = 경로 격자
    const now = path[k];
    const best = path.reduce((a, b) => (b.test < a.test ? b : a));
    const C = colors();

    $('stat-nz').textContent = now.beta.filter((b) => !isZero(b)).length + ' / ' + P;
    $('stat-test').textContent = now.test.toFixed(2);
    $('stat-best').textContent = '≈ ' + lamText(best.loglam);
    $('legend-truth').hidden = s.truth !== 'on';

    drawCoefs(sim, s, now.beta, C);
    drawPath(sim, s, path, k, C);
    drawErr(sim, s, path, k, best, C);
    drawGeo(sim, s, c.data.two, C);
    drawPrior(sim, s, C);
  },
});
$('explain').addEventListener('toggle', () => sim.render());
