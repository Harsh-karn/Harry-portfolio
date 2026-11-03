import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SkyChunk, { CHUNK_LENGTH, ROOM_Z } from './SkyChunk';
import PaperAirplane from './PaperAirplane';
import { useScene } from '../../../../context/SceneContext';
import { useAudio } from '../../../../context/AudioManager';
import { useAchievements } from '../../../../context/AchievementsContext';
import { isTouchDevice } from '../../../../utils/deviceDetect';

// Each story cycle spans 200 units (5 chunks of 40)
const STORY_CYCLE_LENGTH = 200;

// Hard world-space clipping limit: objects with worldZ > -5 are clipped
const MILESTONE_CORRIDOR_CLIP_Z = -5.0;

/**
 * Reusable Hand-drawn Decorative Star - Cleaned up to eliminate visual noise
 */
const SmallStar = () => null;

/**
 * Reusable Floating Candle with Gentle Flame Aura
 */
const FloatingCandle = ({ position, scale = 0.38, speed = 0.8, offset = 0, candleTexture }) => {
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
                <meshBasicMaterial map={candleTexture} transparent alphaTest={0.05} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.4, -0.01]}>
                <circleGeometry args={[0.35, 16]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

/**
 * Reusable Sketched Parchment Button
 */
const SketchButton = ({ label, onClick, width = 1.9, height = 0.46, position = [0, 0, 0] }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const targetScale = hovered ? 1.05 : 1.0;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 10 * delta);
    });

    return (
        <group
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color={hovered ? "#faeedb" : "#fdfaf3"} side={THREE.DoubleSide} />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
                <lineBasicMaterial color="#241e17" linewidth={2} />
            </lineSegments>
            <Text
                position={[0, 0.01, 0.01]}
                fontSize={height * 0.42}
                font="/fonts/CabinSketch-Bold.ttf"
                color={hovered ? "#833c46" : "#241e17"}
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.02}
            >
                {label}
            </Text>
        </group>
    );
};

/**
 * SECTION 1: HERO MILESTONE (Entrance View)
 * Displays Harsh Karn's Name, Statement, and Harry Potter riding the Nimbus broomstick
 * on a hand-drawn cloud with floating candles & celestial stars.
 */
