import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScene } from '../../context/SceneContext';
import { useAudio } from '../../context/AudioManager';
import { setMusicVolume, getMusicVolume } from '../../utils/audioManager';
import { useAchievements } from '../../context/AchievementsContext';
import AchievementPopup from './AchievementPopup';
import AchievementsPanel from './AchievementsPanel';
import '../../styles/NavigationUI.scss';

// Room data for the map - positions are percentages on the map image
// These positions correspond to the visual elements on the map
const ROOMS = [
    {
        id: 'about',
        label: 'MY STORY',
        shortLabel: 'STORY',
        emblem: '/textures/corridor/magical/emblem_story.webp',
        x: 43,
        y: 38,
        desc: 'Building thoughtful software and intelligent systems that solve real problems.'
    },
    {
        id: 'gallery',
        label: 'MY BUILDS',
        shortLabel: 'BUILDS',
        emblem: '/textures/corridor/magical/emblem_builds.webp',
        x: 43,
        y: 72,
        desc: 'Inventions & Projects'
    },
    {
        id: 'contact',
        label: 'SAY HI',
        shortLabel: 'SAY HI',
        emblem: '/textures/corridor/magical/emblem_sayhi.webp',
        x: 57,
        y: 25,
        desc: 'Parchment & Seal'
    },
    {
        id: 'studio',
        label: 'MY LAB',
        shortLabel: 'LAB',
        emblem: '/textures/corridor/magical/emblem_lab.webp',
        x: 57,
        y: 55,
        desc: 'A little beyond the code.'
    },
    {
        id: 'wispr-flow',
        label: 'WISPR FLOW',
        shortLabel: 'WISPR',
        emblem: '/textures/corridor/magical/emblem_wispr.webp',
        x: 50,
        y: 46,
        desc: 'Voice-First AI'
    }
];

// Pin starting position - the dashed circle at the bottom of the tower
const PIN_START_POSITION = { x: 50.5, y: 97 };

