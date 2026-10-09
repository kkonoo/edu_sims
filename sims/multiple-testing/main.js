// 다중검정과 FDR — 화면 연결과 그래프. 계산은 model.js(MT)에 있습니다.
const $ = (id) => document.getElementById(id);

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (k) => String(k).split('').map((c) => SUP[c]).join('');

// 로그 축 눈금 이름: 1, 0.1, 0.01, 10⁻³, 10⁻⁴ …
function powLabel(v) {
  const k = Math.round(Math.log10(v));
  return k >= -2 ? String(10 ** k) : '10' + sup(k);
}

// p값 표시: 0.0123, 3.2×10⁻⁶
function fmtP(p) {
  if (p >= 0.001) return String(Number(p.toPrecision(3)));
  let k = Math.floor(Math.log10(p));
  let mant = p / 10 ** k;
  if (mant >= 9.95) { mant = 1; k += 1; }
  return mant.toFixed(1) + '×10' + sup(k);
}

// lo~hi 사이 10의 거듭제곱 눈금. 많으면 건너뛰되 fromTop이면 hi부터, 아니면 lo부터 셈 (그 끝이 꼭 눈금이 됨)
function decades(lo, hi, max, fromTop) {
  const a = Math.ceil(Math.log10(lo) - 1e-9), b = Math.floor(Math.log10(hi) + 1e-9);
  const step = Math.max(1, Math.ceil((b - a + 1) / max));
  const out = [];
  for (let k = a; k <= b; k++) if ((fromTop ? b - k : k - a) % step === 0) out.push(10 ** k);
  return out;
}

// 점이 많으면 앞쪽 200개는 모두, 나머지는 로그 간격으로 골라 약 700개만 그림
// (로그 x축이라 눈으로는 같고, m = 20000에서도 슬라이더가 부드럽게 움직임)
function pickRanks(m) {
  const HEAD = 200, REST = 500;
  if (m <= HEAD + REST) return d3.range(1, m + 1);
  const set = new Set(d3.range(1, HEAD + 1));
  const la = Math.log(HEAD), lb = Math.log(m);
  for (let k = 0; k <= REST; k++) set.add(Math.round(Math.exp(la + ((lb - la) * k) / REST)));
  return [...set].sort((x, y) => x - y);
}

function colors() {
  return {
    null: EduSim.css('--c1'), alt: EduSim.css('--c2'), bh: EduSim.css('--c3'), bonf: EduSim.css('--c4'),
    pool: EduSim.css('--c-neutral'), ink2: EduSim.css('--ink-2'), base: EduSim.css('--line-strong'), surface: EduSim.css('--surface'),
  };
}

function drawHist(sm, s, sim, C) {
  const B = 20;
  const nNull = new Array(B).fill(0), nAlt = new Array(B).fill(0);
  for (let i = 0; i < sm.m; i++) {
    const b = Math.min(B - 1, Math.floor(sm.p[i] * B));
    (sm.isAlt[i] ? nAlt : nNull)[b]++;
  }
  const groups = s.hist === 'stack' ? ['null', 'alt'] : ['pool'];
  const rows = [];
  for (const g of groups) {
    for (let b = 0; b < B; b++) {
      const n = g === 'null' ? nNull[b] : g === 'alt' ? nAlt[b] : nNull[b] + nAlt[b];
      rows.push({ x1: b / B, x2: (b + 1) / B, g, n });
    }
  }
  const name = { null: sim.t('legendNull'), alt: sim.t('legendAlt'), pool: sim.t('legendPool') };
  const el = $('hist');
  const rem = EduSim.rem();
  el.replaceChildren(Plot.plot({
    width: el.clientWidth,
    height: Math.round(rem * 12),
    marginLeft: Math.round(rem * 3),
    marginTop: Math.round(rem * 1.5),
    marginBottom: Math.round(rem * 2.6),
    style: EduSim.plotStyle(),
    x: { domain: [0, 1], ticks: 5, label: sim.t('axisP'), labelAnchor: 'center', labelArrow: 'none' },
    y: { grid: true, label: sim.t('axisCount'), labelArrow: 'none' },
    color: { domain: ['null', 'alt', 'pool'], range: [C.null, C.alt, C.pool] },
    marks: [
      Plot.rectY(rows, {
        x1: 'x1', x2: 'x2', y: 'n', fill: 'g', insetLeft: 1, insetRight: 1, insetTop: 1,
        title: (d) => sim.t('tipBin', { a: d.x1.toFixed(2), b: d.x2.toFixed(2) }) + '\n' +
          name[d.g] + ': ' + sim.t('tipCount', { n: EduSim.fmt(d.n) }),
        tip: true,
      }),
      Plot.ruleY([0], { stroke: C.base }),
    ],
  }));
  $('hist-legend-stack').hidden = s.hist !== 'stack';
  $('hist-legend-pool').hidden = s.hist !== 'pool';
}

