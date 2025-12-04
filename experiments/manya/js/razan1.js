// ==================== RAZAN1: MISSION ANALYSIS ====================

function initRazan1() {
    const container = document.getElementById('razan1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background: linear-gradient(145deg, #111827, #0f172a); padding: 40px; border-radius: 16px; color: #e5e7eb;">
            <div style="display: flex; flex-wrap: wrap; gap: 24px; margin-top: 24px;">
                
                <div style="flex: 1 1 320px; background: linear-gradient(145deg, rgba(31, 41, 55, 0.9), rgba(15, 23, 42, 0.95)); border-radius: 16px; padding: 20px; border: 1px solid #1f2937; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);">
                    <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: #1f9cf0;">Mission Cost vs Duration</div>
                    <div style="margin: 10px 0 8px; display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.85rem;">
                        <label style="display: flex; align-items: center; gap: 6px;">
                            Country:
                            <select id="razan1-countrySelect" style="background: #1f2937; color: #e5e7eb; border-radius: 6px; border: 1px solid #374151; padding: 4px 8px; font-size: 0.85rem;"></select>
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px;">
                            Status:
                            <select id="razan1-statusSelect" style="background: #1f2937; color: #e5e7eb; border-radius: 6px; border: 1px solid #374151; padding: 4px 8px; font-size: 0.85rem;">
                                <option value="All">All</option>
                                <option value="Successful">Successful</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </label>
                    </div>
                    <div id="razan1-bubbleChart" style="background: radial-gradient(circle at top left, rgba(31, 156, 240, 0.25), rgba(15, 23, 42, 0.95)); border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.2); height: 600px; margin-bottom: 16px;"></div>
                </div>

                <div style="flex: 1 1 320px; background: linear-gradient(145deg, rgba(31, 41, 55, 0.9), rgba(15, 23, 42, 0.95)); border-radius: 16px; padding: 20px; border: 1px solid #1f2937; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);">
                    <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: #1f9cf0;">Money Burned on Failed Missions over Time</div>
                    <div style="margin-bottom: 12px;">
                        <div id="razan1-yearSlider"></div>
                    </div>
                    <div id="razan1-barLineChart" style="background: radial-gradient(circle at top left, rgba(31, 156, 240, 0.25), rgba(15, 23, 42, 0.95)); border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.2); height: 600px;"></div>
                </div>

            </div>
            <div id="razan1-tooltip" style="position: absolute; pointer-events: none; opacity: 0; background: rgba(15, 23, 42, 0.95); color: #e5e7eb; border-radius: 8px; padding: 10px 12px; font-size: 0.75rem; line-height: 1.4; border: 1px solid rgba(148, 163, 184, 0.4); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6); z-index: 999; max-width: 240px;"></div>
        </div>
    `;

    d3.csv("data/Global_Space_Exploration_Dataset.csv").then(function (data) {
        const classifiedData = data.map(d => ({
            ...d,
            status: (+d["Success Rate (%)"] >= 80) ? "Successful" : "Failed"
        }));

        const countries = Array.from(new Set(data.map(d => d.Country)))
            .filter(d => d != null && d !== "")
            .sort(d3.ascending);

        const countrySelect = d3.select("#razan1-countrySelect");
        countrySelect.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        const defaultCountry = countries[0];
        countrySelect.property("value", defaultCountry);

        const statusSelect = d3.select("#razan1-statusSelect");
        statusSelect.property("value", "All");

        countrySelect.on("change", function () {
            drawBubbleChart(classifiedData, this.value, statusSelect.property("value"));
        });

        statusSelect.on("change", function () {
            drawBubbleChart(classifiedData, countrySelect.property("value"), this.value);
        });

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

        const gRange = d3.select("#razan1-yearSlider")
            .append("svg")
            .attr("width", 380)
            .attr("height", 70)
            .append("g")
            .attr("transform", "translate(30,30)");

        gRange.call(sliderRange);

        drawBubbleChart(classifiedData, defaultCountry, 'All');
        drawBarLineChart(classifiedData, 2005, 2025);

    }).catch(function (error) {
        console.error('Error loading razan1 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });

    function drawBubbleChart(data, selectedCountry, selectedStatus) {
        d3.select('#razan1-bubbleChart svg').remove();

        let countryData = data.filter(d => d.Country == selectedCountry);
        if (selectedStatus !== 'All') countryData = countryData.filter(d => d.status == selectedStatus);

        const margin = { top: 50, right: 50, bottom: 90, left: 50 };
        const width = 500 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const svg = d3.select("#razan1-bubbleChart").append('svg')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(countryData, d => +d['Budget (in Billion $)']))
            .range([0, width]).nice();

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("fill", "#e5e7eb");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#e5e7eb")
            .attr("font-size", 13)
            .text("Mission Cost (Billion USD)");

        const y = d3.scaleLinear()
            .domain(d3.extent(countryData, d => +d['Duration (in Days)']))
            .range([height, 0]).nice();

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("fill", "#e5e7eb");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("fill", "#e5e7eb")
            .attr("font-size", 13)
            .text("Mission Duration (Days)");

        const z = d3.scaleOrdinal()
            .domain(["Low", "Medium", "High"])
            .range([2, 5, 10]);

        const missionColor = d3.scaleOrdinal()
            .domain(["Successful", "Failed"])
            .range(["#1f9cf0", "#ff6b8a"]);

        const tooltip = d3.select('#razan1-tooltip');

        svg.append('g')
            .selectAll("dot")
            .data(countryData)
            .join("circle")
            .attr("cx", d => x(+d['Budget (in Billion $)']))
            .attr("cy", d => y(+d['Duration (in Days)']))
            .attr("r", d => z(d["Environmental Impact"]))
            .attr("stroke", 'black')
            .attr("stroke-width", '0.5px')
            .style("fill", d => missionColor(d.status))
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "#2dd4bf").attr("stroke-width", '3px');
                tooltip.style("opacity", 1)
                    .html(`<strong>${d["Mission Name"]}</strong><br>
                           Launch year: ${d["Year"]}<br>
                           Cost: $${d['Budget (in Billion $)']}B<br>
                           Outcome: ${d.status}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");
            })
            .on("mouseleave", function () {
                d3.select(this).attr("stroke", 'black').attr("stroke-width", '0.5px');
                tooltip.style("opacity", 0);
            });

        const legendData = ["Successful", "Failed"];
        const legend = svg.append("g")
            .attr("transform", `translate(${width / 2 - 70}, ${height + 65})`);

        legend.selectAll("circle")
            .data(legendData)
            .join("circle")
            .attr("cx", (d, i) => i * 140 + 10)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", d => missionColor(d));

        legend.selectAll("text")
            .data(legendData)
            .join("text")
            .attr("x", (d, i) => i * 140 + 25)
            .attr("y", 3)
            .style("font-size", "12px")
            .style("fill", "#e5e7eb")
            .text(d => d);
    }

    function drawBarLineChart(data, minYear, maxYear) {
        d3.selectAll('#razan1-barLineChart svg').remove();

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

        const margin = { top: 50, right: 50, bottom: 90, left: 50 };
        const width = 500 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const svg = d3.select("#razan1-barLineChart").append('svg')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(Array.from(new Set(yearData.map(d => +d.Year))).sort(d3.ascending))
            .range([0, width])
            .padding(0.2);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("fill", "#e5e7eb")
            .attr("font-size", 10);

        const yLeft = d3.scaleLinear()
            .domain([0, d3.max(yearlySummary, d => d.failedMissions)])
            .range([height, 0]).nice();

        svg.append("g")
            .call(d3.axisLeft(yLeft).ticks(6))
            .selectAll("text")
            .attr("fill", "#e5e7eb");

        svg.append("text")
            .attr("x", -30)
            .attr("y", -10)
            .attr("fill", "#e5e7eb")
            .style("font-size", "10px")
            .text("Failed Missions");

        const yRight = d3.scaleLinear()
            .domain([0, d3.max(yearlySummary, d => d.failedBudget)])
            .range([height, 0]).nice();

        svg.append("g")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisRight(yRight).ticks(6))
            .selectAll("text")
            .attr("fill", "#e5e7eb");

        svg.append("text")
            .attr("x", width + 40)
            .attr("y", -10)
            .attr("fill", "#e5e7eb")
            .style("font-size", "10px")
            .attr("text-anchor", "end")
            .text("Wasted Budget (B$)");

        svg.append("g")
            .selectAll(".bar-budget")
            .data(yearlySummary)
            .join("rect")
            .attr("x", d => x(d.Year))
            .attr("width", x.bandwidth())
            .attr("y", d => yRight(d.failedBudget))
            .attr("height", d => height - yRight(d.failedBudget))
            .attr("fill", "#1f9cf0")
            .attr("opacity", 0.7);

        const lineFailed = d3.line()
            .x(d => x(d.Year) + x.bandwidth() / 2)
            .y(d => yLeft(d.failedMissions));

        svg.append("path")
            .datum(yearlySummary)
            .attr("fill", "none")
            .attr("stroke", "#ff6b8a")
            .attr("stroke-width", 2)
            .attr("d", lineFailed);

        const tooltip = d3.select('#razan1-tooltip');

        svg.append("g")
            .selectAll(".failed-point")
            .data(yearlySummary)
            .join("circle")
            .attr("cx", d => x(d.Year) + x.bandwidth() / 2)
            .attr("cy", d => yLeft(d.failedMissions))
            .attr("r", 5)
            .attr("fill", "#ff6b8a")
            .attr("stroke", "#0b1120")
            .attr("stroke-width", 1)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 7);
                tooltip.style("opacity", 1)
                    .html(`<strong>Year: ${d.Year}</strong><br>
                           Failed missions: ${d.failedMissions}<br>
                           Wasted budget: $${d.failedBudget.toFixed(2)}B`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");
            })
            .on("mouseleave", function () {
                d3.select(this).attr("r", 4);
                tooltip.style("opacity", 0);
            });
    }
}