// PCA·SVD 저랭크 근사 — 화면 연결과 그림. 계산은 model.js(PS)에 있습니다.
const $ = (id) => document.getElementById(id);
const sub = (n) => String(n).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[c]); // 아래첨자 숫자 (σ₁₂ 처럼)

// k 빠른 선택 버튼. create 전에 만들어야 지금 값과 같은 버튼이 눌린 모양이 됨
const QUICK = { ki: [1, 2, 3, 5, 10, 20, 40, 80], kc: [1, 2, 3, 4, 5, 10, 20, 40] };
Object.keys(QUICK).forEach((p) => {
  $('presets-' + p).innerHTML = QUICK[p]
    .map((k) => `<button type="button" class="btn btn-sm" data-set='${JSON.stringify({ [p]: k })}'>${k}</button>`).join('');
});

// 히트맵 틀: 유형 띠, 유전자 묶음 글자, 캔버스 3개 (원본·근사·차이)
const BLOCK_COLOR = ['--c1', '--c2', '--c3', '--c4', '--c-neutral']; // 묶음 A–D는 그 유형의 색, H는 회색
$('heat').innerHTML = '<span></span><div class="band" id="heat-band"></div>' +
  [['orig', 'capOrig'], ['approx', ''], ['resid', 'capResid']].map(([id, cap]) =>
    '<div class="blocks">' + PS.BLOCKS.map(([b, n], i) => `<span style="flex: ${n} 1 0; color: var(${BLOCK_COLOR[i]})">${b}</span>`).join('') + '</div>' +
    `<canvas class="mat" id="heat-${id}" role="img"${cap ? ` data-t-aria="${cap}"` : ''}></canvas>` +
    `<span></span><p class="cap" id="heat-${id}-cap"${cap ? ` data-t="${cap}"` : ''}></p>`).join('');
$('type-keys').innerHTML = '<span data-t="legendTypes"></span>' +
  PS.TYPES.map((t, i) => `<span class="sw" style="background: var(${BLOCK_COLOR[i]})"></span><span data-t="type${t}"></span>`).join('');

/* ---------- 색표: 값 → 회색(높을수록 진함), 부호 있는 값 → 파랑(−)·흰색·주황(+) ---------- */
let LUT = null;
function luts() {
  if (LUT) return LUT;
  const css = EduSim.css;
  const table = (colors) => {
    const f = d3.piecewise(d3.interpolateLab, colors);
    return Array.from({ length: 256 }, (_, i) => { const c = d3.rgb(f(i / 255)); return [c.r, c.g, c.b]; });
  };
  LUT = { seq: table(['#fbfbfa', css('--ink')]), div: table([css('--c1'), css('--surface'), css('--c2')]) };
  const grad = (t) => 'linear-gradient(to right, ' + [0, 64, 128, 191, 255].map((i) => `rgb(${t[i].join(',')})`).join(', ') + ')';
  ['ramp-seq', 'ramp-seq2'].forEach((id) => { $(id).style.background = grad(LUT.seq); });
  ['ramp-div', 'ramp-div2'].forEach((id) => { $(id).style.background = grad(LUT.div); });
  return LUT;
}

