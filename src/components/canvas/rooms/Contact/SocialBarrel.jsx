import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import '../../shaders/RevealMaterial';
import { isTouchDevice } from '../../../../utils/deviceDetect';

// Reusable Vector3 to avoid allocations in useFrame
const _tempScale = new THREE.Vector3();

const SocialBarrel = ({
    position,
    rotation = [0, 0, 0],
    texturePath = '/textures/contact/beczka.webp',
    artifactTexturePath = null,
    label,
    sublabel,
    onClick,
    scale = [2.12, 2.3],
    paintOnBeforeCompile,
    paintUniforms
}) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const paintedRef = useRef();
    const hideDelayRef = useRef();

    // Load texture based on prop. 
    const texture = useTexture(texturePath);
    // Determine the painted texture path from the base texture path
    const isTouch = isTouchDevice();
    const paintedTexturePath = isTouch ? texturePath : texturePath.replace('.png', '_painted.png').replace('.webp', '_painted.webp');
    const texturePainted = useTexture(paintedTexturePath);
    const artifactTexture = artifactTexturePath ? useTexture(artifactTexturePath) : null;
    const textRef = useRef();

    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();

            // Synced with sea waves (speed ~0.8, amp ~0.15)
            // Added random phase offset based on x position to prevent them continuously bobbing in perfect unison
            const phaseOffset = position[0] * 0.5;
            meshRef.current.position.y = position[1] + Math.sin(time * 0.8 + phaseOffset) * 0.15;

            // Horizontal drift (gentle left/right)
            meshRef.current.position.x = position[0] + Math.sin(time * 0.4 + phaseOffset) * 0.2;

            // Gentle rotation drift
            meshRef.current.rotation.z = rotation[2] + Math.sin(time * 0.6 + phaseOffset) * 0.05;

            // Hover scale
            const targetScale = hovered ? 1.1 : 1;
            // Apply base scale * hover factor
            meshRef.current.scale.lerp(_tempScale.set(targetScale, targetScale, 1), 0.1);

            // Paint Transition for Text
            if (paintUniforms && textRef.current) {
                const localPos = meshRef.current.position;
                const revealDir = new THREE.Vector3(1.0, 0.0, -0.1).normalize();
                
                const pStartDist = -5.0;
                const pEndDist = 55.0;
                const pTargetDist = THREE.MathUtils.lerp(pStartDist, pEndDist, paintUniforms.uPaintProgress.value);
                const pDistFromPlane = pTargetDist - localPos.dot(revealDir);
                
                textRef.current.fillOpacity = THREE.MathUtils.clamp(pDistFromPlane, 0, 1);
            }
        }
    });

    const handlePointerOver = () => {
        if (isTouch) return;
        document.body.style.cursor = 'pointer';
        setHovered(true);

        if (materialRef.current) {
            gsap.to(materialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }

        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) paintedRef.current.visible = true;
    };

    const handlePointerOut = () => {
        if (isTouch) return;
        document.body.style.cursor = 'auto';
        setHovered(false);

        if (materialRef.current) {
            gsap.to(materialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }

        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current) paintedRef.current.visible = false;
        });
    };

    return (
        <group
            ref={meshRef}
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* Painted Layer (Behind) */}
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible={false}>
                <planeGeometry args={scale} />
                <meshBasicMaterial color="#ffffff"
                    map={texturePainted}
                    transparent={true}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    onBeforeCompile={paintOnBeforeCompile}
                    needsUpdate={!!paintOnBeforeCompile}
                />
            </mesh>

            {/* Sketch overlay (Front) - brush-stroke discard reveals painted beneath */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={scale} />
                <revealMaterial color="#ffffff"
                    ref={materialRef}
                    map={texture}
                    transparent={true}
                    alphaTest={0.1}
                    uProgress={0.0}
                    paintUniforms={paintUniforms}
                    paintConfig={{dirX: 1.0, dirY: 0.0, dirZ: -0.1, startDist: -5.0, endDist: 55.0, noiseAxes: 'yz'}}
                />
            </mesh>

            {/* Correspondence Artifact mounted proudly above the barrel board */}
            {artifactTexture && (
                <group position={[0, scale[1] * 0.64, 0.08]} rotation={[0, 0, 0.015]}>
                    {/* Small wooden stake holding card */}
                    <mesh position={[0, -scale[1] * 0.28, -0.01]}>
                        <planeGeometry args={[0.08, scale[1] * 0.24]} />
                        <meshBasicMaterial color="#5c4838" />
                    </mesh>
                    {/* The Crisp White Card */}
                    <mesh>
                        <planeGeometry args={[scale[0] * 0.88, scale[1] * 0.54]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            map={artifactTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            onBeforeCompile={paintOnBeforeCompile}
                        />
                    </mesh>
                </group>
            )}

            {/* Clean, centered platform label on the wooden plank */}
            {label && (
                <Text
                    ref={textRef}
                    position={[0, scale[1] * 0.25, 0.05]} // Perfectly centered in wooden plank
                    rotation={[0, 0, 0.03]} // Natural tilt to match hand-drawn wooden plank
                    fontSize={scale[0] * 0.13}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#111111"
                    fillOpacity={paintUniforms ? 0 : 1}
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            )}
        </group >
    );
};

export default SocialBarrel;
