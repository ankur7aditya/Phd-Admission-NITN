export const ensureHttps = (url) => {
    if (!url) return url;
    return url.replace(/^http:/, 'https:');
}; 