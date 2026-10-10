# edu_sims

수업용 인터랙티브 시뮬레이터 모음입니다. 슬라이더를 움직이면 결과가 바로 바뀌고, Quarto 교재에 iframe으로 끼워 넣어 씁니다.

- 사이트: <https://kkonoo.github.io/edu_sims/>
- 빌드 없음: HTML/CSS/JS 그대로. 차트만 CDN의 [Observable Plot](https://observablehq.com/plot/) 0.6.17 (+ d3 7.9.0)
- 라이트·다크 모드: 헤더 오른쪽의 반쯤 칠한 원 버튼. 처음에는 운영체제 설정을 따르고, 버튼으로 고르면 브라우저에 저장되어 사이트 전체에 적용됩니다.
- 학교·병원 네트워크처럼 CDN(`cdn.jsdelivr.net`)이 막혀 그래프 라이브러리를 못 받으면, 질문 아래에 이유와 해결 방법을 알리는 안내가 뜹니다(표·숫자·조작은 그대로 동작).

| 시뮬레이터 | 주소 | 쓰이는 교재 |
|---|---|---|
| 다중검정과 FDR | [`sims/multiple-testing/`](https://kkonoo.github.io/edu_sims/sims/multiple-testing/) | BI 입문(핵심 주제), 회귀(변수선택), 고급 BI(GWAS) |
| 사전분포 × 가능도 → 사후분포 | [`sims/prior-posterior/`](https://kkonoo.github.io/edu_sims/sims/prior-posterior/) | 베이즈 W1–3 |
| 2×2 행렬과 고유벡터 | [`sims/matrix-2x2/`](https://kkonoo.github.io/edu_sims/sims/matrix-2x2/) | 선형대수 2·11·12장 |
| 최소제곱: 잔차·이상치·leverage | [`sims/least-squares/`](https://kkonoo.github.io/edu_sims/sims/least-squares/) | 회귀 1·3부, 선형대수 9장 |
| Ridge와 Lasso: λ와 수축 | [`sims/ridge-lasso/`](https://kkonoo.github.io/edu_sims/sims/ridge-lasso/) | 회귀 5부, 베이즈 W8 |
| 교란변수와 배치효과 | [`sims/confounding/`](https://kkonoo.github.io/edu_sims/sims/confounding/) | BI 입문(핵심 주제), 고급 BI(연구설계), 회귀 |
| PCA·SVD: 저랭크 근사 | [`sims/pca-svd/`](https://kkonoo.github.io/edu_sims/sims/pca-svd/) | 선형대수 13·15장, BI 입문(scRNA), 고급 BI(single-cell) |
| MCMC: 제안 폭과 체인의 움직임 | [`sims/mcmc/`](https://kkonoo.github.io/edu_sims/sims/mcmc/) | 베이즈 W5–6 |
| 네트워크 null model: 차수 보존 재배선 | [`sims/network-null/`](https://kkonoo.github.io/edu_sims/sims/network-null/) | 그래프 04장 |

---

## Quarto 교재에 끼워 넣기

### 1. 높이 자동 조절 스크립트 등록 (교재 프로젝트마다 한 번)

1. 이 저장소의 [`quarto/edu-sims-resize.html`](quarto/edu-sims-resize.html)을 교재 프로젝트 폴더(`_quarto.yml` 옆)에 복사합니다.
2. `_quarto.yml`에 추가합니다.

   ```yaml
   format:
     html:
       include-after-body: edu-sims-resize.html
   ```

   이미 `include-after-body`를 쓰고 있다면 목록으로 씁니다.

   ```yaml
       include-after-body:
         - 기존-파일.html
         - edu-sims-resize.html
   ```

시뮬레이터는 내용 높이가 바뀔 때마다(설명을 펼치거나 화면 폭이 바뀔 때) 부모 페이지에 알리고, 이 스크립트가 **그 메시지를 보낸 iframe의 높이만** 바꿉니다. 스크립트가 없어도 iframe은 보이지만 높이가 아래 `height` 값으로 고정됩니다.

### 2. `.qmd`에 붙여 넣기

````markdown
::: {.column-page}
```{=html}
<iframe src="https://kkonoo.github.io/edu_sims/sims/multiple-testing/?embed=1&lang=ko"
        title="다중검정과 FDR" loading="lazy"
        style="width: 100%; height: 1300px; border: 0;"></iframe>
```
:::
````

- `embed=1`: 헤더·푸터를 숨기고 본체만 보여 줍니다.
- `lang=ko` / `lang=en`: 영어 교재에는 `lang=en`.
- 교재에 끼워 넣으면 교재(라이트 테마)에 맞춰 늘 라이트로 보입니다. 다크 배경 페이지에 넣을 때만 `&theme=dark`를 붙이세요.
- `::: {.column-page}`: 본문(약 800px)보다 넓게(약 1000px) 펼쳐서 조작 패널과 그래프가 나란히 보이게 합니다. 빼도 동작합니다.
- `height: 1300px`: 스크립트가 실제 높이로 바꾸기 전의 초기값입니다.

### 3. 특정 설정으로 고정해서 넣기

슬라이더 상태와 시드가 모두 주소(URL)에 들어 있습니다.

1. 시뮬레이터를 브라우저에서 열고 원하는 상태로 맞춥니다(필요하면 **다시 뽑기**로 마음에 드는 시드를 고름).
2. 주소창의 URL을 복사합니다.
3. 끝에 `&embed=1`을 붙여 `src`에 넣습니다.

예: 관찰 과제 1(효과 없음 + 보정 없음) 상태로 시작

```
https://kkonoo.github.io/edu_sims/sims/multiple-testing/?embed=1&lang=ko&m=1000&pi1=0&effect=3&alpha=0.05&method=none&hist=stack&seed=1
```

학생은 그 상태에서 시작해 자유롭게 조작할 수 있습니다.

### URL 파라미터

| 파라미터 | 값 | 기본 |
|---|---|---|
| `lang` | `ko`, `en` | `ko` |
| `embed` | `1`이면 본체만 | — |
| `theme` | `light`, `dark` — 주면 그 테마로 고정. 안 주면 헤더 버튼으로 고른 값 → 운영체제 설정 (embed는 라이트) | — |
| `big` | `1`이면 글자 크게 (프로젝터용) | — |
| `seed` | 1–99999 | 1 |

**다중검정과 FDR** (`sims/multiple-testing/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `m` | 검정 수 | 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000 | 1000 |
| `pi1` | 실제로 효과가 있는 비율 π₁ | 0–0.5 (0.01 단위) | 0.1 |
| `effect` | 효과 크기 (z 평균 이동) | 0–6 (0.1 단위) | 3 |
| `alpha` | α 또는 q | 0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2 | 0.05 |
| `method` | 보정 방법 | `none`, `bonf`, `bh` | `bh` |
| `hist` | 히스토그램 | `stack`(겹쳐 쌓기), `pool`(합쳐 보기) | `stack` |

**사전분포 × 가능도 → 사후분포** (`sims/prior-posterior/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `m0` | 사전 평균 | 0.01–0.99 (0.01 단위) | 0.5 |
| `s0` | 사전 강도 a+b | 1, 2, 3, 5, 10, 20, 30, 50, 100, 200 | 2 (균등 Beta(1, 1)) |
| `mode` | 데이터 | `draw`(뽑기), `input`(직접 입력) | `draw` |
| `theta` | 참 반응률 θ* (뽑기) | 0.01–0.99 | 0.7 |
| `ndraw` | 시행 수 (뽑기) | 0–10은 1씩, 그 위로 12, 15, 20 … 1000 | 20 |
| `n`, `k` | 시행 수, 반응 수 (직접 입력) | n 0–200, k 0–n | 10, 7 |

예: 교재 예제 "20명 중 14명 반응, 균등 사전분포"로 시작 → `?embed=1&mode=input&n=20&k=14&m0=0.5&s0=2`

**2×2 행렬과 고유벡터** (`sims/matrix-2x2/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `a`, `b`, `c`, `d` | 행렬 A = [a b; c d] | −3–3 (0.01 단위) | 1, 1, 0, 2 |
| `t` | 변형 정도: (1 − t)I + tA | 0–1 | 1 |
| `vx`, `vy` | 시험 벡터 v | −4–4 (0.1 단위) | 1.5, 1 |
| `eig` | 고유벡터 선 보이기 | `on`, `off` | `on` |
| `seed` | 마지막으로 뽑은 무작위 행렬의 시드 (표시용, 행렬은 a–d로 정해짐) | 1–99999 | 1 |

예: 관찰 과제 2 "대칭행렬, 고유벡터 숨기고 v로 찾기" → `?embed=1&a=2&b=1&c=1&d=2&eig=off`

**최소제곱: 잔차·이상치·leverage** (`sims/least-squares/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `pts` | 점 목록 `x,y;x,y;…` (0 ~ 10, 0.1 단위, 3 ~ 40개). 비우면 `seed`로 만든 데이터 | 문자열 | "깨끗한" 프리셋 |
| `resid` | 잔차 세로선 | `on`, `off` | `on` |
| `sq` | 잔차 제곱(정사각형) | `on`, `off` | `off` |
| `seed` | `pts`가 비었을 때 데이터를 만드는 시드 | 1–99999 | 1 |

점을 끌어 만든 배치는 주소창 URL에 그대로 들어 있으니, 그 URL에 `&embed=1`을 붙여 교재에 넣으면 됩니다.

**Ridge와 Lasso** (`sims/ridge-lasso/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `method` | 방법 | `ridge`, `lasso` | `lasso` |
| `loglam` | log₁₀ λ | −3 ~ 2 (0.05 단위) | −1 (λ = 0.1) |
| `rho` | 예측변수끼리의 상관 | 0 ~ 0.9 (0.05 단위) | 0.3 |
| `truth` | 참값 표시 | `on`, `off` | `on` |
| `seed` | 데이터 시드 | 1–99999 | 1 |

예: 관찰 과제 2 "Ridge, 큰 λ" → `?embed=1&method=ridge&loglam=1`

**교란변수와 배치효과** (`sims/confounding/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `mode` | 상황 | `cont`(연속 x, Simpson), `treat`(처리 vs 대조) | `cont` |
| `bc`, `gc`, `shift` | 연속 모드: 진짜 기울기 β, 배치 효과 γ, 교란 강도 | −1.5–1.5, −4–4, 0–3 | 0.8, −3, 2 |
| `bt`, `gt`, `frac` | 처리 모드: 진짜 처리 효과 β, 배치 효과 γ, 배치 1의 처리군 비율 | −2–2, −3–3, 0.5–1 | 0, 2, 0.8 |
| `batch` | 배치 정보 보기 | `on`, `off` | `on` |
| `seed` | 데이터 시드 | 1–99999 | 1 |

예: 수업에서 "배치를 모를 때" 그림부터 보여 주고 나중에 켜기 → `?embed=1&batch=off`

**PCA·SVD: 저랭크 근사** (`sims/pca-svd/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `data` | 데이터 | `img`(120 × 120 합성 이미지), `cells`(가상 세포 300 × 유전자 40) | `img` |
| `ki` | 이미지 탭의 랭크 k (남길 조각 수) | 1–120 | 5 |
| `kc` | 세포 탭의 랭크 k | 1–40 | 2 |
| `center` | 세포 탭: 유전자마다 평균 빼기 (켜면 PCA, 끄면 그냥 SVD) | `on`, `off` | `on` |
| `seed` | 이미지의 무늬·도형 위치와 세포 데이터를 함께 정하는 시드 | 1–99999 | 1 |

예: 관찰 과제 "중심화를 끄고 k = 1" → `?embed=1&data=cells&center=off&kc=1`

**MCMC: 제안 폭과 체인의 움직임** (`sims/mcmc/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `target` | 목표분포 | `norm`(상관 정규), `bimodal`(두 봉우리) | `norm` |
| `rho` | 상관 정규의 상관 ρ | 0–0.99 (0.01 단위) | 0.9 |
| `tau` | 제안 표준편차 τ | 0.02, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5, 7, 10, 15, 20 | 1 |
| `chains` | 체인 수 (4개면 네 모서리에서 출발하고 R̂를 계산) | `1`, `4` | `1` |
| `n` | 보여 줄 걸음 수 (재생 막대) | 0–5000 | 500 |
| `speed` | 재생 속도 (초당 걸음) | 5, 20, 100, 500, 2500 | 100 |
| `seed` | 제안과 수용 판정에 쓰는 난수의 시드 (τ를 바꿔도 같은 난수) | 1–99999 | 1 |

예: 관찰 과제 3 "두 봉우리, τ = 0.5, 체인 4개, 끝까지" → `?embed=1&target=bimodal&tau=0.5&chains=4&n=5000`

**네트워크 null model: 차수 보존 재배선** (`sims/network-null/`)

| 파라미터 | 뜻 | 값 | 기본 |
|---|---|---|---|
| `swaps` | null 네트워크마다 재배선 시도 횟수 (× 엣지 수 m = 78) | 0, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50 | 10 |
| `n` | 쌓은 null 네트워크 수 (재생 막대) | 0–1000 | 1000 |
| `speed` | 재생 속도 (초당 null 수) | 5, 20, 100, 500 | 100 |
| `seed` | 재배선 난수의 시드 (null #i는 시드 × 1000 + i) | 1–99999 | 1 |

데이터는 Zachary karate club(networkx `karate_club_graph`와 같음) 하나입니다. 예: 관찰 과제 2 "재배선이 모자랄 때" → `?embed=1&swaps=0.1`

범위를 벗어난 값은 가장 가까운 허용값(또는 기본값)으로 바뀝니다.

---

## 새 시뮬레이터 추가하기

1. **폴더 복사**

   ```sh
   cp -r sims/_template sims/새-이름
   ```

   폴더 이름(영문 소문자와 하이픈)이 주소가 됩니다: `.../sims/새-이름/`

2. **문구 사전** — `text.js`

   화면에 보이는 글자는 모두 여기에 씁니다. `title`(탭·헤더 제목), `question`(맨 위 질문 한 줄), 관찰 과제, 설명. `ko`와 `en`의 키가 같아야 하고, 빠진 키는 화면에 `⟦키⟧`로 나타나서 바로 보입니다. "조작", "이렇게 해 보세요", "다시 뽑기" 같은 공통 문구는 `shared/sim.js`에 이미 있습니다.

3. **조작과 그래프** — `index.html`, `main.js`

   - 슬라이더: `<input type="range" data-param="이름">`, 현재 값: `<output data-out="이름">`, 라디오: `<input type="radio" name="이름" value="…">`
   - 문구 자리: `data-t="키"` (글자만), `data-t-html="키"` (`<b>` 등 포함)
   - `main.js`의 `params`에 조작값을 정의하면 URL 반영·범위 검사·값 표시가 자동입니다.

     ```js
     n:      { values: [10, 20, 50], default: 20 },             // 눈금 슬라이더
     p:      { min: 0, max: 1, step: 0.01, default: 0.5 },      // 연속 슬라이더
     k:      { min: 0, max: (s) => s.n, step: 1, default: 3 },  // 범위가 다른 값에 따라 바뀜 (k ≤ n)
     method: { options: ['a', 'b'], default: 'a' },             // 라디오
     ```

   - 숫자를 정확히 넣어야 하면 슬라이더 옆에 `<input type="number" data-param="이름">`을 둡니다(Enter나 칸을 벗어날 때 반영).
   - 여러 값을 한 번에 바꾸는 버튼: `<button data-set='{"p":0.5,"n":20}'>`. 지금 값과 같으면 눌린 모양이 됩니다.
   - 켜고 끄는 값: `{ options: ['on', 'off'] }` + `<input type="checkbox" data-param="이름">`.
   - 그림에서 점 끌기: `EduSim.drag(요소, { pick(x, y), move(대상, x, y), end() })`. 누르기만 하면 아무것도 움직이지 않고, 터치에서는 점을 잡은 손가락만 스크롤을 막습니다. Plot 그림 위에서도 동작합니다([`sims/matrix-2x2/main.js`](sims/matrix-2x2/main.js), [`sims/least-squares/main.js`](sims/least-squares/main.js) 참고).
   - URL에 문자열을 담으려면 `{ str: true, default: '' }` (예: 점 목록).
   - 재생(애니메이션): `EduSim.create({ play: { param: 'n', speed: 'speed' } })`와 `<button data-action="play">`, `<button data-action="rewind">`. `n`이 초당 `speed`만큼 늘고, 끝에 닿거나 `n`의 슬라이더를 손으로 끌면 멈춥니다. 재생 중인지는 `sim.isPlaying()` ([`sims/mcmc/main.js`](sims/mcmc/main.js) 참고).

   - 난수는 `EduSim.rng(state.seed)`(`uniform()`, `normal()`)를 쓰면 다시 뽑기·시드 표시·URL이 자동으로 따라옵니다.
   - 그래프 색은 `EduSim.css('--c1')` ~ `--c4` (파랑·주황·청록·보라, 색각이상 검증 통과), 합친 값은 `--c-neutral`. 경고·강조는 `--warn`, `--warn-bg`, `--warn-ink`.
   - 색은 늘 CSS 변수로만 씁니다(16진수를 직접 쓰지 않기). 그러면 다크 모드에서 `shared/style.css`의 다크 값(바탕 `#1a1a19`에 맞춰 따로 검증한 팔레트)으로 저절로 바뀝니다. 테마를 바꾸면 `render`가 다시 불리므로 색을 그때그때 읽으면 되고, 색을 캐시하는 그림(캔버스에 쌓아 그리기 등)은 캐시 키에 `EduSim.theme`을 넣습니다.

4. **(계산이 복잡하면) 테스트** — 계산을 `model.js`로 따로 빼고 `test.html`에서 검사합니다. [`sims/multiple-testing/test.html`](sims/multiple-testing/test.html) 참고.

5. **갤러리 등록** — [`gallery.js`](gallery.js)의 `SIMS`에 한 항목을 추가합니다.

   ```js
   {
     id: '새-이름',                                   // 폴더 이름
     title: { ko: '…', en: '…' },                     // text.js의 title과 같게
     question: { ko: '…', en: '…' },                  // text.js의 question과 같게
     books: [['3_linear_regression', '3부']],        // [BOOKS의 키, 어디에 쓰이는지] → 칩 "회귀 · 3부"
   },
   ```

   제목·질문은 `gallery.js`와 `text.js` 두 곳에 있으니 고칠 때 같이 고칩니다. 교재를 추가하거나 이름을 바꾸려면 같은 파일의 `BOOKS`를 고칩니다.

6. **확인** — 브라우저로 열어서 `⟦…⟧`가 없는지, `?lang=en`, `?embed=1`, 폰 폭, 다크 모드(`?theme=dark`), 글자 크게(`?big=1`)에서 보기 좋은지 확인합니다.

---

## 로컬에서 보기 · 테스트

- 파일을 더블클릭해서 열어도 됩니다(그래프 라이브러리는 CDN에서 받으므로 인터넷은 필요. 연결이 안 되면 안내가 뜹니다).
- 또는 저장소 폴더에서 `python3 -m http.server` 후 <http://localhost:8000>
- 테스트: 시뮬레이터 폴더의 `test.html`을 열면 맨 위에 결과가 나옵니다. 기댓값은 R 4.5.1에서 뽑았고, 그 R 코드가 각 테스트 파일 주석에 있습니다.
  - `sims/multiple-testing/test.html` (38개): p값, BH 보정값(R `p.adjust`), 몬테카를로 FDR·FWER
  - `sims/prior-posterior/test.html` (41개): `lgamma`·`dbeta`·`pbeta`·`qbeta`, 켤레 공식, 신용구간 포함률
  - `sims/matrix-2x2/test.html` (32개): 고유값·고유벡터(R `eigen`), 복소·중근·전단·cI 구분, tr·det 관계, 무작위 행렬 3,000개
  - `sims/least-squares/test.html` (25개): R `lm`의 계수·R²·σ̂·`hatvalues`·`rstandard`·`cooks.distance`, 잔차의 직교성, Cook 거리 정의
  - `sims/confounding/test.html` (31개): R `lm(y ~ x)`·`lm(y ~ x + factor(batch))`의 계수·표준오차, `qt`, 누락변수 편향 공식과 신뢰구간 포함률(몬테카를로), 완전 교란 감지
  - `sims/ridge-lasso/test.html` (29개): Ridge 닫힌 해(R), Lasso의 KKT 조건·직교 설계의 정확한 해·λ 극한, 경로의 단조성, 기하 그림의 접점 (glmnet은 이 작업 환경에서 설치할 수 없어 비교하지 않음)
  - `sims/pca-svd/test.html` (43개): R `svd()`(작은 행렬 6개: 가로·세로로 긴 것, 랭크 부족, 중근, 힐베르트 / 시드 1 이미지의 특잇값 120개), R `prcomp()`의 sdev·loading·점수·누적 비율, 직교성·복원·에카르트–영(오차 공식과 "가장 가까움"), 모양별 랭크, 드문 유형 D가 PC3(중심화 안 하면 PC4)에 나오는지(시드 100개), 수렴 속도
  - `sims/mcmc/test.html` (45개): 교재 W6의 R 함수 `ess_basic`·`split_rhat`·`var_plus_hat`(체인 6세트, ESS > 표본 수인 반상관 체인 포함)와 R `acf`, 수용률의 정확한 값(정규 목표의 닫힌 꼴, 두 봉우리는 독립표본으로), 정상분포 유지, Var(평균) ≈ 분산/ESS, 목표밀도의 정규화·주변분포, 수용·기각 규칙, 수업 의도(시드 30개: τ별 ESS 순서, 봉우리에 갇혀도 멀쩡해 보이는 체인, R̂)
  - `sims/network-null/test.html` (35개): networkx karate club의 차수·삼각형·평균 뭉침 계수·transitivity, R 인접행렬 계산(tr(A³)/6, 노드별 C)과 비교, 재배선 뒤 차수 그대로·자기루프 없음·중복 엣지 없음(그래프 880개 + 무작위 그래프 200개), 같은 차수의 그래프를 모두 나열한 균등성 카이제곱, Z·p 공식, transitivity와 삼각형의 Z가 같음, 교재 표와 비교, 재배선 횟수에 따른 안정, 시드 10개에서 지표별 결론

## 구조

```
index.html, gallery.js      갤러리와 등록부(교재 목록 포함)
shared/style.css            공통 레이아웃·조작·색 (라이트·다크 두 벌)
shared/sim.js               공통 모듈 EduSim: URL 상태, 언어, 테마, 난수, 시드, 재생, embed 높이 알림, CDN 차단 안내
shared/test.js              브라우저 테스트 도우미
sims/_template/             새 시뮬레이터용 틀
sims/multiple-testing/      다중검정과 FDR (index.html, text.js, model.js, main.js, test.html)
sims/prior-posterior/       사전분포 × 가능도 → 사후분포 (같은 구성)
sims/matrix-2x2/            2×2 행렬과 고유벡터 (같은 구성, 차트 라이브러리 없이 SVG)
sims/least-squares/         최소제곱: 잔차·이상치·leverage (같은 구성)
sims/ridge-lasso/           Ridge와 Lasso: λ와 수축 (같은 구성)
sims/confounding/           교란변수와 배치효과 (같은 구성)
sims/pca-svd/               PCA·SVD: 저랭크 근사 (같은 구성, 행렬 그림은 캔버스)
sims/mcmc/                  MCMC: 제안 폭과 체인의 움직임 (같은 구성, 재생 기능, 점·선은 캔버스)
sims/network-null/          네트워크 null model: 차수 보존 재배선 (같은 구성, 재생 기능, 네트워크는 SVG)
quarto/edu-sims-resize.html Quarto include용 높이 자동 조절 스크립트
.nojekyll                   GitHub Pages가 _template 폴더도 그대로 서빙하도록
```

## 배포

GitHub 저장소 **Settings → Pages → Build and deployment**에서 *Deploy from a branch*, `main` / `(root)`를 고르면 <https://kkonoo.github.io/edu_sims/>에 올라갑니다. 푸시 후 1–2분 뒤 반영됩니다.
