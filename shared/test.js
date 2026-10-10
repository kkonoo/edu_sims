/*
 * edu_sims 브라우저 테스트 도우미 — test.html에서 일반 <script>로 불러 씁니다.
 *
 *  EduTest.run(function (T) {
 *    T.section('묶음 이름');
 *    T.check('설명', 참/거짓, '보여 줄 세부 내용');
 *    T.near('설명', 실제값, 기대값, 상대오차_허용);   // |실제 − 기대| ≤ 허용 × |기대|
 *  });
 *
 * 결과는 #test-results에 표로 나타나고, <body data-result="pass|fail">로도 남습니다.
 */
(function () {
  'use strict';

  var CSS =
    '.t-banner{padding:.75rem 1rem;border-radius:10px;font-weight:700;font-size:1.1rem}' +
    '.t-banner.pass{background:var(--ok-bg);color:var(--ok-ink)}.t-banner.fail{background:var(--warn-bg);color:var(--warn-ink)}' +
    '.t-banner.run{background:var(--page);color:var(--ink-2)}' +
    '.t-sec{margin:1.25rem 0 .4rem;font-size:1rem}' +
    '.t-table{width:100%;border-collapse:collapse;font-size:.875rem}' +
    '.t-table td{border-top:1px solid var(--line);padding:.35rem .5rem;vertical-align:top}' +
    '.t-table td:first-child{width:2rem;text-align:center;font-weight:700}' +
    '.t-table tr.pass td:first-child{color:var(--ok-ink)}.t-table tr.fail td:first-child{color:var(--warn)}' +
    '.t-table tr.fail{background:var(--warn-bg)}' +
    '.t-detail{color:var(--ink-2);font-variant-numeric:tabular-nums;word-break:break-all}';

  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    return Number.isInteger(x) ? String(x) : x.toPrecision(Math.abs(x) < 1e-3 && x !== 0 ? 6 : 8);
  }

  var EduTest = {
    fmt: fmt,
    run: function (body) {
      var style = document.createElement('style');
      style.textContent = CSS;
      document.head.append(style);
      var root = document.getElementById('test-results');
      root.innerHTML = '<div class="t-banner run">실행 중…</div>';

      var results = [];
      var section = '';
      var T = {
        section: function (name) { section = name; },
        check: function (name, pass, detail) {
          results.push({ section: section, name: name, pass: !!pass, detail: detail || '' });
        },
        near: function (name, actual, expected, relTol) {
          var err = Math.abs(actual - expected) / Math.max(Math.abs(expected), Number.MIN_VALUE);
          T.check(name, err <= relTol,
            '기대 ' + expected.toPrecision(17) + ' · 실제 ' + actual.toPrecision(17) +
            ' · 상대오차 ' + err.toExponential(1) + ' (허용 ' + relTol.toExponential(0) + ')');
        },
      };

      // 화면에 "실행 중…"이 먼저 보이도록 한 박자 늦게 실행
      setTimeout(function () {
        var t0 = performance.now();
        try { body(T); } catch (e) { T.check('테스트 코드 실행 중 오류', false, e.stack || String(e)); }
        var ms = performance.now() - t0;

        var failed = results.filter(function (r) { return !r.pass; }).length;
        var html = '<div class="t-banner ' + (failed ? 'fail' : 'pass') + '">' +
          (failed ? '✘ ' + results.length + '개 중 ' + failed + '개 실패' : '✔ ' + results.length + '개 모두 통과') +
          ' <span style="font-weight:400;font-size:.85rem">(' + Math.round(ms) + 'ms)</span></div>';
        var cur = null;
        results.forEach(function (r) {
          if (r.section !== cur) {
            if (cur !== null) html += '</table>';
            cur = r.section;
            html += '<h2 class="t-sec">' + r.section + '</h2><table class="t-table">';
          }
          html += '<tr class="' + (r.pass ? 'pass' : 'fail') + '"><td>' + (r.pass ? '✔' : '✘') + '</td><td>' +
            r.name + (r.detail ? '<div class="t-detail">' + r.detail + '</div>' : '') + '</td></tr>';
        });
        if (cur !== null) html += '</table>';
        root.innerHTML = html;
        document.body.dataset.result = failed ? 'fail' : 'pass';
      }, 30);
    },
  };

  window.EduTest = EduTest;
})();
