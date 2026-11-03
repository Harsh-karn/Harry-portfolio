import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioManager';

// Reusable SVG Line Component (now accepts ref)
const TearLineSVG = ({ svgPathData, pathLength, strokeDashoffset, pathRef }) => (
  <svg
    className="preloader__overlay"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ pointerEvents: 'none' }}
  >
    <path
      ref={pathRef}
      d={svgPathData}
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: pathLength,
        strokeDashoffset: strokeDashoffset,
      }}
    />
  </svg>
);

// Marauder's Map Footsteps across the screen (Double Size)
const FOOTSTEP_COUNT = 20;
const FOOTSTEPS = Array.from({ length: FOOTSTEP_COUNT }).map((_, i) => {
  const pct = (i / (FOOTSTEP_COUNT - 1)) * 92 + 4; // Spans 4% to 96% horizontally across page
  const isLeft = i % 2 === 0;
  const laneY = isLeft ? -18 : 18; // Lateral separation between left & right feet for double-sized footprints
  const meander = Math.sin((i / (FOOTSTEP_COUNT - 1)) * Math.PI * 2) * 16; // Gentle wandering curve
  const yOffset = laneY + meander;
  const angle = isLeft ? -7 : 7; // Natural gait angle
  return { id: i, pct, isLeft, yOffset, angle };
});

const FootprintSVG = ({ isLeft }) => (
  <svg
    viewBox="-22 -8 38 16"
    width="58"
    height="26"
    className="marauder-footprint-svg"
    style={{ overflow: 'visible', display: 'block' }}
  >
    {isLeft ? (
      <g>
        {/* Sole */}
        <path d="M 14,0 C 12,-3.8 7,-5.8 2,-5.5 C -3,-5.3 -6,-4.2 -9,-2.2 C -9.8,-1.6 -9.8,-0.7 -9.4,0 C -9,0.9 -7.8,1.6 -6.5,2.2 C -3,3.6 1,5.2 6,5 C 10.5,4.8 13,2.6 14,0 Z" fill="#201a15" />
        {/* Heel */}
        <path d="M -11.5,-3 C -11.3,0 -11.3,0.8 -11.5,3 C -12.7,3.6 -15.8,3.9 -17.4,2.6 C -19,1.3 -19,-1.3 -17.4,-2.6 C -15.8,-3.9 -12.7,-3.6 -11.5,-3 Z" fill="#201a15" />
      </g>
    ) : (
      <g>
        {/* Sole */}
        <path d="M 14,0 C 12,3.8 7,5.8 2,5.5 C -3,5.3 -6,4.2 -9,2.2 C -9.8,1.6 -9.8,0.7 -9.4,0 C -9,-0.9 -7.8,-1.6 -6.5,-2.2 C -3,-3.6 1,-5.2 6,-5 C 10.5,-4.8 13,-2.6 14,0 Z" fill="#201a15" />
        {/* Heel */}
        <path d="M -11.5,3 C -11.3,0 -11.3,-0.8 -11.5,-3 C -12.7,-3.6 -15.8,-3.9 -17.4,-2.6 C -19,-1.3 -19,1.3 -17.4,2.6 C -15.8,3.9 -12.7,3.6 -11.5,3 Z" fill="#201a15" />
      </g>
    )}
  </svg>
);

const MarauderFootsteps = ({ containerRef }) => (
  <div className="preloader__footsteps-trail" ref={containerRef}>
    {FOOTSTEPS.map((step) => (
      <div
        key={step.id}
        className="marauder-step"
        data-step-index={step.id}
        style={{
          left: `${step.pct.toFixed(2)}%`,
          top: `calc(50% + ${step.yOffset.toFixed(1)}px)`,
          transform: `translate(-50%, -50%) rotate(${step.angle}deg)`,
        }}
      >
        <FootprintSVG isLeft={step.isLeft} />
      </div>
    ))}
  </div>
);

