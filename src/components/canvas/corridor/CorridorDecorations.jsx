import { useMemo, useState, useRef, useEffect } from 'react';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import '../shaders/RevealMaterial';
import { isTouchDevice } from '../../../utils/deviceDetect';
import { useAudio } from '../../../context/AudioManager';
import SteamingCoffeeCup from './SteamingCoffeeCup';
import SecretDoor404 from './SecretDoor404';
/**
 * CorridorDecorations - Corridor decorations.
 * 
 * Simple flat planes with textures - 2D drawing style in a 3D world.
 * 
 * Corridor (per segment, 80 units):
 *   Doors: relZ -18 (left), -32 (right), -48 (left), -62 (right)
 *   corridorWidth: ~3.5 per side
 *   corridorHeight: 3.5
 *   Safe decoration zones: -5 to -15, -20 to -30, -34 to -46, -50 to -60, -64 to -75
 */

// Global variables for useFrame to avoid memory allocations every frame and prevent GC stalls
const tempPos = new THREE.Vector3();
const tempRot = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempCamDir = new THREE.Vector3();
const tempEuler = new THREE.Euler();
const tempQuat = new THREE.Quaternion();


const CABIN_SKETCH_URL = '/fonts/CabinSketch-Regular.ttf';

const PictureContent = ({ imagePath, imagePaintedPath, width, height, isPainted }) => {
    const texture = useTexture(imagePath);
    // Render nothing if no painted path, but we still call the hook unconditionally to respect hook rules
    const paintedTexture = useTexture(imagePaintedPath || imagePath);

    const materialRef = useRef();

    useEffect(() => {
        if (!materialRef.current || !imagePaintedPath) return;

        if (isPainted) {
            gsap.to(materialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            gsap.to(materialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
    }, [isPainted, imagePaintedPath]);

    return (
        <group position={[0, 0, 0.01]}> {/* Slightly in front of frame */}
            {imagePaintedPath && (
                <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[width, height]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={paintedTexture}
                        transparent={true}
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            )}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[width, height]} />
                {imagePaintedPath ? (
                    <revealMaterial color="#e0e0e0"
                        ref={materialRef}
                        map={texture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                        uProgress={0.0}
                    />
                ) : (
                    <meshBasicMaterial color="#e0e0e0"
                        map={texture}
                        transparent={true}
                        alphaTest={0.1} // KEY: Fixes transparency (cuts out background)
                        side={THREE.DoubleSide}
                        roughness={0.5}
                    />
                )}
            </mesh>
        </group>
    );
};

const InspectableFrame = ({ frame, wallX, frameTexture, framePaintedTexture, CABIN_SKETCH_URL, setCameraOverride }) => {
    const { camera, viewport } = useThree();
    const { playPaper } = useAudio();
    const groupRef = useRef();
    const frameMaterialRef = useRef();
    const framePaintedRef = useRef();
    const compileFramesRef = useRef(0);
    const hideDelayRef = useRef();

    // Save original position and rotation on the wall
    const originalPos = useMemo(() => new THREE.Vector3(
        frame.side === 'left' ? -wallX + (frame.offsetFromWall || 0) : wallX - (frame.offsetFromWall || 0),
        frame.y,
        frame.z
    ), [frame, wallX]);

    const originalRot = useMemo(() => new THREE.Euler(
        0, frame.side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0
    ), [frame.side]);

    const [isHovered, setIsHovered] = useState(false);
    const [isInspected, setIsInspected] = useState(false);

    // Check if touch device (phone/tablet) to completely disable hover effect and boost performance
    const isTouch = useMemo(() => isTouchDevice(), []);
    // Also keep fallback mechanism to disconnect inspect on extremely narrow screens
    const isMobile = viewport.width < 5 || viewport.aspect < 0.8 || isTouch;

    // When component unmounts, disable override just in case
    useEffect(() => {
        return () => {
            if (isInspected) {
                if (setCameraOverride) setCameraOverride(false);
                window.dispatchEvent(new CustomEvent('inspectChange', { detail: false }));
            }
        };
    }, [isInspected, setCameraOverride]);

    useEffect(() => {
        if (isHovered && !isMobile) document.body.style.cursor = 'pointer';
        else document.body.style.cursor = 'auto';
    }, [isHovered, isMobile]);

    useEffect(() => {
        if (!frameMaterialRef.current) return;

        const shouldBePainted = isHovered || isInspected;

        if (shouldBePainted) {
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (framePaintedRef.current) framePaintedRef.current.visible = true;

            gsap.to(frameMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            gsap.to(frameMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });

            hideDelayRef.current = gsap.delayedCall(0.55, () => {
                if (framePaintedRef.current) framePaintedRef.current.visible = false;
            });
        }

        return () => {
            if (hideDelayRef.current) hideDelayRef.current.kill();
        };
    }, [isHovered, isInspected]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (compileFramesRef.current < 2) {
            compileFramesRef.current++;
            if (compileFramesRef.current === 2) {
                if (!isHovered && !isInspected && framePaintedRef.current) {
                    framePaintedRef.current.visible = false;
                }
            }
        }

        if (isInspected) {
            // Position in front of camera (closer)
            camera.getWorldDirection(tempCamDir);

            // Calculate fluid responsive distance
            // When aspect ratio (width/height) is smaller (narrow screens e.g. laptops max 1.3), push image further away (e.g. 2.2)
            // When aspect ratio is large (ultrawide, 16:9 ~ 1.77), bring image closer (e.g. 1.5)
            // clamp(1.5, 2.8)
            const baseDistance = 1.3;
            // The smaller the aspect ratio (narrower screen), the greater the distance
            const aspectOffset = Math.max(0, 1.8 - viewport.aspect) * 1.5;
            const distance = Math.min(2.8, Math.max(1.5, baseDistance + aspectOffset));

            // Point right in front of camera (dynamically scaled - larger value = further away)
            tempPos.copy(camera.position).add(tempCamDir.multiplyScalar(distance));

            // Rotation facing the image directly towards camera
            tempRot.copy(camera.quaternion);

            // 3D Card tilt effect based on pointer
            const tiltX = -state.pointer.y * 0.3;
            const tiltY = state.pointer.x * 0.3;
            tempEuler.set(tiltX, tiltY, 0);
            tempQuat.setFromEuler(tempEuler);

            tempRot.multiply(tempQuat);

            // Slightly scale up image for detail
            tempScale.set(1.2, 1.2, 1.2);
        } else {
            // Return to wall
            tempPos.copy(originalPos);
            tempRot.setFromEuler(originalRot);
            tempScale.set(1, 1, 1);
        }

        // Smooth interpolation (lerp/slerp) in every render frame
        const factor = delta * 6;
        groupRef.current.position.lerp(tempPos, factor);
        groupRef.current.quaternion.slerp(tempRot, factor);
        groupRef.current.scale.lerp(tempScale, factor);
    });

    return (
        <group
            ref={groupRef}
            position={originalPos}
            rotation={originalRot}
        >
            {/* INVISIBLE HITBOX to catch pointer events smoothly and prevent raycaster from jumping between meshes */}
            <mesh
                position={[0, 0, 0.05]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) return; // Completely disable on mobile
                    setIsInspected((prev) => {
                        const next = !prev;
                        if (setCameraOverride) setCameraOverride(next); // Lock / unlock camera movement
                        window.dispatchEvent(new CustomEvent('inspectChange', { detail: next }));
                        playPaper(0.85); // Crisp sketchbook tactile paper sound
                        return next;
                    });
                    setIsHovered(false);
                }}
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    if (!isInspected && !isMobile) {
                        setIsHovered(true);
                    }
                }}
                onPointerLeave={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                }}
            >
                <planeGeometry args={[frame.width, frame.height]} />
                <meshBasicMaterial color="#e0e0e0" transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* PAINTED FRAME (behind sketch) */}
            {!isTouch && (
                <mesh ref={framePaintedRef} position={[0, 0, -0.001]} scale={[0.98, 0.98, 1]}>
                    <planeGeometry args={[frame.width, frame.height]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={framePaintedTexture}
                        transparent={true}
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            )}

            {/* SKETCH FRAME OVERLAY (front) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[frame.width, frame.height]} />
                <revealMaterial color="#e0e0e0"
                    ref={frameMaterialRef}
                    map={frameTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    roughness={0.9}
                    uProgress={0.0}
                />
            </mesh>

            {/* INNER IMAGE */}
            {frame.image && (
                <PictureContent
                    imagePath={frame.image}
                    imagePaintedPath={!isTouch ? frame.imagePainted : null}
                    width={frame.imageWidth || frame.width * 0.7}
                    height={frame.imageHeight || frame.height * 0.7}
                    isPainted={isHovered || isInspected}
                />
            )}

            {/* PODPIS */}
            {frame.signature && (
                <Text
                    position={[
                        frame.signatureX !== undefined ? frame.signatureX : (frame.width / 2 - 0.1),
                        frame.signatureY !== undefined ? frame.signatureY : (-frame.height / 2 + 0.15),
                        0.02
                    ]}
                    fontSize={frame.signatureSize || 0.12}
                    font={CABIN_SKETCH_URL}
                    color={frame.signatureColor || "#333333"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {frame.signature}
                </Text>
            )}
        </group>
    );
};