const HeroMilestone = ({ z, scrollProgressRef }) => {
    const groupRef = useRef();
    const potterRef = useRef();
    const bubbleRef = useRef();
    const isTouch = isTouchDevice();
    const { play } = useAudio();
    const { unlockAchievement } = useAchievements();

    const [bubbleText, setBubbleText] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    const harryTexture = useTexture('/textures/about/harry_potter_cloud.webp');
    const candleTexture = useTexture('/textures/corridor/magical/candle_sketch.webp');

    const handleHarryClick = (e) => {
        e.stopPropagation();
        play('spell');
        unlockAchievement('secret_avatar');

        if (potterRef.current) {
            gsap.to(potterRef.current.position, {
                y: "+=0.8",
                duration: 0.35,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
            });
            gsap.to(potterRef.current.rotation, {
                z: "+=0.25",
                duration: 0.35,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }

        const quotes = [
            "⚡ Mischief Managed!",
            "✨ Up, up, and into the clouds!",
            "🧹 Faster than a Firebolt!",
            "🧙‍♂️ Welcome to my magical portfolio!"
        ];
        setBubbleText(quotes[Math.floor(Math.random() * quotes.length)]);
        setShowBubble(true);

        if (bubbleRef.current) {
            bubbleRef.current.scale.set(0, 0, 0);
            gsap.to(bubbleRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(1.8)' });
            gsap.delayedCall(2.5, () => {
                if (bubbleRef.current) {
                    gsap.to(bubbleRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.2, ease: 'power2.in', onComplete: () => setShowBubble(false) });
                }
            });
        }
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;

        // Hard clip when passing the camera
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        // Smooth opacity calculation:
        // Fully visible at worldZ around -40 (scrollProgress = 0)
        // Smoothly fades out as worldZ approaches -6 (passing camera)
        let opacity = 1.0;
        if (worldZ > -18) {
            opacity = THREE.MathUtils.clamp(( -6 - worldZ ) / 12, 0, 1);
        } else if (worldZ < -65) {
            opacity = THREE.MathUtils.clamp((worldZ + 80) / 15, 0, 1);
        }

        // Apply opacity smoothly across children
        groupRef.current.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.damp(child.material.opacity || 1, opacity, 10, delta);
            }
            if (typeof child.fillOpacity === 'number') {
                child.fillOpacity = THREE.MathUtils.damp(child.fillOpacity, opacity, 10, delta);
            }
        });

        // Gentle floating breeze oscillation for Harry Potter on cloud
        if (potterRef.current) {
            const t = state.clock.getElapsedTime();
            const baseY = isTouch ? 0.4 : 0.6;
            potterRef.current.position.y = baseY + Math.sin(t * 0.75) * 0.12;
            potterRef.current.position.x = Math.cos(t * 0.45) * 0.08;
            potterRef.current.rotation.z = Math.sin(t * 0.5) * 0.025;
        }
    });

    // 1376x768 aspect ratio
    const potterAspect = 1376 / 768;
    const potterWidth = isTouch ? 4.8 : 6.4;
    const potterHeight = potterWidth / potterAspect;

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Header: Name */}
            <Text
                position={[0, isTouch ? 3.3 : 3.6, 0.1]}
                fontSize={isTouch ? 0.72 : 0.98}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
                letterSpacing={0.04}
            >
                HARSH KARN
            </Text>

            {/* Header: Main Statement */}
            <Text
                position={[0, isTouch ? 2.6 : 2.8, 0.1]}
                fontSize={isTouch ? 0.20 : 0.26}
                color="#4a3c2e"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
                maxWidth={isTouch ? 5.2 : 8.8}
                textAlign="center"
                lineHeight={1.2}
            >
                "Building thoughtful software and intelligent systems that solve real problems."
            </Text>

            {/* Decorative Stars around Header */}
            <SmallStar position={[-3.6, 3.6, 0.1]} scale={0.06} />
            <SmallStar position={[3.6, 3.6, 0.1]} scale={0.06} />

            {/* Harry Potter riding Nimbus Broomstick through Clouds (Click for broom zoom & spell) */}
            <mesh
                ref={potterRef}
                position={[0, isTouch ? 0.4 : 0.6, 0]}
                onClick={handleHarryClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[potterWidth, potterHeight]} />
                <meshBasicMaterial
                    map={harryTexture}
                    transparent
                    alphaTest={0.04}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Harry Potter Magical Speech Bubble */}
            <group ref={bubbleRef} position={[potterWidth * 0.28, isTouch ? 1.4 : 1.7, 0.2]} scale={[0, 0, 0]}>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[2.8, 0.65]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[2.88, 0.72]} />
                    <meshBasicMaterial color="#221e1a" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 0.02, 0.02]}
                    fontSize={0.16}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#1c1b18"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2.6}
                    textAlign="center"
                >
                    {bubbleText}
                </Text>
            </group>

            {/* Ambient Floating Magical Candles around Harry */}
            <FloatingCandle
                position={[-potterWidth * 0.52, 1.6, 0.15]}
                scale={0.38}
                candleTexture={candleTexture}
                speed={0.8}
                offset={0.2}
            />
            <FloatingCandle
                position={[potterWidth * 0.52, 1.3, 0.15]}
                scale={0.36}
                candleTexture={candleTexture}
                speed={0.9}
                offset={2.4}
            />

            {/* Subtle Magical Sparkles */}
            <SmallStar position={[-2.4, 2.2, 0.1]} scale={0.045} color="#b87e28" />
            <SmallStar position={[2.6, 2.0, 0.1]} scale={0.045} color="#b87e28" />
            <SmallStar position={[-2.8, -0.6, 0.1]} scale={0.04} color="#833c46" />
            <SmallStar position={[3.0, -0.4, 0.1]} scale={0.04} color="#833c46" />
        </group>
    );
};

/**
 * SECTION 2: JOURNAL MILESTONE (WHO I AM)
 * Appears ONLY when the user scrolls forward after the name.
 * Presented as a bespoke, hand-drawn wide sketchbook parchment folio
 * perfectly matching the authentic hand-drawn pencil & ink aesthetic of Harsh's portfolio.
 */
