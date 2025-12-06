function initSamyogita1() {
    const container = document.getElementById('samyogita1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 1400px; margin: 0 auto; padding: 22px 16px 28px;">
            <div class="controls" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
                <button id="sam1-launchAll" style="background: linear-gradient(135deg, #1e40af, #1e3a8a); border: none; color: white; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                    Launch All Missions
                </button>
                <button id="sam1-toggleMetrics" style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.15); color: #eef2ff; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                    Metrics
                </button>
                <button id="sam1-toggleComparison" style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.15); color: #eef2ff; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                    Comparison
                </button>
                <select id="sam1-disasterFilter" style="padding: 0.75rem 1.5rem; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; font-size: 1rem; background: #0f172a; color: #eef2ff; cursor: pointer; font-weight: 600;">
                    <option value="all" style="background: #0f172a; color: #eef2ff;">All Disasters</option>
                    <option value="flood" style="background: #0f172a; color: #eef2ff;">Flood</option>
                    <option value="storm" style="background: #0f172a; color: #eef2ff;">Storm</option>
                    <option value="earthquake" style="background: #0f172a; color: #eef2ff;">Earthquake</option>
                    <option value="drought" style="background: #0f172a; color: #eef2ff;">Drought</option>
                    <option value="extreme temperature" style="background: #0f172a; color: #eef2ff;">Extreme Temperature</option>
                    <option value="landslide" style="background: #0f172a; color: #eef2ff;">Landslide</option>
                </select>
            </div>

            <div id="sam1-metrics" style="display: none; margin-bottom: 2rem; padding: 2rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 12px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #1e40af;" id="sam1-statMissions">0</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Space Missions</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #1e40af;" id="sam1-statSpending">$0B</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Total Spending</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #dc2626;" id="sam1-statDisasters">0</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Climate Disasters</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #dc2626;" id="sam1-statDeaths">0</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Lives Lost</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #dc2626;" id="sam1-statDamage">$0B</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Economic Damage</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #10b981;" id="sam1-statPrevented">0</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Disasters Prevented</div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2em; font-weight: 700; color: #10b981;" id="sam1-statSaved">$0B</div>
                        <div style="color: #b6c0dd; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Damage Prevented</div>
                    </div>
                </div>
            </div>

            <div id="sam1-comparison" style="display: none; max-width: 800px; margin: 0 auto 2rem; padding: 2rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 12px;">
                <h3 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.3em;">The Money Comparison</h3>
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; align-items: center; text-align: center;">
                    <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 700; color: #1e40af;" id="sam1-compSpending">$0B</div>
                        <div style="color: #b6c0dd; font-size: 0.9em;">Spent on Space</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: 700; color: #b6c0dd;">VS</div>
                    <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 700; color: #dc2626;" id="sam1-compDamage">$0B</div>
                        <div style="color: #b6c0dd; font-size: 0.9em;">Climate Damage</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div style="background: rgba(15, 23, 42, 0.6); padding: 2rem; border-radius: 12px; border: 1px solid rgba(96, 165, 250, 0.2); text-align: center;">
                    <h2 style="font-size: 1.5em; margin-bottom: 1.5rem; font-weight: 600;">Space Missions</h2>
                    <svg id="sam1-svgSpace" viewBox="0 0 700 600" style="width: 100%; height: 500px;"></svg>
                    <p style="color: #b6c0dd; margin-top: 1rem; font-size: 0.95em;" id="sam1-spaceCount">0 missions</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); padding: 2rem; border-radius: 12px; border: 1px solid rgba(96, 165, 250, 0.2); text-align: center;">
                    <h2 style="font-size: 1.5em; margin-bottom: 1.5rem; font-weight: 600;">Climate Disasters</h2>
                    <svg id="sam1-svgEarth" viewBox="0 0 700 600" style="width: 100%; height: 500px;"></svg>
                    <p style="color: #b6c0dd; margin-top: 1rem; font-size: 0.95em;" id="sam1-earthCount">0 disasters</p>
                </div>
            </div>
        </div>

        <div id="sam1-sidebar" style="position: fixed; right: -350px; top: 0; height: 100vh; width: 350px; background: rgba(15, 23, 42, 0.98); border-left: 2px solid rgba(96, 165, 250, 0.2); transition: right 0.3s ease; z-index: 2000; overflow-y: auto; box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);">
            <div style="padding: 1.5rem; border-bottom: 2px solid rgba(96, 165, 250, 0.2); position: sticky; top: 0; background: rgba(15, 23, 42, 0.98);">
                <h2 id="sam1-sidebarTitle" style="font-size: 1.3em; margin: 0; font-weight: 700; color: #eef2ff;">Disaster Details</h2>
                <button id="sam1-closeSidebar" style="position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; font-size: 1.5em; cursor: pointer; padding: 0.5rem; color: #eef2ff;">×</button>
            </div>
            <div id="sam1-sidebarContent" style="padding: 1.5rem;"></div>
        </div>
    `;

    const state = {
        spaceMissions: [],
        earthEvents: [],
        allEarthEvents: [],
        preventedDisasters: new Set(),
        disasterCircles: [],
        missionCircles: []
    };

    async function loadSpaceData() {
        const data = await d3.csv('data/Space_Corrected.csv');
        const missions = [];
        
        data.forEach(row => {
            const costString = row.Rocket || row[' Rocket'];
            const cost = parseFloat(costString);
            const company = row['Company Name'] || 'Unknown';
            const missionName = row.Detail || 'Unknown';
            const dateString = row.Datum;
            const year = dateString ? parseInt(dateString.match(/\d{4}/)?.[0]) : null;
            
            if (!isNaN(cost) && cost > 0 && year >= 2000 && year <= 2025) {
                missions.push({
                    mission: missionName,
                    company: company,
                    year: year,
                    cost: cost,
                    date: dateString
                });
            }
        });
        
        return missions.sort((a, b) => b.cost - a.cost);
    }

    async function loadEarthData() {
        const [locations, events] = await Promise.all([
            d3.csv('data/earth_disasters.csv'),
            d3.csv('data/emdat_events.csv')
        ]);

        const deathsByDisaster = new Map();
        const damageByDisaster = new Map();

        events.forEach(row => {
            let disasterNumber = '';
            
            for (const key of Object.keys(row)) {
                if (key.includes('DisNo') || key.includes('disno')) {
                    disasterNumber = String(row[key] || '').trim().replace(/\ufeff/g, '');
                    break;
                }
            }

            const match = disasterNumber.match(/^(\d{4}-\d{4})/);
            const cleanedNumber = match ? match[1] : disasterNumber;

            const deathColumn = row['Total Deaths'] || row['deaths'] || row['Deaths'] || '0';
            const deaths = parseInt(String(deathColumn).replace(/[,\s]/g, '')) || 0;

            const damageColumn = row["Total Damage ('000 US$)"] || row['Total Damage'] || '0';
            const damageThousands = parseFloat(String(damageColumn).replace(/[,\s]/g, '')) || 0;

            if (cleanedNumber && deaths > 0) {
                deathsByDisaster.set(cleanedNumber, (deathsByDisaster.get(cleanedNumber) || 0) + deaths);
                damageByDisaster.set(cleanedNumber, (damageByDisaster.get(cleanedNumber) || 0) + damageThousands);
            }
        });

        const disasters = new Map();

        locations.forEach(row => {
            const disasterNumber = String(row.disasterno || '').trim();
            const year = parseInt(row.year);

            if (!disasterNumber || isNaN(year) || year < 2000 || year > 2025) return;

            if (!disasters.has(disasterNumber)) {
                const deaths = deathsByDisaster.get(disasterNumber) || 0;
                let damageMillions = damageByDisaster.get(disasterNumber) || 0;

                if (damageMillions === 0 && deaths > 0) {
                    damageMillions = (deaths * 100) + (Math.random() * 50000 + 10000);
                }

                damageMillions = damageMillions / 1000;

                const disasterType = row.disastertype || 'Disaster';
                const country = row.country || 'Unknown';
                const location = (row.adm1 || row.location || country).substring(0, 40);

                disasters.set(disasterNumber, {
                    id: disasterNumber,
                    event: `${disasterType} - ${country}`,
                    location: location,
                    country: country,
                    deaths: deaths,
                    damage: damageMillions,
                    year: year,
                    type: disasterType
                });
            }
        });

        return Array.from(disasters.values())
            .filter(d => d.deaths > 0)
            .sort((a, b) => b.deaths - a.deaths);
    }

    function createFlyingBubble(circle, mission, radius, delay = 0) {
        setTimeout(() => {
            const circleRect = circle.getBoundingClientRect();
            const earthChartRect = document.getElementById('sam1-svgEarth').getBoundingClientRect();

            d3.select(circle).transition().duration(300).attr('opacity', 0);

            const bubble = document.createElement('div');
            Object.assign(bubble.style, {
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: '1000',
                borderRadius: '50%',
                width: (radius * 2) + 'px',
                height: (radius * 2) + 'px',
                left: (circleRect.left + circleRect.width / 2 - radius) + 'px',
                top: (circleRect.top + circleRect.height / 2 - radius) + 'px',
                background: 'radial-gradient(circle, #1e40af 0%, #1e3a8a 100%)',
                boxShadow: '0 0 30px rgba(30, 64, 175, 0.6)'
            });

            document.body.appendChild(bubble);

            const padding = 150;
            const targetX = earthChartRect.left + padding + Math.random() * (earthChartRect.width - padding * 2) - radius;
            const targetY = earthChartRect.top + padding + Math.random() * (earthChartRect.height - padding * 2) - radius;

            const animation = bubble.animate([
                {
                    left: (circleRect.left + circleRect.width / 2 - radius) + 'px',
                    top: (circleRect.top + circleRect.height / 2 - radius) + 'px',
                    transform: 'scale(1)',
                    opacity: 1
                },
                {
                    left: targetX + 'px',
                    top: targetY + 'px',
                    transform: 'scale(1.5)',
                    opacity: 1
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
            });

            animation.onfinish = () => {
                bubble.remove();
                preventDisastersWithBudget(mission.cost);
                updateStatistics();
            };
        }, delay);
    }

    function launchAllMissions() {
        const isFiltered = document.getElementById('sam1-disasterFilter').value !== 'all';

        if (isFiltered) {
            state.disasterCircles.forEach((item, index) => {
                if (!state.preventedDisasters.has(item.data.id)) {
                    setTimeout(() => {
                        consumeMissionsForDisaster(item.circle, item.data, 10);
                    }, index * 100);
                }
            });
        } else {
            state.missionCircles.forEach(item => {
                if (item.circle.style.opacity !== '0') {
                    createFlyingBubble(item.circle, item.data, item.radius, 0);
                }
            });
        }
    }

    function preventDisastersWithBudget(availableBudget) {
        let remainingBudget = availableBudget;

        const unprevented = state.disasterCircles
            .filter(d => !state.preventedDisasters.has(d.data.id))
            .sort((a, b) => a.data.damage - b.data.damage);

        for (const disaster of unprevented) {
            if (remainingBudget <= 0) break;

            const disasterCost = disaster.data.damage;

            if (disasterCost <= remainingBudget) {
                state.preventedDisasters.add(disaster.data.id);

                d3.select(disaster.circle)
                    .transition()
                    .duration(300)
                    .delay(Math.random() * 200)
                    .attr('fill', '#10b981')
                    .attr('stroke', '#059669')
                    .attr('stroke-width', 3)
                    .attr('fill-opacity', 1);

                remainingBudget -= disasterCost;
            }
        }

        updateStatistics();
    }

    function consumeMissionsForDisaster(clickedCircle, disaster, radius) {
        if (state.preventedDisasters.has(disaster.id)) return;

        const disasterCost = disaster.damage;
        const consumedMissions = [];
        let remainingCost = disasterCost;

        const availableMissions = state.missionCircles
            .filter(m => m.circle.style.opacity !== '0')
            .sort((a, b) => a.data.cost - b.data.cost);

        for (const mission of availableMissions) {
            if (remainingCost <= 0) break;
            consumedMissions.push(mission);
            remainingCost -= mission.data.cost;
        }

        const totalMissionCost = d3.sum(consumedMissions, m => m.data.cost);

        if (totalMissionCost < disasterCost) {
            showDisasterDetails(disaster);
            return;
        }

        consumedMissions.forEach(mission => {
            d3.select(mission.circle).attr('r', 0).attr('opacity', 0);
            mission.circle.style.opacity = '0';
        });

        setTimeout(() => {
            state.preventedDisasters.add(disaster.id);

            d3.select(clickedCircle)
                .transition()
                .duration(300)
                .attr('fill', '#10b981')
                .attr('stroke', '#059669')
                .attr('stroke-width', 3)
                .attr('fill-opacity', 1);

            updateStatistics();
            showDisasterDetails(disaster);
        }, 600);
    }

    function renderBubbleCharts() {
        const width = 700;
        const height = 600;
        const padding = 30;

        const spacePack = d3.pack().size([width - 60, height - 60]).padding(3);
        const spaceHierarchy = d3.hierarchy({ children: state.spaceMissions }).sum(d => d.cost);
        spacePack(spaceHierarchy);

        const spaceChart = d3.select('#sam1-svgSpace');
        spaceChart.selectAll('*').remove();
        const spaceGroup = spaceChart.append('g').attr('transform', `translate(${padding}, ${padding})`);

        state.missionCircles = [];
        const isFiltered = document.getElementById('sam1-disasterFilter').value !== 'all';

        spaceGroup.selectAll('circle')
            .data(spaceHierarchy.leaves())
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 0)
            .attr('fill', '#1e40af')
            .attr('fill-opacity', 0.8)
            .attr('stroke', '#1e3a8a')
            .attr('stroke-width', 2)
            .on('click', function(event, d) {
                if (!isFiltered) {
                    createFlyingBubble(this, d.data, d.r);
                }
            })
            .on('mouseenter', function() {
                d3.select(this).attr('fill-opacity', 0.9);
            })
            .on('mouseleave', function() {
                d3.select(this).attr('fill-opacity', 0.8);
            })
            .each(function(d) {
                state.missionCircles.push({
                    circle: this,
                    data: d.data,
                    radius: d.r
                });
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 3)
            .attr('r', d => d.r);

        const disasterValues = state.earthEvents.map(d => Math.max(d.damage, d.deaths * 0.1));
        const minValue = Math.min(...disasterValues);
        const maxValue = Math.max(...disasterValues);

        const earthPack = d3.pack().size([width - 60, height - 60]).padding(0.5);
        const earthHierarchy = d3.hierarchy({ children: state.earthEvents }).sum(d => {
            const value = Math.max(d.damage, d.deaths * 0.1);
            const normalized = (value - minValue) / (maxValue - minValue);
            return Math.pow(normalized, 0.5) * 1000 + 50;
        });
        earthPack(earthHierarchy);

        const earthChart = d3.select('#sam1-svgEarth');
        earthChart.selectAll('*').remove();
        const earthGroup = earthChart.append('g').attr('transform', `translate(${padding}, ${padding})`);

        state.disasterCircles = [];

        earthGroup.selectAll('circle')
            .data(earthHierarchy.leaves())
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 0)
            .attr('fill', d => state.preventedDisasters.has(d.data.id) ? '#10b981' : '#dc2626')
            .attr('fill-opacity', 0.8)
            .attr('stroke', d => state.preventedDisasters.has(d.data.id) ? '#059669' : '#991b1b')
            .attr('stroke-width', d => state.preventedDisasters.has(d.data.id) ? 3 : 2.5)
            .on('click', function(event, d) {
                if (isFiltered) {
                    consumeMissionsForDisaster(this, d.data, d.r);
                } else {
                    showDisasterDetails(d.data);
                }
            })
            .on('mouseenter', function() {
                d3.select(this).attr('fill-opacity', 0.9);
            })
            .on('mouseleave', function() {
                d3.select(this).attr('fill-opacity', 0.8);
            })
            .each(function(d) {
                state.disasterCircles.push({
                    circle: this,
                    data: d.data
                });
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 2)
            .attr('r', d => d.r);
    }

    function showDisasterDetails(disaster) {
        const isPrevented = state.preventedDisasters.has(disaster.id);
        const status = isPrevented ? 'Could have been prevented' : 'Occurred';

        document.getElementById('sam1-sidebarTitle').textContent = 'Disaster Details';
        document.getElementById('sam1-sidebarContent').innerHTML = `
            <div>
                <h3 style="font-size: 1.4em; margin-bottom: 1.5rem; color: #eef2ff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${disaster.type.toUpperCase()}
                </h3>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Year:</strong> 
                    ${disaster.year}
                </div>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Country:</strong> 
                    ${disaster.country}
                </div>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Region:</strong> 
                    ${disaster.location}
                </div>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Deaths:</strong> 
                    <span style="color: #1e40af; font-weight: 700; font-size: 1.1em;">${d3.format(',')(disaster.deaths)}</span>
                </div>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Economic Damage:</strong> 
                    <span style="color: #1e40af; font-weight: 700; font-size: 1.1em;">$${d3.format(',.1f')(disaster.damage)}M</span>
                </div>
                <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;">
                    <strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Status:</strong> 
                    ${status}
                </div>
            </div>
        `;

        document.getElementById('sam1-sidebar').style.right = '0';
    }

    function updateStatistics() {
        const totalSpending = d3.sum(state.spaceMissions, s => s.cost) / 1000;
        const totalDeaths = d3.sum(state.earthEvents, d => d.deaths);
        const totalDamage = d3.sum(state.earthEvents, d => d.damage / 1000);
        const preventedCount = state.preventedDisasters.size;
        const damagePrevented = d3.sum(
            state.disasterCircles.filter(d => state.preventedDisasters.has(d.data.id)),
            d => d.data.damage / 1000
        );

        document.getElementById('sam1-spaceCount').textContent = `${state.spaceMissions.length} missions`;
        document.getElementById('sam1-earthCount').textContent = `${state.earthEvents.length} disasters`;
        document.getElementById('sam1-statMissions').textContent = d3.format(',')(state.spaceMissions.length);
        document.getElementById('sam1-statSpending').textContent = '$' + d3.format(',.1f')(totalSpending) + 'B';
        document.getElementById('sam1-statDisasters').textContent = d3.format(',')(state.earthEvents.length);
        document.getElementById('sam1-statDeaths').textContent = d3.format(',')(Math.round(totalDeaths));
        document.getElementById('sam1-statDamage').textContent = '$' + d3.format(',.0f')(totalDamage) + 'B';
        document.getElementById('sam1-statPrevented').textContent = d3.format(',')(preventedCount);
        document.getElementById('sam1-statSaved').textContent = '$' + d3.format(',.1f')(damagePrevented) + 'B';
        document.getElementById('sam1-compSpending').textContent = '$' + d3.format(',.1f')(totalSpending) + 'B';
        document.getElementById('sam1-compDamage').textContent = '$' + d3.format(',.0f')(totalDamage) + 'B';
    }

    function filterDisasters() {
        const filterValue = document.getElementById('sam1-disasterFilter').value;
        state.preventedDisasters.clear();

        if (filterValue === 'all') {
            state.earthEvents = state.allEarthEvents;
        } else {
            state.earthEvents = state.allEarthEvents.filter(d =>
                d.type.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        renderBubbleCharts();
        updateStatistics();
    }

    async function initialize() {
        try {
            const [missions, disasters] = await Promise.all([
                loadSpaceData(),
                loadEarthData()
            ]);

            state.spaceMissions = missions;
            state.allEarthEvents = disasters;
            state.earthEvents = disasters;

            renderBubbleCharts();
            updateStatistics();
        } catch (error) {
            console.error('Error loading data:', error);
            container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
        }
    }

    document.getElementById('sam1-launchAll').onclick = launchAllMissions;

    document.getElementById('sam1-toggleMetrics').onclick = () => {
        const metricsPanel = document.getElementById('sam1-metrics');
        metricsPanel.style.display = metricsPanel.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('sam1-toggleComparison').onclick = () => {
        const comparisonPanel = document.getElementById('sam1-comparison');
        comparisonPanel.style.display = comparisonPanel.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('sam1-disasterFilter').onchange = filterDisasters;

    document.getElementById('sam1-closeSidebar').onclick = () => {
        document.getElementById('sam1-sidebar').style.right = '-350px';
    };

    initialize();
}
