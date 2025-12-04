// ==================== CONFIGURATION ====================

const CONFIG = {
    USE_REAL_SHUTTLE: true, // Set to true to use shuttle.png instead of SVG
    NUM_STARS: 250,
    DEBRIS_INTERVAL: 60, // milliseconds between debris particles
};

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Space Exploration Website Loading...");

    initStars();
    initExhaust();
    initEarthImage();
    initRocketImage();
    initScrollAnimation();

    // Uncomment when you add your D3 visualizations:
    // initGlobeVisualization();
    // initSuccessVisualization();
    // initTimelineVisualization();

    console.log("✅ Website Ready!");
});

// ==================== EARTH IMAGE INITIALIZATION ====================

function initEarthImage() {
    const earthImg = document.getElementById("earth-img");

    if (!earthImg) {
        console.warn("Earth image element not found");
        return;
    }

    earthImg.onload = () => {
        console.log("✅ Earth image loaded successfully");
        earthImg.style.display = "block";
    };

    earthImg.onerror = () => {
        console.error("❌ Earth image failed to load. Check if 'earth6.png' is in the correct folder.");
        earthImg.style.display = "none";
    };

    // Force reload if already cached
    if (earthImg.complete && earthImg.naturalHeight > 0) {
        console.log("✅ Earth image already loaded");
        earthImg.style.display = "block";
    }
}

// ==================== ROCKET IMAGE TOGGLE ====================

function initRocketImage() {
    const rocketImg = document.getElementById("rocket-img");
    const rocketSvg = document.getElementById("rocket-svg");

    if (!rocketImg || !rocketSvg) {
        console.warn("Rocket elements not found");
        return;
    }

    if (CONFIG.USE_REAL_SHUTTLE) {
        // Try to load the real shuttle image
        rocketImg.onload = () => {
            console.log("✅ Shuttle image loaded successfully");
            rocketImg.style.display = "block";
            rocketSvg.style.display = "none";
        };

        rocketImg.onerror = () => {
            console.warn("⚠️ Shuttle image failed to load, using SVG fallback");
            rocketImg.style.display = "none";
            rocketSvg.style.display = "block";
        };

        // Trigger load
        if (rocketImg.complete) {
            rocketImg.onload();
        }
    } else {
        // Use SVG by default
        rocketImg.style.display = "none";
        rocketSvg.style.display = "block";
    }
}

// ==================== STAR FIELD ====================

function initStars() {
    const starsContainer = document.getElementById("stars");
    if (!starsContainer) {
        console.warn("Stars container not found");
        return;
    }

    // Clear existing stars to avoid duplicates
    starsContainer.innerHTML = "";

    for (let i = 0; i < CONFIG.NUM_STARS; i++) {
        const star = document.createElement("div");
        star.className = "star";

        const size = Math.random() * 3 + 0.5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const opacity = Math.random() * 0.8 + 0.2;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 3;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.opacity = `${opacity}`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        // Bigger stars get extra glow
        if (size > 2) {
            star.style.boxShadow = `0 0 ${size * 3}px rgba(255, 255, 255, 0.6)`;
        }

        starsContainer.appendChild(star);
    }

    console.log(`✨ Created ${CONFIG.NUM_STARS} stars`);
}

// ==================== EXHAUST FLAMES ====================

function initExhaust() {
    const exhaustContainer = document.getElementById("exhaust-container");
    if (!exhaustContainer) {
        console.warn("Exhaust container not found");
        return;
    }

    // Clear existing flames
    exhaustContainer.innerHTML = "";

    const flameGlow = document.createElement("div");
    flameGlow.className = "flame-glow";

    const flameOuter = document.createElement("div");
    flameOuter.className = "flame-outer";

    const flameCore = document.createElement("div");
    flameCore.className = "flame-core";

    const exhaustFlame = document.createElement("div");
    exhaustFlame.className = "exhaust-flame";

    exhaustFlame.appendChild(flameGlow);
    exhaustFlame.appendChild(flameOuter);
    exhaustFlame.appendChild(flameCore);

    exhaustContainer.appendChild(exhaustFlame);
}