const JournalMilestone = ({ z, scrollProgressRef }) => {
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const isTouch = isTouchDevice();

    const scrollTexture = useTexture('/textures/about/wide_sketch_scroll.webp');
    const candleTexture = useTexture('/textures/corridor/magical/candle_sketch.webp');

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;

        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        let opacity = 1.0;
        if (worldZ > -18) {
            opacity = THREE.MathUtils.clamp(( -6 - worldZ ) / 12, 0, 1);
        } else if (worldZ < -60) {
            opacity = THREE.MathUtils.clamp((worldZ + 75) / 15, 0, 1);
        }

        groupRef.current.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.damp(child.material.opacity || 1, opacity, 10, delta);
            }
            if (typeof child.fillOpacity === 'number') {
                child.fillOpacity = THREE.MathUtils.damp(child.fillOpacity, opacity, 10, delta);
            }
        });

        // Gentle floating scroll hovering
        const time = state.clock.elapsedTime;
        const baseY = isTouch ? 1.35 : 1.55;
        groupRef.current.position.y = baseY + Math.sin(time * 0.45) * 0.08;
        groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.01;
    });

    const handleOpenFullIntro = () => {
        openOverlay({
            title: 'Harsh Karn - Personal Story',
            date: '2026',
            badge: 'IDENTITY & PHILOSOPHY',
            description: "I'm interested in the space where software engineering meets intelligent systems. I enjoy taking an idea apart, understanding the problem, and building something practical from it.\n\nMy work has taken me across backend engineering, AI agents, full-stack development, retrieval systems, and data analytics. A lot of my learning has happened through building independently, exploring unfamiliar technologies, and turning ideas into working projects.",
            platformConfig: { label: 'WHO I AM', icon: '✦' }
        });
    };

    // 2048x1152 aspect ratio (16:9 = 1.777778)
    const scrollAspect = 2048 / 1152;
    const scrollWidth = isTouch ? 5.6 : 7.6;
    const scrollHeight = scrollWidth / scrollAspect;

    // Strict internal text margin ensuring words stay comfortably inside the parchment
    // and never touch the rolled paper cylinders on the sides
    const textMaxWidth = isTouch ? 3.8 : 5.2;

    return (
        <group ref={groupRef} position={[0, isTouch ? 1.35 : 1.55, z]}>
            {/* Section Heading above the scroll */}
            <Text
                position={[0, scrollHeight * 0.5 + (isTouch ? 0.45 : 0.60), 0.1]}
                fontSize={isTouch ? 0.65 : 0.88}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
                letterSpacing={0.04}
            >
                WHO I AM
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, scrollHeight * 0.5 + (isTouch ? 0.12 : 0.18), 0.1]}
                fontSize={isTouch ? 0.18 : 0.24}
                color="#554332"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                A personal look at my journey and philosophies.
            </Text>

            {/* Bespoke Hand-Drawn Wide Parchment Folio */}
            <group position={[0, 0, 0]}>
                {/* Scroll Texture Base */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[scrollWidth, scrollHeight]} />
                    <meshBasicMaterial
                        map={scrollTexture}
                        transparent
                        alphaTest={0.04}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* 1. Archive Identity Badge at Top of Folio */}
                <Text
                    position={[0, scrollHeight * 0.32, 0.02]}
                    fontSize={isTouch ? 0.12 : 0.15}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#833c46"
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.04}
                >
                    ✦ WHO I AM · ARCHIVE IDENTITY ✦
                </Text>

                {/* 2. Paragraph 1 (Wide format -> only 2 clean, elegant lines) */}
                <Text
                    position={[0, scrollHeight * 0.20, 0.02]}
                    fontSize={isTouch ? 0.115 : 0.145}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#1a1612"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.28}
                >
                    "I'm interested in the space where software engineering meets intelligent systems. I enjoy taking an idea apart, understanding the problem, and building something practical from it."
                </Text>

                {/* 3. Paragraph 2 (Wide format -> only 3 clean lines, generous vertical clearance) */}
                <Text
                    position={[0, scrollHeight * 0.02, 0.02]}
                    fontSize={isTouch ? 0.11 : 0.14}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#2c241c"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.28}
                >
                    "My work has taken me across backend engineering, AI agents, full-stack development, retrieval systems, and data analytics. A lot of my learning has happened through building independently, exploring unfamiliar technologies, and turning ideas into working projects."
                </Text>

                {/* 4. Interactive Button (Generous clearance above bottom, elevated well above paper airplane) */}
                <SketchButton
                    label="OPEN JOURNAL FOLIO 📜"
                    position={[0, -scrollHeight * 0.23, 0.02]}
                    width={isTouch ? 2.1 : 2.5}
                    height={isTouch ? 0.36 : 0.42}
                    onClick={handleOpenFullIntro}
                />

                {/* Floating enchanted candles beside scroll */}
                <FloatingCandle
                    position={[-scrollWidth * 0.54, 0.6, 0.2]}
                    scale={0.40}
                    candleTexture={candleTexture}
                    speed={0.8}
                    offset={0.5}
                />
                <FloatingCandle
                    position={[scrollWidth * 0.54, 0.3, 0.2]}
                    scale={0.38}
                    candleTexture={candleTexture}
                    speed={0.9}
                    offset={2.1}
                />

                {/* Delicate magical sparkles around scroll */}
                <SmallStar position={[-scrollWidth * 0.56, scrollHeight * 0.44, 0.1]} scale={0.05} color="#b87e28" />
                <SmallStar position={[scrollWidth * 0.56, scrollHeight * 0.40, 0.1]} scale={0.05} color="#b87e28" />
                <SmallStar position={[-scrollWidth * 0.55, -scrollHeight * 0.38, 0.1]} scale={0.045} color="#833c46" />
                <SmallStar position={[scrollWidth * 0.55, -scrollHeight * 0.34, 0.1]} scale={0.045} color="#833c46" />
            </group>
        </group>
    );
};

