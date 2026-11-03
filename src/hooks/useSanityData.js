import { useState, useEffect } from 'react';
import { sanityClient, urlFor, getProxyUrl } from '../config/sanity';
import { useTexture } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Decoupled mode: All portfolio content is cleanly self-hosted and loaded from local data files
export const isSanityConfigured = false;

// Global cache for Sanity data
const cache = {
    projects: null,
    content: null,
    awards: null,
    loading: false,
    loaded: false,
    error: null,
};

let fetchPromise = null;
const listeners = new Set();

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyUpdate() {
    listeners.forEach(l => l());
}

// Helper preloader for standard HTML images (e.g. certificates)
const preloadBrowserImage = (path) => {
    if (typeof window === 'undefined' || !path) return;
    const img = new Image();
    img.src = path;
};

// Check if device supports hover (mice, desktop computers)
const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

export function loadSanityData() {
    if (!isSanityConfigured) {
        cache.loaded = true;
        return Promise.resolve(cache);
    }

    if (fetchPromise) {
        return fetchPromise;
    }

    cache.loading = true;

    fetchPromise = (async () => {
        try {
            const [projectsData, contentData, awardsData] = await Promise.all([
                // 1. Projects (Galeria)
                sanityClient.fetch(`
                    *[_type == "galleryProject"] {
                        title,
                        "id": slug.current,
                        url,
                        description,
                        frontImage,
                        paintedImage,
                        techStack
                    }
                `),
                // 2. Studio Content
                sanityClient.fetch(`
                    *[_type == "studioItem"] {
                        title,
                        platform,
                        description,
                        url,
                        frontTexture,
                        paintedFrontTexture,
                        date,
                        views,
                        likes,
                        duration,
                        readTime
                    } | order(date desc)
                `),
                // 3. Awards (Certificates in About)
                sanityClient.fetch(`
                    *[_type == "awardCertificate"] {
                        title,
                        category,
                        certificateImage,
                        date,
                        url
                    } | order(date desc)
                `)
            ]);

            // Map gallery data and techStack to local paths and optimize images from Sanity
            if (projectsData && projectsData.length > 0) {
                cache.projects = projectsData.map(p => {
                    const frontUrl = p.frontImage ? getProxyUrl(urlFor(p.frontImage).width(1024).quality(80).auto('format')) : null;
                    const paintedUrl = p.paintedImage ? getProxyUrl(urlFor(p.paintedImage).width(1024).quality(80).auto('format')) : null;
                    return {
                        ...p,
                        front: frontUrl,
                        painted: paintedUrl,
                        techStack: p.techStack ? p.techStack.map(t => '/textures/gallery/' + t) : []
                    };
                });
            }

            // Map studio data, assign id, and optimize images from Sanity
            if (contentData && contentData.length > 0) {
                cache.content = contentData.map((item, index) => {
                    const frontTextureUrl = item.frontTexture ? getProxyUrl(urlFor(item.frontTexture).width(1024).quality(80).auto('format')) : null;
                    const paintedFrontTextureUrl = item.paintedFrontTexture ? getProxyUrl(urlFor(item.paintedFrontTexture).width(1024).quality(80).auto('format')) : null;
                    return {
                        ...item,
                        id: item.platform + '-' + index,
                        frontTexture: frontTextureUrl,
                        paintedFrontTexture: paintedFrontTextureUrl
                    };
                });
            }

            // Map awards to structure expected by overlay and optimize certificates from Sanity
            if (awardsData && awardsData.length > 0) {
                const mapItems = (items) => items.map(a => {
                    const imageUrl = a.certificateImage ? getProxyUrl(urlFor(a.certificateImage).width(800).quality(80).auto('format')) : null;
                    return {
                        label: a.title,
                        date: new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        image: imageUrl,
                        url: a.url || null
                    };
                });

                cache.awards = {
                    sotd: {
                        id: 'award-sotd',
                        layout: 'certificate_grid',
                        title: 'Site of the Day Awards',
                        items: mapItems(awardsData.filter(a => a.category === 'sotd')),
                        platformConfig: { label: 'ACHIEVEMENT', color: '#1a1a1a', icon: '🏆' }
                    },
                    sotm: {
                        id: 'award-sotm',
                        layout: 'certificate_grid',
                        title: 'Site of the Month Awards',
                        items: mapItems(awardsData.filter(a => a.category === 'sotm')),
                        platformConfig: { label: 'AWARD', color: '#1a1a1a', icon: '📅' }
                    },
                    other: {
                        id: 'award-other',
                        layout: 'certificate_grid',
                        title: 'Other Awards',
                        items: mapItems(awardsData.filter(a => a.category === 'other')),
                        platformConfig: { label: 'PRESTIGE', color: '#1a1a1a', icon: '👑' }
                    }
                };
            }

            // PRELOADING IMAGES/TEXTURES FROM SANITY
            
            // 1. Gallery projects
            if (cache.projects) {
                cache.projects.forEach(p => {
                    if (p.front) {
                        useTexture.preload(p.front);
                        preloadBrowserImage(p.front);
                    }
                    // Mobile optimization: Load painted versions ONLY if device supports hover (desktop)
                    if (p.painted && supportsHover) {
                        useTexture.preload(p.painted);
                        preloadBrowserImage(p.painted);
                    }
                });
            }

            // 2. Studio
            if (cache.content) {
                cache.content.forEach(c => {
                    if (c.frontTexture) {
                        useLoader.preload(TextureLoader, c.frontTexture);
                        preloadBrowserImage(c.frontTexture);
                    }
                    // Mobile optimization: Load painted versions ONLY for desktop (with mouse/hover)
                    if (c.paintedFrontTexture && supportsHover) {
                        useLoader.preload(TextureLoader, c.paintedFrontTexture);
                        preloadBrowserImage(c.paintedFrontTexture);
                    }
                });
            }

            // 3. Awards (certificates in 2D windows) - preload in browser
            if (cache.awards) {
                ['sotd', 'sotm', 'other'].forEach(category => {
                    cache.awards[category].items.forEach(item => {
                        if (item.image) {
                            preloadBrowserImage(item.image);
                        }
                    });
                });
            }

            cache.loaded = true;
            cache.loading = false;
        } catch (error) {
            console.error("Error preloading Sanity data:", error);
            cache.error = error;
            cache.loading = false;
            // Mark as loaded on error so the app does not hang indefinitely on preloader
            cache.loaded = true;
        }

        notifyUpdate();
        return cache;
    })();

    return fetchPromise;
}

export function isSanityDataLoaded() {
    if (!isSanityConfigured) return true;
    return cache.loaded;
}

export function useGalleryProjects() {
    const [projects, setProjects] = useState(cache.projects);

    useEffect(() => {
        loadSanityData();

        if (cache.loaded) {
            setProjects(cache.projects);
            return;
        }

        const handleUpdate = () => {
            setProjects(cache.projects);
        };

        return subscribe(handleUpdate);
    }, []);

    return projects;
}

export function useStudioContent() {
    const [content, setContent] = useState(cache.content);

    useEffect(() => {
        loadSanityData();

        if (cache.loaded) {
            setContent(cache.content);
            return;
        }

        const handleUpdate = () => {
            setContent(cache.content);
        };

        return subscribe(handleUpdate);
    }, []);

    return content;
}

export function useAwards() {
    const [awardsData, setAwardsData] = useState(cache.awards);

    useEffect(() => {
        loadSanityData();

        if (cache.loaded) {
            setAwardsData(cache.awards);
            return;
        }

        const handleUpdate = () => {
            setAwardsData(cache.awards);
        };

        return subscribe(handleUpdate);
    }, []);

    return awardsData;
}

// Automatically trigger fetch upon JS module load
loadSanityData();
