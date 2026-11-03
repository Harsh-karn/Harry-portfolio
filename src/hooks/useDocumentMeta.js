import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';

/**
 * useDocumentMeta - Dynamic Meta Tags & Virtual Routing (History API)
 * 
 * Updates the browser URL, page title, and meta description
 * whenever the user enters/exits a 3D room. Also handles the
 * browser back/forward buttons for seamless navigation.
 */

const ROOM_META = {
    null: {
        path: '/',
        title: 'Harsh Karn - Creative 3D Portfolio',
        description: 'Interactive 3D developer portfolio by Harsh Karn. Explore WebGL experiments, React projects & GSAP animations in a hand-drawn magical world.',
    },
    about: {
        path: '/my-story',
        title: 'MY STORY - Harsh Karn Portfolio',
        description: 'Learn about Harsh Karn - creative frontend developer specializing in 3D web experiences, React, Three.js, and interactive animations.',
    },
    gallery: {
        path: '/my-builds',
        title: 'MY BUILDS - Harsh Karn Portfolio',
        description: 'Browse the interactive 3D gallery of creative builds and web development projects by Harsh Karn in a hand-drawn sketchbook.',
    },
    studio: {
        path: '/my-lab',
        title: 'MY LAB - Harsh Karn Portfolio',
        description: 'Explore Harsh Karn\'s laboratory - code experiments, interactive demos, and creative technical prototypes.',
    },
    contact: {
        path: '/say-hi',
        title: 'SAY HI - Harsh Karn Portfolio',
        description: 'Get in touch with Harsh Karn. Find social links and contact options in this interactive 3D hand-drawn space.',
    },
    'wispr-flow': {
        path: '/wispr-flow',
        title: 'WISPR FLOW - Harsh Karn Portfolio',
        description: 'WISPR FLOW: A Growth Mindset, Beyond a Resume. Exploring growth, creative experimentation, distribution, and execution by Harsh Karn.',
    },
};

// Map URL paths back to room IDs for deep linking
const PATH_TO_ROOM = {
    '/': null,
    '/my-builds': 'gallery',
    '/gallery': 'gallery',
    '/my-lab': 'studio',
    '/studio': 'studio',
    '/my-story': 'about',
    '/about': 'about',
    '/say-hi': 'contact',
    '/contact': 'contact',
    '/wispr-flow': 'wispr-flow',
};

/**
 * Returns the room ID that the initial URL points to (for deep linking).
 * Call this once at app startup to determine if we need to auto-teleport.
 */
export function getInitialRoomFromUrl() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return PATH_TO_ROOM[path] !== undefined ? PATH_TO_ROOM[path] : null;
}

export function useDocumentMeta() {
    const { currentRoom, teleportTo, hasEntered, isInRoom, requestExit } = useScene();
    const isHandlingPopState = useRef(false);
    const lastPushedRoom = useRef(undefined); // Track what we last pushed to avoid duplicates

    // Update document meta and URL when room changes
    useEffect(() => {
        const roomKey = currentRoom === null ? 'null' : currentRoom;
        const meta = ROOM_META[roomKey] || ROOM_META['null'];

        // Update the page title
        document.title = meta.title;

        // Update meta description
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) {
            descTag.setAttribute('content', meta.description);
        }

        // Update OG meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const baseOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://harshkarn.dev';

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `${baseOrigin}${meta.path}`);

        // Update canonical link to ensure virtual routes are correctly indexable as separate pages
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        if (canonicalTag) {
            canonicalTag.setAttribute('href', `${baseOrigin}${meta.path}`);
        }

        // Push to browser history (only if not handling a popstate event and room actually changed)
        if (!isHandlingPopState.current && lastPushedRoom.current !== currentRoom) {
            // Use replaceState for the very first load, pushState for subsequent navigations
            if (lastPushedRoom.current === undefined) {
                window.history.replaceState({ room: currentRoom }, '', meta.path);
            } else {
                window.history.pushState({ room: currentRoom }, '', meta.path);
            }
            lastPushedRoom.current = currentRoom;
        }

        isHandlingPopState.current = false;
    }, [currentRoom]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event) => {
            isHandlingPopState.current = true;
            const targetRoom = event.state?.room ?? null;
            lastPushedRoom.current = targetRoom;

            if (targetRoom === null) {
                // Going back to corridor - trigger natural exit animation if currently inside a room
                if (isInRoom) {
                    requestExit();
                }
                const meta = ROOM_META['null'];
                document.title = meta.title;
            } else if (hasEntered) {
                // Teleport to the target room
                teleportTo(targetRoom);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [teleportTo, hasEntered, isInRoom, requestExit]);
}
