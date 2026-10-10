// 갤러리 등록부 — 새 시뮬레이터를 만들면 SIMS에 한 항목을 추가하세요.

// 교재 목록. 키는 kkonoo.github.io 아래 폴더 이름, name은 카드 칩에 나오는 짧은 이름.
// lang은 교재의 언어 — 교재에 끼워 넣을 때 ?lang= 값을 고르는 기준입니다.
const BOOKS = {
  '2_linear_algebra': { name: { ko: '선형대수', en: 'Linear algebra' }, lang: 'ko' },
  '3_linear_regression': { name: { ko: '회귀', en: 'Regression' }, lang: 'ko' },
  '4_Bayes': { name: { ko: '베이즈', en: 'Bayes' }, lang: 'ko' },
  '4_graphs': { name: { ko: '그래프', en: 'Graphs' }, lang: 'ko' },
  BI_for_Biomed_KNUmed: { name: { ko: 'BI 입문', en: 'Intro BI' }, lang: 'en' },
  advanced_BI_for_MD_PhD_KNUmed: { name: { ko: '고급 BI', en: 'Advanced BI' }, lang: 'en' },
};
const BOOK_URL = (id) => 'https://kkonoo.github.io/' + id + '/';

// 시뮬레이터 목록. id = sims/ 아래 폴더 이름. 제목·질문은 그 시뮬레이터의 text.js와 같게.
// books: [교재 키, 어디에 쓰이는지] — 두 번째 값은 문자열이거나 { ko, en }
const SIMS = [
  {
    id: 'multiple-testing',
    title: { ko: '다중검정과 FDR', en: 'Multiple testing and FDR' },
    question: {
      ko: '아무 효과가 없는데 왜 "유의한" 유전자가 나올까?',
      en: 'Why do "significant" genes show up when nothing is going on?',
    },
    books: [
      ['BI_for_Biomed_KNUmed', { ko: '핵심 주제', en: 'core topic' }],
      ['3_linear_regression', { ko: '변수선택', en: 'variable selection' }],
      ['advanced_BI_for_MD_PhD_KNUmed', 'GWAS'],
    ],
  },
  {
    id: 'prior-posterior',
    title: { ko: '사전분포 × 가능도 → 사후분포', en: 'Prior × likelihood → posterior' },
    question: {
      ko: '데이터를 보면 믿음은 어떻게 바뀔까?',
      en: 'How does what we believe change once we see data?',
    },
    books: [['4_Bayes', 'W1–3']],
  },
  {
    id: 'matrix-2x2',
    title: { ko: '2×2 행렬과 고유벡터', en: '2×2 matrices and eigenvectors' },
    question: {
      ko: '행렬을 곱하면 평면은 어떻게 바뀔까? 방향이 그대로인 벡터는?',
      en: 'How does multiplying by a matrix reshape the plane? Which vectors keep their direction?',
    },
    books: [['2_linear_algebra', { ko: '2·11·12장', en: 'ch. 2, 11, 12' }]],
  },
  {
    id: 'least-squares',
    title: { ko: '최소제곱: 잔차·이상치·leverage', en: 'Least squares: residuals, outliers, leverage' },
    question: {
      ko: '점 하나가 회귀선을 얼마나 끌고 갈 수 있을까?',
      en: 'How far can a single point drag the regression line?',
    },
    books: [
      ['3_linear_regression', { ko: '1·3부', en: 'parts 1, 3' }],
      ['2_linear_algebra', { ko: '9장', en: 'ch. 9' }],
    ],
  },
  {
    id: 'ridge-lasso',
    title: { ko: 'Ridge와 Lasso: λ와 수축', en: 'Ridge and Lasso: λ and shrinkage' },
    question: {
      ko: 'λ를 키우면 계수는 어떻게 줄어들까? 왜 Lasso만 정확히 0이 될까?',
      en: 'What happens to the coefficients as λ grows? Why does only Lasso set some exactly to 0?',
    },
    books: [
      ['3_linear_regression', { ko: '5부', en: 'part 5' }],
      ['4_Bayes', { ko: 'W8 (수축)', en: 'W8 (shrinkage)' }],
    ],
  },
  {
    id: 'confounding',
    title: { ko: '교란변수와 배치효과', en: 'Confounding and batch effects' },
    question: {
      ko: '전체로 보면 반대인데, 나눠 보면? 배치가 결론을 뒤집을 수 있을까?',
      en: 'The overall trend points one way, but within groups? Can batches flip the conclusion?',
    },
    books: [
      ['BI_for_Biomed_KNUmed', { ko: '핵심 주제', en: 'core topic' }],
      ['advanced_BI_for_MD_PhD_KNUmed', { ko: '연구설계', en: 'study design' }],
      ['3_linear_regression', ''],
    ],
  },
  {
    id: 'pca-svd',
    title: { ko: 'PCA·SVD: 저랭크 근사', en: 'PCA and SVD: low-rank approximation' },
    question: {
      ko: '행렬을 조각 k개만 남기고 버리면, 무엇이 살아남을까?',
      en: 'Keep only k pieces of a matrix and throw the rest away. What survives?',
    },
    books: [
      ['2_linear_algebra', { ko: '13·15장', en: 'ch. 13, 15' }],
      ['BI_for_Biomed_KNUmed', 'scRNA'],
      ['advanced_BI_for_MD_PhD_KNUmed', 'single-cell'],
    ],
  },
  {
    id: 'mcmc',
    title: { ko: 'MCMC: 제안 폭과 체인의 움직임', en: 'MCMC: proposal width and how the chain moves' },
    question: {
      ko: '한 걸음을 얼마나 크게 내디뎌야 체인이 목표분포를 잘 돌아다닐까?',
      en: 'How big should each step be for the chain to explore the target well?',
    },
    books: [['4_Bayes', 'W5–6']],
  },
];
