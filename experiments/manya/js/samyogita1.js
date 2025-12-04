// ==================== SAMYOGITA1: SPACE VS CLIMATE (FIXED) ====================

function initSamyogita1() {
    const container = document.getElementById('samyogita1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="font-family: -apple-system, sans-serif; background: #f8f9fa; color: #2d3748; padding: 2rem; border-radius: 12px;">
            <h3 style="text-align: center; font-size: 2.5em; font-weight: 700; margin-bottom: 0.5rem;">Space Missions vs Climate Impact</h3>
            <p style="text-align: center; color: #718096; font-size: 1.1em; margin-bottom: 2rem;">Comparing space mission budgets with environmental considerations</p>

            <div style="text-align: center; margin-bottom: 2rem;">
                <button id="samyogita1-launch" style="background: #1e40af; border: 2px solid #1e40af; color: white; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; margin-right: 1rem;">Analyze All Missions</button>
                <button id="samyogita1-metrics" style="background: white; border: 2px solid #e2e8f0; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; color: #2d3748;">Show Metrics</button>
            </div>

            <div id="samyogita1-metrics-panel" style="display: none; max-width: 1600px; margin: 0 auto 2rem; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.1);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2.5em; font-weight: 700; color: #1e40af;" id="samyogita1-stat-missions">0</div>
                        <div style="color: #718096; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Total Missions</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2.5em; font-weight: 700; color: #1e40af;" id="samyogita1-stat-spending">$0B</div>
                        <div style="color: #718096; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Total Spending</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2.5em; font-weight: 700; color: #10b981;" id="samyogita1-stat-success">0</div>
                        <div style="color: #718096; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Successful Missions</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2.5em; font-weight: 700; color: #dc2626;" id="samyogita1-stat-failed">0</div>
                        <div style="color: #718096; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Failed Missions</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1600px; margin: 0 auto;">
                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.1); text-align: center;">
                    <h4 style="font-size: 1.5em; margin-bottom: 1.5rem; font-weight: 600;">Mission Budget Distribution</h4>
                    <svg id="samyogita1-svg-space" style="width: 100%; height: 500px;"></svg>
                    <p style="color: #718096; margin-top: 1rem;" id="samyogita1-space-count">Loading...</p>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.1); text-align: center;">
                    <h4 style="font-size: 1.5em; margin-bottom: 1.5rem; font-weight: 600;">Environmental Impact Levels</h4>
                    <svg id="samyogita1-svg-earth" style="width: 100%; height: 500px;"></svg>
                    <p style="color: #718096; margin-top: 1rem;" id="samyogita1-earth-count">Loading...</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 2rem; color: #718096; font-size: 0.9em;">
                <p>This visualization shows the relationship between space mission investments and their environmental considerations</p>
            </div>
        </div>
    `;

    let spaceMissions = [];
    let analyzedData = new Set();

    // Load only Global_Space_Exploration_Dataset.csv which we know exists
    d3.csv('data/Global_Space_Exploration_Dataset.csv').then(data => {
        // Process space missions from the main dataset
        data.forEach(row => {
            const budget = parseFloat(row['Budget (in Billion $)']);
            const year = parseInt(row.Year);
            if (!isNaN(budget) && budget > 0 && year >= 2000 && year <= 2025) {
                spaceMissions.push({
                    mission: row['Mission Name'] || 'Unknown',
                    country: row.Country || 'Unknown',
                    year,
                    budget,
                    success: parseFloat(row['Success Rate (%)']) >= 75,
                    impact: row['Environmental Impact'] || 'Medium'
                });
            }
        });

        renderBubbles();
        updateStats();

        document.getElementById('samyogita1-launch').addEventListener('click', analyzeAll);
        document.getElementById('samyogita1-metrics').addEventListener('click', () => {
            const panel = document.getElementById('samyogita1-metrics-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
    }).catch(error => {
        console.error('Error loading samyogita1 data:', error);
        container.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 40px;">Error loading visualization data. Please ensure Global_Space_Exploration_Dataset.csv is in the data/ folder.</p>';
    });

    function renderBubbles() {
        const w = 500, h = 500;

        // Space missions by budget
        const spacePack = d3.pack().size([w - 60, h - 60]).padding(3);
        const spaceRoot = d3.hierarchy({ children: spaceMissions.slice(0, 50) }).sum(d => d.budget);
        spacePack(spaceRoot);

        const svgSpace = d3.select('#samyogita1-svg-space');
        svgSpace.selectAll('*').remove();
        const spaceG = svgSpace.append('g').attr('transform', 'translate(30,30)');

        spaceG.selectAll('circle').data(spaceRoot.leaves()).enter().append('circle')
            .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 0)
            .attr('fill', d => d.data.success ? '#1e40af' : '#dc2626')
            .attr('fill-opacity', .8)
            .attr('stroke', d => d.data.success ? '#1e3a8a' : '#991b1b')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .transition().duration(1000).delay((d, i) => i * 3)
            .attr('r', d => d.r);

        // Environmental impact distribution
        const impactCounts = d3.rollup(spaceMissions, v => v.length, d => d.impact);
        const impactData = Array.from(impactCounts, ([impact, count]) => ({ impact, count, value: count }));

        const earthPack = d3.pack().size([w - 60, h - 60]).padding(3);
        const earthRoot = d3.hierarchy({ children: impactData }).sum(d => d.value);
        earthPack(earthRoot);

        const svgEarth = d3.select('#samyogita1-svg-earth');
        svgEarth.selectAll('*').remove();
        const earthG = svgEarth.append('g').attr('transform', 'translate(30,30)');

        const impactColors = { Low: '#10b981', Medium: '#f59e0b', High: '#dc2626' };

        earthG.selectAll('circle').data(earthRoot.leaves()).enter().append('circle')
            .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 0)
            .attr('fill', d => impactColors[d.data.impact] || '#6b7280')
            .attr('fill-opacity', .8)
            .attr('stroke', d => impactColors[d.data.impact] || '#4b5563')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .transition().duration(1000).delay((d, i) => i * 2)
            .attr('r', d => d.r);

        // Add labels
        earthG.selectAll('text').data(earthRoot.leaves()).enter().append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .style('pointer-events', 'none')
            .text(d => `${d.data.impact}\n${d.data.count}`);

        d3.select('#samyogita1-space-count').text(`${spaceMissions.length} missions analyzed`);
        d3.select('#samyogita1-earth-count').text(`Environmental impact distribution`);
    }

    function analyzeAll() {
        spaceMissions.forEach(m => analyzedData.add(m.mission));
        updateStats();

        // Visual feedback
        d3.selectAll('#samyogita1-svg-space circle')
            .transition().duration(500)
            .attr('stroke-width', 3)
            .attr('stroke', '#fbbf24');
    }

    function updateStats() {
        const totalBudget = d3.sum(spaceMissions, s => s.budget);
        const successfulMissions = spaceMissions.filter(m => m.success).length;
        const failedMissions = spaceMissions.length - successfulMissions;

        d3.select('#samyogita1-stat-missions').text(d3.format(',')(spaceMissions.length));
        d3.select('#samyogita1-stat-spending').text('$' + d3.format(',.1f')(totalBudget) + 'B');
        d3.select('#samyogita1-stat-success').text(d3.format(',')(successfulMissions));
        d3.select('#samyogita1-stat-failed').text(d3.format(',')(failedMissions));
    }
}