// ==================== MANYA1: SPACE PAYS BACK ON EARTH ====================

function initManya1() {
    const container = document.getElementById('manya1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    // Build HTML structure
    container.innerHTML = `
        <div style="max-width: 980px; margin: 0 auto; padding: 22px 16px 28px;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 10px 0 12px; justify-content: center;">
                <span style="color: #b6c0dd; font-size: 12px;">Rank by:</span>
                <button id="manya1-btnEco" style="border: 1px solid rgba(255, 255, 255, .15); background: rgba(255, 255, 255, .07); color: #eef2ff; padding: 8px 10px; border-radius: 999px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .2s;">Economic Value (B$)</button>
                <button id="manya1-btnLives" style="border: 1px solid rgba(255, 255, 255, .15); background: rgba(255, 255, 255, .07); color: #eef2ff; padding: 8px 10px; border-radius: 999px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .2s;">Lives Saved</button>
            </div>
            <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; padding: 12px;">
                <div id="manya1-chart"></div>
            </div>
            <div style="color: #b6c0dd; font-size: 11px; margin-top: 10px; text-align: center;">
                Tip: hover a bar. Click buttons to re-rank (animated).
            </div>
        </div>
        <div id="manya1-tip" style="position: fixed; pointer-events: none; opacity: 0; background: rgba(10, 16, 32, .95); border: 1px solid rgba(255, 255, 255, .14); border-radius: 12px; padding: 10px; max-width: 320px; box-shadow: 0 18px 40px rgba(0, 0, 0, .45); transform: translateY(8px); transition: opacity .08s, transform .08s; font-size: 12px; z-index: 9999;"></div>
    `;

    // Set active button style initially
    const btnEco = document.getElementById("manya1-btnEco");
    btnEco.style.background = "rgba(124, 255, 178, .12)";
    btnEco.style.borderColor = "rgba(124, 255, 178, .6)";
    btnEco.style.boxShadow = "0 0 0 2px rgba(124, 255, 178, .12) inset";

    // Load and process data
    d3.json("data/econ_impact.json").then(raw => {
        // Flatten the data structure
        const items = [];
        for (const cat of raw.children) {
            for (const t of cat.children) {
                items.push({
                    category: cat.name,
                    name: t.name,
                    impactDetail: t.impactDetail ?? "",
                    economicValue: +t.economicValue || 0,
                    livesSaved: +t.livesSaved || 0,
                    scale: +t.value || 0
                });
            }
        }

        const tip = d3.select("#manya1-tip");
        const fmtB = d3.format(".1f");
        const fmtInt = d3.format(",");

        const el = document.getElementById('manya1-chart');
        const W = Math.min(940, el.clientWidth);
        const H = 520;
        const m = { top: 16, right: 20, bottom: 26, left: 210 };

        const svg = d3.select(el).append("svg")
            .attr("width", W)
            .attr("height", H);

        const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
        const iw = W - m.left - m.right;
        const ih = H - m.top - m.bottom;

        let metric = "economicValue";
        const topN = 12;

        const y = d3.scaleBand().range([0, ih]).padding(0.18);
        const x = d3.scaleLinear().range([0, iw]);

        const xAxisG = g.append("g").attr("transform", `translate(0,${ih})`);
        const yAxisG = g.append("g");
        const barsG = g.append("g");

        function color(category) {
            const h = d3.sum(category.split(""), c => c.charCodeAt(0));
            const t = (h % 360);
            return `hsl(${t}, 70%, 55%)`;
        }

        function getData() {
            return items
                .slice()
                .sort((a, b) => d3.descending(a[metric], b[metric]))
                .slice(0, topN);
        }

        function render(first = false) {
            const data = getData();

            y.domain(data.map(d => d.name));
            x.domain([0, d3.max(data, d => d[metric]) || 1]).nice();

            const t = svg.transition().duration(900).ease(d3.easeCubicOut);

            yAxisG.transition(t).call(d3.axisLeft(y).tickSize(0))
                .call(g => g.selectAll("text").attr("fill", "rgba(238,242,255,.92)").attr("font-size", 12))
                .call(g => g.select(".domain").remove());

            xAxisG.transition(t).call(d3.axisBottom(x).ticks(5))
                .call(g => g.selectAll("text").attr("fill", "rgba(182,192,221,.9)").attr("font-size", 11))
                .call(g => g.selectAll("path,line").attr("stroke", "rgba(255,255,255,.18)"));

            const bars = barsG.selectAll("rect").data(data, d => d.name);

            bars.join(
                enter => enter.append("rect")
                    .attr("x", 0)
                    .attr("y", d => y(d.name))
                    .attr("height", y.bandwidth())
                    .attr("rx", 10).attr("ry", 10)
                    .attr("fill", d => color(d.category))
                    .attr("width", first ? 0 : d => x(d[metric]))
                    .attr("opacity", 0.92)
                    .on("mousemove", (event, d) => {
                        tip.style("opacity", 1).style("transform", "translateY(0px)")
                            .style("left", (event.clientX + 12) + "px")
                            .style("top", (event.clientY + 12) + "px")
                            .html(`
                                <div style="font-weight:800; margin-bottom:4px;">${d.name}</div>
                                <div style="color:#b6c0dd;"><b>Category:</b> ${d.category}</div>
                                <div style="color:#b6c0dd;"><b>Economic:</b> ${fmtB(d.economicValue)} B$</div>
                                <div style="color:#b6c0dd;"><b>Lives saved:</b> ${fmtInt(d.livesSaved)}</div>
                                <div style="color:#b6c0dd;"><b>Scale:</b> ${fmtInt(d.scale)}</div>
                                <div style="margin-top:6px; color:#b6c0dd;">${d.impactDetail}</div>
                            `);
                    })
                    .on("mouseleave", () => tip.style("opacity", 0).style("transform", "translateY(8px)"))
                    .transition(t)
                    .attr("width", d => x(d[metric])),
                update => update.transition(t)
                    .attr("y", d => y(d.name))
                    .attr("height", y.bandwidth())
                    .attr("width", d => x(d[metric])),
                exit => exit.transition(t).attr("width", 0).remove()
            );

            const labels = barsG.selectAll("text.val").data(data, d => d.name);

            labels.join(
                enter => enter.append("text")
                    .attr("class", "val")
                    .attr("x", 6)
                    .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
                    .attr("fill", "rgba(7,10,18,.85)")
                    .attr("font-weight", 800)
                    .attr("font-size", 11)
                    .text(d => metric === "economicValue" ? `${fmtB(d.economicValue)}B` : fmtInt(d.livesSaved))
                    .attr("opacity", 0)
                    .transition(t)
                    .attr("x", d => Math.min(x(d[metric]) - 6, 10))
                    .attr("opacity", 1),
                update => update.transition(t)
                    .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
                    .text(d => metric === "economicValue" ? `${fmtB(d.economicValue)}B` : fmtInt(d.livesSaved))
                    .attr("x", d => Math.min(x(d[metric]) - 6, 10)),
                exit => exit.remove()
            );
        }

        render(true);

        const btnEco = document.getElementById("manya1-btnEco");
        const btnLives = document.getElementById("manya1-btnLives");

        btnEco.onclick = () => {
            metric = "economicValue";
            btnEco.style.background = "rgba(124, 255, 178, .12)";
            btnEco.style.borderColor = "rgba(124, 255, 178, .6)";
            btnEco.style.boxShadow = "0 0 0 2px rgba(124, 255, 178, .12) inset";
            btnLives.style.background = "rgba(255, 255, 255, .07)";
            btnLives.style.borderColor = "rgba(255, 255, 255, .15)";
            btnLives.style.boxShadow = "none";
            render(false);
        };

        btnLives.onclick = () => {
            metric = "livesSaved";
            btnLives.style.background = "rgba(124, 255, 178, .12)";
            btnLives.style.borderColor = "rgba(124, 255, 178, .6)";
            btnLives.style.boxShadow = "0 0 0 2px rgba(124, 255, 178, .12) inset";
            btnEco.style.background = "rgba(255, 255, 255, .07)";
            btnEco.style.borderColor = "rgba(255, 255, 255, .15)";
            btnEco.style.boxShadow = "none";
            render(false);
        };
    }).catch(error => {
        console.error('Error loading manya1 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}