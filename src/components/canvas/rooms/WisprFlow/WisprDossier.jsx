import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../../../../context/AudioManager';
import '../../../../styles/WisprDossier.scss';

const TABS = [
    { id: 'brief', label: 'The Brief', num: '01' },
    { id: 'growth', label: 'Growth Framework', num: '02' },
    { id: 'experiments', label: 'Experiments', num: '03' },
    { id: 'creative', label: 'Creative Side', num: '04' },
    { id: 'why', label: 'Why Wispr Flow', num: '05' },
    { id: 'strengths', label: 'What I Bring', num: '06' },
    { id: 'roadmap', label: 'First 30 Days', num: '07' },
    { id: 'voice', label: 'Built With Voice', num: '08' }
];

const GROWTH_STAGES = [
    {
        num: '01',
        title: 'UNDERSTAND',
        question: 'Who are we trying to reach?',
        details: 'Growth always starts with the user’s world. Before prescribing solutions or launching campaigns, I seek to deeply understand the audience: their immediate frustrations, daily workflows, emotional friction, and the core jobs they are hiring the product to do.',
        tactics: [
            'Audit customer feedback, community discussions, and user interviews.',
            'Map the exact moment typing feels like a bottleneck during their day.',
            'Segment users by high-friction intent (engineers writing docs, founders drafting pitches, writers overcoming blank screens).'
        ]
    },
    {
        num: '02',
        title: 'POSITION',
        question: 'Why should they care?',
        details: 'Clarity beats cleverness every time. The goal is to articulate the product’s transformative value in language so sharp and relatable that the benefit is obvious within five seconds.',
        tactics: [
            'Frame voice-first writing not as "dictation software," but as thinking out loud at the speed of conversation.',
            'Make the contrast visceral: drafting an essay in 3 minutes vs. 20 minutes staring at a blinking cursor.',
            'Align the value proposition directly with the tools they already use every day.'
        ]
    },
    {
        num: '03',
        title: 'EXPERIMENT',
        question: 'What could we try?',
        details: 'Rather than betting everything on unproven assumptions, I approach growth through rapid, structured hypothesis testing across creative messaging, landing pages, interactive hooks, and onboarding journeys.',
        tactics: [
            'Test message angles (time-saved vs. natural flow vs. effortless drafting).',
            'Prototype high-intent micro-landing pages tailored to specific practitioner niches.',
            'Design creative short-form visual workflows showing instantaneous real-time transcription magic.'
        ]
    },
    {
        num: '04',
        title: 'DISTRIBUTE',
        question: 'How do we reach the right people?',
        details: 'Great products deserve intentional distribution. Growth compounds when you meet people inside their natural habitats, like communities, forums, social channels, and collaborative networks.',
        tactics: [
            'Seed authentic use-cases inside high-density builder communities on X, Reddit, and LinkedIn.',
            'Collaborate with creators who already demonstrate their daily thinking and writing workflows online.',
            'Create shareable interactive artifacts and word-of-mouth triggers that encourage organic recommendation.'
        ]
    },
    {
        num: '05',
        title: 'MEASURE & ITERATE',
        question: 'What did we learn?',
        details: 'Data gives honest direction. I study quantitative metrics alongside qualitative sentiment to separate signal from noise, double down on what drives retention, and quickly abandon what fails.',
        tactics: [
            'Track activation milestones: time from install to first 100 transcribed words.',
            'Identify drop-off friction points in onboarding.',
            'Feed quantitative learnings straight back into Stage 01 to continually refine the loop.'
        ]
    }
];

