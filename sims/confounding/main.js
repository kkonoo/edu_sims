// 교란변수와 배치효과 — 화면 연결과 그래프. 계산은 model.js(CF)에 있습니다.
const $ = (id) => document.getElementById(id);
const f2 = (v) => EduSim.fmt(v, 2);

function colors() {
  const css = EduSim.css;
  return {
    batch: [css('--c1'), css('--c2'), css('--c3')], none: css('--c-neutral'), naive: css('--c-neutral'), adj: css('--c4'),
    ink: css('--ink'), ink2: css('--ink-2'), muted: css('--muted'), base: css('--line-strong'), surface: css('--surface'),
  };
}

function drawForest(sim, a, beta, C) {
  const el = $('forest'), rem = EduSim.rem();
  const rows = [['naive', a.naive], ['adj', a.adj]].filter(([, r]) => r.ok).map(([k, r]) => ({ k, ...r }));
  const xs = [0, beta, ...rows.flatMap((r) => [r.lo, r.hi])];
  const lo = Math.min(...xs), hi = Math.max(...xs), pad = 0.12 * (hi - lo || 1);
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 6.5),
    marginLeft: Math.round(rem * 0.8), marginRight: Math.round(rem * 0.8), marginTop: Math.round(rem * 1.4), marginBottom: Math.round(rem * 2.2),
    style: EduSim.plotStyle(),
    x: { domain: [lo - pad, hi + pad], grid: true, label: sim.t('axisEst'), labelAnchor: 'center', labelArrow: 'none' },
    y: { domain: ['naive', 'adj'], axis: null, padding: 0.4 },
    marks: [
      Plot.ruleX([0], { stroke: C.base, strokeWidth: 1.5 }),
      Plot.ruleX([beta], { stroke: C.ink, strokeDasharray: '4 3', strokeWidth: 1.5 }),
      Plot.text([beta], { x: (d) => d, frameAnchor: 'top', dy: -Math.round(rem * 1.2), lineAnchor: 'top', text: () => sim.t('truth') + ' = ' + f2(beta), fill: C.ink, fontWeight: 600 }),
      Plot.ruleY(rows, { y: 'k', x1: 'lo', x2: 'hi', stroke: (d) => (d.k === 'adj' ? C.adj : C.naive), strokeWidth: 3 }),
      Plot.dot(rows, { x: 'est', y: 'k', r: 6, fill: (d) => (d.k === 'adj' ? C.adj : C.naive), stroke: C.surface, strokeWidth: 2 }),
    ],
    color: { type: 'identity' },
  }));
}

function forestRows(sim, a, cont, C) {
  const t = sim.t;
  const row = (k, r, label) => {
    const sw = '<span class="sw" style="background:' + (k === 'adj' ? C.adj : C.naive) + '"></span>';
    if (!r.ok) return '<div>' + sw + label + '</div><div class="v warn">' + t('cannot') + '</div>';
    const sig = r.lo > 0 || r.hi < 0;
    return '<div>' + sw + label + '</div><div class="v">' + f2(r.est) + ' [' + f2(r.lo) + ', ' + f2(r.hi) + ']' +
      '<span class="tag ' + (sig ? 'sig' : 'ns') + '">' + t(sig ? 'sig' : 'notSig') + '</span></div>';
  };
  $('forest-rows').innerHTML = row('naive', a.naive, t(cont ? 'naive' : 'naiveT')) + row('adj', a.adj, t(cont ? 'adj' : 'adjT'));
}

function drawScatter(sim, s, d, a, C) {
  const el = $('main'), rem = EduSim.rem();
  const show = s.batch === 'on';
  const pts = d.x.map((x, i) => ({ x, y: d.y[i], k: d.batch[i] }));
  const xmin = Math.min(...d.x), xmax = Math.max(...d.x);
  const marks = [
    Plot.dot(pts, { x: 'x', y: 'y', r: 4.5, fill: (p) => (show ? C.batch[p.k] : C.none), fillOpacity: 0.85, stroke: C.surface, strokeWidth: 1 }),
  ];
  if (a.naive.ok) {
    const [b0, b1] = a.naive.coef;
    marks.push(Plot.line([[xmin, b0 + b1 * xmin], [xmax, b0 + b1 * xmax]], { stroke: C.ink2, strokeWidth: 2.5, strokeDasharray: '7 5' }));
  }
  if (show && a.adj.ok) {
    // 배치 보정: 기울기는 같고 절편만 배치마다 다른 평행선
    const [c0, b1, ...dk] = a.adj.coef;
    for (let k = 0; k < d.K; k++) {
      const xk = d.x.filter((_, i) => d.batch[i] === k);
      const lo = Math.min(...xk) - 0.3, hi = Math.max(...xk) + 0.3, ck = c0 + (k > 0 ? dk[k - 1] : 0);
      marks.push(Plot.line([[lo, ck + b1 * lo], [hi, ck + b1 * hi]], { stroke: C.batch[k], strokeWidth: 2.5 }));
    }
  }
  marks.push(Plot.tip(pts, Plot.pointer({ x: 'x', y: 'y', title: (p) => (show ? sim.t('batchN', { k: p.k + 1 }) + '\n' : '') + 'x = ' + f2(p.x) + '\ny = ' + f2(p.y) })));
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 18),
    marginLeft: Math.round(rem * 2.4), marginTop: Math.round(rem * 1.2), marginBottom: Math.round(rem * 2.4),
    style: EduSim.plotStyle(),
    x: { nice: true, grid: true, label: 'x', labelAnchor: 'center', labelArrow: 'none' },
    y: { nice: true, grid: true, label: 'y', labelArrow: 'none' },
    marks,
  }));
}