// 행렬(행 우선, rows × cols)을 캔버스에 칸당 1픽셀로. lo ~ hi를 색표의 처음 ~ 끝에 맞춤.
// transpose: a가 cols × rows로 저장돼 있을 때 (세포 × 유전자 → 유전자가 행인 히트맵)
function paint(cv, a, rows, cols, lo, hi, table, transpose) {
  if (cv.width !== cols) cv.width = cols;
  if (cv.height !== rows) cv.height = rows;
  const ctx = cv.getContext('2d'), im = ctx.createImageData(cols, rows), px = im.data;
  const s = 255 / (hi - lo || 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = transpose ? a[c * rows + r] : a[r * cols + c];
      const col = table[Math.max(0, Math.min(255, Math.round((v - lo) * s)))];
      const p = 4 * (r * cols + c);
      px[p] = col[0]; px[p + 1] = col[1]; px[p + 2] = col[2]; px[p + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
}
const maxAbs = (a) => a.reduce((m, x) => Math.max(m, Math.abs(x)), 0);

/* ---------- 분해는 데이터·시드·중심화가 바뀔 때만 (k를 움직일 때는 다시 계산하지 않음) ---------- */
const cache = new Map();
function analysis(s) {
  const img = s.data === 'img';
  const key = img ? 'img ' + s.seed : 'cells ' + s.seed + ' ' + s.center;
  let r = cache.get(key);
  if (!r) {
    const M = img ? PS.image(s.seed) : PS.cells(s.seed);
    const S = PS.decompose(M, !img && s.center === 'on');
    let lo = Infinity, hi = -Infinity;
    for (const v of M.a) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const total = S.d.reduce((t, x) => t + x * x, 0);
    r = { M, S, lo, hi, share: Array.from(S.d, (x) => (x * x) / total) };
    if (cache.size >= 8) cache.clear();
    cache.set(key, r);
  }
  return r;
}

function colors() {
  const css = EduSim.css;
  return {
    types: BLOCK_COLOR.map(css), kept: css('--c1'), neutral: css('--c-neutral'),
    ink2: css('--ink-2'), base: css('--line-strong'), surface: css('--surface'),
  };
}

/* ---------- 이미지 탭 ---------- */
function drawImage(sim, A, k, fit) {
  const { M, lo, hi } = A, L = luts(), h = (hi - lo) / 2;
  paint($('img-orig'), M.a, M.m, M.n, lo, hi, L.seq);
  paint($('img-approx'), fit.approx, M.m, M.n, lo, hi, L.seq);
  paint($('img-resid'), fit.diff, M.m, M.n, -h, h, L.div); // 색 범위 고정 → k가 커지면 옅어짐
  $('img-approx-cap').textContent = sim.t('capApprox', { k });
  $('img-approx').setAttribute('aria-label', sim.t('capApprox', { k }));
}

function drawPieceImage(sim, A, l) {
  const { S } = A, L = luts(), rem = EduSim.rem();
  const P = PS.piece(S, l), mp = maxAbs(P), mu = maxAbs(S.u[l]), mv = maxAbs(S.v[l]);
  paint($('piece-a'), P, S.m, S.n, -mp, mp, L.div);
  paint($('piece-u'), S.u[l], S.m, 1, -mu, mu, L.div);
  paint($('piece-v'), S.v[l], 1, S.n, -mv, mv, L.div);
  const strip = Math.round(rem * 0.7), gap = 3;
  const size = Math.max(100, Math.min(EduSim.contentWidth($('piece-img-wrap').parentElement) - strip - gap, Math.round(rem * 15)));
  const grid = $('piece-img');
  grid.style.gridTemplateColumns = strip + 'px ' + size + 'px';
  grid.style.gridTemplateRows = strip + 'px ' + size + 'px';
  grid.style.width = (strip + gap + size) + 'px';
  [['piece-a', size, size], ['piece-u', strip, size], ['piece-v', size, strip]].forEach(([id, w, h]) => {
    $(id).style.width = w + 'px'; $(id).style.height = h + 'px';
  });
  const n = l + 1;
  $('piece-formula').textContent = sim.t('pieceImg', { k: sub(n) });
  $('piece-a').setAttribute('aria-label', sim.t('pieceTitle', { k: n }));
}

/* ---------- 세포 탭 ---------- */
function drawCells(sim, A, k, fit) {
  const { M, hi } = A, L = luts();
  paint($('heat-orig'), M.a, M.n, M.m, 0, hi, L.seq, true);
  paint($('heat-approx'), fit.approx, M.n, M.m, 0, hi, L.seq, true);
  paint($('heat-resid'), fit.diff, M.n, M.m, -hi / 2, hi / 2, L.div, true);
  $('heat-approx-cap').textContent = sim.t('capApprox', { k });
  $('heat-approx').setAttribute('aria-label', sim.t('capApprox', { k }));
  // 유형 띠: 세포가 유형 순서로 정렬돼 있으므로 구간마다 한 색
  let at = 0;
  const stops = PS.COUNTS.map((c, t) => {
    const a = (100 * at) / M.m, b = (100 * (at + c)) / M.m;
    at += c;
    return `var(${BLOCK_COLOR[t]}) ${a}% ${b}%`;
  });
  $('heat-band').style.background = 'linear-gradient(to right, ' + stops.join(', ') + ')';
}

function drawPiecePlots(sim, A, l, C) {
  const { M, S } = A, rem = EduSim.rem(), k = rem / 16;
  const n = l + 1;
  // 점수: 유형마다 한 줄, 겹치지 않게 세로로 조금씩 흩뜨림 (난수 대신 황금비 수열 → 늘 같은 자리)
  const rows = Array.from(S.u[l], (u, i) => ({ x: u * S.d[l], t: M.type[i], y: M.type[i] + (((i * 0.6180339887) % 1) - 0.5) * 0.6 }));
  const lim = Math.max(...rows.map((d) => Math.abs(d.x))) * 1.05 || 1;
  const w = EduSim.contentWidth($('piece-plots').parentElement);
  $('scores-title').textContent = sim.t('scoresTitle', { k: sub(n) });
  $('scores').replaceChildren(Plot.plot({
    width: w, height: Math.round(rem * 8),
    marginLeft: Math.round(rem * 3.6), marginRight: Math.round(rem * 0.8), marginTop: Math.round(rem * 0.4), marginBottom: Math.round(rem * 2.3),
    style: EduSim.plotStyle(),
    x: { domain: [-lim, lim], label: sim.t('axisScore'), labelAnchor: 'center', labelArrow: 'none', ticks: 5 },
    y: { domain: [-0.5, 3.5], reverse: true, ticks: [0, 1, 2, 3], tickFormat: (i) => sim.t('type' + PS.TYPES[i]), label: null, tickSize: 0 },
    marks: [
      Plot.ruleX([0], { stroke: C.base }),
      Plot.dot(rows, { x: 'x', y: 'y', r: 2.6 * k, fill: (d) => C.types[d.t], fillOpacity: 0.8 }),
    ],
  }));
  // loading: 유전자마다 막대, 묶음 색 (A–D는 그 유형의 색)
  const v = S.v[l], vm = Math.max(maxAbs(v), 1e-12) * 1.1;
  const genes = PS.GENES.map((g, j) => ({ j, g, v: v[j], b: PS.GENE_BLOCK[j] }));
  let at = 0;
  const centers = PS.BLOCKS.map(([b, cnt], i) => { const c = { b, i, x: at + cnt / 2 }; at += cnt; return c; });
  $('loadings-title').textContent = sim.t('loadingsTitle', { k: sub(n) });
  $('loadings').replaceChildren(Plot.plot({
    width: w, height: Math.round(rem * 7),
    marginLeft: Math.round(rem * 3.6), marginRight: Math.round(rem * 0.8), marginTop: Math.round(rem * 0.4), marginBottom: Math.round(rem * 1.4),
    style: EduSim.plotStyle(),
    x: { domain: [0, PS.GENES.length], axis: null },
    y: { domain: [-vm, vm], ticks: 3, label: null, tickFormat: (x) => (x === 0 ? '0' : EduSim.fmt(x, 1)) },
    marks: [
      Plot.rectY(genes, { x1: (d) => d.j + 0.12, x2: (d) => d.j + 0.88, y: 'v', fill: (d) => C.types[d.b] }),
      Plot.ruleY([0], { stroke: C.base }),
      Plot.text(centers, { x: 'x', frameAnchor: 'bottom', dy: Math.round(rem * 1.1), text: 'b', fill: (d) => C.types[d.i], fontWeight: 700 }),
      Plot.tip(genes, Plot.pointerX({ x: (d) => d.j + 0.5, y: 'v', title: (d) => d.g + ': ' + EduSim.fmt(d.v, 3) })),
    ],
  }));
}

/* ---------- 공통: scree plot, 숫자 ---------- */
function drawScree(sim, s, A, k, C) {
  const el = $('scree'), rem = EduSim.rem(), img = s.data === 'img';
  const r = A.share.length;
  // 로그 축은 0.00001%에서 자름: 시드에 따라 마지막 몇 개의 σ²가 10⁻¹³%까지 내려가 축이 쓸데없이 길어짐 → 바닥에 놓고 툴팁에 "<" 표시
  const FLOOR = 1e-5;
  const rows = A.share.map((p, i) => ({ i: i + 1, p: 100 * p, y: img ? Math.max(100 * p, FLOOR) : 100 * p, kept: i < k }));
  const pmax = Math.max(...rows.map((d) => d.p)), pmin = FLOOR;
  const narrow = el.clientWidth < rem * 22; // 폰 + 글자 크게: 눈금 글자가 겹치지 않게 줄임
  const ticks = img ? (narrow ? [1, 40, 80, 120] : [1, 20, 40, 60, 80, 100, 120]) : (narrow ? [1, 20, 40] : [1, 10, 20, 30, 40]);
  const decades = []; // 로그 축 눈금: 10의 거듭제곱마다
  for (let e = Math.round(Math.log10(pmin)); e <= Math.floor(Math.log10(pmax * 1.5)); e++) decades.push(10 ** e);
  $('scree-note').textContent = sim.t('screeKept', { k }) + (k < r ? ' · ' + sim.t('screeDropped') + ' ' + (r - k) : '');
  el.replaceChildren(Plot.plot({
    width: el.clientWidth, height: Math.round(rem * 14),
    marginLeft: Math.round(rem * (img ? 3.9 : 2.6)), marginRight: Math.round(rem * 1), marginTop: Math.round(rem * 1.6), marginBottom: Math.round(rem * 2.4), // 로그 축 눈금 "0.00001"이 들어가게
    style: EduSim.plotStyle(),
    x: { domain: [0, r + 1], ticks, label: sim.t('screeX'), labelAnchor: 'center', labelArrow: 'none' },
    y: img
      ? { type: 'log', domain: [pmin / 1.5, pmax * 1.5], ticks: decades, grid: true, label: sim.t('screeAxisLog'), labelArrow: 'none', tickFormat: (x) => +x.toPrecision(1) + '' }
      : { domain: [0, pmax * 1.08], grid: true, label: sim.t('screeAxis'), labelArrow: 'none' },
    marks: [
      Plot.ruleX([k + 0.5], { stroke: C.ink2, strokeDasharray: '4 3' }),
      Plot.line(rows, { x: 'i', y: 'y', stroke: C.neutral, strokeWidth: 1 }),
      Plot.dot(rows, {
        x: 'i', y: 'y', r: (img ? 2.2 : 3.2) * (rem / 16), strokeWidth: 1.25,
        fill: (d) => (d.kept ? C.kept : C.surface), stroke: (d) => (d.kept ? C.kept : C.neutral),
      }),
      Plot.tip(rows, Plot.pointerX({
        x: 'i', y: 'y',
        title: (d) => sim.t('screeTip', { i: d.i, p: d.p < d.y ? '< 0.00001%' : d.p < 0.01 ? +d.p.toPrecision(2) + '%' : EduSim.fmt(d.p, d.p < 1 ? 3 : 1) + '%' }),
      })),
    ],
  }));
}

const sim = EduSim.create({
  text: TEXT,
  params: {
    data: { options: ['img', 'cells'], default: 'img' },
    ki: { min: 1, max: PS.IMG_N, step: 1, default: 5 },
    kc: { min: 1, max: PS.GENES.length, step: 1, default: 2 },
    center: { options: ['on', 'off'], default: 'on' },
  },
  render(s, sim) {
    const img = s.data === 'img';
    const k = img ? s.ki : s.kc;
    const A = analysis(s);
    const C = colors();

    // 탭에 따라 보이는 것
    $('ctrl-ki').hidden = !img; $('ctrl-kc').hidden = img; $('center-row').hidden = img;
    $('fig-img').hidden = !img; $('fig-cells').hidden = img;
    $('piece-img-wrap').hidden = !img; $('piece-plots').hidden = img;
    $('stat-store-box').hidden = !img;
    $('tasks-img').hidden = !img; $('tasks-cells').hidden = img;
    $('data-note').textContent = sim.t(img ? 'noteImg' : 'noteCells');

    // 근사와 차이 (중심화했으면 평균을 다시 더해 원래 척도로)
    const approx = PS.approx(A.S, k, A.S.mean);
    const diff = A.M.a.map((v, i) => v - approx[i]);
    const e = PS.tailError(A.S.d, k);
    $('stat-k').innerHTML = k + ' <small>/ ' + A.S.d.length + '</small>';
    $('stat-err').textContent = EduSim.pct(e.rel, 1);
    $('stat-kept-k').textContent = sim.t(img ? 'statKeptImg' : s.center === 'on' ? 'statKeptPca' : 'statKeptRaw');
    $('stat-kept').textContent = EduSim.pct(e.kept, 1);
    if (img) $('stat-store').textContent = EduSim.pct(PS.storage(A.M.m, A.M.n, k), 0);

    const l = k - 1;
    $('piece-title').textContent = sim.t('pieceTitle', { k });
    $('piece-sigma').textContent = (k === 1 ? sim.t('pieceSigma1', { s: EduSim.fmt(A.S.d[0], 2) }) : sim.t('pieceSigma', { k: sub(k), s: EduSim.fmt(A.S.d[l], 2), r: EduSim.pct(A.S.d[l] / A.S.d[0], 1) })) +
      (img ? ' · ' + sim.t('pieceScale') : '');
    if (img) {
      drawImage(sim, A, k, { approx, diff });
      drawPieceImage(sim, A, l);
    } else {
      drawCells(sim, A, k, { approx, diff });
      drawPiecePlots(sim, A, l, C);
    }
    drawScree(sim, s, A, k, C);
  },
});
