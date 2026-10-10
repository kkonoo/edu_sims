/*
 * edu_sims 공통 모듈 — 일반 <script>로 <head>에서 불러 씁니다(전역 EduSim 하나만 만듦).
 * ES 모듈을 쓰지 않는 이유: 파일을 더블클릭(file://)으로 열어도 동작하게 하려고.
 *
 *  URL 공통 파라미터: lang=ko|en, embed=1(헤더·푸터 숨김 + 부모에 높이 알림), big=1(글자 크게), seed=정수
 *
 *  const sim = EduSim.create({
 *    text:   { ko: {...}, en: {...} },          // 문구 사전. 'title' 키는 필수(탭 제목·헤더)
 *    params: {                                  // URL과 동기화되는 조작값
 *      n:      { values: [10, 20, 50], default: 20 },             // 눈금 슬라이더
 *      p:      { min: 0, max: 1, step: 0.01, default: 0.5 },     // 연속 슬라이더
 *      k:      { min: 0, max: (s) => s.n, step: 1, default: 3 }, // 범위가 다른 값에 따라 바뀜 (앞에 정의된 값만 참조)
 *      method: { options: ['a', 'b'], default: 'a' },            // 라디오
 *      pts:    { str: true, default: '' },                        // 문자열 그대로 (비어 있으면 URL에 안 씀)
 *    },
 *    render(state, sim) { ... },                // 값이 바뀔 때마다 한 프레임에 한 번 호출
 *  });
 *
 *  HTML 쪽 약속
 *    <input type="range" data-param="n">        범위·눈금은 params에서 자동 설정
 *    <input type="number" data-param="n">       숫자 직접 입력 (Enter나 칸을 벗어날 때 반영)
 *    <button data-set='{"p":0.5,"n":20}'>       여러 값을 한 번에 (지금 값과 같으면 aria-pressed="true")
 *    <input type="radio" name="method" value="a">
 *    <input type="checkbox" data-param="show">  켜짐 = options[0], 꺼짐 = options[1]  (예: { options: ['on', 'off'] })
 *    <output data-out="n">                      현재 값 표시 (params[n].format 이 있으면 사용)
 *    <span data-t="key">                        문구 교체 (자식 요소가 없는 요소에만)
 *    <p data-t-html="key">                      HTML 문구 교체 (설명처럼 <b> 등이 필요할 때)
 *    <button data-action="reroll">              다시 뽑기
 *    <span data-seed>                           "시드 1234" 표시
 *    .sim-figs                                  폭이 바뀌면 다시 그림
 */