/**
 * CelestialWallSymbol Component
 * Interactive celestial/alchemical marking that fills with vibrant colours on hover.
 */
const CelestialWallSymbol = ({ sym, idx, wallX, sketchTexture, paintedTexture }) => {
    const isLeft = sym.side === 'left';
    const xPos = isLeft ? -wallX + 0.015 : wallX - 0.015;
    const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

    const [isHovered, setIsHovered] = useState(false);
    const paintedMatRef = useRef();
    const sketchMatRef = useRef();
    const groupRef = useRef();

    useEffect(() => {
        if (!paintedMatRef.current || !sketchMatRef.current) return;

        if (isHovered) {
            // Fills inside with authentic golden brass and warm parchment
            gsap.to(paintedMatRef.current, {
                opacity: 1.0,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true
            });
            gsap.to(sketchMatRef.current, {
                opacity: 0.0,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            // Fade back to calm wall sketch
            gsap.to(paintedMatRef.current, {
                opacity: 0.0,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true
            });
            gsap.to(sketchMatRef.current, {
                opacity: 0.42,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true
            });
        }
    }, [isHovered]);

    useEffect(() => {
        return () => {
            if (isHovered) {
                document.body.style.cursor = 'auto';
            }
        };
    }, [isHovered]);

    return (
        <group
            ref={groupRef}
            position={[xPos, sym.y, sym.z]}
            rotation={[0, rotY, 0]}
        >
            {/* INVISIBLE HITBOX to catch pointer events smoothly */}
            <mesh
                position={[0, 0, 0.01]}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setIsHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                    document.body.style.cursor = 'auto';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (groupRef.current) {
                        gsap.to(groupRef.current.rotation, {
                            z: `+=${Math.PI / 3}`, // 60-degree astrological dial step
                            duration: 0.6,
                            ease: 'back.out(1.7)'
                        });
                    }
                }}
            >
                <planeGeometry args={[sym.scale * 1.05, sym.scale * 1.05]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* PAINTED VERSION (Filled with rich magical colours) */}
            <mesh position={[0, 0, 0.002]}>
                <planeGeometry args={[sym.scale, sym.scale]} />
                <meshBasicMaterial
                    ref={paintedMatRef}
                    map={paintedTexture}
                    transparent={true}
                    opacity={0.0}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* ORIGINAL SKETCH LINEWORK */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[sym.scale, sym.scale]} />
                <meshBasicMaterial
                    ref={sketchMatRef}
                    map={sketchTexture}
                    transparent={true}
                    opacity={0.42}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

const CorridorDecorations = ({ segmentLength, zOffset, corridorWidth = 4, corridorHeight = 3.5, zClip = 100000, setCameraOverride }) => {

    const wallX = corridorWidth / 2 - 0.01;
    const floorY = -corridorHeight / 2;
    const ceilingY = corridorHeight / 2;

    // =============================================
    // DECORATION TEXTURES
    // =============================================
    const frameTexture = useTexture('/textures/corridor/ramkanazdjecieduza.webp');
    const framePaintedTexture = useTexture('/textures/corridor/ramkanazdjecieduza_painted.webp');
    const standingFrameTexture = useTexture('/textures/corridor/ramkanazdjeciemala.webp');
    const treeTexture = useTexture('/textures/corridor/drzewkowdoniczce.webp');
    const grateTexture = useTexture('/textures/corridor/kratkawentylacyjna.webp');
    const flowerTexture = useTexture('/textures/corridor/kwiatekwdoniczce.webp');

    // === MAGICAL ACADEMY TEXTURES ===
    const quotePlaqueTexture = useTexture('/textures/corridor/magical/quote_plaque.webp');
    const lanternTexture = useTexture('/textures/corridor/magical/lantern_sketch.webp');
    const magicalSymbolsTexture = useTexture('/textures/corridor/magical/magical_symbols.webp');
    const magicalSymbolsPaintedTexture = useTexture('/textures/corridor/magical/magical_symbols_painted.webp');
    const magicBooksTexture = useTexture('/textures/corridor/magical/magic_books.webp');

    // --- Ceiling Lights (light points) ---
    // Lamp textures
    const lampGrilleTexture = useTexture('/textures/corridor/kratanalampy.webp');
    // lampGrilleTexture.wrapS = lampGrilleTexture.wrapT = THREE.RepeatWrapping; 
    // lampGrilleTexture.repeat.set(1, 1);

    const lampSideTexture = useTexture('/textures/corridor/bokilampy.webp');
    lampSideTexture.wrapS = lampSideTexture.wrapT = THREE.RepeatWrapping;
    // UV mapping for long side
    lampSideTexture.repeat.set(1, 1);

    const lights = useMemo(() => {
        const items = [];
        // ===== LIGHT ADJUSTMENT =====
        const LIGHT_SPACING = 15;      // Distance between lamps
        const LIGHT_START_OFFSET = -5;  // Start with offset from beginning (previous segment doors are there)

        const startZ = zOffset + LIGHT_START_OFFSET;
        const endZ = zOffset - segmentLength + 10; // Margin from end (SegmentDoors is at -75)

        for (let z = startZ; z > endZ; z -= LIGHT_SPACING) {
            items.push({ z });
        }
        return items;
    }, [segmentLength, zOffset]);

    // =============================================
    // PICTURE FRAMES
    // =============================================
    // Flat planes on walls with frame texture.
    // Posters/pictures can be added inside the frame later.
    //
    // MANUAL ADJUSTMENT SETTINGS:
    // - z: Z position (along corridor axis), calculated as zOffset - value
    // - side: 'left' or 'right'
    // - width/height: frame dimensions
    // - y: Y position (height on wall, 0 = center)
    const frames = useMemo(() => [
        {
            z: zOffset - 9,          // Between start and Door 1 (Right wall)
            side: 'right',
            width: 2.5,              // Frame width
            height: 2.5 / 1.785,     // Legacy ratio 3200x1792
            y: 0.3,                  // Height on wall
            id: 'frame-1',
            image: '/textures/corridor/hp_hogwarts_scene.webp',
            imagePainted: '/textures/corridor/hp_hogwarts_scene_painted.webp',
            imageWidth: 2.08,
            imageHeight: 1.01,
            offsetFromWall: 0.1,
        },
        {
            z: zOffset - 21,         // Between Door 1 and Door 3 (Left wall)
            side: 'left',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.2,
            id: 'frame-2',
            image: '/textures/corridor/hp_patronus_spell.webp',
            imagePainted: '/textures/corridor/hp_patronus_spell_painted.webp',
            imageWidth: 2.08,
            imageHeight: 1.01,
            offsetFromWall: 0.1
        },
        {
            z: zOffset - 44,         // Between Door 2 and Door 4 (Right wall)
            side: 'right',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.25,
            id: 'frame-3',
            signature: "“The only way to do great work\nis to love what you do.”\n— Steve Jobs",
            signatureX: 0,
            signatureY: 0,
            signatureSize: 0.10,
            signatureColor: '#2b2b2b'
        },
        {
            z: zOffset - 51,         // Opposite Door 4 (Left wall)
            side: 'left',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.35,
            id: 'frame-4',
            signature: "“Art is not what you see,\nbut what you make others see.”\n— Edgar Degas",
            signatureX: 0,
            signatureY: 0,
            signatureSize: 0.10,
            signatureColor: '#833c46'
        },
    ], [zOffset]);

    // =============================================
    // TABLE
    // =============================================
    const woodTexture = useTexture('/textures/corridor/texturadrewnadonozekbiurka.webp');
    const tableTopTexture = useTexture('/textures/corridor/gorastolika.webp');

    // Cabinet textures
    const cabinetFrontTexture = useTexture('/textures/corridor/szafkaprzod.webp');
    const cabinetRestTexture = useTexture('/textures/corridor/szafkaprzodgora.webp');

    // Clone texture for legs to rotate it
    const legTexture = useMemo(() => {
        const tex = woodTexture.clone();
        tex.rotation = Math.PI / 2;
        tex.center.set(0.5, 0.5);
        return tex;
    }, [woodTexture]);

    // Table configuration
    // Rotated 90 deg and placed against left wall (between Door 1 and Door 3)
    const tableConfig = useMemo(() => ({
        z: zOffset - 31,          // Z position (area between Door 1 and Door 3)
        width: 2.0,               // Tabletop width (after rotation: along wall)
        depth: 0.8,               // Tabletop depth (after rotation: from wall into corridor)
        height: 1.0,              // Total height
        legRadius: 0.08,          // Leg thickness
        topThickness: 0.08,       // Tabletop thickness
        x: -wallX + 0.42,         // Next to left wall (depth/2 + small gap)
    }), [zOffset, wallX]);

    return (
        <group>
            {/* === CEILING LAMPS === */}
            {lights.filter(light => light.z <= zClip).map((light, i) => {
                // Texture configuration inside loop (ensure correct wrapping)
                lampGrilleTexture.wrapS = lampGrilleTexture.wrapT = THREE.ClampToEdgeWrapping;
                lampSideTexture.wrapS = lampSideTexture.wrapT = THREE.ClampToEdgeWrapping; // Clamp sides too to prevent stripes/seams

                return (
                    <group key={`light-${i}`} position={[0, ceilingY, light.z]}>
                        {/* Lamp housing - elongated 3D rectangle */}
                        {/* MAIN BODY */}
                        <mesh position={[0, -0.03, 0]}>
                            <boxGeometry args={[2.0, 0.06, 0.5]} />

                            {/* Short sides (Right/Left) */}
                            <meshBasicMaterial attach="material-0" color="#e8e8e8" roughness={0.6} />
                            <meshBasicMaterial attach="material-1" color="#e8e8e8" roughness={0.6} />

                            {/* Top (Hidden) */}
                            <meshBasicMaterial attach="material-2" color="#d0d0d0" roughness={0.8} />

                            {/* Bottom - Grille Texture 
                                We use transparency to reveal the internal light.
                                The grille itself is dark/metallic.
                            */}
                            <meshBasicMaterial
                                attach="material-3"
                                map={lampGrilleTexture}
                                transparent={true}
                                alphaTest={0.1}
                                side={THREE.DoubleSide}
                                color="#e0e0e0"
                                roughness={0.5}
                            />

                            {/* Long sides (Front/Back) - Side Texture */}
                            <meshBasicMaterial color="#e0e0e0" attach="material-4" map={lampSideTexture} roughness={0.6} />
                            <meshBasicMaterial color="#e0e0e0" attach="material-5" map={lampSideTexture} roughness={0.6} />
                        </mesh>

                        {/* INNER LIGHT (LIGHT PANEL) 
                            Sits HIGHER inside housing so the grille underneath remains visible.
                        */}
                        <mesh
                            position={[0, -0.059, 0]}
                            rotation={[-Math.PI / 2, 0, 0]}
                        >
                            <planeGeometry args={[1.9, 0.4]} />
                            <meshBasicMaterial
                                color="#ffffff"
                                toneMapped={false}
                                side={THREE.DoubleSide}
                            />
                        </mesh>

                        {/* REAL LIGHT SOURCE (PointLight) - DISABLED */}
                        {/* <pointLight
                            position={[0, -1.5, 0]}
                            distance={6}
                            intensity={0.8}
                            color="#ffffff"
                            decay={2}
                        /> */}
                    </group>
                );
            })}

            {/* === TABLE (rotated 90 deg, next to left wall) === */}
            <group position={[tableConfig.x, floorY, tableConfig.z]} rotation={[0, Math.PI / 2, 0]}>
                {/* Table legs */}
                {[
                    [-tableConfig.width / 2 + 0.1, -tableConfig.depth / 2 + 0.1],
                    [tableConfig.width / 2 - 0.1, -tableConfig.depth / 2 + 0.1],
                    [-tableConfig.width / 2 + 0.1, tableConfig.depth / 2 - 0.1],
                    [tableConfig.width / 2 - 0.1, tableConfig.depth / 2 - 0.1],
                ].map((pos, i) => (
                    <mesh key={`leg-${i}`} position={[pos[0], tableConfig.height / 2, pos[1]]}>
                        <boxGeometry args={[tableConfig.legRadius * 2, tableConfig.height, tableConfig.legRadius * 2]} />
                        <meshBasicMaterial color="#e0e0e0" map={legTexture} roughness={0.8} />
                    </mesh>
                ))}

                {/* Tabletop */}
                <mesh position={[0, tableConfig.height + tableConfig.topThickness / 2, 0]}>
                    <boxGeometry args={[tableConfig.width, tableConfig.topThickness, tableConfig.depth]} />
                    <meshBasicMaterial color="#e0e0e0" attach="material-0" map={woodTexture} /> {/* Right */}
                    <meshBasicMaterial color="#e0e0e0" attach="material-1" map={woodTexture} /> {/* Left */}
                    <meshBasicMaterial color="#e0e0e0" attach="material-2" map={tableTopTexture} roughness={0.5} /> {/* Top */}
                    <meshBasicMaterial attach="material-3" color="#e0e0e0" />   {/* Bottom */}
                    <meshBasicMaterial color="#e0e0e0" attach="material-4" map={woodTexture} /> {/* Front */}
                    <meshBasicMaterial color="#e0e0e0" attach="material-5" map={woodTexture} /> {/* Back */}
                </mesh>

                {/* FLOWER ON TABLE */}
                <mesh
                    position={[0.3, tableConfig.height + tableConfig.topThickness + 0.2, 0]} // On tabletop
                    rotation={[0, -Math.PI / 4, 0]} // Slight rotation
                >
                    <planeGeometry args={[0.3, 0.3 / 0.758]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={flowerTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        roughness={0.8}
                    />
                </mesh>

                {/* MAGICAL BOOKS & QUILL ON TABLE */}
                <mesh
                    position={[-0.32, tableConfig.height + tableConfig.topThickness + 0.26, 0.05]}
                    rotation={[0, Math.PI / 6, 0]}
                >
                    <planeGeometry args={[0.65, 0.65]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={magicBooksTexture}
                        transparent={true}
                        alphaTest={0.08}
                        side={THREE.DoubleSide}
                        roughness={0.8}
                    />
                </mesh>

                {/* ☕ INTERACTIVE STEAMING COFFEE CUP (Click for steam & dev quotes) */}
                <SteamingCoffeeCup
                    position={[0.02, tableConfig.height + tableConfig.topThickness + 0.16, 0.02]}
                    scale={0.34}
                />
            </group>

            {/* === CORRIDOR QUOTE PLAQUE === */}
            {/* "Somewhere between imagination and invention, magic happens." */}
            <group position={[wallX - 0.02, 0.45, zOffset - 17]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[2.5, 2.5 * (420 / 1024) + 0.06]} />
                    <meshBasicMaterial color="#d49b43" transparent opacity={0.15} depthWrite={false} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[2.4, 2.4 * (420 / 1024)]} />
                    <meshBasicMaterial
                        map={quotePlaqueTexture}
                        transparent={true}
                        alphaTest={0.08}
                        side={THREE.DoubleSide}
                        roughness={0.85}
                    />
                </mesh>
            </group>

            {/* 🚪 SECRET 404 DOOR (Easter Egg on Baseboard) */}
            <SecretDoor404
                position={[wallX - 0.02, floorY + 0.38, zOffset - 24]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={0.55}
            />

            {/* === OLD-FASHIONED WALL LANTERNS === */}
            {[
                { z: zOffset - 8, side: 'left' },
                { z: zOffset - 22, side: 'right' },
                { z: zOffset - 34, side: 'left' },
                { z: zOffset - 46, side: 'right' },
                { z: zOffset - 58, side: 'left' },
                { z: zOffset - 68, side: 'right' }
            ].map((lantern, idx) => {
                const isLeft = lantern.side === 'left';
                const xPos = isLeft ? -wallX + 0.15 : wallX - 0.15;
                const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

                return (
                    <group key={`lantern-${idx}`} position={[xPos, 0.55, lantern.z]} rotation={[0, rotY, 0]}>
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[0.55, 1.1]} />
                            <meshBasicMaterial
                                map={lanternTexture}
                                transparent={true}
                                alphaTest={0.08}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                        <mesh position={[0, -0.08, -0.02]}>
                            <circleGeometry args={[0.35, 16]} />
                            <meshBasicMaterial
                                color="#f5ba48"
                                transparent={true}
                                opacity={0.28}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    </group>
                );
            })}

            {/* === CELESTIAL & ALCHEMICAL WALL MARKINGS === */}
            {[
                { z: zOffset - 22, side: 'left', y: 0.25, scale: 1.5 },
                { z: zOffset - 38, side: 'right', y: 0.35, scale: 1.6 },
                { z: zOffset - 64, side: 'right', y: 0.3, scale: 1.7 }
            ].map((sym, idx) => (
                <CelestialWallSymbol
                    key={`sym-${idx}`}
                    sym={sym}
                    idx={idx}
                    wallX={wallX}
                    sketchTexture={magicalSymbolsTexture}
                    paintedTexture={magicalSymbolsPaintedTexture}
                />
            ))}

            {/* =============================================
                PICTURE FRAMES ON WALLS
                =============================================
                Each frame is a flat plane with photo frame texture.
                Attached to walls alternately (left/right).
                
                To change the position/size of a specific frame,
                edit the corresponding object in the 'frames' array above.
            */}
            {frames.map((frame) => (
                <InspectableFrame
                    key={frame.id}
                    frame={frame}
                    wallX={wallX}
                    frameTexture={frameTexture}
                    framePaintedTexture={framePaintedTexture}
                    CABIN_SKETCH_URL={CABIN_SKETCH_URL}
                    setCameraOverride={setCameraOverride}
                />
            ))}

            {/* === CABINET === */}
            <mesh
                position={[wallX - 0.26, floorY + 0.5, zOffset - 56]}
            >
                <boxGeometry args={[0.5, 1.0, 1.0 * 0.8]} />
                <meshBasicMaterial color="#e0e0e0" attach="material-0" map={cabinetRestTexture} />
                <meshBasicMaterial color="#e0e0e0" attach="material-1" map={cabinetFrontTexture} />
                <meshBasicMaterial color="#e0e0e0" attach="material-2" map={cabinetRestTexture} />
                <meshBasicMaterial color="#e0e0e0" attach="material-3" map={cabinetRestTexture} />
                <meshBasicMaterial color="#e0e0e0" attach="material-4" map={cabinetRestTexture} />
                <meshBasicMaterial color="#e0e0e0" attach="material-5" map={cabinetRestTexture} />
            </mesh>

            {/* === STANDING FRAME ON CABINET === */}
            <mesh
                position={[wallX - 0.26, floorY + 1.0 + 0.2, zOffset - 56]}
                rotation={[0, -Math.PI / 2 + 0.2, 0]}
            >
                <planeGeometry args={[0.3, 0.3 / 0.777]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={standingFrameTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    roughness={0.8}
                />
            </mesh>

            {/* === POTTED TREE === */}
            <mesh
                position={[wallX - 0.8, floorY + 1.5, zOffset - 69]} // Right side near end doors
                rotation={[0, -Math.PI / 4, 0]}
            >
                <planeGeometry args={[1.8, 1.8 / 0.602]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={treeTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    roughness={0.8}
                />
            </mesh>

            {/* === VENTILATION GRATES === */}
            {/* Generate grate on opposite wall for each painting */}
            {frames.map((frame, i) => {
                const isFrameLeft = frame.side === 'left';
                const grateSide = isFrameLeft ? 'right' : 'left';

                return (
                    <mesh
                        key={`grate-${i}`}
                        position={[
                            grateSide === 'left' ? -wallX + 0.01 : wallX - 0.01,
                            ceilingY - 0.6, // High up, matching the first one
                            frame.z // Same Z position as painting
                        ]}
                        rotation={[0, grateSide === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}
                    >
                        <planeGeometry args={[0.8, 0.8 / 1.968]} />
                        <meshBasicMaterial color="#e0e0e0"
                            map={grateTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            roughness={0.8}
                        />
                    </mesh>
                );
            })}

        </group >
    );
};

export default CorridorDecorations;
