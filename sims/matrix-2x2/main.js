// 2×2 행렬과 고유벡터 — 화면 연결과 SVG 그림. 계산은 model.js(M2)에 있습니다.
const $ = (id) => document.getElementById(id);

const L = 5; // 그림 범위: −L ~ L
const SNAP = 0.1; // 끌 때 맞추는 간격
const K = 30; // 변형된 격자를 그릴 선의 개수(한쪽) — 작게 줄어드는 행렬에서도 그림을 채우도록 넉넉히

// 2 → "2", −0.5 → "-0.5", −0 → "0"
const fmt2 = (v) => { const s = String(Number(v.toFixed(2))); return s === '-0' ? '0' : s; };
// 고유벡터 방향을 읽기 쉽게: 큰 성분이 1이 되도록 → (1, 0.5)
const dirLabel = (u) => { const m = Math.abs(u[0]) >= Math.abs(u[1]) ? u[0] : u[1]; return '(' + fmt2(u[0] / m) + ', ' + fmt2(u[1] / m) + ')'; };
const r1 = (v) => Number(v.toFixed(1));

// 마지막으로 그린 그림의 크기와 끌 수 있는 점 (드래그에서 씀)
let view = { S: 1, knobs: [] };

function drawPlane(s, sim, M, eig) {
  const el = $('plane');
  const S = Math.max(200, Math.round(el.clientWidth));
  const css = EduSim.css;
  const C = {
    e1: css('--c2'), e2: css('--c1'), eig: css('--c3'), v: css('--c4'), ink: css('--ink'), ink2: css('--ink-2'),
    muted: css('--muted'), grid: css('--line'), axis: css('--line-strong'), neutral: css('--c-neutral'), surface: css('--surface'),
  };
  const X = (x) => (((x + L) / (2 * L)) * S).toFixed(1);
  const Y = (y) => (((L - y) / (2 * L)) * S).toFixed(1);
  const fs = Math.round(EduSim.rem() * 0.85);
  const line = (p, q, stroke, extra) => `<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" stroke="${stroke}" ${extra || ''}/>`;
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const mul = (k, p) => [k * p[0], k * p[1]];
  // 끝점에서 벡터 방향으로 조금 밀어서 이름 붙이기. 끝점이 그림 밖이면 같은 방향으로 그림 안쪽에
  const label = (p, dir, text, bold) => {
    const far = Math.max(Math.abs(p[0]), Math.abs(p[1]));
    if (far > 0.85 * L) p = mul((0.85 * L) / far, p);
    const n = Math.hypot(dir[0], dir[1]) || 1;
    const ox = (dir[0] / n) * (fs + 4), oy = (-dir[1] / n) * (fs + 4);
    const anchor = ox > 3 ? 'start' : ox < -3 ? 'end' : 'middle';
    // 글자 상자가 그림 밖으로 나가지 않게 (폭은 글자 수로 어림)
    const w = text.length * fs * 0.6;
    const [lo, hi] = anchor === 'start' ? [4, S - 4 - w] : anchor === 'end' ? [4 + w, S - 4] : [4 + w / 2, S - 4 - w / 2];
    const tx = Math.min(hi, Math.max(lo, +X(p[0]) + ox));
    const ty = Math.min(S - 6, Math.max(fs + 2, +Y(p[1]) + oy + fs * 0.35));
    return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" font-size="${fs}" ` +
      `font-weight="${bold ? 700 : 600}" fill="${C.ink}" stroke="${C.surface}" stroke-width="3.5" paint-order="stroke">${text}</text>`;
  };
  const knob = (p, color, hollow) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6.5" fill="${hollow ? C.surface : color}" stroke="${hollow ? color : C.surface}" stroke-width="${hollow ? 2.5 : 2}"/>`;

  const e1 = M2.apply(M, [1, 0]), e2 = M2.apply(M, [0, 1]);
  const v = [s.vx, s.vy], Av = M2.apply(M, v);
  const ratio = M2.eigenRatio(M, v);
  const o = [0, 0];
  const out = [];

  out.push(`<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="${sim.t('figTitle')}">`);
  out.push(`<defs><clipPath id="plane-clip"><rect width="${S}" height="${S}" rx="8"/></clipPath>` +
    `<marker id="ah-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${C.v}"/></marker>` +
    `<marker id="ah-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${C.muted}"/></marker></defs>`);
  out.push('<g clip-path="url(#plane-clip)">');

  // 원래 격자와 축
  for (let i = -L; i <= L; i++) {
    out.push(line([i, -L], [i, L], i === 0 ? C.axis : C.grid, `stroke-width="${i === 0 ? 1.5 : 1}"`));
    out.push(line([-L, i], [L, i], i === 0 ? C.axis : C.grid, `stroke-width="${i === 0 ? 1.5 : 1}"`));
  }
  for (let i = -L + 1; i < L; i++) {
    if (i === 0) continue;
    out.push(`<text x="${X(i)}" y="${(+Y(0) + fs + 2).toFixed(1)}" text-anchor="middle" font-size="${Math.round(fs * 0.8)}" fill="${C.muted}">${i}</text>`);
    out.push(`<text x="${(+X(0) - 5).toFixed(1)}" y="${(+Y(i) + fs * 0.3).toFixed(1)}" text-anchor="end" font-size="${Math.round(fs * 0.8)}" fill="${C.muted}">${i}</text>`);
  }

  // 변형된 격자: 세로선 x = i의 상은 Ae₂ 방향(파랑), 가로선 y = j의 상은 Ae₁ 방향(주황)
  for (let i = -K; i <= K; i++) {
    const w = i === 0 ? 'stroke-width="1.5" stroke-opacity="0.75"' : 'stroke-width="1" stroke-opacity="0.32"';
    out.push(line(add(mul(i, e1), mul(-2 * K, e2)), add(mul(i, e1), mul(2 * K, e2)), C.e2, w));
    out.push(line(add(mul(i, e2), mul(-2 * K, e1)), add(mul(i, e2), mul(2 * K, e1)), C.e1, w));
  }

  // 단위정사각형의 상 (넓이 = |det|)
  const sq = [o, e1, add(e1, e2), e2].map((p) => X(p[0]) + ',' + Y(p[1])).join(' ');
  out.push(`<polygon points="${sq}" fill="${C.neutral}" fill-opacity="0.22" stroke="${C.neutral}" stroke-opacity="0.6" stroke-width="1"/>`);

  // 고유벡터 방향
  if (s.eig === 'on' && eig.vectors) {
    eig.vectors.forEach((u, i) => {
      out.push(line(mul(-3 * L, u), mul(3 * L, u), C.eig, 'stroke-width="2.5" stroke-dasharray="7 5"'));
      const r = (0.82 * L) / Math.max(Math.abs(u[0]), Math.abs(u[1]));
      const name = eig.vectors.length > 1 ? 'λ' + '₁₂'[i] : 'λ';
      out.push(label(mul(r, u), [-u[1], u[0]], name + ' = ' + fmt2(eig.values[i]), true));
    });
  }

  // 원래 기저 e₁, e₂ (흐리게)
  out.push(line(o, [1, 0], C.muted, 'stroke-width="1.5" marker-end="url(#ah-o)"'));
  out.push(line(o, [0, 1], C.muted, 'stroke-width="1.5" marker-end="url(#ah-o)"'));

  // 시험 벡터 v → Av
  out.push(line(o, v, C.v, 'stroke-width="2" stroke-dasharray="4 3"'));
  out.push(line(o, Av, C.v, `stroke-width="${ratio === null ? 2.5 : 3.5}" marker-end="url(#ah-v)"`));
  out.push(label(v, v, 'v'));
  out.push(label(Av, Av, ratio === null ? 'Av' : 'Av = ' + fmt2(ratio) + ' v', ratio !== null));

  // Ae₁, Ae₂ (끝점을 끌 수 있음)
  out.push(line(o, e1, C.e1, 'stroke-width="3"'));
  out.push(line(o, e2, C.e2, 'stroke-width="3"'));
  out.push(label(e1, e1, 'Ae₁'));
  out.push(label(e2, e2, 'Ae₂'));
  out.push(knob(v, C.v, true));
  out.push(knob(e1, C.e1));
  out.push(knob(e2, C.e2));
  out.push('</g>');

  // 손가락으로도 잡기 쉬운 투명한 큰 원 (이 원 위에서만 스크롤이 막힘)
  view = {
    S,
    knobs: [['v', v], ['e1', e1], ['e2', e2]].map(([id, p]) => ({ id, x: +X(p[0]), y: +Y(p[1]) })),
  };
  view.knobs.forEach((k) => out.push(`<circle class="hit" cx="${k.x}" cy="${k.y}" r="22"/>`));
  out.push('</svg>');
  el.innerHTML = out.join('');
}

