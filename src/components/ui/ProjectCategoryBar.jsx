import React, { useState, useEffect } from 'react';
import { useScene } from '../../context/SceneContext';
import { useAudio } from '../../context/AudioManager';
import { PROJECT_CATEGORIES, PROJECTS_DATA } from '../../data/projectsData';
import '../../styles/ProjectCategoryBar.scss';

export default function ProjectCategoryBar() {
    const { currentRoom, isInRoom, isTeleporting, overlayContent } = useScene();
    const { playPaper } = useAudio();
    const [activeCategory, setActiveCategory] = useState('all');
    const [isIndexOpen, setIsIndexOpen] = useState(false);
    const [isCardSelected, setIsCardSelected] = useState(false);

    // Track when a 3D card is active/open to soften filters and prevent occlusion
    useEffect(() => {
        const handleCardSelection = (e) => {
            setIsCardSelected(!!e.detail?.isSelected);
        };
        window.addEventListener('gallery-card-selection-changed', handleCardSelection);
        return () => window.removeEventListener('gallery-card-selection-changed', handleCardSelection);
    }, []);

    const isGallery = currentRoom === 'gallery';

    // Only visible in MY BUILDS ('gallery') room - removed from MY LAB ('studio') as requested
    const isVisible = isInRoom && isGallery && !isTeleporting && !overlayContent;

    // Reset filter when leaving room or switching room
    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setActiveCategory('all');
            setIsIndexOpen(false);
            setIsCardSelected(false);
        });
        return () => cancelAnimationFrame(frameId);
    }, [currentRoom, isVisible]);

    const handleCategoryClick = (categoryId) => {
        playPaper(0.6);
        setActiveCategory(categoryId);
        window.dispatchEvent(
            new CustomEvent('gallery-category-filter', {
                detail: { categoryId }
            })
        );
    };

    const handleProjectJump = (projectId, index) => {
        playPaper(0.75);
        setIsIndexOpen(false);
        window.dispatchEvent(
            new CustomEvent('gallery-project-jump', {
                detail: { projectId, index }
            })
        );
    };

    if (!isVisible) return null;

    const categories = PROJECT_CATEGORIES;
    const realmLabel = 'ARCHIVE INDEX';

    const getCount = (catId) => {
        if (catId === 'all') return PROJECTS_DATA.length;
        return PROJECTS_DATA.filter(p => p.categories && p.categories.includes(catId)).length;
    };

    return (
        <aside
            className={`project-category-bar-wrapper ${isCardSelected ? 'is-card-active' : ''}`}
            aria-label={`${realmLabel} Category Filters`}
        >
            <div className="project-category-bar">
                {/* Hand-drawn Left Title Tag */}
                <div className="filter-realm-tag">
                    <span className="tag-icon">✦</span>
                    <span className="tag-text">{realmLabel}</span>
                </div>

                {/* Filter Pills */}
                <div className="filter-pills-row" role="tablist">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        const count = getCount(cat.id);
                        return (
                            <button
                                key={cat.id}
                                role="tab"
                                aria-selected={isActive}
                                className={`category-filter-pill ${isActive ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat.id)}
                            >
                                <span className="pill-label">{cat.label}</span>
                                <span className="pill-count">({count})</span>
                                {isActive && <span className="pill-scribble-indicator" />}
                            </button>
                        );
                    })}
                </div>

                {/* Quick Catalog Drawer Toggle (Builds room only) */}
                {isGallery && (
                    <div className="filter-quick-toggle">
                        <button
                            type="button"
                            className={`quick-list-btn ${isIndexOpen ? 'open' : ''}`}
                            onClick={() => setIsIndexOpen(!isIndexOpen)}
                            title="Browse all 10 builds catalog"
                        >
                            <span>📜 ALL BUILDS</span>
                            <span className="toggle-chevron">{isIndexOpen ? '▲' : '▼'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Catalog Dropdown for Builds Room */}
            {isGallery && isIndexOpen && (
                <div className="quick-catalog-dropdown">
                    <div className="catalog-header">
                        <span>SELECT TO JUMP DIRECTLY TO BLUEPRINT:</span>
                        <button
                            type="button"
                            className="catalog-close"
                            onClick={() => setIsIndexOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="catalog-grid">
                        {PROJECTS_DATA.map((p, idx) => (
                            <button
                                key={p.id}
                                type="button"
                                className="catalog-item-btn"
                                onClick={() => handleProjectJump(p.id, idx)}
                            >
                                <span className="item-num">{p.num}</span>
                                <div className="item-info">
                                    <span className="item-name">{p.title}</span>
                                    <span className="item-sub">{p.categoryDisplay}</span>
                                </div>
                                {p.isFeatured && <span className="featured-dot" title="Core Build">★</span>}
                                {p.liveDemo && <span className="live-dot" title="Live Application Available">⚡</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
