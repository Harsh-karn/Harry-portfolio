import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural hand-drawn sketch island with lighthouse and palms
function createIslandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);

    ctx.strokeStyle = '#2b2620';
    ctx.fillStyle = '#f3f0ea';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Rolling Island Hills Silhouette
    ctx.beginPath();
    ctx.moveTo(30, 210);
    ctx.quadraticCurveTo(110, 150, 200, 175);
    ctx.quadraticCurveTo(280, 140, 380, 180);
    ctx.quadraticCurveTo(440, 165, 490, 210);
    ctx.lineTo(30, 210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal hill contours & sketch hatching
    ctx.beginPath();
    ctx.moveTo(110, 195);
    ctx.quadraticCurveTo(170, 170, 240, 195);
    ctx.moveTo(270, 195);
    ctx.quadraticCurveTo(330, 168, 410, 198);
    ctx.strokeStyle = '#4a4237';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 2. Lighthouse on the left promontory (X: 140..170, Y: 90..165)
    ctx.strokeStyle = '#221e1a';
    ctx.lineWidth = 2.2;
    ctx.fillStyle = '#f8f6f2';

    // Lighthouse tower (tapered)
    ctx.beginPath();
    ctx.moveTo(146, 168);
    ctx.lineTo(150, 108);
    ctx.lineTo(164, 108);
    ctx.lineTo(168, 168);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tower stripes (classic red/sketch dark bands)
    ctx.fillStyle = '#833c46';
    ctx.beginPath();
    ctx.moveTo(148, 145);
    ctx.lineTo(166, 145);
    ctx.lineTo(165, 132);
    ctx.lineTo(149, 132);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gallery railing & lantern room
    ctx.beginPath();
    ctx.moveTo(144, 108);
    ctx.lineTo(170, 108);
    // Lantern dome
    ctx.moveTo(151, 108);
    ctx.lineTo(151, 95);
    ctx.lineTo(163, 95);
    ctx.lineTo(163, 108);
    // Roof cap
    ctx.arc(157, 95, 7, Math.PI, 0);
    ctx.lineTo(157, 84);
    ctx.stroke();

    // 3. Palm trees on the right hill (X: 340..390)
    ctx.strokeStyle = '#322d26';
    ctx.lineWidth = 2.0;

    // Palm 1 Trunk
    ctx.beginPath();
    ctx.moveTo(350, 185);
    ctx.quadraticCurveTo(356, 150, 345, 125);
    ctx.stroke();
    // Palm 1 Fronds
    const drawFrond = (cx, cy, ang) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + Math.cos(ang) * 22, cy + Math.sin(ang) * 16 + 8, cx + Math.cos(ang) * 32, cy + Math.sin(ang) * 24 + 14);
        ctx.stroke();
    };
    [0.1, 0.7, 1.4, 2.2, 2.8, -0.6, -1.2].forEach(a => drawFrond(345, 125, a));

    // Palm 2 Trunk (smaller)
    ctx.beginPath();
    ctx.moveTo(375, 188);
    ctx.quadraticCurveTo(378, 160, 385, 140);
    ctx.stroke();
    [-0.2, 0.5, 1.2, 2.1, 2.7, -0.8].forEach(a => drawFrond(385, 140, a));

    // 4. Distant little sailboat near the island
    ctx.beginPath();
    ctx.moveTo(60, 202);
    ctx.lineTo(84, 202);
    ctx.lineTo(78, 208);
    ctx.lineTo(66, 208);
    ctx.closePath();
    ctx.fillStyle = '#221e1a';
    ctx.fill();
    // Sails
    ctx.beginPath();
    ctx.moveTo(74, 201);
    ctx.lineTo(74, 182);
    ctx.lineTo(84, 201);
    ctx.closePath();
    ctx.fillStyle = '#e8e4dc';
    ctx.fill();
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

