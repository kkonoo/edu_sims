// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: '최소제곱: 잔차·이상치·leverage',
    question: '점 하나가 회귀선을 얼마나 끌고 갈 수 있을까?',

    modeHead: '점 다루기',
    modeDrag: '끌기',
    modeAdd: '추가',
    modeDelete: '삭제',
    modeHint: '{n}개 (3 ~ 40개)',
    dataHead: '데이터',
    pClean: '깨끗한',
    pOutlier: '+ 이상치',
    pLeverage: '+ 지렛점',
    pInfluential: '+ 영향점',
    reroll: '🎲 다시 뽑기',
    viewHead: '보기',
    showResid: '잔차',
    showSq: '잔차 제곱',

    selHead: '선택한 점 #{i}',
    selNone: '선택한 점 없음',
    selXY: '({x}, {y})',
    rowResid: '잔차 e',
    rowLev: 'leverage h',
    rowRstd: '표준화 잔차',
    rowCook: 'Cook 거리',
    cutLev: '기준 2p/n = {c}',
    cutRstd: '기준 ±2',
    cutCook: '기준 1',
    loo: '이 점을 빼면 기울기 {a} → {b}',
    looNA: '이 점을 빼면 기울기를 정할 수 없음',
    selectHint: '점을 끌거나, 오른쪽 아래 그림의 점을 누르면 선택돼요.',

    statLine: '회귀식',
    statR2: 'R²',
    statSigma: 'σ̂ (잔차 표준편차)',
    statN: 'n',
    degenerate: 'x가 모두 같아서 기울기를 정할 수 없어요.',

    scatterTitle: '산점도',
    legendPoint: '점 (끌 수 있음)',
    legendLine: '회귀선',
    legendLoo: '선택한 점을 뺀 회귀선',
    legendResid: '잔차',
    legendSq: '잔차 제곱 (넓이)',
    legendSel: '선택한 점',

    diagTitle: '진단: leverage와 표준화 잔차',
    axisLev: 'leverage h',
    axisRstd: '표준화 잔차',
    legendCook: 'Cook 거리 0.5, 1',
    legendCuts: '기준선 (h = 2p/n, ±2)',

    task1:
      '<b>깨끗한</b> 데이터에서 가운데쯤 있는 점 하나를 위아래로 크게 끌어 보세요. 선이 얼마나 움직이나요? ' +
      '아래 진단 그림에서 그 점은 어느 방향으로 가나요?',
    task2:
      '이번엔 맨 오른쪽 점을 x = 10 근처로 옮긴 뒤 위아래로 끌어 보세요. 같은 거리를 끌었는데 선이 훨씬 많이 움직이는 이유는?',
    task3: '<b>+ 지렛점</b>과 <b>+ 영향점</b>을 비교해 보세요. 둘 다 leverage는 큰데 Cook 거리는 왜 다를까요?',

    explain:
      '<p><b>최소제곱</b>은 잔차(관측값 − 직선 위의 값)를 제곱해 더한 값이 가장 작은 직선을 고릅니다. ' +
      '"잔차 제곱"을 켜면 보이는 정사각형들의 넓이 합이 바로 그 값입니다. 제곱하므로 멀리 떨어진 점일수록 선을 강하게 끌어당깁니다.</p>' +
      '<p>설계행렬 X = [1, x]로 쓰면 해는 <b>정규방정식</b> XᵀX β = Xᵀy 를 풀어 얻고, 적합값은 ŷ = Hy, ' +
      'H = X(XᵀX)⁻¹Xᵀ 입니다. ŷ는 y를 X의 열공간에 <b>사영</b>한 것이고, 잔차는 그 공간과 수직입니다 ' +
      '(그래서 잔차의 합도, 잔차와 x의 곱의 합도 0).</p>' +
      '<p><b>leverage</b> hᵢ는 H의 대각 원소 = 1/n + (xᵢ − x̄)²/Σ(x − x̄)² 입니다. y와 상관없이 x만으로 정해지고, ' +
      'x̄에서 멀수록 큽니다. 합은 언제나 모수의 개수 p = 2이므로, 평균의 두 배인 2p/n를 넘으면 큰 편으로 봅니다.</p>' +
      '<p><b>이상치</b>는 잔차가 큰 점(표준화 잔차가 ±2 밖), <b>지렛점</b>은 leverage가 큰 점입니다. ' +
      '둘이 겹치면 <b>영향점</b>이 됩니다. <b>Cook 거리</b> Dᵢ = rᵢ² hᵢ / (p(1 − hᵢ)) 는 그 점 하나를 뺐을 때 적합값이 얼마나 바뀌는지를 잽니다. ' +
      '1을 넘으면 그 점이 결론을 좌우한다고 봅니다. 점선은 선택한 점을 뺀 회귀선입니다.</p>',
  },

  en: {
    title: 'Least squares: residuals, outliers, leverage',
    question: 'How far can a single point drag the regression line?',

    modeHead: 'Points',
    modeDrag: 'Drag',
    modeAdd: 'Add',
    modeDelete: 'Delete',
    modeHint: '{n} points (3 to 40)',
    dataHead: 'Data',
    pClean: 'Clean',
    pOutlier: '+ outlier',
    pLeverage: '+ leverage',
    pInfluential: '+ influential',
    reroll: '🎲 New draw',
    viewHead: 'Show',
    showResid: 'Residuals',
    showSq: 'Squared residuals',

    selHead: 'Selected point #{i}',
    selNone: 'No point selected',
    selXY: '({x}, {y})',
    rowResid: 'Residual e',
    rowLev: 'Leverage h',
    rowRstd: 'Standardized residual',
    rowCook: "Cook's distance",
    cutLev: 'cutoff 2p/n = {c}',
    cutRstd: 'cutoff ±2',
    cutCook: 'cutoff 1',
    loo: 'Without this point the slope is {a} → {b}',
    looNA: 'Without this point the slope is undefined',
    selectHint: 'Drag a point, or tap a point in the diagnostic plot, to select it.',

    statLine: 'Fitted line',
    statR2: 'R²',
    statSigma: 'σ̂ (residual SD)',
    statN: 'n',
    degenerate: 'All x values are equal, so the slope is undefined.',

    scatterTitle: 'Scatter plot',
    legendPoint: 'Points (draggable)',
    legendLine: 'Regression line',
    legendLoo: 'Line without the selected point',
    legendResid: 'Residuals',
    legendSq: 'Squared residuals (area)',
    legendSel: 'Selected point',

    diagTitle: 'Diagnostics: leverage vs standardized residual',
    axisLev: 'Leverage h',
    axisRstd: 'Standardized residual',
    legendCook: "Cook's distance 0.5, 1",
    legendCuts: 'Cutoffs (h = 2p/n, ±2)',

    task1:
      'With the <b>Clean</b> data, drag a point near the middle far up or down. How much does the line move? ' +
      'Where does that point go in the diagnostic plot below?',
    task2:
      'Now move the rightmost point to around x = 10 and drag it up and down. Why does the line move so much more for the same distance?',
    task3: 'Compare <b>+ leverage</b> and <b>+ influential</b>. Both have high leverage, so why is Cook\'s distance so different?',

    explain:
      '<p><b>Least squares</b> picks the line that makes the sum of squared residuals (observed − value on the line) as small as possible. ' +
      'Turn on "Squared residuals": the total area of the squares is exactly that sum. Because residuals are squared, far-away points pull hardest.</p>' +
      '<p>With the design matrix X = [1, x], the solution comes from the <b>normal equations</b> XᵀX β = Xᵀy, and the fitted values are ŷ = Hy ' +
      'with H = X(XᵀX)⁻¹Xᵀ. ŷ is the <b>projection</b> of y onto the column space of X, and the residuals are perpendicular to it ' +
      '(so the residuals sum to 0, and so does their product with x).</p>' +
      '<p><b>Leverage</b> hᵢ is the diagonal of H: 1/n + (xᵢ − x̄)²/Σ(x − x̄)². It depends only on x, not on y, and grows with distance from x̄. ' +
      'The leverages always sum to the number of parameters p = 2, so values above twice the average, 2p/n, count as large.</p>' +
      '<p>An <b>outlier</b> has a large residual (standardized residual outside ±2); a <b>leverage point</b> has large leverage. ' +
      'When both happen together the point is <b>influential</b>. <b>Cook\'s distance</b> Dᵢ = rᵢ² hᵢ / (p(1 − hᵢ)) measures how much the fit changes if that one point is removed; ' +
      'above 1 the point drives the conclusion. The dashed line is the fit without the selected point.</p>',
  },
};
