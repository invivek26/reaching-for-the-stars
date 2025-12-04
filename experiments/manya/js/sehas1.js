// ==================== SEHAS1: MISSION OUTCOMES (SUCCESS VS FAILURE) ====================

function initSehas1() {
    const container = document.getElementById('sehas1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at top, #222 0, #050505 60%); border-radius: 12px; padding: 40px;">
            <svg id="sehas1-chart" style="background-color: #111111; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7); border-radius: 12px;"></svg>
        </div>
    `;

    const margin = { top: 60, right: 120, bottom: 60, left: 70 };
    const width = 900;
    const height = 450;

    const svg = d3.select("#sehas1-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const outcomeColors = {
        Success: "lime",
        Failure: "red",
    };

    d3.csv("data/Global_Space_Exploration_Dataset.csv", (d) => {
        return {
            Year: +d.Year,
            SuccessRate: +d["Success Rate (%)"],
            Budget: +d["Budget (in Billion $)"],
        };
    }).then((data) => {
        data.forEach((d) => {
            d.Outcome = d.SuccessRate >= 75 ? "Success" : "Failure";
        });

        const rollup = d3.rollup(
            data,
            (v) => d3.sum(v, (d) => d.Budget),
            (d) => d.Year,
            (d) => d.Outcome
        );

        const groupedData = [];
        for (const [year, outcomeMap] of rollup.entries()) {
            for (const [outcome, totalBudget] of outcomeMap.entries()) {
                groupedData.push({
                    Year: +year,
                    Outcome: outcome,
                    TotalBudget: totalBudget,
                });
            }
        }

        const outcomes = Array.from(new Set(groupedData.map((d) => d.Outcome)));

        const series = outcomes.map((outcome) => {
            return {
                outcome,
                values: groupedData
                    .filter((d) => d.Outcome === outcome)
                    .sort((a, b) => d3.ascending(a.Year, b.Year)),
            };
        });

        const x = d3.scaleLinear()
            .domain(d3.extent(groupedData, (d) => d.Year))
            .nice()
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(groupedData, (d) => d.TotalBudget)])
            .nice()
            .range([height, 0]);

        const yGrid = d3.axisLeft(y).tickSize(-width).tickFormat("");

        svg.append("g")
            .attr("class", "grid")
            .call(yGrid)
            .selectAll("line")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-dasharray", "4 4");

        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("fill", "#e0e0e0")
            .attr("font-size", 12);

        svg.append("g")
            .call(yAxis)
            .selectAll("text")
            .attr("fill", "#e0e0e0")
            .attr("font-size", 12);

        svg.selectAll(".domain, line")
            .attr("stroke", "#888");

        const line = d3.line()
            .x((d) => x(d.Year))
            .y((d) => y(d.TotalBudget));

        series.forEach((s) => {
            const classSuffix = s.outcome === "Success" ? "success" : "failure";

            svg.append("path")
                .datum(s.values)
                .attr("fill", "none")
                .attr("stroke", s.outcome === "Success" ? outcomeColors.Success : outcomeColors.Failure)
                .attr("stroke-width", 2.5)
                .attr("d", line);

            svg.selectAll(`.dot-${classSuffix}`)
                .data(s.values)
                .enter()
                .append("circle")
                .attr("cx", (d) => x(d.Year))
                .attr("cy", (d) => y(d.TotalBudget))
                .attr("r", 4)
                .attr("fill", s.outcome === "Success" ? outcomeColors.Success : outcomeColors.Failure)
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", 16)
            .attr("font-weight", 600)
            .text("Global Space Mission Budget vs Time (Success vs Failure)");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", 13)
            .text("Year");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", 13)
            .text("Total Budget (in Billion $)");

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 20}, 0)`);

        outcomes.forEach((outcome, i) => {
            const yOff = i * 24;
            const color = outcome === "Success" ? outcomeColors.Success : outcomeColors.Failure;

            legend.append("rect")
                .attr("x", 0)
                .attr("y", yOff)
                .attr("width", 16)
                .attr("height", 16)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("fill", color);

            legend.append("text")
                .attr("x", 24)
                .attr("y", yOff + 12)
                .attr("fill", "#f5f5f5")
                .attr("font-size", 12)
                .text(outcome);
        });
    }).catch(error => {
        console.error('Error loading sehas1 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}