// Procedural wave line texture
function createWaveLineTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 64);

    ctx.strokeStyle = '#322d26';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // Delicate repeating sketch wave crests
    for (let x = 0; x < 512; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x + 4, 32);
        ctx.quadraticCurveTo(x + 24, 16, x + 44, 32);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 16, 38);
        ctx.quadraticCurveTo(x + 28, 28, x + 40, 38);
        ctx.strokeStyle = '#5a5247';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.strokeStyle = '#322d26';
        ctx.lineWidth = 2.2;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(4, 1);
    tex.needsUpdate = true;
    return tex;
}

/**
 * ContactSeascapeHorizon Component
 */
export default function ContactSeascapeHorizon() {
    const islandTexture = useMemo(() => createIslandTexture(), []);
    const waveLineTexture = useMemo(() => createWaveLineTexture(), []);

    const beaconRef = useRef();
    const waveMesh1Ref = useRef();
    const waveMesh2Ref = useRef();
    const waveMesh3Ref = useRef();
    const islandGroupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Lighthouse beacon gentle glow pulse
        if (beaconRef.current) {
            beaconRef.current.material.opacity = 0.4 + Math.sin(time * 3.0) * 0.35;
        }

        // Minimalist rolling waves (undulating X & Z)
        if (waveMesh1Ref.current) {
            waveMesh1Ref.current.position.x = Math.sin(time * 0.8) * 0.6;
            waveMesh1Ref.current.position.y = -0.4 + Math.sin(time * 1.4) * 0.05;
        }
        if (waveMesh2Ref.current) {
            waveMesh2Ref.current.position.x = Math.cos(time * 0.7) * 0.8;
            waveMesh2Ref.current.position.y = -0.55 + Math.cos(time * 1.2) * 0.05;
        }
        if (waveMesh3Ref.current) {
            waveMesh3Ref.current.position.x = Math.sin(time * 0.6 + 1.0) * 1.0;
            waveMesh3Ref.current.position.y = -0.7 + Math.sin(time * 1.0) * 0.04;
        }

        // Subtle island horizon mirage bobbing
        if (islandGroupRef.current) {
            islandGroupRef.current.position.y = 1.8 + Math.sin(time * 0.5) * 0.03;
        }
    });

    return (
        <group name="contact-seascape-horizon">
            {/* 🏝️ Distant Horizon Island */}
            <group ref={islandGroupRef} position={[-6.5, 1.8, -36]}>
                <mesh>
                    <planeGeometry args={[16, 8]} />
                    <meshBasicMaterial
                        map={islandTexture}
                        transparent
                        alphaTest={0.02}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Lighthouse Beacon Glow */}
                <mesh ref={beaconRef} position={[-2.8, 1.7, 0.02]}>
                    <circleGeometry args={[0.35, 16]} />
                    <meshBasicMaterial
                        color="#ffe8a3"
                        transparent
                        opacity={0.6}
                        depthWrite={false}
                    />
                </mesh>
            </group>

            {/* 🌊 Minimalist Rolling Wave Crest Lines */}
            <group position={[0, 0, 0]}>
                {/* Far Wave */}
                <mesh
                    ref={waveMesh1Ref}
                    position={[0, -0.4, -28]}
                    rotation={[-Math.PI / 2.8, 0, 0]}
                >
                    <planeGeometry args={[65, 3]} />
                    <meshBasicMaterial
                        map={waveLineTexture}
                        transparent
                        opacity={0.45}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Mid Wave */}
                <mesh
                    ref={waveMesh2Ref}
                    position={[0, -0.55, -20]}
                    rotation={[-Math.PI / 2.6, 0, 0]}
                >
                    <planeGeometry args={[55, 3.5]} />
                    <meshBasicMaterial
                        map={waveLineTexture}
                        transparent
                        opacity={0.55}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Near Wave */}
                <mesh
                    ref={waveMesh3Ref}
                    position={[0, -0.7, -13]}
                    rotation={[-Math.PI / 2.4, 0, 0]}
                >
                    <planeGeometry args={[45, 4]} />
                    <meshBasicMaterial
                        map={waveLineTexture}
                        transparent
                        opacity={0.65}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            </group>
        </group>
    );
}

