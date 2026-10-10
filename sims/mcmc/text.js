// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: 'MCMC: 제안 폭과 체인의 움직임',
    question: '한 걸음을 얼마나 크게 내디뎌야 체인이 목표분포를 잘 돌아다닐까?',

    targetHead: '목표분포',
    targetNorm: '상관 정규',
    targetBimodal: '두 봉우리',
    noteNorm: '평균 0, 분산 1인 이변량 정규. 상관 ρ',
    noteBimodal: 'x₁ = −4와 +4에 봉우리가 있는 정규분포 두 개를 반반 섞음',
    rho: '상관 ρ',
    tau: '제안 표준편차 τ',
    tauSmall: '너무 작게',
    tauGood: '적당히',
    tauBig: '너무 크게',
    chainsHead: '체인',
    chains1: '1개',
    chains4: '4개',
    chainsNote: '4개면 네 모서리에서 따로 출발하고 R̂를 계산해요',
    playHead: '재생',
    speed: '속도',
    speedFmt: '초당 {v}걸음',
    n: '반복',

    statN: '반복 (걸음)',
    statAcc: '수용률',
    statEss: 'ESS (x₁)',
    statEssOf: '/ 표본 {m}개',
    statRhat: 'R̂ (split)',
    tooShort: '—',

    planeTitle: '목표분포와 체인의 발자국',
    legendTarget: '목표분포 등고선',
    legendVisited: '지나온 자리',
    legendStart: '출발점',
    legendNow: '지금 위치',
    legendAccept: '이번 제안: 수용',
    legendReject: '기각 ×',

    traceTitle: 'Trace plot (x₁)',
    axisIter: '반복',
    burn: '번인',

    histTitle: 'x₁ 히스토그램 (번인 뺀 표본) vs 목표',
    legendHist: '체인의 표본',
    legendMarg: '목표의 주변분포',
    axisDensity: '밀도',

    task1:
      '<b>상관 정규</b>(ρ = 0.9)에서 τ를 <b>너무 작게</b>, <b>적당히</b>, <b>너무 크게</b>로 바꿔 가며 끝까지 돌려 보세요. ' +
      '수용률과 ESS는 각각 어떻게 변하나요? 수용률이 가장 높은 τ가 가장 좋은 τ인가요?',
    task2: 'ρ를 0.99로 올리고 τ = 1로 다시 끝까지 돌려 보세요. ESS는 얼마나 줄었나요? 2D 그림에서 체인은 어느 방향으로 느리게 움직이나요?',
    task3:
      '<b>두 봉우리</b>에서 τ = 0.5로 끝까지 돌려 보세요. 히스토그램이 목표와 같나요? 수용률과 ESS만 보고 이상한 걸 알 수 있나요? ' +
      '<b>체인 4개</b>로 바꾸면 R̂는 얼마인가요? τ = 4에서는 어떤가요?',

    explain:
      '<p><b>랜덤워크 Metropolis</b>는 지금 위치 x에서 x′ = x + τ·(z₁, z₂) (z는 표준정규)를 제안하고, ' +
      '확률 min{1, π(x′)/π(x)}로 옮겨 갑니다. 기각되면 지금 값을 한 번 더 기록합니다(머무는 것도 한 걸음). ' +
      '밀도의 비율만 쓰므로 정규화상수를 몰라도 됩니다.</p>' +
      '<p><b>τ가 너무 작으면</b> 거의 다 수용되지만 걸음이 짧아 제자리를 맴돌고, <b>너무 크면</b> 대부분 기각되어 같은 값에 오래 머뭅니다. ' +
      '둘 다 이웃한 표본끼리 비슷해져(자기상관) 정보가 적습니다. 랜덤워크의 적정 수용률은 1차원에서 약 44%, 차원이 크면 약 23%로 알려져 있고 ' +
      '20–50%면 대체로 무난합니다. 그래도 보아야 할 것은 수용률 자체가 아니라 trace plot과 ESS입니다.</p>' +
      '<p><b>ESS</b>(유효표본수)는 자기상관을 감안해 표본이 독립표본 몇 개어치인지를 잽니다. ' +
      '교재(베이즈 W6)의 <code>ess_basic</code>과 같은 방법입니다: 체인을 반으로 나누고, 자기상관을 시차 0부터 둘씩 묶어 더하다가(Geyer의 초기 단조 수열) ' +
      '처음 음수가 되는 곳에서 멈춥니다. 평균의 몬테카를로 오차는 대략 표준편차/√ESS입니다.</p>' +
      '<p><b>상관이 크면</b> 분포가 좁고 긴 골짜기가 됩니다. 제안은 모든 방향으로 같은 폭이라 τ를 좁은 쪽에 맞춰야 하고, ' +
      '그러면 긴 쪽으로는 아주 느리게 기어갑니다.</p>' +
      '<p><b>봉우리가 둘이면</b> 그 사이의 밀도가 매우 낮아 작은 걸음으로는 건너가지 못합니다. ' +
      '이때 체인 하나는 한쪽 봉우리 안에서 멀쩡히 섞이므로 수용률도 ESS도 정상처럼 보입니다. ' +
      '흩어진 출발점에서 체인을 여러 개 돌려 서로 같은 곳을 보는지 확인하는 이유입니다. ' +
      '<b>R̂</b>는 체인 간 분산과 체인 내 분산을 비교한 값으로(체인을 반으로 나눈 split-R̂), 1.01 이하를 기준으로 봅니다.</p>' +
      '<p>앞 10%는 출발점의 영향이 남은 <b>번인</b>으로 보고 히스토그램·ESS·R̂ 계산에서 뺍니다(trace plot의 회색 구간). ' +
      'τ를 바꿔도 같은 난수(z와 수용 판정용 균등난수)를 쓰므로, 비교할 때 τ만 달라집니다.</p>',
  },

  en: {
    title: 'MCMC: proposal width and how the chain moves',
    question: 'How big should each step be for the chain to explore the target well?',

    targetHead: 'Target distribution',
    targetNorm: 'Correlated normal',
    targetBimodal: 'Two peaks',
    noteNorm: 'Bivariate normal with mean 0, variance 1 and correlation ρ',
    noteBimodal: 'Equal mixture of two normals with peaks at x₁ = −4 and +4',
    rho: 'Correlation ρ',
    tau: 'Proposal SD τ',
    tauSmall: 'Too small',
    tauGood: 'About right',
    tauBig: 'Too large',
    chainsHead: 'Chains',
    chains1: '1',
    chains4: '4',
    chainsNote: 'With 4, each starts from a different corner and R̂ is computed',
    playHead: 'Playback',
    speed: 'Speed',
    speedFmt: '{v} steps/s',
    n: 'Iteration',

    statN: 'Iterations (steps)',
    statAcc: 'Acceptance rate',
    statEss: 'ESS (x₁)',
    statEssOf: '/ {m} draws',
    statRhat: 'R̂ (split)',
    tooShort: '—',

    planeTitle: 'Target distribution and the chain\'s footprints',
    legendTarget: 'Target contours',
    legendVisited: 'Visited',
    legendStart: 'Start',
    legendNow: 'Current',
    legendAccept: 'This proposal: accepted',
    legendReject: 'rejected ×',

    traceTitle: 'Trace plot (x₁)',
    axisIter: 'iteration',
    burn: 'burn-in',

    histTitle: 'Histogram of x₁ (after burn-in) vs target',
    legendHist: 'Chain draws',
    legendMarg: 'Target marginal',
    axisDensity: 'density',

    task1:
      'With the <b>Correlated normal</b> (ρ = 0.9), run to the end with τ set to <b>Too small</b>, <b>About right</b> and <b>Too large</b>. ' +
      'How do the acceptance rate and ESS change? Is the τ with the highest acceptance rate the best τ?',
    task2: 'Raise ρ to 0.99 and run to the end again with τ = 1. How much does ESS drop? In which direction does the chain crawl slowly in the 2D plot?',
    task3:
      'With <b>Two peaks</b>, run to the end with τ = 0.5. Does the histogram match the target? Could you tell something is wrong from the acceptance rate and ESS alone? ' +
      'Switch to <b>4 chains</b>: what is R̂? And with τ = 4?',

    explain:
      '<p><b>Random-walk Metropolis</b> proposes x′ = x + τ·(z₁, z₂) (z standard normal) from the current x and moves there ' +
      'with probability min{1, π(x′)/π(x)}. If rejected, it records the current value again (staying is a step too). ' +
      'Only the ratio of densities is used, so the normalizing constant is never needed.</p>' +
      '<p>With <b>τ too small</b> almost everything is accepted but the steps are tiny, so the chain drifts in place; with <b>τ too large</b> most proposals are rejected and the chain sticks to one value. ' +
      'Either way neighbouring draws are similar (autocorrelation) and carry little information. The optimal acceptance rate for a random walk is about 44% in one dimension and about 23% in many; ' +
      '20–50% is usually fine. Still, what matters is the trace plot and ESS, not the acceptance rate itself.</p>' +
      '<p><b>ESS</b> (effective sample size) says how many independent draws the autocorrelated draws are worth. ' +
      'It is computed like <code>ess_basic</code> in the Bayes book (W6): split each chain in half, add up autocorrelations in pairs starting from lag 0 (Geyer\'s initial monotone sequence), ' +
      'and stop where a pair first turns negative. The Monte Carlo error of the mean is roughly SD/√ESS.</p>' +
      '<p><b>High correlation</b> makes the distribution a long, narrow valley. The proposal has the same width in every direction, so τ must fit the narrow direction, ' +
      'and then the chain crawls very slowly along the long one.</p>' +
      '<p>With <b>two peaks</b>, the density between them is so low that small steps never cross. ' +
      'A single chain then mixes perfectly well inside one peak, so its acceptance rate and ESS look normal. ' +
      'That is why we run several chains from scattered starting points and check that they agree. ' +
      '<b>R̂</b> compares the between-chain and within-chain variance (split-R̂, with each chain cut in half); the usual cut-off is 1.01.</p>' +
      '<p>The first 10% is treated as <b>burn-in</b> (still affected by the starting point) and left out of the histogram, ESS and R̂ (grey band in the trace plot). ' +
      'Changing τ reuses the same random numbers (z and the uniform draws for acceptance), so only τ differs when you compare.</p>',
  },
};
