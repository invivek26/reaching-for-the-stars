// ==================== VIVEK1: INTERNATIONAL COLLABORATION NETWORK ====================

function initVivek1() {
    const container = document.getElementById('vivek1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="width: 100%; height: 700px; position: relative; background: rgba(10, 14, 39, 0.95); border-radius: 12px;">
            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); text-align: center; z-index: 1000;">
                <h3 style="font-size: 24px; color: #4a90e2; margin: 0; font-weight: 600;">🌍 International Cooperation in Space Exploration</h3>
                <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); margin: 5px 0 0 0;">Network shows which countries collaborate on space missions</div>
            </div>

            <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(74, 144, 226, 0.2); border: 2px solid rgba(74, 144, 226, 0.5); border-radius: 6px; padding: 15px; font-family: monospace; font-size: 11px; line-height: 1.4; z-index: 1000; min-width: 150px;">
                <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid rgba(74, 144, 226, 0.5); padding-bottom: 5px;">COLLABORATION STATISTICS</div>
                <div id="vivek1-stats">Loading...</div>
            </div>

            <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 11px; color: rgba(255, 255, 255, 0.6); text-align: center; z-index: 1000;">
                Flag nodes show countries • Line thickness = Collaboration frequency
            </div>

            <svg id="vivek1-network" style="width: 100%; height: 700px;"></svg>
            <div id="vivek1-tooltip" style="position: absolute; background: rgba(0, 0, 0, 0.9); color: white; padding: 10px; border-radius: 6px; font-size: 12px; line-height: 1.4; pointer-events: none; opacity: 0; transition: opacity 0.3s; max-width: 250px; z-index: 2000; border: 1px solid rgba(74, 144, 226, 0.5);"></div>
        </div>
    `;

    const width = container.clientWidth;
    const height = 700;

    const svg = d3.select("#vivek1-network")
        .attr("width", width)
        .attr("height", height);

    const tooltip = d3.select("#vivek1-tooltip");

    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 10]);

    const ALIASES = { "USA": "United States", "UK": "United Kingdom", "Russia": "Russian Federation", "UAE": "United Arab Emirates" };
    const FLAG_EMOJIS = { "United States": "🇺🇸", "Russian Federation": "🇷🇺", "China": "🇨🇳", "Japan": "🇯🇵", "Germany": "🇩🇪", "France": "🇫🇷", "United Kingdom": "🇬🇧", "India": "🇮🇳", "Israel": "🇮🇱", "United Arab Emirates": "🇦🇪" };
    const getFlagPath = country => `flags/${ALIASES[country] || country}.png`;

    const margin = { top: 100, right: 50, bottom: 100, left: 100 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    const centerX = margin.left + graphWidth / 2;
    const centerY = margin.top + graphHeight / 2;

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(250).strength(0.2))
        .force("charge", d3.forceManyBody().strength(-1200))
        .force("center", d3.forceCenter(centerX, centerY))
        .force("collision", d3.forceCollide().radius(40).strength(1))
        .force("x", d3.forceX(centerX).strength(0.05))
        .force("y", d3.forceY(centerY).strength(0.25));

    d3.csv("data/Global_Space_Exploration_Dataset.csv").then(data => {
        const nodes = new Map(), links = new Map();

        data.forEach(row => {
            const country = row.Country;
            const collaborators = row["Collaborating Countries"];

            if (country) {
                if (!nodes.has(country)) nodes.set(country, { id: country, missions: 0, partners: new Set() });
                nodes.get(country).missions++;
            }

            if (collaborators && country) {
                collaborators.split(',').forEach(collab => {
                    collab = collab.trim();
                    if (collab && collab !== country) {
                        if (!nodes.has(collab)) nodes.set(collab, { id: collab, missions: 0, partners: new Set() });
                        nodes.get(country).partners.add(collab);
                        nodes.get(collab).partners.add(country);

                        const linkKey = [country, collab].sort().join('-');
                        if (!links.has(linkKey)) links.set(linkKey, { source: country, target: collab, weight: 0 });
                        links.get(linkKey).weight++;
                    }
                });
            }
        });

        const nodesArray = Array.from(nodes.values()).map(node => ({ ...node, partnerCount: node.partners.size, partners: Array.from(node.partners) }));
        const linksArray = Array.from(links.values());

        const maxPartners = d3.max(nodesArray, d => d.partnerCount) || 1;
        colorScale.domain([0, maxPartners]);

        const maxMissions = Math.max(...nodesArray.map(n => n.missions));
        const mostActive = nodesArray.filter(n => n.missions === maxMissions);
        const mostCollaborative = nodesArray.reduce((a, b) => a.partnerCount > b.partnerCount ? a : b);

        d3.select("#vivek1-stats").html(`
            Total Missions: ${data.length.toLocaleString()}<br>
            Countries: ${nodesArray.length}<br>
            Countries Collaborating: ${nodesArray.filter(n => n.partnerCount > 0).length}<br>
            Total Partnerships: ${linksArray.length}<br><br>
            <b>Most Collaborative:</b><br>
            ${mostCollaborative.id} (${mostCollaborative.partnerCount} partners)<br><br>
            <b>Most Active:</b><br>
            ${mostActive.length === 1 ? `${mostActive[0].id} (${maxMissions} missions)` : `${mostActive.map(c => c.id).join(', ')} (${maxMissions} missions each)`}
        `);

        const link = svg.append("g")
            .selectAll("line")
            .data(linksArray)
            .enter()
            .append("line")
            .style("stroke", "rgba(74, 144, 226, 0.4)")
            .style("stroke-opacity", 0.6)
            .style("stroke-width", d => Math.min(1 + d.weight * 0.5, 10))
            .on("mouseover", function (event, d) {
                tooltip.html(`${d.source.id || d.source} ↔ ${d.target.id || d.target}<br>Collaborations: ${d.weight}`)
                    .style("opacity", 1)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        const nodeGroup = svg.append("g")
            .selectAll("g")
            .data(nodesArray)
            .enter()
            .append("g")
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                const partnerList = d.partners.slice(0, 5).join(', ') +
                    (d.partners.length > 5 ? `... and ${d.partners.length - 5} more` : '');
                tooltip.html(`<b>${d.id}</b><br>
                    Total Missions: ${d.missions}<br>
                    Collaboration Partners: ${d.partnerCount}<br>
                    ${d.partners.length > 0 ? `Partners: ${partnerList}` : ''}`)
                    .style("opacity", 1)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const defs = svg.append("defs");
        nodesArray.forEach((d, i) => {
            const clipId = `vivek1-clip-${i}`;
            defs.append("clipPath").attr("id", clipId).append("circle").attr("r", 15);
            d.clipId = clipId;
        });

        nodeGroup.each(function (d) {
            const group = d3.select(this);
            const flagPath = getFlagPath(d.id);

            group.append("circle").attr("r", 15).style("fill", colorScale(d.partnerCount)).style("stroke", "white").style("stroke-width", 2);

            const flagImage = group.append("image")
                .attr("x", -15).attr("y", -15).attr("width", 30).attr("height", 30)
                .attr("href", flagPath).attr("clip-path", `url(#${d.clipId})`)
                .attr("preserveAspectRatio", "xMidYMid slice").style("pointer-events", "none");

            flagImage.on("error", function () {
                d3.select(this).remove();
                group.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "central")
                    .attr("font-size", "12px").text(FLAG_EMOJIS[d.id] || "🏳️").style("pointer-events", "none");
            });

            group.append("circle").attr("r", 15).style("fill", "none").style("stroke", "white").style("stroke-width", 2);
        });

        const label = svg.append("g")
            .selectAll("text")
            .data(nodesArray)
            .enter()
            .append("text")
            .attr("font-size", "10px")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(d => d.id)
            .attr("dy", -20);

        simulation.nodes(nodesArray).on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
            label.attr("x", d => d.x).attr("y", d => d.y);
        });
        simulation.force("link").links(linksArray);

        function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
        function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
        function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }

    }).catch(error => {
        console.error("Error loading vivek1 data:", error);
        d3.select("#vivek1-stats").html("Error loading data");
    });
}