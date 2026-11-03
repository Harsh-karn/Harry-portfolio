/* eslint-disable react-hooks/immutability */
import { useState, Suspense, useEffect, useCallback, useRef, lazy } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { Preload, useTexture, Text, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

import Preloader from './components/dom/Preloader';
import PaperTransition from './components/dom/PaperTransition';
import { AudioProvider, useAudio } from './context/AudioManager';
import { initAudio } from './utils/audioManager';
import { PerformanceProvider, usePerformance } from './context/PerformanceContext';
import { SceneProvider, useScene } from './context/SceneContext';
import NavigationUI from './components/ui/NavigationUI';
import GlobalOverlay from './components/ui/GlobalOverlay';
import WisprUIOverlay from './components/ui/WisprUIOverlay';
import ProjectCategoryBar from './components/ui/ProjectCategoryBar';
import ScreenReaderOverlay from './components/ui/ScreenReaderOverlay';
import KonamiSecretModal from './components/ui/KonamiSecretModal';
import { AchievementsProvider, useAchievements } from './context/AchievementsContext';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import posthog from 'posthog-js';
import { loadSanityData } from './hooks/useSanityData';

// Initialize PostHog safely if token exists
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    person_profiles: 'identified_only',
  });
}

// Lazy load the heavy 3D experience
const Experience = lazy(() => import('./components/canvas/Experience'));

import './styles/main.scss';

// --- CONDITIONAL ASSET PRELOADING ---
// Initial Core textures needed immediately for Entrance & Corridor
import { 
  CORE_TEXTURES,
  ROOM_TEXTURES_DREI,
  ROOM_TEXTURES_LOADER,
  IMAGE_ASSETS,
  filterTexturesByDevice
} from './config/texturePreloadList';
import { TextureLoader } from 'three';

// Standard Browser-level Image Preloader (for <img> tags)
const preloadBrowserImage = (path) => {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = path;
};

const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
const isWeakCPU = typeof navigator.hardwareConcurrency !== 'undefined' && navigator.hardwareConcurrency <= 4;
const isLowRAM = typeof navigator.deviceMemory !== 'undefined' && navigator.deviceMemory <= 4;
const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
const _isLowEnd = isMobileDevice || isWeakCPU || isLowRAM || isSmallScreen;

// Refined check for "hover capability" (non-touch devices should have hover: hover)
// Laptops with touch screens (which also have a mouse/trackpad) will return true here.
const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// Trigger Core Three.js preloads at module level (only entrance & corridor for instant loading)
const filteredCore = filterTexturesByDevice(CORE_TEXTURES, supportsHover);
filteredCore.forEach(path => useTexture.preload(path));

// Function to preload deferred room textures in background when idle
const preloadDeferredRooms = () => {
  if (typeof window === 'undefined') return;
  const filteredRoomsDrei = filterTexturesByDevice(ROOM_TEXTURES_DREI, supportsHover);
  const filteredRoomsLoader = filterTexturesByDevice(ROOM_TEXTURES_LOADER, supportsHover);
  
  filteredRoomsDrei.forEach(path => useTexture.preload(path));
  filteredRoomsLoader.forEach(path => useLoader.preload(TextureLoader, path));
};

const FONT_URL = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff';

// Helper component to handle global audio enable on interaction
const GlobalAudioEnabler = () => {
  const { enableAudio } = useAudio();
  useEffect(() => {
    const handleInteraction = () => enableAudio();
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [enableAudio]);
  return null;
};

// Scene background using corridor wall texture (static, no animation)
const PaperSceneBackground = () => {
  const { scene } = useThree();
  const texture = useTexture('/textures/paper-texture.webp');

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;

    return () => {
      scene.background = null;
    };
  }, [scene, texture]);

  return null;
};

