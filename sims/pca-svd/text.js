// 문구 사전 — ko와 en의 키가 같아야 합니다. 빠진 키는 화면에 ⟦키⟧로 나타납니다.
const TEXT = {
  ko: {
    title: 'PCA·SVD: 저랭크 근사',
    question: '행렬을 조각 k개만 남기고 버리면, 무엇이 살아남을까?',

    dataHead: '데이터',
    dataImg: '이미지',
    dataCells: '세포 × 유전자',
    noteImg: '120 × 120 합성 이미지 (랭크 120)',
    noteCells: '가상 세포 300개 × 유전자 40개 (log 발현). 유형 A·B·C와 드문 유형 D(12개)',
    kLabel: '랭크 k (남길 조각 수)',
    center: '중심화 (유전자마다 평균 빼기)',
    centerNote: '켜면 PCA, 끄면 그냥 SVD',

    statK: '남긴 조각',
    statErr: '상대 오차 ‖A−Aₖ‖/‖A‖',
    statKeptImg: '남긴 에너지 (σ² 비율)',
    statKeptPca: '설명 분산 (누적)',
    statKeptRaw: '남긴 σ² 비율 (중심화 안 함)',
    statStore: '저장량 k(m+n+1)/mn',

    matTitleImg: '원본 · 근사 · 차이',
    matTitleCells: '발현 히트맵: 유전자(행) × 세포(열, 유형 순)',
    capOrig: '원본',
    capApprox: '랭크 {k} 근사',
    capResid: '차이 (원본 − 근사)',
    legendLow: '낮음',
    legendHigh: '높음',
    legendNeg: '−',
    legendPos: '+',
    legendTypes: '세포 유형:',
    typeA: 'A',
    typeB: 'B',
    typeC: 'C',
    typeD: 'D (드묾)',
    blockNote: '왼쪽 글자 = 유전자 묶음 (A–D: 그 유형의 표지 유전자, H: 유형과 무관)',

    pieceTitle: '{k}번째 조각',
    pieceImg: 'σ{k} u{k} v{k}ᵀ — 왼쪽 띠 u{k} × 위쪽 띠 v{k}',
    pieceSigma: 'σ{k} = {s} (첫 조각의 {r})',
    pieceSigma1: 'σ₁ = {s} (가장 큰 조각)',
    pieceScale: '색 범위는 이 조각에 맞춤',
    scoresTitle: '세포별 점수 (u{k} σ{k}), 유형별',
    loadingsTitle: '유전자별 무게 (v{k}, loading)',
    axisScore: '점수',

    screeTitle: 'Scree plot',
    screeAxis: 'σᵢ² / Σσ² (%)',
    screeAxisLog: 'σᵢ² / Σσ² (%, 로그 축)',
    screeX: '조각 번호 i',
    screeKept: '남김 {k}개',
    screeDropped: '버림',
    screeTip: '{i}번째: {p}',
    legendKept: '남긴 조각',
    legendDropped: '버린 조각',

    taskImg1:
      'k를 1, 2, 3 … 으로 올려 보세요. 정사각형, 원, 대각선 띠 중 무엇이 먼저 또렷해지나요? ' +
      '<b>k번째 조각</b>이 늘 "세로 띠 × 가로 띠"로 만들어진다는 것과 연결해 보세요.',
    taskImg2:
      '상대 오차가 10% 아래로 내려가는 k는 얼마인가요? 그때 저장량은? ' +
      '(상대 오차)² + 남긴 에너지 = 100%인지 확인하고, scree plot에서 버린 점들과 비교해 보세요.',
    taskImg3: 'k를 20, 40, 80으로 올리며 차이 그림을 보세요. 마지막까지 남는 건 어떤 무늬인가요? 저장량이 100%를 넘는 k도 찾아보세요.',
    taskCells1: 'k를 1, 2, 3으로 올리며 원본과 근사 히트맵을 비교해 보세요. 표지 유전자 묶음 A, B, C, D는 각각 언제 나타나나요?',
    taskCells2:
      'scree plot만 보고 k를 고른다면 몇을 고르겠어요? 그 k로 드문 유형 D를 구분할 수 있나요? ' +
      '<b>k번째 조각</b>의 점수 그림에서 확인해 보세요.',
    taskCells3:
      '<b>중심화</b>를 끄고 k = 1을 보세요. 첫 조각은 무엇을 담았고, "남긴 비율"은 얼마인가요? 이제 D가 나타나려면 k가 몇이어야 하나요?',

    explain:
      '<p><b>특잇값 분해(SVD)</b>는 어떤 m × n 행렬이든 A = UΣVᵀ = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + … 로 씁니다. ' +
      '각 항 σᵢuᵢvᵢᵀ는 <b>랭크 1</b>인 조각입니다: 행 i, 열 j의 값이 σᵢ × uᵢ의 i번째 × vᵢ의 j번째이므로, ' +
      '이미지로 보면 "세로 띠(uᵢ) × 가로 띠(vᵢ)"입니다. σ₁ ≥ σ₂ ≥ … ≥ 0이 그 조각의 크기입니다.</p>' +
      '<p>큰 것부터 k개만 더한 Aₖ가 랭크 k 이하의 행렬 중 A에 <b>가장 가깝습니다</b>(에카르트–영 정리). ' +
      '남은 오차는 버린 특잇값으로 정해집니다: ‖A − Aₖ‖² = σ²ₖ₊₁ + σ²ₖ₊₂ + … (프로베니우스 노름). ' +
      '그래서 (상대 오차)² + 남긴 에너지 = 100%이고, scree plot의 버린 점들이 바로 오차입니다.</p>' +
      '<p><b>이미지</b>: 가로세로에 나란한 정사각형과 물결(sin x · cos y)은 랭크 1이라 몇 조각이면 되지만, ' +
      '원은 여러 조각이, 비스듬한 띠와 잔무늬는 아주 많은 조각이 필요합니다. ' +
      '저장량은 m × n 대신 k(m + n + 1)개. 1000 × 1000 사진이면 k = 50에서 10분의 1이지만, ' +
      '이 120 × 120 이미지에서는 k가 60을 넘으면 오히려 원본보다 커집니다.</p>' +
      '<p><b>PCA = 중심화한 X의 SVD</b>: 유전자(열)마다 평균을 빼고 분해하면 vᵢ가 주성분 방향(loading), ' +
      'uᵢσᵢ가 세포의 점수(score), σᵢ²/(n − 1)이 그 성분의 분산입니다. R의 <code>prcomp()</code>도 안에서 <code>svd()</code>를 씁니다. ' +
      '중심화하지 않으면 첫 조각은 거의 <b>평균</b> 방향이 되어 "설명 비율"이 크게 부풀고, 진짜 구조는 한 칸씩 뒤로 밀립니다.</p>' +
      '<p><b>몇 개를 남길까?</b> scree plot이 꺾이는 곳(elbow)이나 누적 80–90%가 흔한 기준이지만, ' +
      '드문 세포 유형은 분산이 작아 작은 성분에 숨어 있을 수 있습니다. scRNA-seq에서 PC를 10–50개로 넉넉히 잡는 이유입니다. ' +
      '반대로 이 세포 데이터에서 k = 3 뒤에 남는 차이는 거의 잡음이라, 상대 오차가 크게 남아도 구조는 이미 다 잡힌 것입니다. ' +
      'u와 v는 부호가 함께 뒤집혀도 같은 조각이므로, 프로그램마다 PC 그림이 뒤집혀 나오는 것은 정상입니다.</p>' +
      '<p>가상 데이터: 이미지는 교재(선형대수 15장) 그림과 같은 방식으로 만든 것이고, 세포 데이터의 유전자 이름(A1, …, H10)은 묶음을 나타내는 기호입니다.</p>',
  },

  en: {
    title: 'PCA and SVD: low-rank approximation',
    question: 'Keep only k pieces of a matrix and throw the rest away. What survives?',

    dataHead: 'Data',
    dataImg: 'Image',
    dataCells: 'Cells × genes',
    noteImg: '120 × 120 synthetic image (rank 120)',
    noteCells: '300 simulated cells × 40 genes (log expression). Types A, B, C and a rare type D (12 cells)',
    kLabel: 'Rank k (pieces kept)',
    center: 'Center (subtract each gene\'s mean)',
    centerNote: 'On: PCA. Off: plain SVD',

    statK: 'Pieces kept',
    statErr: 'Relative error ‖A−Aₖ‖/‖A‖',
    statKeptImg: 'Energy kept (σ² share)',
    statKeptPca: 'Variance explained (cumulative)',
    statKeptRaw: 'Share of σ² kept (not centered)',
    statStore: 'Storage k(m+n+1)/mn',

    matTitleImg: 'Original · approximation · difference',
    matTitleCells: 'Expression heatmap: genes (rows) × cells (columns, by type)',
    capOrig: 'Original',
    capApprox: 'Rank {k} approximation',
    capResid: 'Difference (original − approx.)',
    legendLow: 'low',
    legendHigh: 'high',
    legendNeg: '−',
    legendPos: '+',
    legendTypes: 'Cell type:',
    typeA: 'A',
    typeB: 'B',
    typeC: 'C',
    typeD: 'D (rare)',
    blockNote: 'Letters on the left = gene groups (A–D: markers of that type, H: unrelated to type)',

    pieceTitle: 'Piece {k}',
    pieceImg: 'σ{k} u{k} v{k}ᵀ — left strip u{k} × top strip v{k}',
    pieceSigma: 'σ{k} = {s} ({r} of the first piece)',
    pieceSigma1: 'σ₁ = {s} (the largest piece)',
    pieceScale: 'colors scaled to this piece',
    scoresTitle: 'Cell scores (u{k} σ{k}) by type',
    loadingsTitle: 'Gene weights (v{k}, loadings)',
    axisScore: 'score',

    screeTitle: 'Scree plot',
    screeAxis: 'σᵢ² / Σσ² (%)',
    screeAxisLog: 'σᵢ² / Σσ² (%, log scale)',
    screeX: 'piece i',
    screeKept: 'kept {k}',
    screeDropped: 'dropped',
    screeTip: 'piece {i}: {p}',
    legendKept: 'kept pieces',
    legendDropped: 'dropped pieces',

    taskImg1:
      'Raise k to 1, 2, 3, … Which becomes sharp first: the square, the disk or the diagonal band? ' +
      'Connect this to the fact that <b>Piece k</b> is always built from "a vertical strip × a horizontal strip".',
    taskImg2:
      'At what k does the relative error drop below 10%? What is the storage then? ' +
      'Check that (relative error)² + energy kept = 100%, and compare with the dropped points in the scree plot.',
    taskImg3: 'Raise k to 20, 40, 80 and watch the difference image. What pattern survives longest? Also find the k where storage exceeds 100%.',
    taskCells1: 'Raise k to 1, 2, 3 and compare the original and approximate heatmaps. When does each marker group A, B, C, D appear?',
    taskCells2:
      'If you picked k from the scree plot alone, what would you choose? Can that k tell the rare type D apart? ' +
      'Check the score plot under <b>Piece k</b>.',
    taskCells3:
      'Turn <b>Center</b> off and look at k = 1. What does the first piece capture, and what share does it "keep"? How large must k be now for D to appear?',

    explain:
      '<p>The <b>singular value decomposition (SVD)</b> writes any m × n matrix as A = UΣVᵀ = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + … ' +
      'Each term σᵢuᵢvᵢᵀ is a <b>rank-1</b> piece: the entry in row i, column j is σᵢ × (i-th entry of uᵢ) × (j-th entry of vᵢ), ' +
      'so as an image it is "a vertical strip (uᵢ) × a horizontal strip (vᵢ)". σ₁ ≥ σ₂ ≥ … ≥ 0 give the sizes of the pieces.</p>' +
      '<p>Adding the k largest pieces gives Aₖ, the <b>closest</b> matrix to A among all matrices of rank at most k (Eckart–Young theorem). ' +
      'The remaining error is set by the dropped singular values: ‖A − Aₖ‖² = σ²ₖ₊₁ + σ²ₖ₊₂ + … (Frobenius norm). ' +
      'So (relative error)² + energy kept = 100%, and the dropped points in the scree plot are exactly the error.</p>' +
      '<p><b>Image</b>: the axis-aligned square and the wave (sin x · cos y) are rank 1, so a few pieces suffice, ' +
      'but the disk needs several and the diagonal band and fine texture need many. ' +
      'Storage is k(m + n + 1) numbers instead of m × n. For a 1000 × 1000 photo, k = 50 needs a tenth, ' +
      'but for this 120 × 120 image any k above 60 is larger than the original.</p>' +
      '<p><b>PCA = SVD of the centered X</b>: subtract each gene\'s (column\'s) mean and decompose; vᵢ is the principal direction (loading), ' +
      'uᵢσᵢ the cell scores, and σᵢ²/(n − 1) the variance of that component. R\'s <code>prcomp()</code> calls <code>svd()</code> internally. ' +
      'Without centering, the first piece points almost along the <b>mean</b>, its "share" is hugely inflated, and the real structure moves back one place.</p>' +
      '<p><b>How many to keep?</b> The elbow of the scree plot or 80–90% cumulative are common rules, ' +
      'but a rare cell type has little variance and can hide in a small component. That is why scRNA-seq analyses keep a generous 10–50 PCs. ' +
      'Conversely, in this cell data what remains after k = 3 is almost pure noise, so the structure is all captured even though the relative error stays large. ' +
      'Flipping the signs of both u and v gives the same piece, so PC plots coming out mirrored in different programs is normal.</p>' +
      '<p>Simulated data: the image is made the same way as the figure in the linear algebra book (ch. 15), and the gene names in the cell data (A1, …, H10) just label the groups.</p>',
  },
};
