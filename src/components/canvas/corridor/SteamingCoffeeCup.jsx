import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../../context/AudioManager';
import { useAchievements } from '../../../context/AchievementsContext';

// Procedural sketch steam curl texture
function createSteamTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 128);

    ctx.strokeStyle = '#322d26';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    // Elegant ascending S-curve spiral
    ctx.beginPath();
    ctx.moveTo(32, 120);
    ctx.bezierCurveTo(46, 95, 18, 70, 36, 45);
    ctx.bezierCurveTo(48, 28, 24, 14, 32, 6);
    ctx.stroke();

    // Parallel faint sketch pencil line
    ctx.strokeStyle = '#5a5247';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(36, 115);
    ctx.bezierCurveTo(50, 92, 22, 68, 40, 44);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

export default function SteamingCoffeeCup({ position = [0, 0, 0], scale = 0.32 }) {
    const cupTexture = useTexture('/textures/corridor/decorations/coffee_cup.webp');
    const steamTexture = useMemo(() => createSteamTexture(), []);
    const { play } = useAudio();
    const { unlockAchievement } = useAchievements();

    const [isSteaming, setIsSteaming] = useState(true);
    const [thought, setThought] = useState('');
    const [showThought, setShowThought] = useState(false);

    const cupRef = useRef();
    const thoughtRef = useRef();
    const steamGroupRef = useRef();
    const steamPuffs = useRef([]);

    const thoughts = [
        "// Coffee -> Code ☕",
        "100% Caffeinated! ⚡",
        "It compiles! Ship it! 🚀",
        "while(alive) { drink(coffee); }",
        "Bug fixed on 1st try! 🎉",
        "Dark mode activated 🌙"
    ];

    const handleClick = (e) => {
        e.stopPropagation();
        play('paper');
        unlockAchievement('secret_coffee');

        // Bouncy cup tap
        if (cupRef.current) {
            gsap.fromTo(cupRef.current.scale,
                { x: scale * 1.25, y: scale * 0.8 },
                { x: scale, y: scale, duration: 0.4, ease: 'elastic.out(1.5, 0.4)' }
            );
        }

        // Show random developer thought bubble
        const nextThought = thoughts[Math.floor(Math.random() * thoughts.length)];
        setThought(nextThought);
        setShowThought(true);

        if (thoughtRef.current) {
            thoughtRef.current.scale.set(0, 0, 0);
            gsap.to(thoughtRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                ease: 'back.out(1.8)'
            });

            gsap.delayedCall(2.2, () => {
                if (thoughtRef.current) {
                    gsap.to(thoughtRef.current.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.25,
                        ease: 'power2.in',
                        onComplete: () => setShowThought(false)
                    });
                }
            });
        }
    };

    useFrame((state) => {
        if (!isSteaming) return;
        const time = state.clock.getElapsedTime();

        // Animate 3 rising steam strands
        steamPuffs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const progress = ((time * 0.6 + i * 0.33) % 1);
            // Rise up from cup rim
            mesh.position.y = 0.12 + progress * 0.45;
            // Sway with air current
            mesh.position.x = Math.sin(time * 2.0 + i * 1.5) * 0.03 + (i - 1) * 0.04;
            // Fade out near top
            const opacity = Math.sin(progress * Math.PI) * 0.75;
            if (mesh.material) {
                mesh.material.opacity = opacity;
            }
            mesh.scale.set(0.25 + progress * 0.15, 0.35 + progress * 0.15, 1);
        });
    });

    return (
        <group position={position}>
            {/* The Coffee Cup Plane */}
            <mesh
                ref={cupRef}
                scale={[scale, scale, 1]}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    map={cupTexture}
                    transparent
                    alphaTest={0.05}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Rising Animated Steam Curls */}
            <group ref={steamGroupRef}>
                {[0, 1, 2].map((i) => (
                    <mesh
                        key={i}
                        ref={(el) => (steamPuffs.current[i] = el)}
                        position={[(i - 1) * 0.04, 0.15, 0.01]}
                        scale={[0.3, 0.4, 1]}
                    >
                        <planeGeometry args={[0.3, 0.6]} />
                        <meshBasicMaterial
                            map={steamTexture}
                            transparent
                            opacity={0.6}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </mesh>
                ))}
            </group>

            {/* Developer Thought Bubble */}
            <group ref={thoughtRef} position={[0.4, 0.42, 0.08]} scale={[0, 0, 0]}>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1.5, 0.45]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[1.56, 0.51]} />
                    <meshBasicMaterial color="#221e1a" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 0.01, 0.02]}
                    fontSize={0.10}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#1c1b18"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.4}
                    textAlign="center"
                >
                    {thought}
                </Text>
            </group>
        </group>
    );
}

