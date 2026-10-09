// 갤러리 등록부 — 새 시뮬레이터를 만들면 SIMS에 한 항목을 추가하세요.

// 교재 목록. name은 카드의 "쓰이는 교재" 칩에 그대로 나옵니다(원하는 이름으로 바꿔도 됨).
// lang은 교재의 언어 — 교재에 끼워 넣을 때 ?lang= 값을 고르는 기준입니다.
const BOOKS = {
  '2_linear_algebra': { name: '2_linear_algebra', lang: 'ko' },
  '3_linear_regression': { name: '3_linear_regression', lang: 'ko' },
  '4_Bayes': { name: '4_Bayes', lang: 'ko' },
  '4_graphs': { name: '4_graphs', lang: 'ko' },
  BI_for_Biomed_KNUmed: { name: 'BI_for_Biomed_KNUmed', lang: 'en' },
  advanced_BI_for_MD_PhD_KNUmed: { name: 'advanced_BI_for_MD_PhD_KNUmed', lang: 'en' },
};
const BOOK_URL = (id) => 'https://kkonoo.github.io/' + id + '/';

// 시뮬레이터 목록. id = sims/ 아래 폴더 이름. 제목·질문은 그 시뮬레이터의 text.js와 같게.
const SIMS = [
  {
    id: 'multiple-testing',
    title: { ko: '다중검정과 FDR', en: 'Multiple testing and FDR' },
    question: {
      ko: '아무 효과가 없는데 왜 "유의한" 유전자가 나올까?',
      en: 'Why do "significant" genes show up when nothing is going on?',
    },
    books: ['BI_for_Biomed_KNUmed', 'advanced_BI_for_MD_PhD_KNUmed'],
  },
];
