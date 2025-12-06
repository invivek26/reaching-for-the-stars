// ==================== VIVEK2: INVESTMENT TO JOBS FLOW ====================

function initVivek2() {
    const container = document.getElementById('vivek2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="font-family: 'Segoe UI', sans-serif; background: var(--bg-dark, #0a0e27); color: white; padding: 15px; border-radius: 12px;">
            <div style="padding: 15px; background: var(--bg-section, #161b22); text-align: center;">
                <h3 style="color: var(--accent-gold, #ffd700); font-size: 2rem; margin: 10px 0;">Space Economy: Investment to Jobs Flow</h3>
                <p style="color: var(--text-secondary, #8b949e); font-size: 1rem;">How space exploration creates high-paying jobs and drives economic growth (2012-2023)</p>
                
                <div style="display: flex; justify-content: center; gap: 30px; margin: 20px 0; flex-wrap: wrap;" id="vivek2-stats-bar">
                    <div style="text-align: center;">
                        <div style="font-size: 1.8rem; color: var(--accent-green, #00d9a3); font-weight: bold;" id="vivek2-total-jobs">240,891</div>
                        <div style="color: var(--text-secondary, #8b949e); font-size: 0.8rem; margin-top: 3px;">Total Jobs</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8rem; color: var(--accent-green, #00d9a3); font-weight: bold;" id="vivek2-avg-salary">$119,198</div>
                        <div style="color: var(--text-secondary, #8b949e); font-size: 0.8rem; margin-top: 3px;">Average Salary</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8rem; color: var(--accent-green, #00d9a3); font-weight: bold;" id="vivek2-gdp-value">$142.5B</div>
                        <div style="color: var(--text-secondary, #8b949e); font-size: 0.8rem; margin-top: 3px;">GDP Contribution</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8rem; color: var(--accent-green, #00d9a3); font-weight: bold;" id="vivek2-growth-rate">+27.2%</div>
                        <div style="color: var(--text-secondary, #8b949e); font-size: 0.8rem; margin-top: 3px;">Growth Since 2012</div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 15px; background: var(--bg-section, #161b22); text-align: center;">
                <div style="margin-bottom: 10px;">
                    <span>Select Year:</span>
                    <span style="font-size: 1.3rem; color: var(--accent-gold, #ffd700); font-weight: bold; margin-left: 10px;" id="vivek2-current-year">2023</span>
                </div>
                <input type="range" min="2012" max="2023" value="2023" style="width: 80%; height: 6px; background: var(--border, #30363d); border-radius: 3px; outline: none;" id="vivek2-year-slider">
            </div>
            
            <div style="max-width: 1000px; margin: 15px auto; padding: 0 10px;">
                <svg id="vivek2-sankey-viz" style="width: 100%; height: 350px; background: var(--bg-section, #161b22); border-radius: 8px; border: 1px solid var(--border, #30363d);"></svg>
            </div>
            
            <div style="max-width: 1000px; margin: 15px auto; padding: 10px; border-radius: 6px; background: var(--bg-section, #161b22);">
                <div style="font-weight: bold; margin-bottom: 10px;">Salary Levels (Average Annual Compensation)</div>
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 3px; background: #FFD700;"></div>
                        <span style="color: var(--text-secondary, #8b949e);">High: >$140K</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 3px; background: #FF8C00;"></div>
                        <span style="color: var(--text-secondary, #8b949e);">Above Average: $100K-$140K</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 3px; background: #FFA500;"></div>
                        <span style="color: var(--text-secondary, #8b949e);">Average: $85K-$100K</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 3px; background: #87CEEB;"></div>
                        <span style="color: var(--text-secondary, #8b949e);">Below Space Avg: <$85K</span>
                    </div>
                </div>
            </div>
            
            <div id="vivek2-tooltip" style="position: absolute; background: var(--bg-tooltip, #1c2128); border: 1px solid var(--border, #30363d); border-radius: 4px; padding: 10px; opacity: 0; pointer-events: none; max-width: 250px;"></div>
        </div>
    `;

    let currentYear = 2023;
    let spaceData = null;

    function getSalaryColor(salary) {
        if (salary >= 140) return '#FFD700';
        if (salary >= 100) return '#FF8C00';
        if (salary >= 85) return '#FFA500';
        return '#87CEEB';
    }

    const flowGradient = d3.scaleLinear().domain([0, 1]).range(['#0B3D91', '#00D9A3']);

    fetch('data/space_economy_data.json')
        .then(response => response.json())
        .then(data => {
            spaceData = data;
            initVisualization();
        })
        .catch(error => console.error('Error loading vivek2 data:', error));

    function processDataForYear(year) {
        const yearStr = year.toString();
        const totalData = spaceData.industries[0];
        const industries = spaceData.industries.slice(3, 13);

        const nodes = [{ name: `Space Economy\n$${(totalData.gdpContribution[yearStr] / 1000).toFixed(1)}B` }];
        const links = [];
        const industryNodeMap = new Map();

        industries.forEach((industry, i) => {
            const jobs = industry.employment[yearStr] || 0;
            const salary = industry.avgSalary[yearStr] || 0;
            const gdp = industry.gdpContribution[yearStr] || 0;

            if (jobs > 0) {
                const nodeName = `${industry.name.substring(0, 30)}\n${(jobs / 1000).toFixed(1)}K jobs`;
                const nodeIndex = nodes.length;
                nodes.push({ name: nodeName, jobs: jobs, salary: salary, gdp: gdp });
                industryNodeMap.set(i, nodeIndex);
                links.push({ source: 0, target: nodeIndex, value: gdp });
            }
        });

        const totalJobs = totalData.employment[yearStr] || 0;
        nodes.push({ name: `Economic Output\n${(totalJobs / 1000).toFixed(1)}K jobs` });

        const outputIndex = nodes.length - 1;
        industries.forEach((industry, i) => {
            if (industry.employment[yearStr] > 0 && industryNodeMap.has(i)) {
                const nodeIndex = industryNodeMap.get(i);
                links.push({ source: nodeIndex, target: outputIndex, value: industry.gdpContribution[yearStr] || 0 });
            }
        });

        return { nodes, links };
    }

    function drawSankey(year) {
        const svg = d3.select('#vivek2-sankey-viz');
        svg.selectAll('*').remove();

        const { nodes, links } = processDataForYear(year);

        const svgElement = svg.node();
        const svgWidth = svgElement.getBoundingClientRect().width;
        const svgHeight = 350;

        const margin = { top: 30, right: 180, bottom: 30, left: 180 };
        const centerX = (svgWidth - 1000) / 2;
        const adjustedMarginLeft = margin.left + Math.max(0, centerX);
        const adjustedMarginRight = margin.right + Math.max(0, centerX);

        const sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(20)
            .extent([[adjustedMarginLeft, margin.top], [svgWidth - adjustedMarginRight, 350 - margin.bottom]]);

        const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
            nodes: nodes.map(d => Object.assign({}, d)),
            links: links.map(d => Object.assign({}, d))
        });

        svg.append('g').selectAll('path').data(sankeyLinks).join('path')
            .attr('d', d3.sankeyLinkHorizontal())
            .attr('stroke', d => flowGradient(d.source.x0 / 1000))
            .attr('stroke-width', d => Math.max(1, d.width))
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.4)
            .on('mouseover', handleLinkHover)
            .on('mouseout', hideTooltip);

        const node = svg.append('g').selectAll('g').data(sankeyNodes).join('g');

        node.append('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', d => {
                if (d.salary) return getSalaryColor(d.salary);
                if (d.x0 < margin.left + 50) return '#0B3D91';
                return '#7FFF00';
            })
            .attr('stroke', '#0d1117')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', handleNodeHover)
            .on('mouseout', hideTooltip);

        node.append('text')
            .attr('x', d => (d.x0 + d.x1) / 2)
            .attr('y', d => (d.y0 + d.y1) / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .style('font-size', '11px')
            .style('pointer-events', 'none')
            .text(d => d.name);
    }

    function handleNodeHover(event, d) {
        const tooltip = d3.select('#vivek2-tooltip');
        let html = `<div style="color: var(--accent-gold, #ffd700); font-weight: bold; margin-bottom: 5px;">${d.name.split('\n')[0]}</div>`;

        if (d.jobs) {
            html += `
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                    <span>Jobs:</span> <span style="color: white; font-weight: 600;">${d.jobs.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                    <span>Avg Salary:</span> <span style="color: white; font-weight: 600;">$${(d.salary * 1000).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                    <span>GDP Contribution:</span> <span style="color: white; font-weight: 600;">$${(d.gdp / 1000).toFixed(2)}B</span>
                </div>
            `;
        }

        tooltip.html(html)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .style('opacity', 1);
    }

    function handleLinkHover(event, d) {
        const tooltip = d3.select('#vivek2-tooltip');
        tooltip.html(`
            <div style="color: var(--accent-gold, #ffd700); font-weight: bold; margin-bottom: 5px;">Flow</div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                <span>From:</span> <span style="color: white; font-weight: 600;">${d.source.name.split('\n')[0]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                <span>To:</span> <span style="color: white; font-weight: 600;">${d.target.name.split('\n')[0]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 0.9rem;">
                <span>Value:</span> <span style="color: white; font-weight: 600;">$${(d.value / 1000).toFixed(2)}B</span>
            </div>
        `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .style('opacity', 1);
    }

    function hideTooltip() {
        d3.select('#vivek2-tooltip').style('opacity', 0);
    }

    function updateStats(year) {
        const yearStr = year.toString();
        const totalData = spaceData.industries[0];

        document.getElementById('vivek2-total-jobs').textContent = totalData.employment[yearStr].toLocaleString();
        document.getElementById('vivek2-avg-salary').textContent = '$' + (totalData.avgSalary[yearStr] * 1000).toLocaleString();
        document.getElementById('vivek2-gdp-value').textContent = '$' + (totalData.gdpContribution[yearStr] / 1000).toFixed(1) + 'B';

        const growth = ((totalData.employment[yearStr] / totalData.employment['2012'] - 1) * 100).toFixed(1);
        document.getElementById('vivek2-growth-rate').textContent = '+' + growth + '%';
    }

    document.getElementById('vivek2-year-slider').addEventListener('input', function (e) {
        currentYear = parseInt(e.target.value);
        document.getElementById('vivek2-current-year').textContent = currentYear;
        updateStats(currentYear);
        drawSankey(currentYear);
    });

    function initVisualization() {
        updateStats(currentYear);
        drawSankey(currentYear);
    }
}