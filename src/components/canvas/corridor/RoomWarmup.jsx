import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * RoomWarmup Component
 * 
 * Compiles shaders for the visible entrance and corridor scene
 * to ensure entering the experience is buttery smooth without stalling
 * the initial loading screen on all 4 deep rooms.
 */
const RoomWarmup = ({ onWarmupComplete, isLowTier }) => {
    const [isDone, setIsDone] = useState(false);
    const frameCount = useRef(0);
    const completeFired = useRef(false);
    const { gl, scene, camera } = useThree();

    const warmupStart = useRef(performance.now());

    useFrame(() => {
        if (isDone || completeFired.current) return;

        frameCount.current++;

        // Wait 1-2 frames for initial entrance scene to mount into scene graph
        const targetFrames = isLowTier ? 1 : 2;

        if (frameCount.current >= targetFrames) {
            completeFired.current = true;

            const finishWarmup = () => {
                requestAnimationFrame(() => {
                    setIsDone(true);
                    onWarmupComplete?.();
                });
            };

            // On low tier, bypass intense gl.compileAsync to save memory
            if (isLowTier) {
                finishWarmup();
                return;
            }

            // Force compile entrance scene shaders
            if (gl.compileAsync) {
                gl.compileAsync(scene, camera, scene)
                    .then(finishWarmup)
                    .catch(() => {
                        gl.compile(scene, camera);
                        finishWarmup();
                    });
            } else {
                gl.compile(scene, camera);
                finishWarmup();
            }
        }
    });

    return null;
};

export default RoomWarmup;
