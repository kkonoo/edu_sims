// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '2×2 행렬과 고유벡터',
    question: '행렬을 곱하면 평면은 어떻게 바뀔까? 방향이 그대로인 벡터는?',

    matrixHead: '행렬 A',
    presetHead: '프리셋',
    pIdentity: '단위',
    pRotate: '회전 30°',
    pStretch: '늘이기',
    pScale: '확대',
    pShear: '전단',
    pReflect: '반사',
    pProject: '투영',
    pSymmetric: '대칭행렬',
    random: '🎲 무작위 행렬',
    t: '변형 정도 t',
    play: '▶ 재생',
    showEig: '고유벡터 보기',
    dragHint: '그림에서 Ae₁, Ae₂, v의 끝점을 끌 수 있어요.',

    shownMatrix: '지금 보이는 행렬',
    tNote: 't = {t}: (1 − t)I + tA',
    detLabel: 'det',
    detPos: '넓이 {x}배',
    detNeg: '넓이 {x}배, 방향이 뒤집힘',
    detZero: '넓이 0 — 평면이 직선이나 점으로 납작해짐',
    eigLabel: '고유값',
    eigDistinct: 'λ₁ = {l1}, λ₂ = {l2}',
    eigDistinctVec: '고유벡터 방향 {v1}, {v2}',
    eigDefective: 'λ = {l} (중근)',
    eigDefectiveVec: '고유벡터 방향은 {v} 하나뿐',
    eigScalar: 'λ = {l} (중근)',
    eigScalarVec: '모든 방향이 고유벡터 (A = λI)',
    eigComplex: '{re} ± {im}i',
    eigComplexVec: '실수 고유벡터 없음 — 회전이 섞여 있음',
    relation: 'λ₁ + λ₂ = {sum} = tr A,   λ₁ · λ₂ = {prod} = det A',

    figTitle: '평면의 변형',
    legendGrid: '변형된 격자',
    legendE1: 'Ae₁ (A의 첫째 열)',
    legendE2: 'Ae₂ (A의 둘째 열)',
    legendSquare: '단위정사각형의 상',
    legendEig: '고유벡터 방향',
    legendV: '시험 벡터 v → Av',

    task1: '<b>회전 30°</b>를 눌러 보세요. 고유벡터 선이 사라져요. 왜 어떤 방향도 그대로 남지 않을까요?',
    task2:
      '<b>대칭행렬</b>을 누르고 <b>고유벡터 보기</b>를 끈 뒤, v를 끌어 Av가 v와 같은 방향이 되는 곳을 찾아보세요. ' +
      '찾은 두 방향은 서로 몇 도인가요?',
    task3: '<b>투영</b>을 누르면 격자와 평행사변형은 어떻게 되나요? 고유값 하나는 왜 0일까요?',

    explain:
      '<p><b>행렬의 열은 기저벡터가 가는 곳입니다.</b> A의 첫째 열은 e₁ = (1, 0)이, 둘째 열은 e₂ = (0, 1)이 옮겨 가는 점입니다. ' +
      '다른 모든 점은 v = x e₁ + y e₂ → Av = x Ae₁ + y Ae₂ 로 따라가므로, 격자는 평행하고 간격이 고른 채로 휩니다.</p>' +
      '<p><b>det A</b>는 넓이가 몇 배가 되는지입니다. 단위정사각형이 넓이 |det A|인 평행사변형이 되고, ' +
      'det A가 음수면 앞뒤가 뒤집힙니다. det A = 0이면 평면 전체가 직선(또는 점)으로 납작해져 되돌릴 수 없습니다(역행렬 없음).</p>' +
      '<p><b>고유벡터</b>는 A를 곱해도 방향이 바뀌지 않는 벡터, <b>고유값</b>은 그때 늘어나는 배율입니다: Av = λv. ' +
      '고유값은 det(A − λI) = 0, 곧 λ² − (tr A)λ + det A = 0의 해라서 λ₁ + λ₂ = tr A, λ₁λ₂ = det A 입니다.</p>' +
      '<p>판별식이 음수면 고유값이 복소수가 되고, 실수 평면에서 방향이 그대로인 벡터는 없습니다(회전). ' +
      '중근이어도 전단처럼 고유벡터 방향이 하나뿐일 수 있고, A = λI면 모든 방향이 고유벡터입니다. ' +
      '대칭행렬의 고유벡터는 언제나 서로 수직입니다.</p>' +
      '<p><b>변형 정도 t</b>는 (1 − t)I + tA 를 보여 줍니다. 이 행렬들은 A와 고유벡터가 같고 고유값만 (1 − t) + tλ 로 바뀌므로, ' +
      '재생하는 동안 고유벡터 선 위의 점은 선을 벗어나지 않습니다.</p>',
  },

  en: {
    title: '2×2 matrices and eigenvectors',
    question: 'How does multiplying by a matrix reshape the plane? Which vectors keep their direction?',

    matrixHead: 'Matrix A',
    presetHead: 'Presets',
    pIdentity: 'Identity',
    pRotate: 'Rotate 30°',
    pStretch: 'Stretch',
    pScale: 'Scale',
    pShear: 'Shear',
    pReflect: 'Reflect',
    pProject: 'Project',
    pSymmetric: 'Symmetric',
    random: '🎲 Random matrix',
    t: 'Amount of change t',
    play: '▶ Play',
    showEig: 'Show eigenvectors',
    dragHint: 'Drag the tips of Ae₁, Ae₂ and v in the picture.',

    shownMatrix: 'Matrix shown',
    tNote: 't = {t}: (1 − t)I + tA',
    detLabel: 'det',
    detPos: 'area × {x}',
    detNeg: 'area × {x}, orientation flipped',
    detZero: 'area 0 — the plane collapses to a line or a point',
    eigLabel: 'Eigenvalues',
    eigDistinct: 'λ₁ = {l1}, λ₂ = {l2}',
    eigDistinctVec: 'eigenvector directions {v1}, {v2}',
    eigDefective: 'λ = {l} (repeated)',
    eigDefectiveVec: 'only one eigenvector direction, {v}',
    eigScalar: 'λ = {l} (repeated)',
    eigScalarVec: 'every direction is an eigenvector (A = λI)',
    eigComplex: '{re} ± {im}i',
    eigComplexVec: 'no real eigenvectors — the map includes a rotation',
    relation: 'λ₁ + λ₂ = {sum} = tr A,   λ₁ · λ₂ = {prod} = det A',

    figTitle: 'How the plane changes',
    legendGrid: 'Transformed grid',
    legendE1: 'Ae₁ (1st column of A)',
    legendE2: 'Ae₂ (2nd column of A)',
    legendSquare: 'Image of the unit square',
    legendEig: 'Eigenvector directions',
    legendV: 'Test vector v → Av',

    task1: 'Press <b>Rotate 30°</b>. The eigenvector lines disappear. Why does no direction stay the same?',
    task2:
      'Press <b>Symmetric</b>, turn off <b>Show eigenvectors</b>, and drag v until Av points the same way as v. ' +
      'What is the angle between the two directions you find?',
    task3: 'Press <b>Project</b>. What happens to the grid and the parallelogram? Why is one eigenvalue 0?',

    explain:
      '<p><b>The columns of a matrix are where the basis vectors go.</b> The first column of A is where e₁ = (1, 0) lands, the second where e₂ = (0, 1) lands. ' +
      'Every other point follows, v = x e₁ + y e₂ → Av = x Ae₁ + y Ae₂, so grid lines stay parallel and evenly spaced.</p>' +
      '<p><b>det A</b> is the factor by which areas change. The unit square becomes a parallelogram of area |det A|, ' +
      'and a negative det A flips orientation. If det A = 0 the whole plane collapses to a line (or a point) and cannot be undone (no inverse).</p>' +
      '<p>An <b>eigenvector</b> keeps its direction under A, and its <b>eigenvalue</b> is the stretch factor: Av = λv. ' +
      'Eigenvalues solve det(A − λI) = 0, i.e. λ² − (tr A)λ + det A = 0, so λ₁ + λ₂ = tr A and λ₁λ₂ = det A.</p>' +
      '<p>If the discriminant is negative the eigenvalues are complex and no real direction is kept (a rotation). ' +
      'A repeated eigenvalue can still have just one eigenvector direction, as in a shear; if A = λI every direction is an eigenvector. ' +
      'Eigenvectors of a symmetric matrix are always perpendicular.</p>' +
      '<p><b>Amount of change t</b> shows (1 − t)I + tA. These matrices share A\'s eigenvectors, and only the eigenvalues change to (1 − t) + tλ, ' +
      'so during playback points on an eigenvector line never leave it.</p>',
  },
};