const EXPERIMENTS = [
    {
        id: 'exp1',
        num: 'EXPERIMENT 01',
        title: 'MESSAGE TESTING',
        question: 'Which product message makes the value of voice-first writing easiest to understand?',
        hypothesis: 'Framing Wispr Flow around "Thinking at the speed of thought without typing fatigue" will generate higher trial intent among knowledge workers than purely quantitative "Write 3x faster" messaging.',
        angles: [
            'Angle A (Speed): "Write 3x faster than your keyboard."',
            'Angle B (Natural Expression): "Speak raw thoughts. Get polished, eloquent writing."',
            'Angle C (Friction Reduction): "Never get stuck staring at a blank cursor again."'
        ],
        test: 'Run matched landing-page variant tests and targeted creative copy across developer and writer communities.',
        metrics: [
            'Attention: Click-through rate (CTR) and initial page scroll depth.',
            'Engagement: Time spent interacting with real-time waveform transcription previews.',
            'Intent: Conversion rate to download / extension install.'
        ],
        usage: 'Use the winning angle as the core hero headline for the primary marketing site, Chrome Web Store listing, and first-time onboarding screens.'
    },
    {
        id: 'exp2',
        num: 'EXPERIMENT 02',
        title: 'CONTENT AND DISTRIBUTION',
        question: 'How can we introduce the product to people who might genuinely benefit from it?',
        hypothesis: 'Unedited 15-second screen recordings showing raw, messy spoken thoughts instantly transforming into clean markdown documentation will drive higher organic shareability than polished promo videos.',
        angles: [
            'Audience Niche: Backend engineers writing PR descriptions and documentation.',
            'Audience Niche: Solopreneurs and founders drafting daily investor and team updates.',
            'Audience Niche: Non-native English speakers wanting natural phrasing confidence.'
        ],
        test: 'Publish short-form educational use-case clips on X, LinkedIn, and developer subreddits, paired with direct use-case templates.',
        metrics: [
            'Content Engagement: Shares, bookmark saves, and organic reach multiplier.',
            'Referral Quality: Direct referral traffic with >40% engagement rate.',
            'Product Exploration: Movement from discovery post to active trial within 24 hours.'
        ],
        usage: 'Identify the highest-converting use-case niches and build targeted content playbooks and community partnerships around them.'
    },
    {
        id: 'exp3',
        num: 'EXPERIMENT 03',
        title: 'ACTIVATION AND ONBOARDING',
        question: 'What makes a new user understand the value of the product quickly?',
        hypothesis: 'Guiding users to perform a 10-second spoken prompt during the very first run (e.g. "Summarize your day in two sentences") will reduce drop-off compared to a static feature walkthrough.',
        angles: [
            'Interactive Voice First-Run: Hands-on trial inside the initial setup window.',
            'Friction Reduction: Clear permission explanations for microphone and background permissions.',
            'Contextual Templates: Suggested starter prompts tailored to their selected role.'
        ],
        test: 'Implement a streamlined first-run onboarding sequence featuring an immediate interactive voice sandbox.',
        metrics: [
            'Onboarding Completion: % of new signups who complete setup.',
            'Time-to-Value: Seconds from install to first completed transcription.',
            'Early Retention: Day-1 and Day-7 active voice transcription sessions.'
        ],
        usage: 'Eliminate friction points that cause hesitation, ensuring every new user experiences their "aha!" moment within 60 seconds.'
    }
];

