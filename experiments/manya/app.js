// ==================== CONFIGURATION ====================

const CONFIG = {
    USE_REAL_SHUTTLE: true,
    NUM_STARS: 250,
    DEBRIS_INTERVAL: 60,
};

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Space Exploration Website Loading...");

    initStars();
    initExhaust();
    initEarthImage();
    initRocketImage();
    initScrollAnimation();

    // Initialize all visualizations with Intersection Observer
    initVisualizationsOnScroll();

    console.log("✅ Website Ready!");
});

// ==================== INTERSECTION OBSERVER FOR VIZ ====================

function initVisualizationsOnScroll() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const vizId = entry.target.id;
                console.log(`Initializing ${vizId}`);

                // Initialize visualization based on ID
                switch (vizId) {
                    case 'viz-section-1':
                        if (typeof initManya1 !== 'undefined') initManya1();
                        break;
                    case 'viz-section-2':
                        if (typeof initManya2 !== 'undefined') initManya2();
                        break;
                    case 'viz-section-3':
                        if (typeof initVivek1 !== 'undefined') initVivek1();
                        break;
                    case 'viz-section-4':
                        if (typeof initVivek2 !== 'undefined') initVivek2();
                        break;
                    case 'viz-section-5':
                        if (typeof initSehas1 !== 'undefined') initSehas1();
                        break;
                    case 'viz-section-6':
                        if (typeof initSehas2 !== 'undefined') initSehas2();
                        break;
                    case 'viz-section-7':
                        if (typeof initSamyogita1 !== 'undefined') initSamyogita1();
                        break;
                    case 'viz-section-8':
                        if (typeof initSamyogita2 !== 'undefined') initSamyogita2();
                        break;
                    case 'viz-section-9':
                        if (typeof initRazan1 !== 'undefined') initRazan1();
                        break;
                    case 'viz-section-10':
                        if (typeof initAryan1 !== 'undefined') initAryan1();
                        break;
                }

                // Stop observing after initialization
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe all viz sections
    for (let i = 1; i <= 10; i++) {
        const section = document.getElementById(`viz-section-${i}`);
        if (section) {
            observer.observe(section);
        }
    }
}

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
        console.error("❌ Earth image failed to load");
        earthImg.style.display = "none";
    };

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

        if (rocketImg.complete) {
            rocketImg.onload();
        }
    } else {
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

        const baseBottom = 42;
        const rocketBottom = baseBottom + (scrollProgress * 180);
        const rocketScale = 1.85 + (scrollProgress * 0.9);
        const rocketTilt = scrollProgress * -10;
        const rocketShake = isLaunching && scrollProgress > 0.05
            ? Math.sin(Date.now() * 0.05) * 0.5
            : 0;

        rocket.style.bottom = `${rocketBottom}%`;
        rocket.style.transform = `translateX(-50%) scale(${rocketScale}) rotate(${rocketTilt + rocketShake}deg)`;

        const earthScale = 1 - (scrollProgress * 0.5);
        const earthY = scrollProgress * 50;
        earthContainer.style.transform = `translateX(-50%) translateY(${earthY}px) scale(${earthScale})`;

        const titleOpacity = Math.max(1 - (scrollProgress * 3), 0);
        titleOverlay.style.opacity = `${titleOpacity}`;

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

        if (scrollProgress > 0.9) {
            stopDebrisGeneration();
        }
    };

    let rafId = null;
    const onScroll = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            update();
        });
    };

    app.addEventListener("scroll", onScroll);
    update();

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

    const size = Math.random() * 5 + 2;
    debris.style.width = `${size}px`;
    debris.style.height = `${size}px`;

    const colors = [
        "rgba(255, 255, 255, 0.9)",
        "rgba(254, 240, 138, 0.85)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(251, 146, 60, 0.75)",
        "rgba(239, 68, 68, 0.7)",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    debris.style.background = color;

    const rocketRect = rocketElement.getBoundingClientRect();
    const startX = rocketRect.left + rocketRect.width / 2;
    const startY = rocketRect.bottom - 10;

    const containerRect = container.getBoundingClientRect();
    const relativeX = ((startX - containerRect.left) / containerRect.width) * 100;
    const relativeY = ((startY - containerRect.top) / containerRect.height) * 100;

    debris.style.left = `${relativeX}%`;
    debris.style.top = `${relativeY}%`;

    const angle = (Math.random() - 0.5) * Math.PI * 0.8;
    const velocity = Math.random() * 120 + 60;
    const xOffset = Math.cos(angle) * velocity;
    const yOffset = Math.abs(Math.sin(angle)) * velocity + 80;

    debris.style.setProperty("--x", `${xOffset}px`);
    debris.style.setProperty("--y", `${yOffset}px`);

    const rotation = Math.random() * 360;
    debris.style.setProperty("--r", `${rotation}deg`);

    const duration = Math.random() * 0.5 + 2;
    debris.style.setProperty("--t", `${duration}s`);

    container.appendChild(debris);

    setTimeout(() => {
        if (debris.parentNode === container) {
            debris.remove();
        }
    }, duration * 1000 + 100);
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