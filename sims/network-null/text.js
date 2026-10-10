// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '네트워크 null model: 차수 보존 재배선',
    question: '뭉침 계수 0.57은 큰 값일까? 차수가 똑같은 무작위 네트워크와 비교하면?',

    swaps: '재배선 시도 (null마다)',
    swapsFmt: '{k}×m ({a}번)',
    swapsNote: '엣지 두 개의 끝을 맞바꾸는 시도. 자기루프나 중복 엣지가 생기면 그 시도는 버려요.',
    nullHead: 'null 네트워크',
    n: 'null 네트워크 수',
    speed: '속도',
    speedFmt: '초당 {v}개',

    colMetric: '지표',
    colObs: '관측',
    colNull: 'null 평균 ± 표준편차',
    colZ: 'Z',
    colP: 'p',
    rowC: '평균 뭉침 계수 C',
    rowTri: '삼각형 수',
    pLe: '≤ 1/{v}',
    tableNote: 'null {n}개 · 재배선 시도 중 실제로 바뀐 비율 {r}',
    tableNoteNone: '아직 null 네트워크가 없어요. ▶ 재생을 눌러 하나씩 쌓아 보세요.',

    netTitle: '관측 네트워크와 null 네트워크 (노드 위치는 같음)',
    panelObs: '관측 (Zachary karate club)',
    panelNull: 'null #{i}',
    panelNullNone: 'null 없음',
    panelStats: '삼각형 {t} · 평균 C {c}',
    legendHi: '파벌 Mr. Hi',
    legendOfficer: '파벌 Officer',
    legendSize: '크기 = 차수 (둘이 같음)',
    legendOld: '원래 있던 엣지',
    legendNew: '재배선으로 생긴 엣지',
    nodeTip: '노드 {i} · 차수 {k} · C {c}',

    histTitle: 'null 분포',
    histC: '평균 뭉침 계수 C',
    histTri: '삼각형 수',
    axisCount: 'null 수',
    obsLabel: '관측 {v}',

    task1:
      '재배선 10×m, null 1,000개에서 두 지표의 Z를 비교해 보세요. 평균 뭉침 계수는 유의한데 삼각형 수는 왜 아닐까요? ' +
      '(힌트: 평균 C는 노드마다 한 표, 삼각형은 대부분 허브 둘레에 있어요.)',
    task2: '재배선을 0, 0.1×m, 1×m, 10×m으로 바꿔 보세요. null 평균과 Z는 어떻게 변하나요? 몇 번쯤부터 안정되나요?',
    task3:
      '<b>⏮ 처음으로</b>를 누르고 재생하며 C의 p를 지켜보세요. null이 100개일 때 p는 얼마까지 작아질 수 있나요? ' +
      '"p < 0.001"이라고 쓰려면 null이 몇 개 있어야 할까요?',

    explain:
      '<p><b>차수 보존 재배선</b>: 엣지 두 개 (A–B), (C–D)를 골라 끝을 맞바꿔 (A–D), (C–B)로 만듭니다. 모든 노드의 차수는 그대로이고 연결의 짜임만 무작위가 됩니다. ' +
      '자기루프(A–A)나 이미 있는 엣지가 생기는 시도는 버립니다. 이것을 여러 번 반복한 그래프 하나하나가 "차수 분포는 같지만 나머지는 우연인" <b>null 네트워크</b>입니다.</p>' +
      '<p>null 네트워크마다 지표를 재면 <b>null 분포</b>가 생깁니다. Z = (관측값 − null 평균) / null 표준편차, ' +
      '경험적 p = (관측값 이상인 null의 수 + 1) / (null 수 + 1). null이 N개면 p는 1/(N + 1)보다 작아질 수 없습니다.</p>' +
      '<p><b>지표를 바꾸면 결론이 뒤집힙니다.</b> 평균 뭉침 계수는 노드마다 한 표씩 주므로 차수가 작은 노드의 영향이 크고, 삼각형 총수는 허브가 지배합니다. ' +
      'karate club에서 특별한 것은 "삼각형이 많다"가 아니라 "차수가 작은 노드들이 촘촘히 뭉쳐 있다"입니다. 어떤 지표를 골랐는지가 곧 결론이므로, ' +
      '지표 이름·null model 종류·반복 횟수를 함께 밝혀야 합니다. (transitivity = 3 × 삼각형 수 / ΣC(kᵢ, 2)의 분모는 차수만으로 정해지므로, ' +
      '차수 보존 null에서는 삼각형 수와 Z·p가 똑같습니다.)</p>' +
      '<p><b>재배선이 모자라면</b> null이 관측 네트워크를 닮아 Z가 작게 나옵니다(0번이면 null = 관측). ' +
      '필요한 횟수는 지표마다 다릅니다: 이 데이터에서 평균 C는 1×m쯤, 삼각형 수는 5×m쯤부터 안정됩니다. ' +
      '여기서는 재배선을 <b>시도 횟수</b>로 셉니다. 시도를 되돌리는 확률이 같아서, null이 같은 차수를 가진 그래프 전체에서 정확히 고르게 뽑힙니다. ' +
      '교재 코드의 networkx <code>double_edge_swap</code>은 성공한 횟수만 셉니다. karate에서는 시도의 약 41%가 성공하므로 교재의 10×m은 여기서 약 25×m에 해당합니다.</p>' +
      '<p>무작위 그래프(ER)를 null로 쓰면 차수 분포부터 달라 "허브가 있다" 같은 당연한 결과만 재확인합니다. 보존하는 것이 많을수록 보수적인 검정이 됩니다. ' +
      '교재 코드는 재배선 뒤 가장 큰 연결 덩어리만 남기지만(평균 경로 길이를 재기 위해), 여기서는 그래프 전체로 계산합니다. 뭉침 계수와 삼각형 수에는 차이가 거의 없습니다.</p>' +
      '<p>데이터: Zachary(1977)의 가라테 클럽 회원 34명과 친교 관계 78개. 클럽은 나중에 두 파벌(Mr. Hi, Officer)로 갈라졌습니다(노드 색). ' +
      'null 네트워크에서는 파벌을 가로지르는 엣지가 많아지는 것도 보입니다.</p>',
  },

  en: {
    title: 'Network null models: degree-preserving rewiring',
    question: 'Is a clustering coefficient of 0.57 large? Compared with random networks that have exactly the same degrees?',

    swaps: 'Rewiring attempts (per null)',
    swapsFmt: '{k}×m ({a})',
    swapsNote: 'Each attempt swaps the ends of two edges. Attempts that would create a self-loop or a duplicate edge are discarded.',
    nullHead: 'Null networks',
    n: 'Number of null networks',
    speed: 'Speed',
    speedFmt: '{v}/s',

    colMetric: 'Metric',
    colObs: 'Observed',
    colNull: 'Null mean ± SD',
    colZ: 'Z',
    colP: 'p',
    rowC: 'Average clustering C',
    rowTri: 'Triangles',
    pLe: '≤ 1/{v}',
    tableNote: '{n} null networks · share of attempts that changed the graph: {r}',
    tableNoteNone: 'No null networks yet. Press ▶ Play to add them one at a time.',

    netTitle: 'Observed network and a null network (same node positions)',
    panelObs: 'Observed (Zachary karate club)',
    panelNull: 'null #{i}',
    panelNullNone: 'no null yet',
    panelStats: '{t} triangles · average C {c}',
    legendHi: 'Mr. Hi faction',
    legendOfficer: 'Officer faction',
    legendSize: 'size = degree (same in both)',
    legendOld: 'original edge',
    legendNew: 'edge created by rewiring',
    nodeTip: 'node {i} · degree {k} · C {c}',

    histTitle: 'Null distributions',
    histC: 'Average clustering C',
    histTri: 'Triangles',
    axisCount: 'null networks',
    obsLabel: 'observed {v}',

    task1:
      'With 10×m rewiring and 1,000 null networks, compare the Z of the two metrics. Why is average clustering significant but the triangle count not? ' +
      '(Hint: average C gives every node one vote; most triangles sit around the hubs.)',
    task2: 'Set rewiring to 0, 0.1×m, 1×m and 10×m. How do the null mean and Z change? From roughly how many attempts does it settle?',
    task3:
      'Press <b>⏮ Restart</b> and watch the p for C while it plays. With 100 null networks, how small can p get? ' +
      'How many null networks do you need before you can write "p < 0.001"?',

    explain:
      '<p><b>Degree-preserving rewiring</b>: pick two edges (A–B) and (C–D) and swap their ends to get (A–D) and (C–B). Every node keeps its degree; only the wiring becomes random. ' +
      'Attempts that would create a self-loop (A–A) or an edge that already exists are discarded. Each graph rewired many times is a <b>null network</b>: same degree distribution, everything else by chance.</p>' +
      '<p>Measuring the metric on every null network gives the <b>null distribution</b>. Z = (observed − null mean) / null SD, ' +
      'and the empirical p = (number of nulls at least as large as observed + 1) / (number of nulls + 1). With N null networks, p can never go below 1/(N + 1).</p>' +
      '<p><b>Changing the metric can flip the conclusion.</b> Average clustering gives every node one vote, so low-degree nodes weigh heavily; the total triangle count is dominated by hubs. ' +
      'What is special about the karate club is not "many triangles" but "low-degree nodes clustered tightly together". The metric you pick is the conclusion, ' +
      'so report the metric, the kind of null model and the number of repetitions. (Transitivity = 3 × triangles / ΣC(kᵢ, 2) has a denominator fixed by the degrees, ' +
      'so under a degree-preserving null it gives exactly the same Z and p as the triangle count.)</p>' +
      '<p><b>Too little rewiring</b> leaves the null networks resembling the observed one, so Z comes out too small (with 0 attempts, null = observed). ' +
      'How much is enough depends on the metric: here average C settles from about 1×m, the triangle count from about 5×m. ' +
      'Here rewiring is counted in <b>attempts</b>. Undoing an attempt is exactly as likely as making it, so the null networks are drawn uniformly from all graphs with the same degrees. ' +
      'networkx <code>double_edge_swap</code>, used in the book, counts only successful swaps. About 41% of attempts succeed on the karate club, so the book\'s 10×m corresponds to roughly 25×m here.</p>' +
      '<p>Using a purely random (ER) graph as the null changes even the degree distribution, so it only reconfirms the obvious, such as "there are hubs". The more you preserve, the more conservative the test. ' +
      'The book\'s code keeps only the largest connected component after rewiring (to measure path lengths); here the whole graph is used, which makes almost no difference to clustering and triangles.</p>' +
      '<p>Data: Zachary (1977), 34 members of a karate club and 78 friendships. The club later split into two factions (Mr. Hi and Officer, node colours). ' +
      'In the null networks you can also see many more edges crossing between the factions.</p>',
  },
};
