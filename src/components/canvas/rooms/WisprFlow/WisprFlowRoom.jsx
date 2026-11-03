import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import GalleryClouds from '../Gallery/GalleryClouds';
import { useScene } from '../../../../context/SceneContext';

// ============================================
// 🎙️ SOUNDWAVE PULSING RING
// ============================================
const SoundwaveRing = ({ radius, delay = 0, isHovered }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = (state.clock.elapsedTime + delay) * 1.6;
        const pulse = (Math.sin(t) + 1) / 2; // 0 to 1
        const scaleVal = 1 + pulse * (isHovered ? 0.38 : 0.22);
        meshRef.current.scale.set(scaleVal, scaleVal, 1);
        meshRef.current.material.opacity = (1 - pulse * 0.75) * (isHovered ? 0.9 : 0.5);
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -0.05]}>
            <ringGeometry args={[radius - 0.035, radius, 36]} />
            <meshBasicMaterial
                color="#d4af37"
                transparent={true}
                opacity={0.5}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// ============================================
// 🌊 3D ANIMATED DECORATIVE WAVEFORM
// ============================================
const Decorative3DWaveform = ({ count = 32, width = 4.2 }) => {
    const groupRef = useRef();
    const barWidth = width / count;

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime * 2.5;
        groupRef.current.children.forEach((child, i) => {
            const harmonic = Math.sin(time + i * 0.35) * Math.cos(time * 0.6 + i * 0.18);
            const height = Math.max(0.08, 0.2 + Math.abs(harmonic) * 0.55);
            child.scale.y = height;
            child.position.y = height / 2;
        });
    });

    return (
        <group ref={groupRef} position={[0, -0.05, 0.1]}>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i} position={[(i - count / 2) * barWidth, 0, 0]}>
                    <planeGeometry args={[barWidth * 0.65, 1]} />
                    <meshBasicMaterial
                        color={i % 3 === 0 ? '#833c46' : (i % 2 === 0 ? '#1a1a1a' : '#c49b43')}
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ============================================
// ✨ ORBITING ENCHANTED SPARKLES
// ============================================
const FloatingStars = ({ count = 14 }) => {
    const starsRef = useRef();
    const starData = useRef(
        Array.from({ length: count }, (_, i) => ({
            angle: (i / count) * Math.PI * 2,
            radius: 1.2 + (i % 3) * 0.4,
            baseY: 0.15 + (i % 4) * 0.12,
            speed: 0.4 + (i % 3) * 0.25,
            scale: 0.022 + (i % 2) * 0.012,
            offset: i * 1.5
        }))
    ).current;

    useFrame((state) => {
        if (!starsRef.current) return;
        const time = state.clock.getElapsedTime();
        starsRef.current.children.forEach((child, i) => {
            const d = starData[i];
            const currentAngle = d.angle + time * d.speed * 0.5;
            child.position.x = Math.cos(currentAngle) * d.radius;
            child.position.z = Math.sin(currentAngle) * (d.radius * 0.7);
            child.position.y = d.baseY + Math.sin(time * 2 + d.offset) * 0.05;
        });
    });

    return (
        <group ref={starsRef}>
            {starData.map((d, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[d.scale, 5]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.7} />
                </mesh>
            ))}
        </group>
    );
};

// ============================================
// 🏛️ SPATIAL 3D INTERACTIVE STATION
// ============================================
const InteractiveStation = ({
    position,
    rotation = [0, 0, 0],
    textureMap,
    onOpen,
    pedestalTexture,
    scale = [2.2, 1.48],
    delay = 0
}) => {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + delay;
        // Gentle floating bob
        ref.current.position.y = position[1] + Math.sin(t * 0.85) * 0.045;
        ref.current.rotation.z = rotation[2] + Math.sin(t * 0.5) * 0.012;

        const targetScale = hovered ? 1.08 : 1.0;
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
    });

    return (
        <group
            ref={ref}
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation();
                onOpen && onOpen();
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
            {/* Wooden Stake / Pedestal */}
            <mesh position={[0, -scale[1] * 0.52, -0.02]}>
                <planeGeometry args={[0.18, scale[1] * 0.75]} />
                <meshBasicMaterial color="#5c4838" />
            </mesh>

            {/* Base Barrel / Drum */}
            {pedestalTexture && (
                <mesh position={[0, -scale[1] * 0.75, -0.05]}>
                    <planeGeometry args={[1.2, 0.7]} />
                    <meshBasicMaterial
                        map={pedestalTexture}
                        transparent
                        alphaTest={0.08}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* The Crisp Hand-Drawn Station Card */}
            <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={scale} />
                <meshBasicMaterial
                    map={textureMap}
                    transparent={true}
                    alphaTest={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Hover Highlight Ring / Frame */}
            {hovered && (
                <mesh position={[0, 0, 0.015]}>
                    <planeGeometry args={[scale[0] * 1.02, scale[1] * 1.02]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.25} />
                </mesh>
            )}
        </group>
    );
};