/**
 * SECTION 3: MY JOURNEY (Interactive Timeline)
 * Two major milestones with connecting illustrated timeline line:
 * - Milestone 01: B.Tech in Information Technology (2022 - 2026)
 * - Milestone 02: Self-directed Projects (2025 - Present)
 */
const JourneyMilestone = ({ z, scrollProgressRef }) => {
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const isTouch = isTouchDevice();

    const milestoneTexture = useTexture('/textures/about/milestone_sketch_scroll.webp');

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;

        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        let opacity = 1.0;
        if (worldZ > -18) {
            opacity = THREE.MathUtils.clamp(( -6 - worldZ ) / 12, 0, 1);
        } else if (worldZ < -65) {
            opacity = THREE.MathUtils.clamp((worldZ + 80) / 15, 0, 1);
        }

        groupRef.current.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.damp(child.material.opacity || 1, opacity, 10, delta);
            }
            if (typeof child.fillOpacity === 'number') {
                child.fillOpacity = THREE.MathUtils.damp(child.fillOpacity, opacity, 10, delta);
            }
        });

        const time = state.clock.elapsedTime;
        groupRef.current.position.y = Math.sin(time * 0.35 + 1.2) * 0.08;
    });

    const openMilestone1 = () => {
        openOverlay({
            title: 'B.Tech in Information Technology',
            date: '2022 - 2026',
            badge: 'ACADEMIC FOUNDATION',
            description: 'Studied Information Technology and built my academic foundation in software development and computing.',
            platformConfig: { label: 'MY JOURNEY · MILESTONE 01', icon: '🎓' }
        });
    };

    const openMilestone2 = () => {
        openOverlay({
            title: 'Self-directed Projects',
            date: '2025 - Present',
            badge: 'SYSTEMS & EXPERIMENTATION',
            description: 'A period of independent building, experimentation, and hands-on development across AI systems, backend engineering, full-stack products, and data analytics.',
            platformConfig: { label: 'MY JOURNEY · MILESTONE 02', icon: '⚙️' }
        });
    };

    // 1400x1300 aspect ratio (1.0769)
    const mScrollAspect = 1400 / 1300;
    const mScrollWidth = isTouch ? 4.8 : 4.4;
    const mScrollHeight = mScrollWidth / mScrollAspect;

    const m1Pos = isTouch ? [0, 2.3, 0] : [-3.9, 0.45, 0];
    const m2Pos = isTouch ? [0, -2.4, 0] : [3.9, 0.45, 0];

    // Strict internal text margin ensuring words stay comfortably inside the parchment
    // and never touch the rolled paper cylinders on the sides
    const textMaxWidth = isTouch ? 2.8 : 2.50;

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Section Title */}
            <Text
                position={[0, 4.4, 0.2]}
                fontSize={isTouch ? 0.8 : 1.15}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
                letterSpacing={0.04}
            >
                MY JOURNEY
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 3.65, 0.2]}
                fontSize={isTouch ? 0.26 : 0.36}
                color="#554332"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                My path so far.
            </Text>

            {/* Connecting Illustrated Timeline Line (Desktop only) */}
            {!isTouch && (
                <group position={[0, 0.45, -0.05]}>
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[7.8, 0.015]} />
                        <meshBasicMaterial color="#bda07b" transparent opacity={0.65} />
                    </mesh>
                    <SmallStar position={[0, 0, 0.01]} scale={0.08} color="#b87e28" />
                    <Text
                        position={[0, -0.3, 0.01]}
                        fontSize={0.16}
                        font="/fonts/CabinSketch-Bold.ttf"
                        color="#78593a"
                        anchorX="center"
                        anchorY="middle"
                    >
                        CHRONOLOGY
                    </Text>
                </group>
            )}

            {/* === MILESTONE 01: ACADEMIC FOUNDATION (Scroll Poster) === */}
            <group position={m1Pos}>
                {/* Scroll Texture Base */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[mScrollWidth, mScrollHeight]} />
                    <meshBasicMaterial
                        map={milestoneTexture}
                        transparent
                        alphaTest={0.04}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Period Pill Badge */}
                <mesh position={[0, 1.25, 0.01]}>
                    <planeGeometry args={[1.5, 0.30]} />
                    <meshBasicMaterial color="#833c46" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 1.25 + 0.01, 0.02]}
                    fontSize={0.15}
                    color="#ffffff"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    2022 - 2026
                </Text>

                {/* Milestone 01 Title (Well inside, never touches rolled edges) */}
                <Text
                    position={[0, 0.78, 0.02]}
                    fontSize={isTouch ? 0.17 : 0.19}
                    color="#1a1a1a"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.15}
                >
                    B.Tech in Information Technology
                </Text>

                {/* Description (Strictly inside margins with breathing room) */}
                <Text
                    position={[0, 0.35, 0.02]}
                    fontSize={isTouch ? 0.135 : 0.142}
                    color="#2c241c"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.25}
                >
                    Studied Information Technology and built my academic foundation in software development and computing.
                </Text>

                {/* Interactive Button */}
                <SketchButton
                    label="VIEW MILESTONE 📜"
                    position={[0, -0.95, 0.02]}
                    width={2.15}
                    height={0.36}
                    onClick={openMilestone1}
                />
            </group>

            {/* === MILESTONE 02: SELF-DIRECTED PROJECTS (Scroll Poster) === */}
            <group position={m2Pos}>
                {/* Scroll Texture Base */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[mScrollWidth, mScrollHeight]} />
                    <meshBasicMaterial
                        map={milestoneTexture}
                        transparent
                        alphaTest={0.04}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Period Pill Badge */}
                <mesh position={[0, 1.25, 0.01]}>
                    <planeGeometry args={[1.5, 0.30]} />
                    <meshBasicMaterial color="#b87e28" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 1.25 + 0.01, 0.02]}
                    fontSize={0.15}
                    color="#ffffff"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    2025 - Present
                </Text>

                {/* Milestone 02 Title (Well inside, never touches rolled edges) */}
                <Text
                    position={[0, 0.78, 0.02]}
                    fontSize={isTouch ? 0.17 : 0.19}
                    color="#1a1a1a"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.15}
                >
                    Self-directed Projects
                </Text>

                {/* Description (Strictly inside margins with breathing room) */}
                <Text
                    position={[0, 0.35, 0.02]}
                    fontSize={isTouch ? 0.135 : 0.142}
                    color="#2c241c"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={textMaxWidth}
                    textAlign="center"
                    lineHeight={1.25}
                >
                    A period of independent building, experimentation, and hands-on development across AI systems, backend engineering, full-stack products, and data analytics.
                </Text>

                {/* Interactive Button */}
                <SketchButton
                    label="VIEW MILESTONE 📜"
                    position={[0, -0.95, 0.02]}
                    width={2.15}
                    height={0.36}
                    onClick={openMilestone2}
                />
            </group>
        </group>
    );
};

