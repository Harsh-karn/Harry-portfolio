import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioManager';
import '../../styles/KonamiSecretModal.scss';

export default function KonamiSecretModal({ isOpen, onClose }) {
    const modalRef = useRef();
    const { play } = useAudio();

    useEffect(() => {
        if (isOpen) {
            play('spell');
            if (modalRef.current) {
                gsap.fromTo(modalRef.current,
                    { scale: 0.75, opacity: 0, y: 40 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }
                );
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="konami-modal-backdrop" onClick={onClose}>
            <div
                className="konami-modal-card"
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-gold-crest">
                    <svg viewBox="0 0 100 100" className="crest-svg">
                        <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#fcf8f0" stroke="#b8860b" strokeWidth="3" />
                        <text x="50" y="58" textAnchor="middle" fontSize="32" fill="#b8860b">⚡</text>
                    </svg>
                </div>

                <div className="modal-badge">KONAMI CODE UNLOCKED</div>
                <h2 className="modal-title">MISCHIEF MANAGED!</h2>
                <p className="modal-subtitle">You discovered the Ancient Developer Chamber</p>

                <div className="modal-body-text">
                    <p>
                        "I solemnly swear that I am up to no good."
                    </p>
                    <p className="modal-desc">
                        Congratulations, master explorer! You have uncovered the hidden developer room. 
                        All corridor secrets, miniature doors, and interactive spells across this enchanted sketch world 
                        are now recorded in your <strong>Secrets Log</strong>.
                    </p>
                </div>

                <div className="modal-footer-keys">
                    <span className="key-tag">↑</span>
                    <span className="key-tag">↑</span>
                    <span className="key-tag">↓</span>
                    <span className="key-tag">↓</span>
                    <span className="key-tag">←</span>
                    <span className="key-tag">→</span>
                    <span className="key-tag">←</span>
                    <span className="key-tag">→</span>
                    <span className="key-tag">B</span>
                    <span className="key-tag">A</span>
                </div>

                <button className="modal-action-btn" onClick={onClose}>
                    ENTER SECRET REALM
                </button>
            </div>
        </div>
    );
}

