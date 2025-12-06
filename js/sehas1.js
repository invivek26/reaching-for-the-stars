// ==================== SEHAS1: MISSION OUTCOMES ====================

function initSehas1() {
    const container = document.getElementById('sehas1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 22px 16px 28px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 14px; padding: 20px; position: relative;">
                <svg id="sehas1-chart"></svg>
            </div>
            <div id="sehas1-tooltip" style="position: fixed; pointer-events: none; opacity: 0; background: rgba(10, 16, 32, 0.95); color: #f8f8f8; padding: 8px 10px; border-radius: 6px; font-size: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7); border: 1px solid #444; transition: opacity 120ms ease-out; line-height: 1.35; white-space: nowrap; z-index: 10000;"></div>
        </div>
    `;

    const margin = { top: 70, right: 220, bottom: 70, left: 70 };
    const width = 900;
    const height = 450;

    const svg = d3.select("#sehas1-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#111111")
        .style("box-shadow", "0 10px 40px rgba(0, 0, 0, 0.7)")
        .style("border-radius", "12px")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#sehas1-tooltip");

    const outcomeColors = {
        Success: "lime",
        Failure: "red",
    };

    // Background rect for click-to-reset
    svg.insert("rect", ":first-child")
        .attr("class", "bg-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent")
        .style("pointer-events", "all")
        .on("click", () => {
            tooltip.style("opacity", 0);
            updateYearView(null);
        });

    d3.csv("data/Global_Space_Exploration_Dataset.csv", (d, i) => {
        const name = d.Mission || d["Mission"] || d["Mission Name"] || d["Project"] ||
            d["Project Name"] || d["Mission/Project"] || `Project ${i + 1}`;
        return {
            Year: +d.Year,
            SuccessRate: +d["Success Rate (%)"],
            Budget: +d["Budget (in Billion $)"],
            Name: name,
            Raw: d
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
        const series = outcomes.map((outcome) => ({
            outcome,
            values: groupedData
                .filter((d) => d.Outcome === outcome)
                .sort((a, b) => d3.ascending(a.Year, b.Year)),
        }));

        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const xDomainFull = d3.extent(groupedData, (d) => d.Year);
        const yMaxFull = d3.max(groupedData, (d) => d.TotalBudget);
        const yDomainFull = [0, yMaxFull];

        x.domain(xDomainFull).nice();
        y.domain(yDomainFull).nice();

        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y);
        const yGrid = d3.axisLeft(y).tickSize(-width).tickFormat("");

        svg.append("g")
            .attr("class", "grid")
            .call(yGrid)
            .selectAll("line")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-dasharray", "4 4");

        svg.select(".grid").select(".domain").remove();

        svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("fill", "#e0e0e0")
            .attr("font-size", "12px");

        svg.select(".x-axis").selectAll("path, line").attr("stroke", "#888");

        svg.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)
            .selectAll("text")
            .attr("fill", "#e0e0e0")
            .attr("font-size", "12px");

        svg.select(".y-axis").selectAll("path, line").attr("stroke", "#888");

        const line = d3.line()
            .x((d) => x(d.Year))
            .y((d) => y(d.TotalBudget));

        const seriesGroup = svg.append("g").attr("class", "series-group");
        const yearFocusGroup = svg.append("g").attr("class", "year-focus-group");

        const visibility = {};
        outcomes.forEach((o) => (visibility[o] = true));
        let selectedYear = null;

        function updateYearView(year) {
            selectedYear = year;
            tooltip.style("opacity", 0);
            yearFocusGroup.selectAll("*").remove();

            if (!year) {
                x.domain(xDomainFull).nice();
                y.domain(yDomainFull).nice();
            } else {
                x.domain([year - 0.5, year + 0.5]);
                const yearProjects = data.filter(d => d.Year === year);
                let minProj = d3.min(yearProjects, d => d.Budget);
                let maxProj = d3.max(yearProjects, d => d.Budget);
                if (!isFinite(minProj) || !isFinite(maxProj)) {
                    minProj = 0;
                    maxProj = 1;
                }
                const padding = (maxProj - minProj) * 0.2 || 1;
                y.domain([minProj - padding, maxProj + padding]).nice();
            }

            d3.select(".x-axis").transition().duration(600).call(xAxis);
            d3.select(".y-axis").transition().duration(600).call(yAxis);
            d3.select(".grid").transition().duration(600).style("opacity", year ? 0 : 1).call(yGrid);

            seriesGroup.selectAll(".line").transition().duration(600).attr("d", line);
            seriesGroup.selectAll(".dot").transition().duration(600)
                .attr("cx", (d) => x(d.Year))
                .attr("cy", (d) => y(d.TotalBudget))
                .attr("r", (d) => {
                    if (!year) return 4;
                    return d.Year === year ? 0 : 3;
                });

            if (year) {
                drawYearFocusOverlay(year);
            }
        }

        function drawYearFocusOverlay(year) {
            const projects = data.filter((d) => d.Year === year).sort((a, b) => d3.descending(a.Budget, b.Budget));
            const innerMargin = 40;
            const projX = d3.scaleBand()
                .domain(projects.map((_, i) => i))
                .range([innerMargin, width - innerMargin])
                .padding(0.2);

            const projectLine = d3.line()
                .x((_, i) => projX(i) + projX.bandwidth() / 2)
                .y((d) => y(d.Budget));

            if (projects.length > 1) {
                yearFocusGroup.append("path")
                    .datum(projects)
                    .attr("class", "project-line")
                    .attr("d", projectLine)
                    .attr("fill", "none")
                    .attr("stroke", "#cccccc")
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0.8);
            }

            const projDots = yearFocusGroup.selectAll(".project-dot")
                .data(projects)
                .enter()
                .append("circle")
                .attr("class", "project-dot")
                .attr("cx", (_, i) => projX(i) + projX.bandwidth() / 2)
                .attr("cy", (d) => y(d.Budget))
                .attr("r", 0)
                .attr("fill", (d) => outcomeColors[d.Outcome] || "#aaa")
                .attr("stroke", "#000")
                .attr("stroke-width", 0.5)
                .style("cursor", "pointer")
                .on("click", (event) => {
                    event.stopPropagation();
                    tooltip.style("opacity", 0);
                });

            projDots.transition().delay((_, i) => 150 + i * 40).duration(300).attr("r", 5);

            projDots.on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.Name}</strong><br/>Budget: ${d.Budget.toFixed(2)} B$<br/>Outcome: ${d.Outcome}`);
            })
                .on("mousemove", function (event) {
                    tooltip.style("left", event.pageX + 15 + "px").style("top", event.pageY - 10 + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                });
        }

        function highlightSeries(outcome) {
            seriesGroup.selectAll(".line, .dot")
                .style("opacity", 0.15)
                .filter(`[data-outcome="${outcome}"]`)
                .style("opacity", 1)
                .style("filter", "drop-shadow(0 0 6px rgba(255,255,255,0.6))");
        }

        function resetHighlight() {
            seriesGroup.selectAll(".line, .dot")
                .style("opacity", 0.9)
                .style("filter", "none");
        }

        // Draw lines + dots
        series.forEach((s) => {
            const classSuffix = s.outcome === "Success" ? "success" : "failure";
            const strokeColor = s.outcome === "Success" ? "lime" : "red";

            const path = seriesGroup.append("path")
                .datum(s.values)
                .attr("class", `line line-${classSuffix}`)
                .attr("data-outcome", s.outcome)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", strokeColor)
                .attr("stroke-width", 2.5)
                .attr("opacity", 0.9);

            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition().duration(1500).ease(d3.easeCubicOut)
                .attr("stroke-dashoffset", 0);

            const dots = seriesGroup.selectAll(`.dot-${classSuffix}`)
                .data(s.values)
                .enter()
                .append("circle")
                .attr("class", `dot dot-${classSuffix}`)
                .attr("data-outcome", s.outcome)
                .attr("cx", (d) => x(d.Year))
                .attr("cy", (d) => y(d.TotalBudget))
                .attr("r", 0)
                .attr("fill", strokeColor)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("opacity", 0.9)
                .style("cursor", "pointer");

            dots.transition().delay((_, i) => 400 + i * 80).duration(400).attr("r", 4);

            dots.on("click", function (event, d) {
                event.stopPropagation();
                tooltip.style("opacity", 0);
                if (selectedYear === d.Year) {
                    updateYearView(null);
                } else {
                    updateYearView(d.Year);
                }
            })
                .on("mouseover", function (event, d) {
                    highlightSeries(d.Outcome);
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.Outcome}</strong><br/>Year: ${d.Year}<br/>Total Budget: ${d.TotalBudget.toFixed(2)} B$`);
                    d3.select(this).raise().transition().duration(120)
                        .attr("r", selectedYear === d.Year ? 0 : 7);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", event.pageX + 15 + "px").style("top", event.pageY - 10 + "px");
                })
                .on("mouseout", function (event, d) {
                    resetHighlight();
                    tooltip.style("opacity", 0);
                    d3.select(this).transition().duration(120)
                        .attr("r", function () {
                            if (!selectedYear) return 4;
                            return d.Year === selectedYear ? 0 : 3;
                        });
                });
        });

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", "16px")
            .attr("font-weight", "600")
            .text("Global Space Mission Budget vs Time (Success vs Failure)");

        // Axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", "13px")
            .text("Year");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("font-size", "13px")
            .text("Total Budget (in Billion $)");

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 25}, 0)`);

        outcomes.forEach((outcome, i) => {
            const yOff = i * 28;
            const color = outcomeColors[outcome];

            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${yOff})`)
                .attr("data-outcome", outcome)
                .style("cursor", "pointer")
                .on("click", (event) => event.stopPropagation());

            legendItem.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 18)
                .attr("height", 18)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("fill", color)
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.5);

            legendItem.append("text")
                .attr("x", 26)
                .attr("y", 13)
                .attr("fill", "#f5f5f5")
                .attr("font-size", "12px")
                .text(outcome);

            legendItem
                .on("mouseover", () => highlightSeries(outcome))
                .on("mouseout", () => resetHighlight())
                .on("click", function (event) {
                    event.stopPropagation();
                    visibility[outcome] = !visibility[outcome];

                    d3.select(this).selectAll("rect, text")
                        .transition().duration(300)
                        .style("opacity", visibility[outcome] ? 1 : 0.3);

                    const targetOpacity = visibility[outcome] ? 1 : 0;
                    seriesGroup.selectAll(`[data-outcome="${outcome}"]`)
                        .transition().duration(300)
                        .style("opacity", targetOpacity);
                });
        });

    }).catch(error => {
        console.error('Error loading sehas1 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}