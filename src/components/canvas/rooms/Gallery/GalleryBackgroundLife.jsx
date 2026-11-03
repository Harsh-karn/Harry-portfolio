import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural hand-drawn smoke puff texture
function createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 128, 128);

    // Sketchy outer wisp
    ctx.strokeStyle = '#2d2822';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#f0ede6';

    // Bubbly cloud puff
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Internal sketchy swirls
    ctx.beginPath();
    ctx.arc(52, 54, 18, 0, Math.PI * 1.5);
    ctx.strokeStyle = '#4a4237';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(72, 70, 16, 0.5, Math.PI * 1.8);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Procedural sketch crane texture
function createCraneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = '#38332a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Vertical tower mast (truss pattern)
    const towerX = 100;
    ctx.beginPath();
    ctx.moveTo(towerX - 10, 250);
    ctx.lineTo(towerX - 10, 60);
    ctx.moveTo(towerX + 10, 250);
    ctx.lineTo(towerX + 10, 60);
    // Cross bracing
    for (let y = 240; y > 70; y -= 24) {
        ctx.moveTo(towerX - 10, y);
        ctx.lineTo(towerX + 10, y - 24);
        ctx.moveTo(towerX + 10, y);
        ctx.lineTo(towerX - 10, y - 24);
    }
    // Cabin / Apex
    ctx.moveTo(towerX - 12, 60);
    ctx.lineTo(towerX + 12, 60);
    ctx.lineTo(towerX, 25);
    ctx.lineTo(towerX - 12, 60);

    // Horizontal Jib (long arm to right, counterweight to left)
    ctx.moveTo(20, 60);
    ctx.lineTo(245, 60);
    // Tie cables from apex
    ctx.moveTo(towerX, 25);
    ctx.lineTo(240, 60);
    ctx.moveTo(towerX, 25);
    ctx.lineTo(170, 60);
    ctx.moveTo(towerX, 25);
    ctx.lineTo(30, 60);

    // Counterweight
    ctx.fillStyle = '#38332a';
    ctx.fillRect(25, 62, 22, 14);

    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Procedural sketch bird wing texture
function createBirdTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 48);
    ctx.strokeStyle = '#221e1a';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';

    // Elegant gull / sketch bird arch (v-shape wings)
    ctx.beginPath();
    ctx.moveTo(4, 28);
    ctx.quadraticCurveTo(18, 6, 32, 24);
    ctx.quadraticCurveTo(46, 6, 60, 28);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

/**
 * Individual Chimney with animated rising smoke puffs
 */