/**
 * EXACT 10 SKILL GROUPS
 */
const SKILLS_DATA = [
    { name: 'Python', tag: 'Core Backend & AI', icon: '🐍' },
    { name: 'FastAPI', tag: 'High-Perf APIs', icon: '⚡' },
    { name: 'React & Next.js', tag: 'Web & UI Systems', icon: '⚛️' },
    { name: 'TypeScript', tag: 'Type-Safe Code', icon: 'TS' },
    { name: 'PostgreSQL', tag: 'Relational DB & WAL', icon: '🐘' },
    { name: 'MongoDB & Redis', tag: 'Document & Caching', icon: '🍃' },
    { name: 'AI Agents & LLMs', tag: 'Autonomous Fleets', icon: '🤖' },
    { name: 'RAG', tag: 'Dense Retrieval & Search', icon: '🔍' },
    { name: 'Docker & Kubernetes', tag: 'Container Systems', icon: '🐳' },
    { name: 'Data Analytics', tag: 'Pipelines & Telemetry', icon: '📊' }
];

// Procedural hand-drawn sketch balloon texture
function createBalloonTexture(fillColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 160);

    // Sketchy oval balloon body
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#1c1b18';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.ellipse(64, 66, 46, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White sketch specular reflection curve
    ctx.beginPath();
    ctx.arc(44, 46, 16, Math.PI * 0.9, Math.PI * 1.55);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3.8;
    ctx.stroke();

    // Bottom knot
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#1c1b18';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(56, 122);
    ctx.lineTo(72, 122);
    ctx.lineTo(64, 134);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wavy dangling string
    ctx.beginPath();
    ctx.moveTo(64, 134);
    ctx.quadraticCurveTo(56, 144, 66, 152);
    ctx.quadraticCurveTo(74, 156, 64, 160);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