// Bridge component to use hooks inside SceneProvider
// Handles dynamic meta tags + deep link auto-teleport
function DocumentMetaBridge() {
  useDocumentMeta();

  const { initialRoom, deeplinkHandled: deeplinkHandledRef, teleportTo, markEntered } = useScene();

  // Deep linking: if user lands on e.g. /wispr-flow or /my-builds, auto-enter and teleport after scene loads
  useEffect(() => {
    if (initialRoom && !deeplinkHandledRef.current) {
      deeplinkHandledRef.current = true;
      markEntered();
      // Small delay to let the corridor render first
      setTimeout(() => teleportTo(initialRoom), 400);
    }
  }, [initialRoom, teleportTo, markEntered, deeplinkHandledRef]);

  return null;
}

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Use Performance Context
  const { settings, downgradeTier, tier } = usePerformance();
  const { unlockAchievement } = useAchievements();
  const [showKonamiModal, setShowKonamiModal] = useState(false);
  const konamiSequence = useRef([]);
  const KONAMI_CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

  // Force initialize audio in the background on mount
  useEffect(() => {
    initAudio();
  }, []);

  // 🌙 Secret Easter Eggs: 'B' for Blueprint Dark Mode, Konami Code for Secret Chamber
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      // 1. Blueprint dark mode
      if (e.key === 'b' || e.key === 'B') {
        document.body.classList.toggle('blueprint-dark-mode');
        unlockAchievement('secret_blueprint');
      }

      // 2. Konami code detector
      const key = e.key.toLowerCase();
      const currentSeq = [...konamiSequence.current, key].slice(-KONAMI_CODE.length);
      konamiSequence.current = currentSeq;

      if (currentSeq.length === KONAMI_CODE.length && currentSeq.every((k, idx) => k === KONAMI_CODE[idx])) {
        unlockAchievement('secret_konami');
        setShowKonamiModal(true);
        konamiSequence.current = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlockAchievement]);

  // When initial scene is ready & loaded, schedule room preloads during idle
  useEffect(() => {
    if (isLoaded) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadDeferredRooms, { timeout: 3000 });
      } else {
        setTimeout(preloadDeferredRooms, 800);
      }
    }
  }, [isLoaded]);

  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => {
      setSceneReady(true);
    });
  }, []);

  return (
    <AudioProvider>
      <SceneProvider>
        <DocumentMetaBridge />
        <GlobalAudioEnabler />
        <div className="app">
          {/* Full screen 3D Canvas */}
          <div className="canvas-wrapper">
            <Canvas
              camera={{
                position: [0, 0.2, 28],
                fov: 60,
                near: 0.1,
                far: 150
              }}
              gl={{
                antialias: settings.antialias,
                alpha: false,
                powerPreference: settings.powerPreference,
                localClippingEnabled: true,
                failIfMajorPerformanceCaveat: true
              }}
              dpr={settings.dpr}
              shadows={settings.shadows}
            >
              <color attach="background" args={['#fafafa']} />
              <fog attach="fog" args={['#fafafa', 15, 50]} />

              {/* Scale performance down if fps drops */}
              <PerformanceMonitor
                onDecline={() => downgradeTier()}
                flipflops={3}
                onFallback={() => downgradeTier()}
              />

              {/* Advanced FPS & Performance Monitor */}
              {/* <Perf position="top-left" minimal={false} /> */}

              <Suspense fallback={null}>
                <Experience
                  isLoaded={isLoaded}
                  onSceneReady={handleSceneReady}
                  performanceTier={tier}
                />
                <Preload all />
              </Suspense>
            </Canvas>
          </div>

          {/* Navigation UI - Hamburger, Map, Back, Audio */}
          {isLoaded && (
            <>
              <NavigationUI />
              <ProjectCategoryBar />
              <GlobalOverlay />
              <WisprUIOverlay />
              <PaperTransition />
              <ScreenReaderOverlay />
              <KonamiSecretModal isOpen={showKonamiModal} onClose={() => setShowKonamiModal(false)} />
            </>
          )}

          {/* 2D Preloader */}
          <Preloader
            ready={sceneReady}
            onComplete={() => setIsLoaded(true)}
          />
        </div>
      </SceneProvider>
    </AudioProvider>
  );
}

export default function App() {
  // Preload browser-based images (for standard <img> tags) immediately upon mounting App
  // This ensures they are in the network waterfall during the initial loading phase.
  useEffect(() => {
    // Eagerly preload Sanity CMS data and images
    loadSanityData();

    const filteredImages = filterTexturesByDevice(IMAGE_ASSETS, supportsHover);
    // console.log(`[Preload] Triggering browser-level image preloads for ${filteredImages.length} assets.`);
    filteredImages.forEach(path => preloadBrowserImage(path));
  }, []);

  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <AppContent />
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
