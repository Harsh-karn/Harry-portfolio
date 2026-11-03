import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useScene } from '../../context/SceneContext';
import WisprDossier from '../canvas/rooms/WisprFlow/WisprDossier';
import '../../styles/WisprDossier.scss';

const WisprUIOverlay = () => {
    const { currentRoom } = useScene();
    const isWisprRoom = currentRoom === 'wispr-flow';

    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('brief');
    const dockRef = useRef(null);

    // Listen for custom event from 3D room objects
    useEffect(() => {
        const handleOpenTab = (e) => {
            const tab = e.detail?.tabId || 'brief';
            setActiveTab(tab);
            setIsDossierOpen(true);
        };

        window.addEventListener('open-wispr-tab', handleOpenTab);
        return () => window.removeEventListener('open-wispr-tab', handleOpenTab);
    }, []);

    // Close dossier if user leaves the room
    useEffect(() => {
        if (!isWisprRoom) {
            setIsDossierOpen(false);
        }
    }, [isWisprRoom]);

    const handleDockClick = useCallback((tabId) => {
        setActiveTab(tabId);
        setIsDossierOpen(true);
    }, []);

    // Horizontal wheel scroll for quick dock
    const handleDockWheel = useCallback((e) => {
        if (dockRef.current) {
            dockRef.current.scrollLeft += e.deltaY;
        }
    }, []);

    if (!isWisprRoom) return null;

    return (
        <>
            {/* 🧭 IN-ROOM STUDIO QUICK-DOCK (HUD) */}
            {!isDossierOpen && (
                <div
                    ref={dockRef}
                    onWheel={handleDockWheel}
                    className="wispr-quick-dock"
                    role="navigation"
                    aria-label="Wispr Flow Studio Sections"
                >
                    <span className="dock-label">GROWTH STUDIO:</span>
                    <button onClick={() => handleDockClick('brief')} type="button">📜 The Brief</button>
                    <button onClick={() => handleDockClick('growth')} type="button">🔄 Growth Loop</button>
                    <button onClick={() => handleDockClick('experiments')} type="button">🧪 3 Experiments</button>
                    <button onClick={() => handleDockClick('creative')} type="button">🎨 Creative Side</button>
                    <button onClick={() => handleDockClick('why')} type="button">✉️ Why Wispr Flow</button>
                    <button onClick={() => handleDockClick('strengths')} type="button">✦ What I Bring</button>
                    <button onClick={() => handleDockClick('roadmap')} type="button">⏱️ First 30 Days</button>
                    <button onClick={() => handleDockClick('voice')} type="button">🎙️ Built With Voice</button>
                </div>
            )}

            {/* 📜 RICH INTERACTIVE DOSSIER OVERLAY */}
            <WisprDossier
                isOpen={isDossierOpen}
                onClose={() => setIsDossierOpen(false)}
                initialTab={activeTab}
            />
        </>
    );
};

export default WisprUIOverlay;

