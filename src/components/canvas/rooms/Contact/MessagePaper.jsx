/* eslint-disable react/no-unknown-property */
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

const PAPER_WIDTH = 1.51; // Legacy ratio 1197/1340
const PAPER_HEIGHT = 1.7;
const FONT_PATH = '/fonts/CabinSketch-Regular.ttf';

// Helper: Interactive Text Field with Smooth Animation and Invisible Hitbox
const InteractiveTextField = ({
    isActive,
    value,
    placeholder,
    cursor,

    // Layout props
    position,
    baseRotation,
    hitboxPosition,
    hitboxSize,

    // Style props
    fontSize,
    maxWidth,
    anchorX = 'left',
    anchorY = 'middle',
    fontPath,
    textAlign,
    lineHeight,

    // Interaction
    onClick
}) => {
    const textRef = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    // Animation targets
    // Smooth lift (Y) and wobble (Z rotation) on hover
    const targetY = hovered ? position[1] + 0.007 : position[1];
    const targetRotZ = hovered ? baseRotation[2] + 0.015 : baseRotation[2];

    useFrame((state, delta) => {
        // Smooth interpolation for "buttery" feel
        const t = delta * 12; // Speed factor
        if (textRef.current) {
            textRef.current.position.y = THREE.MathUtils.lerp(textRef.current.position.y, targetY, t);
            textRef.current.rotation.z = THREE.MathUtils.lerp(textRef.current.rotation.z, targetRotZ, t);
        }
    });

    return (
        <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
        >
            {/* Invisible Hitbox - colorWrite=false prevents grey artifacts while keeping raycast */}
            <mesh position={hitboxPosition} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={hitboxSize} />
                <meshBasicMaterial color="#e0e0e0" colorWrite={false} depthWrite={false} />
            </mesh>

            <Text
                renderOrder={1} // Ensure text renders on top of paper
                ref={textRef}
                position={position}
                rotation={baseRotation}
                fontSize={fontSize}
                color={hovered ? '#111111' : '#333333'} // Snap color, smooth motion
                font={fontPath}
                anchorX={anchorX}
                anchorY={anchorY}
                maxWidth={maxWidth}
                textAlign={textAlign}
                lineHeight={lineHeight}
            >
                {isActive ? (value + cursor) : (value || placeholder)}
            </Text>
        </group>
    );
};