// ==================== SCROLL ANIMATION ====================

let debrisInterval = null;
let isLaunching = false;

function ensureDebrisContainer() {
    let debrisContainer = document.getElementById("debris-container");
    if (debrisContainer) return debrisContainer;

    // Create if missing
    debrisContainer = document.createElement("div");
    debrisContainer.id = "debris-container";
    debrisContainer.style.position = "absolute";
    debrisContainer.style.inset = "0";
    debrisContainer.style.pointerEvents = "none";
    debrisContainer.style.overflow = "hidden";
    debrisContainer.style.zIndex = "3";

    const landing = document.getElementById("landing");
    if (landing) {
        landing.appendChild(debrisContainer);
    }

    return debrisContainer;
}

function initScrollAnimation() {
    const app = document.getElementById("app");
    const rocket = document.getElementById("rocket");
    const earthContainer = document.getElementById("earth-container");
    const titleOverlay = document.getElementById("title-overlay");
    const exhaustContainer = document.getElementById("exhaust-container");
    const landingSection = document.getElementById("landing");

    if (!app || !rocket || !earthContainer || !titleOverlay || !exhaustContainer || !landingSection) {
        console.error("❌ Missing required elements for scroll animation");
        return;
    }

    const debrisContainer = ensureDebrisContainer();

    const update = () => {
        const scrollTop = app.scrollTop;
        const landingHeight = landingSection.offsetHeight || 1;
        const scrollProgress = Math.min(scrollTop / landingHeight, 1);

        // Rocket animation - starts at 50% (just above earth curve)
        const baseBottom = 42;
        const rocketBottom = baseBottom + (scrollProgress * 180);
        const rocketScale = 1.85 + (scrollProgress * 0.9);
        const rocketTilt = scrollProgress * -10;
        const rocketShake = isLaunching && scrollProgress > 0.05
            ? Math.sin(Date.now() * 0.05) * 0.5
            : 0;

        rocket.style.bottom = `${rocketBottom}%`;
        rocket.style.transform = `translateX(-50%) scale(${rocketScale}) rotate(${rocketTilt + rocketShake}deg)`;

        // Earth animation - shrinks and moves down
        const earthScale = 1 - (scrollProgress * 0.5);
        const earthY = scrollProgress * 50;
        earthContainer.style.transform = `translateX(-50%) translateY(${earthY}px) scale(${earthScale})`;

        // Title fade out
        const titleOpacity = Math.max(1 - (scrollProgress * 3), 0);
        titleOverlay.style.opacity = `${titleOpacity}`;

        // Exhaust and debris
        if (scrollProgress > 0.05) {
            const exhaustOpacity = Math.min((scrollProgress - 0.05) * 3, 1);
            exhaustContainer.style.opacity = `${exhaustOpacity}`;

            if (!isLaunching) {
                isLaunching = true;
                startDebrisGeneration(rocket, debrisContainer, scrollProgress);
            }
        } else {
            exhaustContainer.style.opacity = "0";
            isLaunching = false;
            stopDebrisGeneration();
        }

        // Stop debris when rocket is far away
        if (scrollProgress > 0.9) {
            stopDebrisGeneration();
        }
    };

    // Throttle scroll updates using requestAnimationFrame
    let rafId = null;
    const onScroll = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            update();
        });
    };

    app.addEventListener("scroll", onScroll);
    update(); // Initial update

    console.log("🎬 Scroll animation initialized");
}

