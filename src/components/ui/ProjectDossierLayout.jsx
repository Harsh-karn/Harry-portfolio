import React, { useEffect } from 'react';
import { useAudio } from '../../context/AudioManager';
import '../../styles/ProjectDossier.scss';

export default function ProjectDossierLayout({ project = {}, onClose }) {
    const { playPaper } = useAudio();

    // Play paper sound on mount (opening dossier)
    useEffect(() => {
        playPaper(0.7);
    }, [playPaper]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                playPaper(0.6);
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, playPaper]);

    if (!project || !project.title) return null;

    const {
        num,
        title,
        fullTitle,
        categoryDisplay,
        isFeatured,
        whatItDoes,
        techStack = [],
        highlights = [],
        github,
        liveDemo,
        textureFront
    } = project;

    return (
        <div className="project-dossier-root">
            {/* Dossier Header */}
            <div className="dossier-top-meta">
                <div className="dossier-id-badge">
                    <span className="badge-ink">ARCHIVE NO. {num || '01'}</span>
                    <span className="badge-sep">/</span>
                    <span className="badge-cat">{categoryDisplay || 'ENGINEERING BUILD'}</span>
                    {isFeatured && (
                        <span className="badge-core">★ CORE ARCHIVE BUILD</span>
                    )}
                </div>

                <div className="dossier-header-actions">
                    <button
                        type="button"
                        onClick={() => {
                            playPaper(0.6);
                            onClose?.();
                        }}
                        className="dossier-return-btn"
                        title="Return to Archive (ESC)"
                    >
                        <span>✕ CLOSE DOSSIER</span>
                        <span className="esc-hint">ESC</span>
                    </button>
                </div>
            </div>

            {/* Main Title & Subtitle */}
            <div className="dossier-title-block">
                <h2 className="dossier-codeword">{title}</h2>
                <h3 className="dossier-full-title">{fullTitle || title}</h3>
            </div>

            <div className="dossier-content-body">
                {/* Left Column: Blueprint Schematic & Live Links */}
                <div className="dossier-left-col">
                    <div className="dossier-blueprint-frame">
                        <div className="blueprint-top-bar">
                            <span className="schematic-label">SCHEMATIC ID: HK-{num || '01'}</span>
                            <span className="schematic-scale">SCALE 1:1</span>
                        </div>
                        {textureFront ? (
                            <img
                                src={textureFront}
                                alt={`${title} Architectural Blueprint`}
                                className="blueprint-schematic-img"
                                loading="lazy"
                            />
                        ) : (
                            <div className="blueprint-placeholder">
                                <span>[ ARCHITECTURAL SCHEMATIC RECORD ]</span>
                            </div>
                        )}
                        <div className="blueprint-bottom-bar">
                            <span>VERIFIED IN HARSH KARN ARCHIVES</span>
                        </div>
                    </div>

                    {/* Action Links */}
                    <div className="dossier-links-box">
                        {github && (
                            <a
                                href={github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dossier-link-btn github-btn"
                            >
                                <svg viewBox="0 0 24 24" className="link-icon">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                                <span>Inspect Repository</span>
                                <span className="arrow-sym">↗</span>
                            </a>
                        )}

                        {liveDemo && (
                            <a
                                href={liveDemo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dossier-link-btn live-btn"
                            >
                                <span className="bolt-icon">⚡</span>
                                <span>Launch Live Application</span>
                                <span className="arrow-sym">↗</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed Specification & Stack */}
                <div className="dossier-right-col">
                    {/* What It Does Section */}
                    <div className="dossier-section">
                        <div className="section-header">
                            <span className="section-num">01.</span>
                            <span className="section-title">FUNCTIONAL PURPOSE & OPERATION</span>
                        </div>
                        <div className="dossier-parchment-box">
                            <p className="dossier-what-it-does">{whatItDoes}</p>
                        </div>
                    </div>

                    {/* Architecture Highlights */}
                    {highlights && highlights.length > 0 && (
                        <div className="dossier-section">
                            <div className="section-header">
                                <span className="section-num">02.</span>
                                <span className="section-title">ARCHITECTURAL HIGHLIGHTS</span>
                            </div>
                            <ul className="dossier-highlights-list">
                                {highlights.map((item, idx) => (
                                    <li key={idx} className="highlight-item">
                                        <span className="item-marker">✓</span>
                                        <span className="item-text">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Technology Stack Badges */}
                    <div className="dossier-section">
                        <div className="section-header">
                            <span className="section-num">03.</span>
                            <span className="section-title">VERIFIED TECHNOLOGY STACK</span>
                        </div>
                        <div className="dossier-stack-chips">
                            {techStack.map((tech, idx) => (
                                <span key={idx} className="tech-chip">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Provenance Stamp */}
                    <div className="dossier-provenance">
                        <div className="provenance-stamp">
                            <span className="stamp-title">AUTHENTIC ARCHIVE SPECIFICATION</span>
                            <span className="stamp-sub">HARSH KARN • ARTIST &amp; DEVELOPER</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
