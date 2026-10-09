// 새 시뮬레이터의 출발점. 폴더를 통째로 복사한 뒤 params, render, text.js를 바꾸세요.
EduSim.create({
  text: TEXT,
  params: {
    // 눈금 슬라이더는 values, 연속 슬라이더는 { min, max, step, default }, 라디오는 { options, default }
    n: { values: [5, 10, 20, 50, 100, 200, 500, 1000], default: 20 },
  },
  render(state) {
    // 시드가 같으면 같은 값. n을 바꿔도 앞쪽 값들은 그대로 유지됨
    const rng = EduSim.rng(state.seed);
    const xs = Array.from({ length: state.n }, () => rng.normal());
    const mean = d3.mean(xs);

    document.getElementById('mean').textContent = EduSim.fmt(mean, 3);

    const el = document.getElementById('chart');
    const rem = EduSim.rem();
    el.replaceChildren(Plot.plot({
      width: el.clientWidth,
      height: Math.round(rem * 16),
      marginLeft: Math.round(rem * 2.5),
      marginBottom: Math.round(rem * 2.25),
      style: EduSim.plotStyle(),
      x: { domain: [-4, 4], label: null },
      y: { grid: true, label: null },
      marks: [
        Plot.rectY(xs, Plot.binX({ y: 'count' }, {
          x: (d) => d, thresholds: d3.range(-4, 4.001, 0.25), fill: EduSim.css('--c1'), inset: 1, tip: true,
        })),
        Plot.ruleY([0], { stroke: EduSim.css('--line-strong') }),
        Plot.ruleX([0], { stroke: EduSim.css('--ink-2'), strokeDasharray: '4 3' }),
        Plot.ruleX([mean], { stroke: EduSim.css('--c2'), strokeWidth: 2.5 }),
      ],
    }));
  },
});
