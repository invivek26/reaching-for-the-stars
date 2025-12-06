// ==================== ARYAN1: BYPRODUCT TECHNOLOGIES TREEMAP ====================

function initAryan1() {
    const container = document.getElementById('aryan1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    // Build HTML structure
    container.innerHTML = `
        <div style="max-width: 1800px; margin: 0 auto; padding: 30px; background: white; border-radius: 15px;">
            <h3 style="text-align: center; color: #2c3e50; margin-bottom: 15px; font-size: 2em; font-weight: 700; letter-spacing: 0.5px; line-height: 1.3;">
                Space Exploration: Byproduct Technologies Impacting Life on Earth
            </h3>
            <p style="text-align: center; color: #7f8c8d; margin-bottom: 35px; font-size: 1.1em; letter-spacing: 0.3px; line-height: 1.5;">
                Click on any technology to see economic impact and year-over-year growth
            </p>

            <div id="aryan1-treemap" style="width: 100%; height: 800px; margin: 0 auto;"></div>

            <div style="display: flex; justify-content: center; flex-wrap: wrap; margin-top: 25px; gap: 25px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #ff9999;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Medical</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #66cdaa;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Communication</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #ffcc99;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Safety</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #ffffcc;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Consumer</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #b0e0e6;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Food</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; border: 2px solid #333; background: #add8e6;"></div>
                    <span style="font-size: 16px; font-weight: 600; color: #2c3e50; letter-spacing: 0.3px;">Environment</span>
                </div>
            </div>

            <div id="aryan1-tooltip" style="position: absolute; background: white; border: 2px solid #333; border-radius: 8px; padding: 20px; pointer-events: none; opacity: 0; transition: opacity 0.3s; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); max-width: 450px; z-index: 1000; line-height: 1.5;"></div>
        </div>
    `;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const treemapEl = document.getElementById('aryan1-treemap');
    const width = treemapEl.clientWidth - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select("#aryan1-treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#aryan1-tooltip");

    d3.json('data/econ_impact.json').then(data => {
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .size([width, height])
            .padding(3)
            .paddingInner(2)
            .round(true)
            (root);

        const colorScale = d3.scaleOrdinal()
            .domain(data.children.map(d => d.name))
            .range(data.children.map(d => d.color));

        function showTooltip(event, d) {
            const formatCurrency = d3.format(",.1f");
            const formatNumber = d3.format(",");

            let tooltipContent = `<h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; border-bottom: 2px solid #3498db; padding-bottom: 8px; letter-spacing: 0.3px;">${d.data.name}</h3>`;
            tooltipContent += `<div style="margin: 12px 0; display: flex; justify-content: space-between; align-items: center; line-height: 1.6;">
                <span style="font-weight: 600; color: #555; margin-right: 15px; font-size: 15px;">Category:</span>
                <span style="color: #2c3e50; font-weight: bold; font-size: 15px;">${d.parent.data.name}</span>
            </div>`;
            tooltipContent += `<div style="margin: 12px 0; display: flex; justify-content: space-between; align-items: center; line-height: 1.6;">
                <span style="font-weight: 600; color: #555; margin-right: 15px; font-size: 15px;">Economic Value:</span>
                <span style="color: #2c3e50; font-weight: bold; font-size: 15px;">$${formatCurrency(d.data.economicValue)}B</span>
            </div>`;
            tooltipContent += `<div style="margin: 12px 0; display: flex; justify-content: space-between; align-items: center; line-height: 1.6;">
                <span style="font-weight: 600; color: #555; margin-right: 15px; font-size: 15px;">Impact:</span>
                <span style="color: #2c3e50; font-weight: bold; font-size: 15px;">${d.data.impactDetail}</span>
            </div>`;

            if (d.data.livesSaved > 0) {
                tooltipContent += `<div style="margin: 12px 0; display: flex; justify-content: space-between; align-items: center; line-height: 1.6;">
                    <span style="font-weight: 600; color: #555; margin-right: 15px; font-size: 15px;">Lives Saved:</span>
                    <span style="color: #e74c3c; font-weight: bold; font-size: 15px;">${formatNumber(d.data.livesSaved)}</span>
                </div>`;
            }

            if (d.data.yearlyGrowth && d.data.yearlyGrowth.length > 0) {
                tooltipContent += `<div style="margin-top: 18px; border-top: 1px solid #ddd; padding-top: 18px;">
                    <div style="font-weight: bold; margin-bottom: 12px; color: #2c3e50; font-size: 16px; letter-spacing: 0.2px;">Year-over-Year Economic Growth ($B)</div>
                    <svg id="aryan1-growth-chart" width="350" height="150"></svg>
                </div>`;
            }

            tooltip.html(tooltipContent).style("opacity", 1);

            if (d.data.yearlyGrowth && d.data.yearlyGrowth.length > 0) {
                drawGrowthChart(d.data.yearlyGrowth, colorScale(d.parent.data.name));
            }

            const tooltipNode = tooltip.node();
            const tooltipRect = tooltipNode.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left = event.pageX + 15;
            let top = event.pageY - 15;

            if (left + tooltipRect.width > viewportWidth) left = event.pageX - tooltipRect.width - 15;
            if (top + tooltipRect.height > viewportHeight) top = event.pageY - tooltipRect.height - 15;
            if (left < 0) left = 15;
            if (top < 0) top = 15;

            tooltip.style("left", left + "px").style("top", top + "px");
        }

        function drawGrowthChart(data, color) {
            const chartSvg = d3.select("#aryan1-growth-chart");
            chartSvg.selectAll("*").remove();

            const chartMargin = { top: 10, right: 30, bottom: 30, left: 50 };
            const chartWidth = 350 - chartMargin.left - chartMargin.right;
            const chartHeight = 150 - chartMargin.top - chartMargin.bottom;

            const g = chartSvg.append("g").attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);
            const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, chartWidth]);
            const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([chartHeight, 0]);

            g.append("g").call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat("")).selectAll("line").attr("stroke", "#e0e0e0").attr("stroke-opacity", 0.7);
            g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d"))).attr("font-size", "12px");
            g.append("g").call(d3.axisLeft(y).ticks(5)).attr("font-size", "12px");

            const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX);
            g.append("path").datum(data).attr("fill", "none").attr("stroke", color).attr("stroke-width", 3).attr("d", line);

            const area = d3.area().x(d => x(d.year)).y0(chartHeight).y1(d => y(d.value)).curve(d3.curveMonotoneX);
            g.append("path").datum(data).attr("fill", color).attr("opacity", 0.2).attr("d", area);

            g.selectAll(".dot").data(data).enter().append("circle").attr("cx", d => x(d.year)).attr("cy", d => y(d.value)).attr("r", 4).attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 2);
        }

        const nodes = svg.selectAll("g").data(root.leaves()).enter().append("g").attr("transform", d => `translate(${d.x0},${d.y0})`);

        nodes.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.parent.data.name))
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("transition", "all 0.3s ease")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 4).attr("stroke", "#000").style("opacity", 0.9).style("filter", "brightness(1.1)");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("stroke-width", 2).attr("stroke", "#333").style("opacity", 1).style("filter", "brightness(1)");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", function (event, d) {
                showTooltip(event, d);
            });

        // Add text labels
        nodes.each(function (d) {
            const node = d3.select(this);
            const rectWidth = d.x1 - d.x0;
            const rectHeight = d.y1 - d.y0;
            const padding = Math.min(6, rectWidth * 0.05, rectHeight * 0.05);

            if (rectWidth > 60 && rectHeight > 40) {
                node.append("text")
                    .attr("x", rectWidth / 2)
                    .attr("y", rectHeight / 2 - 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#000")
                    .attr("font-weight", "bold")
                    .attr("font-size", "14px")
                    .style("pointer-events", "none")
                    .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.3)")
                    .text(d.data.name);

                node.append("text")
                    .attr("x", rectWidth / 2)
                    .attr("y", rectHeight / 2 + 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#000")
                    .attr("font-size", "11px")
                    .style("pointer-events", "none")
                    .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.3)")
                    .text(d.data.impactDetail.substring(0, 30));
            }
        });
    }).catch(error => {
        console.error('Error loading aryan1 data:', error);
        container.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}