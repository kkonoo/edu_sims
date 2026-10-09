// 문구 사전 — 화면에 보이는 글자는 모두 여기에. ko와 en의 키가 같아야 합니다.
// 빠진 키는 화면에 ⟦키⟧로 나타납니다.
// '조작', '이렇게 해 보세요', '다시 뽑기' 같은 공통 문구는 shared/sim.js에 있습니다.
const TEXT = {
  ko: {
    title: '템플릿: 표본평균',
    question: '표본을 많이 뽑을수록 평균은 왜 참값에 가까워질까?',
    n: '표본 크기 n',
    meanLabel: '표본평균',
    figTitle: 'N(0, 1)에서 뽑은 값의 히스토그램',
    legendDraws: '뽑은 값',
    legendMean: '표본평균',
    legendTrue: '참값 μ = 0',
    task1: 'n을 5로 두고 <b>다시 뽑기</b>를 여러 번 눌러 보세요. 표본평균이 얼마나 흔들리나요?',
    task2: 'n을 1000으로 올린 뒤 같은 일을 해 보세요.',
    explain:
      '<p>표본평균의 표준오차는 <span class="formula">σ/√n</span>입니다. ' +
      'n이 4배가 되면 흔들림은 절반이 됩니다.</p>',
  },
  en: {
    title: 'Template: sample mean',
    question: 'Why does the sample mean get closer to the truth as the sample grows?',
    n: 'Sample size n',
    meanLabel: 'Sample mean',
    figTitle: 'Histogram of draws from N(0, 1)',
    legendDraws: 'Draws',
    legendMean: 'Sample mean',
    legendTrue: 'True μ = 0',
    task1: 'Set n to 5 and press <b>New draw</b> a few times. How much does the sample mean move?',
    task2: 'Now raise n to 1000 and do the same.',
    explain:
      '<p>The standard error of the sample mean is <span class="formula">σ/√n</span>. ' +
      'Quadrupling n halves the wobble.</p>',
  },
};