/**
 * Interactive Paper Airplane - Aerobatic Spin on click
 */
const InteractivePaperAirplane = ({ position = [3.8, 1.6, -38] }) => {
    const planeRef = useRef();
    const { play } = useAudio();
    const { unlockAchievement } = useAchievements();
    const isSpinning = useRef(false);

    const handleClick = (e) => {
        e.stopPropagation();
        if (isSpinning.current) return;
        isSpinning.current = true;
        play('spell');
        unlockAchievement('secret_airplane');

        // 3D Aerobatics loop-the-loop and barrel roll
        const tl = gsap.timeline({
            onComplete: () => { isSpinning.current = false; }
        });

        tl.to(planeRef.current.rotation, {
            x: "+=6.283", // 360 degree loop
            z: "+=6.283", // 360 degree barrel roll
            duration: 1.1,
            ease: "power2.inOut"
        }, 0);

        tl.to(planeRef.current.position, {
            y: "+=1.3",
            duration: 0.55,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        }, 0);
    };

    useFrame((state) => {
        if (!planeRef.current || isSpinning.current) return;
        const time = state.clock.getElapsedTime();
        planeRef.current.position.y = position[1] + Math.sin(time * 1.6) * 0.12;
        planeRef.current.position.x = position[0] + Math.cos(time * 1.1) * 0.08;
        planeRef.current.rotation.z = Math.sin(time * 1.2) * 0.06;
    });

    return (
        <group
            ref={planeRef}
            position={position}
            onClick={handleClick}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <PaperAirplane scale={0.34} />
        </group>
    );
};

/**
 * Individual Illustrated Hogwarts Chocolate Frog Wizard Skill Card with Interactive Balloon Pop
 */
