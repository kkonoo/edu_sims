// 2×2 행렬 계산 — 화면(DOM)과 무관한 순수 함수만. test.html도 이 파일을 그대로 불러 검사합니다.
// 행렬은 [[a, b], [c, d]] 꼴 (행 우선). 난수는 shared/sim.js의 EduSim.rng를 씁니다.
const M2 = (function () {
  'use strict';

  const EPS = 1e-9;

  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const trace = (A) => A[0][0] + A[1][1];
  const apply = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];

  // (1 − t)I + tA: t = 0이면 단위행렬, t = 1이면 A. A와 고유벡터가 같고 고유값은 (1 − t) + tλ
  function lerpI(A, t) {
    return [[1 - t + t * A[0][0], t * A[0][1]], [t * A[1][0], 1 - t + t * A[1][1]]];
  }

  // 부호 통일: 첫 성분이 양수 (0이면 둘째 성분이 양수)
  function canon(v) {
    const r = Math.hypot(v[0], v[1]);
    let u = [v[0] / r, v[1] / r];
    if (u[0] < -EPS || (Math.abs(u[0]) <= EPS && u[1] < 0)) u = [-u[0], -u[1]];
    return u;
  }

  // (A − λI)v = 0 의 방향: 두 행 중 큰 쪽에 수직인 벡터 (수치적으로 안정). 두 행이 모두 0이면(A = λI) null
  function nullDir(A, lam) {
    const r1 = [A[0][0] - lam, A[0][1]], r2 = [A[1][0], A[1][1] - lam];
    const r = Math.hypot(r1[0], r1[1]) >= Math.hypot(r2[0], r2[1]) ? r1 : r2;
    const scale = Math.max(1, Math.abs(A[0][0]), Math.abs(A[0][1]), Math.abs(A[1][0]), Math.abs(A[1][1]));
    if (Math.hypot(r[0], r[1]) <= 1e-7 * scale) return null;
    return canon([-r[1], r[0]]);
  }

  // 고유값·고유벡터. 경우를 나눠 돌려줌
  //   distinct  서로 다른 실수 고유값 둘 (큰 것부터)과 고유벡터 둘
  //   defective 중근인데 고유벡터 방향이 하나뿐 (예: 전단)
  //   scalar    A = λI: 모든 방향이 고유벡터
  //   complex   re ± i·im: 실수 고유벡터 없음
  function eigen(A) {
    const tr = trace(A), dt = det(A);
    const disc = (tr * tr) / 4 - dt;
    const scale = Math.max(1, (tr * tr) / 4, Math.abs(dt));
    if (disc < -EPS * scale) return { type: 'complex', re: tr / 2, im: Math.sqrt(-disc) };
    if (disc <= EPS * scale) {
      const lam = tr / 2;
      const v = nullDir(A, lam);
      return v ? { type: 'defective', values: [lam], vectors: [v] } : { type: 'scalar', values: [lam] };
    }
    // 큰 쪽은 상쇄 없이, 작은 쪽은 λ₁λ₂ = det로 (λ₂가 0에 가까울 때도 정확)
    const s = Math.sqrt(disc);
    const big = tr >= 0 ? tr / 2 + s : tr / 2 - s;
    const small = dt / big;
    const l1 = Math.max(big, small), l2 = Math.min(big, small);
    return { type: 'distinct', values: [l1, l2], vectors: [nullDir(A, l1), nullDir(A, l2)] };
  }

  // v와 Av가 같은 직선 위면(각도 차 약 1° 이내) Av = λv의 λ, 아니면 null
  function eigenRatio(A, v) {
    const nv = Math.hypot(v[0], v[1]);
    if (nv < 1e-9) return null;
    const w = apply(A, v);
    const nw = Math.hypot(w[0], w[1]);
    if (nw < 1e-9 * nv) return 0;
    const sin = Math.abs(v[0] * w[1] - v[1] * w[0]) / (nv * nw);
    return sin < 0.02 ? (v[0] * w[0] + v[1] * w[1]) / (v[0] * v[0] + v[1] * v[1]) : null;
  }

  // 시드로 정해지는 연습용 행렬: 성분은 −2, −1.5, …, 2 중에서 (영행렬은 다시 뽑음)
  function randomMatrix(seed) {
    const rng = EduSim.rng(seed);
    const pick = () => (Math.floor(rng.uniform() * 9) - 4) / 2;
    let A;
    do A = [[pick(), pick()], [pick(), pick()]]; while (A[0][0] === 0 && A[0][1] === 0 && A[1][0] === 0 && A[1][1] === 0);
    return A;
  }

  // 다각형 넓이 (신발끈 공식, 꼭짓점이 반시계면 양수)
  function polygonArea(pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      s += x1 * y2 - x2 * y1;
    }
    return s / 2;
  }

  return { det, trace, apply, lerpI, eigen, eigenRatio, randomMatrix, polygonArea };
})();
