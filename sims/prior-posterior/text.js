// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '사전분포 × 가능도 → 사후분포',
    question: '데이터를 보면 믿음은 어떻게 바뀔까?',
    context: '예: 새 치료의 반응률 θ',

    priorHead: '사전분포',
    m0: '사전 평균',
    s0: '사전 강도 a+b (가상의 관측 수)',
    uniform: '균등 Beta(1, 1)',
    jeffreys: 'Jeffreys Beta(½, ½)',
    dataHead: '데이터',
    draw: '뽑기',
    input: '직접 입력',
    theta: '참 반응률 θ*',
    ndraw: '시행 수 n',
    n: '시행 수 n',
    k: '반응 수 k',
    observed: '관측: {n}명 중 {k}명 반응',
    noData: '아직 관측 없음',

    statMean: '사후 평균',
    statCI: '95% 신용구간',
    statPost: '사후분포',

    figTitle: 'θ에 대한 분포',
    axisTheta: '반응률 θ',
    axisDensity: '밀도',
    legendPrior: '사전분포',
    legendLik: '가능도 (넓이 1로 맞춤)',
    legendPost: '사후분포',
    legendCI: '95% 신용구간',
    legendTrue: '참 θ*',
    tipTheta: 'θ = {x}',

    weightTitle: '사후 평균은 가중평균',
    priorMean: '사전 평균',
    sampleProp: '표본 비율',
    weightPrior: '사전 {p}',
    weightData: '데이터 {p}',

    task1:
      '<b>뽑기</b>에서 <b>균등</b> 사전분포로 두고 <b>시행 수 n</b>을 0부터 200까지 늘려 보세요. ' +
      '사후분포는 어디로 모이고, 폭은 어떻게 변하나요?',
    task2:
      '사전 평균을 0.2, 사전 강도를 50으로 둔 뒤 n을 늘려 보세요. 사전 믿음은 데이터를 언제까지 "버티나요"? ' +
      '아래 막대의 사전 비중을 보세요.',
    task3:
      '<b>직접 입력</b>으로 바꿔 10명 중 7명이 반응했다고 두세요. 사전 강도만 바꾸면 사후 평균은 어느 두 값 사이를 움직이나요?',

    explain:
      '<p><b>베이즈 정리</b>: 사후분포 ∝ 사전분포 × 가능도. 데이터를 보기 전의 믿음(사전)에 ' +
      '데이터가 그 θ에서 나올 가능성(가능도)을 곱하고, 넓이가 1이 되게 맞추면 데이터를 본 뒤의 믿음(사후)이 됩니다.</p>' +
      '<p>반응률 θ의 사전분포가 <b>Beta(a, b)</b>이고 n명 중 k명이 반응하면, 사후분포는 다시 Beta 분포 ' +
      '<b>Beta(a + k, b + n − k)</b>가 됩니다. 이렇게 사후가 사전과 같은 꼴이 되는 사전분포를 <b>켤레 사전분포</b>라고 합니다.</p>' +
      '<p>그래서 a와 b는 "미리 본 가상의 환자"로 읽을 수 있습니다: a명 반응, b명 무반응. ' +
      '<b>사전 강도</b> a + b가 클수록 데이터가 사전을 움직이기 어렵습니다.</p>' +
      '<p>사후 평균 (a + k)/(a + b + n) 은 사전 평균 a/(a + b)와 표본 비율 k/n의 가중평균이고, ' +
      '사전의 비중은 w = (a + b)/(a + b + n) 입니다. n이 커지면 w는 0에 가까워져 데이터가 결론을 정합니다.</p>' +
      '<p><b>95% 신용구간</b>은 사후분포의 2.5%와 97.5% 분위수 사이입니다. ' +
      '"이 데이터를 본 뒤 θ가 이 구간에 있을 확률이 95%"라고 읽습니다.</p>' +
      '<p>점선 가능도 곡선은 넓이가 1이 되게 맞춘 것으로, 균등 사전분포 Beta(1, 1)을 썼을 때의 사후분포 Beta(k + 1, n − k + 1)과 같습니다.</p>',
  },

  en: {
    title: 'Prior × likelihood → posterior',
    question: 'How does what we believe change once we see data?',
    context: 'e.g. the response rate θ of a new treatment',

    priorHead: 'Prior',
    m0: 'Prior mean',
    s0: 'Prior strength a+b (pseudo-observations)',
    uniform: 'Uniform Beta(1, 1)',
    jeffreys: 'Jeffreys Beta(½, ½)',
    dataHead: 'Data',
    draw: 'Simulate',
    input: 'Enter',
    theta: 'True response rate θ*',
    ndraw: 'Trials n',
    n: 'Trials n',
    k: 'Responders k',
    observed: 'Observed: {k} of {n} responded',
    noData: 'No observations yet',

    statMean: 'Posterior mean',
    statCI: '95% credible interval',
    statPost: 'Posterior',

    figTitle: 'Distributions for θ',
    axisTheta: 'Response rate θ',
    axisDensity: 'Density',
    legendPrior: 'Prior',
    legendLik: 'Likelihood (scaled to area 1)',
    legendPost: 'Posterior',
    legendCI: '95% credible interval',
    legendTrue: 'True θ*',
    tipTheta: 'θ = {x}',

    weightTitle: 'The posterior mean is a weighted average',
    priorMean: 'prior mean',
    sampleProp: 'sample proportion',
    weightPrior: 'prior {p}',
    weightData: 'data {p}',

    task1:
      'In <b>Simulate</b> with the <b>Uniform</b> prior, increase <b>Trials n</b> from 0 to 200. ' +
      'Where does the posterior settle, and how does its width change?',
    task2:
      'Set the prior mean to 0.2 and the prior strength to 50, then increase n. How long does the prior "hold out" against the data? ' +
      'Watch the prior share in the bar below.',
    task3:
      'Switch to <b>Enter</b> and set 7 responders out of 10. If you change only the prior strength, between which two values does the posterior mean move?',

    explain:
      '<p><b>Bayes\' theorem</b>: posterior ∝ prior × likelihood. Multiply what you believed before the data (prior) ' +
      'by how likely the data are under each θ (likelihood), rescale to area 1, and you get what you believe after the data (posterior).</p>' +
      '<p>If the prior for the response rate θ is <b>Beta(a, b)</b> and k of n patients respond, the posterior is again a Beta distribution, ' +
      '<b>Beta(a + k, b + n − k)</b>. A prior whose posterior has the same form is called a <b>conjugate prior</b>.</p>' +
      '<p>So a and b read as "imaginary patients seen in advance": a responders and b non-responders. ' +
      'The larger the <b>prior strength</b> a + b, the harder it is for the data to move the prior.</p>' +
      '<p>The posterior mean (a + k)/(a + b + n) is a weighted average of the prior mean a/(a + b) and the sample proportion k/n, ' +
      'with prior weight w = (a + b)/(a + b + n). As n grows, w goes to 0 and the data decide.</p>' +
      '<p>The <b>95% credible interval</b> runs from the 2.5% to the 97.5% quantile of the posterior: ' +
      '"after seeing these data, θ lies in this interval with probability 95%".</p>' +
      '<p>The dashed likelihood is rescaled to area 1, which makes it equal to the posterior under the uniform prior Beta(1, 1), namely Beta(k + 1, n − k + 1).</p>',
  },
};
