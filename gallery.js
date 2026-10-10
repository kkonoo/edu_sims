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
];
