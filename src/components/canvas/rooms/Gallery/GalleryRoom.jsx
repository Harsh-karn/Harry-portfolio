/* eslint-disable react-hooks/immutability */
import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Float, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Observer } from 'gsap/all';
import { useScene } from '../../../../context/SceneContext';

gsap.registerPlugin(Observer);
import { useAchievements } from '../../../../context/AchievementsContext';
import PaperMaterial from './PaperMaterial';
import GalleryClouds from './GalleryClouds';
import GalleryBackgroundLife from './GalleryBackgroundLife';
import { useAudio } from '../../../../context/AudioManager';
import { usePaintMaterial } from './usePaintMaterial';
import { PROJECTS_DATA } from '../../../../data/projectsData';

// Reusable Vector3 to avoid allocations in useFrame
const _tempScale = new THREE.Vector3();

// ============================================
// ⚙️ AUDIO SETTINGS - TWEAK HERE
// Edit these values to adjust volume and hearing distance of city ambiance
// ============================================
const AUDIO_SETTINGS = {
    volume: 0.6,
    distance: 2,
    rolloff: 1.5
};

const GALLERY_INTERACTION_AUDIO_SETTINGS = {
    volume: 0.6,      // Volume for the paper clicking sound
    distance: 2,      // Reference distance for spatial audio before it starts dropping off
    rolloff: 2        // How fast the sound fades away (exponential)
};

const PROJECT_COUNT = PROJECTS_DATA.length; // 10 real engineering projects
const GAP = 2.5;

// Change these values to match bird proportions (legacy ratio 1.41)
const BIRD_WIDTH = 0.49;
const BIRD_HEIGHT = 0.35;

// Adjust this value (0.0 to 1.0) to crop the right side of the "Houses" graphic.
// 0.0 = No crop
// 0.2 = 20% crop from the right (corridor side)
const RIGHT_CROP_AMOUNT = 0.2;

// Helper to format tech labels compactly inside small boxes
const formatBoxTech = (str) => {
    if (!str) return '';
    let s = str.trim();
    s = s.replace(' (Postgres + pgmq)', '');
    s = s.replace(' (WAL)', '');
    s = s.replace(' (64 tests)', '');
    s = s.replace(' API v2', ' API');
    s = s.replace(' CSS', '');
    s = s.replace(' middleware', '');
    s = s.replace(' suites', '');
    s = s.replace(' Edge Function', ' Edge');
    s = s.replace('ThreadPoolExecutor', 'Thread\nPool');
    return s;
};

// 4 Architectural Pillar positions matching the 4 hand-sketched boxes on tylkartki.webp
const TECH_PILLAR_CENTERS = [-0.45, -0.15, 0.15, 0.45];

// Distribute project technologies cleanly into the 4 hand-drawn sketch compartments
const getProjectTechPillars = (project) => {
    if (project.techPillars && Array.isArray(project.techPillars) && project.techPillars.length === 4) {
        return project.techPillars;
    }
    const stack = project.techStack || [];
    if (stack.length === 0) return ['', '', '', ''];
    if (stack.length <= 4) {
        return [stack[0] || '', stack[1] || '', stack[2] || '', stack[3] || ''];
    }
    const cols = [[], [], [], []];
    stack.forEach((item, idx) => {
        cols[idx % 4].push(formatBoxTech(item));
    });
    return cols.map(c => c.join('\n'));
};

/**
 * 3D Hand-Drawn Room Title Banner: MY BUILDS
 */
const BuildsRoomBanner = ({ isCardSelected, emblemTexture, onBeforeCompile }) => {
    const bannerGroupRef = useRef();

    useFrame((_, delta) => {
        if (!bannerGroupRef.current) return;
        
        // Hide immediately when inspecting a card so it NEVER overlaps
        bannerGroupRef.current.visible = !isCardSelected;
        if (isCardSelected) return;

        const targetOpacity = 0.94;
        const targetY = 4.45;

        bannerGroupRef.current.position.y = THREE.MathUtils.damp(
            bannerGroupRef.current.position.y,
            targetY,
            7,
            delta
        );

        bannerGroupRef.current.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.damp(
                    child.material.opacity,
                    targetOpacity,
                    8,
                    delta
                );
            }
            if (typeof child.fillOpacity === 'number') {
                child.fillOpacity = THREE.MathUtils.damp(
                    child.fillOpacity,
                    targetOpacity,
                    8,
                    delta
                );
            }
        });
    });

    return (
        <group ref={bannerGroupRef} position={[0, 4.45, -5.8]}>
            {/* Banner Parchment Board - Width 3.2, Height 0.54 */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[3.2, 0.54]} />
                <meshBasicMaterial
                    color="#fcf7ea"
                    transparent
                    opacity={0.94}
                    side={THREE.DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* Sketched Outer Border */}
            <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(3.2, 0.54)]} />
                <lineBasicMaterial color="#241e17" transparent opacity={0.9} linewidth={2} />
            </lineSegments>

            {/* Emblem Icon (Builds Blueprint Gear) */}
            {emblemTexture && (
                <mesh position={[-1.25, 0.01, 0.02]}>
                    <planeGeometry args={[0.42, 0.42]} />
                    <meshBasicMaterial
                        map={emblemTexture}
                        transparent
                        opacity={0.94}
                        alphaTest={0.08}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Room Title */}
            <Text
                position={[0.14, 0.09, 0.02]}
                fontSize={0.24}
                font="/fonts/RubikScribble-Regular.ttf"
                color="#241e17"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.05}
                fillOpacity={0.94}
            >
                MY BUILDS
            </Text>

            {/* Room Subtitle */}
            <Text
                position={[0.14, -0.11, 0.02]}
                fontSize={0.084}
                font="/fonts/CabinSketch-Bold.ttf"
                color="#5a493a"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.02}
                fillOpacity={0.94}
            >
                Things I've imagined, engineered, and brought to life.
            </Text>

            {/* Small decorative stars */}
            <SmallStar position={[-1.46, 0.18, 0.03]} scale={0.04} />
            <SmallStar position={[1.46, 0.18, 0.03]} scale={0.04} />
            <SmallStar position={[1.36, -0.16, 0.03]} scale={0.032} />
        </group>
    );
};

/**
 * Ambient Magical Floating Candles in Archive Room
 */