function drawSorted(sm, o, reject, R, s, sim, C) {
  const m = sm.m, a = s.alpha, q = s.alpha;
  const pts = pickRanks(m).map((i) => {
    const j = o[i - 1];
    return { i, p: sm.p[j], g: sm.isAlt[j] ? 'alt' : 'null', rej: reject[j] === 1 };
  });

  // y축 아래쪽: 가장 작은 p값까지 보이되, Bonferroni 선보다 4자리 넘게 내려가진 않음 (더 작은 점은 바닥에 붙임)
  const floor = Math.max(a / m / 1e4, Math.min(sm.p[o[0]], a / m / 10));
  const lo = 10 ** Math.floor(Math.log10(floor));
  const clamped = sm.p[o[0]] < lo; // 이보다 작은 p는 바닥에 붙여 그리고, 바닥 눈금을 "≤"로 표시
  const name = { null: sim.t('legendNull'), alt: sim.t('legendAlt') };
  const lineLabel = { textAnchor: 'end', fill: C.ink2, fontWeight: 600, stroke: C.surface, strokeWidth: 3, paintOrder: 'stroke' };
  const emph = (method) => (s.method === method ? { strokeWidth: 2.5, strokeOpacity: 1 } : { strokeWidth: 1.5, strokeOpacity: 0.45 });

  const el = $('sorted');
  const rem = EduSim.rem();
  el.replaceChildren(Plot.plot({
    width: el.clientWidth,
    height: Math.round(rem * 17),
    marginLeft: Math.round(rem * 3),
    marginRight: Math.round(rem * 0.75),
    marginTop: Math.round(rem * 1.6),
    marginBottom: Math.round(rem * 2.6),
    style: EduSim.plotStyle(),
    x: {
      type: 'log', domain: [1, m], grid: true, ticks: decades(1, m, 6), tickFormat: (v) => EduSim.fmt(v),
      label: sim.t('axisRank'), labelAnchor: 'center', labelArrow: 'none',
    },
    y: {
      type: 'log', domain: [lo, 1], clamp: true, grid: true, ticks: decades(lo, 1, 6, !clamped),
      tickFormat: (v) => (clamped && v <= lo * 1.0001 ? '≤' : '') + powLabel(v),
      label: sim.t('axisP'), labelArrow: 'none',
    },
    color: { domain: ['null', 'alt'], range: [C.null, C.alt] },
    marks: [
      Plot.line([[1, q / m], [m, q]], { stroke: C.bh, ...emph('bh') }),
      Plot.ruleY([a / m], { stroke: C.bonf, strokeDasharray: '6 4', ...emph('bonf') }),
      s.method === 'none' ? Plot.ruleY([a], { stroke: C.ink2, strokeWidth: 2, strokeDasharray: '1.5 3' }) : null,
      Plot.dot(pts.filter((d) => !d.rej), { x: 'i', y: 'p', r: 2.6, stroke: 'g', fill: C.surface, strokeWidth: 1.3 }),
      Plot.dot(pts.filter((d) => d.rej), { x: 'i', y: 'p', r: 3, fill: 'g' }),
      // 선 이름은 오른쪽 끝에 직접. BH 선은 α 선과 같은 점(m, q)에서 끝나므로 BH만 선 아래에
      Plot.text([{ x: m, y: a / m, t: 'Bonferroni' }].concat(s.method === 'none' ? [{ x: m, y: a, t: 'α' }] : []),
        { x: 'x', y: 'y', text: 't', dy: -7, ...lineLabel }),
      Plot.text([{ x: m, y: q, t: 'BH' }], { x: 'x', y: 'y', text: 't', dy: 12, ...lineLabel }),
      // 어떤 방법이든 p값이 가장 작은 R개가 "유의"이므로 순위 R에 경계선을 그음 (점이 빽빽해도 경계가 보이게)
      R > 0 ? Plot.ruleX([R + 0.5], { stroke: C.ink2, strokeWidth: 1 }) : null,
      R > 0 ? Plot.text([R + 0.5], {
        x: (d) => d, frameAnchor: 'top', dy: 2, lineAnchor: 'top', ...lineLabel,
        ...(Math.log10(m / R) > 0.45
          ? { text: () => '← ' + sim.t('cutLabel', { n: EduSim.fmt(R) }), textAnchor: 'start', dx: 4 }
          : { text: () => sim.t('cutLabel', { n: EduSim.fmt(R) }), textAnchor: 'end', dx: -4 }),
      }) : null,
      Plot.tip(pts, Plot.pointer({
        x: 'i', y: 'p',
        title: (d) => sim.t('tipRank', { i: EduSim.fmt(d.i) }) + '   p = ' + fmtP(d.p) + '\n' +
          name[d.g] + ' · ' + sim.t(d.rej ? 'legendSig' : 'legendNonSig'),
      })),
    ],
  }));
  $('legend-alpha').hidden = s.method !== 'none';
}

