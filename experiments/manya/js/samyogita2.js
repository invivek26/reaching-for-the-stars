// ==================== SAMYOGITA2: THE DEBRIS PRISON ====================

function initSamyogita2() {
    const container = document.getElementById('samyogita2-viz');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    container.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 22px 16px 26px;">
            <div style="background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; padding: 14px; position: relative; overflow: hidden;">
                <div style="position: relative; z-index: 2;">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; margin-bottom: 12px;">
                        <div style="background: rgba(255, 255, 255, .08); border-radius: 10px; padding: 12px;">
                            <div style="font-size: 11px; color: #b6c0dd; margin-bottom: 4px;">TRACKED OBJECTS</div>
                            <div style="font-size: 24px; font-weight: 800; color: #eef2ff;" id="sam2-debris">0</div>
                        </div>
                        <div style="background: rgba(255, 255, 255, .08); border-radius: 10px; padding: 12px;">
                            <div style="font-size: 11px; color: #b6c0dd; margin-bottom: 4px;">FAILED MISSIONS</div>
                            <div style="font-size: 24px; font-weight: 800; color: #ff6b8a;" id="sam2-failed">0</div>
                        </div>
                        <div style="background: rgba(255, 255, 255, .08); border-radius: 10px; padding: 12px;">
                            <div style="font-size: 11px; color: #b6c0dd; margin-bottom: 4px;">MONEY WASTED</div>
                            <div style="font-size: 24px; font-weight: 800; color: #ff6b8a;" id="sam2-waste">$0B</div>
                        </div>
                        <div style="background: rgba(255, 255, 255, .08); border-radius: 10px; padding: 12px;">
                            <div style="font-size: 11px; color: #b6c0dd; margin-bottom: 4px;">COLLISION RISK</div>
                            <div style="font-size: 24px; font-weight: 800; color: #10b981;" id="sam2-risk">LOW</div>
                        </div>
                    </div>
                </div>
                
                <div id="sam2-container" style="width: 100%; height: 500px; position: relative; border-radius: 8px; overflow: hidden; background: radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.6), rgba(0, 0, 0, 0.9));"></div>
                
                <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); z-index: 1;">
                    <div style="font-size: 80px; font-weight: 900; color: rgba(200, 220, 255, 0.08); letter-spacing: 2px;" id="sam2-year">2000</div>
                </div>

                <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center;">
                    <button id="sam2-play" style="background: rgba(30, 64, 175, 0.8); border: 2px solid rgba(96, 165, 250, 0.5); color: #fff; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600;">
                        Play
                    </button>
                    <button id="sam2-reset" style="background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .15); color: #eef2ff; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600;">
                        Reset
                    </button>
                </div>

                <div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px; font-size: 12px; color: #b6c0dd;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #b96596;"></div>
                        Failed mission debris
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #b9993a;"></div>
                        Collision shards
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #30b18b;"></div>
                        Operational objects
                    </div>
                </div>
            </div>
        </div>
    `;

    // Three.js visualization
    let scene, camera, renderer, earth, debris = [];
    let currentYear = 2000;
    let isPlaying = false;
    let totalDebris = 0, failedMissions = 0, wastedMoney = 0;
    let spaceData = [];
    const clock = new THREE.Clock();
    let acc = 0;
    const YEAR_STEP_S = 0.45;

    d3.csv('data/Global_Space_Exploration_Dataset.csv').then(data => {
        spaceData = processSpaceData(data);
        initThreeJS();
        setupControls();
    }).catch(error => {
        console.error('Error loading samyogita2 data:', error);
        container.innerHTML = '<p style="color: #ff6b8a; text-align: center; padding: 40px;">Error loading visualization data</p>';
    });

    function processSpaceData(data) {
        return data.map(row => {
            const year = parseInt(row.Year);
            const status = row.Status || '';
            const successRate = parseFloat(row['Success Rate (%)']) || 0;
            const cost = parseFloat(row['Budget (in Billion $)']) || 0;
            const failed = successRate < 80;

            return { year, failed, cost };
        }).filter(d => !isNaN(d.year) && d.year >= 2000 && d.year <= 2025);
    }

    function initThreeJS() {
        const threeContainer = document.getElementById('sam2-container');
        const w = threeContainer.clientWidth;
        const h = threeContainer.clientHeight;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
        renderer.setSize(w, h);
        renderer.setClearAlpha(0);
        threeContainer.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.HemisphereLight(0x88a7ff, 0x0b0f16, 0.75));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(10, 8, 12);
        scene.add(keyLight);

        // Earth
        const earthGeo = new THREE.SphereGeometry(6, 64, 64);
        const earthMat = new THREE.MeshLambertMaterial({
            color: 0x103454,
            emissive: 0x0a1f3a,
            emissiveIntensity: 0.15
        });
        earth = new THREE.Mesh(earthGeo, earthMat);
        scene.add(earth);

        clock.start();
        animate();
    }

    function addDebris(type, count = 1) {
        for (let i = 0; i < count; i++) {
            if (debris.length >= 1500) break;

            let color, size;
            if (type === 'failed') {
                color = 0xb96596;
                size = 0.13;
            } else if (type === 'collision') {
                color = 0xb9993a;
                size = 0.09;
            } else {
                color = 0x30b18b;
                size = 0.10;
            }

            const geo = new THREE.SphereGeometry(size, 10, 10);
            const mat = new THREE.MeshLambertMaterial({ color });
            const sphere = new THREE.Mesh(geo, mat);

            const radius = 6 + 0.9 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            sphere.userData = {
                type,
                speed: 0.003 / (radius - 6 + 1),
                angle: theta,
                phi,
                radius
            };

            sphere.position.x = radius * Math.sin(phi) * Math.cos(theta);
            sphere.position.y = radius * Math.sin(phi) * Math.sin(theta);
            sphere.position.z = radius * Math.cos(phi);

            scene.add(sphere);
            debris.push(sphere);
        }
    }

    function animate() {
        const dt = clock.getDelta();
        acc += dt;

        earth.rotation.y += 0.00055;

        debris.forEach(d => {
            d.userData.angle += d.userData.speed;
            d.position.x = d.userData.radius * Math.sin(d.userData.phi) * Math.cos(d.userData.angle);
            d.position.y = d.userData.radius * Math.sin(d.userData.phi) * Math.sin(d.userData.angle);
            d.position.z = d.userData.radius * Math.cos(d.userData.phi);
        });

        if (isPlaying) {
            while (acc >= YEAR_STEP_S) {
                acc -= YEAR_STEP_S;
                if (currentYear < 2025) {
                    currentYear++;
                    updateYear();
                } else {
                    isPlaying = false;
                    document.getElementById('sam2-play').textContent = 'Done';
                    break;
                }
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function updateYear() {
        document.getElementById('sam2-year').textContent = currentYear;

        const yearRows = spaceData.filter(d => d.year === currentYear);
        yearRows.forEach(d => {
            if (d.failed) {
                addDebris('failed', 3);
                failedMissions++;
                wastedMoney += d.cost;
                totalDebris += 3;
            } else {
                if (Math.random() < 0.5) {
                    addDebris('operational', 1);
                    totalDebris += 1;
                }
            }
        });

        const t = (currentYear - 2000) / 25;
        if (Math.random() < (0.18 * t)) {
            const n = Math.floor(8 + Math.random() * 11);
            addDebris('collision', n);
            totalDebris += n;
        }

        document.getElementById('sam2-debris').textContent = totalDebris.toLocaleString();
        document.getElementById('sam2-failed').textContent = failedMissions;
        document.getElementById('sam2-waste').textContent = '$' + wastedMoney.toFixed(1) + 'B';

        const risk = totalDebris < 300 ? 'LOW' : (totalDebris < 1100 ? 'MEDIUM' : 'HIGH');
        document.getElementById('sam2-risk').textContent = risk;
        document.getElementById('sam2-risk').style.color = risk === 'HIGH' ? '#ff6b8a' : (risk === 'MEDIUM' ? '#fbbf24' : '#10b981');
    }

    function setupControls() {
        const playBtn = document.getElementById('sam2-play');
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? 'Pause' : 'Play';
        });

        document.getElementById('sam2-reset').addEventListener('click', () => {
            isPlaying = false;
            playBtn.textContent = 'Play';
            acc = 0;
            currentYear = 2000;
            totalDebris = 0;
            failedMissions = 0;
            wastedMoney = 0;

            debris.forEach(d => scene.remove(d));
            debris = [];

            document.getElementById('sam2-year').textContent = '2000';
            document.getElementById('sam2-debris').textContent = '0';
            document.getElementById('sam2-failed').textContent = '0';
            document.getElementById('sam2-waste').textContent = '$0B';
            document.getElementById('sam2-risk').textContent = 'LOW';
            document.getElementById('sam2-risk').style.color = '#10b981';
        });
    }
}