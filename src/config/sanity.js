import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
    projectId: 'kv5wjjmj', // Completed after project creation in Sanity
    dataset: 'production',
    useCdn: true, // 'false' for dev environment, 'true' for production for faster delivery
    apiVersion: '2024-03-01', // current API date
});

const builder = createImageUrlBuilder(sanityClient);

// Helper function to generate image URLs from Sanity
export const urlFor = (source) => builder.image(source);

// Helper function to swap Sanity domain with Cloudflare proxy
export const getProxyUrl = (imageBuilder) => {
    if (!imageBuilder) return null;
    const url = imageBuilder.url();
    if (url && typeof window !== 'undefined') {
        return url.replace('https://cdn.sanity.io', '/sanity-cdn');
    }
    return url;
};
