import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Single Floating Candle with gentle idle sway and warm illustrated flicker.
 */
const SingleCandle = ({
    position = [0, 0, 0],
    scale = 0.45,
    floatSpeed = 0.8,
    floatRange = 0.08,
    timeOffset = 0,
    candleTexture
}) => {
    const groupRef = useRef();
    const flameRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime + timeOffset;

        // Gentle floating hover
        const yOffset = Math.sin(t * floatSpeed) * floatRange;
        const tiltX = Math.sin(t * (floatSpeed * 0.7)) * 0.04;
        const tiltZ = Math.cos(t * (floatSpeed * 0.5)) * 0.05;

        groupRef.current.position.y = position[1] + yOffset;
        groupRef.current.rotation.x = tiltX;
        groupRef.current.rotation.z = tiltZ;

        // Subtle illustrated candle flame flicker (modulate scale and opacity gently)
        if (flameRef.current) {
            const flicker = 1 + Math.sin(t * 12) * 0.05 + Math.cos(t * 7) * 0.03;
            flameRef.current.scale.set(flicker, flicker, 1);
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], position[2]]}>
            {/* Candle Mesh (2D sketch plane in 3D world, facing corridor camera) */}
            <mesh scale={[scale * 0.5, scale, 1]}>
                <planeGeometry args={[1, 2]} />
                <meshBasicMaterial
                    map={candleTexture}
                    transparent={true}
                    alphaTest={0.08}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Subtle soft amber glow halo behind flame */}
            <mesh ref={flameRef} position={[0, scale * 0.45, -0.01]}>
                <circleGeometry args={[scale * 0.55, 16]} />
                <meshBasicMaterial
                    color="#f5ba48"
                    transparent={true}
                    opacity={0.22}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Inner warm golden core */}
            <mesh position={[0, scale * 0.45, -0.005]}>
                <circleGeometry args={[scale * 0.25, 16]} />
                <meshBasicMaterial
                    color="#fff3d1"
                    transparent={true}
                    opacity={0.35}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

/**
 * FloatingCandles Component
 * 
 * Scattered thoughtfully along the corridor in the hand-drawn sketch style.
 * Floating near archways, the archive table, and mysterious alcoves.
 */
const FloatingCandles = ({ zOffset = 0 }) => {
    const candleTexture = useTexture('/textures/corridor/magical/candle_sketch.webp');

    // Positions for candles in this segment (relative to segment start zOffset)
    const candlePositions = useMemo(() => [
        // Near start/avatar area
        { pos: [-1.6, 0.9, zOffset - 5], scale: 0.42, speed: 0.7, offset: 0.5 },
        { pos: [1.7, 1.2, zOffset - 7], scale: 0.38, speed: 0.85, offset: 2.1 },
        
        // Between Door 1 (MY BUILDS) and Door 2 (MY LAB)
        { pos: [1.8, 0.7, zOffset - 20], scale: 0.45, speed: 0.65, offset: 1.2 },
        { pos: [1.4, 1.3, zOffset - 22], scale: 0.36, speed: 0.9, offset: 3.4 },

        // Near the Archive Table (zOffset - 39)
        { pos: [1.5, 0.4, zOffset - 37], scale: 0.40, speed: 0.6, offset: 4.1 },
        { pos: [1.8, 1.0, zOffset - 40], scale: 0.46, speed: 0.75, offset: 0.8 },

        // Near Door 4 (SAY HI) and Door 5 (WISPR FLOW)
        { pos: [-1.7, 1.1, zOffset - 58], scale: 0.42, speed: 0.8, offset: 2.7 },
        { pos: [1.6, 0.8, zOffset - 66], scale: 0.44, speed: 0.7, offset: 1.9 },
    ], [zOffset]);

    return (
        <group>
            {candlePositions.map((c, i) => (
                <SingleCandle
                    key={`candle-${i}`}
                    position={c.pos}
                    scale={c.scale}
                    floatSpeed={c.speed}
                    timeOffset={c.offset}
                    candleTexture={candleTexture}
                />
            ))}
        </group>
    );
};

export default FloatingCandles;
