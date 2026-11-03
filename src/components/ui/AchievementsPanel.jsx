import React, { useState } from 'react';
import { useAchievements, ACHIEVEMENTS, SECRETS } from '../../context/AchievementsContext';
import '../../styles/AchievementsPanel.scss';

const AchievementsPanel = ({ isOpen, onClose }) => {
    const { completed = [] } = useAchievements() || {};
    const safeCompleted = Array.isArray(completed) ? completed : [];
    const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'secrets'

    const questList = Object.values(ACHIEVEMENTS || {});
    const secretList = Object.values(SECRETS || {});

    const completedQuests = questList.filter(q => safeCompleted.includes(q.id));
    const completedSecrets = secretList.filter(s => safeCompleted.includes(s.id));

    return (
        <div className={`achievements-panel ${isOpen ? 'open' : ''}`} inert={!isOpen ? true : undefined}>
            <div className="achievements-card">
                <div className="achievements-header">
                    <div className="tabs-container">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'quests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('quests')}
                        >
                            QUESTS ({completedQuests.length}/{questList.length})
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'secrets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('secrets')}
                        >
                            SECRETS ({completedSecrets.length}/{secretList.length})
                        </button>
                    </div>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close achievements"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {activeTab === 'quests' ? (
                    <div className="achievements-list">
                        {questList.map((achievement) => {
                            const isUnlocked = safeCompleted.includes(achievement.id);
                            return (
                                <div key={achievement.id} className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                                    <div className="achievement-icon">
                                        {isUnlocked ? (
                                            <svg viewBox="0 0 24 24" className="icon-unlocked">
                                                <path d="M12 15l-3-3 1.4-1.4 1.6 1.6 4.6-4.6L18 9" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="10" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="icon-locked">
                                                <rect x="7" y="11" width="10" height="8" rx="2" fill="none" stroke="#666" strokeWidth="2" />
                                                <path d="M9 11V8a3 3 0 0 1 6 0v3" fill="none" stroke="#666" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="achievement-text">
                                        <div className="achievement-title">{achievement.title}</div>
                                        <div className="achievement-label">{achievement.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="achievements-list secrets-list">
                        {secretList.map((secret) => {
                            const isUnlocked = safeCompleted.includes(secret.id);
                            return (
                                <div key={secret.id} className={`achievement-item secret-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                                    <div className="achievement-icon">
                                        {isUnlocked ? (
                                            <svg viewBox="0 0 24 24" className="icon-secret-unlocked">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#d4af37" stroke="#8a6d1c" strokeWidth="1.5" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="icon-secret-locked">
                                                <circle cx="12" cy="12" r="9" fill="none" stroke="#888" strokeWidth="1.8" strokeDasharray="3 3" />
                                                <text x="12" y="16" textAnchor="middle" fill="#888" fontSize="13" fontWeight="bold">?</text>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="achievement-text">
                                        <div className="achievement-title">
                                            {isUnlocked ? secret.title : '??? Hidden Secret'}
                                        </div>
                                        <div className="achievement-label">
                                            {isUnlocked ? secret.label : 'Explore and interact with the world to discover'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="achievements-footer">
                    {activeTab === 'quests' ? (
                        <span>{completedQuests.length} / {questList.length} QUESTS COMPLETED</span>
                    ) : (
                        <div className="secrets-progress-wrapper">
                            <div className="secrets-progress-track">
                                <div
                                    className="secrets-progress-fill"
                                    style={{ width: `${Math.round((completedSecrets.length / secretList.length) * 100)}%` }}
                                />
                            </div>
                            <span className="secrets-progress-label">
                                {completedSecrets.length === secretList.length
                                    ? '🏆 GRAND MARAUDER: ALL SECRETS FOUND!'
                                    : `${completedSecrets.length} / ${secretList.length} SECRETS DISCOVERED`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPanel;
