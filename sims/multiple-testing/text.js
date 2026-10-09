// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '다중검정과 FDR',
    question: '아무 효과가 없는데 왜 "유의한" 유전자가 나올까?',

    m: '검정 수 m',
    pi1: '실제로 효과가 있는 비율 π₁',
    effect: '효과 크기 (z 평균 이동)',
    alphaLabel: '유의수준 α',
    qLabel: 'FDR 목표 q',
    method: '보정 방법',
    none: '보정 없음',
    bonf: 'Bonferroni',
    bh: 'BH',

    statR: '유의 개수',
    statFDR: '관찰 FDR',
    statPower: '검정력',
    statFDRsub: '위양성 / 유의 개수',
    statPowerSub: '진양성 / 실제 효과 있음',

    tableTitle: '판정 결과',
    colSig: '유의',
    colNon: '유의 아님',
    colSum: '합계',
    rowNull: '효과 없음',
    rowAlt: '효과 있음',
    FP: '위양성',
    TN: '진음성',
    TP: '진양성',
    FN: '위음성',

    histTitle: 'p값 히스토그램',
    stack: '겹쳐 쌓기',
    pool: '합쳐 보기',
    legendNull: '효과 없음 (귀무)',
    legendAlt: '효과 있음 (대립)',
    legendPool: '모든 검정 (실제 데이터에선 이것만 보여요)',
    axisP: 'p값',
    axisCount: '검정 수',
    tipBin: 'p {a}–{b}',
    tipCount: '{n}개',

    sortedTitle: '정렬된 p값 (로그-로그 축)',
    axisRank: '순위 i (p값이 작은 순)',
    legendSig: '유의 판정',
    legendNonSig: '유의 아님',
    legendBH: 'BH 기준선 i/m·q',
    legendBonf: 'Bonferroni 기준선 α/m',
    legendAlpha: '보정 없음 기준선 α',
    tipRank: '{i}번째',
    cutLabel: '유의 {n}개',

    task1:
      '<b>π₁ = 0</b>, <b>보정 없음</b>으로 두세요. 효과가 하나도 없는데도 α·m개쯤(기본값이면 약 50개) "유의"하게 나와요. ' +
      '<b>다시 뽑기</b>를 몇 번 눌러 보세요.',
    task2: '<b>m</b>을 100에서 20,000까지 늘려 보세요. Bonferroni의 검정력은 어떻게 되나요? BH는요?',
    task3:
      'p값 히스토그램 왼쪽 끝의 봉우리는 무엇을 뜻할까요? ' +
      '<b>합쳐 보기</b>로 바꾸면 실제 데이터에서 보는 모습이에요.',

    explain:
      '<p><b>효과가 없으면 p값은 0과 1 사이에 고르게 퍼집니다.</b> ' +
      '그래서 효과 없는 검정 m₀개 중 약 α·m₀개는 우연히 p ≤ α가 됩니다. ' +
      '히스토그램의 평평한 바닥이 이것이고, 왼쪽 끝 봉우리는 효과 있는 검정이 만든 것입니다.</p>' +
      '<p><b>Bonferroni</b>는 p ≤ α/m 인 것만 유의로 봅니다. ' +
      '위양성이 하나라도 나올 확률(FWER)을 α 이하로 막지만, m이 커질수록 기준이 아주 엄격해져 검정력이 떨어집니다.</p>' +
      '<p><b>Benjamini–Hochberg(BH)</b>는 p값을 작은 순서로 p<sub>(1)</sub> ≤ … ≤ p<sub>(m)</sub> 로 놓고, ' +
      'p<sub>(i)</sub> ≤ i/m·q 를 만족하는 가장 큰 i까지 모두 유의로 봅니다. ' +
      '정렬된 p값 그래프에서 점이 BH 기준선 아래에 있는 마지막 순위가 그 경계입니다. ' +
      '"유의" 중 위양성의 비율(FDR)의 기댓값을 q 이하로 맞춥니다.</p>' +
      '<p><b>관찰 FDR</b>은 이번 한 번의 결과에서 위양성 / 유의 개수입니다. ' +
      'FDR은 이 값의 평균이라서, 한 번의 결과는 q보다 클 수도 있습니다.</p>' +
      '<p>이 시뮬레이션에서 검정통계량은 효과가 없으면 z ~ N(0, 1), 있으면 z ~ N(효과 크기, 1)이고, ' +
      'p값은 양측 p = 2·(1 − Φ(|z|)) 입니다.</p>',
  },

  en: {
    title: 'Multiple testing and FDR',
    question: 'Why do "significant" genes show up when nothing is going on?',

    m: 'Number of tests m',
    pi1: 'Fraction with a real effect π₁',
    effect: 'Effect size (shift in mean z)',
    alphaLabel: 'Significance level α',
    qLabel: 'Target FDR q',
    method: 'Correction',
    none: 'None',
    bonf: 'Bonferroni',
    bh: 'BH',

    statR: 'Significant',
    statFDR: 'Observed FDR',
    statPower: 'Power',
    statFDRsub: 'false pos. / significant',
    statPowerSub: 'true pos. / real effects',

    tableTitle: 'Outcomes',
    colSig: 'Sig.',
    colNon: 'Not sig.',
    colSum: 'Total',
    rowNull: 'No effect',
    rowAlt: 'Real effect',
    FP: 'False pos.',
    TN: 'True neg.',
    TP: 'True pos.',
    FN: 'False neg.',

    histTitle: 'Histogram of p-values',
    stack: 'Stacked',
    pool: 'Pooled',
    legendNull: 'No effect (null)',
    legendAlt: 'Real effect (alternative)',
    legendPool: 'All tests (all you see in real data)',
    axisP: 'p-value',
    axisCount: 'Tests',
    tipBin: 'p {a}–{b}',
    tipCount: '{n} tests',

    sortedTitle: 'Sorted p-values (log–log axes)',
    axisRank: 'Rank i (smallest p first)',
    legendSig: 'Called significant',
    legendNonSig: 'Not significant',
    legendBH: 'BH line i/m·q',
    legendBonf: 'Bonferroni line α/m',
    legendAlpha: 'Uncorrected line α',
    tipRank: 'rank {i}',
    cutLabel: '{n} significant',

    task1:
      'Set <b>π₁ = 0</b> and <b>None</b>. With no real effects at all, about α·m tests (about 50 at the defaults) ' +
      'still come out "significant". Press <b>New draw</b> a few times.',
    task2: 'Increase <b>m</b> from 100 to 20,000. What happens to the power of Bonferroni? And BH?',
    task3:
      'What does the spike at the left end of the p-value histogram mean? ' +
      'Switch to <b>Pooled</b> to see what real data look like.',

    explain:
      '<p><b>When there is no effect, p-values are spread evenly between 0 and 1.</b> ' +
      'So about α·m₀ of the m₀ null tests land at p ≤ α by chance. ' +
      'That is the flat floor of the histogram; the spike at the left end comes from the tests with real effects.</p>' +
      '<p><b>Bonferroni</b> calls a test significant only if p ≤ α/m. ' +
      'It keeps the chance of even one false positive (FWER) at or below α, but as m grows the cutoff becomes very strict and power drops.</p>' +
      '<p><b>Benjamini–Hochberg (BH)</b> sorts the p-values p<sub>(1)</sub> ≤ … ≤ p<sub>(m)</sub> ' +
      'and calls significant everything up to the largest i with p<sub>(i)</sub> ≤ i/m·q. ' +
      'In the sorted p-value plot, that boundary is the last rank where a point sits below the BH line. ' +
      'It keeps the expected share of false positives among the "significant" ones (the FDR) at or below q.</p>' +
      '<p><b>Observed FDR</b> is false positives / significant in this one run. ' +
      'The FDR is the average of this quantity, so a single run can exceed q.</p>' +
      '<p>In this simulation the test statistic is z ~ N(0, 1) without an effect and z ~ N(effect size, 1) with one; ' +
      'the p-value is two-sided, p = 2·(1 − Φ(|z|)).</p>',
  },
};
