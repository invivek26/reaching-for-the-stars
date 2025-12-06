function initSamyogita2() {
    const container = document.getElementById('samyogita2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div id="debris-container-viz" style="position:relative; width:100%; height:800px; background:#0a0f18;">
            <div id="debris-canvas-container" style="position:absolute; inset:0; width:100%; height:100%;"></div>
            
            <div id="debris-top-progress" style="position:absolute; top:10px; left:16px; right:16px; height:6px; z-index:3; background:rgba(255,255,255,.09); border-radius:999px; overflow:hidden; border:1px solid rgba(255,255,255,.06)">
                <div class="fill" id="debris-topProgressFill" style="height:100%; width:0%; background:linear-gradient(90deg,#00d4ff,#5c8aff); box-shadow:0 0 12px rgba(92,138,255,.45)"></div>
            </div>

            <div id="debris-info" style="position:absolute; top:24px; left:18px; z-index:2; background:rgba(12,18,30,.55); border:1px solid rgba(255,255,255,.08); backdrop-filter:saturate(1.1) blur(8px); padding:14px 16px; width:320px; border-radius:12px;">
                <h3 style="margin:0 0 6px; font-size:22px; color:#fff">The Debris Prison</h3>
                <div class="stat" style="margin:8px 0; font-size:14px; color:#fff">
                    Tracked Objects: <b id="debris-debris-count">0</b>
                </div>
                <div class="stat" id="debris-stat-failed" style="margin:8px 0; font-size:14px; color:#fff; display:none">
                    Failed Missions: <b id="debris-failed-count">0</b>
                </div>
                <div class="stat" id="debris-stat-spent" style="margin:8px 0; font-size:14px; color:#fff; display:none">
                    Money Spent: <b>$<span id="debris-spent-amount">0</span>B</b>
                </div>
                <div class="stat" id="debris-stat-waste" style="margin:8px 0; font-size:14px; color:#fff; display:none">
                    Money Wasted: <b>$<span id="debris-waste-amount">0</span>B</b>
                </div>
                <div class="stat" style="margin:8px 0; font-size:14px; color:#fff">
                    Collision Risk: <b id="debris-risk-level">LOW</b>
                </div>
            </div>

            <div id="debris-year-display" style="position:absolute; right:32px; top:50%; transform:translateY(-50%); font-weight:800; font-size:120px; letter-spacing:2px; color:rgba(200,220,255,.05); z-index:1; user-select:none">2000</div>

            <div id="debris-controls" style="position:absolute; bottom:22px; left:50%; transform:translateX(-50%); z-index:2; display:flex; gap:10px">
                <button id="debris-play-btn" style="background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:#e6f0ff; padding:10px 18px; font-weight:600; border-radius:12px; cursor:pointer; transition:.2s ease">Play</button>
                <button id="debris-reset-btn" style="background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:#e6f0ff; padding:10px 18px; font-weight:600; border-radius:12px; cursor:pointer; transition:.2s ease">Reset</button>
            </div>

            <div class="legend" style="position:absolute; left:0; right:0; bottom:64px; z-index:2; display:flex; justify-content:center; gap:18px; color:#8ea1bf; font-size:13px; pointer-events:none;">
                <div class="legend-item" id="debris-legend-failed" style="display:none; align-items:center; gap:8px">
                    <span class="legend-dot" style="width:10px; height:10px; border-radius:50%; background:#b96596; box-shadow:0 0 0 1px rgba(255,255,255,.12)"></span> 
                    Failed mission debris
                </div>
                <div class="legend-item" style="display:inline-flex; align-items:center; gap:8px">
                    <span class="legend-dot" style="width:10px; height:10px; border-radius:50%; background:#b9993a; box-shadow:0 0 0 1px rgba(255,255,255,.12)"></span> 
                    Collision shards
                </div>
                <div class="legend-item" style="display:inline-flex; align-items:center; gap:8px">
                    <span class="legend-dot" style="width:10px; height:10px; border-radius:50%; background:#30b18b; box-shadow:0 0 0 1px rgba(255,255,255,.12)"></span> 
                    Operational objects
                </div>
            </div>
        </div>
    `;

    const config = {
        failedDebrisMultiplier: 3,
        successDebrisMultiplier: 0.5,
        collisionBaseRate: 0.18,
        collisionClusterMin: 8,
        collisionClusterMax: 18,
        sizes: { operational: 0.10, failed: 0.13, collision: 0.09 },
        startYear: 2000,
        endYear: 2025,
        yearStepSeconds: 1.2,
        maxDebris: 1800,
        minDistance: 0.25,
        spacingSample: 600,
        devicePixelRatio: Math.min(1.75, window.devicePixelRatio || 1)
    };

    let scene, camera, renderer, earth, rimGlow, stars;
    let debris = [];
    let currentYear = config.startYear;
    let isPlaying = false;
    let stats = { totalDebris: 0, failedMissions: 0, wastedMoney: 0, spentMoney: 0 };
    
    const clock = new THREE.Clock();
    let accumulator = 0;
    let spaceData = [];
    const recentPositions = [];

    const dateParsers = [
        d3.utcParse('%Y-%m-%d'),
        d3.utcParse('%m/%d/%Y'),
        d3.utcParse('%d-%m-%Y'),
        d3.utcParse('%Y/%m/%d'),
        d3.utcParse('%Y')
    ];

    function parseDateFlexible(dateString) {
        if (!dateString) return null;
        
        const trimmed = String(dateString).trim();
        for (const parser of dateParsers) {
            const parsed = parser(trimmed);
            if (parsed) return parsed;
        }
        
        const fallback = new Date(trimmed);
        return isNaN(+fallback) ? null : fallback;
    }

    async function loadSpaceData() {
        const response = await fetch('data/Space_Corrected.csv', { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not fetch Space_Corrected.csv');
        
        const text = await response.text();
        if (!text || !text.trim()) throw new Error('Empty Space_Corrected.csv');
        
        const rows = d3.csvParse(text);

        spaceData = rows.map(row => {
            const date = parseDateFlexible(row.Datum);
            const status = (row['Status Mission'] || '').trim().toLowerCase();
            const failed = status.includes('failure') || status.includes('partial failure');

            let costInBillions = 0;
            const rocketCost = row.Rocket || row[' Rocket'];
            if (rocketCost) {
                const cleaned = String(rocketCost).replace(/,/g, '').trim();
                const millions = parseFloat(cleaned);
                if (!isNaN(millions) && millions > 0) {
                    costInBillions = millions / 1000;
                }
            }

            return {
                date,
                year: date ? date.getUTCFullYear() : NaN,
                failed,
                cost: costInBillions
            };
        })
        .filter(d => d.date && !isNaN(d.year) && d.year >= config.startYear && d.year <= config.endYear)
        .sort((a, b) => a.date - b.date);

        console.log(`Loaded ${spaceData.length} missions from ${config.startYear} to ${config.endYear}`);
        console.log(`Total cost: $${d3.sum(spaceData, d => d.cost).toFixed(1)}B`);
        console.log(`Failed missions: ${spaceData.filter(d => d.failed).length}`);
    }

    function initializeScene() {
        const containerEl = document.getElementById('debris-canvas-container');
        if (!containerEl) {
            console.error('Canvas container not found');
            return;
        }

        setTimeout(() => {
            const rect = containerEl.getBoundingClientRect();
            console.log('Canvas dimensions:', rect.width, 'x', rect.height);

            if (rect.width === 0 || rect.height === 0) {
                console.error('Container has no dimensions');
                return;
            }

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, rect.width / rect.height, 0.1, 1000);
            camera.position.set(0, 0, 20);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(config.devicePixelRatio);
            renderer.setSize(rect.width, rect.height);
            renderer.setClearAlpha(0);
            containerEl.appendChild(renderer.domElement);

            const ambientLight = new THREE.HemisphereLight(0x88a7ff, 0x0b0f16, 0.75);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
            keyLight.position.set(10, 8, 12);
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0x3aa0ff, 0.55);
            fillLight.position.set(-8, -6, 10);
            scene.add(fillLight);

            const earthGeometry = new THREE.SphereGeometry(6, 64, 64);
            const earthMaterial = new THREE.MeshLambertMaterial({
                color: 0x103454,
                emissive: 0x0a1f3a,
                emissiveIntensity: 0.15
            });
            earth = new THREE.Mesh(earthGeometry, earthMaterial);
            scene.add(earth);

            const rimGeometry = new THREE.SphereGeometry(6.2, 64, 64);
            const rimMaterial = new THREE.ShaderMaterial({
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                uniforms: { color: { value: new THREE.Color(0x2dd6ff) } },
                vertexShader: `
                    varying vec3 vN;
                    varying vec3 vW;
                    void main() {
                        vN = normalize(normalMatrix * normal);
                        vec4 wp = modelMatrix * vec4(position, 1.0);
                        vW = wp.xyz;
                        gl_Position = projectionMatrix * viewMatrix * wp;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    varying vec3 vN;
                    varying vec3 vW;
                    void main() {
                        vec3 V = normalize(cameraPosition - vW);
                        float f = pow(1.0 - max(dot(normalize(vN), V), 0.0), 3.0);
                        gl_FragColor = vec4(color, f * 0.55);
                    }
                `
            });
            rimGlow = new THREE.Mesh(rimGeometry, rimMaterial);
            scene.add(rimGlow);

            const starGeometry = new THREE.BufferGeometry();
            const starVertices = [];
            for (let i = 0; i < 1200; i++) {
                starVertices.push(
                    (Math.random() - 0.5) * 420,
                    (Math.random() - 0.5) * 420,
                    (Math.random() - 0.5) * 420
                );
            }
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            
            const starMaterial = new THREE.PointsMaterial({
                color: 0x7f92d6,
                size: 0.35,
                transparent: true,
                opacity: 0.22
            });
            stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(stars);

            clock.start();
            animate();
        }, 100);
    }

    function tryPlaceDebris(radius, phi, theta) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        const checkStart = Math.max(0, recentPositions.length - config.spacingSample);
        for (let i = checkStart; i < recentPositions.length; i++) {
            const [px, py, pz] = recentPositions[i];
            const dx = x - px, dy = y - py, dz = z - pz;
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            
            if (distanceSquared < config.minDistance * config.minDistance) {
                return null;
            }
        }

        recentPositions.push([x, y, z]);
        if (recentPositions.length > 5000) recentPositions.shift();
        
        return new THREE.Vector3(x, y, z);
    }

    function addDebris(type, count = 1) {
        for (let i = 0; i < count; i++) {
            if (debris.length >= config.maxDebris) break;

            let color, size;
            switch (type) {
                case 'failed':
                    color = 0xb96596;
                    size = config.sizes.failed;
                    break;
                case 'collision':
                    color = 0xb9993a;
                    size = config.sizes.collision;
                    break;
                default:
                    color = 0x30b18b;
                    size = config.sizes.operational;
            }

            const geometry = new THREE.SphereGeometry(size, 10, 10);
            const material = new THREE.MeshLambertMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);

            const randomBand = Math.random();
            let altitude;
            if (randomBand < 0.75) {
                altitude = 0.9 + Math.random() * 1.6;
            } else if (randomBand < 0.92) {
                altitude = 3 + Math.random() * 2;
            } else {
                altitude = 5 + Math.random() * 3;
            }

            const orbitRadius = 6 + altitude;
            let position = null;
            let attempts = 0;

            while (!position && attempts < 12) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                position = tryPlaceDebris(orbitRadius, phi, theta);
                
                if (position) {
                    sphere.userData = {
                        type,
                        speed: 0.003 / (altitude + 1),
                        angle: theta,
                        phi,
                        radius: orbitRadius
                    };
                }
                attempts++;
            }

            if (!position) continue;

            sphere.position.copy(position);
            scene.add(sphere);
            debris.push(sphere);
        }
    }

    function animate() {
        if (!renderer || !scene || !camera) {
            requestAnimationFrame(animate);
            return;
        }

        const deltaTime = clock.getDelta();
        accumulator += deltaTime;

        earth.rotation.y += 0.00055;
        rimGlow.rotation.copy(earth.rotation);
        if (stars) stars.rotation.y -= 0.0001;

        debris.forEach(debrisObj => {
            const data = debrisObj.userData;
            data.angle += data.speed;
            
            debrisObj.position.x = data.radius * Math.sin(data.phi) * Math.cos(data.angle);
            debrisObj.position.y = data.radius * Math.sin(data.phi) * Math.sin(data.angle);
            debrisObj.position.z = data.radius * Math.cos(data.phi);
        });

        if (isPlaying) {
            while (accumulator >= config.yearStepSeconds) {
                accumulator -= config.yearStepSeconds;
                
                if (currentYear < config.endYear) {
                    currentYear++;
                    updateYear();
                } else {
                    isPlaying = false;
                    document.getElementById('debris-play-btn').textContent = 'Done';
                    break;
                }
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function toggleStatVisibility(id, isVisible) {
        const element = document.getElementById(id);
        if (element) element.style.display = isVisible ? '' : 'none';
    }

    function updateHudVisibility() {
        toggleStatVisibility('debris-stat-failed', stats.failedMissions > 0);
        toggleStatVisibility('debris-stat-spent', stats.spentMoney > 0.00001);
        toggleStatVisibility('debris-stat-waste', stats.wastedMoney > 0.00001);
    }

    function updateLegendVisibility() {
        const failedLegend = document.getElementById('debris-legend-failed');
        if (failedLegend) {
            failedLegend.style.display = stats.failedMissions > 0 ? 'inline-flex' : 'none';
        }
    }

    function updateYear() {
        document.getElementById('debris-year-display').textContent = currentYear;

        const missionsThisYear = spaceData.filter(d => d.year === currentYear);

        missionsThisYear.forEach(mission => {
            stats.spentMoney += mission.cost;

            if (mission.failed) {
                addDebris('failed', config.failedDebrisMultiplier);
                stats.failedMissions++;
                stats.wastedMoney += mission.cost;
                stats.totalDebris += config.failedDebrisMultiplier;
            } else {
                if (Math.random() < config.successDebrisMultiplier) {
                    addDebris('operational', 1);
                    stats.totalDebris += 1;
                }
            }
        });

        const timeProgress = (currentYear - config.startYear) / (config.endYear - config.startYear);
        const collisionProbability = config.collisionBaseRate * timeProgress;
        
        if (Math.random() < collisionProbability) {
            const clusterSize = Math.floor(
                config.collisionClusterMin + 
                Math.random() * (config.collisionClusterMax - config.collisionClusterMin + 1)
            );
            addDebris('collision', clusterSize);
            stats.totalDebris += clusterSize;
        }

        document.getElementById('debris-debris-count').textContent = stats.totalDebris.toLocaleString();
        
        if (stats.failedMissions > 0) {
            document.getElementById('debris-failed-count').textContent = stats.failedMissions;
        }
        if (stats.spentMoney > 0) {
            document.getElementById('debris-spent-amount').textContent = stats.spentMoney.toFixed(1);
        }
        if (stats.wastedMoney > 0) {
            document.getElementById('debris-waste-amount').textContent = stats.wastedMoney.toFixed(1);
        }

        let riskLevel;
        if (stats.totalDebris < 300) {
            riskLevel = 'LOW';
        } else if (stats.totalDebris < 1100) {
            riskLevel = 'MEDIUM';
        } else {
            riskLevel = 'HIGH';
        }
        document.getElementById('debris-risk-level').textContent = riskLevel;

        const progressPercent = ((currentYear - config.startYear) / (config.endYear - config.startYear)) * 100;
        document.getElementById('debris-topProgressFill').style.width = progressPercent + '%';

        updateHudVisibility();
        updateLegendVisibility();
    }

    function resetSimulation() {
        isPlaying = false;
        document.getElementById('debris-play-btn').textContent = 'Play';
        
        accumulator = 0;
        currentYear = config.startYear;
        stats = { totalDebris: 0, failedMissions: 0, wastedMoney: 0, spentMoney: 0 };
        
        debris.forEach(d => scene.remove(d));
        debris = [];
        recentPositions.length = 0;

        document.getElementById('debris-year-display').textContent = String(config.startYear);
        document.getElementById('debris-debris-count').textContent = '0';
        document.getElementById('debris-failed-count').textContent = '0';
        document.getElementById('debris-spent-amount').textContent = '0';
        document.getElementById('debris-waste-amount').textContent = '0';
        document.getElementById('debris-risk-level').textContent = 'LOW';
        document.getElementById('debris-topProgressFill').style.width = '0%';
        
        updateHudVisibility();
        updateLegendVisibility();
    }

    const playButton = document.getElementById('debris-play-btn');
    playButton.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playButton.textContent = isPlaying ? 'Pause' : 'Play';
    });

    document.getElementById('debris-reset-btn').addEventListener('click', resetSimulation);

    (async function initialize() {
        try {
            await loadSpaceData();
            initializeScene();
            updateHudVisibility();
            updateLegendVisibility();
            
            isPlaying = true;
            playButton.textContent = 'Pause';
        } catch (error) {
            console.error('Debris visualization error:', error);
            container.innerHTML = `<p style="color:#ff6b8a;text-align:center;padding:40px;">Error: ${error.message}</p>`;
        }
    })();
}