const sim = EduSim.create({
  text: TEXT,
  params: {
    a: { min: -3, max: 3, step: 0.01, default: 1 },
    b: { min: -3, max: 3, step: 0.01, default: 1 },
    c: { min: -3, max: 3, step: 0.01, default: 0 },
    d: { min: -3, max: 3, step: 0.01, default: 2 },
    t: { min: 0, max: 1, step: 0.01, default: 1 },
    vx: { min: -4, max: 4, step: 0.1, default: 1.5 },
    vy: { min: -4, max: 4, step: 0.1, default: 1 },
    eig: { options: ['on', 'off'], default: 'on' },
  },
  render(s, sim) {
    const t = sim.t;
    const A = [[s.a, s.b], [s.c, s.d]];
    const M = M2.lerpI(A, s.t); // 그림과 숫자는 모두 지금 보이는 행렬 기준
    const e = M2.eigen(M);

    $('mat').innerHTML = [[0, 0, 'c1'], [0, 1, 'c2'], [1, 0, 'c1'], [1, 1, 'c2']]
      .map(([i, j, c]) => '<span class="' + c + '">' + fmt2(M[i][j]) + '</span>').join('');
    $('t-note').textContent = s.t < 1 ? t('tNote', { t: fmt2(s.t) }) : '';

    const dt = M2.det(M);
    $('det').textContent = fmt2(dt);
    $('det-note').textContent = Math.abs(dt) < 1e-9 ? t('detZero') : t(dt > 0 ? 'detPos' : 'detNeg', { x: fmt2(Math.abs(dt)) });

    let vals, vecs, sum, prod;
    if (e.type === 'distinct') {
      vals = t('eigDistinct', { l1: fmt2(e.values[0]), l2: fmt2(e.values[1]) });
      vecs = t('eigDistinctVec', { v1: dirLabel(e.vectors[0]), v2: dirLabel(e.vectors[1]) });
      sum = e.values[0] + e.values[1]; prod = e.values[0] * e.values[1];
    } else if (e.type === 'complex') {
      vals = t('eigComplex', { re: fmt2(e.re), im: fmt2(e.im) });
      vecs = t('eigComplexVec');
      sum = 2 * e.re; prod = e.re * e.re + e.im * e.im;
    } else {
      const l = e.values[0];
      vals = t(e.type === 'defective' ? 'eigDefective' : 'eigScalar', { l: fmt2(l) });
      vecs = e.type === 'defective' ? t('eigDefectiveVec', { v: dirLabel(e.vectors[0]) }) : t('eigScalarVec');
      sum = 2 * l; prod = l * l;
    }
    $('eig').textContent = vals;
    $('eig-vec').textContent = vecs;
    $('relation').textContent = t('relation', { sum: fmt2(sum), prod: fmt2(prod) });

    drawPlane(s, sim, M, e);
  },
});

