export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Replace our local path /sanity-cdn with the official Sanity CDN domain
  const sanityUrl = context.request.url.replace(url.origin + '/sanity-cdn', 'https://cdn.sanity.io');
  
  // Fetch image from Sanity and instruct Cloudflare to cache for 1 year (Sanity images are immutable)
  return fetch(sanityUrl, {
    headers: context.request.headers,
    cf: {
      cacheEverything: true,
      cacheTtl: 31536000 // 1 year in seconds
    }
  });
}