(function () {
  'use strict';

  var query = new URLSearchParams(location.search);
  var html = document.documentElement;

  var EduSim = {
    lang: query.get('lang') === 'en' ? 'en' : 'ko',
    embed: query.get('embed') === '1',
    big: query.get('big') === '1',
    SEED_MAX: 99999,
  };

  // <head>에서 바로 적용해 헤더가 잠깐 보였다 사라지는 깜빡임을 막음
  html.lang = EduSim.lang;
  html.classList.toggle('embed', EduSim.embed);
  html.classList.toggle('big', EduSim.big);

  var COMMON_TEXT = {
    ko: {
      panel: '조작',
      tasksTitle: '이렇게 해 보세요',
      explainTitle: '설명 (눌러서 펼치기)',
      reroll: '🎲 다시 뽑기',
      seed: '시드',
      big: '가+',
      bigTitle: '글자 크게 보기 (프로젝터용)',
      footer: '수업용 인터랙티브 시뮬레이터',
    },
    en: {
      panel: 'Controls',
      tasksTitle: 'Try this',
      explainTitle: 'Explanation (click to expand)',
      reroll: '🎲 New draw',
      seed: 'seed',
      big: 'A+',
      bigTitle: 'Larger text (for projectors)',
      footer: 'Interactive simulators for teaching',
    },
  };

  /* ---------- 난수: mulberry32 + Box–Muller (시드가 같으면 항상 같은 수열) ---------- */
  EduSim.rng = function (seed) {
    var a = seed >>> 0;
    var spare = null;
    function uniform() { // [0, 1)
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function normal() { // N(0, 1)
      if (spare !== null) { var s = spare; spare = null; return s; }
      var r = Math.sqrt(-2 * Math.log(1 - uniform())); // 1 - u ∈ (0, 1] 이라 log(0) 없음
      var th = 2 * Math.PI * uniform();
      spare = r * Math.sin(th);
      return r * Math.cos(th);
    }
    return { uniform: uniform, normal: normal };
  };

  EduSim.newSeed = function (old) {
    var s;
    do { s = 1 + Math.floor(Math.random() * EduSim.SEED_MAX); } while (s === old);
    return s;
  };

  /* ---------- 드래그 ----------
   * el(다시 그려도 그대로 남는 요소) 안에서 누르면 pick(x, y)가 잡을 대상을 고르고(없으면 null),
   * 끄는 동안 move(대상, x, y), 놓으면 end()(있으면)를 부름. x, y는 el 왼쪽 위 기준 px.
   * 점이 커서로 튀지 않게 하려면 pick에서 (점 위치 − 누른 위치)를 기억해 move에서 더해 쓰세요.
   * 터치: 잡는 점에서 시작한 터치만 스크롤을 막고, 그 밖을 쓸 때는 페이지가 그대로 스크롤됨 */
  EduSim.drag = function (el, opts) {
    var target = null;
    function pos(e) { var r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    // 캡처 단계에서 받음: Plot의 툴팁은 마우스로 점을 누르면 이벤트를 멈춰 버리므로(눌러서 고정) 그보다 먼저 처리
    el.addEventListener('pointerdown', function (e) {
      var p = pos(e);
      target = opts.pick(p[0], p[1]);
      if (target == null) return;
      e.preventDefault();
      e.stopPropagation(); // 점을 잡았으면 툴팁 고정은 하지 않음
      el.setPointerCapture(e.pointerId); // 누르기만 하고 떼면 아무것도 움직이지 않음
    }, true);
    el.addEventListener('pointermove', function (e) {
      if (target == null) return;
      var p = pos(e);
      opts.move(target, p[0], p[1]);
    });
    function end() {
      if (target != null && opts.end) opts.end();
      target = null;
    }
    // pointerdown이 touchstart보다 먼저 오므로, 점을 잡은 터치면 여기서 스크롤을 막음
    // (그림을 매번 다시 그려서 SVG 요소의 touch-action만으로는 브라우저가 중간에 스크롤을 시작함)
    function block(e) { if (target != null) e.preventDefault(); }
    el.addEventListener('touchstart', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  };

  /* ---------- 숫자 표시 ---------- */
  EduSim.fmt = function (v, digits) {
    if (v == null || !isFinite(v)) return '—';
    var d = digits || 0;
    return v.toLocaleString(EduSim.lang === 'en' ? 'en-US' : 'ko-KR',
      { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  EduSim.pct = function (v, digits) {
    return v == null || !isFinite(v) ? '—' : EduSim.fmt(100 * v, digits == null ? 1 : digits) + '%';
  };

  /* ---------- 그래프 글자 크기: 본문(rem)에 맞춤 → 글자 크게 보기에서도 같이 커짐 ---------- */
  // 그래프 색은 style.css의 변수에서 읽음 (SVG 속성에는 var(--x)를 쓸 수 없어서)
  EduSim.css = function (name) { return getComputedStyle(html).getPropertyValue(name).trim(); };
  // 요소의 안쪽 폭(padding 제외). 카드 안에 그림 폭을 맞출 때
  EduSim.contentWidth = function (el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  };
  EduSim.rem = function () { return parseFloat(getComputedStyle(html).fontSize) || 16; };
  EduSim.plotStyle = function () {
    return { fontSize: Math.round(EduSim.rem() * 0.8) + 'px', fontFamily: 'inherit', color: 'var(--ink-2)' };
  };

  /* ---------- URL 값 해석 ---------- */
  function decimals(x) { var s = String(x); var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }

  function bound(b, state) { return typeof b === 'function' ? b(state) : b; }

  function parseParam(def, raw, state) {
    if (def.str) return raw == null ? def.default : String(raw);
    if (def.options) return def.options.indexOf(raw) >= 0 ? raw : def.default;
    var v = raw == null || raw === '' ? NaN : Number(raw);
    if (!isFinite(v)) return def.default;
    if (def.values) { // 가장 가까운 눈금으로
      return def.values.reduce(function (best, x) { return Math.abs(x - v) < Math.abs(best - v) ? x : best; });
    }
    var min = bound(def.min, state), max = bound(def.max, state);
    v = Math.min(max, Math.max(min, v));
    var k = Math.round((v - min) / def.step);
    return Number((min + k * def.step).toFixed(decimals(def.step)));
  }

  function parseSeed(raw) {
    var s = Number(raw);
    return Number.isInteger(s) && s >= 1 && s <= EduSim.SEED_MAX ? s : 1;
  }

  /* ---------- 시뮬레이터 페이지 만들기 ---------- */
  EduSim.create = function (opts) {
    var params = opts.params || {};
    var useSeed = opts.seed !== false;
    var home = opts.home || '../../';
    var text = {
      ko: Object.assign({}, COMMON_TEXT.ko, opts.text && opts.text.ko),
      en: Object.assign({}, COMMON_TEXT.en, opts.text && opts.text.en),
    };

    var state = {};
    Object.keys(params).forEach(function (name) { state[name] = parseParam(params[name], query.get(name), state); });
    if (useSeed) state.seed = parseSeed(query.get('seed'));

    // 사전에 없는 키는 ⟦key⟧로 보여서 빠진 번역이 바로 눈에 띔
    function t(key, vars) {
      var s = text[EduSim.lang][key];
      if (s == null) return '⟦' + key + '⟧';
      return vars ? s.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; }) : s;
    }

    var sim = { state: state, params: params, t: t, set: set, render: schedule };

    /* 헤더·푸터 (embed 모드에선 아예 만들지 않음) */
    if (!EduSim.embed) {
      var header = document.createElement('header');
      header.className = 'site-header';
      header.innerHTML =
        '<a class="brand" href="' + home + (EduSim.lang === 'en' ? '?lang=en' : '') + '">edu_sims</a>' +
        '<span class="crumb" data-t="title"></span>' +
        '<div class="tools">' +
        '<div class="seg" role="radiogroup" aria-label="Language">' +
        '<label><input type="radio" name="__lang" value="ko"><span>KO</span></label>' +
        '<label><input type="radio" name="__lang" value="en"><span>EN</span></label></div>' +
        '<button type="button" class="btn btn-sm" data-action="big" data-t="big" data-t-title="bigTitle"></button>' +
        '</div>';
      document.body.prepend(header);
      var footer = document.createElement('footer');
      footer.className = 'site-footer';
      footer.innerHTML = '<span data-t="footer"></span> · <a href="https://github.com/kkonoo/edu_sims">GitHub</a>';
      document.body.append(footer);

      header.querySelectorAll('input[name="__lang"]').forEach(function (el) {
        el.checked = el.value === EduSim.lang;
        el.addEventListener('change', function () { setLang(el.value); });
      });
    }

    /* 조작 요소 연결 */
    var ranges = document.querySelectorAll('input[type="range"][data-param]');
    ranges.forEach(function (el) {
      var name = el.dataset.param, def = params[name];
      if (def.values) { el.min = 0; el.max = def.values.length - 1; el.step = 1; }
      else el.step = def.step;
      el.addEventListener('input', function () {
        var patch = {};
        patch[name] = def.values ? def.values[Number(el.value)] : parseParam(def, el.value, state);
        set(patch);
      });
    });
    // 숫자 칸: 입력 도중(예: "14"를 치는 중 "1")에 반영되지 않도록 change에서만 반영
    var numbers = document.querySelectorAll('input[type="number"][data-param]');
    numbers.forEach(function (el) {
      var name = el.dataset.param, def = params[name];
      el.step = def.values ? 'any' : def.step;
      el.addEventListener('change', function () {
        var patch = {};
        patch[name] = parseParam(def, el.value, state);
        set(patch);
      });
    });
    var checks = document.querySelectorAll('input[type="checkbox"][data-param]');
    checks.forEach(function (el) {
      var name = el.dataset.param, def = params[name];
      el.addEventListener('change', function () {
        var patch = {}; patch[name] = def.options[el.checked ? 0 : 1]; set(patch);
      });
    });
    var radios = Array.prototype.filter.call(document.querySelectorAll('input[type="radio"]'),
      function (el) { return params[el.name] && params[el.name].options; });
    radios.forEach(function (el) {
      el.addEventListener('change', function () {
        if (!el.checked) return;
        var patch = {}; patch[el.name] = el.value; set(patch);
      });
    });

    document.addEventListener('click', function (e) {
      var preset = e.target.closest('[data-set]');
      if (preset) {
        var raw = JSON.parse(preset.dataset.set), patch = {};
        Object.keys(raw).forEach(function (name) {
          var def = params[name];
          patch[name] = def.options ? (def.options.indexOf(raw[name]) >= 0 ? raw[name] : def.default) : parseParam(def, raw[name], state);
        });
        set(patch);
        return;
      }
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'reroll' && useSeed) set({ seed: EduSim.newSeed(state.seed) });
      if (btn.dataset.action === 'big') toggleBig();
    });

    function syncControls() {
      ranges.forEach(function (el) {
        var def = params[el.dataset.param], v = state[el.dataset.param];
        if (!def.values) { el.min = bound(def.min, state); el.max = bound(def.max, state); } // max를 먼저 바꿔야 value가 잘리지 않음
        el.value = def.values ? def.values.indexOf(v) : v;
        el.style.setProperty('--p', (100 * (el.value - el.min) / ((el.max - el.min) || 1)) + '%');
      });
      numbers.forEach(function (el) {
        var def = params[el.dataset.param];
        if (!def.values) { el.min = bound(def.min, state); el.max = bound(def.max, state); }
        el.value = state[el.dataset.param];
      });
      document.querySelectorAll('[data-set]').forEach(function (el) {
        var raw = JSON.parse(el.dataset.set);
        el.setAttribute('aria-pressed', String(Object.keys(raw).every(function (k) { return state[k] === raw[k]; })));
      });
      radios.forEach(function (el) { el.checked = state[el.name] === el.value; });
      checks.forEach(function (el) { el.checked = state[el.dataset.param] === params[el.dataset.param].options[0]; });
      document.querySelectorAll('[data-out]').forEach(function (el) {
        var def = params[el.dataset.out], v = state[el.dataset.out];
        el.textContent = def && def.format ? def.format(v, sim) : EduSim.fmt(v, def && def.step ? decimals(def.step) : 0);
      });
      document.querySelectorAll('[data-seed]').forEach(function (el) { el.textContent = t('seed') + ' ' + state.seed; });
      document.querySelectorAll('[data-action="big"]').forEach(function (el) { el.setAttribute('aria-pressed', String(EduSim.big)); });
    }

    function applyText() {
      document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.dataset.t); });
      document.querySelectorAll('[data-t-html]').forEach(function (el) { el.innerHTML = t(el.dataset.tHtml); });
      document.querySelectorAll('[data-t-title]').forEach(function (el) { el.title = t(el.dataset.tTitle); });
      document.querySelectorAll('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.tAria)); });
      document.title = t('title') + ' · edu_sims';
    }

    // Safari는 replaceState를 30초에 100번 넘게 부르면 예외를 던지므로 묶어서 씀
    var urlTimer = null;
    function writeURL() {
      clearTimeout(urlTimer);
      urlTimer = setTimeout(function () {
        var q = new URLSearchParams();
        Object.keys(params).forEach(function (name) {
          if (!(params[name].str && state[name] === '')) q.set(name, String(state[name]));
        });
        if (useSeed) q.set('seed', String(state.seed));
        if (EduSim.lang !== 'ko') q.set('lang', EduSim.lang);
        if (EduSim.embed) q.set('embed', '1');
        if (EduSim.big) q.set('big', '1');
        var s = q.toString();
        try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); } catch (e) { /* 무시 */ }
      }, 250);
    }

    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (opts.render) opts.render(state, sim);
      });
    }

    function set(patch) {
      Object.assign(state, patch);
      // 범위가 다른 값에 따라 바뀌는 조작값은 다시 범위 안으로 (예: n을 줄이면 k ≤ n)
      Object.keys(params).forEach(function (name) {
        var def = params[name];
        if (typeof def.min === 'function' || typeof def.max === 'function') state[name] = parseParam(def, state[name], state);
      });
      syncControls();
      writeURL();
      schedule();
    }

    function setLang(lang) {
      EduSim.lang = lang;
      html.lang = lang;
      var brand = document.querySelector('.site-header .brand');
      if (brand) brand.href = home + (lang === 'en' ? '?lang=en' : '');
      applyText();
      syncControls();
      writeURL();
      schedule();
    }

    function toggleBig() {
      EduSim.big = !EduSim.big;
      html.classList.toggle('big', EduSim.big);
      syncControls();
      writeURL();
      schedule();
    }

    // 그래프 영역 폭이 바뀌면(창 크기, 회전, 글자 크게) 다시 그림. 높이 변화엔 반응하지 않음(무한 반복 방지)
    var figs = document.querySelector('.sim-figs');
    if (figs && window.ResizeObserver) {
      var lastW = -1;
      new ResizeObserver(function (entries) {
        var w = Math.round(entries[0].contentRect.width);
        if (w !== lastW) { lastW = w; schedule(); }
      }).observe(figs);
    }

    applyText();
    syncControls();
    writeURL();
    schedule();
    return sim;
  };

  /* ---------- embed: 내용 높이가 바뀔 때마다 부모 창에 알림 ---------- */
  if (EduSim.embed && window.parent !== window) {
    document.addEventListener('DOMContentLoaded', function () {
      var last = 0;
      function post() {
        var h = Math.ceil(document.body.getBoundingClientRect().height);
        if (h === last) return;
        last = h;
        window.parent.postMessage({ type: 'edu-sims:height', height: h }, '*');
      }
      if (window.ResizeObserver) new ResizeObserver(post).observe(document.body);
      window.addEventListener('load', post);
      post();
    });
  }

  window.EduSim = EduSim;
})();