const AmbientCandles = ({ candleTexture }) => {
    return (
        <group>
            <SingleFloatingCandle position={[-5.6, 2.5, -4.2]} scale={0.42} speed={0.8} candleTexture={candleTexture} />
            <SingleFloatingCandle position={[5.6, 2.3, -4.5]} scale={0.4} speed={0.9} offset={2.1} candleTexture={candleTexture} />
            <SingleFloatingCandle position={[-7.4, 1.4, -3.8]} scale={0.36} speed={0.7} offset={4.3} candleTexture={candleTexture} />
            <SingleFloatingCandle position={[7.2, 1.6, -4.0]} scale={0.38} speed={0.85} offset={1.5} candleTexture={candleTexture} />
        </group>
    );
};

const SingleFloatingCandle = ({ position, scale = 0.4, speed = 0.8, offset = 0, candleTexture }) => {
    const candleRef = useRef();

    useFrame((state) => {
        if (!candleRef.current) return;
        const t = state.clock.getElapsedTime();
        candleRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.06;
        candleRef.current.rotation.z = Math.sin(t * 0.5 + offset) * 0.03;
    });

    return (
        <group ref={candleRef} position={position} scale={[scale, scale, 1]}>
            <mesh>
                <planeGeometry args={[1, 1.6]} />
                <meshBasicMaterial
                    map={candleTexture}
                    transparent
                    alphaTest={0.05}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Soft warm aura */}
            <mesh position={[0, 0.4, -0.01]}>
                <circleGeometry args={[0.35, 16]} />
                <meshBasicMaterial
                    color="#fde047"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

// Pre-computed deterministic particle coordinates
const DUST_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    x: (((i * 17.3) % 22) - 11),
    y: ((i * 7.1) % 3.5) + 0.2,
    z: -((i * 3.7) % 6) - 2,
    speedY: 0.08 + ((i * 1.3) % 0.1),
    swaySpeed: 0.5 + ((i * 2.1) % 0.6),
    phase: (i * 0.7) % (Math.PI * 2),
    size: 0.025 + ((i * 0.015) % 0.02)
}));

/**
 * Drifting Magical Paper Dust / Sparkle Particles
 */
