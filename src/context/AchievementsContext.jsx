import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import posthog from 'posthog-js';

export const ACHIEVEMENTS = {
    corridor_enter: { id: 'corridor_enter', label: 'Click a door to enter', title: 'Explorer', category: 'quest' },
    corridor_explore: { id: 'corridor_explore', label: 'Scroll to explore the corridor', title: 'Wanderer', category: 'quest' },
    about_fly: { id: 'about_fly', label: 'Scroll to fly through my story', title: 'Sky Walker', category: 'quest' },
    studio_interact: { id: 'studio_interact', label: 'Drag to rotate and browse', title: 'Director', category: 'quest' },
    gallery_inspect: { id: 'gallery_inspect', label: 'Click project to inspect', title: 'Art Critic', category: 'quest' },
    contact_choose: { id: 'contact_choose', label: 'Find a contact method', title: 'Sociable', category: 'quest' }
};

export const SECRETS = {
    secret_coffee: { id: 'secret_coffee', label: 'Tapped the steaming dev coffee mug', title: 'Caffeine Boost', category: 'secret' },
    secret_404: { id: 'secret_404', label: 'Rattled the miniature 404 Room door', title: 'Curious Seeker', category: 'secret' },
    secret_airplane: { id: 'secret_airplane', label: 'Triggered paper plane aerobatics', title: 'Ace Pilot', category: 'secret' },
    secret_avatar: { id: 'secret_avatar', label: 'Summoned the wizard broomstick', title: 'Nimbus Rider', category: 'secret' },
    secret_blueprint: { id: 'secret_blueprint', label: 'Activated Blueprint Nocturnal Mode (B)', title: 'Night Owl', category: 'secret' },
    secret_balloon: { id: 'secret_balloon', label: 'Popped the floating skill balloons', title: 'Sharp Shooter', category: 'secret' },
    secret_konami: { id: 'secret_konami', label: 'Entered the legendary Konami Code', title: 'Marauder Master', category: 'secret' }
};

export const ALL_ITEMS = { ...ACHIEVEMENTS, ...SECRETS };

const defaultAchievements = {
    completed: [],
    activePopup: null,
    showTutorial: (id) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('show_tutorial', { detail: id }));
        }
    },
    unlockAchievement: (id) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('unlock_achievement', { detail: id }));
        }
    },
    hidePopup: () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hide_popup'));
        }
    }
};

const AchievementsContext = createContext(defaultAchievements);

export const AchievementsProvider = ({ children }) => {
    // Synchronous ref to prevent double-firing on rapid events (like wheel scroll)
    const completedRef = useRef([]);

    // Load completed achievements from local storage
    const [completed, setCompleted] = useState(() => {
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('harsh_achievements') : null;
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // Add to pool, but ignore 'corridor_enter' so the entrance tooltip always appears
                    const filtered = parsed.filter(id => id !== 'corridor_enter');
                    completedRef.current = [...filtered];
                    return filtered;
                }
            }
            return [];
        } catch (e) {
            return [];
        }
    });

    // Lazy global AudioContext to avoid creating it on every unlock
    const audioCtxRef = useRef(null);

    // Simple WebAudio chime for achievement unlock
    const playUnlockChime = useCallback(() => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            // Initialize once and reuse
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioCtx();
            }

            const ctx = audioCtxRef.current;

            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }

            if (ctx.state !== 'running') return;

            const gain = ctx.createGain();
            const osc = ctx.createOscillator();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';

            // Nice "ding-ding" interval (A4 -> E5)
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);

            // Envelope for volume
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        } catch (err) {
            // Silently fail if blocked by browser policy
        }
    }, []);

    // Currently displayed popup
    // Structure: { id: 'corridor_enter', status: 'pending' | 'completed' | 'hiding' }
    const [activePopup, setActivePopup] = useState(null);

    // Save to localStorage when completed changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const toSave = completed.filter(id => id !== 'corridor_enter');
            localStorage.setItem('harsh_achievements', JSON.stringify(toSave));
        }
    }, [completed]);

    const showTutorial = useCallback((id) => {
        if (ACHIEVEMENTS[id] && !completed.includes(id) && (!activePopup || activePopup.status === 'hiding')) {
            setTimeout(() => {
                setActivePopup({ id, status: 'pending' });
            }, 50);
        }
    }, [completed, activePopup]);

    const unlockAchievement = useCallback((id) => {
        if (!completedRef.current.includes(id)) {
            completedRef.current.push(id);

            setCompleted(prev => {
                const updated = [...prev, id];
                if (typeof window !== 'undefined') {
                    const toSave = updated.filter(item => item !== 'corridor_enter');
                    localStorage.setItem('harsh_achievements', JSON.stringify(toSave));
                }
                return updated;
            });

            // Send event to PostHog
            const achievementData = ALL_ITEMS[id] || ACHIEVEMENTS[id];
            if (achievementData) {
                posthog.capture('achievement_unlocked', {
                    achievement_id: id,
                    achievement_title: achievementData.title,
                });
            }

            // Trigger sound effect
            playUnlockChime();

            setActivePopup(prev => {
                if (prev && prev.id === id) {
                    setTimeout(() => {
                        setActivePopup(p => p && p.id === id ? { ...p, status: 'hiding' } : p);
                        setTimeout(() => {
                            setActivePopup(p => p && p.id === id ? null : p);
                        }, 500);
                    }, 2000);
                    return { ...prev, status: 'completed' };
                } else {
                    setTimeout(() => {
                        setActivePopup(p => p && p.id === id ? { ...p, status: 'hiding' } : p);
                        setTimeout(() => {
                            setActivePopup(p => p && p.id === id ? null : p);
                        }, 500);
                    }, 3000);
                    return { id, status: 'completed' };
                }
            });
        }
    }, [playUnlockChime]);

    const hidePopup = useCallback(() => {
        if (activePopup && activePopup.status !== 'hiding') {
            setActivePopup(prev => prev ? { ...prev, status: 'hiding' } : null);
            setTimeout(() => {
                setActivePopup(null);
            }, 500);
        }
    }, [activePopup]);

    // Cross-boundary listener for events from Canvas or hooks
    useEffect(() => {
        const handleUnlock = (e) => {
            if (e?.detail) unlockAchievement(e.detail);
        };
        const handleTutorial = (e) => {
            if (e?.detail) showTutorial(e.detail);
        };
        const handleHide = () => {
            hidePopup();
        };

        window.addEventListener('unlock_achievement', handleUnlock);
        window.addEventListener('show_tutorial', handleTutorial);
        window.addEventListener('hide_popup', handleHide);

        return () => {
            window.removeEventListener('unlock_achievement', handleUnlock);
            window.removeEventListener('show_tutorial', handleTutorial);
            window.removeEventListener('hide_popup', handleHide);
        };
    }, [unlockAchievement, showTutorial, hidePopup]);

    return (
        <AchievementsContext.Provider value={{
            completed,
            activePopup,
            showTutorial,
            unlockAchievement,
            hidePopup
        }}>
            {children}
        </AchievementsContext.Provider>
    );
};

export const useAchievements = () => {
    const context = useContext(AchievementsContext);
    return context || defaultAchievements;
};
