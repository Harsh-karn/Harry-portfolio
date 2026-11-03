import { useScene } from '../../context/SceneContext';
import { CONTENT_DATA } from '../canvas/rooms/Studio/contentData';
import { PROJECTS_DATA } from '../../data/projectsData';
import '../../styles/ScreenReaderOverlay.scss';

/**
 * ScreenReaderOverlay - A7 Accessibility
 * 
 * Invisible HTML layer providing screen reader access to 3D canvas content.
 * Contains buttons/links matching interactive 3D elements (doors, rooms).
 * Visually hidden via .sr-only but fully accessible to assistive tech.
 */
const ScreenReaderOverlay = () => {
    const { hasEntered, isInRoom, currentRoom, teleportTo, requestExit } = useScene();
    
    // Authoritative project data for Harsh Karn's engineering builds
    const projects = PROJECTS_DATA;
    const studio = CONTENT_DATA;
    const awards = null;

    return (
        <div className="sr-overlay" role="complementary" aria-label="Accessible navigation for 3D portfolio">
            {/* Skip to content link */}
            <a href="#sr-main-nav" className="sr-only sr-focusable">
                Skip to accessible navigation
            </a>

            {/* Main accessible navigation */}
            <nav id="sr-main-nav" className="sr-only" aria-label="Portfolio rooms">
                <h1>Harsh Karn - Creative Developer Portfolio</h1>
                <h2>Portfolio Navigation</h2>

                {!hasEntered && (
                    <p>Welcome to Harsh Karn's interactive 3D portfolio. Click or press Enter on the doors to enter.</p>
                )}

                {hasEntered && !isInRoom && (
                    <>
                        <p>You are in the corridor. Choose a room to explore:</p>
                        <ul>
                            <li>
                                <button onClick={() => teleportTo('about')} type="button">
                                    My Story - My story, skills, and journey
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('gallery')} type="button">
                                    My Builds - My projects and work
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('contact')} type="button">
                                    Say Hi - Get in touch with me
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('studio')} type="button">
                                    My Lab - Technologies and experience
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('wispr-flow')} type="button">
                                    Wispr Flow - Voice-first AI dictation intelligence
                                </button>
                            </li>
                        </ul>
                    </>
                )}

                {hasEntered && isInRoom && (
                    <>
                        <p>
                            You are in the {currentRoom === 'about' ? 'My Story' :
                                currentRoom === 'gallery' ? 'My Builds' :
                                    currentRoom === 'contact' ? 'Say Hi' :
                                        currentRoom === 'studio' ? 'My Lab' :
                                            currentRoom === 'wispr-flow' ? 'Wispr Flow' : currentRoom} room.
                        </p>
                        <button onClick={requestExit} type="button">
                            Go back to corridor
                        </button>

                        {/* Room-specific content descriptions */}
                        {currentRoom === 'about' && (
                            <div aria-label="About room content">
                                <h3>About Me</h3>
                                <p>This room contains my personal story, awards, journey milestones, and technology skills displayed as interactive balloons.</p>
                                
                                {awards && (
                                    <section>
                                        <h4>My Awards</h4>
                                        <ul>
                                            {awards.sotd && awards.sotd.items && awards.sotd.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date} {a.url && <a href={a.url}>View</a>}</li>
                                            ))}
                                            {awards.sotm && awards.sotm.items && awards.sotm.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date} {a.url && <a href={a.url}>View</a>}</li>
                                            ))}
                                            {awards.other && awards.other.items && awards.other.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date} {a.url && <a href={a.url}>View</a>}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}
                        {currentRoom === 'gallery' && (
                            <div aria-label="Builds archive room content">
                                <h3>MY BUILDS - Personal Project Archive</h3>
                                <p>Things I've imagined, engineered, and brought to life. Browse through my 10 real engineering builds, agent runtimes, and architectures.</p>
                                
                                {projects && projects.length > 0 && (
                                    <ul>
                                        {projects.map((p, i) => (
                                            <li key={i}>
                                                <h4>{p.num}. {p.title} - {p.fullTitle}</h4>
                                                <p>{p.whatItDoes}</p>
                                                <p>Technology Stack: {p.techStack.join(', ')}</p>
                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noopener noreferrer">
                                                        Inspect {p.title} Repository on GitHub
                                                    </a>
                                                )}
                                                {p.liveDemo && (
                                                    <a href={p.liveDemo} target="_blank" rel="noopener noreferrer">
                                                        Launch {p.title} Live Application
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {currentRoom === 'contact' && (
                            <div aria-label="Contact room content">
                                <h3>Contact Me</h3>
                                <p>Find my social media links displayed as floating barrels. Click to visit my profiles on LinkedIn, GitHub, and other platforms.</p>
                            </div>
                        )}
                        {currentRoom === 'studio' && (
                            <div aria-label="Studio room content">
                                <h3>The Studio</h3>
                                <p>Explore my experience and skills on rotating monitors. Click a monitor to read detailed information about my work.</p>

                                {studio && studio.length > 0 && (
                                    <ul>
                                        {studio.map((s, i) => (
                                            <li key={i}>
                                                <h4>{s.title} ({s.platform})</h4>
                                                <p>{s.description}</p>
                                                {s.url && <a href={s.url}>View content</a>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Quick navigation to other rooms */}
                        <h3>Quick Navigation</h3>
                        <ul>
                            {currentRoom !== 'about' && (
                                <li><button onClick={() => teleportTo('about')} type="button">Go to My Story</button></li>
                            )}
                            {currentRoom !== 'gallery' && (
                                <li><button onClick={() => teleportTo('gallery')} type="button">Go to My Builds</button></li>
                            )}
                            {currentRoom !== 'contact' && (
                                <li><button onClick={() => teleportTo('contact')} type="button">Go to Say Hi</button></li>
                            )}
                            {currentRoom !== 'studio' && (
                                <li><button onClick={() => teleportTo('studio')} type="button">Go to My Lab</button></li>
                            )}
                            {currentRoom !== 'wispr-flow' && (
                                <li><button onClick={() => teleportTo('wispr-flow')} type="button">Go to Wispr Flow</button></li>
                            )}
                        </ul>
                    </>
                )}
            </nav>

            {/* Live region for state changes */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isInRoom && `Entered ${currentRoom} room`}
            </div>
        </div>
    );
};

export default ScreenReaderOverlay;