function ChimneySmokeColumn({ x, y, z, smokeTexture }) {
    const PUFFS_COUNT = 5;
    const groupRef = useRef();

    // Setup initial puff states
    const puffs = useMemo(() => {
        return Array.from({ length: PUFFS_COUNT }).map((_, i) => ({
            initialOffset: (i / PUFFS_COUNT) * 2.2,
            driftFreq: 1.2 + Math.random() * 0.8,
            driftAmp: 0.12 + Math.random() * 0.08,
            maxHeight: 2.2 + Math.random() * 0.4,
            scaleMax: 0.8 + Math.random() * 0.3,
            rotSpeed: (Math.random() - 0.5) * 0.8
        }));
    }, []);

    const meshRefs = useRef([]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        puffs.forEach((puff, i) => {
            const mesh = meshRefs.current[i];
            if (!mesh) return;

            // Progress from 0 to 1
            const progress = ((time * 0.45 + puff.initialOffset) % 1);
            
            // Vertical movement
            mesh.position.y = progress * puff.maxHeight;
            // Wind drift to right + gentle sway
            mesh.position.x = progress * 0.6 + Math.sin(time * puff.driftFreq + i) * puff.driftAmp;
            
            // Expansion
            const scale = 0.2 + progress * puff.scaleMax;
            mesh.scale.set(scale, scale, 1);
            
            // Fade in then fade out
            const alpha = Math.sin(progress * Math.PI) * 0.75;
            if (mesh.material) {
                mesh.material.opacity = alpha;
            }
            mesh.rotation.z += puff.rotSpeed * 0.01;
        });
    });

    return (
        <group ref={groupRef} position={[x, y, z]}>
            {puffs.map((_, i) => (
                <mesh key={i} ref={(el) => (meshRefs.current[i] = el)}>
                    <planeGeometry args={[0.7, 0.7]} />
                    <meshBasicMaterial
                        map={smokeTexture}
                        transparent
                        depthWrite={false}
                        opacity={0}
                    />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Flock of distant birds soaring across the town skyline
 */
function FlockOfBirds({ birdTexture }) {
    const groupRef = useRef();
    const birds = useMemo(() => [
        { offsetX: 0, offsetY: 0, flapSpeed: 8, flapAmp: 0.25 },
        { offsetX: -0.6, offsetY: -0.25, flapSpeed: 9, flapAmp: 0.3 },
        { offsetX: -1.2, offsetY: -0.5, flapSpeed: 7.5, flapAmp: 0.22 },
        { offsetX: 0.5, offsetY: -0.3, flapSpeed: 8.5, flapAmp: 0.28 },
        { offsetX: 1.1, offsetY: -0.6, flapSpeed: 8, flapAmp: 0.24 },
    ], []);

    const birdMeshes = useRef([]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        // Fly across from left (-24) to right (+24)
        const cycle = ((time * 1.8) % 48) - 24;
        groupRef.current.position.x = cycle;
        groupRef.current.position.y = 5.8 + Math.sin(time * 0.4) * 0.5;

        // Individual wing flutter
        birds.forEach((b, i) => {
            const mesh = birdMeshes.current[i];
            if (mesh) {
                const flap = Math.sin(time * b.flapSpeed + i);
                mesh.scale.y = 0.3 + flap * b.flapAmp;
                mesh.rotation.z = Math.sin(time * 1.2 + i) * 0.08;
            }
        });
    });

    return (
        <group ref={groupRef} position={[-20, 5.8, -14]}>
            {birds.map((b, i) => (
                <mesh
                    key={i}
                    ref={(el) => (birdMeshes.current[i] = el)}
                    position={[b.offsetX, b.offsetY, 0]}
                    scale={[0.45, 0.35, 1]}
                >
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial map={birdTexture} transparent depthWrite={false} opacity={0.65} />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Distant Skyline Construction Crane with gentle sway & moving hoist
 */
function SkylineCrane({ craneTexture }) {
    const craneRef = useRef();
    const hoistCableRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (craneRef.current) {
            // Very subtle wind sway on the tall jib
            craneRef.current.rotation.z = Math.sin(time * 0.3) * 0.015;
        }
        if (hoistCableRef.current) {
            // Hoist cable gently raising and lowering
            hoistCableRef.current.scale.y = 0.8 + Math.sin(time * 0.5) * 0.35;
        }
    });

    return (
        <group position={[11.5, 4.2, -16.5]} scale={[2.8, 2.8, 1]}>
            <mesh ref={craneRef}>
                <planeGeometry args={[2.5, 2.5]} />
                <meshBasicMaterial map={craneTexture} transparent depthWrite={false} opacity={0.55} />
            </mesh>
            {/* Suspended hoist cable */}
            <mesh ref={hoistCableRef} position={[0.7, 0.2, 0.01]}>
                <planeGeometry args={[0.02, 0.6]} />
                <meshBasicMaterial color="#38332a" transparent opacity={0.4} />
            </mesh>
        </group>
    );
}

/**
 * Main GalleryBackgroundLife Component
 */
export default function GalleryBackgroundLife() {
    const smokeTexture = useMemo(() => createSmokeTexture(), []);
    const craneTexture = useMemo(() => createCraneTexture(), []);
    const birdTexture = useMemo(() => createBirdTexture(), []);

    // Rooftop chimney positions on the houses
    const chimneyPositions = useMemo(() => [
        { x: -5.6, y: 1.85, z: -8.8 },
        { x: -2.3, y: 2.25, z: -8.8 },
        { x: 1.8, y: 1.95, z: -8.8 },
        { x: 4.9, y: 2.15, z: -8.8 },
        { x: 8.2, y: 1.75, z: -8.8 },
        { x: -11.2, y: 2.05, z: -8.8 },
    ], []);

    return (
        <group name="gallery-background-life">
            {/* Animated Chimney Smoke across rooftops */}
            {chimneyPositions.map((pos, idx) => (
                <ChimneySmokeColumn
                    key={idx}
                    x={pos.x}
                    y={pos.y}
                    z={pos.z}
                    smokeTexture={smokeTexture}
                />
            ))}

            {/* Distant Flock of Flying Birds */}
            <FlockOfBirds birdTexture={birdTexture} />

            {/* Distant Skyline Crane with subtle mechanical motion */}
            <SkylineCrane craneTexture={craneTexture} />
        </group>
    );
}

