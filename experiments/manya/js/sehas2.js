// ==================== SEHAS2: TOP BUDGET MISSIONS (FIXED - RESPONSIVE) ====================

function initSehas2() {
    const container = document.getElementById('sehas2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 100%; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0e27; color: #ffffff; padding: 20px; border-radius: 12px; overflow-x: auto;">
            <h3 style="text-align: center; font-size: 24px; margin-bottom: 5px;">Top-Budget Space Mission per Year</h3>
            <p style="text-align: center; font-size: 14px; color: #aaa; margin-bottom: 30px;">Inner Circles = Collaborating Country Flags • Code Below = Mission</p>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: center;">
                <span id="sehas2-status">Loading data...</span>
            </div>
            
            <div style="width: 100%; overflow-x: auto; overflow-y: hidden;">
                <svg id="sehas2-chart" style="background: #0a0e27; border: 1px solid #333; border-radius: 8px; display: block;"></svg>
            </div>
            
            <div id="sehas2-legend" style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;"></div>
            <div id="sehas2-tooltip" style="position: fixed; background: rgba(20, 20, 40, 0.95); border: 1px solid #4fc3f7; border-radius: 4px; padding: 10px; font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.2s; max-width: 250px; z-index: 9999;"></div>
        </div>
    `;

    const ALIASES = {
        "UAE": "United Arab Emirates",
        "UK": "United Kingdom",
        "USA": "United States",
        "US": "United States",
        "Russia": "Russian Federation",
    };

    const R_MAX_FRACTION = 0.35;  // Reduced from 0.40
    const R_MIN = 12;              // Reduced from 15
    const INNER_HOLE_FRAC = 0.32;
    const GOLDEN_ANGLE = 137.508 * Math.PI / 180;

    const FLAG_EMOJIS = {
        "United States": "🇺🇸",
        "Russian Federation": "🇷🇺",
        "China": "🇨🇳",
        "India": "🇮🇳",
        "Japan": "🇯🇵",
        "United Arab Emirates": "🇦🇪",
        "United Kingdom": "🇬🇧",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Italy": "🇮🇹",
        "Canada": "🇨🇦",
    };

    function getFlagPath(country) {
        const normalized = ALIASES[country] || country;
        return `flags/${normalized}.png`;
    }

    function parseCountries(primary, collab) {
        const items = [];
        if (primary && primary.trim()) items.push(primary.trim());
        if (collab && collab.trim()) {
            collab.split(',').forEach(c => {
                if (c.trim()) items.push(c.trim());
            });
        }
        return [...new Set(items)];
    }

    function missionCode(name) {
        if (!name) return "";
        return name.split(' ')
            .filter(w => w.trim())
            .map(w => w[0].toUpperCase())
            .slice(0, 4)
            .join('');
    }

    function innerCircleLayout(n, R_outer, margin = 6, holeFrac = 0.3) {
        if (n <= 0) return [];
        const r_small = Math.max(6, Math.min(20, (R_outer - margin) * 0.23));  // Reduced max from 26 to 20
        if (n === 1) return [{ x: 0, y: 0, r: r_small }];

        const pts = [];
        const base = holeFrac * R_outer;
        const maxRad = Math.max(R_outer - r_small - margin, 0.001);
        for (let k = 0; k < n; k++) {
            const r_norm = Math.sqrt((k + 0.5) / n);
            const theta = k * GOLDEN_ANGLE;
            const radial = base + r_norm * (maxRad - base);
            pts.push({
                x: radial * Math.cos(theta),
                y: radial * Math.sin(theta),
                r: r_small
            });
        }
        return pts;
    }

    function processData(csvData) {
        const data = d3.csvParse(csvData);
        const filtered = data.filter(d => d['Budget (in Billion $)'] && !isNaN(+d['Budget (in Billion $)']));

        const grouped = d3.group(filtered, d => +d.Year);
        const topMissions = [];

        grouped.forEach((missions, year) => {
            const top = missions.reduce((max, m) =>
                +m['Budget (in Billion $)'] > +max['Budget (in Billion $)'] ? m : max
            );

            const countries = parseCountries(top.Country, top['Collaborating Countries']);
            topMissions.push({
                year: +top.Year,
                budget: +top['Budget (in Billion $)'],
                mission: top['Mission Name'],
                countries: countries,
                code: missionCode(top['Mission Name'])
            });
        });

        return topMissions.sort((a, b) => a.year - b.year);
    }

    function drawChart(missions) {
        // Make width responsive to number of missions
        const baseWidth = 80;  // Reduced from 100
        const width = Math.max(900, Math.min(missions.length * baseWidth, 1400));  // Cap at 1400px
        const height = 600;  // Reduced from 700
        const margin = { top: 40, right: 60, bottom: 80, left: 80 };  // Increased bottom margin
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select('#sehas2-chart').selectAll('*').remove();

        const svg = d3.select('#sehas2-chart')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const budgets = missions.map(m => m.budget);
        const years = missions.map(m => m.year);
        const Bmin = d3.min(budgets);
        const Bmax = d3.max(budgets);

        const yearDiff = years.length > 1 ? d3.min(years.slice(1).map((y, i) => y - years[i])) : 1;
        const R_CAP = R_MAX_FRACTION * (innerWidth / (years[years.length - 1] - years[0] + yearDiff * 2));

        const xScale = d3.scaleLinear()
            .domain([d3.min(years) - 0.5, d3.max(years) + 0.5])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([Bmin - (Bmax - Bmin) * 0.15, Bmax + (Bmax - Bmin) * 0.15])
            .range([innerHeight, 0]);

        function budgetToR(b) {
            if (Bmax === Bmin) return Math.min(R_CAP, Math.max(R_MIN, 35));
            const t = (b - Bmin) / (Bmax - Bmin);
            return Math.max(R_MIN, Math.min(R_MIN + t * (R_CAP - R_MIN), R_CAP));
        }

        // Grid
        g.append('g')
            .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(''))
            .selectAll("line")
            .attr("stroke", "#ffffff")
            .attr("stroke-opacity", 0.15)
            .attr("stroke-dasharray", "3,3");

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(''))
            .selectAll("line")
            .attr("stroke", "#ffffff")
            .attr("stroke-opacity", 0.15)
            .attr("stroke-dasharray", "3,3");

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
            .selectAll("text")
            .style('fill', '#fff')
            .attr("font-size", 11);

        g.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(1)))
            .selectAll("text")
            .style('fill', '#fff')
            .attr("font-size", 11);

        // Axis labels
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 50)
            .attr('fill', '#ffffff')
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text('Year');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerHeight / 2)
            .attr('y', -55)
            .attr('fill', '#ffffff')
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text('Budget (Billion $)');

        const tooltip = d3.select('#sehas2-tooltip');

        missions.forEach(mission => {
            const cx = xScale(mission.year);
            const cy = yScale(mission.budget);
            const R = budgetToR(mission.budget);

            const missionGroup = g.append('g');

            // Outer bubble
            missionGroup.append('circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', R)
                .attr('fill', 'none')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('opacity', 0.95)
                .style('cursor', 'pointer')
                .on('mouseover', function (event) {
                    d3.select(this).attr('stroke', '#4fc3f7').attr('stroke-width', 3);
                    tooltip.style('opacity', 1)
                        .html(`
                            <strong>${mission.mission}</strong><br>
                            Year: ${mission.year}<br>
                            Budget: $${mission.budget.toFixed(1)}B<br>
                            Countries: ${mission.countries.join(', ')}
                        `);
                })
                .on('mousemove', function (event) {
                    tooltip.style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 15) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('stroke', 'white').attr('stroke-width', 2);
                    tooltip.style('opacity', 0);
                });

            // Inner flag circles
            const layout = innerCircleLayout(mission.countries.length, R, 6, INNER_HOLE_FRAC);
            mission.countries.forEach((country, i) => {
                const pos = layout[i];
                const normalizedCountry = ALIASES[country] || country;
                const flagPath = getFlagPath(country);

                const flagGroup = missionGroup.append('g');

                const clipId = `sehas2-clip-${mission.year}-${i}`;
                missionGroup.append('defs')
                    .append('clipPath')
                    .attr('id', clipId)
                    .append('circle')
                    .attr('cx', cx + pos.x)
                    .attr('cy', cy + pos.y)
                    .attr('r', pos.r);

                flagGroup.append('circle')
                    .attr('cx', cx + pos.x)
                    .attr('cy', cy + pos.y)
                    .attr('r', pos.r)
                    .attr('fill', '#1a1a2e')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1);

                const flagImage = flagGroup.append('image')
                    .attr('x', cx + pos.x - pos.r)
                    .attr('y', cy + pos.y - pos.r)
                    .attr('width', pos.r * 2)
                    .attr('height', pos.r * 2)
                    .attr('href', flagPath)
                    .attr('clip-path', `url(#${clipId})`)
                    .attr('preserveAspectRatio', 'xMidYMid slice')
                    .style('pointer-events', 'none');

                flagImage.on('error', function () {
                    d3.select(this).remove();
                    const emoji = FLAG_EMOJIS[normalizedCountry] || '🌍';
                    flagGroup.append('text')
                        .attr('x', cx + pos.x)
                        .attr('y', cy + pos.y + pos.r * 0.3)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', pos.r * 1.2)
                        .attr('pointer-events', 'none')
                        .text(emoji);
                });

                flagGroup.append('circle')
                    .attr('cx', cx + pos.x)
                    .attr('cy', cy + pos.y)
                    .attr('r', pos.r)
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1)
                    .style('cursor', 'pointer')
                    .on('mouseover', function (event) {
                        d3.select(this).attr('stroke', '#ffd700').attr('stroke-width', 2);
                        tooltip.style('opacity', 1).html(`<strong>${normalizedCountry}</strong>`);
                    })
                    .on('mousemove', function (event) {
                        tooltip.style('left', (event.pageX + 15) + 'px')
                            .style('top', (event.pageY - 15) + 'px');
                    })
                    .on('mouseout', function () {
                        d3.select(this).attr('stroke', 'white').attr('stroke-width', 1);
                        tooltip.style('opacity', 0);
                    });
            });

            // Budget label (above)
            g.append('text')
                .attr('x', cx)
                .attr('y', cy - R - 6)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', 10)
                .style('pointer-events', 'none')
                .text(`${mission.budget.toFixed(1)}B`);

            // Mission code (below)
            g.append('text')
                .attr('x', cx)
                .attr('y', cy + R + 16)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', 11)
                .attr('font-weight', 'bold')
                .style('pointer-events', 'none')
                .text(mission.code);
        });

        // Legend
        const legend = d3.select('#sehas2-legend');
        legend.html('<h3 style="margin-top: 0; font-size: 16px; margin-bottom: 15px;">Mission Code Key</h3>');
        missions.forEach(m => {
            legend.append('div')
                .style('display', 'inline-block')
                .style('margin', '5px 15px 5px 0')
                .style('font-size', '13px')
                .html(`<span style="font-weight: bold; color: #4fc3f7; margin-right: 5px;">${m.code}</span> → ${m.mission} (${m.year})`);
        });
    }

    fetch('data/Global_Space_Exploration_Dataset.csv')
        .then(response => {
            if (!response.ok) throw new Error('CSV file not found');
            return response.text();
        })
        .then(csvData => {
            const missions = processData(csvData);
            drawChart(missions);
            d3.select('#sehas2-status').text('✓ Data loaded successfully').style('color', '#4fc3f7');
        })
        .catch(error => {
            console.error('Error loading sehas2 data:', error);
            d3.select('#sehas2-status').text('✗ Could not load data').style('color', '#ff5252');
        });
}