const MagicalDust = () => {
    const pointsRef = useRef();

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.getElapsedTime();
        pointsRef.current.children.forEach((child, i) => {
            const p = DUST_PARTICLES[i];
            if (p) {
                child.position.y = p.y + Math.sin(time * p.speedY + p.phase) * 0.25;
                child.position.x = p.x + Math.sin(time * p.swaySpeed + p.phase) * 0.15;
            }
        });
    });

    return (
        <group ref={pointsRef}>
            {DUST_PARTICLES.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <planeGeometry args={[p.size, p.size]} />
                    <meshBasicMaterial
                        color={i % 3 === 0 ? "#b87e28" : "#241e17"}
                        transparent
                        opacity={i % 3 === 0 ? 0.75 : 0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
};

const SmallStar = ({ position, scale = 0.08, color = "#241e17" }) => {
    return (
        <group position={position} scale={scale}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
                    <planeGeometry args={[1, 0.16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

const GalleryRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { openOverlay, isTeleporting } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;

    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current && audioRef.current.setVolume) {
            audioRef.current.setVolume(effectiveVolume);
        }
    }, [effectiveVolume]);

    const groupRef = useRef();
    const targetScroll = useRef(0);
    const currentScroll = useRef(0);
    const [selectedCard, setSelectedCard] = useState(null);
    const [globalIsAnimating, setGlobalIsAnimating] = useState(false);
    const cardRefs = useRef([]);

    // Broadcast card selection changes so HUD/overlays can adapt
    useEffect(() => {
        const activeProj = selectedCard !== null ? PROJECTS_DATA[selectedCard] : null;
        window.dispatchEvent(
            new CustomEvent('gallery-card-selection-changed', {
                detail: {
                    isSelected: selectedCard !== null,
                    selectedIndex: selectedCard,
                    project: activeProj
                }
            })
        );
    }, [selectedCard]);

    useEffect(() => {
        if (isExiting || isTeleporting) {
            hidePopup();
        }
    }, [isExiting, isTeleporting, hidePopup]);

    // Setup Paint Transition
    const { onBeforeCompile, animatePaint, resetPaint, uniformsData, updateRoomOrigin } = usePaintMaterial();
    
    // Track transition state to disable interactions
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Track if user teleported into this room 
    const wasTeleportedRef = useRef(false);
    useEffect(() => {
        if (isTeleporting) wasTeleportedRef.current = true;
    }, [isTeleporting]);

    useEffect(() => {
        // When the room officially shows up (doors open and user flies in)
        if (showRoom && !isWarmup) {
            if (wasTeleportedRef.current || isTeleporting) {
                // Skip the painting transition entirely if teleporting via map
                uniformsData.uPaintProgress.value = 1.0;
                setIsTransitioning(false);
            } else {
                setIsTransitioning(true);
                // resetPaint() in case we re-enter
                resetPaint();
                // Start the paint animation with a slight delay so it happens *during* fly-in
                animatePaint(0.2, 2.5);
                
                // Re-enable interactions once painting finishes
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 2700); // 0.2 + 2.5
            }
        } else {
            // Immediately reveal for warmup or hide if not showing
            uniformsData.uPaintProgress.value = 1.0;
        }
    }, [showRoom, isWarmup, isTeleporting]);

    const handleCardClick = async (clickedIndex) => {
        if (globalIsAnimating || isTransitioning) return;

        // Unlock inspect achievement
        unlockAchievement('gallery_inspect');

        if (selectedCard === clickedIndex) {
            setGlobalIsAnimating(true);
            await cardRefs.current[clickedIndex].closeCard();
            setSelectedCard(null);
            setGlobalIsAnimating(false);
        } else if (selectedCard !== null) {
            setGlobalIsAnimating(true);
            await cardRefs.current[selectedCard].closeCard();
            setSelectedCard(null);
            await cardRefs.current[clickedIndex].openCard();
            setSelectedCard(clickedIndex);
            setGlobalIsAnimating(false);
        } else {
            setGlobalIsAnimating(true);
            await cardRefs.current[clickedIndex].openCard();
            setSelectedCard(clickedIndex);
            setGlobalIsAnimating(false);
        }
    };

    // Close open card on Escape key
    useEffect(() => {
        if (selectedCard === null) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !globalIsAnimating) {
                handleCardClick(selectedCard);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCard, globalIsAnimating]);

    // Track if we've signaled ready
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 5;

    useFrame(() => {
        // Update room origin each frame so the paint shader knows where.
        // This is cheap (one getWorldPosition) and critical for far chunks.
        updateRoomOrigin(groupRef);

        if (hasSignaledReady.current) return;
        frameCount.current++;
        if (frameCount.current >= FRAMES_TO_WAIT) {
            hasSignaledReady.current = true;
            onReady?.();

            // Wait for the DoorSection 1.5s camera fly-in to finish before showing tutorial
            setTimeout(() => {
                if (!isWarmup) showTutorial('gallery_inspect');
            }, 2000);
        }
    });

    // Config
    const BALCONY_WIDTH = 5;
    const BALCONY_DEPTH = 3;
    const RAILING_HEIGHT = 1.25; // Legacy ratio 20/(7 segments * 2.287)

    // --- TEXTURES AND RESPONSIVENESS ---
    // User requested: painted on desktop, regular on touch/phones (even if laptop has touch screen)
    // We use matchMedia('(hover: hover)') to detect devices with a cursor/hover capability
    const [canHover, setCanHover] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : true);

    useEffect(() => {
        const mq = window.matchMedia('(hover: hover)');
        const handleHoverChange = (e) => setCanHover(e.matches);
        mq.addEventListener('change', handleHoverChange);
        return () => mq.removeEventListener('change', handleHoverChange);
    }, []);

    // Load all project front textures in a flat array
    const textureUrls = useMemo(() => PROJECTS_DATA.map(p => p.textureFront), []);
    const projectTextures = useTexture(textureUrls);

    // Load painted textures only on desktop, fallback to front if mobile/touch
    const paintedUrls = useMemo(() => PROJECTS_DATA.map(p => (canHover && p.texturePainted) ? p.texturePainted : p.textureFront), [canHover]);
    const paintedTextures = useTexture(paintedUrls);

    // Load the universal back texture and the button texture conditionally
    const backTextureRaw = useTexture(canHover ? '/textures/gallery/tylkartki_painted.webp' : '/textures/gallery/tylkartki.webp');
    const overlayTextureRaw = useTexture(canHover ? '/textures/gallery/przyciskdotylukartki_painted.webp' : '/textures/gallery/przyciskdotylukartki.webp');

    // Ambient textures for magical touches
    const buildsEmblemTex = useTexture('/textures/corridor/magical/emblem_builds.webp');
    const candleTexture = useTexture('/textures/corridor/magical/candle_sketch.webp');

    // Construct the full list of projects with textures attached
    const projects = useMemo(() => {
        return PROJECTS_DATA.map((projectData, i) => {
            const frontTex = projectTextures[i];
            const paintedTex = paintedTextures[i];

            if (frontTex) {
                frontTex.colorSpace = THREE.SRGBColorSpace;
            }
            if (paintedTex) {
                paintedTex.colorSpace = THREE.SRGBColorSpace;
            }
            if (backTextureRaw) {
                backTextureRaw.colorSpace = THREE.SRGBColorSpace;
            }
            if (overlayTextureRaw) {
                overlayTextureRaw.colorSpace = THREE.SRGBColorSpace;
            }

            return {
                ...projectData,
                index: i,
                frontTexture: frontTex,
                paintedTexture: (paintedTex !== frontTex && canHover) ? paintedTex : null,
                backTexture: backTextureRaw,
                buttonTexture: overlayTextureRaw
            };
        });
    }, [projectTextures, paintedTextures, backTextureRaw, overlayTextureRaw, canHover]);

    // Active Category Filter State & Event Subscriptions
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const handleCategoryFilter = (e) => {
            const catId = e.detail?.categoryId || 'all';
            setActiveCategory(catId);
            if (catId !== 'all') {
                const firstIdx = projects.findIndex(p => p.categories && p.categories.includes(catId));
                if (firstIdx !== -1) {
                    scrollToIndex(firstIdx);
                }
            }
        };

        const handleProjectJump = (e) => {
            const idx = e.detail?.index;
            if (typeof idx === 'number' && idx >= 0 && idx < projects.length) {
                scrollToIndex(idx, () => {
                    handleCardClick(idx);
                });
            }
        };

        window.addEventListener('gallery-category-filter', handleCategoryFilter);
        window.addEventListener('gallery-project-jump', handleProjectJump);
        return () => {
            window.removeEventListener('gallery-category-filter', handleCategoryFilter);
            window.removeEventListener('gallery-project-jump', handleProjectJump);
        };
    }, [projects]);

    // Function to scroll to a specific project index
    const scrollToIndex = (index, onComplete) => {
        const totalWidth = PROJECT_COUNT * GAP;
        const targetScrollValue = index * GAP;
        const currentScrollValue = currentScroll.current;

        let diff = targetScrollValue - currentScrollValue;
        const halfWidth = totalWidth / 2;
        while (diff > halfWidth) diff -= totalWidth;
        while (diff < -halfWidth) diff += totalWidth;

        const finalTarget = currentScrollValue + diff;

        gsap.to(targetScroll, {
            current: finalTarget,
            duration: 0.5,
            ease: 'power2.inOut'
        });

        gsap.to(currentScroll, {
            current: finalTarget,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: onComplete
        });
    };

    // --- INTERACTION ---
    const lastTouchX = useRef(0);
    useEffect(() => {
        // Observers enable us to normalize wheel, touch, and pointer events
        const scrollObserver = Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            wheelSpeed: -1,
            onWheel: (e) => {
                if (!showRoom || selectedCard !== null || globalIsAnimating || isTransitioning) return;
                const orig = e.event;
                orig.preventDefault();
                targetScroll.current += orig.deltaY * 0.005;
            },
            onPress: (e) => {
                if (!showRoom || selectedCard !== null || globalIsAnimating || isTransitioning) return;
                const orig = e.event;
                if (orig.touches && orig.touches.length === 1) {
                    lastTouchX.current = orig.touches[0].clientX;
                }
            },
            onDrag: (e) => {
                if (!showRoom || selectedCard !== null || globalIsAnimating || isTransitioning) return;
                const orig = e.event;
                if (orig.touches && orig.touches.length === 1) {
                    const deltaX = lastTouchX.current - orig.touches[0].clientX;
                    lastTouchX.current = orig.touches[0].clientX;
                    targetScroll.current += deltaX * 0.008;
                }
            }
        });

        return () => scrollObserver.kill();
    }, [showRoom, selectedCard, globalIsAnimating]);

    useFrame((state, delta) => {
        currentScroll.current = THREE.MathUtils.lerp(currentScroll.current, targetScroll.current, delta * 5);
    });

    // --- GEOMETRY & MATERIALS ---
    const floorTexture = useTexture('/textures/gallery/floor.webp');
    const railingTexture = useTexture('/textures/gallery/railing.webp');
    const housesTexture = useTexture('/textures/gallery/domki.webp');
    const cityTexture = useTexture('/textures/gallery/miastotlo.webp');
    const birdTexture = useTexture('/textures/gallery/bird_gray.webp');
    const clothespinTexture = useTexture('/textures/gallery/klamerka.webp');

    useEffect(() => {
        if (floorTexture) {
            floorTexture.wrapS = THREE.MirroredRepeatWrapping;
            floorTexture.wrapT = THREE.MirroredRepeatWrapping;
            floorTexture.repeat.set(0.5, 0.5 * 1.835); // Adjust repeat to keep scale with legacy 1.835 ratio
            floorTexture.needsUpdate = true;
        }
        if (railingTexture) {
            railingTexture.wrapS = railingTexture.wrapT = THREE.RepeatWrapping;
            railingTexture.repeat.set(7, 1);
            railingTexture.needsUpdate = true;
        }
    }, [floorTexture, railingTexture]);

    const materials = useMemo(() => {
        const floorMat = new THREE.MeshBasicMaterial({
            map: floorTexture,
            color: '#e0e0e0',
            side: THREE.DoubleSide
        });
        floorMat.onBeforeCompile = onBeforeCompile;
        floorMat.transparent = true;
        floorMat.needsUpdate = true;
        
        const ropeMat = new THREE.MeshBasicMaterial({ color: '#666666' });
        ropeMat.onBeforeCompile = onBeforeCompile;
        ropeMat.transparent = true;
        ropeMat.needsUpdate = true;

        const thresholdMat = new THREE.MeshBasicMaterial({
            color: '#e0e0e0',
            map: (() => {
                const t = new THREE.TextureLoader().load('/textures/corridor/texturadoprogow.webp');
                t.colorSpace = THREE.SRGBColorSpace;
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
                t.repeat.set(15 / 2.524, 1);
                return t;
            })(),
            side: THREE.DoubleSide
        });
        thresholdMat.onBeforeCompile = onBeforeCompile;
        thresholdMat.transparent = true;
        thresholdMat.needsUpdate = true;

        return {
            floor: floorMat,
            rope: ropeMat,
            threshold: thresholdMat
        };
    }, [floorTexture, onBeforeCompile]);

    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(-16, 3.5, -6),
            new THREE.Vector3(-8, 2.5, -4.5),
            new THREE.Vector3(0, 1.8, -3),
            new THREE.Vector3(8, 2.5, -4.5),
            new THREE.Vector3(16, 3.5, -6),
        ]);
    }, []);

    const ropeGeometry = useMemo(() => {
        return new THREE.TubeGeometry(curve, 64, 0.015, 8, false);
    }, [curve]);

    const floorShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-1.1, -2.0);
        shape.lineTo(1.1, -2.0);
        shape.lineTo(7.5, 4);
        shape.lineTo(-7.5, 4);
        shape.lineTo(-1.1, -2.0);
        return shape;
    }, []);

    return (
        <group ref={groupRef}>
            {!isWarmup && (
                <PositionalAudio
                    ref={audioRef}
                    url="/sounds/szummiasta.mp3"
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay
                    volume={effectiveVolume}
                />
            )}
            <group position={[0, -0.7, -2]}>
                {/* Floor */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                >
                    <shapeGeometry args={[floorShape]} />
                    <primitive object={materials.floor} />
                </mesh>

                {/* Floor Outline */}
                <line rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <bufferGeometry>
                        <float32BufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([7.5, 4, 0, -7.5, 4, 0])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#999999" onBeforeCompile={onBeforeCompile} transparent={true} needsUpdate={true} />
                </line>

                {/* Railing */}
                <mesh position={[0, RAILING_HEIGHT / 2, -3.9]}>
                    <planeGeometry args={[20, RAILING_HEIGHT]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={railingTexture}
                        transparent={true}
                        side={THREE.DoubleSide}
                        alphaTest={0.1}
                        onBeforeCompile={onBeforeCompile}
                        customProgramCacheKey={() => 'railing-paint'}
                    />
                </mesh>

                {/* === THRESHOLD (At the end of the floor) === */}
                <mesh
                    position={[0, 0.01, -3.9]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[15, 0.15]} />
                    <primitive object={materials.threshold} />
                </mesh>

                {/* === 3D HAND-DRAWN TITLE BANNER === */}
                <BuildsRoomBanner
                    isCardSelected={selectedCard !== null}
                    emblemTexture={buildsEmblemTex}
                    onBeforeCompile={onBeforeCompile}
                />

                {/* === AMBIENT MAGICAL FLOATING CANDLES === */}
                <AmbientCandles candleTexture={candleTexture} />

                {/* === DRITFTING MAGICAL PARTICLES === */}
                <MagicalDust count={28} />

                {/* === CLOTHESLINE SYSTEM === */}
                <group position={[0, 1.6, -4]}>
                    <mesh geometry={ropeGeometry} material={materials.rope} />

                    {/* Proj Cards */}
                    {projects.map((project, i) => (
                        <ProjectCard
                            key={i}
                            index={i}
                            ref={el => cardRefs.current[i] = el}
                            project={project}
                            clothespinTexture={clothespinTexture}
                            total={PROJECT_COUNT}
                            currentScroll={currentScroll}
                            materials={materials}
                            curve={curve}
                            isSelected={selectedCard === i}
                            scrollToIndex={scrollToIndex}
                            onClick={handleCardClick}
                            isMobile={!canHover} // Use hover capability for mobile behavior logic
                            isTransitioning={isTransitioning} // Pass down to lock out individual pointer events just in case
                            paintProgress={uniformsData.uPaintProgress}
                            roomOrigin={uniformsData.uRoomOrigin}
                            activeCategory={activeCategory}
                            openOverlay={openOverlay}
                        />
                    ))}

                    {/* Invisible full-screen backdrop click catcher when a card is open to go back */}
                    {selectedCard !== null && (
                        <mesh
                            position={[0, 0, 0.25]}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!globalIsAnimating && selectedCard !== null) {
                                    handleCardClick(selectedCard);
                                }
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <planeGeometry args={[100, 100]} />
                            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                        </mesh>
                    )}
                </group>

                {/* === SCENERY LAYERS === */}
                {/* Houses - center */}
                <mesh position={[0, -1, -9]} scale={[1, 1, 1]}>
                    <planeGeometry args={[15, 15 / 2.357]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={housesTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>
                {/* Houses - left side (mirrored) */}
                <mesh position={[-15, -1, -9]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[15, 15 / 2.357]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={housesTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>
                {/* Houses - right side (mirrored) - CROPPED */}
                <RightSideHouses
                    texture={housesTexture}
                    baseWidth={15}
                    baseHeight={15 / 2.357}
                    cropAmount={RIGHT_CROP_AMOUNT}
                />

                {/* City skyline - center */}
                <mesh position={[0, 3.4, -17]} scale={[1, 1, 1]}>
                    <planeGeometry args={[30, 30 / 2.357]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>
                {/* City skyline - left (mirrored) */}
                <mesh position={[-30, 3.4, -17]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[30, 30 / 2.357]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>
                {/* City skyline - right (mirrored) */}
                <mesh position={[30, 3.4, -17]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[30, 30 / 2.357]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>

                {/* Flying Bird & Background Micro-animations */}
                <FlyingBird texture={birdTexture} />
                <GalleryBackgroundLife />

                {/* Clouds scattered above */}
                <GalleryClouds count={65} seed={123} />

                {/* Skybox/Environment */}
                <mesh position={[0, 5, -20]}>
                    <sphereGeometry args={[40, 32, 32]} />
                    <meshBasicMaterial color="#f0f0f0" side={THREE.BackSide} transparent opacity={0.5} onBeforeCompile={onBeforeCompile} />
                </mesh>
            </group>
        </group>
    );
};

// Flying bird animation component
const FlyingBird = ({ texture }) => {
    const birdRef = useRef();
    const startX = -25;
    const endX = 25;
    const speed = 2.5; // Reduced flight speed

    // Jump physics variables
    const velocityY = useRef(0);
    const gravity = -12.0; // Reduced gravity for smoother motion
    const jumpStrength = 5.5; // Gentler jump
    const jumpInterval = useRef(0);

    useFrame((state, delta) => {
        if (!birdRef.current) return;

        // Guard against excessively large delta on lag spikes
        const safeDelta = Math.min(delta, 0.05);

        // Horizontal movement
        birdRef.current.position.x += speed * safeDelta;

        if (birdRef.current.position.x > endX) {
            birdRef.current.position.x = startX;
            birdRef.current.position.y = 4.5;
            velocityY.current = 0;
            jumpInterval.current = 0;
            birdRef.current.rotation.z = 0;
        }

        // Falling physics
        velocityY.current += gravity * safeDelta;
        birdRef.current.position.y += velocityY.current * safeDelta;

        // Jumping (smoother and predictable)
        jumpInterval.current -= safeDelta;

        // Jump occurs after scheduled interval before next flap
        if (jumpInterval.current <= 0 || birdRef.current.position.y < 3.2) {
            velocityY.current = jumpStrength;
            // Rarer, rhythmic jumps (e.g. approx every second)
            jumpInterval.current = 0.9 + Math.random() * 0.3;
        }

        // Floor bottom clamp
        if (birdRef.current.position.y < 3.0) {
            birdRef.current.position.y = 3.0;
            velocityY.current = jumpStrength;
        }

        // Ceiling top clamp
        if (birdRef.current.position.y > 6.5) {
            birdRef.current.position.y = 6.5;
            velocityY.current = 0;
        }

        // Bird rotation
        // In Flappy Bird style, the bird pitches beak down when falling and pitches up when flapping
        const targetRotationZ = THREE.MathUtils.clamp(velocityY.current * 0.05, -Math.PI / 6, Math.PI / 8);

        // Smooth rotation lerp
        birdRef.current.rotation.z = THREE.MathUtils.lerp(birdRef.current.rotation.z, targetRotationZ, safeDelta * 8);
    });

    return (
        <mesh ref={birdRef} position={[startX, 4.5, -10]} scale={[BIRD_WIDTH, BIRD_HEIGHT, 1]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial color="#e0e0e0"
                map={texture}
                transparent={true}
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Reliable cross-browser URL opener that prevents popup-blocker issues
const openProjectUrl = (targetProject) => {
    if (!targetProject) return;
    const url = targetProject.liveDemo || targetProject.github;
    if (!url) return;
    try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (link.parentNode) link.parentNode.removeChild(link);
        }, 100);
    } catch {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

// Sub-component for individual project cards
const ProjectCard = memo(forwardRef(({
    index,
    project,
    clothespinTexture,
    currentScroll,
    curve,
    isSelected,
    scrollToIndex,
    onClick,
    isMobile,
    isTransitioning,
    paintProgress,
    roomOrigin,
    activeCategory = 'all',
    openOverlay
}, ref) => {
    const cardRef = useRef();
    const paperRef = useRef(); // Ref for the moving part (Paper)
    const materialRef = useRef();
    const textRef = useRef(); // Ref for the text that sticks to the paper
    const buttonGroupRef = useRef(); // Ref for the interactive back button
    const detailsGroupRef = useRef(); // Ref for the project details on the back
    const techStackGroupRef = useRef(); // Ref for the tech stack section on the back
    const detailsTextRef1 = useRef();
    const detailsTextRef2 = useRef();
    const fullTitleTextRef = useRef();
    const techTextRef = useRef();
    const boxTextRefs = useRef([]);
    const openTextRef = useRef();
    const [hovered, setHovered] = useState(false);
    const [btnHovered, setBtnHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);  // True ONLY during flip animation

    // 4 architectural stack pillars matching the hand-drawn sketch compartments
    const techPillars = useMemo(() => {
        return getProjectTechPillars(project);
    }, [project]);

    // Deterministic sway properties based on project index
    const swaySpeed = useRef(0.3 + ((index * 0.07) % 0.2));
    const swayOffset = useRef((index * 37.3) % 100);

    // Audio Ref
    const paperAudioRef = useRef();
    const { globalVolume, isMuted } = useAudio();

    const playPaperSound = () => {
        if (paperAudioRef.current) {
            const vol = isMuted ? 0 : GALLERY_INTERACTION_AUDIO_SETTINGS.volume * globalVolume;
            paperAudioRef.current.setVolume(vol);
            if (paperAudioRef.current.isPlaying) paperAudioRef.current.stop();
            paperAudioRef.current.play();
        }
    };

    useImperativeHandle(ref, () => ({
        closeCard: () => {
            return new Promise((resolve) => {
                setIsAnimating(true);
                playPaperSound();

                if (cardRef.current) {
                    cardRef.current.scale.set(1, 1, 1);
                }

                const timeline = gsap.timeline({
                    onComplete: () => {
                        setIsAnimating(false);
                        if (cardRef.current) cardRef.current.scale.set(1, 1, 1);
                        resolve();

                        // Unpaint the card after it returns to the clothespin
                        if (project.paintedTexture && materialRef.current) {
                            gsap.to(materialRef.current, {
                                uProgress: 0.0,
                                duration: 0.5,
                                ease: 'power2.out',
                                overwrite: 'auto'
                            });
                        }
                    }
                });

                const localBaseY = -1.1;

                timeline.to(paperRef.current.position, {
                    y: localBaseY + 0.6,
                    x: 0,
                    z: 1,
                    duration: 0.35,
                    ease: 'power2.in'
                });

                timeline.to(paperRef.current.rotation, {
                    x: 0.5,
                    z: -0.05,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.in'
                }, '<');

                if (materialRef.current) {
                    timeline.to(materialRef.current, {
                        bend: 0.6,
                        duration: 0.3,
                        ease: 'power2.in'
                    }, '<');
                }

                timeline.to(paperRef.current.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3, ease: 'sine.inOut'
                }, '<');

                timeline.to(paperRef.current.position, {
                    y: localBaseY,
                    x: 0,
                    z: 0,
                    duration: 0.25,
                    ease: 'power3.out'
                });

                timeline.to(paperRef.current.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.25,
                    ease: 'power3.out'
                }, '<');

                if (materialRef.current) {
                    timeline.to(materialRef.current, {
                        bend: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, '<');
                }
            });
        },
        openCard: () => {
            return new Promise((resolve) => {
                scrollToIndex(index, () => {
                    setIsAnimating(true);
                    playPaperSound();

                    if (cardRef.current) {
                        cardRef.current.scale.set(1, 1, 1);
                    }

                    const isMobile = window.innerWidth < 768;
                    const targetX_World = 0;
                    const targetY_World = isMobile ? 0.32 : 0.50;
                    const targetZ_World = isMobile ? 0.5 : 1.35;

                    const parentPos = cardRef.current.position;
                    const targetX = targetX_World - parentPos.x;
                    const targetY = targetY_World - parentPos.y;
                    const targetZ = targetZ_World - parentPos.z;

                    const timeline = gsap.timeline({
                        onComplete: () => {
                            setIsAnimating(false);
                            if (cardRef.current) cardRef.current.scale.set(1, 1, 1);
                            resolve();
                        }
                    });

                    timeline.to(cardRef.current.rotation, {
                        x: 0, y: 0, z: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, 0);

                    if (materialRef.current) materialRef.current.bend = 0;

                    const localBaseY = -1.1;

                    timeline.to(paperRef.current.position, {
                        y: localBaseY - 0.5,
                        duration: 0.15,
                        ease: 'power2.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: 0.5,
                        z: -0.05,
                        duration: 0.15,
                        ease: 'power2.out'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: 0.8,
                            duration: 0.15,
                            ease: 'power2.out'
                        }, '<');

                        // Keep painted or finish painting to 1.0 when opened
                        // Running with gsap.to independently to avoid blocking the timeline duration
                        if (project.paintedTexture) {
                            gsap.to(materialRef.current, {
                                uProgress: 1.0,
                                duration: 0.3,
                                ease: 'power2.out',
                                overwrite: 'auto'
                            });
                        }
                    }

                    timeline.to(paperRef.current.position, {
                        y: localBaseY + 1.5,
                        x: targetX * 0.2,
                        z: targetZ * 0.2,
                        duration: 0.4,
                        ease: 'power1.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: Math.PI * 0.8,
                        z: 0.05,
                        y: -0.02,
                        duration: 0.4,
                        ease: 'power1.inOut'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: -0.3,
                            duration: 0.4,
                            ease: 'power1.inOut'
                        }, '<');
                    }

                    timeline.to(paperRef.current.position, {
                        y: targetY,
                        x: targetX,
                        z: targetZ,
                        duration: 0.4,
                        ease: 'power3.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: Math.PI,
                        y: 0,
                        z: 0,
                        duration: 0.4,
                        ease: 'power3.out'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: 0,
                            duration: 0.5,
                            ease: 'power2.out'
                        }, '<');
                    }

                    timeline.to(paperRef.current.scale, {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0,
                        duration: 0.3,
                        ease: 'sine.out'
                    }, '-=0.4');
                });
            });
        }
    }));

    const handleOpenProject = (e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        openProjectUrl(project);
    };

    const handleInspectDossier = (e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        if (openOverlay) {
            openOverlay({
                layout: 'project_dossier',
                project: project,
                title: project.title
            });
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (btnHovered) {
            handleInspectDossier(e);
            return;
        }
        if (isSelected) {
            // When opened, clicking anywhere on the card body goes back / closes card
            if (onClick) onClick(index);
            return;
        }
        if (onClick) onClick(index);
    };

    // Cursor change on hover
    useEffect(() => {
        if (isSelected) {
            document.body.style.cursor = 'pointer';
        } else if (hovered && !isSelected) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered, isSelected, btnHovered]);

    useFrame((state) => {
        if (!cardRef.current) return;

        // Custom GSAP Paint logic for texts
        // We delay the text reveal slightly so the card paints first (p > 0.4)
        if (textRef.current && paintProgress) {
            const p = paintProgress.value;
            // Instantly reveal if we teleported
            const expectedOpacity = p >= 1.0 ? 1.0 : THREE.MathUtils.clamp((p - 0.3) * 2.0, 0.0, 1.0);
            
            if (textRef.current.fillOpacity !== expectedOpacity) {
                const applyOpacity = (ref) => {
                    if (ref.current) {
                        ref.current.fillOpacity = expectedOpacity;
                        if (ref.current.material) {
                            ref.current.material.opacity = expectedOpacity;
                            ref.current.material.transparent = true;
                        }
                    }
                };
                applyOpacity(textRef);
                applyOpacity(detailsTextRef1);
                applyOpacity(fullTitleTextRef);
                applyOpacity(detailsTextRef2);
                applyOpacity(techTextRef);
                boxTextRefs.current.forEach((el) => {
                    if (el) applyOpacity({ current: el });
                });
                applyOpacity(openTextRef);
            }
        }

        // --- Align text Z position with paper bending and fluttering animation (FRONT) ---
        if (textRef.current && materialRef.current) {
            const y = textRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            textRef.current.position.z = bendAmount + flutter + 0.02;

            // Rotate text to conform to curvature (derivative dz/dy)
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            textRef.current.rotation.x = Math.atan(dz_dy);
        }

        // --- Align button Z position with back animation (BACK) ---
        if (buttonGroupRef.current && materialRef.current) {
            const y = buttonGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            // REMEMBER: The entire plane bends forward (+Z relative to parent).
            // Since we are on the OUTER side (behind back), we sit slightly behind the plane, e.g. -0.03
            // Correct formulation for fluttering on the back:
            buttonGroupRef.current.position.z = bendAmount + flutter - 0.03;

            // Rotate button to conform to curvature on opposite side (extra Pi flip)
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            buttonGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);

            // Button hover scale animation (enlarges text)
            const targetScale = btnHovered ? 1.08 : 1;
            buttonGroupRef.current.scale.lerp(_tempScale.set(targetScale, targetScale, 1), 0.15);
        }

        // --- Align top description position (PROJECT DETAILS) ---
        if (detailsGroupRef.current && materialRef.current) {
            const y = detailsGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            // On the back (like button)
            detailsGroupRef.current.position.z = bendAmount + flutter - 0.03;

            // Rotation
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            detailsGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);
        }

        // --- Align Tech Stack section position ---
        if (techStackGroupRef.current && materialRef.current) {
            const y = techStackGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            techStackGroupRef.current.position.z = bendAmount + flutter - 0.03;

            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            techStackGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);
        }

        // Skip position updates ONLY during flip animation, NOT during scroll
        if (isAnimating || isSelected) return;

        const totalWidth = PROJECT_COUNT * GAP; // GAP is available in scope because we are in the file where GAP is defined
        let rawX = (index * GAP) - currentScroll.current;
        const halfWidth = totalWidth / 2;
        let displayX = ((rawX + halfWidth) % totalWidth + totalWidth) % totalWidth - halfWidth;

        const u = (displayX + 16) / 32;
        const safeU = THREE.MathUtils.clamp(u, 0, 1);
        const pointOnCurve = curve.getPointAt(safeU);

        cardRef.current.position.set(pointOnCurve.x, pointOnCurve.y, pointOnCurve.z);

        // Wind / Sway Animation
        const time = state.clock.getElapsedTime();
        const wind = Math.sin(time * swaySpeed.current + swayOffset.current) * 0.05;

        cardRef.current.rotation.z = wind;
        cardRef.current.rotation.x = 0;

        // Visibility Check (fade out if too far) & Category Filtering
        const dist = Math.abs(displayX);
        const baseScale = THREE.MathUtils.clamp(1 - (dist / 50), 0.7, 1);
        const isMatching = activeCategory === 'all' || (project.categories && project.categories.includes(activeCategory));
        const filterScale = isMatching ? 1.0 : 0.75;
        cardRef.current.scale.setScalar(baseScale * filterScale);
    });

    return (
        <group
            ref={cardRef}
            onClick={handleClick}
            onPointerEnter={(e) => {
                if (isMobile || isTransitioning) return;
                e.stopPropagation();
                setHovered(true);

                // Brush reveal animation
                if (materialRef.current && project.paintedTexture && !isSelected) {
                    gsap.to(materialRef.current, {
                        uProgress: 1.0,
                        duration: 0.8,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            }}
            onPointerLeave={(e) => {
                if (isMobile || isTransitioning) return;
                e.stopPropagation();
                setHovered(false);

                // Reverse brush reveal animation ONLY if NOT selected
                if (materialRef.current && project.paintedTexture && !isSelected) {
                    gsap.to(materialRef.current, {
                        uProgress: 0.0,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            }}
        >
            {/* Clothespin (Top Center) - Does NOT move with paperRef */}
            <mesh position={[0, -0.08, 0.15]} rotation={[0, 0, Math.PI]}>
                <planeGeometry args={[0.3, 0.2]} />
                <meshBasicMaterial color="#ffffff"
                    map={clothespinTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Featured Wax Seal Star Indicator above clothespin */}
            {project.isFeatured && (
                <SmallStar position={[0, 0.12, 0.18]} scale={0.065} color="#b87e28" />
            )}

            {/* The Paper / Card hanging down - This moves independently now */}
            <group
                ref={paperRef}
                position={[0, -1.1, 0]}
            >
                <mesh>
                    <planeGeometry args={[1.5, 2, 16, 16]} />
                    <PaperMaterial
                        ref={materialRef}
                        color="#ffffff"
                        map={project.frontTexture}
                        mapBack={project.backTexture}
                        mapPainted={project.paintedTexture}
                        side={THREE.DoubleSide}
                        roughness={0.6}
                        paintProgress={paintProgress}
                        roomOrigin={roomOrigin}
                    />
                </mesh>

                {/* === BUTTON: INSPECT DOSSIER ON BACK OF SHEET === */}
                <group
                    ref={buttonGroupRef}
                    position={[0, 0.68, 0]}
                    rotation={[Math.PI, 0, 0]}
                    onClick={handleInspectDossier}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Layer 1: Visual button frame */}
                    <mesh onClick={handleInspectDossier}>
                        <planeGeometry args={[1.3, 1.3 / 3.613]} />
                        <meshBasicMaterial color="#ffffff"
                            map={project.buttonTexture}
                            transparent={true}
                            alphaTest={0.05}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Layer 2: Text INSPECT DOSSIER */}
                    <Text
                        ref={openTextRef}
                        position={[0, 0.01, 0.01]}
                        fontSize={0.092}
                        color={btnHovered ? "#833c46" : "#1c1c1c"}
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                        letterSpacing={0.04}
                        fillOpacity={0} // Start hidden
                        side={THREE.DoubleSide}
                        onClick={handleInspectDossier}
                        onPointerEnter={(e) => {
                            e.stopPropagation();
                            setBtnHovered(true);
                        }}
                        onPointerLeave={(e) => {
                            e.stopPropagation();
                            setBtnHovered(false);
                        }}
                    >
                        INSPECT DOSSIER 📜
                    </Text>

                    {/* Layer 3: Invisible hit-area covering entire button - opens project dossier */}
                    <mesh
                        position={[0, 0.01, 0.02]}
                        onClick={handleInspectDossier}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerEnter={(e) => {
                            e.stopPropagation();
                            setBtnHovered(true);
                        }}
                        onPointerLeave={(e) => {
                            e.stopPropagation();
                            setBtnHovered(false);
                        }}
                    >
                        <planeGeometry args={[1.34, 1.34 / 3.613]} />
                        <meshBasicMaterial
                            color="#e0e0e0"
                            transparent={true}
                            opacity={0.001}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </mesh>

                    {/* Layer 4: Direct link to repository / live demo */}
                    <Text
                        position={[0, -0.21, 0.01]}
                        fontSize={0.044}
                        color="#78593a"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                        letterSpacing={0.02}
                        fillOpacity={0.9}
                        side={THREE.DoubleSide}
                        onClick={handleOpenProject}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerEnter={(e) => {
                            e.stopPropagation();
                            document.body.style.cursor = 'pointer';
                        }}
                        onPointerLeave={(e) => {
                            e.stopPropagation();
                            document.body.style.cursor = 'auto';
                        }}
                    >
                        {project.liveDemo ? '⚡ OPEN LIVE DEMO ↗' : '⌥ OPEN GITHUB REPOSITORY ↗'}
                    </Text>
                </group>

                {/* === TEKST NA PLECACH KARTKI (PROJECT DETAILS) === */}
                <group
                    ref={detailsGroupRef}
                    position={[0, -0.48, 0]}
                    rotation={[Math.PI, 0, 0]}
                >
                    {/* Category Tag */}
                    <Text
                        ref={detailsTextRef1}
                        position={[0, 0.35, 0.01]}
                        fontSize={0.048}
                        color="#833c46"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                        letterSpacing={0.04}
                        fillOpacity={0} // Start hidden
                    >
                        {`PRJ ${project.num || ''} • ${(project.categoryDisplay || '').toUpperCase()}`}
                    </Text>

                    {/* Full Project Title */}
                    <Text
                        ref={fullTitleTextRef}
                        position={[0, 0.27, 0.01]}
                        fontSize={0.052}
                        lineHeight={1.14}
                        color="#1a1612"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={1.12}
                        textAlign="center"
                        fillOpacity={0} // Start hidden
                    >
                        {project.fullTitle || project.title}
                    </Text>

                    {/* Hand-drawn subtle divider separator line */}
                    <mesh position={[0, 0.03, 0.01]}>
                        <planeGeometry args={[0.7, 0.004]} />
                        <meshBasicMaterial color="#bda07b" transparent opacity={0.6} />
                    </mesh>

                    {/* What It Does Description */}
                    <Text
                        ref={detailsTextRef2}
                        position={[0, 0.00, 0.01]}
                        fontSize={0.040}
                        lineHeight={1.28}
                        color="#3b3227"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={1.14}
                        textAlign="center"
                        fillOpacity={0} // Start hidden
                    >
                        {project.whatItDoes || project.description}
                    </Text>
                </group>

                {/* === SEKCJA TECH STACK NA PLECACH KARTKI === */}
                <group
                    ref={techStackGroupRef}
                    position={[0, 0.355, 0]}
                    rotation={[Math.PI, 0, 0]}
                >
                    <Text
                        ref={techTextRef}
                        position={[0, 0.165, 0.01]}
                        fontSize={0.056}
                        color="#241e17"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                        letterSpacing={0.02}
                        fillOpacity={0} // Start hidden
                    >
                        VERIFIED ARCHITECTURE STACK:
                    </Text>

                    {/* 4 Hand-Drawn Sketch Compartments - Pure charcoal ink centered in each sketched wooden frame */}
                    {techPillars.map((pillarText, i) => (
                        <Text
                            key={i}
                            ref={el => (boxTextRefs.current[i] = el)}
                            position={[TECH_PILLAR_CENTERS[i], -0.01, 0.01]}
                            fontSize={pillarText.includes('\n') ? 0.032 : 0.036}
                            lineHeight={1.20}
                            maxWidth={0.24}
                            textAlign="center"
                            anchorX="center"
                            anchorY="middle"
                            color="#281e14"
                            font="/fonts/CabinSketch-Bold.ttf"
                            fillOpacity={0}
                        >
                            {pillarText}
                        </Text>
                    ))}
                </group>

                {/* 
                  === PROJECT TEXT / TITLES ===
                  You can easily customize the appearance of each text element here.
                */}
                <Text
                    ref={textRef}
                    position={[0, 0.7, 0]}
                    fontSize={0.15}
                    color="#1c1c1c"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.22}
                    textAlign="center"
                    lineHeight={1.12}
                    fillOpacity={0} // Start hidden
                >
                    {project.cardTitle || project.title}
                </Text>

                <PositionalAudio
                    ref={paperAudioRef}
                    url="/sounds/papersound.mp3"
                    distanceModel="exponential"
                    rolloffFactor={GALLERY_INTERACTION_AUDIO_SETTINGS.rolloff}
                    refDistance={GALLERY_INTERACTION_AUDIO_SETTINGS.distance}
                    loop={false}
                />
            </group>
        </group>
    );
}));


// Component to handle the cropped right-side houses
const RightSideHouses = ({ texture, baseWidth, baseHeight, cropAmount }) => {
    // Clone texture to allow independent UV manipulation
    const croppedTexture = useMemo(() => {
        const t = texture.clone();
        // Because scale.x is -1 (mirrored), the "Right" side in world space
        // corresponds to the "Left" side of the texture (U=0).
        // To crop the world-right side, we need to crop the texture-left side.
        // So we increase offset.x.
        t.offset.x = cropAmount;
        t.repeat.x = 1 - cropAmount;
        t.needsUpdate = true;
        return t;
    }, [texture, cropAmount]);

    // Calculate new width and position
    const newWidth = baseWidth * (1 - cropAmount);

    // Original Inner Edge (World Left of this mesh) was at CenterX - Width/2
    // For the Right Side Mesh: 
    // Original Pos = 15. Width = 15.
    // Inner Edge = 15 - 7.5 = 7.5.
    // We want to keep Inner Edge at 7.5.
    // New Center = Inner Edge + NewWidth / 2
    const newX = 7.5 + (newWidth / 2);

    return (
        <mesh position={[newX, -1, -9]} scale={[-1, 1, 1]}>
            <planeGeometry args={[newWidth, baseHeight]} />
            <meshBasicMaterial color="#e0e0e0"
                map={croppedTexture}
                transparent={true}
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Sub-component for individual tech stack logos
const TechStackLogo = ({ path, position }) => {
    const texture = useTexture(path);

    return (
        <mesh position={position}>
            <planeGeometry args={[0.17, 0.17]} />
            <meshBasicMaterial color="#ffffff"
                map={texture}
                transparent={true}
            />
        </mesh>
    );
};

export default GalleryRoom;