EduSim.create({
  text: TEXT,
  params: {
    m: { values: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000], default: 1000 },
    pi1: { min: 0, max: 0.5, step: 0.01, default: 0.1 },
    effect: { min: 0, max: 6, step: 0.1, default: 3 },
    alpha: { values: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2], default: 0.05, format: (v) => String(v) },
    method: { options: ['none', 'bonf', 'bh'], default: 'bh' },
    hist: { options: ['stack', 'pool'], default: 'stack' },
  },
  render(s, sim) {
    const sm = MT.simulate(s.m, s.pi1, s.effect, s.seed);
    const order = MT.ascending(sm.p); // 한 번만 정렬해서 BH와 그래프가 같이 씀
    const reject = MT.decide(sm.p, s.method, s.alpha, order);
    const c = MT.confusion(sm.isAlt, reject);
    const f = EduSim.fmt;

    $('alpha-label').textContent = sim.t(s.method === 'bh' ? 'qLabel' : 'alphaLabel');

    $('stat-r').textContent = f(c.R);
    $('stat-fdr').textContent = c.R > 0 ? EduSim.pct(c.fdp, 1) : '—';
    $('stat-power').textContent = c.m1 > 0 ? EduSim.pct(c.power, 0) : '—';

    $('ct-fp').textContent = f(c.FP);
    $('ct-tn').textContent = f(c.TN);
    $('ct-tp').textContent = f(c.TP);
    $('ct-fn').textContent = f(c.FN);
    $('ct-m0').textContent = f(c.m0);
    $('ct-m1').textContent = f(c.m1);
    $('ct-r').textContent = f(c.R);
    $('ct-nr').textContent = f(c.m - c.R);
    $('ct-m').textContent = f(c.m);

    const C = colors();
    drawHist(sm, s, sim, C);
    drawSorted(sm, order, reject, c.R, s, sim, C);
  },
});
