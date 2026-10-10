// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: 'Ridge와 Lasso: λ와 수축',
    question: 'λ를 키우면 계수는 어떻게 줄어들까? 왜 Lasso만 정확히 0이 될까?',
    context: '예측변수 12개 중 진짜 효과가 있는 것은 x₁, x₂, x₃ 세 개뿐이고, 나머지 9개는 잡음입니다. 학습 데이터 40개, 테스트 데이터 1,000개.',

    method: '방법',
    loglam: 'λ (벌점의 세기)',
    rho: '예측변수끼리의 상관 ρ',
    showTruth: '참값 표시',
    coefHead: '지금 계수',
    truthOf: '참 {v}',
    noiseGroup: '잡음 변수 x₄–x₁₂',

    statNonzero: '0이 아닌 계수',
    statTest: '테스트 오차 (MSE)',
    statBest: '테스트 오차가 가장 낮은 λ',

    pathTitle: '① 계수 경로',
    axisLam: 'λ (로그 눈금)',
    axisCoef: '계수',
    legendSignal: '진짜 효과 x₁, x₂, x₃',
    legendNoise: '잡음 변수 9개',
    legendTruthLine: '참값',
    legendNow: '지금 λ',
    olsEnd: '← 최소제곱(OLS)',

    errTitle: '② 오차',
    axisMse: '평균제곱오차',
    legendTrain: '학습 데이터',
    legendTest: '테스트 데이터',
    bestLabel: '최소',

    geoTitle: '③ 두 변수일 때의 그림',
    geoNote: 'x₁, x₂ 두 변수만 있는 데이터(같은 λ, 같은 ρ)로 그린 계수 평면입니다.',
    axisB1: 'β₁',
    axisB2: 'β₂',
    legendOls: '최소제곱 해',
    legendContour: '오차(RSS) 등고선',
    legendRegionL1: 'Lasso 제약 |β₁| + |β₂| ≤ t',
    legendRegionL2: 'Ridge 제약 β₁² + β₂² ≤ t²',
    legendSol: '지금 해',

    priorCap: '지금 λ에 해당하는 사전분포: Ridge = 정규분포, Lasso = 라플라스분포 (σ = 1.5, n = 40)',
    priorRidge: 'Ridge: 정규 N(0, τ²)',
    priorLasso: 'Lasso: 라플라스 (b)',
    axisPrior: 'β',

    task1: '<b>Lasso</b>에서 λ를 아주 작은 값부터 키워 보세요. 어떤 계수가 먼저 0이 되나요? 회색(잡음) 변수인가요?',
    task2:
      '<b>Ridge</b>로 바꿔 같은 일을 해 보세요. 계수가 정확히 0이 되나요? ' +
      '③ 그림에서 이유를 찾아보세요 (원과 마름모의 모양).',
    task3:
      '② 그림에서 테스트 오차가 가장 낮은 λ는 어디인가요? ρ를 0.9로 올리면 Lasso가 고르는 변수와 테스트 오차는 어떻게 달라지나요?',

    explain:
      '<p><b>왜 벌점을 주나</b>: 예측변수가 많고 데이터가 적으면 최소제곱(OLS)은 잡음까지 따라가 계수가 크게 흔들립니다(분산이 큼). ' +
      '계수가 커지는 것에 벌점을 주면 계수가 0 쪽으로 <b>수축</b>되어, 편향은 조금 생기지만 분산이 크게 줄어 새 데이터에서의 오차(테스트 오차)가 줄 수 있습니다. ' +
      '② 그림의 U자 모양이 이 균형입니다. 실제로는 테스트 데이터 대신 교차검증으로 λ를 고릅니다.</p>' +
      '<p><b>Ridge</b>는 (1/2n)·RSS + (λ/2)·Σβⱼ², <b>Lasso</b>는 (1/2n)·RSS + λ·Σ|βⱼ| 를 최소로 합니다(glmnet과 같은 꼴, 예측변수는 표준화). ' +
      'Ridge는 모든 계수를 비례적으로 줄이지만 정확히 0으로 만들지는 않고, Lasso는 작은 계수를 정확히 0으로 만들어 <b>변수선택</b>을 합니다. ' +
      'λ가 λ_max = maxⱼ |xⱼᵀy|/n 이상이면 Lasso의 계수는 모두 0입니다.</p>' +
      '<p><b>제약으로 보기</b>: 같은 문제를 "RSS를 최소로, 단 Σβⱼ² ≤ t² (Ridge) 또는 Σ|βⱼ| ≤ t (Lasso)"로 쓸 수 있습니다. ' +
      '③ 그림에서 해는 RSS 등고선(타원)이 제약 영역에 처음 닿는 점입니다. 원에는 모서리가 없어 축 위에서 닿는 일이 드물지만, ' +
      '마름모는 꼭짓점이 축 위에 있어서 그곳에서 먼저 닿기 쉽고, 그러면 한 계수가 정확히 0이 됩니다.</p>' +
      '<p><b>사전분포로 보기 (베이즈)</b>: 잡음이 정규분포일 때 Ridge의 해는 βⱼ ~ N(0, τ²), τ² = σ²/(nλ) 사전분포의 사후 최빈값(MAP)이고, ' +
      'Lasso의 해는 βⱼ ~ 라플라스(0, b), b = σ²/(nλ) 사전분포의 MAP입니다. 라플라스분포는 0에서 뾰족해서 MAP가 정확히 0에 떨어질 수 있습니다. ' +
      'λ가 클수록 사전분포가 0 근처로 좁아져 "계수는 작을 것"이라는 믿음이 강해집니다.</p>',
  },

  en: {
    title: 'Ridge and Lasso: λ and shrinkage',
    question: 'What happens to the coefficients as λ grows? Why does only Lasso set some exactly to 0?',
    context: 'Of 12 predictors only x₁, x₂, x₃ have a real effect; the other 9 are noise. 40 training and 1,000 test observations.',

    method: 'Method',
    loglam: 'λ (penalty strength)',
    rho: 'Correlation between predictors ρ',
    showTruth: 'Show true values',
    coefHead: 'Current coefficients',
    truthOf: 'true {v}',
    noiseGroup: 'Noise variables x₄–x₁₂',

    statNonzero: 'Non-zero coefficients',
    statTest: 'Test error (MSE)',
    statBest: 'λ with the lowest test error',

    pathTitle: '① Coefficient paths',
    axisLam: 'λ (log scale)',
    axisCoef: 'Coefficient',
    legendSignal: 'Real effects x₁, x₂, x₃',
    legendNoise: '9 noise variables',
    legendTruthLine: 'True value',
    legendNow: 'Current λ',
    olsEnd: '← least squares (OLS)',

    errTitle: '② Error',
    axisMse: 'Mean squared error',
    legendTrain: 'Training data',
    legendTest: 'Test data',
    bestLabel: 'min',

    geoTitle: '③ The picture with two variables',
    geoNote: 'Coefficient plane for data with only x₁ and x₂ (same λ, same ρ).',
    axisB1: 'β₁',
    axisB2: 'β₂',
    legendOls: 'Least squares solution',
    legendContour: 'Error (RSS) contours',
    legendRegionL1: 'Lasso constraint |β₁| + |β₂| ≤ t',
    legendRegionL2: 'Ridge constraint β₁² + β₂² ≤ t²',
    legendSol: 'Current solution',

    priorCap: 'Prior matching the current λ: Ridge = normal, Lasso = Laplace (σ = 1.5, n = 40)',
    priorRidge: 'Ridge: normal N(0, τ²)',
    priorLasso: 'Lasso: Laplace (b)',
    axisPrior: 'β',

    task1: 'With <b>Lasso</b>, increase λ from a very small value. Which coefficients hit 0 first? Are they the grey (noise) variables?',
    task2:
      'Switch to <b>Ridge</b> and do the same. Does any coefficient become exactly 0? ' +
      'Look for the reason in plot ③ (the shapes of the circle and the diamond).',
    task3:
      'In plot ②, where is the λ with the lowest test error? If you raise ρ to 0.9, how do the variables Lasso picks and the test error change?',

    explain:
      '<p><b>Why penalize?</b> With many predictors and little data, least squares (OLS) chases the noise and its coefficients swing widely (high variance). ' +
      'Penalizing large coefficients <b>shrinks</b> them toward 0: a little bias, much less variance, and possibly lower error on new data (test error). ' +
      'The U shape in plot ② is that trade-off. In practice λ is chosen by cross-validation rather than with a test set.</p>' +
      '<p><b>Ridge</b> minimizes (1/2n)·RSS + (λ/2)·Σβⱼ², <b>Lasso</b> minimizes (1/2n)·RSS + λ·Σ|βⱼ| (the glmnet form, with standardized predictors). ' +
      'Ridge shrinks all coefficients proportionally but never exactly to 0; Lasso sets small coefficients exactly to 0, which is <b>variable selection</b>. ' +
      'For λ ≥ λ_max = maxⱼ |xⱼᵀy|/n every Lasso coefficient is 0.</p>' +
      '<p><b>As a constraint</b>: the same problem can be written as "minimize RSS subject to Σβⱼ² ≤ t² (Ridge) or Σ|βⱼ| ≤ t (Lasso)". ' +
      'In plot ③ the solution is where an RSS contour (ellipse) first touches the constraint region. A circle has no corners, so it rarely touches on an axis; ' +
      'a diamond has its corners on the axes, so it often touches there first — and then one coefficient is exactly 0.</p>' +
      '<p><b>As a prior (Bayes)</b>: with normal noise, the Ridge solution is the posterior mode (MAP) under βⱼ ~ N(0, τ²) with τ² = σ²/(nλ), ' +
      'and the Lasso solution is the MAP under βⱼ ~ Laplace(0, b) with b = σ²/(nλ). The Laplace density has a sharp peak at 0, so the MAP can land exactly on 0. ' +
      'A larger λ means a narrower prior around 0: a stronger belief that coefficients are small.</p>',
  },
};
