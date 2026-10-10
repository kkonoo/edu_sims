// 네트워크 null model — 화면 연결과 그림. 계산은 model.js(NN)에 있습니다.
const $ = (id) => document.getElementById(id);

const SPEEDS = [5, 20, 100, 500]; // 초당 null 네트워크 수
const OBS = NN.metrics(NN.EDGES);
const DEG = NN.degrees(NN.EDGES); // null도 차수가 같음
const edgeKey = ([u, v]) => (u < v ? u * 1000 + v : v * 1000 + u);
const ORIGINAL = new Set(NN.EDGES.map(edgeKey));

/* ---------- null 1,000개의 지표: 재배선 횟수·시드가 바뀔 때만 다시 계산 (n은 앞에서부터 몇 개를 쓸지) ---------- */
let cache = { key: null };
function nulls(s) {
  const key = s.seed + ' ' + s.swaps;
  if (cache.key !== key) {
    const attempts = NN.attemptsFor(s.swaps), r = NN.nullMetrics(s.seed, attempts);
    // 히스토그램 가로축은 null 1,000개 전체와 관측값을 덮도록 고정 → 재생 중에 축이 흔들리지 않음
    const dom = (vals, obs, minPad) => {
      let lo = obs, hi = obs;
      for (const v of vals) { if (v < lo) lo = v; if (v > hi) hi = v; }
      const pad = Math.max((hi - lo) * 0.06, minPad);
      return [lo - pad, hi + pad];
    };
    cache = { key, attempts, r, domC: dom(r.avgC, OBS.avgC, 0.03), domT: dom(r.tri, OBS.tri, 2), rate: attempts > 0 ? r.success / (NN.NMAX * attempts) : NaN };
  }
  return cache;
}

function colors() {
  const css = EduSim.css;
  return {
    club: [css('--c1'), css('--c2')], nul: css('--c4'), ink: css('--ink'), ink2: css('--ink-2'),
    old: css('--line-strong'), base: css('--line-strong'), surface: css('--surface'),
  };
}

/* ---------- 네트워크 그림 (SVG). 노드 위치는 model.js에 고정, 크기 = 차수 ---------- */
const BOX = (() => { const xs = NN.POS.map((p) => p[0]), ys = NN.POS.map((p) => p[1]); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; })();
function netSize(el) {
  const rem = EduSim.rem(), k = rem / 16;
  const W = Math.max(220, Math.round(el.clientWidth)), pad = Math.round(10 * k + 2);
  const sc = (W - 2 * pad) / (BOX[1] - BOX[0]);
  return { W, H: Math.round((BOX[3] - BOX[2]) * sc + 2 * pad), pad, sc, k };
}
function drawNet(sim, el, edges, local, C) {
  const { W, H, pad, sc, k } = netSize(el);
  const X = (x) => (pad + (x - BOX[0]) * sc).toFixed(1), Y = (y) => (pad + (y - BOX[2]) * sc).toFixed(1);
  const line = (e, col, w) => `<line x1="${X(NN.POS[e[0]][0])}" y1="${Y(NN.POS[e[0]][1])}" x2="${X(NN.POS[e[1]][0])}" y2="${Y(NN.POS[e[1]][1])}" stroke="${col}" stroke-width="${w}"/>`;
  const isOld = (e) => ORIGINAL.has(edgeKey(e));
  const out = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`];
  // 원래 있던 엣지를 먼저(연하게), 재배선으로 생긴 엣지를 위에(진하게)
  edges.filter(isOld).forEach((e) => out.push(line(e, C.old, (1.2 * k).toFixed(2))));
  edges.filter((e) => !isOld(e)).forEach((e) => out.push(line(e, C.ink2, (1.4 * k).toFixed(2))));
  NN.POS.forEach(([x, y], i) => {
    const r = (2.4 + 1.25 * Math.sqrt(DEG[i])) * k;
    out.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="${r.toFixed(1)}" fill="${C.club[NN.CLUB[i]]}" stroke="${C.surface}" stroke-width="${(1.5 * k).toFixed(2)}">` +
      `<title>${sim.t('nodeTip', { i, k: DEG[i], c: EduSim.fmt(local[i], 2) })}</title></circle>`);
  });
  out.push('</svg>');
  el.innerHTML = out.join('');
}