const NavigationUI = () => {
    const { currentRoom, isInRoom, requestExit, hasEntered, teleportTo, isTeleporting } = useScene();
    const { isMuted, globalVolume, setGlobalVolume, playPaper, playWhoosh, playDoorCreak } = useAudio();
    const { showTutorial } = useAchievements();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredRoom, setHoveredRoom] = useState(null);
    const [isExiting, setIsExiting] = useState(false); // Track when back button is clicked

    // Audio controls state
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [bgmVol, setBgmVol] = useState(() => (typeof window !== 'undefined' ? getMusicVolume() : 0.3));
    const [isUIHidden, setIsUIHidden] = useState(false);

    // Refs for focus management
    const mapPanelRef = useRef();
    const mapCloseRef = useRef();

    useEffect(() => {
        const handleInspectChange = (e) => {
            setIsUIHidden(e.detail);
            if (e.detail) {
                setIsMenuOpen(false);
                setIsAudioMenuOpen(false);
                setIsAchievementsOpen(false);
            }
        };
        window.addEventListener('inspectChange', handleInspectChange);
        return () => window.removeEventListener('inspectChange', handleInspectChange);
    }, []);

    const aboutMapRef = useRef(null);
    const galleryMapRef = useRef(null);
    const contactMapRef = useRef(null);
    const studioMapRef = useRef(null);

    useEffect(() => {
        // About (zone: left 10%, top 20%, width 30%, height 35%)
        // -> X: 10% to 40%, Y: 20% to 55%
        if (aboutMapRef.current) {
            gsap.to(aboutMapRef.current, {
                clipPath: (hoveredRoom === 'about' || currentRoom === 'about')
                    ? 'polygon(10% 20%, 40% 20%, 40% 55%, 10% 55%)'
                    : 'polygon(10% 20%, 10% 20%, 10% 55%, 10% 55%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Gallery (zone: left 10%, bottom 8%, width 30%, height 35%)
        // -> X: 10% to 40%, Y: 57% to 92% (since bottom=8% means top is 100-8-35=57%)
        if (galleryMapRef.current) {
            gsap.to(galleryMapRef.current, {
                clipPath: (hoveredRoom === 'gallery' || currentRoom === 'gallery')
                    ? 'polygon(10% 57%, 40% 57%, 40% 92%, 10% 92%)'
                    : 'polygon(10% 57%, 10% 57%, 10% 92%, 10% 92%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Contact (zone: right 5%, top 10%, width 35%, height 25%)
        // -> X: 60% to 95% (since right=5% means left is 100-5-35=60%), Y: 10% to 35%
        if (contactMapRef.current) {
            gsap.to(contactMapRef.current, {
                clipPath: (hoveredRoom === 'contact' || currentRoom === 'contact')
                    ? 'polygon(60% 10%, 95% 10%, 95% 35%, 60% 35%)'
                    : 'polygon(95% 10%, 95% 10%, 95% 35%, 95% 35%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Studio (zone: right 15%, bottom 19%, width 25%, height 40%)
        // -> X: 60% to 85% (since right=15% means left is 100-15-25=60%), Y: 41% to 81% (since bottom=19% means top is 100-19-40=41%)
        if (studioMapRef.current) {
            gsap.to(studioMapRef.current, {
                clipPath: (hoveredRoom === 'studio' || currentRoom === 'studio')
                    ? 'polygon(60% 41%, 85% 41%, 85% 81%, 60% 81%)'
                    : 'polygon(85% 41%, 85% 41%, 85% 81%, 85% 81%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [hoveredRoom, currentRoom]);

    useEffect(() => {
        const handleMusicVolumeChange = (e) => {
            setBgmVol(e.detail);
        };
        window.addEventListener('musicVolumeChanged', handleMusicVolumeChange);

        return () => window.removeEventListener('musicVolumeChanged', handleMusicVolumeChange);
    }, []);

    const handleBgmChange = (val) => {
        setBgmVol(val);
        setMusicVolume(val);
    };

    // Show entrance hint before entering, and explore hint when user enters
    useEffect(() => {
        if (!hasEntered && !isTeleporting) {
            showTutorial('corridor_enter');
        } else if (hasEntered && !isTeleporting && !isInRoom) {
            showTutorial('corridor_explore');
        }
    }, [hasEntered, isTeleporting, isInRoom, showTutorial]);

    // Close menu when entering a room or starting teleport
    useEffect(() => {
        if (isInRoom || isTeleporting) {
            requestAnimationFrame(() => {
                setIsMenuOpen(false);
                setIsAudioMenuOpen(false);
                setIsAchievementsOpen(false);
                setIsExiting(false);
            });
        }
    }, [isInRoom, isTeleporting]);

    // A4: Focus management for map panel - auto-focus, Escape, and focus trap
    useEffect(() => {
        if (isMenuOpen) {
            // Auto-focus on close button when map opens
            setTimeout(() => mapCloseRef.current?.focus(), 100);
        }
    }, [isMenuOpen]);

    // Global Escape key handler - closes any open panel
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (isMenuOpen) setIsMenuOpen(false);
                if (isAudioMenuOpen) setIsAudioMenuOpen(false);
                if (isAchievementsOpen) setIsAchievementsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen, isAudioMenuOpen, isAchievementsOpen]);

    // Focus trap handler for map panel
    const handleMapKeyDown = (e) => {
        if (e.key !== 'Tab' || !mapPanelRef.current) return;

        const focusable = mapPanelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            // Shift+Tab on first element → wrap to last
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            // Tab on last element → wrap to first
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    const handleRoomClick = (roomId) => {
        // Don't teleport to the same room or if already teleporting
        if (roomId === currentRoom || isTeleporting) return;

        playPaper(0.8);
        playWhoosh(0.7);

        // Close map first, then start teleport
        setIsMenuOpen(false);
        setIsAudioMenuOpen(false);
        setIsAchievementsOpen(false);
        teleportTo(roomId);
    };

    const handleBackClick = () => {
        setIsExiting(true); // Immediately start exit animation
        playDoorCreak(0.7);
        playWhoosh(0.6);
        // Request exit - DoorSection will handle the animation
        requestExit();
    };

    return (
        <div className="navigation-ui">
            {/* Global Achievement Popup */}
            <AchievementPopup />

            {/* Global Harsh Karn Brand Identity & Realm Indication */}
            {hasEntered && (
                <div className={`nav-brand-tag ${isUIHidden ? 'ui-hidden' : ''}`}>
                    <div className="brand-crest-symbol">✦</div>
                    <div className="brand-text-group">
                        <span className="brand-author-name">HARSH KARN</span>
                        <span className="brand-current-realm">
                            {isInRoom ? (
                                ROOMS.find(r => r.id === currentRoom)?.label || 'ENCHANTED SANCTUM'
                            ) : (
                                'ARCHIVE CORRIDOR'
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Back Button - Only visible in rooms, hides up when clicked */}
            {hasEntered && isInRoom && (
                <button
                    className={`nav-btn back-btn ${isExiting ? 'exiting' : ''}`}
                    onClick={handleBackClick}
                    aria-label="Back to corridor"
                    title="Return to Corridor"
                >
                    <svg viewBox="0 0 24 24" className="icon-back">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span className="back-btn-text">CORRIDOR</span>
                </button>
            )}

            {/* Right side controls - Only visible after entering */}
            {hasEntered && (
                <div className={`nav-controls ${isMenuOpen || isAudioMenuOpen ? 'menu-open' : ''} ${isUIHidden ? 'ui-hidden' : ''}`}>
                    {/* Hamburger Menu Button */}
                    <button
                        className={`nav-btn hamburger-btn ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => {
                            playPaper(0.7);
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="hamburger-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    {/* Audio Toggle Button */}
                    <button
                        className={`nav-btn audio-btn ${isAudioMenuOpen ? 'open' : ''}`}
                        onClick={() => {
                            playPaper(0.4);
                            setIsAudioMenuOpen(!isAudioMenuOpen);
                        }}
                        aria-label="Audio Settings"
                        aria-expanded={isAudioMenuOpen}
                    >
                        {isMuted ? (
                            <svg viewBox="0 0 24 24" className="icon-audio">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <line x1="23" y1="9" x2="17" y2="15" />
                                <line x1="17" y1="9" x2="23" y2="15" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="icon-audio">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <path d="M15 9a5 5 0 0 1 0 6" />
                                <path d="M18 5a9 9 0 0 1 0 14" />
                            </svg>
                        )}
                    </button>
                    {/* Achievements Toggle Button */}
                    <button
                        className={`nav-btn achievements-btn ${isAchievementsOpen ? 'open' : ''}`}
                        onClick={() => {
                            setIsAchievementsOpen(!isAchievementsOpen);
                        }}
                        aria-label="Achievements"
                        aria-expanded={isAchievementsOpen}
                    >
                        <svg viewBox="0 0 24 24" className="icon-trophy">
                            <path d="M8 21h8M12 17v4M7 4h10M5 4h14v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7z" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 9H3V6h2" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 9h2V6h-2" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Map Panel - Drops from top when open */}
            {hasEntered && (
                <div className={`map-panel ${isMenuOpen ? 'open' : ''}`} inert={!isMenuOpen ? true : undefined} ref={mapPanelRef} onKeyDown={handleMapKeyDown} role="dialog" aria-label="Map">
                    {/* SVG Border Overlay */}
                    <svg
                        className="map-border-overlay"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 10
                        }}
                    >
                        <path
                            d="M 0 0 L 100 0 L 100 0 L 99 3 L 100 6 L 98 10 L 100 14 L 99 18 L 100 22 L 98 26 L 100 30 L 99 35 L 100 40 L 98 45 L 100 50 L 99 55 L 100 60 L 98 65 L 100 70 L 99 75 L 100 80 L 98 85 L 100 90 L 99 95 L 100 100 L 96 99 L 92 100 L 88 98 L 84 100 L 80 99 L 76 100 L 72 98 L 68 100 L 64 99 L 60 100 L 56 98 L 52 100 L 48 99 L 44 100 L 40 98 L 36 100 L 32 99 L 28 100 L 24 98 L 20 100 L 16 99 L 12 100 L 8 98 L 4 100 L 0 99 L 0.5 99.5 L 1 95 L 0 90 L 2 85 L 0 80 L 1 75 L 0 70 L 2 65 L 0 60 L 1 55 L 0 50 L 2 45 L 0 40 L 1 35 L 0 30 L 2 26 L 0 22 L 1 18 L 0 14 L 2 10 L 0 6 L 1 3 L 0 0 Z"
                            fill="none"
                            stroke="#1a1a1a"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    <div className="map-content-clipped">
                        <div className="map-header">
                            <div className="map-compass" aria-hidden="true">
                                <svg viewBox="0 0 100 100" className="compass-svg">
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#2a221b" strokeWidth="1.5" strokeDasharray="3 3" />
                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#5a4e3f" strokeWidth="1" />
                                    <polygon points="50,8 54,46 50,50 46,46" fill="#833c46" stroke="#2a221b" strokeWidth="1" />
                                    <polygon points="50,92 54,54 50,50 46,54" fill="#fdfbf7" stroke="#2a221b" strokeWidth="1" />
                                    <polygon points="92,50 54,54 50,50 54,46" fill="#fdfbf7" stroke="#2a221b" strokeWidth="1" />
                                    <polygon points="8,50 46,54 50,50 46,46" fill="#fdfbf7" stroke="#2a221b" strokeWidth="1" />
                                    <line x1="22" y1="22" x2="78" y2="78" stroke="#2a221b" strokeWidth="0.8" strokeDasharray="2 2" />
                                    <line x1="22" y1="78" x2="78" y2="22" stroke="#2a221b" strokeWidth="0.8" strokeDasharray="2 2" />
                                    <text x="50" y="7" textAnchor="middle" fontSize="10" fontFamily="'Cabin Sketch', cursive" fontWeight="bold" fill="#833c46">N</text>
                                    <text x="50" y="99" textAnchor="middle" fontSize="8" fontFamily="'Cabin Sketch', cursive" fill="#2a221b">S</text>
                                    <text x="98" y="53" textAnchor="middle" fontSize="8" fontFamily="'Cabin Sketch', cursive" fill="#2a221b">E</text>
                                    <text x="3" y="53" textAnchor="middle" fontSize="8" fontFamily="'Cabin Sketch', cursive" fill="#2a221b">W</text>
                                    <circle cx="50" cy="50" r="3" fill="#d49b43" stroke="#2a221b" strokeWidth="1" />
                                </svg>
                            </div>
                            <div className="map-title-block">
                                <h3>MAGICAL ARCHIVE MAP</h3>
                                <span className="map-subtitle">HARSH KARN • SELECT SANCTUM TO QUICK-TRAVEL</span>
                            </div>
                            <button
                                ref={mapCloseRef}
                                className="close-btn"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Close map"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="map-container">
                            {/* Map background image */}
                            <img src="/images/map.webp" alt="Portfolio Map" className="map-image" />

                            {/* Painted Map Overlays */}
                            <img ref={aboutMapRef} src="/images/map_about_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(10% 20%, 10% 20%, 10% 55%, 10% 55%)' }} />
                            <img ref={galleryMapRef} src="/images/map_gallery_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(10% 57%, 10% 57%, 10% 92%, 10% 92%)' }} />
                            <img ref={contactMapRef} src="/images/map_contact_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(95% 10%, 95% 10%, 95% 35%, 95% 35%)' }} />
                            <img ref={studioMapRef} src="/images/map_studio_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(85% 41%, 85% 41%, 85% 81%, 85% 81%)' }} />

                            {/* Hand-drawn magical stars & constellation ink doodles */}
                            <svg className="map-stars-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <g fill="#3a3227" opacity="0.45">
                                    <polygon points="20,18 21,21 24,22 21,23 20,26 19,23 16,22 19,21" />
                                    <polygon points="85,15 86,17 88,18 86,19 85,21 84,19 82,18 84,17" />
                                    <polygon points="18,80 19,82 22,83 19,84 18,87 17,84 14,83 17,82" />
                                    <polygon points="82,82 83,84 86,85 83,86 82,88 81,86 78,85 81,84" />
                                    <polygon points="50,32 50.8,33.5 52.5,34 50.8,34.5 50,36 49.2,34.5 47.5,34 49.2,33.5" fill="#833c46" />
                                    <line x1="20" y1="26" x2="43" y2="38" stroke="#833c46" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.3" />
                                    <line x1="85" y1="21" x2="57" y2="25" stroke="#833c46" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.3" />
                                </g>
                            </svg>

                            {/* Wispr Flow Centerpiece Artwork with subtle soundwave pulse */}
                            <div
                                className={`map-wispr-centerpiece ${hoveredRoom === 'wispr-flow' || currentRoom === 'wispr-flow' ? 'active' : ''}`}
                                onClick={() => handleRoomClick('wispr-flow')}
                                title="Wispr Flow - Voice-First AI"
                            >
                                <img src="/textures/corridor/magical/emblem_wispr.webp" alt="Wispr Flow" className="wispr-centerpiece-img" />
                            </div>

                            {/* Hover Zones - all 5 destinations */}
                            <button
                                type="button"
                                className="map-hover-zone zone-about"
                                onMouseEnter={() => setHoveredRoom('about')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('about')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('about')}
                                aria-label="Teleport to My Story"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-gallery"
                                onMouseEnter={() => setHoveredRoom('gallery')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('gallery')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('gallery')}
                                aria-label="Teleport to My Builds"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-contact"
                                onMouseEnter={() => setHoveredRoom('contact')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('contact')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('contact')}
                                aria-label="Teleport to Say Hi"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-studio"
                                onMouseEnter={() => setHoveredRoom('studio')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('studio')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('studio')}
                                aria-label="Teleport to My Lab"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-wispr"
                                onMouseEnter={() => setHoveredRoom('wispr-flow')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('wispr-flow')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('wispr-flow')}
                                aria-label="Teleport to Wispr Flow"
                            />

                            {/* Permanent Map Text Labels */}
                            <div className="map-room-label about">MY STORY</div>
                            <div className="map-room-label gallery">MY<br />BUILDS</div>
                            <div className="map-room-label contact">SAY HI</div>
                            <div className="map-room-label studio">MY<br />LAB</div>
                            <div className="map-room-label wispr-flow">WISPR<br />FLOW</div>

                            {/* Pin slot markers - all 5 locations */}
                            {ROOMS.map((room) => (
                                <button
                                    key={room.id}
                                    className={`pin-slot ${room.id} ${currentRoom === room.id ? 'active' : ''} ${hoveredRoom === room.id ? 'hovered' : ''}`}
                                    style={{ left: `${room.x}%`, top: `${room.y}%` }}
                                    onClick={() => handleRoomClick(room.id)}
                                    onMouseEnter={() => setHoveredRoom(room.id)}
                                    onMouseLeave={() => setHoveredRoom(null)}
                                    title={`${room.label} • ${room.desc}`}
                                >
                                    <img src="/images/pin-slot.webp" alt="" className="slot-image" />
                                    <span className="slot-emblem-badge">
                                        <img src={room.emblem} alt="" className="emblem-mini-icon" />
                                    </span>
                                </button>
                            ))}

                            {/* The pin marker - moves to hovered slot, or current room, or start position */}
                            <div
                                className="pin-marker"
                                style={{
                                    left: `${hoveredRoom
                                        ? ROOMS.find(r => r.id === hoveredRoom)?.x || PIN_START_POSITION.x
                                        : currentRoom && isInRoom
                                            ? ROOMS.find(r => r.id === currentRoom)?.x || PIN_START_POSITION.x
                                            : PIN_START_POSITION.x
                                        }%`,
                                    top: `${hoveredRoom
                                        ? ROOMS.find(r => r.id === hoveredRoom)?.y || PIN_START_POSITION.y
                                        : currentRoom && isInRoom
                                            ? ROOMS.find(r => r.id === currentRoom)?.y || PIN_START_POSITION.y
                                            : PIN_START_POSITION.y
                                        }%`
                                }}
                            >
                                <img src="/images/pin.webp" alt="You are here" className="pin-image" />
                            </div>

                            {/* Corridor Entrance Marker Label */}
                            <div className="map-corridor-label">
                                <span>CORRIDOR ENTRANCE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audio Panel - drops down from the button */}
            {hasEntered && (
                <div className={`audio-panel ${isAudioMenuOpen ? 'open' : ''}`} inert={!isAudioMenuOpen ? true : undefined}>
                    <div className="audio-card">
                        <div className="audio-header">
                            <h3>AUDIO SETTINGS</h3>
                            <button
                                className="close-btn"
                                onClick={() => setIsAudioMenuOpen(false)}
                                aria-label="Close audio settings"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="audio-sliders-container">
                            <div className="slider-group">
                                <div className="slider-label">
                                    <span>Music</span>
                                    <span>{Math.round(bgmVol * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={bgmVol}
                                    onChange={(e) => handleBgmChange(parseFloat(e.target.value))}
                                    className="paper-slider"
                                    aria-label="Music volume"
                                    aria-valuetext={`${Math.round(bgmVol * 100)} percent`}
                                />
                            </div>
                            <div className="slider-group">
                                <div className="slider-label">
                                    <span>SFX</span>
                                    <span>{Math.round(globalVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={globalVolume}
                                    onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
                                    className="paper-slider"
                                    aria-label="SFX volume"
                                    aria-valuetext={`${Math.round(globalVolume * 100)} percent`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements Panel */}
            <AchievementsPanel
                isOpen={isAchievementsOpen}
                onClose={() => setIsAchievementsOpen(false)}
            />

            {/* Overlay to close menus */}
            {(isMenuOpen || isAudioMenuOpen || isAchievementsOpen) && (
                <div
                    className="menu-overlay"
                    onClick={() => {
                        setIsMenuOpen(false);
                        setIsAudioMenuOpen(false);
                        setIsAchievementsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default NavigationUI;