function drawDots(sim, s, d, C) {
  const el = $('main'), rem = EduSim.rem();
  const show = s.batch === 'on';
  const pts = d.x.map((x, i) => ({ g: x, pos: x + (d.jit[i] - 0.5) * 0.36, y: d.y[i], k: d.batch[i] }));
  const mean = (arr) => arr.reduce((t, v) => t + v, 0) / arr.length;
  const groupMeans = [0, 1].map((g) => ({ g, m: mean(pts.filter((p) => p.g === g).map((p) => p.y)) }));
  const cellMeans = [];
  for (let k = 0; k < d.K; k++) {
    for (const g of [0, 1]) {
      const v = pts.filter((p) => p.g === g && p.k === k).map((p) => p.y);
      if (v.length) cellMeans.push({ g, k, m: mean(v) });
    }
  }
  const name = (g) => sim.t(g ? 'treated' : 'control');
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 17),
    marginLeft: Math.round(rem * 2.4), marginTop: Math.round(rem * 1.2), marginBottom: Math.round(rem * 2.2),
    style: EduSim.plotStyle(),
    x: { domain: [-0.55, 1.55], ticks: [0, 1], tickFormat: name, label: null },
    y: { nice: true, grid: true, label: 'y', labelArrow: 'none' },
    color: { type: 'identity' },
    marks: [
      Plot.dot(pts, { x: 'pos', y: 'y', r: 4.5, fill: (p) => (show ? C.batch[p.k] : C.none), fillOpacity: 0.85, stroke: C.surface, strokeWidth: 1 }),
      show ? Plot.ruleY(cellMeans, { y: 'm', x1: (c) => c.g - 0.22, x2: (c) => c.g + 0.22, stroke: (c) => C.batch[c.k], strokeWidth: 2.5, strokeDasharray: '5 3' }) : null,
      Plot.ruleY(groupMeans, { y: 'm', x1: (c) => c.g - 0.32, x2: (c) => c.g + 0.32, stroke: C.ink, strokeWidth: 3 }),
      Plot.line(groupMeans, { x: 'g', y: 'm', stroke: C.ink2, strokeWidth: 1.5, strokeDasharray: '2 3' }),
      Plot.tip(pts, Plot.pointer({ x: 'pos', y: 'y', title: (p) => name(p.g) + (show ? ' · ' + sim.t('batchN', { k: p.k + 1 }) : '') + '\ny = ' + f2(p.y) })),
    ],
  }));
}

function drawDesign(sim, s, d, C) {
  const t = sim.t, tab = CF.designTable(d);
  $('design').innerHTML = '<tr><th></th><th>' + t('control') + '</th><th>' + t('treated') + '</th></tr>' +
    tab.map((r, k) => '<tr><th><span class="sw" style="background:' + (s.batch === 'on' ? C.batch[k] : C.none) + '"></span>' + t('batchN', { k: k + 1 }) + '</th>' +
      r.map((n) => '<td class="' + (n === 0 ? 'zero' : '') + '">' + n + '</td>').join('') + '</tr>').join('');
}

function legend(sim, s, d, C) {
  const t = sim.t, show = s.batch === 'on';
  const key = (sw, label) => '<span class="key">' + sw + '<span>' + label + '</span></span>';
  const dot = (c) => '<span class="sw" style="background:' + c + '; border-radius: 50%"></span>';
  const ln = (c, dash) => '<span class="ln' + (dash ? ' dash' : '') + '" style="border-color:' + c + '"></span>';
  let html = show ? d.batch.filter((v, i, arr) => arr.indexOf(v) === i).map((k) => key(dot(C.batch[k]), t('batchN', { k: k + 1 }))).join('') : key(dot(C.none), t('allPoints'));
  if (d.mode === 'cont') {
    html += key(ln(C.ink2, true), t('legendNaive'));
    if (show) html += key(ln(C.batch[0]) + ln(C.batch[1]) + ln(C.batch[2]), t('legendAdj'));
  } else {
    html += key(ln(C.ink), t('legendGroupMean'));
    if (show) html += key(ln(C.batch[0], true) + ln(C.batch[1], true), t('legendCellMean'));
  }
  $('main-legend').innerHTML = html;
}

EduSim.create({
  text: TEXT,
  params: {
    mode: { options: ['cont', 'treat'], default: 'cont' },
    bc: { min: -1.5, max: 1.5, step: 0.1, default: 0.8 },
    gc: { min: -4, max: 4, step: 0.1, default: -3 },
    shift: { min: 0, max: 3, step: 0.1, default: 2 },
    bt: { min: -2, max: 2, step: 0.1, default: 0 },
    gt: { min: -3, max: 3, step: 0.1, default: 2 },
    frac: { min: 0.5, max: 1, step: 0.05, default: 0.8, format: (v) => Math.round(v * 100) + '%' },
    batch: { options: ['on', 'off'], default: 'on' },
  },
  render(s, sim) {
    const cont = s.mode === 'cont';
    const d = cont ? CF.makeCont(s.seed, s.bc, s.gc, s.shift) : CF.makeTreat(s.seed, s.bt, s.gt, s.frac);
    const a = CF.analyze(d);
    const C = colors();

    $('ctl-cont').hidden = !cont;
    $('ctl-treat').hidden = cont;
    $('design-wrap').hidden = cont;
    $('main-title').textContent = sim.t(cont ? 'scatterTitle' : 'dotTitle');

    drawForest(sim, a, cont ? s.bc : s.bt, C);
    forestRows(sim, a, cont, C);
    if (cont) drawScatter(sim, s, d, a, C);
    else { drawDots(sim, s, d, C); drawDesign(sim, s, d, C); }
    legend(sim, s, d, C);
  },
});
