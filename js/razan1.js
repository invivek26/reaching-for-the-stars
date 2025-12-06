// ==================== RAZAN1: MISSION ANALYSIS ====================

function initRazan1() {
    const container = document.getElementById('razan1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 980px; margin: 0 auto; padding: 22px 16px 26px;">
            <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; padding: 14px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: center; margin-bottom: 12px;">
                    <label style="color: #b6c0dd; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                        Country:
                        <select id="razan1-countrySelect" style="background: rgba(255, 255, 255, .07); color: #eef2ff; border: 1px solid rgba(255, 255, 255, .15); border-radius: 8px; padding: 6px 10px; font-size: 12px;"></select>
                    </label>
                    <label style="color: #b6c0dd; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                        Mission status:
                        <select id="razan1-statusSelect" style="background: rgba(255, 255, 255, .07); color: #eef2ff; border: 1px solid rgba(255, 255, 255, .15); border-radius: 8px; padding: 6px 10px; font-size: 12px;">
                            <option value="All">All</option>
                            <option value="Successful">Successful</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </label>
                </div>
                <div id="razan1-chart" style="min-height: 520px;"></div>
                <div style="color: #b6c0dd; font-size: 11px; margin-top: 12px; text-align: center;">
                    Bubble size = Environmental Impact. Hover for details.
                </div>
            </div>
        </div>
        <div id="razan1-tooltip" style="position: fixed; pointer-events: none; opacity: 0; background: rgba(10, 16, 32, .95); border: 1px solid rgba(255, 255, 255, .14); border-radius: 12px; padding: 10px; max-width: 240px; box-shadow: 0 18px 40px rgba(0, 0, 0, .45); transform: translateY(8px); transition: opacity .08s, transform .08s; font-size: 12px; z-index: 9999; color: #eef2ff;"></div>
    `;

    d3.csv('data/Global_Space_Exploration_Dataset.csv').then(data => {
        const classifiedData = classifyMissions(data, 80);

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

        const defaultCountry = countries[0] || 'China';
        countrySelect.property("value", defaultCountry);

        const statusSelect = d3.select("#razan1-statusSelect");
        statusSelect.property("value", "All");

        countrySelect.on("change", function () {
            const selectedCountry = this.value;
            const selectedStatus = statusSelect.property("value");
            drawBubbleChart(classifiedData, selectedCountry, selectedStatus);
        });

        statusSelect.on("change", function () {
            const selectedStatus = this.value;
            const selectedCountry = countrySelect.property("value");
            drawBubbleChart(classifiedData, selectedCountry, selectedStatus);
        });

        drawBubbleChart(classifiedData, defaultCountry, 'All');

    }).catch(error => {
        console.error('Error loading razan1 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });
}

function classifyMissions(data, threshold) {
    data.forEach(d => {
        const rate = +d["Success Rate (%)"];
        d.status = rate >= threshold ? "Successful" : "Failed";
    });
    return data;
}

function drawBubbleChart(data, selectedCountry, selectedStatus) {
    d3.select('#razan1-chart svg').remove();

    let countryData = data.filter(d => d.Country === selectedCountry);
    if (selectedStatus !== 'All') {
        countryData = countryData.filter(d => d.status === selectedStatus);
    }

    const el = document.getElementById('razan1-chart');
    const W = Math.min(940, el.clientWidth);
    const H = 520;
    const margin = { top: 50, right: 50, bottom: 90, left: 50 };
    const width = W - margin.left - margin.right;
    const height = H - margin.top - margin.bottom;

    const svg = d3.select("#razan1-chart").append('svg')
        .attr("width", W)
        .attr("height", H)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(countryData, d => +d['Budget (in Billion $)']))
        .range([0, width])
        .nice();

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .call(g => g.selectAll("text").attr("fill", "rgba(182,192,221,.9)").attr("font-size", 11))
        .call(g => g.selectAll("path,line").attr("stroke", "rgba(255,255,255,.18)"));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("fill", "rgba(238,242,255,.92)")
        .style("font-size", "12px")
        .text("Mission Cost (Billion USD)");

    const y = d3.scaleLinear()
        .domain(d3.extent(countryData, d => +d['Duration (in Days)']))
        .range([height, 0])
        .nice();

    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll("text").attr("fill", "rgba(182,192,221,.9)").attr("font-size", 11))
        .call(g => g.selectAll("path,line").attr("stroke", "rgba(255,255,255,.18)"));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -35)
        .attr("fill", "rgba(238,242,255,.92)")
        .style("font-size", "12px")
        .text("Mission Duration (Days)");

    const z = d3.scaleOrdinal()
        .domain(["Low", "Medium", "High"])
        .range([3, 6, 12]);

    const missionColor = d3.scaleOrdinal()
        .domain(["Successful", "Failed"])
        .range(["#1f9cf0", "#ff6b8a"]);

    const tooltip = d3.select("#razan1-tooltip");

    svg.append('g')
        .selectAll("circle")
        .data(countryData)
        .join("circle")
        .attr("cx", d => x(+d['Budget (in Billion $)']))
        .attr("cy", d => y(+d['Duration (in Days)']))
        .attr("r", d => z(d["Environmental Impact"]))
        .attr("stroke", '#0b1120')
        .attr("stroke-width", '0.5px')
        .style("fill", d => missionColor(d.status))
        .attr("opacity", 0.85)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke", "#2dd4bf").attr("stroke-width", '3px');
            tooltip
                .style("opacity", 1)
                .style("transform", "translateY(0px)")
                .html(`
                    <div style="font-weight:800; margin-bottom:4px;">${d["Mission Name"]}</div>
                    <div style="color:#b6c0dd;">Launch year: ${d["Year"]}</div>
                    <div style="color:#b6c0dd;">Cost: $${d['Budget (in Billion $)']}B</div>
                    <div style="color:#b6c0dd;">Duration: ${d['Duration (in Days)']} days</div>
                    <div style="color:#b6c0dd;">Outcome: ${d.status}</div>
                `);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this).attr("stroke", '#0b1120').attr("stroke-width", '0.5px');
            tooltip.style("opacity", 0).style("transform", "translateY(8px)");
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
        .style("fill", "rgba(238,242,255,.92)")
        .text(d => d);
}