/* 재생: t를 0 → 1로 */
let anim = 0;
function stopPlay() { cancelAnimationFrame(anim); anim = 0; }
$('play').addEventListener('click', () => {
  stopPlay();
  const start = performance.now(), D = 1800;
  const step = (now) => {
    const u = Math.min(1, (now - start) / D);
    sim.set({ t: Math.round(u * u * (3 - 2 * u) * 100) / 100 }); // 처음과 끝을 부드럽게
    anim = u < 1 ? requestAnimationFrame(step) : 0;
  };
  anim = requestAnimationFrame(step);
});
$('t').addEventListener('input', stopPlay);

/* 무작위 행렬: 시드로 정해짐 */
$('random').addEventListener('click', () => {
  stopPlay();
  const seed = EduSim.newSeed(sim.state.seed);
  const R = M2.randomMatrix(seed);
  sim.set({ seed, a: R[0][0], b: R[0][1], c: R[1][0], d: R[1][1], t: 1 });
});

/* 끝점 끌기 */
EduSim.drag($('plane'), {
  pick(px, py) {
    let best = null, bestD = 24;
    for (const k of view.knobs) {
      const d = Math.hypot(px - k.x, py - k.y);
      if (d < bestD) { bestD = d; best = k.id; }
    }
    if (best) { stopPlay(); $('plane').classList.add('dragging'); }
    return best;
  },
  move(id, px, py) {
    const x = (px / view.S) * 2 * L - L, y = L - (py / view.S) * 2 * L;
    const snap = (val, lim) => r1(Math.min(lim, Math.max(-lim, Math.round(val / SNAP) * SNAP)));
    if (id === 'v') sim.set({ vx: snap(x, 4), vy: snap(y, 4) });
    else if (id === 'e1') sim.set({ a: snap(x, 3), c: snap(y, 3), t: 1 });
    else sim.set({ b: snap(x, 3), d: snap(y, 3), t: 1 });
  },
  end() { $('plane').classList.remove('dragging'); },
});