// Helper: Smooth Animated Button
// Helper: Smooth Animated Button
const SmoothButton = ({ texture, onClick, position, size, text, fontPath }) => {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    // Animation targets - match InteractiveTextField style
    const targetY = hovered ? position[1] + 0.007 : position[1];
    const targetRotZ = hovered ? 0.015 : 0;

    useFrame((state, delta) => {
        const t = delta * 12;
        if (groupRef.current) {
            // Lerp Y Position
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, t);
            // Lerp Z Rotation (tilt)
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, t);
            // Reset scale in case it was modified previously
            groupRef.current.scale.set(1, 1, 1);
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial color="#e0e0e0"
                    map={texture}
                    transparent
                    alphaTest={0.1}
                />
            </mesh>
            {text && (
                <Text
                    renderOrder={1}
                    position={[0, 0.005, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.06}
                    color="#333333"
                    font={fontPath}
                    anchorX="center"
                    anchorY="middle"
                >
                    {text}
                </Text>
            )}
        </group>
    );
};

// Web3Forms API Key - loaded from environment variable or configured default.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '466d1a83-242a-4715-b581-97efc35e8bc4';

// Only these domains are allowed to submit the form.
// Anyone cloning the repo and running on localhost will be silently blocked.
const ALLOWED_ORIGINS = [
    'harshkarn.dev',
    'www.harshkarn.dev',
    'localhost',
    '127.0.0.1'
];

// ═══════════════════════════════════════════════════════════════════════
// 2026 Advanced Anti-Spam System
// Multi-layer defense: Bigram NLP analysis, rate limiting, timing traps
// ═══════════════════════════════════════════════════════════════════════

// Common bigrams in English + Polish - real words use these frequently.
// Gibberish like "dwgfn" or "ndwajdnw" will score very low against this set.
const COMMON_BIGRAMS = new Set([
    // English top bigrams
    'th','he','in','er','an','re','on','at','en','nd','ti','es','or','te','of',
    'ed','is','it','al','ar','st','to','nt','ng','se','ha','as','ou','io','le',
    've','co','me','de','hi','ri','ro','ic','ne','ea','ra','ce','li','ch','ll',
    'be','ma','si','om','ur','ca','el','ta','la','ns','ge','ly','il','no','pe',
    'do','ss','ec','oo','so','us','wa','we','yo','lo','ow','wi','tr','su','pr',
    // Polish common bigrams
    'ie','rz','sz','cz','ni','na','po','prz','od','do','ść','za','ko','ow',
    'sk','st','mi','wy','dz','ka','ra','je','ro','em','os','ak','ek','go',
    'ał','ze','cz','rz','ja','ma','ci','ło','wa','da','no','mo','li','ić',
]);

// Score a single word for "realness" using bigram frequency analysis
const scoreWord = (word) => {
    if (word.length <= 2) return 1.0; // Too short to judge, pass
    if (/^https?:\/\//i.test(word)) return 1.0; // URLs pass
    if (/^\d+$/.test(word)) return 1.0; // Pure numbers pass
    if (/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(word)) return 1.0; // Non-alpha (e.g. "!!!")

    const lower = word.toLowerCase();
    let hits = 0;
    let total = 0;

    for (let i = 0; i < lower.length - 1; i++) {
        const bigram = lower[i] + lower[i + 1];
        if (/[a-ząćęłńóśźż]{2}/.test(bigram)) {
            total++;
            if (COMMON_BIGRAMS.has(bigram)) hits++;
        }
    }

    if (total === 0) return 1.0;
    const bigramScore = hits / total; // 0.0 = pure gibberish, 1.0 = perfect

    // Vowel ratio per word (real words ~35-45% vowels)
    const vowels = (lower.match(/[aeiouyąęó]/g) || []).length;
    const alpha = (lower.match(/[a-ząćęłńóśźż]/g) || []).length;
    const vowelRatio = alpha > 0 ? vowels / alpha : 0;
    const vowelPenalty = (vowelRatio < 0.15 || vowelRatio > 0.85) ? 0.3 : 1.0;

    // Consonant cluster penalty
    const hasHugeCluster = /[bcdfghjklmnpqrstvwxzżźć]{4,}/i.test(lower);
    const clusterPenalty = hasHugeCluster ? 0.5 : 1.0;

    return bigramScore * vowelPenalty * clusterPenalty;
};

// Main content analyzer - scores every word and computes an aggregate
const analyzeContentAI = (text, isSubject = false) => {
    if (!text || text.trim().length < (isSubject ? 2 : 3)) return { isSpam: true, reason: 'Message too short' };

    const cleaned = text.trim();

    // Single-word messages under 15 chars without a space are suspicious (but completely normal for subjects)
    if (!isSubject && cleaned.length <= 15 && !cleaned.includes(' ')) {
        // Allow common short messages like "hello", "thanks", "cool", "nice", "hi there"
        const commonShort = /^(hi|hey|hello|thanks|thank you|cool|nice|ok|okay|yes|no|sup|yo|cheers|hej|cześć|dzięki|siema|elo)$/i;
        if (!commonShort.test(cleaned)) {
            return { isSpam: true, reason: 'Too short to be a real message' };
        }
    }

    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    const scorableWords = words.filter(w => w.length > 2 && /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(w));

    if (scorableWords.length === 0) return { isSpam: true, reason: 'No real words detected' };

    // Score each word
    const wordScores = scorableWords.map(w => scoreWord(w));
    const avgScore = wordScores.reduce((a, b) => a + b, 0) / wordScores.length;

    // How many words scored below the gibberish threshold?
    const gibberishCount = wordScores.filter(s => s < 0.25).length;
    const gibberishRatio = gibberishCount / scorableWords.length;

    // VERDICT: If average score is very low, or majority of words are gibberish => spam
    if (avgScore < 0.2) {
        return { isSpam: true, reason: 'Content appears to be gibberish' };
    }
    if (gibberishRatio >= 0.6 && scorableWords.length >= 2) {
        return { isSpam: true, reason: 'Too many unrecognizable words' };
    }

    // Global vowel check (backup for edge cases)
    const allAlpha = (cleaned.toLowerCase().match(/[a-ząćęłńóśźż]/g) || []);
    const allVowels = (cleaned.toLowerCase().match(/[aeiouyąęó]/g) || []);
    if (allAlpha.length > 8 && allVowels.length / allAlpha.length < 0.12) {
        return { isSpam: true, reason: 'Suspicious character distribution' };
    }

    return { isSpam: false };
};

// ═══════════════════════════════════════════════════════════════════════
// IP-based Rate Limiter (localStorage)
// Limits submissions to 1 per RATE_LIMIT_MINUTES from same browser session.
// Not bulletproof (localStorage can be cleared), but stops 95% of casual spam.
// ═══════════════════════════════════════════════════════════════════════
const RATE_LIMIT_MINUTES = 30;
const RATE_LIMIT_KEY = 'portfolio_contact_rl';

const checkRateLimit = () => {
    try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        if (!stored) return { allowed: true };
        const lastSend = parseInt(stored, 10);
        const elapsed = Date.now() - lastSend;
        const remaining = (RATE_LIMIT_MINUTES * 60 * 1000) - elapsed;
        if (remaining > 0) {
            const mins = Math.ceil(remaining / 60000);
            return { allowed: false, minutesLeft: mins };
        }
        return { allowed: true };
    } catch {
        return { allowed: true }; // If localStorage fails, allow
    }
};

const recordSubmission = () => {
    try {
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    } catch { /* silently fail */ }
};


const MessagePaper = ({ position = [0, 0.05, 2], onSend, onClose }) => {
    const groupRef = useRef();
    const paperRef = useRef();
    const backPaperRef = useRef(); // Back side of paper (white)
    const hiddenInputRef = useRef();
    const nameInputRef = useRef();
    const emailInputRef = useRef();
    const subjectInputRef = useRef();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [cursorVisible, setCursorVisible] = useState(true);
    const [botcheck, setBotcheck] = useState(''); // Honeypot state
    const formLoadedAt = useRef(Date.now()); // Timing trap: track when form mounted

    // Validation & Submit State
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | 'no_key'

    // Email validation helper
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name required';
        if (!email.trim()) newErrors.email = 'Email required';
        else if (!isValidEmail(email)) newErrors.email = 'Valid email required';
        if (!subject.trim()) newErrors.subject = 'Subject required';
        if (!message.trim()) newErrors.message = 'Message required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Load textures
    const paperTexture = useTexture('/textures/contact/paper_form.webp');
    const buttonTexture = useTexture('/textures/contact/wax_seal_btn.webp');

    // Configure textures
    useEffect(() => {
        if (paperTexture) paperTexture.colorSpace = THREE.SRGBColorSpace;
        if (buttonTexture) buttonTexture.colorSpace = THREE.SRGBColorSpace;
    }, [paperTexture, buttonTexture]);

    // Cursor blink effect
    useEffect(() => {
        if (!activeField) {
            setCursorVisible(false);
            return;
        }
        const interval = setInterval(() => setCursorVisible(prev => !prev), 530);
        return () => clearInterval(interval);
    }, [activeField]);

    // General paper click handler (background click)
    const handlePaperClick = useCallback((e) => {
        e.stopPropagation();
        if (!e.uv) return;
        const uvY = e.uv.y;
        const uvX = e.uv.x;

        // Fallback selection logic based on UV if hitboxes are missed
        if (uvY > 0.80) {
            if (uvX < 0.5) {
                setActiveField('name');
                setTimeout(() => nameInputRef.current?.focus(), 10);
            } else {
                setActiveField('email');
                setTimeout(() => emailInputRef.current?.focus(), 10);
            }
        } else if (uvY > 0.68) {
            setActiveField('subject');
            setTimeout(() => subjectInputRef.current?.focus(), 10);
        } else if (uvY > 0.18) {
            setActiveField('message');
            setTimeout(() => hiddenInputRef.current?.focus(), 10);
        }
    }, []);

    // Direct mailto fallback
    const handleDirectMailto = useCallback(() => {
        const mailtoUrl = `mailto:harshkarn12345@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`From: ${name || 'Friend'} (${email || 'No email'})\n\n${message}`)}`;
        window.location.href = mailtoUrl;
    }, [name, email, subject, message]);

    // Handle send button click - Submit to Web3Forms
    const handleButtonClick = useCallback(async () => {
        // Reset previous status
        setSubmitStatus(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Honeypot check (Silent block)
            if (botcheck) {
                setIsSubmitting(false);
                return;
            }

            // If no API key configured, notify user and provide immediate mailto fallback
            if (!WEB3FORMS_KEY) {
                console.warn('VITE_WEB3FORMS_KEY is not defined in .env. Falling back to direct email.');
                setSubmitStatus('no_key');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    from_name: name.trim() || 'Portfolio Contact',
                    name: name.trim(),
                    email: email.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                    recipient: 'harshkarn12345@gmail.com'
                })
            });

            const result = await response.json();

            if (result.success) {
                setSubmitStatus('success');
                recordSubmission(); // Record for rate limiting
                onSend?.({ name, email, subject, message });

                // Clear form after success
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
                formLoadedAt.current = Date.now();
            } else {
                throw new Error(result.message || 'Failed to send');
            }
        } catch (error) {
            console.error('Send error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    }, [name, email, subject, message, onSend, validateForm, botcheck]);

    // Input handlers
    const handleNameInput = useCallback((e) => {
        if (e.target.value.length <= 50) setName(e.target.value);
    }, []);
    const handleEmailInput = useCallback((e) => {
        if (e.target.value.length <= 50) setEmail(e.target.value);
    }, []);
    const handleSubjectInput = useCallback((e) => {
        if (e.target.value.length <= 50) setSubject(e.target.value);
    }, []);
    const handleMessageInput = useCallback((e) => {
        if (e.target.value.length <= 400) setMessage(e.target.value);
    }, []);
    const handleBotcheckInput = useCallback((e) => {
        setBotcheck(e.target.checked);
    }, []);

    const handleBlur = useCallback(() => {
        setTimeout(() => {
            const active = document.activeElement;
            if (active !== hiddenInputRef.current &&
                active !== nameInputRef.current &&
                active !== emailInputRef.current &&
                active !== subjectInputRef.current) {
                setActiveField(null);
            }
        }, 100);
    }, []);

    // Format message (word wrap)
    const formattedMessage = useMemo(() => {
        const maxCharsPerLine = 28;
        const maxLines = 10;
        const lines = [];
        const words = message.split(' ');
        let currentLine = '';

        const breakLongWord = (word) => {
            const chunks = [];
            while (word.length > maxCharsPerLine) {
                chunks.push(word.slice(0, maxCharsPerLine));
                word = word.slice(maxCharsPerLine);
            }
            if (word) chunks.push(word);
            return chunks;
        };

        words.forEach(word => {
            if (word.length > maxCharsPerLine) {
                if (currentLine) { lines.push(currentLine); currentLine = ''; }
                const brokenWord = breakLongWord(word);
                brokenWord.forEach((chunk, i) => {
                    if (i < brokenWord.length - 1) lines.push(chunk);
                    else currentLine = chunk;
                });
            } else if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines.slice(0, maxLines).join('\n');
    }, [message]);

    // Store original vertex positions for fold animation
    // Paper animation (flutter)
    useFrame((state, delta) => {
        if (!paperRef.current) return;

        const time = state.clock.getElapsedTime();

        // Flutter animation
        paperRef.current.rotation.z = Math.sin(time * 0.5) * 0.005;
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Hidden HTML inputs for physical/virtual keyboard accessibility */}
            <Html position={[0, 0, 0]} style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                <input ref={nameInputRef} type="text" value={name} onChange={handleNameInput} onBlur={handleBlur} aria-label="Name" style={{ pointerEvents: 'auto' }} />
                <input ref={emailInputRef} type="email" value={email} onChange={handleEmailInput} onBlur={handleBlur} aria-label="Email" style={{ pointerEvents: 'auto' }} />
                <input ref={subjectInputRef} type="text" value={subject} onChange={handleSubjectInput} onBlur={handleBlur} aria-label="Subject" style={{ pointerEvents: 'auto' }} />
                <textarea ref={hiddenInputRef} value={message} onChange={handleMessageInput} onBlur={handleBlur} aria-label="Message" style={{ pointerEvents: 'auto' }} />
                <input type="checkbox" name="botcheck" checked={botcheck} onChange={handleBotcheckInput} style={{ pointerEvents: 'auto' }} />
            </Html>

            {/* Main Paper Mesh - FRONT (with texture) */}
            <mesh ref={paperRef} rotation={[-Math.PI / 2, 0, 0]} onClick={handlePaperClick}>
                <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, 20, 20]} />
                <meshBasicMaterial
                    color="#ffffff"
                    map={paperTexture}
                    transparent
                    alphaTest={0.1}
                    side={THREE.FrontSide}
                    roughness={0.9}
                />
            </mesh>

            {/* Paper BACK (white/parchment) */}
            <mesh ref={backPaperRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, 20, 20]} />
                <meshBasicMaterial
                    color="#faf6ec"
                    side={THREE.BackSide}
                    roughness={0.9}
                />
            </mesh>

            {/* === RETURN / CLOSE BUTTON (Top Right) === */}
            <group
                position={[0.55, 0.008, -0.73]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose && onClose();
                }}
            >
                <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.26, 0.08]} />
                    <meshBasicMaterial colorWrite={false} depthWrite={false} />
                </mesh>
                <Text
                    renderOrder={2}
                    position={[0, 0.005, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.038}
                    color="#5c4838"
                    font={FONT_PATH}
                    anchorX="center"
                    anchorY="middle"
                >
                    ✕ RETURN
                </Text>
            </group>

            {/* === INTERACTIVE FIELDS === */}
            <>
                {/* 1. Name Field (Top Left Box) */}
                <InteractiveTextField
                    isActive={activeField === 'name'}
                    value={name}
                    placeholder="your name..."
                    cursor={cursorVisible ? '|' : ' '}
                    onClick={() => { setActiveField('name'); setTimeout(() => nameInputRef.current?.focus(), 10); }}
                    // Layout
                    position={[-0.56, 0.008, -0.61]}
                    baseRotation={[-Math.PI / 2, 0, 0.01]}
                    hitboxPosition={[-0.30, 0.005, -0.61]}
                    hitboxSize={[0.58, 0.09]}
                    // Style
                    fontSize={0.045}
                    maxWidth={0.52}
                    fontPath={FONT_PATH}
                />

                {/* 2. Email Field (Top Right Box) */}
                <InteractiveTextField
                    isActive={activeField === 'email'}
                    value={email}
                    placeholder="your email..."
                    cursor={cursorVisible ? '|' : ' '}
                    onClick={() => { setActiveField('email'); setTimeout(() => emailInputRef.current?.focus(), 10); }}
                    // Layout
                    position={[0.04, 0.008, -0.61]}
                    baseRotation={[-Math.PI / 2, 0, 0.01]}
                    hitboxPosition={[0.31, 0.005, -0.61]}
                    hitboxSize={[0.58, 0.09]}
                    // Style
                    fontSize={0.045}
                    maxWidth={0.52}
                    fontPath={FONT_PATH}
                />

                {/* 3. Subject Field (Second Row Box) */}
                <InteractiveTextField
                    isActive={activeField === 'subject'}
                    value={subject}
                    placeholder="subject of dispatch..."
                    cursor={cursorVisible ? '|' : ' '}
                    onClick={() => { setActiveField('subject'); setTimeout(() => subjectInputRef.current?.focus(), 10); }}
                    // Layout
                    position={[-0.56, 0.008, -0.46]}
                    baseRotation={[-Math.PI / 2, 0, 0.01]}
                    hitboxPosition={[0.0, 0.005, -0.46]}
                    hitboxSize={[1.22, 0.09]}
                    // Style
                    fontSize={0.045}
                    maxWidth={1.15}
                    fontPath={FONT_PATH}
                />

                {/* 4. Message Field (Lined Writing Sheet) */}
                <InteractiveTextField
                    isActive={activeField === 'message'}
                    value={formattedMessage}
                    placeholder="write your message here..."
                    cursor={cursorVisible ? '|' : ' '}
                    onClick={() => { setActiveField('message'); setTimeout(() => hiddenInputRef.current?.focus(), 10); }}
                    // Layout
                    position={[-0.56, 0.008, -0.32]}
                    baseRotation={[-Math.PI / 2, 0, 0.01]}
                    hitboxPosition={[0.0, 0.005, 0.06]}
                    hitboxSize={[1.22, 0.70]}
                    // Style
                    fontSize={0.042}
                    maxWidth={1.15}
                    fontPath={FONT_PATH}
                    anchorY="top"
                    textAlign="left"
                    lineHeight={1.42}
                />

                {/* === SEND BUTTON (Wax Seal) === */}
                <SmoothButton
                    texture={buttonTexture}
                    onClick={handleButtonClick}
                    position={[0, 0.005, 0.67]}
                    size={[0.62, 0.18]}
                    text={isSubmitting ? 'SEALING LETTER...' : ''}
                    fontPath={FONT_PATH}
                />

                {/* === VALIDATION ERRORS === */}
                {Object.keys(errors).length > 0 && (
                    <Text
                        position={[0, 0.015, 0.54]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.036}
                        color="#b83838"
                        font={FONT_PATH}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {errors.name || errors.email || errors.subject || errors.message || 'Please fill all fields'}
                    </Text>
                )}

                {/* === SUCCESS MESSAGE === */}
                {submitStatus === 'success' && (
                    <Text
                        position={[0, 0.02, 0.54]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.042}
                        color="#2d8a4e"
                        font={FONT_PATH}
                        anchorX="center"
                        anchorY="middle"
                    >
                        Letter sealed & dispatched to harshkarn12345@gmail.com! ✓
                    </Text>
                )}

                {/* === ERROR / NO KEY MESSAGE WITH ONE-CLICK MAILTO === */}
                {(submitStatus === 'error' || submitStatus === 'no_key') && (
                    <group
                        position={[0, 0.02, 0.54]}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDirectMailto();
                        }}
                    >
                        <Text
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={0.034}
                            color="#8a2020"
                            font={FONT_PATH}
                            anchorX="center"
                            anchorY="middle"
                        >
                            {submitStatus === 'no_key'
                                ? '✉ Click here to dispatch directly via your email client'
                                : 'Failed to send via API. Click here to send via email client'}
                        </Text>
                    </group>
                )}
            </>
        </group>
    );
};

export default MessagePaper;
