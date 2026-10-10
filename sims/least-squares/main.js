// 최소제곱: 잔차·이상치·leverage — 화면 연결과 그래프. 계산은 model.js(LS)에 있습니다.
const $ = (id) => document.getElementById(id);

// 프리셋 버튼 (점 목록은 model.js에). create 전에 만들어야 문구가 채워짐
$('presets').innerHTML = [['clean', 'pClean'], ['outlier', 'pOutlier'], ['leverage', 'pLeverage'], ['influential', 'pInfluential']]
  .map(([k, t]) => `<button type="button" class="btn btn-sm" data-set='${JSON.stringify({ pts: LS.PRESETS[k] })}' data-t="${t}"></button>`)
  .join('');

let mode = 'drag'; // 끌기 · 추가 · 삭제 (URL에는 넣지 않음)
let sel = null; // 선택한 점 번호. null이면 Cook 거리가 가장 큰 점
let scatterView = null, diagView = null; // 마지막 그림의 점 위치(px)와 좌표 변환
let dragPts = null, grab = [0, 0];
document.querySelectorAll('input[name="ui-mode"]').forEach((el) => el.addEventListener('change', () => { mode = el.value; }));

// URL에 점 목록이 없으면 시드로 만든 데이터
const points = (s) => (s.pts ? LS.parse(s.pts) : LS.generate(s.seed));
const f2 = (v) => (Number.isFinite(v) ? EduSim.fmt(v, 2) : '—');
const f3 = (v) => (Number.isFinite(v) ? EduSim.fmt(v, 3) : '—');

function colors() {
  const css = EduSim.css;
  return {
    pt: css('--c1'), line: css('--c2'), cook: css('--c3'), sel: css('--c4'), ink: css('--ink'), ink2: css('--ink-2'),
    muted: css('--muted'), neutral: css('--c-neutral'), base: css('--line-strong'), surface: css('--surface'),
  };
}

function selectedIndex(f, n) {
  if (sel !== null && sel < n) return sel;
  if (!f.ok) return null;
  let best = null;
  f.cook.forEach((d, i) => { if (Number.isFinite(d) && (best === null || d > f.cook[best])) best = i; });
  return best;
}

function drawScatter(sim, s, pts, f, si, C) {
  const el = $('scatter');
  const rem = EduSim.rem();
  const W = Math.min(el.parentElement.clientWidth - 2, Math.round(rem * 34));
  el.style.width = W + 'px';
  el.style.margin = '0 auto';
  const ml = Math.round(rem * 2.2), mr = Math.round(rem * 0.9), mt = Math.round(rem * 0.9), mb = Math.round(rem * 2.4);
  const H = W - ml - mr + mt + mb; // 그림 영역을 정사각형으로 → 잔차 제곱이 정말 정사각형
  const k = rem / 16; // 글자 크게 보기에서는 점도 함께 키움
  const rows = pts.map(([x, y], i) => ({ i, x, y, yh: f.ok ? f.fitted[i] : NaN, e: f.ok ? f.resid[i] : NaN, h: f.ok ? f.h[i] : NaN, d: f.ok ? f.cook[i] : NaN }));
  const marks = [];
  if (f.ok) {
    marks.push(Plot.ruleX([f.xbar], { stroke: C.muted, strokeDasharray: '2 4' }));
    marks.push(Plot.text([f.xbar], { x: (d) => d, frameAnchor: 'top', dy: -mt + 2, lineAnchor: 'top', text: () => 'x̄', fill: C.ink2, fontStyle: 'italic' }));
    if (s.sq === 'on') {
      // 잔차를 한 변으로 하는 정사각형 (그림 밖으로 나가지 않는 쪽으로)
      marks.push(Plot.rect(rows, {
        x1: 'x', x2: (d) => d.x + (d.x + Math.abs(d.e) <= LS.HI ? 1 : -1) * Math.abs(d.e), y1: 'yh', y2: 'y',
        fill: C.line, fillOpacity: 0.13, stroke: C.line, strokeOpacity: 0.45, clip: true,
      }));
    }
    if (s.resid === 'on') marks.push(Plot.ruleX(rows, { x: 'x', y1: 'yh', y2: 'y', stroke: C.neutral, strokeWidth: 1.5 }));
    if (si !== null) {
      const loo = LS.fitWithout(pts, si);
      if (loo.ok) marks.push(Plot.line([[LS.LO, loo.b0], [LS.HI, loo.b0 + loo.b1 * LS.HI]], { stroke: C.ink2, strokeWidth: 1.75, strokeDasharray: '6 4', clip: true }));
    }
    marks.push(Plot.line([[LS.LO, f.b0], [LS.HI, f.b0 + f.b1 * LS.HI]], { stroke: C.line, strokeWidth: 2.5, clip: true }));
  }
  marks.push(Plot.dot(rows, { x: 'x', y: 'y', r: 6 * k, fill: C.pt, stroke: C.surface, strokeWidth: 2 }));
  if (si !== null) {
    marks.push(Plot.dot([rows[si]], { x: 'x', y: 'y', r: 8 * k, fill: C.sel, stroke: C.surface, strokeWidth: 2 }));
    marks.push(Plot.text([rows[si]], { x: 'x', y: 'y', text: (d) => '#' + (d.i + 1), dx: 12, textAnchor: 'start', fill: C.ink, fontWeight: 700, stroke: C.surface, strokeWidth: 3, paintOrder: 'stroke' }));
  }
  marks.push(Plot.tip(rows, Plot.pointer({
    x: 'x', y: 'y', maxRadius: 20,
    title: (d) => '#' + (d.i + 1) + '  (' + d.x + ', ' + d.y + ')\n' + sim.t('rowResid') + ' ' + f2(d.e) + '\n' + sim.t('rowLev') + ' ' + f3(d.h) + '\n' + sim.t('rowCook') + ' ' + f3(d.d),
  })));

  const plot = Plot.plot({
    width: W, height: H, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
    style: EduSim.plotStyle(),
    x: { domain: [LS.LO, LS.HI], ticks: 5, grid: true, label: 'x', labelAnchor: 'center', labelArrow: 'none' },
    y: { domain: [LS.LO, LS.HI], ticks: 5, grid: true, label: null },
    marks,
  });
  el.replaceChildren(plot);
  const sx = plot.scale('x'), sy = plot.scale('y');
  scatterView = { px: pts.map(([x, y]) => [sx.apply(x), sy.apply(y)]), invert: (px, py) => [sx.invert(px), sy.invert(py)] };
}