/* ---------- null 분포 히스토그램 (처음 n개) + 관측값 ---------- */
function drawHist(sim, el, values, n, obs, dom, integer, C) {
  const rem = EduSim.rem();
  const vals = Array.from(values.subarray(0, n));
  // 칸은 가로축 전체에 고정: 정수(삼각형)는 정수마다 한 칸, 연속(C)은 30칸
  let thresholds;
  if (integer) {
    thresholds = [];
    for (let v = Math.floor(dom[0]) + 0.5; v <= dom[1]; v += 1) thresholds.push(v);
  } else {
    const w = (dom[1] - dom[0]) / 30;
    thresholds = Array.from({ length: 31 }, (_, i) => dom[0] + i * w);
  }
  const right = (obs - dom[0]) / (dom[1] - dom[0]) > 0.6; // 관측값이 오른쪽에 있으면 이름표를 왼쪽에
  const label = sim.t('obsLabel', { v: integer ? String(obs) : EduSim.fmt(obs, 3) });
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 11),
    marginLeft: Math.round(rem * 2.6), marginRight: Math.round(rem * 0.9), marginTop: Math.round(rem * 1.6), marginBottom: Math.round(rem * 1.8),
    style: EduSim.plotStyle(),
    x: { domain: dom, label: null, ticks: 5 },
    y: { label: sim.t('axisCount'), labelArrow: 'none', grid: true, ticks: 4 },
    marks: [
      Plot.rectY(vals, Plot.binX({ y: 'count' }, { x: (d) => d, thresholds, fill: C.nul, fillOpacity: 0.65, insetLeft: 0.5, insetRight: 0.5 })),
      Plot.ruleY([0], { stroke: C.base }),
      Plot.ruleX([obs], { stroke: C.ink, strokeWidth: 2.5 }),
      Plot.text([obs], { x: (d) => d, frameAnchor: 'top', dy: 2, lineAnchor: 'top', dx: right ? -5 : 5, textAnchor: right ? 'end' : 'start', text: () => label, fill: C.ink, fontWeight: 650, stroke: C.surface, strokeWidth: 3, paintOrder: 'stroke' }),
    ],
  }));
}

/* ---------- 표: 관측 · null 평균 ± 표준편차 · Z · p ---------- */
function row(sim, prefix, sum, obs, digits) {
  $(prefix + '-obs').textContent = digits ? EduSim.fmt(obs, digits) : String(obs);
  $(prefix + '-null').textContent = sum.n > 0 ? EduSim.fmt(sum.mean, digits || 1) + (sum.n > 1 ? ' ± ' + EduSim.fmt(sum.sd, digits || 1) : '') : '—';
  $(prefix + '-z').textContent = Number.isFinite(sum.z) ? EduSim.fmt(sum.z, 2) : '—';
  $(prefix + '-p').textContent = sum.n === 0 ? '—' : sum.ge === 0 ? sim.t('pLe', { v: EduSim.fmt(sum.n + 1) }) : EduSim.fmt(sum.p, 3);
  $(prefix + '-z').classList.toggle('sig', sum.n > 0 && sum.p < 0.05);
}

let histLast = { key: null, t: 0 };
const sim = EduSim.create({
  text: TEXT,
  params: {
    swaps: { values: NN.SWAPS, default: 10, format: (v, sim) => sim.t('swapsFmt', { k: EduSim.fmt(v, v === 0 || v >= 1 ? 0 : v < 0.1 ? 2 : 1), a: EduSim.fmt(NN.attemptsFor(v)) }) },
    n: { min: 0, max: NN.NMAX, step: 1, default: NN.NMAX },
    speed: { values: SPEEDS, default: 100, format: (v, sim) => sim.t('speedFmt', { v: EduSim.fmt(v) }) },
  },
  play: { param: 'n', speed: 'speed' },
  render(s, sim) {
    const c = nulls(s), C = colors(), n = s.n;
    const sumC = NN.summary(c.r.avgC, n, OBS.avgC), sumT = NN.summary(c.r.tri, n, OBS.tri);
    document.querySelectorAll('td[data-col]').forEach((td) => { td.dataset.label = sim.t(td.dataset.col); }); // 좁은 화면에서 값 위에 붙는 이름표
    row(sim, 'c', sumC, OBS.avgC, 3);
    row(sim, 't', sumT, OBS.tri, 0);
    $('table-note').textContent = n === 0 ? sim.t('tableNoteNone')
      : sim.t('tableNote', { n: EduSim.fmt(n), r: Number.isFinite(c.rate) ? EduSim.pct(c.rate, 0) : '—' });

    // 네트워크: 관측과 n번째 null (같은 시드·같은 번호면 재배선 횟수만 늘려도 같은 null이 더 섞임)
    $('obs-sub').textContent = sim.t('panelStats', { t: OBS.tri, c: EduSim.fmt(OBS.avgC, 3) });
    drawNet(sim, $('net-obs'), NN.EDGES, OBS.local, C);
    if (n > 0) {
      const g = NN.nullGraph(s.seed, n - 1, c.attempts), mt = NN.metrics(g.edges);
      $('null-head').textContent = sim.t('panelNull', { i: EduSim.fmt(n) });
      $('null-sub').textContent = sim.t('panelStats', { t: mt.tri, c: EduSim.fmt(mt.avgC, 3) });
      drawNet(sim, $('net-null'), g.edges, mt.local, C);
    } else {
      const el = $('net-null'), { H } = netSize(el);
      $('null-head').textContent = sim.t('panelNullNone');
      $('null-sub').textContent = ' ';
      el.innerHTML = `<div class="empty" style="height:${H}px">${sim.t('tableNoteNone')}</div>`;
    }

    // 히스토그램은 재생 중에 0.1초에 한 번만 (표와 네트워크는 매 프레임)
    const now = performance.now();
    if (!sim.isPlaying() || histLast.key !== c.key || now - histLast.t >= 100) {
      histLast = { key: c.key, t: now };
      drawHist(sim, $('hist-c'), c.r.avgC, n, OBS.avgC, c.domC, false, C);
      drawHist(sim, $('hist-t'), c.r.tri, n, OBS.tri, c.domT, true, C);
    }
  },
});