function startDebrisGeneration(rocket, container, scrollProgress) {
    if (debrisInterval) return;

    debrisInterval = setInterval(() => {
        const app = document.getElementById("app");
        const landingSection = document.getElementById("landing");

        if (!app || !landingSection) return;

        const scrollTop = app.scrollTop;
        const landingHeight = landingSection.offsetHeight || 1;
        const currentProgress = Math.min(scrollTop / landingHeight, 1);

        if (currentProgress > 0.05 && currentProgress < 0.9) {
            createDebris(rocket, container);
        }
    }, CONFIG.DEBRIS_INTERVAL);
}

function stopDebrisGeneration() {
    if (debrisInterval) {
        clearInterval(debrisInterval);
        debrisInterval = null;
    }
}

// ==================== DEBRIS GENERATION ====================

function createDebris(rocketElement, container) {
    if (!rocketElement || !container) return;

    const debris = document.createElement("div");
    debris.className = "debris";

    // Random size (smaller particles)
    const size = Math.random() * 5 + 2;
    debris.style.width = `${size}px`;
    debris.style.height = `${size}px`;

    // Random color from flame palette
    const colors = [
        "rgba(255, 255, 255, 0.9)",
        "rgba(254, 240, 138, 0.85)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(251, 146, 60, 0.75)",
        "rgba(239, 68, 68, 0.7)",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    debris.style.background = color;

    // Position relative to rocket
    const rocketRect = rocketElement.getBoundingClientRect();
    const startX = rocketRect.left + rocketRect.width / 2;
    const startY = rocketRect.bottom - 10;

    const containerRect = container.getBoundingClientRect();
    const relativeX = ((startX - containerRect.left) / containerRect.width) * 100;
    const relativeY = ((startY - containerRect.top) / containerRect.height) * 100;

    debris.style.left = `${relativeX}%`;
    debris.style.top = `${relativeY}%`;

    // Random trajectory - mostly downward and sideways
    const angle = (Math.random() - 0.5) * Math.PI * 0.8; // -72 to 72 degrees
    const velocity = Math.random() * 120 + 60;
    const xOffset = Math.cos(angle) * velocity;
    const yOffset = Math.abs(Math.sin(angle)) * velocity + 80; // Always downward

    debris.style.setProperty("--x", `${xOffset}px`);
    debris.style.setProperty("--y", `${yOffset}px`);

    // Random rotation
    const rotation = Math.random() * 360;
    debris.style.setProperty("--r", `${rotation}deg`);

    // Random animation duration
    const duration = Math.random() * 0.5 + 2;
    debris.style.setProperty("--t", `${duration}s`);

    container.appendChild(debris);

    // Remove after animation completes
    setTimeout(() => {
        if (debris.parentNode === container) {
            debris.remove();
        }
    }, duration * 1000 + 100);
}

// ==================== D3 VISUALIZATION INTEGRATION ====================

function initGlobeVisualization() {
    const container = document.getElementById("d3-viz-1");
    if (!container) {
        console.warn("Globe visualization container not found");
        return;
    }

    // Your D3 globe code here
    console.log("🌍 Globe visualization ready");

    // Example: Clear placeholder
    // container.innerHTML = "";
    // ... your D3 code
}

function initSuccessVisualization() {
    const container = document.getElementById("d3-viz-2");
    if (!container) {
        console.warn("Success visualization container not found");
        return;
    }

    // Your D3 success rate code here
    console.log("📊 Success visualization ready");
}

function initTimelineVisualization() {
    const container = document.getElementById("d3-viz-3");
    if (!container) {
        console.warn("Timeline visualization container not found");
        return;
    }

    // Your D3 timeline code here
    console.log("📅 Timeline visualization ready");
}

// ==================== DATA LOADING ====================

async function loadData(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`✅ Loaded data from ${filepath}`);
        return data;
    } catch (error) {
        console.error(`❌ Error loading data from ${filepath}:`, error);
        return null;
    }
}

// Helper function for CSV loading (if you need it for D3)
async function loadCSV(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log(`✅ Loaded CSV from ${filepath}`);
        return text;
    } catch (error) {
        console.error(`❌ Error loading CSV from ${filepath}:`, error);
        return null;
    }
}