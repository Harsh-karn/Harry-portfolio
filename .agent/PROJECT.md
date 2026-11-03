# 🎨 Harsh Karn Portfolio — Internal Architecture & Developer Guide

> **For AI Agents & Developers**: Read this document first before adding features, modifying shaders, or tweaking camera math.

---

## 📋 System Overview

This application is an **Awwwards SOTD / FWA-tier 3D WebGL Portfolio** built with React 19, Three.js 0.182, React Three Fiber (R3F) 9.4, GSAP 3.14, and Vite 7. The user journeys through an enchanted infinite sketchbook corridor with portals into unique interactive spatial rooms.

### Core Architecture Flow
1. **Footsteps Preloader:** Marauder's Map style walking footsteps with real-time percentage tracking and smooth parchment split.
2. **Hogwarts Castle Facade:** Hand-drawn stone brick castle entrance featuring:
   - Hovering, wing-flapping Golden Snitch (`GoldenSnitch.jsx`).
   - Upper window where Harsh (boy character with glasses & jacket) waves when hovered (`WindowBoy.jsx`).
   - Porch cat whose pupil orientation tracks the user's cursor (`CatObserver.jsx`).
   - Crawling bug on the wall that can be squashed/clicked to trigger a "BUG FIXED" burst effect and achievement unlock.
   - Wooden swinging sign with physics tilt (`SignSystem.jsx`).
   - Entrance doors with tech stickers and instant handle depression (`EntranceDoors.jsx`).
3. **Infinite Sawtooth Corridor:** Continuous, infinitely repeating corridor segments (`InfiniteCorridorManager.jsx`, `CorridorSegment.jsx`, `DoorSection.jsx`) decorated with hand-drawn framed art, developer quotes, desk with coffee, paper planes, and secret portals.
4. **The Five Chambers:**
   - 🖼️ **My Builds (The Gallery):** Clothesline project gallery with category filtering (`All`, `AI / ML`, `Full Stack`, `3D / Creative`), inspection modal overlays, chimney smoke particles, and flying sketch birds.
   - 🧪 **My Lab (The Studio):** Infinite cylindrical CRT monitor tower with 360° inertia rotation and deep-dive experiment modals.
   - ☁️ **My Story (About Room):** Flying sky timeline with cloud milestones, poppable skill balloons, and avatar zoom swoop.
   - 📬 **Say Hi (Contact Pier):** Pier on the ocean with interactive torn-paper letter typing, rolling bottle animation with water splash, and social barrels.
   - 🎙️ **Wispr Flow:** Flagship case study chamber with real-time audio frequency visualizer.
5. **Secret Chamber:** Accessible via the Konami Code (`↑ ↑ ↓ ↓ ← → ← → B A`), opening the Headmaster's Secret Chamber.

---

## 🛠️ Complete Tech Stack

| Layer | Package / Tool | Version | Purpose |
|-------|----------------|---------|---------|
| **Core Framework** | `react` / `react-dom` | `^19.2.0` | UI orchestration and component lifecycle |
| **WebGL & 3D** | `three` | `^0.182.0` | 3D scene graph, math, and WebGL rendering |
| **R3F Ecosystem** | `@react-three/fiber` | `^9.4.2` | Declarative Three.js wrapper |
| **3D Helpers** | `@react-three/drei` | `^10.7.7` | `Text`, `useTexture`, `Html`, `PerformanceMonitor` |
| **Animation** | `gsap` + `@gsap/react` | `^3.14.2` | High-precision timelines, camera fly-throughs |
| **Routing** | `react-router-dom` | `^7.11.0` | Deep-link support (`/my-builds`, `/wispr-flow`, etc.) |
| **Build & Bundling** | `vite` | `^7.2.4` | ES module dev server & Rollup production build |
| **Compression** | `vite-plugin-compression` | `^0.5.1` | Brotli and Gzip pre-compression of static assets |
| **Styling** | `sass` | `^1.97.1` | Modular SCSS styling system |
| **Analytics** | `posthog-js` | `^1.360.0` | Optional privacy-conscious event tracking |

---

## 📁 Source Directory Map