const SkillPlaque = ({ skill, position, isTouch, cardTexture, idx = 0 }) => {
    const { play } = useAudio();
    const { unlockAchievement } = useAchievements();
    const [hovered, setHovered] = useState(false);
    const [isPopped, setIsPopped] = useState(false);
    const plaqueRef = useRef();
    const balloonRef = useRef();
    const shardsRef = useRef();

    // Hogwarts House palette for balloons
    const balloonColors = ['#833c46', '#b87e28', '#254433', '#223854', '#5a2d52'];
    const balloonColor = balloonColors[idx % balloonColors.length];
    const balloonTexture = useMemo(() => createBalloonTexture(balloonColor), [balloonColor]);

    const handleBalloonClick = (e) => {
        e.stopPropagation();
        if (isPopped) return;

        // Play authentic balloon pop sound
        play('balloon');
        unlockAchievement('secret_balloon');

        // Balloon pop animation
        if (balloonRef.current) {
            gsap.to(balloonRef.current.scale, {
                x: 1.35,
                y: 1.35,
                duration: 0.07,
                ease: 'power2.out',
                onComplete: () => {
                    setIsPopped(true);

                    // Shard burst particles
                    if (shardsRef.current) {
                        shardsRef.current.children.forEach((shard, sIdx) => {
                            const angle = (sIdx / 8) * Math.PI * 2;
                            const dist = 0.7 + Math.random() * 0.5;
                            gsap.fromTo(shard.position,
                                { x: 0, y: 0, z: 0 },
                                {
                                    x: Math.cos(angle) * dist,
                                    y: Math.sin(angle) * dist,
                                    duration: 0.4,
                                    ease: 'power2.out'
                                }
                            );
                            gsap.fromTo(shard.material,
                                { opacity: 1 },
                                { opacity: 0, duration: 0.4 }
                            );
                        });
                    }

                    // Bouncy card reveal
                    if (plaqueRef.current) {
                        gsap.fromTo(plaqueRef.current.scale,
                            { x: 0.82, y: 0.82 },
                            { x: 1, y: 1, duration: 0.55, ease: 'back.out(2.2)' }
                        );
                    }
                }
            });
        }
    };

    useFrame((state, delta) => {
        if (!plaqueRef.current) return;
        const targetScale = hovered ? 1.08 : 1.0;
        plaqueRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 10 * delta);

        // Bobbing balloon before popped
        if (!isPopped && balloonRef.current) {
            const time = state.clock.getElapsedTime();
            balloonRef.current.position.y = (cardH * 0.48) + Math.sin(time * 2.2 + idx) * 0.06;
            balloonRef.current.rotation.z = Math.cos(time * 1.8 + idx) * 0.05;
        }
    });

    // 900x1100 aspect ratio (0.81818)
    const cardW = isTouch ? 1.65 : 2.15;
    const cardH = cardW / (900 / 1100);
    const maxContentWidth = cardW * 0.72;

    return (
        <group
            ref={plaqueRef}
            position={position}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            {/* The Chocolate Frog Gothic Vaulted Arch Card */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[cardW, cardH]} />
                <meshBasicMaterial
                    map={cardTexture}
                    transparent
                    alphaTest={0.04}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Magical Icon / Emblem */}
            <Text
                position={[0, cardH * 0.16, 0.02]}
                fontSize={isTouch ? 0.22 : 0.28}
                font="/fonts/CabinSketch-Bold.ttf"
                color={hovered ? "#833c46" : "#4a3c2e"}
                anchorX="center"
                anchorY="middle"
            >
                {skill.icon}
            </Text>

            {/* Skill Name */}
            <Text
                position={[0, -cardH * 0.04, 0.02]}
                fontSize={isTouch ? 0.16 : 0.20}
                font="/fonts/CabinSketch-Bold.ttf"
                color="#1a1612"
                anchorX="center"
                anchorY="middle"
                maxWidth={maxContentWidth}
                textAlign="center"
                lineHeight={1.15}
            >
                {isPopped ? skill.name : "???"}
            </Text>

            {/* Subtitle / Focus Area Pill Badge */}
            <mesh position={[0, -cardH * 0.25, 0.01]}>
                <planeGeometry args={[maxContentWidth, isTouch ? 0.22 : 0.26]} />
                <meshBasicMaterial
                    color={isPopped ? (hovered ? "#b87e28" : "#833c46") : "#554c42"}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <Text
                position={[0, -cardH * 0.25 + 0.005, 0.02]}
                fontSize={isTouch ? 0.095 : 0.115}
                font="/fonts/CabinSketch-Bold.ttf"
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={maxContentWidth - 0.08}
                textAlign="center"
            >
                {isPopped ? skill.tag : "🎈 Pop to Reveal"}
            </Text>

            {/* Interactive Floating Balloon (Click to Pop!) */}
            {!isPopped && (
                <group
                    ref={balloonRef}
                    position={[0, cardH * 0.48, 0.15]}
                    onClick={handleBalloonClick}
                >
                    <mesh>
                        <planeGeometry args={[1.0, 1.25]} />
                        <meshBasicMaterial
                            map={balloonTexture}
                            transparent
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </mesh>
                    <Text
                        position={[0, 0.1, 0.02]}
                        fontSize={0.16}
                        font="/fonts/CabinSketch-Bold.ttf"
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        POP!
                    </Text>
                </group>
            )}

            {/* Shard Burst Container */}
            <group ref={shardsRef} position={[0, cardH * 0.48, 0.18]}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <mesh key={s} position={[0, 0, 0]} rotation={[0, 0, s * (Math.PI / 4)]}>
                        <planeGeometry args={[0.08, 0.14]} />
                        <meshBasicMaterial
                            color={balloonColor}
                            transparent
                            opacity={0}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

/**
 * SECTION 4: SKILLS MILESTONE
 */
