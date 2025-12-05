// ==================== RAZAN2: FAILED MISSIONS BUDGET ====================

function initRazan2() {
    const container = document.getElementById('razan2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 980px; margin: 0 auto; padding: 22px 16px 28px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 14px; padding: 20px;">
                <div style="color: #60a5fa; font-size: 0.95rem; font-weight: 600; margin-bottom: 12px;">Money Burned on Failed Missions over Time</div>
                <div style="margin-bottom: 16px;">
                    <div id="razan2-yearSlider"></div>
                </div>
                <div id="razan2-barLineChart"></div>
            </div>
            <div id="razan2-tooltip" style="position: fixed; pointer-events: none; opacity: 0; background: rgba(10, 16, 32, 0.95); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 12px; padding: 10px; max-width: 320px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45); transform: translateY(8px); transition: opacity 0.08s, transform 0.08s; font-size: 12px; z-index: 9999; color: #e5e7eb;"></div>
        </div>
    `;

    d3.csv("data/Global_Space_Exploration_Dataset.csv").then(function (data) {
        const classifiedData = classifyMissions(data, 80);

        const sliderRange = d3.sliderBottom()
            .min(2005)
            .max(2025)
            .width(320)
            .tickFormat(d3.format("d"))
            .ticks(5)
            .step(1)
            .default([2005, 2025])
            .fill("#1f9cf0")
            .on("onchange", val => {
                const [minYear, maxYear] = val;
                drawBarLineChart(classifiedData, minYear, maxYear);
            });

        const gRange = d3.select("#razan2-yearSlider")
            .append("svg")
            .attr("width", 380)
            .attr("height", 70)
            .append("g")
            .attr("transform", "translate(30, 30)");

        gRange.call(sliderRange);

        drawBarLineChart(classifiedData, 2005, 2025);

    }).catch(function (error) {
        console.error('Error loading razan2 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });

    function classifyMissions(data, threshold) {
        data.forEach(d => {
            const rate = +d["Success Rate (%)"];
            d.status = rate >= threshold ? "Successful" : "Failed";
        });
        return data;
    }

    function drawBarLineChart(data, minYear, maxYear) {
        d3.selectAll('#razan2-barLineChart svg').remove();

        const yearData = data.filter(d => d.Year >= minYear && d.Year <= maxYear);

        const yearlySummary = d3.rollups(
            yearData,
            v => {
                const failed = v.filter(d => d.status === "Failed");
                return {
                    year: +failed[0]?.Year || +v[0].Year,
                    failedMissions: failed.length,
                    failedBudget: d3.sum(failed, d => +d["Budget (in Billion $)"])
                };
            },
            d => +d.Year
        ).map(([year, vals]) => ({
            Year: year,
            failedMissions: vals.failedMissions,
            failedBudget: vals.failedBudget
        })).sort((a, b) => d3.ascending(a.Year, b.Year));

        const margin = { top: 40, right: 40, bottom: 60, left: 50 };
        const width = 800;
        const height = 400;

        const svg = d3.select("#razan2-barLineChart").append('svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand()
            .domain(Array.from(new Set(yearData.map(d => +d.Year))).sort(d3.ascending))
            .range([0, width])
            .padding(0.2);

        const xAxis = d3.axisBottom(x);
        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .call(g => g.selectAll("text").attr("fill", "rgba(182, 192, 221, 0.9)").attr("font-size", 11))
            .call(g => g.selectAll("path, line").attr("stroke", "rgba(255, 255, 255, 0.18)"));

        const yLeft = d3.scaleLinear().domain([0, d3.max(yearlySummary, d => d.failedMissions)]).range([height, 0]).nice();
        svg.append("g")
            .attr("class", "axis axis-left")
            .call(d3.axisLeft(yLeft).ticks(6))
            .call(g => g.selectAll("text").attr("fill", "rgba(238, 242, 255, 0.92)").attr("font-size", 11))
            .call(g => g.selectAll("path, line").attr("stroke", "rgba(255, 255, 255, 0.18)"));

        svg.append("text")
            .attr("text-anchor", "start")
            .attr("x", -30)
            .attr("y", -10)
            .attr("fill", "rgba(238, 242, 255, 0.92)")
            .style("font-size", "10px")
            .text("Failed Missions");

        const yRight = d3.scaleLinear().domain([0, d3.max(yearlySummary, d => d.failedBudget)]).range([height, 0]).nice();
        svg.append("g")
            .attr("class", "axis axis-right")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisRight(yRight).ticks(6))
            .call(g => g.selectAll("text").attr("fill", "rgba(238, 242, 255, 0.92)").attr("font-size", 11))
            .call(g => g.selectAll("path, line").attr("stroke", "rgba(255, 255, 255, 0.18)"));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width + 40)
            .attr("y", -10)
            .attr("fill", "rgba(238, 242, 255, 0.92)")
            .style("font-size", "10px")
            .text("Wasted Budget (Billion USD)");

        svg.append("g")
            .selectAll(".bar-budget")
            .data(yearlySummary)
            .join("rect")
            .attr("class", "bar-budget")
            .attr("x", d => x(d.Year))
            .attr("width", x.bandwidth())
            .attr("y", d => yRight(d.failedBudget))
            .attr("height", d => height - yRight(d.failedBudget))
            .attr("fill", "#1f9cf0")
            .attr("opacity", 0.7)
            .attr("rx", 4)
            .attr("ry", 4);

        const lineFailed = d3.line()
            .x(d => x(d.Year) + x.bandwidth() / 2)
            .y(d => yLeft(d.failedMissions));

        svg.append("path")
            .datum(yearlySummary)
            .attr("class", "line-failed")
            .attr("fill", "none")
            .attr("stroke", "#ff6b8a")
            .attr("stroke-width", 2)
            .attr("d", lineFailed);

        const tooltip = d3.select("#razan2-tooltip");

        svg.append("g")
            .selectAll(".failed-point")
            .data(yearlySummary)
            .join("circle")
            .attr("class", "failed-point")
            .attr("cx", d => x(d.Year) + x.bandwidth() / 2)
            .attr("cy", d => yLeft(d.failedMissions))
            .attr("r", 5)
            .attr("fill", "#ff6b8a")
            .attr("stroke", "#0b1120")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 7);
                tooltip
                    .style("opacity", 1)
                    .style("transform", "translateY(0px)")
                    .html(`<strong style="color: #60a5fa;">Year: ${d.Year}</strong><br>Failed missions: ${d.failedMissions}<br>Wasted budget: $${d.failedBudget.toFixed(2)}B`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");
            })
            .on("mouseleave", function () {
                d3.select(this).attr("r", 5);
                tooltip.style("opacity", 0).style("transform", "translateY(8px)");
            });
    }
}