```
src/
├── components/
│   ├── canvas/
│   │   ├── corridor/
│   │   │   ├── InfiniteCorridorManager.jsx   # Virtualized corridor segment spawner
│   │   │   ├── CorridorSegment.jsx           # Single segment geometry & walls
│   │   │   ├── DoorSection.jsx               # Angled door unit with tilt & camera entry
│   │   │   ├── Doodles.jsx                   # Floating corridor sketch decorations
│   │   │   ├── RoomWarmup.jsx                # gl.compileAsync off-screen shader pre-compiler
│   │   │   └── TeleportRoom.jsx              # Instant cross-room portal mount
│   │   ├── entrance/
│   │   │   ├── EntranceDoors.jsx             # 3D double doors with handle depression
│   │   │   ├── EmptyCorridor.jsx             # Background hallway visible before entering
│   │   │   ├── GoldenSnitch.jsx              # Autonomous hovering snitch with wing flap
│   │   │   ├── WindowBoy.jsx                 # Boy character waving from castle window
│   │   │   ├── CatObserver.jsx               # Sketch cat with cursor-tracking eyes
│   │   │   ├── BugElement.jsx                # Clickable bug with "BUG FIXED" effect
│   │   │   └── SignSystem.jsx                # Swinging wooden "PORTFOLIO" sign
│   │   ├── rooms/
│   │   │   ├── Gallery/                      # GalleryRoom, Clothesline, ProjectCard, Birds
│   │   │   ├── Studio/                       # StudioRoom, MonitorTower, MonitorItem
│   │   │   ├── About/                        # AboutRoom, InfiniteSkyManager, SkillBalloon
│   │   │   ├── Contact/                      # ContactRoom, MessagePaper, SeaWaves, Bottle
│   │   │   └── Wispr/                        # WisprRoom, AudioVisualizerMesh
│   │   └── Experience.jsx                    # Root 3D world mounting and camera coordination
│   ├── dom/
│   │   ├── Preloader.jsx                     # Footsteps animation & loading bar
│   │   └── PaperTransition.jsx               # Torn parchment room transition wipe
│   └── ui/
│       ├── NavigationUI.jsx                  # Map modal, audio drawer, achievements trigger
│       ├── AchievementsPanel.jsx             # Quests and Secrets live counter
│       ├── GlobalOverlay.jsx                 # Full-screen project / monitor inspect modal
│       ├── KonamiSecretModal.jsx             # Headmaster secret developer chamber
│       ├── ProjectCategoryBar.jsx            # Gallery category filters
│       └── ScreenReaderOverlay.jsx           # Semantic SEO & A11y DOM fallback
├── context/
│   ├── SceneContext.jsx                      # Current room, camera teleport, door states
│   ├── AudioManager.jsx                      # Positional audio, volume sliders, sound triggers
│   ├── PerformanceContext.jsx                # HIGH / MED / LOW tier auto-detection
│   └── AchievementsContext.jsx               # 6 Quests + 7 Discoverable Secrets tracking
├── hooks/
│   ├── useInfiniteCamera.js                  # Wheel/keyboard scroll along corridor Z-axis
│   ├── useMouseParallax.js                   # Subtle viewport parallax response
│   └── useDocumentMeta.js                    # Dynamic title & Open Graph tag updater
├── shaders/
│   └── RevealMaterial.jsx                    # Custom GLSL alpha-threshold reveal shader
└── styles/
    ├── main.scss                             # Global typography, reset, blueprint dark mode
    └── [Component].scss                      # Scoped SCSS files for UI components
```

---

## 🎨 Visual Identity & Asset Guidelines

- **Theme:** Enchanted hand-drawn pencil sketches on weathered parchment paper (`#fafafa` / `#f0f0f0`).
- **Inverted Theme:** Blueprint Nocturnal Mode triggered by the `B` key (swaps CSS to deep blueprint navy `#0e1b2e` and glowing cyan lines).
- **Typography:**
  - `CabinSketch-Regular.ttf` & `CabinSketch-Bold.ttf` for hand-drawn headlines and 3D mesh signage.
  - `Inter` for crisp body copy and technical inspect modals.
- **Texture Format:** All assets must be optimized `.webp` or transparent `.png` with pre-baked global tinting (no runtime shadow map overhead).

---

## 🚪 Door Entry & Camera Timing Architecture

The door opening sequence has been engineered for maximum responsiveness:
- **Instant Click Feedback:** Handle depresses within `0.15s`, accompanied by an amber door-glow aura (`opacity: 0.85`).
- **Door Swing:** Angled door swings open smoothly in `0.42s`.
- **Camera Fly-Through:** Overlapping camera fly begins at `0.16s` and completes within `0.85s`, delivering an instant entry experience.
- **Room Mount Delay:** Cut down to `3 frames` for instantaneous rendering.

---

## 🗝️ Discoverable Secrets Reference

| Secret ID | Name | Trigger Action | Location |
|-----------|------|----------------|----------|
| `secret_coffee` | Caffeine Boost | Click the steaming developer coffee cup | Corridor desk |
| `secret_404` | Curious Seeker | Click the miniature 404 door on the wall | Corridor segment 1 |
| `secret_airplane` | Ace Pilot | Click the origami paper airplane | Corridor floating doodles |
| `secret_avatar` | Nimbus Rider | Click the wizard broomstick | Corridor corner |
| `secret_blueprint` | Night Owl | Press `B` or `b` on the keyboard | Global |
| `secret_balloon` | Sharp Shooter | Click any floating skill balloon | About Room |
| `secret_konami` | Marauder Master | Enter `↑ ↑ ↓ ↓ ← → ← → B A` | Global |

---

## ⚡ Performance Best Practices

1. **Never allocate objects in `useFrame`:** Avoid `new THREE.Vector3()` or `new THREE.Color()` inside render loops. Always reuse module-level or `useRef` scratch instances.
2. **Never call `setState` in `useFrame`:** Write directly to `mesh.current.position` or `mesh.current.material.uniforms`.
3. **Use `RevealMaterial` for color reveals:** Do not swap mesh materials on hover; update `material.uniforms.uProgress.value` using GSAP.
4. **Respect `performanceTier`:** Always check whether `isLowTier` is active to disable secondary particle emitters, high DPR settings, and offscreen heavy calculations.

---

## 🧪 Testing & Verification

```bash
# Start local dev server
npm run dev

# Run full production build
npm run build

# Preview production build locally
npm run preview
```

*Maintained by Harsh Karn • Last Updated: November 2026*
