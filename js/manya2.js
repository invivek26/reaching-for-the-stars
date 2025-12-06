// ==================== MANYA2: CAN WE AFFORD SPACE ====================

function initManya2() {
    const container = document.getElementById('manya2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 980px; margin: 0 auto; padding: 22px 16px 26px;">
            <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; padding: 14px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="color: #b6c0dd; font-size: 12px;">Selected year</div>
                        <div style="font-size: 26px; font-weight: 850; color: #eef2ff;" id="manya2-yearLabel">—</div>
                    </div>
                    <div>
                        <div style="color: #b6c0dd; font-size: 12px;">Scrub years</div>
                        <input id="manya2-year" type="range" min="2012" max="2023" step="1" value="2023" style="width: 320px;">
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #b6c0dd; font-size: 12px;">Scale ratio (GDP ÷ Budget)</div>
                        <div style="font-size: 26px; font-weight: 850; color: #eef2ff;" id="manya2-ratio">—</div>
                    </div>
                </div>
                <div id="manya2-viz-chart" style="margin-top: 12px;"></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 12px;">
                    <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 12px; padding: 10px;">
                        <div style="font-size: 11px; color: #b6c0dd;">Public space budget (B$)</div>
                        <div style="font-size: 15px; margin-top: 4px; font-weight: 750; color: #eef2ff;" id="manya2-kBudget">—</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 12px; padding: 10px;">
                        <div style="font-size: 11px; color: #b6c0dd;">Space economy GDP contribution (B$)</div>
                        <div style="font-size: 15px; margin-top: 4px; font-weight: 750; color: #eef2ff;" id="manya2-kGdp">—</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 12px; padding: 10px;">
                        <div style="font-size: 11px; color: #b6c0dd;">Space economy jobs</div>
                        <div style="font-size: 15px; margin-top: 4px; font-weight: 750; color: #eef2ff;" id="manya2-kJobs">—</div>
                    </div>
                </div>
                <div style="color: #b6c0dd; font-size: 11px; margin-top: 12px;">
                    Note: This doesn't claim "NASA spending causes GDP." It shows space has become real infrastructure with real output.
                </div>
            </div>
        </div>
    `;

    Promise.all([
        d3.csv('data/budget_history.csv'),
        d3.json('data/space_economy_data.json')
    ]).then(([budgetRows, economy]) => {
        const fmt1 = d3.format(".1f");
        const fmt0 = d3.format(",");
        const el = document.getElementById("manya2-viz-chart");

        const econ = economy.industries[0];
        const years = economy.metadata.years;

        function parseNum(x) {
            if (x == null) return NaN;
            const s = String(x).replace(/[$,]/g, "").trim();
            const v = +s;
            return Number.isFinite(v) ? v : NaN;
        }

        const budgetByYear = new Map();
        for (const r of budgetRows) {
            const y = +r["Fiscal Year"];
            const actual = parseNum(r["Actual"]);
            if (Number.isFinite(y) && Number.isFinite(actual)) {
                budgetByYear.set(y, actual / 1000);
            }
        }

        const data = years.map(y => ({
            year: y,
            budgetB: budgetByYear.get(y) ?? NaN,
            gdpB: (econ.gdpContribution[String(y)] ?? 0) / 1000,
            jobs: econ.employment[String(y)] ?? 0,
            avgSalaryK: econ.avgSalary[String(y)] ?? null
        })).filter(d => Number.isFinite(d.budgetB) && Number.isFinite(d.gdpB));

        const W = Math.min(940, el.clientWidth);
        const H = 220;
        const m = { top: 10, right: 18, bottom: 24, left: 190 };
        const iw = W - m.left - m.right;
        const ih = H - m.top - m.bottom;

        const svg = d3.select(el).append("svg")
            .attr("width", W).attr("height", H);

        const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

        const cats = ["Public Space Budget (B$)", "Space Economy GDP (B$)"];
        const y = d3.scaleBand().domain(cats).range([0, ih]).padding(0.25);
        const x = d3.scaleLinear().range([0, iw]);

        g.append("g")
            .attr("class", "y")
            .call(d3.axisLeft(y).tickSize(0))
            .call(gg => gg.select(".domain").remove())
            .call(gg => gg.selectAll("text").attr("fill", "rgba(238,242,255,.92)").attr("font-size", 12));

        const xAxisG = g.append("g")
            .attr("class", "x")
            .attr("transform", `translate(0,${ih})`);

        const barsG = g.append("g");

        function update(year) {
            const d = data.find(x => x.year === year) ?? data[data.length - 1];

            const vals = [
                { label: cats[0], value: d.budgetB, fill: "rgba(124,255,178,.95)" },
                { label: cats[1], value: d.gdpB, fill: "rgba(110,168,254,.95)" }
            ];

            x.domain([0, d3.max(vals, v => v.value) * 1.15]).nice();

            d3.select("#manya2-yearLabel").text(d.year);
            d3.select("#manya2-kBudget").text(`${fmt1(d.budgetB)} B$`);
            d3.select("#manya2-kGdp").text(`${fmt1(d.gdpB)} B$`);
            d3.select("#manya2-kJobs").text(`${fmt0(d.jobs)} jobs`);
            d3.select("#manya2-ratio").text(`${fmt1(d.gdpB / d.budgetB)}×`);

            const t = svg.transition().duration(900).ease(d3.easeCubicOut);
            xAxisG.transition(t)
                .call(d3.axisBottom(x).ticks(5))
                .call(gg => gg.selectAll("path,line").attr("stroke", "rgba(255,255,255,.18)"))
                .call(gg => gg.selectAll("text").attr("fill", "rgba(182,192,221,.9)").attr("font-size", 11));

            const bars = barsG.selectAll("rect").data(vals, v => v.label);
            bars.join(
                enter => enter.append("rect")
                    .attr("x", 0)
                    .attr("y", v => y(v.label))
                    .attr("height", y.bandwidth())
                    .attr("rx", 12).attr("ry", 12)
                    .attr("fill", v => v.fill)
                    .attr("width", 0)
                    .transition(t)
                    .attr("width", v => x(v.value)),
                update => update.transition(t)
                    .attr("y", v => y(v.label))
                    .attr("height", y.bandwidth())
                    .attr("width", v => x(v.value)),
                exit => exit.transition(t).attr("width", 0).remove()
            );

            const labels = barsG.selectAll("text.val").data(vals, v => v.label);
            labels.join(
                enter => enter.append("text")
                    .attr("class", "val")
                    .attr("x", 10)
                    .attr("y", v => y(v.label) + y.bandwidth() / 2 + 4)
                    .attr("fill", "rgba(255,255,255,.95)")
                    .attr("font-weight", 850)
                    .attr("font-size", 12)
                    .text(v => `${fmt1(v.value)} B$`)
                    .attr("opacity", 0)
                    .transition(t)
                    .attr("opacity", 1)
                    .style("paint-order", "stroke")
                    .style("stroke", "rgba(0,0,0,.55)")
                    .style("stroke-width", 3)
                    .style("stroke-linejoin", "round"),
                update => update.transition(t)
                    .attr("y", v => y(v.label) + y.bandwidth() / 2 + 4)
                    .text(v => `${fmt1(v.value)} B$`),
                exit => exit.remove()
            );
        }

        const slider = document.getElementById("manya2-year");
        slider.min = d3.min(data, d => d.year);
        slider.max = d3.max(data, d => d.year);
        slider.value = slider.max;

        update(+slider.value);
        slider.addEventListener("input", () => update(+slider.value));
    }).catch(error => {
        console.error('Error loading manya2 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}