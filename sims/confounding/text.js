// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '교란변수와 배치효과',
    question: '전체로 보면 반대인데, 나눠 보면? 배치가 결론을 뒤집을 수 있을까?',

    modeHead: '상황',
    modeCont: '연속 x (Simpson)',
    modeTreat: '처리 vs 대조 (배치효과)',
    contNote: '배치 3개 × 20개. 배치마다 x의 평균이 옮겨지고(교란), 배치마다 y도 γ씩 달라집니다.',
    treatNote: '배치 2개 × 20개, 전체 처리·대조는 반반. 배치 1에 처리군을 몰수록 처리와 배치가 겹칩니다.',
    bc: '진짜 효과 β (배치 안에서의 기울기)',
    gc: '배치 효과 γ (배치마다 y가 달라지는 양)',
    shift: '교란 강도 (배치마다 x 평균이 옮겨지는 양)',
    bt: '진짜 처리 효과 β',
    gt: '배치 효과 γ (배치 2의 y가 높은 양)',
    frac: '배치 1에서 처리군 비율',
    showBatch: '배치 정보 보기',

    forestTitle: '추정 비교 (95% 신뢰구간)',
    naive: '배치 무시: y ~ x',
    adj: '배치 보정: y ~ x + 배치',
    naiveT: '배치 무시: y ~ 처리',
    adjT: '배치 보정: y ~ 처리 + 배치',
    truth: '참값 β',
    sig: '유의',
    notSig: '유의 아님',
    cannot: '구분할 수 없음 — 처리와 배치가 완전히 겹침',
    axisEst: '효과 추정값',

    scatterTitle: '산점도',
    dotTitle: '집단별 값',
    batchN: '배치 {k}',
    allPoints: '모든 점 (배치 모름)',
    legendNaive: '전체 회귀선 (배치 무시)',
    legendAdj: '배치별 평행선 (배치 보정)',
    legendGroupMean: '집단 평균 (배치 무시)',
    legendCellMean: '배치 안 집단 평균',
    control: '대조',
    treated: '처리',
    designTitle: '설계표 (표본 수)',

    task1:
      '<b>연속 x</b>에서 <b>배치 정보 보기</b>를 끄고 기울기 방향을 예상해 보세요. 그다음 켜 보세요. 배치 안에서의 기울기는요?',
    task2: '<b>교란 강도</b>를 0으로 내려 보세요. 두 추정이 어떻게 되나요? 배치가 x와 관련이 없으면 무시해도 괜찮은 이유는?',
    task3:
      '<b>처리 vs 대조</b>에서 진짜 처리 효과를 0으로 두고, 배치 1의 처리군 비율을 50%에서 100%까지 올려 보세요. ' +
      '배치를 무시한 추정은 어떻게 되나요? 100%에서는 왜 보정할 수 없을까요?',

    explain:
      '<p><b>교란변수</b>는 원인 x와 결과 y 모두와 관련된 제3의 변수입니다. 여기서는 배치(실험 날짜, 장비, 시약 로트 등)가 x와 y를 함께 움직입니다. ' +
      '배치를 모른 채 y를 x에 회귀하면 배치의 효과까지 x의 효과로 잘못 계산됩니다.</p>' +
      '<p>그 오차의 크기가 <b>누락변수 편향</b>입니다: 배치를 뺀 기울기의 기댓값은 β + γ·Σ(x − x̄)(g − ḡ)/Σ(x − x̄)² (g는 배치 번호). ' +
      '배치가 x와 무관하면(교란 강도 0) 둘째 항이 0이 되어 무시해도 편향이 없고, γ와 교란이 크면 부호까지 뒤집힐 수 있습니다. ' +
      '전체 경향과 집단 안 경향이 반대인 이 현상을 <b>Simpson 역설</b>이라고 합니다.</p>' +
      '<p><b>보정</b>은 회귀식에 배치를 공변량(더미 변수)으로 넣는 것입니다: y ~ x + 배치. 그러면 x의 계수는 "같은 배치 안에서" 비교한 값이 됩니다(그림의 평행선).</p>' +
      '<p>하지만 보정은 설계를 대신하지 못합니다. 처리군이 한 배치에만 있으면(100%) 처리 효과와 배치 효과가 수학적으로 똑같은 열이 되어 ' +
      '어떤 분석으로도 나눌 수 없습니다. R의 lm은 이때 한 열을 NA로 버리고, 남은 계수에 배치 효과가 섞여 나옵니다. ' +
      '그래서 실험은 처음부터 배치마다 처리·대조를 고르게 나누고(블록화), 배치 안에서는 무작위로 배정합니다. ' +
      '균형이 맞으면(50%) 배치를 무시해도 편향은 없지만, 보정하면 배치 차이만큼의 잡음이 빠져 신뢰구간이 좁아집니다.</p>',
  },

  en: {
    title: 'Confounding and batch effects',
    question: 'The overall trend points one way, but within groups? Can batches flip the conclusion?',

    modeHead: 'Setting',
    modeCont: 'Continuous x (Simpson)',
    modeTreat: 'Treatment vs control (batch effect)',
    contNote: '3 batches × 20. Each batch shifts the mean of x (confounding) and also shifts y by γ.',
    treatNote: '2 batches × 20, half treated overall. Putting more treated samples in batch 1 makes treatment and batch overlap.',
    bc: 'True effect β (slope within a batch)',
    gc: 'Batch effect γ (shift in y per batch)',
    shift: 'Confounding (shift in mean x per batch)',
    bt: 'True treatment effect β',
    gt: 'Batch effect γ (how much higher y is in batch 2)',
    frac: 'Share of treated samples in batch 1',
    showBatch: 'Show batch',

    forestTitle: 'Estimates compared (95% confidence intervals)',
    naive: 'Ignoring batch: y ~ x',
    adj: 'Adjusting for batch: y ~ x + batch',
    naiveT: 'Ignoring batch: y ~ treatment',
    adjT: 'Adjusting for batch: y ~ treatment + batch',
    truth: 'True β',
    sig: 'significant',
    notSig: 'not significant',
    cannot: 'Not identifiable — treatment and batch coincide',
    axisEst: 'Estimated effect',

    scatterTitle: 'Scatter plot',
    dotTitle: 'Values by group',
    batchN: 'Batch {k}',
    allPoints: 'All points (batch unknown)',
    legendNaive: 'Overall line (ignoring batch)',
    legendAdj: 'Parallel lines per batch (adjusted)',
    legendGroupMean: 'Group mean (ignoring batch)',
    legendCellMean: 'Group mean within batch',
    control: 'Control',
    treated: 'Treated',
    designTitle: 'Design table (sample counts)',

    task1:
      'In <b>Continuous x</b>, turn off <b>Show batch</b> and guess the direction of the slope. Then turn it on. What is the slope within each batch?',
    task2: 'Lower <b>Confounding</b> to 0. What happens to the two estimates? Why is it fine to ignore batch when batch is unrelated to x?',
    task3:
      'In <b>Treatment vs control</b>, set the true treatment effect to 0 and raise the share of treated samples in batch 1 from 50% to 100%. ' +
      'What happens to the estimate that ignores batch? Why can\'t it be adjusted at 100%?',

    explain:
      '<p>A <b>confounder</b> is a third variable related to both the cause x and the outcome y. Here the batch (run date, instrument, reagent lot…) moves x and y together. ' +
      'Regressing y on x without knowing the batch credits the batch\'s effect to x.</p>' +
      '<p>The size of that error is the <b>omitted-variable bias</b>: without batch, the expected slope is β + γ·Σ(x − x̄)(g − ḡ)/Σ(x − x̄)² (g = batch number). ' +
      'If batch is unrelated to x (confounding 0) the second term vanishes and ignoring batch is unbiased; with large γ and confounding the sign can even flip. ' +
      'An overall trend opposite to the within-group trend is <b>Simpson\'s paradox</b>.</p>' +
      '<p><b>Adjusting</b> means adding batch as a covariate (dummy variables): y ~ x + batch. The coefficient of x then compares samples <i>within the same batch</i> (the parallel lines).</p>' +
      '<p>Adjustment cannot replace design. If all treated samples sit in one batch (100%), treatment and batch become identical columns and no analysis can separate them. ' +
      'R\'s lm then drops one column as NA, and the remaining coefficient silently includes the batch effect. ' +
      'That is why experiments split treatment and control evenly within each batch (blocking) and randomize within batches. ' +
      'With balance (50%), ignoring batch is unbiased, but adjusting removes the batch-to-batch noise and narrows the interval.</p>',
  },
};
