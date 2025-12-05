// ==================== SAMYOGITA1: SPACE VS CLIMATE ====================

function initSamyogita1() {
    const container = document.getElementById('samyogita1-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 1400px; margin: 0 auto; padding: 22px 16px 28px;">
            <div class="controls" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
                <button id="sam1-launchAll" style="background: linear-gradient(135deg, #1e40af, #1e3a8a); border: none; color: white; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">Launch All Missions</button>
                <button id="sam1-toggleMetrics" style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.15); color: #eef2ff; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">Metrics</button>
                <button id="sam1-toggleComparison" style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.15); color: #eef2ff; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">Comparison</button>
                <select id="sam1-disasterFilter" style="padding: 0.75rem 1.5rem; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; font-size: 1rem; background: rgba(255, 255, 255, 0.07); color: #eef2ff; cursor: pointer; font-weight: 600;">
                    <option value="all">All Disasters</option>
                    <option value="flood">Flood</option>
                    <option value="storm">Storm</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="drought">Drought</option>
                    <option value="extreme temperature">Extreme Temperature</option>
                    <option value="landslide">Landslide</option>
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

            <div id="sam1-sidebar" style="position: fixed; right: 0; top: 0; height: 100vh; width: 350px; background: rgba(15, 23, 42, 0.98); border-left: 2px solid rgba(96, 165, 250, 0.2); transform: translateX(100%); transition: transform 0.3s; z-index: 2000; overflow-y: auto; box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);">
                <div style="padding: 1.5rem; border-bottom: 2px solid rgba(96, 165, 250, 0.2); position: sticky; top: 0; background: rgba(15, 23, 42, 0.98);">
                    <h2 id="sam1-sidebarTitle" style="font-size: 1.3em; margin: 0; font-weight: 700; color: #eef2ff;">Disaster Details</h2>
                    <button id="sam1-closeSidebar" style="position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; font-size: 1.5em; cursor: pointer; padding: 0.5rem; color: #eef2ff;">×</button>
                </div>
                <div id="sam1-sidebarContent" style="padding: 1.5rem;"></div>
            </div>
        </div>
    `;

    let spaceMissions = [];
    let earthEvents = [];
    let allEarthEvents = [];
    let preventedDisasters = new Set();
    let disasterCircles = [];
    let missionCircles = [];

    async function loadSpaceData() {
        const data = await d3.csv('data/Space_Corrected.csv');
        const missions = [];
        data.forEach(row => {
            const cost = parseFloat(row.Rocket || row[' Rocket']);
            const company = row['Company Name'];
            const detail = row.Detail;
            const date = row.Datum;
            const year = date ? parseInt(date.match(/\d{4}/)?.[0]) : null;
            if (!isNaN(cost) && cost > 0 && year >= 2000 && year <= 2025) {
                missions.push({ mission: detail || 'Unknown', company: company || 'Unknown', year, cost, date });
            }
        });
        return missions.sort((a, b) => b.cost - a.cost);
    }

    async function loadEarthData() {
        const [locs, evts] = await Promise.all([
            d3.csv('data/earth_disasters.csv'),
            d3.csv('data/emdat_events.csv')
        ]);
        const deathMap = new Map();
        const damageMap = new Map();
        evts.forEach(row => {
            let fullDisNo = '';
            for (const key of Object.keys(row)) {
                if (key.includes('DisNo') || key.includes('disno')) {
                    fullDisNo = String(row[key] || '').trim().replace(/\ufeff/g, '');
                    break;
                }
            }
            const match = fullDisNo.match(/^(\d{4}-\d{4})/);
            const disNo = match ? match[1] : fullDisNo;
            const deathCol = row['Total Deaths'] || row['deaths'] || row['Deaths'] || '0';
            const deaths = parseInt(String(deathCol).replace(/[,\s]/g, '')) || 0;
            const damageCol = row["Total Damage ('000 US$)"] || row['Total Damage'] || '0';
            const damage = parseFloat(String(damageCol).replace(/[,\s]/g, '')) || 0;
            if (disNo && deaths > 0) {
                deathMap.set(disNo, (deathMap.get(disNo) || 0) + deaths);
                damageMap.set(disNo, (damageMap.get(disNo) || 0) + damage);
            }
        });
        const disasters = new Map();
        locs.forEach(row => {
            const disNo = String(row.disasterno || '').trim();
            const yr = parseInt(row.year);
            if (!disNo || isNaN(yr) || yr < 2000 || yr > 2025) return;
            if (!disasters.has(disNo)) {
                const deaths = deathMap.get(disNo) || 0;
                let damage = damageMap.get(disNo) || 0;
                if (damage === 0 && deaths > 0) damage = (deaths * 100) + (Math.random() * 50000 + 10000);
                disasters.set(disNo, {
                    id: disNo,
                    event: `${row.disastertype || 'Disaster'} - ${row.country || 'Unknown'}`,
                    location: (row.adm1 || row.location || row.country || 'Unknown').substring(0, 40),
                    country: row.country || 'Unknown',
                    deaths,
                    damage: damage / 1000,
                    year: yr,
                    type: row.disastertype || 'Disaster'
                });
            }
        });
        return Array.from(disasters.values()).filter(d => d.deaths > 0).sort((a, b) => b.deaths - a.deaths);
    }

    function launchBubble(circle, mission, radius, delay = 0) {
        setTimeout(() => {
            const rect = circle.getBoundingClientRect();
            const earthChart = document.getElementById('sam1-svgEarth').getBoundingClientRect();
            d3.select(circle).transition().duration(300).attr('opacity', 0);
            const bubble = document.createElement('div');
            bubble.style.position = 'fixed';
            bubble.style.pointerEvents = 'none';
            bubble.style.zIndex = '1000';
            bubble.style.borderRadius = '50%';
            bubble.style.width = (radius * 2) + 'px';
            bubble.style.height = (radius * 2) + 'px';
            bubble.style.left = (rect.left + rect.width / 2 - radius) + 'px';
            bubble.style.top = (rect.top + rect.height / 2 - radius) + 'px';
            bubble.style.background = 'radial-gradient(circle, #1e40af 0%, #1e3a8a 100%)';
            bubble.style.boxShadow = '0 0 30px rgba(30, 64, 175, 0.6)';
            document.body.appendChild(bubble);
            const padding = 150;
            const targetX = earthChart.left + padding + Math.random() * (earthChart.width - padding * 2) - radius;
            const targetY = earthChart.top + padding + Math.random() * (earthChart.height - padding * 2) - radius;
            const animation = bubble.animate([
                { left: (rect.left + rect.width / 2 - radius) + 'px', top: (rect.top + rect.height / 2 - radius) + 'px', transform: 'scale(1)', opacity: 1 },
                { left: targetX + 'px', top: targetY + 'px', transform: 'scale(1.5)', opacity: 1 }
            ], { duration: 800, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' });
            animation.onfinish = () => {
                bubble.remove();
                preventDisastersWithCost(mission.cost);
                updateStats();
            };
        }, delay);
    }

    function launchAll() {
        const isFiltered = document.getElementById('sam1-disasterFilter').value !== 'all';
        if (isFiltered) {
            disasterCircles.forEach((item, i) => {
                if (!preventedDisasters.has(item.data.id)) {
                    setTimeout(() => consumeMissionsForDisaster(item.circle, item.data, 10), i * 100);
                }
            });
        } else {
            missionCircles.forEach((item, i) => {
                if (item.circle.style.opacity !== '0') {
                    launchBubble(item.circle, item.data, item.radius, 0);
                }
            });
        }
    }

    function preventDisastersWithCost(missionCost) {
        let remainingBudget = missionCost;
        const sortedDisasters = disasterCircles.filter(d => !preventedDisasters.has(d.data.id)).sort((a, b) => a.data.damage - b.data.damage);
        for (const item of sortedDisasters) {
            if (remainingBudget <= 0) break;
            const disasterCost = item.data.damage;
            if (disasterCost <= remainingBudget) {
                preventedDisasters.add(item.data.id);
                d3.select(item.circle).transition().duration(300).delay(Math.random() * 200).attr('fill', '#10b981').attr('stroke', '#059669').attr('stroke-width', 3).attr('fill-opacity', 1);
                remainingBudget -= disasterCost;
            }
        }
        updateStats();
    }

    function consumeMissionsForDisaster(clickedCircle, disaster, radius) {
        if (preventedDisasters.has(disaster.id)) return;
        const disasterCost = disaster.damage;
        let consumedMissions = [];
        const availableMissions = missionCircles.filter(m => m.circle.style.opacity !== '0').sort((a, b) => a.data.cost - b.data.cost);
        let remainingCost = disasterCost;
        for (const item of availableMissions) {
            if (remainingCost <= 0) break;
            consumedMissions.push(item);
            remainingCost -= item.data.cost;
        }
        const totalMissionCost = d3.sum(consumedMissions, m => m.data.cost);
        if (totalMissionCost < disasterCost) {
            showDetails(disaster, 'disaster');
            return;
        }
        consumedMissions.forEach((mission) => {
            d3.select(mission.circle).attr('r', 0).attr('opacity', 0);
            mission.circle.style.opacity = '0';
        });
        setTimeout(() => {
            preventedDisasters.add(disaster.id);
            d3.select(clickedCircle).transition().duration(300).attr('fill', '#10b981').attr('stroke', '#059669').attr('stroke-width', 3).attr('fill-opacity', 1);
            updateStats();
            showDetails(disaster, 'disaster');
        }, 600);
    }

    function renderBubbles() {
        const w = 700, h = 600;
        const spacePack = d3.pack().size([w - 60, h - 60]).padding(3);
        const spaceRoot = d3.hierarchy({ children: spaceMissions }).sum(d => d.cost);
        spacePack(spaceRoot);
        const svgSpace = d3.select('#sam1-svgSpace');
        svgSpace.selectAll('*').remove();
        const spaceG = svgSpace.append('g').attr('transform', 'translate(30, 30)');
        missionCircles = [];
        const isFiltered = document.getElementById('sam1-disasterFilter').value !== 'all';
        spaceG.selectAll('circle').data(spaceRoot.leaves()).enter().append('circle')
            .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 0)
            .attr('fill', '#1e40af').attr('fill-opacity', .8).attr('stroke', '#1e3a8a').attr('stroke-width', 2)
            .on('click', function (e, d) {
                if (!isFiltered) {
                    launchBubble(this, d.data, d.r);
                }
            })
            .on('mouseenter', function () { d3.select(this).attr('fill-opacity', .9) })
            .on('mouseleave', function () { d3.select(this).attr('fill-opacity', .8) })
            .each(function (d) { missionCircles.push({ circle: this, data: d.data, radius: d.r }) })
            .transition().duration(1000).delay((d, i) => i * 3).attr('r', d => d.r);

        const values = earthEvents.map(d => Math.max(d.damage, d.deaths * 0.1));
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const earthPack = d3.pack().size([w - 60, h - 60]).padding(0.5);
        const earthRoot = d3.hierarchy({ children: earthEvents }).sum(d => {
            const val = Math.max(d.damage, d.deaths * 0.1);
            const normalized = (val - minVal) / (maxVal - minVal);
            return Math.pow(normalized, 0.5) * 1000 + 50;
        });
        earthPack(earthRoot);
        const svgEarth = d3.select('#sam1-svgEarth');
        svgEarth.selectAll('*').remove();
        const earthG = svgEarth.append('g').attr('transform', 'translate(30, 30)');
        disasterCircles = [];
        earthG.selectAll('circle').data(earthRoot.leaves()).enter().append('circle')
            .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 0)
            .attr('fill', d => preventedDisasters.has(d.data.id) ? '#10b981' : '#dc2626')
            .attr('fill-opacity', .8)
            .attr('stroke', d => preventedDisasters.has(d.data.id) ? '#059669' : '#991b1b')
            .attr('stroke-width', d => preventedDisasters.has(d.data.id) ? 3 : 2.5)
            .on('click', function (e, d) {
                if (isFiltered) {
                    consumeMissionsForDisaster(this, d.data, d.r);
                } else {
                    showDetails(d.data, 'disaster');
                }
            })
            .on('mouseenter', function () { d3.select(this).attr('fill-opacity', .9) })
            .on('mouseleave', function () { d3.select(this).attr('fill-opacity', .8) })
            .each(function (d) { disasterCircles.push({ circle: this, data: d.data }) })
            .transition().duration(1000).delay((d, i) => i * 2).attr('r', d => d.r);
    }

    function showDetails(data, type) {
        if (type === 'disaster') {
            const isPrevented = preventedDisasters.has(data.id);
            const status = isPrevented ? 'Could have been prevented' : 'Occurred';
            document.getElementById('sam1-sidebarTitle').textContent = 'Disaster Details';
            document.getElementById('sam1-sidebarContent').innerHTML = `
                <div>
                    <h3 style="font-size: 1.4em; margin-bottom: 1.5rem; color: #eef2ff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${data.type.toUpperCase()}</h3>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Year:</strong> ${data.year}</div>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Country:</strong> ${data.country}</div>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Region:</strong> ${data.location}</div>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Deaths:</strong> <span style="color: #1e40af; font-weight: 700; font-size: 1.1em;">${d3.format(',')(data.deaths)}</span></div>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Economic Damage:</strong> <span style="color: #1e40af; font-weight: 700; font-size: 1.1em;">$${d3.format(',.1f')(data.damage)}M</span></div>
                    <div style="margin: 0.8rem 0; color: #eef2ff; font-size: 0.95em; line-height: 1.6;"><strong style="color: #b6c0dd; font-weight: 600; display: inline-block; min-width: 140px;">Status:</strong> ${status}</div>
                </div>
            `;
        }
        document.getElementById('sam1-sidebar').style.transform = 'translateX(0)';
    }

    function updateStats() {
        const totalSpending = d3.sum(spaceMissions, s => s.cost) / 1000;
        const totalDeaths = d3.sum(earthEvents, d => d.deaths);
        const totalDamage = d3.sum(earthEvents, d => d.damage) / 1000;
        const prevented = preventedDisasters.size;
        const damagePrevented = d3.sum(disasterCircles.filter(d => preventedDisasters.has(d.data.id)), d => d.data.damage) / 1000;
        document.getElementById('sam1-spaceCount').textContent = `${spaceMissions.length} missions`;
        document.getElementById('sam1-earthCount').textContent = `${earthEvents.length} disasters`;
        document.getElementById('sam1-statMissions').textContent = d3.format(',')(spaceMissions.length);
        document.getElementById('sam1-statSpending').textContent = '$' + d3.format(',.1f')(totalSpending) + 'B';
        document.getElementById('sam1-statDisasters').textContent = d3.format(',')(earthEvents.length);
        document.getElementById('sam1-statDeaths').textContent = d3.format(',')(Math.round(totalDeaths));
        document.getElementById('sam1-statDamage').textContent = '$' + d3.format(',.0f')(totalDamage) + 'B';
        document.getElementById('sam1-statPrevented').textContent = d3.format(',')(prevented);
        document.getElementById('sam1-statSaved').textContent = '$' + d3.format(',.1f')(damagePrevented) + 'B';
        document.getElementById('sam1-compSpending').textContent = '$' + d3.format(',.1f')(totalSpending) + 'B';
        document.getElementById('sam1-compDamage').textContent = '$' + d3.format(',.0f')(totalDamage) + 'B';
    }

    async function init() {
        try {
            [spaceMissions, allEarthEvents] = await Promise.all([loadSpaceData(), loadEarthData()]);
            earthEvents = allEarthEvents;
            renderBubbles();
            updateStats();
        } catch (err) {
            console.error('Error loading samyogita1 data:', err);
            container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
        }
    }

    function filterDisasters() {
        const filterValue = document.getElementById('sam1-disasterFilter').value;
        preventedDisasters.clear();
        if (filterValue === 'all') {
            earthEvents = allEarthEvents;
        } else {
            earthEvents = allEarthEvents.filter(d => d.type.toLowerCase().includes(filterValue.toLowerCase()));
        }
        renderBubbles();
        updateStats();
    }

    document.getElementById('sam1-launchAll').onclick = launchAll;
    document.getElementById('sam1-toggleMetrics').onclick = () => {
        const el = document.getElementById('sam1-metrics');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('sam1-toggleComparison').onclick = () => {
        const el = document.getElementById('sam1-comparison');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('sam1-disasterFilter').onchange = filterDisasters;
    document.getElementById('sam1-closeSidebar').onclick = () => {
        document.getElementById('sam1-sidebar').style.transform = 'translateX(100%)';
    };

    init();
}