import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import MessagePaper from './MessagePaper';
import SocialBarrel from './SocialBarrel';
import { useScene } from '../../../../context/SceneContext';
import GalleryClouds from '../Gallery/GalleryClouds';
import ContactSeascapeHorizon from './ContactSeascapeHorizon';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';

// ============================================
// ============================================
// 🌊 CONTACT ROOM v2 - MESSAGE IN A BOTTLE
// Immersive experience: write message, roll into bottle, throw
// ============================================
import { useTexture } from '@react-three/drei';
import { usePaintMaterial } from '../Gallery/usePaintMaterial';

const WAVE_LAYERS = 4;

// ============================================
// ⚙️ AUDIO SETTINGS - TWEAK HERE
// Edit these values to adjust volume and hearing distance of sea sound
// ============================================
export const AUDIO_SETTINGS = {
    volume: 2,
    distance: 2,           // Distance at which sound starts fading (refDistance)
    rolloff: 1.2           // Fade-off speed (rolloffFactor)
};

// ============================================
// ⚙️ LIGHTHOUSE SETTINGS - TWEAK HERE
// Edit these values to adjust position, rotation, and size of lighthouse
// ============================================
export const LATARNIA_SETTINGS = {
    // Position: [left/right (X), up/down (Y), back/front (Z)]
    position: [-10, 5, -20],

    // Rotation: [pitch front/back (X), yaw left/right (Y), roll side-to-side (Z)]
    rotation: [0, 0.1, 0],

    // Size: [width, height]
    scale: [4.49, 5] // Legacy ratio 1102/1225
};

// ============================================
// ⚙️ SHIP SETTINGS - TWEAK HERE
// Edit these values to adjust position, rotation, and size of ship
// ============================================
export const STATEK_SETTINGS = {
    // Position: [left/right (X), up/down (Y), back/front (Z)]
    position: [0, 1.6, -15],

    // Rotation: [pitch front/back (X), yaw left/right (Y), roll side-to-side (Z)]
    rotation: [0, -0.2, 0],

    // Size: [width, height]
    scale: [3.35, 1.3] // Legacy ratio 2525/978
};

// ============================================
// ⚙️ CAMERA SETTINGS - TWEAK HERE
// ============================================
const CAMERA_SETTINGS = {
    // Rotation X: How much to look down (radians)
    // -1.5 is straight down (-90 deg), -1.2 is ~70 deg
    lookDownAngle: -1.2,

    // Rotation Y: Left/Right turn
    // Set to 0 to force center, or null to keep current direction
    forceCenterY: -1.05, // FORCE CENTER to align paper straight

    // Rotation Z: Tilt/Roll
    // Set to 0 to straighten the camera
    forceStraightZ: 0,

    // Animation speed
    lerpSpeed: 2.5
};

// Experience phases
const PHASE = {
    ENTERING: 'entering',      // Camera entering room, looking at menu
    LOOKING_DOWN: 'looking_down', // Camera animating to look at dock
    WRITING: 'writing',        // User writing on paper
    ROLLING: 'rolling',        // Paper rolling into bottle
    HOLDING: 'holding',        // Camera holding bottle, looking at sea
    THROWING: 'throwing',      // Bottle being thrown
    DONE: 'done'               // Bottle floating away
};

// 12 subtle enchanted sparkles orbiting around correspondence desk
const FloatingStars = ({ count = 12 }) => {
    const starsRef = useRef();
    const starData = useRef(
        Array.from({ length: count }, (_, i) => ({
            angle: (i / count) * Math.PI * 2,
            radius: 1.1 + (i % 3) * 0.3,
            baseY: 0.12 + (i % 4) * 0.1,
            speed: 0.35 + (i % 3) * 0.2,
            scale: 0.022 + (i % 2) * 0.012,
            offset: i * 1.3
        }))
    ).current;

    useFrame((state) => {
        if (!starsRef.current) return;
        const time = state.clock.getElapsedTime();
        starsRef.current.children.forEach((child, i) => {
            const d = starData[i];
            const currentAngle = d.angle + time * d.speed * 0.5;
            child.position.x = Math.cos(currentAngle) * d.radius;
            child.position.z = 2.0 + Math.sin(currentAngle) * (d.radius * 0.7);
            child.position.y = d.baseY + Math.sin(time * 2 + d.offset) * 0.04;
        });
    });

    return (
        <group ref={starsRef}>
            {starData.map((d, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[d.scale, 5]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.65} />
                </mesh>
            ))}
        </group>
    );
};

const ContactRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { camera } = useThree();
    const { isTeleporting } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;

    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current && audioRef.current.setVolume) {
            audioRef.current.setVolume(effectiveVolume);
        }
    }, [effectiveVolume]);

    // Safe autoplay: resume AudioContext if suspended (browser policy blocks autoplay until user gesture)
    // The user has already clicked the door to enter, so resuming is safe here.
    useEffect(() => {
        if (!showRoom || isWarmup) return;
        const tryPlay = async () => {
            try {
                const audio = audioRef.current;
                if (!audio) return;
                // Drei PositionalAudio wraps a THREE.PositionalAudio with an AudioContext on listener
                const ctx = audio?.listener?.context || audio?.context;
                if (ctx && ctx.state === 'suspended') {
                    await ctx.resume();
                }
                // Manually start playback if not already playing
                if (audio && !audio.isPlaying) {
                    audio.play();
                }
            } catch {
                // AudioContext resume/play failed silently — sea ambience just won't play
            }
        };
        // Slight delay to ensure AudioRef is attached after mount
        const timer = setTimeout(tryPlay, 200);
        return () => clearTimeout(timer);
    }, [showRoom, isWarmup]);

    useEffect(() => {
        if (isExiting || isTeleporting) {
            hidePopup();
        }
    }, [isExiting, isTeleporting, hidePopup]);

    // Load Sea Texture
    const seaTexture = useTexture("/textures/contact/faletopdown.webp");
    // Load Molo Texture
    const moloTexture = useTexture("/textures/contact/molo.webp");
    // Load Lighthouse Texture
    const latarniaTexture = useTexture("/textures/contact/latarnia.webp");
    // Load Ship Texture
    const statekTexture = useTexture("/textures/contact/statek.webp");
    // Load Contact Intro Scroll & Magical Sketch Assets
    const introScrollTexture = useTexture("/textures/contact/contact_intro_scroll.webp");
    const quillInkTexture = useTexture("/textures/contact/quill_ink.webp");
    const envelopeWaxTexture = useTexture("/textures/contact/envelope_wax.webp");
    const candleTexture = useTexture("/textures/corridor/magical/candle_sketch.webp");


    // Configure texture repeating (1:1 scale)
    useEffect(() => {
        if (seaTexture) {
            seaTexture.wrapS = seaTexture.wrapT = THREE.MirroredRepeatWrapping;
            seaTexture.repeat.set(6, 4);
            seaTexture.needsUpdate = true;
        }

        if (moloTexture) {
            moloTexture.wrapS = moloTexture.wrapT = THREE.RepeatWrapping;
            moloTexture.center.set(0.5, 0.5);
            moloTexture.rotation = Math.PI / 2;
            moloTexture.repeat.set(1, 1);
            moloTexture.needsUpdate = true;
        }
    }, [seaTexture, moloTexture]);

    useEffect(() => {
        // Change to YXZ smoothly on mount for proper head nodding, 
        // avoiding mathematical snapping of the Euler angles.
        camera.rotation.reorder('YXZ');

        return () => {
            // Restore default XYZ on unmount so other rooms/corridors don't break
            camera.rotation.reorder('XYZ');
        };
    }, [camera]);

    // ===== PAINT TRANSITION =====
    // Contact is on the RIGHT side of the corridor, so reveal goes from right (+X) into the room
    const groupRef = useRef();
    const { onBeforeCompile, animatePaint, resetPaint, uniformsData, updateRoomOrigin } = usePaintMaterial({
        dirX: 1.0,    // Opposite to Gallery (right side door)
        dirY: 0.0,
        dirZ: -0.1,   // Slight angle matching mirrored direction
        startDist: -5.0,
        endDist: 55.0,
        noiseAxes: 'yz'
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    const wasTeleportedRef = useRef(false);
    useEffect(() => {
        if (isTeleporting) wasTeleportedRef.current = true;
    }, [isTeleporting]);

    useEffect(() => {
        if (showRoom && !isWarmup) {
            if (wasTeleportedRef.current || isTeleporting) {
                uniformsData.uPaintProgress.value = 1.0;
                setIsTransitioning(false);
            } else {
                setIsTransitioning(true);
                resetPaint();
                animatePaint(0.2, 2.5);
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 2700);
            }
        } else {
            uniformsData.uPaintProgress.value = 1.0;
        }
    }, [showRoom, isWarmup, isTeleporting]);

    // Track if we've signaled ready
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 5;

    // Phase state
    const [currentPhase, setCurrentPhase] = useState(PHASE.ENTERING);
    const [showSelection, setShowSelection] = useState(true);

    const hasAnimatedDown = useRef(false);
    // Latch exit state to prevent glitch
    const hasExitTriggered = useRef(false);
    if (isExiting && !hasExitTriggered.current) {
        hasExitTriggered.current = true;
        // Do NOT reorder to XYZ here. Let DoorSection's GSAP animate camera back to the door
        // while remaining in YXZ order. This prevents "neck snapping" because interpolating 
        // to X=0 in YXZ order naturally lifts the head up without twisting the neck.
    }

    // Refs for animations
    const waveRefs = useRef([]);
    const statekRef = useRef(); // Ref for ship animation

    // Target rotation values
    const targetRotX = useRef(0);
    const targetRotY = useRef(CAMERA_SETTINGS.forceCenterY ?? -1.05);
    const targetRotZ = useRef(0);

    // Initial entrance rotation Y (to return to the exact same view as when entering)
    const initialEntranceRotY = useRef(CAMERA_SETTINGS.forceCenterY ?? -1.05);

    // Synchronize initial entrance rotation from camera when entering room
    useEffect(() => {
        if (showRoom && camera) {
            if (Math.abs(camera.rotation.y) > 0.1) {
                initialEntranceRotY.current = camera.rotation.y;
                targetRotY.current = camera.rotation.y;
            }
        }
    }, [showRoom, camera]);

    // Reset camera rotation when teleporting starts
    useEffect(() => {
        if (isTeleporting) {
            hasAnimatedDown.current = false;
            hasExitTriggered.current = false;
            targetRotX.current = 0;
            targetRotY.current = initialEntranceRotY.current;
            targetRotZ.current = 0;
            setCurrentPhase(PHASE.ENTERING);
            setShowSelection(true); // Reset selection menu
        }
    }, [isTeleporting]);

    // This effect now initializes the room but DOES NOT trigger look down
    useEffect(() => {
        if (hasSignaledReady.current && !hasAnimatedDown.current && showRoom) {
            // Just ensure we are in entering phase
            // We wait for user selection to trigger the rest
        }

        // EXIT ANIMATION CLEANUP
        if (!showRoom) {
            hasExitTriggered.current = false;
            if (hasAnimatedDown.current) {
                hasAnimatedDown.current = false;
                setCurrentPhase(PHASE.ENTERING);
                targetRotX.current = 0;
                targetRotY.current = initialEntranceRotY.current;
                targetRotZ.current = 0;
                setShowSelection(true);
            }
        }
    }, [hasSignaledReady.current, showRoom, camera]);

    // 5 Social Destinations corresponding to Harsh's exact profiles
    const SOCIAL_DESTINATIONS = [
        {
            id: 'linkedin',
            label: 'LINKEDIN',
            url: 'https://www.linkedin.com/in/harsh-karn--/',
            artifactTexturePath: '/textures/contact/artifact_linkedin.webp',
            desktopPos: [-3.4, 0.5, -10.8],
            mobilePos: [-1.3, 0.6, -10.5],
            rotation: [0, 0.16, 0]
        },
        {
            id: 'github',
            label: 'GITHUB',
            url: 'https://github.com/Harsh-karn',
            artifactTexturePath: '/textures/contact/artifact_github.webp',
            desktopPos: [-5.6, -0.15, -8.6],
            mobilePos: [-1.8, -0.2, -7.8],
            rotation: [0, 0.28, 0]
        },
        {
            id: 'x',
            label: 'X / TWITTER',
            url: 'https://x.com/heyy_harsh_',
            artifactTexturePath: '/textures/contact/artifact_x.webp',
            desktopPos: [-1.8, -0.65, -6.8],
            mobilePos: [-0.9, -0.6, -6.4],
            rotation: [0, 0.08, 0]
        },
        {
            id: 'reddit',
            label: 'REDDIT',
            url: 'https://www.reddit.com/user/heyy_harsh/',
            artifactTexturePath: '/textures/contact/artifact_reddit.webp',
            desktopPos: [3.4, 0.5, -10.8],
            mobilePos: [1.3, 0.6, -10.5],
            rotation: [0, -0.16, 0]
        },
        {
            id: 'instagram',
            label: 'INSTAGRAM',
            url: 'https://www.instagram.com/harsh.un.filtered',
            artifactTexturePath: '/textures/contact/artifact_instagram.webp',
            desktopPos: [5.6, -0.15, -8.6],
            mobilePos: [1.8, -0.2, -7.8],
            rotation: [0, -0.28, 0]
        }
    ];

    const candleRef = useRef();

    const handleMailSelect = useCallback(() => {
        setShowSelection(false);

        // Capture current orientation before looking down if valid
        if (Math.abs(camera.rotation.y) > 0.1) {
            initialEntranceRotY.current = camera.rotation.y;
        }

        // Trigger the look down sequence
        hasAnimatedDown.current = true;
        hasExitTriggered.current = false;

        // Capture landing rotation
        targetRotX.current = camera.rotation.x;
        targetRotY.current = camera.rotation.y;
        targetRotZ.current = camera.rotation.z;

        // Start sequence directly
        setCurrentPhase(PHASE.LOOKING_DOWN);

        // 1. SET X (Looking down at dock desk)
        targetRotX.current = CAMERA_SETTINGS.lookDownAngle;

        // 2. SET Y (Turning to center on dock paper)
        if (CAMERA_SETTINGS.forceCenterY !== null) {
            targetRotY.current = CAMERA_SETTINGS.forceCenterY;
        }

        // 3. SET Z (Tilt)
        if (CAMERA_SETTINGS.forceStraightZ !== null) {
            targetRotZ.current = CAMERA_SETTINGS.forceStraightZ;
        }

        // Phase transition
        setTimeout(() => {
            setCurrentPhase(PHASE.WRITING);
        }, 1200);
    }, [camera]);

    const handleReturnUp = useCallback(() => {
        // Return to looking out at the sea and social barrels (exact entrance perspective)
        targetRotX.current = 0;
        targetRotY.current = initialEntranceRotY.current ?? (CAMERA_SETTINGS.forceCenterY ?? -1.05);
        targetRotZ.current = 0;
        setShowSelection(true);
        setCurrentPhase(PHASE.ENTERING);
    }, []);

    // Frame Loop
    useFrame((state, delta) => {
        // Update room origin for paint shader
        updateRoomOrigin(groupRef);

        if (!hasSignaledReady.current) {
            frameCount.current++;
            if (frameCount.current >= FRAMES_TO_WAIT) {
                hasSignaledReady.current = true;
                onReady?.();
                if (!isWarmup) setTimeout(() => showTutorial('contact_submit'), 2000);
            }
        }

        // 1. Camera Animation (Simple Lerp)
        if (hasAnimatedDown.current && !isExiting && !hasExitTriggered.current) {
            const safeDelta = Math.min(delta, 0.033);
            const lerpSpeed = safeDelta * CAMERA_SETTINGS.lerpSpeed;

            camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotX.current, lerpSpeed);
            camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY.current, lerpSpeed);
            camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotZ.current, lerpSpeed);

            if (showSelection && 
                Math.abs(camera.rotation.x - targetRotX.current) < 0.005 && 
                Math.abs(camera.rotation.y - targetRotY.current) < 0.005) {
                hasAnimatedDown.current = false;
            }
        }

        // 1.5 Candle bobbing
        if (candleRef.current) {
            const time = state.clock.getElapsedTime();
            candleRef.current.position.y = 0.65 + Math.sin(time * 1.6) * 0.03;
        }

        // 2. Wave Animation
        const time = state.clock.getElapsedTime();
        waveRefs.current.forEach((ref, i) => {
            if (ref) {
                const speed = 0.8 + i * 0.15;
                const amplitude = 0.15 - i * 0.02;
                const offset = i * 0.5;
                ref.position.y = Math.sin(time * speed + offset) * amplitude;
            }
        });

        // 2.5 Ship Animation (bobbing with waves and sailing)
        if (statekRef.current) {
            const bobSpeed = 0.8;
            const bobAmplitude = 0.3;
            statekRef.current.position.y = STATEK_SETTINGS.position[1] + Math.sin(time * bobSpeed) * bobAmplitude;

            const sailSpeed = 0.04;
            const sailAmplitude = 12;
            statekRef.current.position.x = STATEK_SETTINGS.position[0] + Math.sin(time * sailSpeed) * sailAmplitude;

            const rollAmplitude = 0.05;
            statekRef.current.rotation.z = Math.sin(time * bobSpeed * 1.2) * rollAmplitude;
        }
    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1000); // 1000px breakpoint to catch tablets/phones
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <group ref={groupRef} position={[0, -0.7, -5]}>
            {!isWarmup && (
                <PositionalAudio
                    ref={audioRef}
                    url="/sounds/szummorza.mp3"
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay={false}
                    volume={effectiveVolume}
                />
            )}
            {/* ☁️ CLOUDS */}
            <GalleryClouds count={45} seed={88} rotationOffset={[0, 1, 0]} />

            {/* 📜 CONTACT INTRODUCTION SCROLL (Elevated above all barrels to prevent overlap) */}
            {showSelection && (
                <group position={[0, isMobile ? 3.3 : 3.85, isMobile ? -6.8 : -7.5]}>
                    <mesh
                        onClick={handleMailSelect}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                    >
                        <planeGeometry args={[isMobile ? 3.4 : 4.4, isMobile ? 1.7 : 2.2]} />
                        <meshBasicMaterial
                            map={introScrollTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            onBeforeCompile={onBeforeCompile}
                        />
                    </mesh>
                </group>
            )}

            {/* 🏝️ HORIZON SEASCAPE & ROLLING WAVES */}
            <ContactSeascapeHorizon />

            {/* 🌊 OCEAN WAVE LAYERS */}
            <group position={[0, -1, -8]}>
                {Array.from({ length: WAVE_LAYERS }).map((_, i) => (
                    <mesh
                        key={i}
                        ref={el => waveRefs.current[i] = el}
                        position={[0, -i * 0.1, -i * 8]}
                        rotation={[-Math.PI / 2.5, 0, 0]}
                    >
                        <planeGeometry args={[80, 30]} />
                        <meshBasicMaterial
                            map={seaTexture}
                            color="#ffffff"
                            transparent={true}
                            opacity={1 - i * 0.1}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                            onBeforeCompile={onBeforeCompile}
                        />
                    </mesh>
                ))}
            </group>

            {/* 🛢️ 5 FUNCTIONAL SOCIAL BARRELS WITH UNIFORM WHITE CORRESPONDENCE CARDS */}
            {SOCIAL_DESTINATIONS.map((soc) => (
                <SocialBarrel
                    key={soc.id}
                    position={isMobile ? soc.mobilePos : soc.desktopPos}
                    rotation={soc.rotation}
                    texturePath="/textures/contact/beczka.webp"
                    artifactTexturePath={soc.artifactTexturePath}
                    label={soc.label}
                    onClick={() => window.open(soc.url, '_blank', 'noopener,noreferrer')}
                    paintOnBeforeCompile={onBeforeCompile}
                    paintUniforms={uniformsData}
                />
            ))}

            {/* ✍️ WRITE A NOTE BARREL (Front right/center with matching white card) */}
            <SocialBarrel
                position={isMobile ? [0, -0.7, -6.2] : [1.8, -0.65, -6.8]}
                rotation={[0, -0.08, 0]}
                texturePath="/textures/contact/beczka.webp"
                artifactTexturePath="/textures/contact/artifact_write_note.webp"
                label="LEAVE A NOTE"
                onClick={handleMailSelect}
                paintOnBeforeCompile={onBeforeCompile}
                paintUniforms={uniformsData}
            />

            {/* 🏖️ DOCK / MOLO */}
            <mesh
                position={[0, 0.05, 1.8]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[2.5, 7]} />
                <meshBasicMaterial
                    map={moloTexture}
                    color="#e0e0e0"
                    roughness={0.8}
                    side={THREE.DoubleSide}
                    transparent
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* 🗼 LIGHTHOUSE */}
            <mesh
                position={LATARNIA_SETTINGS.position}
                rotation={LATARNIA_SETTINGS.rotation}
            >
                <planeGeometry args={LATARNIA_SETTINGS.scale} />
                <meshBasicMaterial
                    color="#e0e0e0"
                    map={latarniaTexture}
                    transparent
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* 🚢 SHIP */}
            <mesh
                ref={statekRef}
                position={STATEK_SETTINGS.position}
                rotation={STATEK_SETTINGS.rotation}
            >
                <planeGeometry args={STATEK_SETTINGS.scale} />
                <meshBasicMaterial
                    color="#e0e0e0"
                    map={statekTexture}
                    transparent
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* 📜 INTERACTIVE MESSAGE PAPER & ENCHANTED DESK */}
            <group visible={!showSelection}>
                {/* Hand-drawn quill and ink bottle */}
                <mesh
                    position={[1.05, 0.14, 1.95]}
                    rotation={[-Math.PI / 2.3, 0, 0.12]}
                >
                    <planeGeometry args={[0.55, 0.55]} />
                    <meshBasicMaterial
                        map={quillInkTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Hand-drawn envelope with red wax seal */}
                <mesh
                    position={[-1.02, 0.10, 2.15]}
                    rotation={[-Math.PI / 2, 0, -0.18]}
                >
                    <planeGeometry args={[0.55, 0.55]} />
                    <meshBasicMaterial
                        map={envelopeWaxTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Tiny Floating Candle */}
                <group position={[-0.92, 0.65, 1.35]}>
                    <mesh ref={candleRef}>
                        <planeGeometry args={[0.35, 0.7]} />
                        <meshBasicMaterial
                            map={candleTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <pointLight
                        position={[0, 0.15, 0.05]}
                        color="#ffe4b5"
                        intensity={0.6}
                        distance={3}
                    />
                </group>

                {/* Floating Stars around correspondence desk */}
                <FloatingStars count={12} />

                {/* Interactive Message Paper with 4 fields, wax seal button, and return trigger */}
                <MessagePaper
                    position={[0, 0.07, 2]}
                    onClose={handleReturnUp}
                    onSend={(data) => {
                        unlockAchievement('contact_submit');
                    }}
                />
            </group>
        </group>
    );
};

export default ContactRoom;
