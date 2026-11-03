import React, { useRef, useState, useMemo } from 'react';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../../context/AudioManager';
import { useAchievements } from '../../../context/AchievementsContext';

// Procedural sketch 404 miniature arched door texture
function create404DoorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 192);

    ctx.strokeStyle = '#2b2620';
    ctx.fillStyle = '#f5f2eb';
    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';

    // Arched door frame
    ctx.beginPath();
    ctx.moveTo(16, 185);
    ctx.lineTo(16, 64);
    ctx.arc(64, 64, 48, Math.PI, 0);
    ctx.lineTo(112, 185);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wood planks vertical lines
    ctx.strokeStyle = '#4a4339';
    ctx.lineWidth = 2.0;
    [40, 64, 88].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 185);
        ctx.lineTo(x, 35);
        ctx.stroke();
    });

    // Iron hinges
    ctx.fillStyle = '#221e1a';
    ctx.fillRect(16, 75, 20, 6);
    ctx.fillRect(16, 145, 20, 6);

    // Round doorknob
    ctx.beginPath();
    ctx.arc(96, 120, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#b87e28';
    ctx.fill();
    ctx.stroke();

    // Sign above knob: "404"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 85, 48, 20);
    ctx.strokeRect(40, 85, 48, 20);
    ctx.fillStyle = '#221e1a';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('404', 64, 100);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

export default function SecretDoor404({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.55 }) {
    const doorTexture = useMemo(() => create404DoorTexture(), []);
    const { play } = useAudio();
    const { unlockAchievement } = useAchievements();

    const [isOpen, setIsOpen] = useState(false);
    const [secretText, setSecretText] = useState('');
    const doorGroupRef = useRef();
    const bubbleRef = useRef();

    const easterEggQuotes = [
        "404: Room not found! 🗝️",
        "Just a secret mouse hole! 🐭",
        "Nothing to see here... or is there? 👀",
        "Achievement Unlocked: Nosy Explorer! 🏆",
        "Mischief Managed! ⚡"
    ];

    const handleClick = (e) => {
        e.stopPropagation();
        play('doorcreak');
        unlockAchievement('secret_404');

        const quote = easterEggQuotes[Math.floor(Math.random() * easterEggQuotes.length)];
        setSecretText(quote);
        setIsOpen(true);

        // Rattle and shake door
        if (doorGroupRef.current) {
            gsap.to(doorGroupRef.current.rotation, {
                y: rotation[1] + (rotation[1] > 0 ? 0.35 : -0.35),
                duration: 0.35,
                ease: 'back.out(2)',
                yoyo: true,
                repeat: 1
            });
        }

        // Pop speech bubble
        if (bubbleRef.current) {
            bubbleRef.current.scale.set(0, 0, 0);
            gsap.to(bubbleRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                ease: 'back.out(1.8)'
            });

            gsap.delayedCall(2.8, () => {
                if (bubbleRef.current) {
                    gsap.to(bubbleRef.current.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.2,
                        ease: 'power2.in',
                        onComplete: () => setIsOpen(false)
                    });
                }
            });
        }
    };

    return (
        <group position={position} rotation={rotation}>
            {/* The Miniature Arched 404 Door */}
            <mesh
                ref={doorGroupRef}
                scale={[scale, scale * 1.5, 1]}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    map={doorTexture}
                    transparent
                    alphaTest={0.05}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Secret Speech Bubble */}
            <group ref={bubbleRef} position={[0, 0.65, 0.05]} scale={[0, 0, 0]}>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1.8, 0.5]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[1.86, 0.56]} />
                    <meshBasicMaterial color="#221e1a" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 0.01, 0.02]}
                    fontSize={0.11}
                    font="/fonts/CabinSketch-Bold.ttf"
                    color="#1c1b18"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.7}
                    textAlign="center"
                >
                    {secretText}
                </Text>
            </group>
        </group>
    );
}