const WisprDossier = ({ isOpen, onClose, initialTab = 'brief' }) => {
    const { playPaper } = useAudio();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeGrowthIndex, setActiveGrowthIndex] = useState(0);
    const [openExpId, setOpenExpId] = useState('exp1');
    const tabsBarRef = useRef(null);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Auto-scroll the active tab into full view
    useEffect(() => {
        if (isOpen && tabsBarRef.current) {
            const activeEl = tabsBarRef.current.querySelector('.tab-item.is-active');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeTab, isOpen]);

    // Enable horizontal mouse wheel scrolling across tabs
    const handleTabsWheel = useCallback((e) => {
        if (tabsBarRef.current) {
            tabsBarRef.current.scrollLeft += e.deltaY;
        }
    }, []);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose && onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={`wispr-dossier-backdrop ${isOpen ? 'is-open' : ''}`} onClick={onClose}>
            <div className="wispr-dossier-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="wispr-dossier-header">
                    <div className="header-titles">
                        <span className="header-badge">✦ GROWTH STUDIO DOSSIER ✦</span>
                        <h2 className="header-title">WISPR FLOW</h2>
                        <span className="header-tagline">I like turning ideas into momentum.</span>
                    </div>
                    <button className="close-button" onClick={() => { playPaper(0.6); onClose && onClose(); }} type="button">
                        ✕ CLOSE
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="wispr-tabs-bar" ref={tabsBarRef} onWheel={handleTabsWheel}>
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            className={`tab-item ${activeTab === t.id ? 'is-active' : ''}`}
                            onClick={() => {
                                playPaper(0.5);
                                setActiveTab(t.id);
                            }}
                            type="button"
                        >
                            <span className="tab-num">{t.num}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dossier Body */}
                <div className="wispr-dossier-body">
                    {/* TAB 1: THE BRIEF */}
                    {activeTab === 'brief' && (
                        <div className="tab-section-content">
                            <span className="section-tag">01 • THE BRIEF</span>
                            <h3 className="section-title">THE BRIEF</h3>
                            <div className="brief-quote-card">
                                <blockquote>
                                    &ldquo;You asked people to show who they are instead of sending another resume. So I decided to build something you could actually explore.&rdquo;
                                </blockquote>
                            </div>

                            <p>
                                When I saw the opportunity to connect with Wispr Flow, I wanted to respond in a way that felt personal, deliberate, and authentic to who I am. Resumes flatten people into static bullet points, but real work is about curiosity, perspective, and execution.
                            </p>

                            <div className="brief-points-grid">
                                <div className="point-card">
                                    <h4>A Personal Response</h4>
                                    <p>I wanted to respond to your challenge by creating a living digital environment rather than emailing another PDF attachment.</p>
                                </div>
                                <div className="point-card">
                                    <h4>Experience Over Listing</h4>
                                    <p>I saw an opportunity to communicate through an experience that you could navigate, touch, and explore at your own pace.</p>
                                </div>
                                <div className="point-card">
                                    <h4>Understanding People & Value</h4>
                                    <p>I enjoy exploring ideas, understanding what makes people care about something, and finding clear ways to communicate why it matters.</p>
                                </div>
                                <div className="point-card">
                                    <h4>Showing How I Think</h4>
                                    <p>I wanted this room to show how I think, how I learn, and how I approach growth, not just a laundry list of tools I know.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: HOW I THINK ABOUT GROWTH */}
                    {activeTab === 'growth' && (
                        <div className="tab-section-content">
                            <span className="section-tag">02 • FRAMEWORK</span>
                            <h3 className="section-title">HOW I THINK ABOUT GROWTH</h3>
                            <p className="section-subheading">
                                &ldquo;Growth isn&rsquo;t just about getting more attention. It&rsquo;s about understanding why people care, giving them a reason to act, and learning what works.&rdquo;
                            </p>

                            {/* Loop Stage Selector */}
                            <div className="growth-loop-nav">
                                {GROWTH_STAGES.map((st, idx) => (
                                    <button
                                        key={st.num}
                                        className={`loop-step-btn ${activeGrowthIndex === idx ? 'active' : ''}`}
                                        onClick={() => setActiveGrowthIndex(idx)}
                                        type="button"
                                    >
                                        <span className="step-badge">{st.num}</span>
                                        <span>{st.title}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Active Growth Stage Dossier */}
                            <div className="growth-stage-dossier">
                                <div className="stage-header">
                                    <span className="stage-title">{GROWTH_STAGES[activeGrowthIndex].num} - {GROWTH_STAGES[activeGrowthIndex].title}</span>
                                    <span className="stage-question">{GROWTH_STAGES[activeGrowthIndex].question}</span>
                                </div>
                                <p className="stage-details">{GROWTH_STAGES[activeGrowthIndex].details}</p>
                                <div className="stage-tactics">
                                    <h5>Practical Execution Points:</h5>
                                    <ul>
                                        {GROWTH_STAGES[activeGrowthIndex].tactics.map((tac, i) => (
                                            <li key={i}>{tac}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: IDEAS INTO EXPERIMENTS */}
                    {activeTab === 'experiments' && (
                        <div className="tab-section-content">
                            <span className="section-tag">03 • EXPERIMENT LAB</span>
                            <h3 className="section-title">IDEAS INTO EXPERIMENTS</h3>
                            <p className="section-subheading">
                                &ldquo;I&rsquo;d rather test a thoughtful idea than spend weeks assuming it will work.&rdquo;
                            </p>

                            <div className="experiment-alert-badge">
                                <span>⚠️</span>
                                <strong>PROPOSED EXPERIMENT - NOT YET RUN</strong>
                            </div>

                            <div className="experiments-accordion">
                                {EXPERIMENTS.map((exp) => {
                                    const isOpen = openExpId === exp.id;
                                    return (
                                        <div key={exp.id} className={`experiment-card ${isOpen ? 'is-open' : ''}`}>
                                            <div
                                                className="exp-header"
                                                onClick={() => setOpenExpId(isOpen ? null : exp.id)}
                                            >
                                                <div className="exp-title-row">
                                                    <span className="exp-num">{exp.num}</span>
                                                    <span className="exp-name">{exp.title}</span>
                                                </div>
                                                <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
                                            </div>

                                            {isOpen && (
                                                <div className="exp-content">
                                                    <div className="exp-grid">
                                                        <div className="exp-field">
                                                            <div className="field-label">Core Question</div>
                                                            <p className="field-val"><strong>{exp.question}</strong></p>
                                                        </div>
                                                        <div className="exp-field">
                                                            <div className="field-label">Testable Hypothesis</div>
                                                            <p className="field-val">{exp.hypothesis}</p>
                                                        </div>
                                                        <div className="exp-field">
                                                            <div className="field-label">Angles Explored</div>
                                                            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                                                                {exp.angles.map((ang, i) => (
                                                                    <li key={i} style={{ fontSize: '0.92rem', marginBottom: '0.25rem' }}>{ang}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="exp-field">
                                                            <div className="field-label">Metrics to Observe</div>
                                                            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                                                                {exp.metrics.map((met, i) => (
                                                                    <li key={i} style={{ fontSize: '0.92rem', marginBottom: '0.25rem' }}>{met}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="exp-findings">
                                                        <strong>How I Would Use Findings:</strong> {exp.usage}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: MY CREATIVE SIDE */}
                    {activeTab === 'creative' && (
                        <div className="tab-section-content">
                            <span className="section-tag">04 • CREATIVE ARCHIVE</span>
                            <h3 className="section-title">MY CREATIVE SIDE</h3>
                            <p className="section-subheading">
                                &ldquo;Not everything interesting happens inside a code editor.&rdquo;
                            </p>

                            {/* Category: Writing */}
                            <div className="creative-category">
                                <h4 className="cat-title">✍️ MY WRITING</h4>
                                <div className="cards-row">
                                    <a
                                        href="https://harshkablogs.blogspot.com/2025/08/blog-post.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="creative-card"
                                    >
                                        <div className="card-head">
                                            <h4>The Art of Finding Meaning in the Ordinary</h4>
                                            <p>A personal write-up sharing thoughts, ideas, and perspectives on finding meaning in everyday life.</p>
                                        </div>
                                        <span className="card-link-act">READ ON BLOG ↗</span>
                                    </a>

                                    <a
                                        href="https://lnkd.in/p/df4T5Hem"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="creative-card"
                                    >
                                        <div className="card-head">
                                            <h4>Lessons Learned from 3 Years of Lurking on LinkedIn</h4>
                                            <p>An honest critique on networking dynamics, vanity engagement versus genuine value, and personal branding observations.</p>
                                        </div>
                                        <span className="card-link-act">READ ON LINKEDIN ↗</span>
                                    </a>
                                </div>
                            </div>

                            {/* Category: Building */}
                            <div className="creative-category">
                                <h4 className="cat-title">🚀 MY BUILDING JOURNEY</h4>
                                <div className="cards-row">
                                    <a
                                        href="https://lnkd.in/p/dyZDSYpP"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="creative-card"
                                    >
                                        <div className="card-head">
                                            <h4>Introducing Fynlo - Smart UPI Expense Tracking</h4>
                                            <p>An example of identifying user friction (the chaos of daily micro-payments), designing an automated tracking workflow, and turning an idea into a tangible working product.</p>
                                        </div>
                                        <span className="card-link-act">READ BUILDING STORY ↗</span>
                                    </a>
                                </div>
                            </div>

                            {/* Category: Visual Inspiration */}
                            <div className="creative-category">
                                <h4 className="cat-title">📸 MY VISUAL INSPIRATION</h4>
                                <div className="cards-row">
                                    <a
                                        href="https://www.instagram.com/harsh.un.filtered"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="creative-card"
                                    >
                                        <div className="card-head">
                                            <h4>Harsh on Instagram</h4>
                                            <p>A collection of personal snapshots, photography, and everyday candid experiences.</p>
                                        </div>
                                        <span className="card-link-act">VIEW INSTAGRAM ↗</span>
                                    </a>

                                    <a
                                        href="https://in.pinterest.com/harsh_karn/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="creative-card"
                                    >
                                        <div className="card-head">
                                            <h4>Harsh on Pinterest</h4>
                                            <p>A collection of creative inspiration, design references, moodboards, and aesthetics.</p>
                                        </div>
                                        <span className="card-link-act">EXPLORE PINTEREST ↗</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: WHY WISPR FLOW */}
                    {activeTab === 'why' && (
                        <div className="tab-section-content">
                            <span className="section-tag">05 • A PERSONAL NOTE</span>
                            <h3 className="section-title">WHY WISPR FLOW</h3>

                            <div className="letter-paper">
                                <div className="letter-seal-stamp">✦</div>
                                <div className="letter-salutation">Dear Wispr Flow Team,</div>

                                <div className="letter-body">
                                    <p>
                                        What interests me about growth is the combination of understanding people, communicating ideas, and figuring out what actually works.
                                    </p>
                                    <p>
                                        My background is a little unconventional for a growth role. I&rsquo;ve spent a lot of time building software, exploring AI, working with data, and learning how products come together. That has given me a useful perspective on how products work behind the scenes, but I&rsquo;m equally interested in how people discover them, understand their value, and decide to use them.
                                    </p>
                                    <p>
                                        I enjoy experimenting, learning unfamiliar things, and taking ownership instead of waiting for someone to tell me every next step.
                                    </p>
                                    <p>
                                        I may not have years of formal growth experience, but I bring curiosity, a builder&rsquo;s mindset, comfort with data, and a genuine willingness to learn by doing.
                                    </p>
                                    <p>
                                        I&rsquo;d love the opportunity to bring that energy to Wispr Flow and help turn good ideas into meaningful growth.
                                    </p>
                                </div>

                                <div className="letter-signoff">
                                    <div className="signoff-sub">Warmly,</div>
                                    <div className="signoff-name">Harsh Karn</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: WHAT I BRING */}
                    {activeTab === 'strengths' && (
                        <div className="tab-section-content">
                            <span className="section-tag">06 • CORE STRENGTHS</span>
                            <h3 className="section-title">A FEW THINGS I BRING TO THE TABLE</h3>
                            <p className="section-subheading">
                                No arbitrary scores or proficiency bars, just how I approach work every day.
                            </p>

                            <div className="strengths-grid">
                                <div className="strength-card">
                                    <span className="strength-num">01</span>
                                    <div className="strength-info">
                                        <h4>Curiosity</h4>
                                        <p>I enjoy understanding unfamiliar problems and investigating why users behave the way they do.</p>
                                    </div>
                                </div>
                                <div className="strength-card">
                                    <span className="strength-num">02</span>
                                    <div className="strength-info">
                                        <h4>Ownership</h4>
                                        <p>I like taking ideas from an initial thought to something tangible without needing hand-holding.</p>
                                    </div>
                                </div>
                                <div className="strength-card">
                                    <span className="strength-num">03</span>
                                    <div className="strength-info">
                                        <h4>Data-Minded Thinking</h4>
                                        <p>I am comfortable working with telemetry, analytics, and metrics to separate intuition from verified facts.</p>
                                    </div>
                                </div>
                                <div className="strength-card">
                                    <span className="strength-num">04</span>
                                    <div className="strength-info">
                                        <h4>Technical Fluency</h4>
                                        <p>My software background helps me understand product mechanics, APIs, automated workflows, and engineering constraints.</p>
                                    </div>
                                </div>
                                <div className="strength-card">
                                    <span className="strength-num">05</span>
                                    <div className="strength-info">
                                        <h4>Creative Communication</h4>
                                        <p>I enjoy writing, storytelling, and designing visual narratives that make complex technology simple and compelling.</p>
                                    </div>
                                </div>
                                <div className="strength-card">
                                    <span className="strength-num">06</span>
                                    <div className="strength-info">
                                        <h4>Adaptability</h4>
                                        <p>I am comfortable adapting quickly to whatever the challenge demands, whether learning a new tool or testing a new channel.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: MY FIRST 30 DAYS */}
                    {activeTab === 'roadmap' && (
                        <div className="tab-section-content">
                            <span className="section-tag">07 • PROPOSED ROADMAP</span>
                            <h3 className="section-title">IF I JOINED THE TEAM - MY FIRST 30 DAYS</h3>
                            <p className="section-subheading">
                                A proposed exploratory roadmap - actual priorities would naturally align with team goals, data, and guidance.
                            </p>

                            <div className="timeline-phases">
                                <div className="phase-card">
                                    <div className="phase-head">
                                        <span className="phase-days">DAYS 01 - 07</span>
                                        <h4 className="phase-action">LEARN</h4>
                                    </div>
                                    <ul>
                                        <li>Deeply understand the product, core voice-intelligence mechanics, and the primary value proposition.</li>
                                        <li>Experience the user journey end-to-end as both a beginner and power user.</li>
                                        <li>Learn who the product currently serves best and where users find genuine delight.</li>
                                        <li>Understand current growth priorities, channel performance, and available telemetry.</li>
                                        <li>Listen closely to existing customer feedback and the team’s ongoing insights.</li>
                                    </ul>
                                </div>

                                <div className="phase-card">
                                    <div className="phase-head">
                                        <span className="phase-days">DAYS 08 - 15</span>
                                        <h4 className="phase-action">IDENTIFY</h4>
                                    </div>
                                    <ul>
                                        <li>Review the top-of-funnel discovery channels and the onboarding activation journey.</li>
                                        <li>Identify possible friction points where curious visitors hesitate or drop off.</li>
                                        <li>Explore messaging and content opportunities across practitioner communities.</li>
                                        <li>Investigate high-leverage distribution channels (developer toolkits, writer forums, creator workflows).</li>
                                        <li>Prioritize testable, high-impact growth hypotheses with the team.</li>
                                    </ul>
                                </div>

                                <div className="phase-card">
                                    <div className="phase-head">
                                        <span className="phase-days">DAYS 16 - 23</span>
                                        <h4 className="phase-action">EXPERIMENT</h4>
                                    </div>
                                    <ul>
                                        <li>Work collaboratively with the team on focused, quick-turnaround experiments.</li>
                                        <li>Test targeted messaging variations and short-form educational use-case clips.</li>
                                        <li>Explore relevant community distribution opportunities.</li>
                                        <li>Monitor core quantitative telemetry and qualitative engagement signals.</li>
                                    </ul>
                                </div>

                                <div className="phase-card">
                                    <div className="phase-head">
                                        <span className="phase-days">DAYS 24 - 30</span>
                                        <h4 className="phase-action">LEARN AND ITERATE</h4>
                                    </div>
                                    <ul>
                                        <li>Conduct a thorough review of experiment performance data.</li>
                                        <li>Document clear learnings: what worked, what didn’t, and why.</li>
                                        <li>Identify which channels and messaging patterns to continue, refine, or stop.</li>
                                        <li>Recommend the next prioritized cycle of experiments to compound growth momentum.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: BUILT WITH MY VOICE */}
                    {activeTab === 'voice' && (
                        <div className="tab-section-content">
                            <span className="section-tag">08 • CREATION PROCESS</span>
                            <h3 className="section-title">BUILT WITH MY VOICE</h3>
                            <p className="section-subheading">
                                A behind-the-scenes look at how this interactive portfolio was conceived, directed, and built.
                            </p>

                            <div className="voice-flow-diagram">
                                <div className="flow-step">IDEA</div>
                                <span className="flow-arrow">➔</span>
                                <div className="flow-step">VOICE-BASED INPUT &amp; WRITTEN PROMPTS</div>
                                <span className="flow-arrow">➔</span>
                                <div className="flow-step">IMPLEMENTATION</div>
                                <span className="flow-arrow">➔</span>
                                <div className="flow-step">REVIEW &amp; REFINEMENT</div>
                            </div>

                            {/* Decorative Waveform */}
                            <div className="waveform-container" title="Decorative Audio Waveform">
                                {Array.from({ length: 42 }).map((_, i) => (
                                    <div key={i} className="wave-bar" style={{ animationDelay: `${(i * 0.05) % 1.2}s` }} />
                                ))}
                            </div>

                            <div className="brief-points-grid" style={{ marginTop: '1.5rem' }}>
                                <div className="point-card">
                                    <h4>Creative Direction</h4>
                                    <p>I developed the overarching concept, narrative structure, and hand-drawn aesthetic vision for the entire portfolio.</p>
                                </div>
                                <div className="point-card">
                                    <h4>Voice-Driven Workflow</h4>
                                    <p>I communicated ideas, user flows, and structural requirements through voice-based input and detailed written prompts.</p>
                                </div>
                                <div className="point-card">
                                    <h4>AI Implementation Partner</h4>
                                    <p>I collaborated with AI agentic coding tooling (Emergent) to implement the 3D graphics, shaders, and React Three Fiber scene.</p>
                                </div>
                                <div className="point-card">
                                    <h4>Continuous Polish</h4>
                                    <p>I reviewed, verified, debugged, and guided every step of output to ensure aesthetic integrity and functional excellence.</p>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.88rem', color: '#66594a', fontStyle: 'italic', marginTop: '1.5rem', textAlign: 'center' }}>
                                * Note: The waveform visualizer is decorative. No live audio recording or mic permissions are triggered.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WisprDossier;