function drawDiag(sim, f, si, C) {
  const el = $('diag');
  if (!f.ok) { el.replaceChildren(); diagView = null; return; }
  const rem = EduSim.rem(), k = rem / 16;
  const rows = f.h.map((h, i) => ({ i, h, r: f.rstd[i], d: f.cook[i] })).filter((d) => Number.isFinite(d.r));
  const hmax = Math.min(1, Math.max(0.3, f.hCut * 1.4, ...rows.map((d) => d.h * 1.1)));
  const rmax = Math.max(3, ...rows.map((d) => Math.abs(d.r) * 1.15));
  // Cook 거리 등고선: r = ±√(D·p·(1 − h)/h)
  const contour = [];
  for (const D of [0.5, 1]) {
    for (const sign of [1, -1]) {
      for (let k = 1; k <= 120; k++) {
        const h = (hmax * k) / 120;
        contour.push({ D, sign, h, r: sign * Math.sqrt((D * LS.P * (1 - h)) / h) });
      }
    }
  }
  // 이름표는 겹치지 않게 D = 1은 위쪽, D = 0.5는 아래쪽 곡선 끝에
  const ends = [[1, 1], [0.5, -1]].map(([D, sign]) => ({ D, h: hmax, r: sign * Math.sqrt((D * LS.P * (1 - hmax)) / hmax) }))
    .filter((d) => Math.abs(d.r) < rmax && Math.abs(d.r) > 0.2);
  const plot = Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 14),
    marginLeft: Math.round(rem * 2.4), marginRight: Math.round(rem * 2.6), marginTop: Math.round(rem * 1.7), marginBottom: Math.round(rem * 2.4),
    style: EduSim.plotStyle(),
    x: { domain: [0, hmax], label: sim.t('axisLev'), labelAnchor: 'center', labelArrow: 'none' },
    y: { domain: [-rmax, rmax], grid: true, label: sim.t('axisRstd'), labelArrow: 'none' },
    marks: [
      Plot.ruleY([0], { stroke: C.base }),
      Plot.ruleY([-2, 2], { stroke: C.ink2, strokeDasharray: '1.5 3' }),
      Plot.ruleX([f.hCut], { stroke: C.ink2, strokeDasharray: '1.5 3' }),
      Plot.line(contour, { x: 'h', y: 'r', z: (d) => d.D + '/' + d.sign, stroke: C.cook, strokeDasharray: '5 4', strokeWidth: 1.5, clip: true }),
      Plot.text(ends, { x: 'h', y: 'r', text: (d) => 'D = ' + d.D, textAnchor: 'start', dx: 4, fill: C.ink2 }),
      Plot.dot(rows, { x: 'h', y: 'r', r: 5 * k, fill: C.pt, stroke: C.surface, strokeWidth: 1.5 }),
      si !== null && Number.isFinite(f.rstd[si]) ? Plot.dot([{ h: f.h[si], r: f.rstd[si] }], { x: 'h', y: 'r', r: 7 * k, fill: C.sel, stroke: C.surface, strokeWidth: 2 }) : null,
      Plot.tip(rows, Plot.pointer({ x: 'h', y: 'r', maxRadius: 20, title: (d) => '#' + (d.i + 1) + '\n' + sim.t('rowLev') + ' ' + f3(d.h) + '\n' + sim.t('rowRstd') + ' ' + f2(d.r) + '\n' + sim.t('rowCook') + ' ' + f3(d.d) })),
    ],
  });
  el.replaceChildren(plot);
  const sx = plot.scale('x'), sy = plot.scale('y');
  diagView = rows.map((d) => ({ i: d.i, x: sx.apply(d.h), y: sy.apply(d.r) }));
}

