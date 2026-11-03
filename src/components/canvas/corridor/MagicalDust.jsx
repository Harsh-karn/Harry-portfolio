import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Creates a circular soft paper-sketch particle texture on canvas
 */
function createDustTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw soft sketch star/dot
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
    grad.addColorStop(0.35, 'rgba(232, 190, 95, 0.65)');
    grad.addColorStop(0.7, 'rgba(212, 155, 67, 0.25)');
    grad.addColorStop(1, 'rgba(212, 155, 67, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    // Subtle 4-point cross sketch sparkle
    ctx.strokeStyle = 'rgba(255, 250, 235, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(32, 56);
    ctx.moveTo(8, 32);
    ctx.lineTo(56, 32);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function pseudoRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * MagicalDust Component
 * 
 * Gentle illustrated magical dust particles drifting through the corridor segment.
 * Kept restrained and slow to preserve the serene pencil-and-paper atmosphere.
 */
const MagicalDust = ({ zOffset = 0, segmentLength = 80, count = 45 }) => {
    const pointsRef = useRef();

    const dustTexture = useMemo(() => createDustTexture(), []);

    // Generate initial particle positions and deterministic drift properties
    const [positions, initialData] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const data = [];

        for (let i = 0; i < count; i++) {
            const r1 = pseudoRandom(i * 1.341 + 0.1);
            const r2 = pseudoRandom(i * 2.718 + 0.2);
            const r3 = pseudoRandom(i * 3.141 + 0.3);
            const r4 = pseudoRandom(i * 4.921 + 0.4);
            const r5 = pseudoRandom(i * 5.618 + 0.5);

            // Corridor width: ~ -2.5 to 2.5
            const x = (r1 - 0.5) * 4.8;
            // Corridor height: -1.2 to 1.5
            const y = (r2 - 0.5) * 2.5;
            // Length along segment
            const z = zOffset - r3 * segmentLength;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            data.push({
                originX: x,
                originY: y,
                originZ: z,
                speedX: 0.15 + r4 * 0.25,
                speedY: 0.2 + r5 * 0.35,
                speedZ: 0.1 + r1 * 0.2,
                amplitudeX: 0.15 + r2 * 0.2,
                amplitudeY: 0.25 + r3 * 0.3,
                phase: r4 * Math.PI * 2
            });
        }

        return [pos, data];
    }, [count, zOffset, segmentLength]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        if (pointsRef.current.parent && pointsRef.current.parent.visible === false) return;
        const geom = pointsRef.current.geometry;
        const posAttr = geom.attributes.position;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const d = initialData[i];
            // Slow, organic floating motion
            const curX = d.originX + Math.sin(t * d.speedX + d.phase) * d.amplitudeX;
            const curY = d.originY + Math.sin(t * d.speedY + d.phase) * d.amplitudeY;
            const curZ = d.originZ + Math.cos(t * d.speedZ + d.phase) * 0.15;

            posAttr.setXYZ(i, curX, curY, curZ);
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.16}
                map={dustTexture}
                transparent={true}
                opacity={0.55}
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </points>
    );
};

export default MagicalDust;
