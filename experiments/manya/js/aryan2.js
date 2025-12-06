// ==================== SEHAS: LIVES SAVED RADIAL VIZ ====================

function initAryan2() {
    const container = document.getElementById('aryan2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    // Inject local HTML structure (title, chart div, tooltip)
    container.innerHTML = `
      <div style="
        position: relative;
        font-family: system-ui, sans-serif;
        background: radial-gradient(circle at center, #00111f, #000);
        color: #fff;
        padding: 20px 10px;
        border-radius: 16px;
        overflow: hidden;
      ">
        <div style="text-align:center;">
          <div style="font-size:30px; font-weight:700; color:#9ed9ff; letter-spacing:1px; margin-bottom:6px;">
            🌍 Lives Saved from Space Technologies
          </div>
          <div style="font-size:14px; color:#7fbaf0; opacity:0.8; margin-bottom:12px;">
            1,000 dollars of economic value is scaled as 1 “life saved” equivalent
          </div>
        </div>
        <div id="sehas-lives-chart" style="width:100%; height:80vh;"></div>
        <div id="sehas-lives-tooltip"
             style="
               position:absolute;
               pointer-events:none;
               background:rgba(10,15,30,0.95);
               padding:10px 15px;
               border-radius:8px;
               color:#fff;
               font-size:14px;
               border:1px solid #4ab3ff;
               opacity:0;
               transition:0.15s ease;
               z-index:999;
               max-width:260px;
             ">
        </div>
      </div>
    `;

    const chartDiv = container.querySelector('#sehas-lives-chart');
    const tooltipEl = container.querySelector('#sehas-lives-tooltip');

    let cachedData = null;

    // ---- Data transform (same logic as your HTML version) ----
    function transformData(original) {
        const sectors = original.children.map(category => {
            const techChildren = category.children.map(tech => {
                const economicLives = (tech.economicValue || 0) * 1000; // $1k → 1 "life"
                const realLives = tech.livesSaved || 0;
                const totalLives = realLives + economicLives;

                return {
                    name: tech.name,
                    impactDetail: tech.impactDetail,
                    economicValue: tech.economicValue,
                    realLives,
                    economicLives,
                    totalLives,
                    sector: category.name,
                    color: category.color
                };
            });

            const sectorTotal = techChildren.reduce((sum, t) => sum + t.totalLives, 0);

            return {
                name: category.name,
                color: category.color,
                totalLives: sectorTotal,
                children: techChildren
            };
        });

        return {
            name: 'Lives Saved',
            children: sectors
        };
    }

    // ---- Build / rebuild viz (uses container width instead of window) ----
    function buildViz(data) {
        // Clear any previous svg on resize/re-init
        d3.select(chartDiv).selectAll('svg').remove();

        const rect = chartDiv.getBoundingClientRect();
        const width = rect.width || window.innerWidth;
        const height = (window.innerHeight * 0.8) || rect.height || 500;
        const outerRadius = Math.min(width, height) / 2 * 0.9; // main max radius

        const svgRoot = d3.select(chartDiv)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const svg = svgRoot.append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const partition = d3.partition()
            .size([2 * Math.PI, 1]); // y is dummy (0–1), we control radius manually

        const root = d3.hierarchy(data)
            .sum(d => d.totalLives || 0)
            .sort((a, b) => (b.totalLives || 0) - (a.totalLives || 0));

        partition(root);

        // Radial layout:
        // Inner ring (sectors):      ~ 0.25R → 0.55R
        // Outer ring (technologies): ~ 0.55R → 0.96R (thicker band)
        const sectorInnerR = outerRadius * 0.25;
        const sectorOuterR = outerRadius * 0.55;
        const techInnerR = sectorOuterR;
        const techOuterR = outerRadius * 0.96;

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => {
                if (d.depth === 1) return sectorInnerR;
                if (d.depth === 2) return techInnerR;
            })
            .outerRadius(d => {
                if (d.depth === 1) return sectorOuterR;
                if (d.depth === 2) return techOuterR;
            });

        const paths = svg.selectAll('path')
            .data(root.descendants().filter(d => d.depth > 0))
            .enter()
            .append('path')
            .attr('d', arc)
            .style('fill', d => {
                if (d.depth === 1) {
                    // Sector (inner ring)
                    return d.data.color || d3.interpolateTurbo(Math.random());
                } else {
                    // Technology (outer ring) – inherits sector color
                    return d.parent.data.color || '#888';
                }
            })
            .style('stroke', '#020814')
            .style('stroke-width', d => (d.depth === 1 ? 3 : 2.2)) // thicker outlines
            .style('stroke-linejoin', 'round')
            .style('shape-rendering', 'geometricPrecision')
            .style('cursor', 'pointer')
            .on('mousemove', (event, d) => {
                tooltipEl.style.opacity = 1;
                tooltipEl.style.left = (event.pageX + 15) + 'px';
                tooltipEl.style.top = (event.pageY - 20) + 'px';

                if (d.depth === 1) {
                    const sectorTotal = d.data.totalLives || 0;
                    tooltipEl.innerHTML = `
              <b>${d.data.name}</b><br>
              <small>Sector total lives (real + scaled):</small><br>
              <b>🌟 ${Math.round(sectorTotal).toLocaleString()}</b>
            `;
                } else if (d.depth === 2) {
                    tooltipEl.innerHTML = `
              <b>${d.data.name}</b><br>
              <small>Sector: ${d.parent.data.name}</small><br>
              ${d.data.impactDetail || ''}<br><br>
              <small>❤️ Real Lives Saved: ${d.data.realLives?.toLocaleString() || 0}</small><br>
              <small>💰 Economic Value: $${d.data.economicValue}B</small><br>
              <small>➕ Scaled Lives (1k$ = 1 life): ${Math.round(d.data.economicLives).toLocaleString()}</small><br>
              <hr>
              <b>🌟 Total Lives Saved: ${Math.round(d.data.totalLives).toLocaleString()}</b>
            `;
                }
            })
            .on('mouseenter', function (event, d) {
                d3.select(this)
                    .raise()
                    .transition()
                    .duration(120)
                    .style('stroke-width', d.depth === 1 ? 5 : 3.4)
                    .style('filter', 'brightness(1.2)');
            })
            .on('mouseleave', function (event, d) {
                tooltipEl.style.opacity = 0;
                d3.select(this)
                    .transition()
                    .duration(120)
                    .style('stroke-width', d.depth === 1 ? 3 : 2.2)
                    .style('filter', 'none');
            })
            .on('click', (event, d) => {
                const scale = d.depth === 1 ? 1.06 : 1.12;
                svg.transition()
                    .duration(500)
                    .attr('transform', `translate(${width / 2}, ${height / 2}) scale(${scale})`);

                setTimeout(() => {
                    svg.transition()
                        .duration(500)
                        .attr('transform', `translate(${width / 2}, ${height / 2}) scale(1)`);
                }, 900);
            });
        // ==================== LEGEND ====================
        // Build sector legend (inner ring colors) + ring explanation
        const sectorNodes = root.children || [];
        const totalLives = root.value || 0;
        const formatPct = d3.format(".1f");

        // Legend group on the right side for wide screens
        const legend = svgRoot.append("g")
            .attr("class", "lives-legend")
            .attr("transform", `translate(${width - 260}, 40)`);

        // Title
        legend.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#9ed9ff")
            .style("font-size", "13px")
            .style("font-weight", "700")
            .text("SECTORS (inner ring)");

        // One row per sector
        const legendRow = legend.selectAll(".legend-row")
            .data(sectorNodes)
            .enter()
            .append("g")
            .attr("class", "legend-row")
            .attr("transform", (d, i) => `translate(0, ${18 + i * 20})`);

        legendRow.append("rect")
            .attr("x", 0)
            .attr("y", -10)
            .attr("width", 14)
            .attr("height", 14)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", d => d.data.color || "#888")
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1.2);

        legendRow.append("text")
            .attr("x", 22)
            .attr("y", 0)
            .attr("fill", "#e5e7eb")
            .style("font-size", "11px")
            .text(d => {
                const pct = totalLives ? formatPct((d.value || 0) / totalLives * 100) : "0.0";
                return `${d.data.name} – ${pct}% of total lives`;
            });

        // Small explanation block for rings
        const ringLegend = legend.append("g")
            .attr("transform", `translate(0, ${28 + sectorNodes.length * 20})`);

        ringLegend.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#9ed9ff")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .text("HOW TO READ:");

        ringLegend.append("text")
            .attr("x", 0)
            .attr("y", 16)
            .attr("fill", "#e5e7eb")
            .style("font-size", "10.5px")
            .text("• Inner ring: sectors (e.g., health, climate, safety)");

        ringLegend.append("text")
            .attr("x", 0)
            .attr("y", 30)
            .attr("fill", "#e5e7eb")
            .style("font-size", "10.5px")
            .text("• Outer ring: specific technologies in each sector");

        ringLegend.append("text")
            .attr("x", 0)
            .attr("y", 44)
            .attr("fill", "#e5e7eb")
            .style("font-size", "10.5px")
            .text("• Slice size = real lives + economic 'lives' saved");

    }

    // ---- Fetch data and initialize ----
    fetch('./data/econ_impact.json')
        .then(res => res.json())
        .then(original => {
            cachedData = transformData(original);
            buildViz(cachedData);

            // Rebuild on resize to keep it responsive inside the scrollytelling layout
            window.addEventListener('resize', () => {
                if (cachedData) buildViz(cachedData);
            });
        })
        .catch(err => console.error('Error loading econ_impact.json:', err));
}