/**
 * MY LAB - CREATIVE SPACE CONTENT DATA
 * Source of truth for Harsh Karn's personal creative entries beyond engineering.
 * Exactly 6 real entries categorized into: PERSONAL, INSPIRATION, PROFESSIONAL, WRITING.
 * Strict adherence: No fabricated URLs, no fake screenshots, all real links preserved.
 */

export const LAB_CATEGORIES = [
    { id: 'all', label: 'ALL LAB', count: 6 },
    { id: 'personal', label: 'PERSONAL', count: 2 },
    { id: 'inspiration', label: 'INSPIRATION', count: 1 },
    { id: 'professional', label: 'PROFESSIONAL', count: 1 },
    { id: 'writing', label: 'WRITING', count: 2 }
];

export const PLATFORM_CONFIG = {
    instagram: {
        color: '#241e17',
        accentColor: '#b87e28',
        icon: '📷',
        label: 'Instagram',
        shape: 'phone', // Vertical phone / scrapbook
    },
    pinterest: {
        color: '#241e17',
        accentColor: '#833c46',
        icon: '📌',
        label: 'Pinterest',
        shape: 'monitor', // Inspiration pinboard
    },
    linkedin: {
        color: '#241e17',
        accentColor: '#4d6f80',
        icon: 'in',
        label: 'LinkedIn',
        shape: 'monitor',
    },
    blog: {
        color: '#241e17',
        accentColor: '#78593a',
        icon: '✒️',
        label: 'Writing',
        shape: 'tv', // Antique journal / screen
    }
};

export const RAW_CONTENT_DATA = [
    // ENTRY 01 - MY INSTAGRAM
    {
        id: 'lab-01-instagram',
        num: '01',
        title: 'Harsh on Instagram',
        date: 'November 1, 2026',
        year: '2026',
        platform: 'instagram',
        device: 'phone',
        category: 'personal',
        categoryDisplay: 'Personal',
        description: 'A collection of unfiltered moments, personal snapshots, everyday experiences, and little glimpses of life beyond the screen.',
        url: 'https://www.instagram.com/harsh.un.filtered',
        frontTexture: '/textures/studio/lab_instagram.webp',
        paintedFrontTexture: '/textures/studio/lab_instagram_painted.webp',
        visualType: 'scrapbook',
        badge: 'SCRAPBOOK'
    },

    // ENTRY 02 - MY PINTEREST
    {
        id: 'lab-02-pinterest',
        num: '02',
        title: 'Harsh on Pinterest',
        date: 'November 1, 2026',
        year: '2026',
        platform: 'pinterest',
        device: 'monitor',
        category: 'inspiration',
        categoryDisplay: 'Inspiration',
        description: 'A collection of creative inspiration, design ideas, visual references, aesthetics, and things that spark new ideas.',
        url: 'https://in.pinterest.com/harsh_karn/',
        frontTexture: '/textures/studio/lab_pinterest.webp',
        paintedFrontTexture: '/textures/studio/lab_pinterest_painted.webp',
        visualType: 'board',
        badge: 'INSPIRATION BOARD'
    },

    // ENTRY 03 - LINKEDIN: FYNLO
    {
        id: 'lab-03-fynlo-linkedin',
        num: '03',
        title: 'Introducing Fynlo - Smart UPI Expense Tracking',
        date: '2026',
        year: '2026',
        platform: 'linkedin',
        device: 'monitor',
        category: 'professional',
        categoryDisplay: 'Professional',
        description: 'Building Fynlo, a full-stack expense tracker that automatically tracks, categorizes, and organizes UPI transactions. Built with FastAPI, Next.js, Kotlin, PostgreSQL, and Gemini AI.',
        url: 'https://lnkd.in/p/dyZDSYpP',
        frontTexture: '/textures/studio/lab_linkedin_fynlo.webp',
        paintedFrontTexture: '/textures/studio/lab_linkedin_fynlo_painted.webp',
        visualType: 'noticeboard',
        badge: 'ANNOUNCEMENT'
    },

    // ENTRY 04 - LINKEDIN: PERSONAL REFLECTION
    {
        id: 'lab-04-linkedin-lurking',
        num: '04',
        title: 'Lessons Learned from 3 Years of Lurking on LinkedIn',
        date: '2026',
        year: '2026',
        platform: 'linkedin',
        device: 'tv',
        category: 'personal',
        categoryDisplay: 'Personal',
        description: 'A post sharing honest observations about LinkedIn culture, job hunting, networking, and why engagement does not always equal value.',
        url: 'https://lnkd.in/p/df4T5Hem',
        frontTexture: '/textures/studio/lab_linkedin_reflection.webp',
        paintedFrontTexture: '/textures/studio/lab_linkedin_reflection_painted.webp',
        visualType: 'journal',
        badge: 'OPEN JOURNAL'
    },

    // ENTRY 05 - MEDIUM: FYNLO ARTICLE
    {
        id: 'lab-05-medium-fynlo',
        num: '05',
        title: 'Building Fynlo - An Expense Tracker That Reads Your Bank SMS',
        date: 'November 1, 2026',
        year: '2026',
        platform: 'blog',
        device: 'monitor',
        category: 'writing',
        categoryDisplay: 'Writing',
        description: 'A deep dive into building Fynlo, an automated expense tracker that reads UPI bank SMS, extracts transactions, and categorizes expenses so you don’t have to.',
        url: 'https://medium.com/@harshkarn12345/building-fynlo-an-expense-tracker-that-reads-your-bank-sms-so-you-dont-have-to-18fff11e3911?sharedUserId=harshkarn12345',
        frontTexture: '/textures/studio/lab_medium_fynlo.webp',
        paintedFrontTexture: '/textures/studio/lab_medium_fynlo_painted.webp',
        visualType: 'article',
        badge: 'ARTICLE'
    },

    // ENTRY 06 - PERSONAL BLOG
    {
        id: 'lab-06-personal-blog',
        num: '06',
        title: 'The Art of Finding Meaning in the Ordinary',
        date: 'August 21, 2025',
        year: '2025',
        platform: 'blog',
        device: 'tv',
        category: 'writing',
        categoryDisplay: 'Writing',
        description: 'A personal write-up sharing thoughts, ideas, and perspectives on finding meaning in everyday life.',
        url: 'https://harshkablogs.blogspot.com/2025/08/blog-post.html',
        frontTexture: '/textures/studio/lab_personal_blog.webp',
        paintedFrontTexture: '/textures/studio/lab_personal_blog_painted.webp',
        visualType: 'journal',
        badge: 'PERSONAL BLOG'
    }
];

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    const config = PLATFORM_CONFIG[item.platform] || {
        shape: item.device || 'monitor',
        color: '#241e17',
        accentColor: '#b87e28',
        icon: '✦',
        label: item.categoryDisplay || 'Lab Entry'
    };

    return {
        ...item,
        platformConfig: config
    };
});

// Helper to get content by category
export const getContentByCategory = (category) => {
    if (!category || category === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.category === category);
};

// Helper to get latest content
export const getLatestContent = () => {
    return CONTENT_DATA[0];
};
