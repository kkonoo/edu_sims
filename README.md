# edu_sims

수업용 인터랙티브 시뮬레이터 모음입니다. 슬라이더를 움직이면 결과가 바로 바뀌고, Quarto 교재에 iframe으로 끼워 넣어 씁니다.

- 사이트: <https://kkonoo.github.io/edu_sims/>
- 빌드 없음: HTML/CSS/JS 그대로. 차트만 CDN의 [Observable Plot](https://observablehq.com/plot/) 0.6.17 (+ d3 7.9.0)

| 시뮬레이터 | 주소 | 쓰이는 교재 |
|---|---|---|
| 다중검정과 FDR | [`sims/multiple-testing/`](https://kkonoo.github.io/edu_sims/sims/multiple-testing/) | BI_for_Biomed_KNUmed, advanced_BI_for_MD_PhD_KNUmed |

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
| `big` | `1`이면 글자 크게 (프로젝터용. 헤더의 **가+** 버튼과 같음) | — |
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
     method: { options: ['a', 'b'], default: 'a' },             // 라디오
     ```

   - 난수는 `EduSim.rng(state.seed)`(`uniform()`, `normal()`)를 쓰면 다시 뽑기·시드 표시·URL이 자동으로 따라옵니다.
   - 그래프 색은 `EduSim.css('--c1')` ~ `--c4` (파랑·주황·청록·보라, 색각이상 검증 통과), 합친 값은 `--c-neutral`.

4. **(계산이 복잡하면) 테스트** — 계산을 `model.js`로 따로 빼고 `test.html`에서 검사합니다. [`sims/multiple-testing/test.html`](sims/multiple-testing/test.html) 참고.

5. **갤러리 등록** — [`gallery.js`](gallery.js)의 `SIMS`에 한 항목을 추가합니다.

   ```js
   {
     id: '새-이름',                                   // 폴더 이름
     title: { ko: '…', en: '…' },                     // text.js의 title과 같게
     question: { ko: '…', en: '…' },                  // text.js의 question과 같게
     books: ['3_linear_regression'],                  // 아래 BOOKS의 키
   },
   ```

   제목·질문은 `gallery.js`와 `text.js` 두 곳에 있으니 고칠 때 같이 고칩니다. 교재를 추가하거나 이름을 바꾸려면 같은 파일의 `BOOKS`를 고칩니다.

6. **확인** — 브라우저로 열어서 `⟦…⟧`가 없는지, `?lang=en`, `?embed=1`, 폰 폭, **가+**(글자 크게)에서 보기 좋은지 확인합니다.

---

## 로컬에서 보기 · 테스트

- 파일을 더블클릭해서 열어도 됩니다(그래프 라이브러리는 CDN에서 받으므로 인터넷은 필요).
- 또는 저장소 폴더에서 `python3 -m http.server` 후 <http://localhost:8000>
- 테스트: `sims/multiple-testing/test.html`을 열면 맨 위에 결과가 나옵니다(현재 38개). p값과 BH 보정값의 기댓값은 R 4.5.1에서 뽑았고, 그 R 코드가 테스트 파일 주석에 있습니다.

## 구조

```
index.html, gallery.js      갤러리와 등록부(교재 목록 포함)
shared/style.css            공통 레이아웃·조작·색
shared/sim.js               공통 모듈 EduSim: URL 상태, 언어, 난수, 시드, embed 높이 알림, 글자 크게
shared/test.js              브라우저 테스트 도우미
sims/_template/             새 시뮬레이터용 틀
sims/multiple-testing/      다중검정과 FDR (index.html, text.js, model.js, main.js, test.html)
quarto/edu-sims-resize.html Quarto include용 높이 자동 조절 스크립트
.nojekyll                   GitHub Pages가 _template 폴더도 그대로 서빙하도록
```

## 배포

GitHub 저장소 **Settings → Pages → Build and deployment**에서 *Deploy from a branch*, `main` / `(root)`를 고르면 <https://kkonoo.github.io/edu_sims/>에 올라갑니다. 푸시 후 1–2분 뒤 반영됩니다.
