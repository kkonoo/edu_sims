// 사전분포 × 가능도 → 사후분포 — 화면 연결과 그래프. 계산은 model.js(BB)에 있습니다.
const $ = (id) => document.getElementById(id);

// 밀도를 그릴 θ 격자 (양 끝 0, 1은 U자 사전분포에서 무한대가 되므로 피함)
const GRID = Array.from({ length: 600 }, (_, i) => (i + 0.5) / 600);

// 2 → "2", 15.5 → "15.5", 0.3333 → "0.33"
const num = (v) => String(Number(v.toFixed(2)));

function drawChart(s, sim, pr, post, n, k, draw) {
  const css = EduSim.css;
  const C = { prior: css('--c1'), post: css('--c2'), lik: css('--c-neutral'), ink: css('--ink'), ink2: css('--ink-2'), base: css('--line-strong'), surface: css('--surface') };
  const rows = GRID.map((x) => ({
    x,
    prior: BB.dbeta(x, pr.a, pr.b),
    lik: BB.dbeta(x, k + 1, n - k + 1), // 가능도를 넓이 1로 맞춘 것
    post: BB.dbeta(x, post.a, post.b),
  }));
  // y축은 양 끝 1%를 뺀 구간의 최댓값 기준 (U자 사전분포의 끝은 잘려 보임)
  const inner = rows.filter((d) => d.x >= 0.01 && d.x <= 0.99);
  const ymax = 1.1 * Math.max(...inner.map((d) => Math.max(d.prior, d.lik, d.post)));
  const ci = [{ x: post.lo, post: BB.dbeta(post.lo, post.a, post.b) }]
    .concat(rows.filter((d) => d.x > post.lo && d.x < post.hi))
    .concat([{ x: post.hi, post: BB.dbeta(post.hi, post.a, post.b) }]);
  const d2 = (v) => (isFinite(v) ? v.toFixed(2) : '∞');

  const el = $('chart');
  const rem = EduSim.rem();
  const meanDot = (x, fill) => Plot.dot([x], { x: (d) => d, y: () => 0, r: 5, fill, stroke: C.surface, strokeWidth: 2 });
  el.replaceChildren(Plot.plot({
    width: el.clientWidth,
    height: Math.round(rem * 15),
    marginLeft: Math.round(rem * 2.5),
    marginTop: Math.round(rem * 1.4),
    marginBottom: Math.round(rem * 2.6),
    style: EduSim.plotStyle(),
    x: { domain: [0, 1], label: sim.t('axisTheta'), labelAnchor: 'center', labelArrow: 'none' },
    y: { domain: [0, ymax], grid: true, label: sim.t('axisDensity'), labelArrow: 'none' },
    marks: [
      Plot.areaY(ci, { x: 'x', y: 'post', fill: C.post, fillOpacity: 0.18, clip: true }),
      Plot.ruleY([0], { stroke: C.base }),
      Plot.line(rows, { x: 'x', y: 'prior', stroke: C.prior, strokeWidth: 2, clip: true }),
      Plot.line(rows, { x: 'x', y: 'post', stroke: C.post, strokeWidth: 2.5, clip: true }),
      // 균등 사전분포면 가능도와 사후분포가 똑같아서, 점선을 위에 그려야 둘 다 보임
      Plot.line(rows, { x: 'x', y: 'lik', stroke: C.lik, strokeWidth: 2, strokeDasharray: '5 4', clip: true }),
      draw ? Plot.ruleX([s.theta], { stroke: C.ink, strokeWidth: 1.5, strokeDasharray: '1.5 3' }) : null,
      // 아래 축 위의 세 점: 사전 평균(파랑) · 표본 비율(회색) · 사후 평균(주황) — 사후 평균은 늘 두 점 사이
      meanDot(post.priorMean, C.prior),
      n > 0 ? meanDot(post.sampleProp, C.lik) : null,
      meanDot(post.mean, C.post),
      Plot.ruleX(rows, Plot.pointerX({ x: 'x', stroke: C.ink2, strokeOpacity: 0.35 })),
      Plot.tip(rows, Plot.pointerX({
        x: 'x', y: 'post',
        title: (d) => sim.t('tipTheta', { x: d.x.toFixed(3) }) + '\n' +
          sim.t('legendPrior') + ' ' + d2(d.prior) + '\n' +
          sim.t('legendLik') + ' ' + d2(d.lik) + '\n' +
          sim.t('legendPost') + ' ' + d2(d.post),
      })),
    ],
  }));
}

EduSim.create({
  text: TEXT,
  params: {
    m0: { min: 0.01, max: 0.99, step: 0.01, default: 0.5 },
    s0: { values: [1, 2, 3, 5, 10, 20, 30, 50, 100, 200], default: 2 },
    mode: { options: ['draw', 'input'], default: 'draw' },
    theta: { min: 0.01, max: 0.99, step: 0.01, default: 0.7 },
    // 처음 10번은 한 명씩 → 사후분포가 갱신되는 모습이 보이게
    ndraw: { values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 70, 100, 150, 200, 300, 500, 1000], default: 20 },
    n: { min: 0, max: 200, step: 1, default: 10 },
    k: { min: 0, max: (s) => s.n, step: 1, default: 7 },
  },
  render(s, sim) {
    const t = sim.t, f = EduSim.fmt;
    const draw = s.mode === 'draw';
    const n = draw ? s.ndraw : s.n;
    const k = draw ? BB.drawSuccesses(s.theta, n, s.seed) : s.k;
    const pr = BB.priorFromMeanStrength(s.m0, s.s0);
    const post = BB.update(pr.a, pr.b, n, k);

    $('mode-draw').hidden = !draw;
    $('mode-input').hidden = draw;
    $('legend-true').hidden = !draw;
    $('prior-ab').textContent = '→ Beta(' + num(pr.a) + ', ' + num(pr.b) + ')';
    $('observed').textContent = n > 0 ? t('observed', { n: f(n), k: f(k) }) : t('noData');

    $('stat-mean').textContent = f(post.mean, 3);
    $('stat-ci').textContent = '[' + f(post.lo, 3) + ', ' + f(post.hi, 3) + ']';
    $('stat-post').textContent = 'Beta(' + num(post.a) + ', ' + num(post.b) + ')';

    // 사후 평균 = w × 사전 평균 + (1 − w) × 표본 비율
    const dot = (v) => '<span class="dot" style="background: var(' + v + ')"></span>';
    let line = dot('--c2') + t('statMean') + ' <b>' + f(post.mean, 3) + '</b> = <b>' + f(post.w, 2) + '</b> × ' +
      dot('--c1') + t('priorMean') + ' ' + f(post.priorMean, 3);
    if (n > 0) line += ' + <b>' + f(1 - post.w, 2) + '</b> × ' + dot('--c-neutral') + t('sampleProp') + ' ' + f(post.sampleProp, 3);
    $('wavg').innerHTML = line;
    $('wbar-prior').style.flex = String(post.w);
    $('wbar-data').style.flex = String(1 - post.w);
    $('wbar-data').hidden = n === 0;
    $('wlab-prior').textContent = t('weightPrior', { p: EduSim.pct(post.w, 0) });
    $('wlab-data').textContent = t('weightData', { p: EduSim.pct(1 - post.w, 0) });

    drawChart(s, sim, pr, post, n, k, draw);
  },
});