// ============================================
// 🎙️ MAIN WISPR FLOW ROOM COMPONENT
// ============================================
const WisprFlowRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { isTeleporting } = useScene();
    const [isHoveredMic, setIsHoveredMic] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const groupRef = useRef();
    const micRef = useRef();
    const candleRef1 = useRef();
    const candleRef2 = useRef();

    // Check responsive viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1000);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load Textures with sRGB color space
    const floorTexture = useTexture('/textures/corridor/kawalekpodlogi.webp');
    const micTexture = useTexture('/textures/corridor/magical/emblem_wispr.webp');
    const introScrollTexture = useTexture('/textures/wispr/wispr_intro_scroll.webp');
    const candleTexture = useTexture('/textures/corridor/magical/candle_sketch.webp');
    const magicBooksTexture = useTexture('/textures/corridor/magical/magic_books.webp');
    const pedestalTexture = useTexture('/textures/contact/beczka.webp');

    // 5 Station Card Textures
    const cardBriefTexture = useTexture('/textures/wispr/wispr_card_brief.webp');
    const cardGrowthTexture = useTexture('/textures/wispr/wispr_card_growth.webp');
    const cardExperimentsTexture = useTexture('/textures/wispr/wispr_card_experiments.webp');
    const cardCreativeTexture = useTexture('/textures/wispr/wispr_card_creative.webp');
    const cardWhyTexture = useTexture('/textures/wispr/wispr_card_why.webp');

    // Ensure color spaces are proper
    useEffect(() => {
        [
            floorTexture, micTexture, introScrollTexture, candleTexture,
            magicBooksTexture, pedestalTexture, cardBriefTexture,
            cardGrowthTexture, cardExperimentsTexture, cardCreativeTexture, cardWhyTexture
        ].forEach((tex) => {
            if (tex) tex.colorSpace = THREE.SRGBColorSpace;
        });
    }, [
        floorTexture, micTexture, introScrollTexture, candleTexture,
        magicBooksTexture, pedestalTexture, cardBriefTexture,
        cardGrowthTexture, cardExperimentsTexture, cardCreativeTexture, cardWhyTexture
    ]);

    // Track Ready Signaling - 5 frames wait + timeout safety
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 5;

    useEffect(() => {
        if (showRoom && !hasSignaledReady.current) {
            const timer = setTimeout(() => {
                if (!hasSignaledReady.current) {
                    hasSignaledReady.current = true;
                    onReady?.();
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [showRoom, onReady]);

    useFrame((state) => {
        if (!hasSignaledReady.current) {
            frameCount.current++;
            if (frameCount.current >= FRAMES_TO_WAIT) {
                hasSignaledReady.current = true;
                onReady?.();
            }
        }

        const t = state.clock.elapsedTime;

        // Microphone gentle float
        if (micRef.current) {
            micRef.current.position.y = 0.95 + Math.sin(t * 1.2) * 0.04;
            micRef.current.rotation.z = Math.sin(t * 0.7) * 0.02;
        }

        // Candle bobbing
        if (candleRef1.current) {
            candleRef1.current.position.y = 0.65 + Math.sin(t * 1.8) * 0.03;
        }
        if (candleRef2.current) {
            candleRef2.current.position.y = 0.65 + Math.sin(t * 1.5 + 1) * 0.03;
        }
    });

    // Dispatches custom event to WisprUIOverlay (lives cleanly in DOM outside R3F Canvas)
    const openDossierTab = useCallback((tabId) => {
        window.dispatchEvent(new CustomEvent('open-wispr-tab', { detail: { tabId } }));
    }, []);

    // Stations layout configuration (framed perfectly in camera focal plane)
    const STATIONS = useMemo(() => [
        {
            id: 'brief',
            texture: cardBriefTexture,
            desktopPos: [-5.2, 0.45, -7.5],
            mobilePos: [-1.4, 0.55, -7.5],
            rotation: [0, 0.22, 0],
            delay: 0.1
        },
        {
            id: 'growth',
            texture: cardGrowthTexture,
            desktopPos: [-2.85, 0.0, -6.6],
            mobilePos: [-0.95, 0.0, -6.6],
            rotation: [0, 0.1, 0],
            delay: 0.3
        },
        {
            id: 'experiments',
            texture: cardExperimentsTexture,
            desktopPos: [0, -0.4, -5.8],
            mobilePos: [0, -0.4, -5.8],
            rotation: [0, 0, 0],
            delay: 0.5
        },
        {
            id: 'creative',
            texture: cardCreativeTexture,
            desktopPos: [2.85, 0.0, -6.6],
            mobilePos: [0.95, 0.0, -6.6],
            rotation: [0, -0.1, 0],
            delay: 0.7
        },
        {
            id: 'why',
            texture: cardWhyTexture,
            desktopPos: [5.2, 0.45, -7.5],
            mobilePos: [1.4, 0.55, -7.5],
            rotation: [0, -0.22, 0],
            delay: 0.9
        }
    ], [cardBriefTexture, cardGrowthTexture, cardExperimentsTexture, cardCreativeTexture, cardWhyTexture]);

    return (
        <group ref={groupRef} position={[0, -0.7, -5]}>
            {/* Background Hand-Drawn Clouds */}
            <GalleryClouds count={40} seed={99} rotationOffset={[0, 0.5, 0]} />

            {/* Studio Paper / Wooden Floor */}
            <mesh position={[0, -1.8, -8]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[40, 30]} />
                <meshBasicMaterial
                    color="#f8f4ec"
                    map={floorTexture}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 📜 ROOM BANNER SCROLL (WISPR FLOW, TAGLINE, SUPPORTING LINE) */}
            <group position={[0, isMobile ? 3.4 : 3.85, isMobile ? -6.8 : -7.5]}>
                <mesh
                    onClick={() => openDossierTab('brief')}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                >
                    <planeGeometry args={[isMobile ? 3.4 : 4.4, isMobile ? 1.7 : 2.2]} />
                    <meshBasicMaterial
                        map={introScrollTexture}
                        transparent={true}
                        alphaTest={0.08}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {/* 🎙️ CENTRAL ENCHANTED PODIUM: ANTIQUE MICROPHONE & SOUNDWAVES */}
            <group position={[0, 0.85, -7.0]}>
                {/* Podium Table Base */}
                <mesh position={[0, -0.9, -0.1]}>
                    <cylinderGeometry args={[0.9, 1.1, 1.4, 24]} />
                    <meshBasicMaterial color="#5a432f" />
                </mesh>

                {/* Microphone Centerpiece Group */}
                <group
                    ref={micRef}
                    position={[0, 0.35, 0]}
                    onClick={() => openDossierTab('voice')}
                    onPointerEnter={(e) => {
                        e.stopPropagation();
                        setIsHoveredMic(true);
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerLeave={() => {
                        setIsHoveredMic(false);
                        document.body.style.cursor = 'auto';
                    }}
                >
                    {/* Microphone Hand-Drawn Sketch Emblem */}
                    <mesh position={[0, 0, 0.01]}>
                        <planeGeometry args={[2.2, 2.2]} />
                        <meshBasicMaterial
                            map={micTexture}
                            transparent={true}
                            alphaTest={0.08}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Concentric Pulsing Soundwave Rings */}
                    <SoundwaveRing radius={1.15} delay={0} isHovered={isHoveredMic} />
                    <SoundwaveRing radius={1.45} delay={0.4} isHovered={isHoveredMic} />
                    <SoundwaveRing radius={1.75} delay={0.8} isHovered={isHoveredMic} />

                    {/* 3D Waveform Audio Visualizer */}
                    <Decorative3DWaveform count={32} width={isMobile ? 2.8 : 3.8} />

                    {/* Orbiting Enchanted Sparkles */}
                    <FloatingStars count={14} />
                </group>

                {/* Left Floating Candle */}
                <group ref={candleRef1} position={[-1.15, 0.65, 0.2]}>
                    <mesh>
                        <planeGeometry args={[0.65, 0.95]} />
                        <meshBasicMaterial
                            map={candleTexture}
                            transparent={true}
                            alphaTest={0.08}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <pointLight position={[0, 0.15, 0.05]} color="#ffe4b5" intensity={0.6} distance={3} />
                </group>

                {/* Stack of Enchanted Sketchbooks / Manuscripts */}
                <group position={[0.95, -0.15, 0.1]} rotation={[0, -0.25, 0]}>
                    <mesh>
                        <planeGeometry args={[0.85, 0.65]} />
                        <meshBasicMaterial
                            map={magicBooksTexture}
                            transparent={true}
                            alphaTest={0.08}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </group>

                {/* Right Floating Candle */}
                <group ref={candleRef2} position={[1.15, 0.65, -0.2]}>
                    <mesh>
                        <planeGeometry args={[0.6, 0.9]} />
                        <meshBasicMaterial
                            map={candleTexture}
                            transparent={true}
                            alphaTest={0.08}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <pointLight position={[0, 0.15, 0.05]} color="#ffe4b5" intensity={0.6} distance={3} />
                </group>
            </group>

            {/* 🏛️ 5 SPATIAL INTERACTIVE STATIONS */}
            {STATIONS.map((station) => (
                <InteractiveStation
                    key={station.id}
                    position={isMobile ? station.mobilePos : station.desktopPos}
                    rotation={station.rotation}
                    textureMap={station.texture}
                    pedestalTexture={pedestalTexture}
                    onOpen={() => openDossierTab(station.id)}
                    delay={station.delay}
                />
            ))}
        </group>
    );
};

export default WisprFlowRoom;