function drawSelection(sim, pts, f, si) {
  const t = sim.t;
  if (si === null || !f.ok) {
    $('sel-head').textContent = t('selNone');
    $('sel-body').innerHTML = '<p class="hint">' + t('selectHint') + '</p>';
    return;
  }
  const [x, y] = pts[si];
  $('sel-head').innerHTML = t('selHead', { i: si + 1 }) + ' <span class="xy">' + t('selXY', { x, y }) + '</span>';
  const warn = (bad) => (bad ? ' <span class="warn">⚠</span>' : '');
  const h = f.h[si], r = f.rstd[si], d = f.cook[si];
  const loo = LS.fitWithout(pts, si);
  $('sel-body').innerHTML =
    '<table>' +
    '<tr><td>' + t('rowResid') + '</td><td class="v">' + f2(f.resid[si]) + '</td><td class="cut"></td></tr>' +
    '<tr><td>' + t('rowLev') + '</td><td class="v">' + f3(h) + warn(h > f.hCut) + '</td><td class="cut">' + t('cutLev', { c: f3(f.hCut) }) + '</td></tr>' +
    '<tr><td>' + t('rowRstd') + '</td><td class="v">' + f2(r) + warn(Math.abs(r) > 2) + '</td><td class="cut">' + t('cutRstd') + '</td></tr>' +
    '<tr><td>' + t('rowCook') + '</td><td class="v">' + f3(d) + warn(d > 1) + '</td><td class="cut">' + t('cutCook') + '</td></tr>' +
    '</table>' +
    '<p class="loo">' + (loo.ok ? t('loo', { a: f2(f.b1), b: f2(loo.b1) }) : t('looNA')) + '</p>' +
    '<p class="hint">' + t('selectHint') + '</p>';
}

const sim = EduSim.create({
  text: TEXT,
  params: {
    pts: { str: true, default: LS.PRESETS.clean }, // 비우면 시드로 만든 데이터
    resid: { options: ['on', 'off'], default: 'on' },
    sq: { options: ['on', 'off'], default: 'off' },
  },
  render(s, sim) {
    const pts = points(s);
    const f = LS.fit(pts);
    const si = selectedIndex(f, pts.length);
    const C = colors();

    $('count').textContent = sim.t('modeHint', { n: pts.length });
    if (f.ok) {
      $('stat-line').textContent = 'ŷ = ' + f2(f.b0) + (f.b1 < 0 ? ' − ' : ' + ') + f2(Math.abs(f.b1)) + 'x';
      $('stat-r2').textContent = f3(f.r2);
      $('stat-sigma').textContent = f3(f.sigma);
    } else {
      $('stat-line').textContent = sim.t('degenerate');
      $('stat-r2').textContent = $('stat-sigma').textContent = '—';
    }
    $('stat-n').textContent = String(pts.length);

    drawScatter(sim, s, pts, f, si, C);
    drawDiag(sim, f, si, C);
    drawSelection(sim, pts, f, si);
  },
});

/* 다시 뽑기: 새 시드로 데이터를 만들고, URL의 점 목록은 비움 */
$('reroll').addEventListener('click', () => {
  sel = null;
  sim.set({ seed: EduSim.newSeed(sim.state.seed), pts: '' });
});
// 프리셋을 누르면 선택도 처음 상태로
$('presets').addEventListener('click', () => { sel = null; });

/* 산점도: 끌기 · 추가 · 삭제 */
EduSim.drag($('scatter'), {
  pick(px, py) {
    if (!scatterView) return null;
    const pts = points(sim.state);
    let best = -1, bestD = 22 * (EduSim.rem() / 16);
    scatterView.px.forEach(([x, y], i) => {
      const d = Math.hypot(px - x, py - y);
      if (d < bestD) { bestD = d; best = i; grab = [x - px, y - py]; }
    });
    if (mode === 'delete') {
      if (best >= 0 && pts.length > 3) {
        pts.splice(best, 1);
        sel = null;
        sim.set({ pts: LS.serialize(pts) });
      }
      return null;
    }
    if (mode === 'add') {
      if (pts.length >= 40) return null;
      const [x, y] = scatterView.invert(px, py);
      pts.push([LS.snap(x), LS.snap(y)]);
      best = pts.length - 1;
      grab = [0, 0];
      sim.set({ pts: LS.serialize(pts) });
    }
    if (best < 0) return null;
    sel = best;
    dragPts = pts;
    sim.render();
    return best;
  },
  move(i, px, py) {
    const [x, y] = scatterView.invert(px + grab[0], py + grab[1]);
    dragPts[i] = [LS.snap(x), LS.snap(y)];
    sim.set({ pts: LS.serialize(dragPts) });
  },
});

/* 진단 그림: 점을 누르면 선택 */
EduSim.drag($('diag'), {
  pick(px, py) {
    if (!diagView) return null;
    let best = null, bestD = 20;
    diagView.forEach((d) => { const dist = Math.hypot(px - d.x, py - d.y); if (dist < bestD) { bestD = dist; best = d.i; } });
    if (best !== null) { sel = best; sim.render(); }
    return null;
  },
  move() {},
});