const Preloader = ({ onComplete, ready }) => {
  const [isDone, setIsDone] = useState(false);

  // Custom throttled progress state to prevent React 'Maximum update depth exceeded'
  const [realProgress, setRealProgress] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let t = 0;
    const origOnStart = THREE.DefaultLoadingManager.onStart;
    const origOnProgress = THREE.DefaultLoadingManager.onProgress;
    const origOnLoad = THREE.DefaultLoadingManager.onLoad;

    THREE.DefaultLoadingManager.onStart = (url, loaded, total) => {
      setActive(true);
      origOnStart?.(url, loaded, total);
    };

    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(() => {
        setRealProgress((loaded / total) * 100);
      });
      origOnProgress?.(url, loaded, total);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      cancelAnimationFrame(t);
      setRealProgress(100);
      setActive(false);
      
      const loadEnd = performance.now();
      const loadDuration = ((loadEnd - loadStartTime.current) / 1000).toFixed(2);
      if (typeof window !== 'undefined') {
        window.__ASSETS_LOAD_TIME__ = `${loadDuration}s`;
      }
      
      origOnLoad?.();
    };

    return () => {
      THREE.DefaultLoadingManager.onStart = origOnStart;
      THREE.DefaultLoadingManager.onProgress = origOnProgress;
      THREE.DefaultLoadingManager.onLoad = origOnLoad;
    };
  }, []);

  const { play } = useAudio();

  // Performance Tracking
  const loadStartTime = useRef(performance.now());

  // Use refs for animation targets
  const containerRef = useRef(null);
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);
  const pathLeftRef = useRef(null);
  const pathRightRef = useRef(null);
  const footstepsLeftRef = useRef(null);
  const footstepsRightRef = useRef(null);
  const lastStepCountRef = useRef(0);

  // Track visual progress entirely in refs to skip React renders 60x/sec!
  const [targetProgress, setTargetProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const trackerRef = useRef({ val: 0 });
  const readyRef = useRef(ready);

  useEffect(() => { readyRef.current = ready; }, [ready]);

  // ----------------------------------------
  // GENERATE TEAR PATH
  // ----------------------------------------
  const tearPoints = useMemo(() => {
    const points = [];
    const segments = 12; // Fewer segments

    points.push([50, 0]);

    for (let i = 1; i < segments; i++) {
      const y = (i / segments) * 100;
      const xOffset = (Math.random() - 0.5) * 6;
      const x = 50 + xOffset;
      points.push([x, y]);
    }

    points.push([50, 100]);
    return points;
  }, []);

  const svgPathData = useMemo(() => {
    return tearPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]} `).join(' ');
  }, [tearPoints]);

  const leftClipPoly = useMemo(() => {
    let poly = '0% 0%, ';
    tearPoints.forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    poly += '0% 100%';
    return `polygon(${poly})`;
  }, [tearPoints]);

  const rightClipPoly = useMemo(() => {
    let poly = '100% 0%, ';
    poly += '100% 100%, ';
    [...tearPoints].reverse().forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    return `polygon(${poly.slice(0, -2)})`;
  }, [tearPoints]);


  // ----------------------------------------
  // SMOOTH LOADING LOGIC
  // ----------------------------------------
  useEffect(() => {
    let newTarget = 0;
    if (active) {
      newTarget = (realProgress / 100) * 85;
    } else {
      if (ready) {
        newTarget = 100;
      } else {
        newTarget = 90;
      }
    }

    setTargetProgress(prev => Math.max(prev, newTarget));
  }, [realProgress, active, ready]);

  // Handle Exit checking dynamically
  const checkProgressTriggers = (val) => {
    // Exit phase
    if (val >= 99.5 && readyRef.current && !exitStarted.current) {
      exitStarted.current = true;
      startExit();
    }
  };

  useEffect(() => {
    const distance = targetProgress - displayProgressRef.current;
    let duration = 0.2;

    if (distance > 60) {
      duration = 0.35;
    } else if (distance > 30) {
      duration = 0.25;
    } else if (distance > 10) {
      duration = 0.18;
    } else if (distance > 0) {
      duration = 0.1;
    }

    gsap.to(trackerRef.current, {
      val: targetProgress,
      duration: duration,
      ease: "power2.out",
      overwrite: true, // Auto kill previous tweens on trackerRef
      onUpdate: () => {
        const val = trackerRef.current.val;
        displayProgressRef.current = val;

        const safeProgress = Math.min(100, Math.max(0, val));
        const strokeDashoffset = 120 - (120 * safeProgress) / 100;
        const activeCount = Math.floor((safeProgress / 100) * FOOTSTEP_COUNT);

        // Progressively reveal Marauder footsteps across both paper halves
        if (activeCount !== lastStepCountRef.current) {
          lastStepCountRef.current = activeCount;
          [footstepsLeftRef.current, footstepsRightRef.current].forEach(container => {
            if (!container) return;
            const steps = container.children;
            for (let i = 0; i < steps.length; i++) {
              if (i < activeCount) {
                steps[i].classList.add('is-visible');
              } else {
                steps[i].classList.remove('is-visible');
              }
            }
          });
        }

        if (pathLeftRef.current) pathLeftRef.current.style.strokeDashoffset = strokeDashoffset;
        if (pathRightRef.current) pathRightRef.current.style.strokeDashoffset = strokeDashoffset;

        checkProgressTriggers(val);
      }
    });

  }, [targetProgress]);


  // ----------------------------------------
  // EXIT SEQUENCE
  // ----------------------------------------
  const exitStarted = useRef(false);

  // Fallback trigger if ready becomes true AFTER 99.5% reached
  useEffect(() => {
    if (displayProgressRef.current >= 99.5 && ready && !exitStarted.current) {
      exitStarted.current = true;
      startExit();
    }
  }, [ready]);

  const startExit = () => {
    exitStarted.current = true;
    play('tear', { volume: 0.8 });

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        
        const exitEnd = performance.now();
        const totalDuration = ((exitEnd - loadStartTime.current) / 1000).toFixed(2);
        
        // Inject DOM benchmarking attributes onto <html>
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-loader-duration', `${totalDuration}s`);
          document.documentElement.setAttribute('data-loader-status', 'ready');
        }

        if (typeof window !== 'undefined') {
          const nav = performance.getEntriesByType('navigation')[0];
          const domContentLoaded = nav ? Math.round(nav.domContentLoadedEventEnd) : null;
          const domInteractive = nav ? Math.round(nav.domInteractive) : null;

          window.__LOADER_METRICS__ = {
            domInteractive: domInteractive ? `${domInteractive}ms` : 'N/A',
            domContentLoaded: domContentLoaded ? `${domContentLoaded}ms` : 'N/A',
            assetsLoadDuration: window.__ASSETS_LOAD_TIME__ || `${totalDuration}s`,
            totalPreloaderDuration: `${totalDuration}s`,
            timestamp: new Date().toISOString()
          };

          console.group('%c⚡ DOM & LOADER PERFORMANCE BENCHMARK', 'color: #00e676; font-weight: bold; font-size: 13px;');
          console.log(`- DOM Interactive: %c${window.__LOADER_METRICS__.domInteractive}`, 'color: #00e676; font-weight: bold;');
          console.log(`- DOM Content Loaded: %c${window.__LOADER_METRICS__.domContentLoaded}`, 'color: #00e676; font-weight: bold;');
          console.log(`- Core Textures Load Time: %c${window.__LOADER_METRICS__.assetsLoadDuration}`, 'color: #00e676; font-weight: bold;');
          console.log(`- Total Preloader DOM Duration: %c${window.__LOADER_METRICS__.totalPreloaderDuration}`, 'color: #00e676; font-weight: bold;');
          console.log('- DOM Attribute: %cdocument.documentElement.getAttribute("data-loader-duration")', 'color: #888;');
          console.groupEnd();
        }
        
        onComplete?.();
      }
    });

    // 1. Brief pause before tear
    tl.to({}, { duration: 0.02 });

    // 2. Tear Apart (snappy & energetic)
    tl.to(leftHalfRef.current, {
      xPercent: -100,
      rotation: -2,
      duration: 0.52,
      ease: "power3.inOut"
    }, 'tear');

    tl.to(rightHalfRef.current, {
      xPercent: 100,
      rotation: 2,
      duration: 0.52,
      ease: "power3.inOut"
    }, 'tear');

    // 3. Fade container
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.25
    }, '-=0.25');
  };

  if (isDone) return null;

  const pathLength = 120;
  // Initialize values
  const safeProgress = Math.min(100, Math.max(0, displayProgressRef.current));
  const strokeDashoffset = pathLength - (pathLength * safeProgress) / 100;

  return (
    <div className="preloader" ref={containerRef}>
      {/* LEFT HALF */}
      <div
        className="preloader__half preloader__half--left"
        ref={leftHalfRef}
        style={{ clipPath: leftClipPoly }}
      >
        {/* Marauder's Map Walking Footsteps (Left Half) */}
        <MarauderFootsteps containerRef={footstepsLeftRef} />

        {/* Torn paper line */}
        <TearLineSVG pathRef={pathLeftRef} svgPathData={svgPathData} pathLength={pathLength} strokeDashoffset={strokeDashoffset} />
      </div>

      {/* RIGHT HALF */}
      <div
        className="preloader__half preloader__half--right"
        ref={rightHalfRef}
        style={{ clipPath: rightClipPoly }}
      >
        {/* Marauder's Map Walking Footsteps (Right Half) */}
        <MarauderFootsteps containerRef={footstepsRightRef} />

        {/* Torn paper line */}
        <TearLineSVG pathRef={pathRightRef} svgPathData={svgPathData} pathLength={pathLength} strokeDashoffset={strokeDashoffset} />
      </div>
    </div>
  );
};

export default Preloader;
