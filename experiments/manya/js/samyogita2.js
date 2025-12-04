// ==================== SAMYOGITA2: THE DEBRIS PRISON (FIXED WITH VISUAL) ====================

function initSamyogita2() {
    const container = document.getElementById('samyogita2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="font-family: ui-sans-serif, system-ui; color: #e6f0ff; background: linear-gradient(180deg, #0b1220 0%, #0a0f18 100%); padding: 2rem; border-radius: 12px; min-height: 700px; position: relative;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="margin: 0 0 6px; font-size: 22px;">The Debris Prison</h3>
                <p style="margin: 0; color: #8ea1bf; font-size: 14px;">Visualizing space debris accumulation from 2000-2025</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: start;">
                
                <!-- Stats Panel -->
                <div style="background: rgba(12,18,30,.55); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(8px); padding: 14px 16px; border-radius: 12px;">
                    <h4 style="margin: 0 0 10px; font-size: 16px; color: #4fc3f7;">Mission Statistics</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="margin: 8px 0; font-size: 13px;">
                            <b>Year:</b> <span id="samyogita2-year-display" style="color: #4fc3f7; font-size: 18px; font-weight: 800;">2000</span>
                        </div>
                        <div style="margin: 8px 0; font-size: 13px;">
                            <b>Debris Objects:</b> <span id="samyogita2-debris-count" style="color: #fbbf24;">0</span>
                        </div>
                        <div style="margin: 8px 0; font-size: 13px;">
                            <b>Failed Missions:</b> <span id="samyogita2-failed-count" style="color: #ef4444;">0</span>
                        </div>
                        <div style="margin: 8px 0; font-size: 13px;">
                            <b>Money Wasted:</b> $<span id="samyogita2-waste-amount" style="color: #ef4444;">0</span>B
                        </div>
                        <div style="margin: 8px 0; font-size: 13px; grid-column: 1 / -1;">
                            <b>Collision Risk:</b> <span id="samyogita2-risk-level" style="color: #10b981; font-weight: 700;">LOW</span>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="display: flex; gap: 10px;">
                    <button id="samyogita2-play" style="background: rgba(79, 195, 247, 0.2); border: 1px solid #4fc3f7; color: #4fc3f7; padding: 10px 20px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: .2s;">▶ Play</button>
                    <button id="samyogita2-reset" style="background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); color: #e6f0ff; padding: 10px 20px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: .2s;">↻ Reset</button>
                </div>
            </div>

            <!-- Visualization Canvas -->
            <div style="margin-top: 2rem; background: rgba(12,18,30,.55); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 2rem; min-height: 500px; position: relative; overflow: hidden;">
                <svg id="samyogita2-viz-svg" style="width: 100%; height: 500px;"></svg>
                
                <!-- Legend -->
                <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; background: rgba(12,18,30,.8); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #b96596;"></div>
                        <span style="color: #8ea1bf; font-size: 12px;">Failed missions</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #b9993a;"></div>
                        <span style="color: #8ea1bf; font-size: 12px;">Collision debris</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #30b18b;"></div>
                        <span style="color: #8ea1bf; font-size: 12px;">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Visualization setup
    const svg = d3.select('#samyogita2-viz-svg');
    const width = parseInt(svg.style('width'));
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const earthRadius = 80;

    // Clear and setup SVG
    svg.selectAll('*').remove();

    // Add Earth
    const earthGroup = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // Earth glow
    const defs = svg.append('defs');
    const radialGradient = defs.append('radialGradient')
        .attr('id', 'earth-glow');
    radialGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4fc3f7').attr('stop-opacity', 0.3);
    radialGradient.append('stop').attr('offset', '70%').attr('stop-color', '#1e40af').attr('stop-opacity', 0.1);
    radialGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0a0f18').attr('stop-opacity', 0);

    earthGroup.append('circle')
        .attr('r', earthRadius + 30)
        .attr('fill', 'url(#earth-glow)');

    // Earth body
    earthGroup.append('circle')
        .attr('r', earthRadius)
        .attr('fill', '#1e40af')
        .attr('stroke', '#4fc3f7')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

    // Add continents pattern (simple)
    earthGroup.append('circle')
        .attr('cx', -20)
        .attr('cy', -10)
        .attr('r', 25)
        .attr('fill', '#103454')
        .attr('opacity', 0.6);

    earthGroup.append('circle')
        .attr('cx', 15)
        .attr('cy', 20)
        .attr('r', 20)
        .attr('fill', '#103454')
        .attr('opacity', 0.6);

    // Debris container
    const debrisGroup = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // State
    const START_YEAR = 2000;
    const END_YEAR = 2025;
    let currentYear = START_YEAR;
    let isPlaying = false;
    let totalDebris = 0;
    let failedMissions = 0;
    let wastedMoney = 0;
    let debrisObjects = [];

    // Load data
    d3.csv('data/Global_Space_Exploration_Dataset.csv').then(data => {
        const spaceData = data
            .filter(d => d.Year && !isNaN(+d.Year) && +d.Year >= START_YEAR && +d.Year <= END_YEAR)
            .map(d => ({
                year: +d.Year,
                failed: (+d["Success Rate (%)"] < 75),
                cost: +d["Budget (in Billion $)"] || 0
            }));

        function addDebris(type, count) {
            const colors = {
                failed: '#b96596',
                collision: '#b9993a',
                operational: '#30b18b'
            };

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = earthRadius + 40 + Math.random() * 120;
                const size = type === 'failed' ? 4 : (type === 'collision' ? 3 : 3.5);

                const debris = {
                    angle: angle,
                    distance: distance,
                    speed: 0.01 + Math.random() * 0.02,
                    size: size,
                    color: colors[type],
                    type: type
                };

                debrisObjects.push(debris);

                debrisGroup.append('circle')
                    .attr('class', `debris-${debrisObjects.length - 1}`)
                    .attr('r', size)
                    .attr('fill', colors[type])
                    .attr('opacity', 0.8)
                    .attr('cx', distance * Math.cos(angle))
                    .attr('cy', distance * Math.sin(angle));
            }
        }

        function animateDebris() {
            debrisObjects.forEach((debris, i) => {
                debris.angle += debris.speed;
                const x = debris.distance * Math.cos(debris.angle);
                const y = debris.distance * Math.sin(debris.angle);

                debrisGroup.select(`.debris-${i}`)
                    .attr('cx', x)
                    .attr('cy', y);
            });
        }

        // Animation loop
        let animationFrame;
        function animate() {
            animateDebris();
            animationFrame = requestAnimationFrame(animate);
        }
        animate();

        function updateYear() {
            const yearData = spaceData.filter(d => d.year === currentYear);

            yearData.forEach(d => {
                if (d.failed) {
                    addDebris('failed', 3);
                    totalDebris += 3;
                    failedMissions++;
                    wastedMoney += d.cost;
                } else {
                    if (Math.random() < 0.5) {
                        addDebris('operational', 1);
                        totalDebris += 1;
                    }
                }
            });

            // Random collisions
            if (Math.random() < 0.18 * ((currentYear - START_YEAR) / (END_YEAR - START_YEAR))) {
                const collisionCount = Math.floor(Math.random() * 10 + 8);
                addDebris('collision', collisionCount);
                totalDebris += collisionCount;
            }

            // Update UI
            document.getElementById('samyogita2-year-display').textContent = currentYear;
            document.getElementById('samyogita2-debris-count').textContent = totalDebris.toLocaleString();
            document.getElementById('samyogita2-failed-count').textContent = failedMissions;
            document.getElementById('samyogita2-waste-amount').textContent = wastedMoney.toFixed(1);

            const riskLevel = totalDebris < 300 ? 'LOW' : (totalDebris < 1100 ? 'MEDIUM' : 'HIGH');
            const riskColor = totalDebris < 300 ? '#10b981' : (totalDebris < 1100 ? '#fbbf24' : '#ef4444');
            document.getElementById('samyogita2-risk-level').textContent = riskLevel;
            document.getElementById('samyogita2-risk-level').style.color = riskColor;
        }

        // Controls
        let interval;
        document.getElementById('samyogita2-play').addEventListener('click', function () {
            if (isPlaying) {
                clearInterval(interval);
                isPlaying = false;
                this.innerHTML = '▶ Play';
                this.style.background = 'rgba(79, 195, 247, 0.2)';
            } else {
                isPlaying = true;
                this.innerHTML = '⏸ Pause';
                this.style.background = 'rgba(251, 191, 36, 0.2)';
                this.style.borderColor = '#fbbf24';
                this.style.color = '#fbbf24';

                interval = setInterval(() => {
                    if (currentYear < END_YEAR) {
                        currentYear++;
                        updateYear();
                    } else {
                        clearInterval(interval);
                        isPlaying = false;
                        document.getElementById('samyogita2-play').innerHTML = '✓ Done';
                        document.getElementById('samyogita2-play').style.background = 'rgba(16, 185, 129, 0.2)';
                        document.getElementById('samyogita2-play').style.borderColor = '#10b981';
                        document.getElementById('samyogita2-play').style.color = '#10b981';
                    }
                }, 300);  // Faster: 300ms per year
            }
        });

        document.getElementById('samyogita2-reset').addEventListener('click', () => {
            clearInterval(interval);
            isPlaying = false;
            currentYear = START_YEAR;
            totalDebris = 0;
            failedMissions = 0;
            wastedMoney = 0;
            debrisObjects = [];
            debrisGroup.selectAll('circle').remove();

            const playBtn = document.getElementById('samyogita2-play');
            playBtn.innerHTML = '▶ Play';
            playBtn.style.background = 'rgba(79, 195, 247, 0.2)';
            playBtn.style.borderColor = '#4fc3f7';
            playBtn.style.color = '#4fc3f7';

            updateYear();
        });

        updateYear();
    }).catch(error => {
        console.error('Error loading samyogita2 data:', error);
        svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ef4444')
            .text('Error loading data');
    });
}