const SkillsMilestone = ({ z, scrollProgressRef }) => {
    const groupRef = useRef();
    const isTouch = isTouchDevice();

    const cardTexture = useTexture('/textures/about/hp_wizard_card.webp');

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;

        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        let opacity = 1.0;
        if (worldZ > -18) {
            opacity = THREE.MathUtils.clamp(( -6 - worldZ ) / 12, 0, 1);
        } else if (worldZ < -65) {
            opacity = THREE.MathUtils.clamp((worldZ + 80) / 15, 0, 1);
        }

        groupRef.current.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.damp(child.material.opacity || 1, opacity, 10, delta);
            }
            if (typeof child.fillOpacity === 'number') {
                child.fillOpacity = THREE.MathUtils.damp(child.fillOpacity, opacity, 10, delta);
            }
        });

        const time = state.clock.elapsedTime;
        groupRef.current.position.y = Math.sin(time * 0.3 + 2.5) * 0.08;
    });

    const positions = useMemo(() => {
        if (isTouch) {
            return SKILLS_DATA.map((_, idx) => {
                const col = idx % 2 === 0 ? -1.15 : 1.15;
                const row = Math.floor(idx / 2);
                const y = 2.6 - row * 2.15;
                return [col, y, 0];
            });
        } else {
            return SKILLS_DATA.map((_, idx) => {
                const isRow1 = idx < 5;
                const colIdx = idx % 5;
                const x = -4.8 + colIdx * 2.4;
                const y = isRow1 ? 1.45 : -1.45;
                return [x, y, 0];
            });
        }
    }, [isTouch]);

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, isTouch ? 4.6 : 3.8, 0.2]}
                fontSize={isTouch ? 0.8 : 1.15}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
                letterSpacing={0.04}
            >
                SKILLS
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, isTouch ? 3.9 : 3.1, 0.2]}
                fontSize={isTouch ? 0.24 : 0.36}
                color="#554332"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                Technologies I love working with.
            </Text>

            {/* The 10 Hogwarts Chocolate Frog Wizard Cards */}
            <group position={[0, 0, 0]}>
                {SKILLS_DATA.map((skill, idx) => (
                    <SkillPlaque
                        key={skill.name}
                        skill={skill}
                        idx={idx}
                        position={positions[idx]}
                        isTouch={isTouch}
                        cardTexture={cardTexture}
                    />
                ))}
            </group>
        </group>
    );
};

/**
 * Main InfiniteSkyManager Component
 * Cycles 4 distinct stages over 200 units (5 chunks of 40):
 * 1. HeroMilestone: HARSH KARN & Harry Potter riding broom on clouds (z = -15)
 * 2. JournalMilestone: WHO I AM Folio (z = -60) -> only appears after scrolling past name!
 * 3. JourneyMilestone: MY JOURNEY Timeline (z = -110)
 * 4. SkillsMilestone: SKILLS Plaques (z = -160)
 */
const InfiniteSkyManager = ({ scrollProgressRef }) => {
    const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2]);
    const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
    const worldRef = useRef();

    const getCurrentChunk = (worldZ) => Math.floor(worldZ / CHUNK_LENGTH);
    const getCurrentStoryCycle = (worldZ) => Math.floor(worldZ / STORY_CYCLE_LENGTH);

    useFrame(() => {
        if (!worldRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        worldRef.current.position.z = scrollProgress;

        const currentChunk = getCurrentChunk(scrollProgress);
        const shouldBeActiveChunks = [
            currentChunk - 1,
            currentChunk,
            currentChunk + 1,
            currentChunk + 2,
        ];
        if (shouldBeActiveChunks.some(c => !activeChunks.includes(c)) || activeChunks.some(c => !shouldBeActiveChunks.includes(c))) {
            setActiveChunks(shouldBeActiveChunks);
        }

        const currentStoryCycle = getCurrentStoryCycle(scrollProgress);
        const shouldBeActiveCycles = [
            currentStoryCycle - 1,
            currentStoryCycle,
            currentStoryCycle + 1,
        ];
        if (shouldBeActiveCycles.some(c => !activeStoryCycles.includes(c)) || activeStoryCycles.some(c => !shouldBeActiveCycles.includes(c))) {
            setActiveStoryCycles(shouldBeActiveCycles);
        }
    });

    return (
        <group ref={worldRef}>
            {/* === SKY CHUNKS WITH CLOUDS === */}
            {activeChunks.map((chunkIndex) => (
                <SkyChunk
                    key={`sky-chunk-${chunkIndex}`}
                    chunkIndex={chunkIndex}
                    seed={42}
                    scrollProgressRef={scrollProgressRef}
                />
            ))}

            {/* === THE 4 STORY MILESTONES (Looping every 200 units) === */}
            {activeStoryCycles.map((cycleIndex) => (
                <group key={`story-cycle-${cycleIndex}`}>
                    {/* Stage 1: HARSH KARN & Harry Potter on Broom on Cloud (Entrance View) */}
                    <HeroMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* Interactive Aerobatic Paper Airplane (Click for 3D loop & roll) */}
                    <InteractivePaperAirplane
                        position={[3.8, 1.8, -(cycleIndex * STORY_CYCLE_LENGTH + 35)]}
                    />

                    {/* Stage 2: WHO I AM (Personal Journal Folio) - Appears after scrolling past name */}
                    <JournalMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 60)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* Stage 3: MY JOURNEY (Interactive Timeline) */}
                    <JourneyMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 110)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* Stage 4: SKILLS (The 10 Skill Groups) */}
                    <SkillsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 160)}
                        scrollProgressRef={scrollProgressRef}
                    />
                </group>
            ))}
        </group>
    );
};

export default InfiniteSkyManager;
