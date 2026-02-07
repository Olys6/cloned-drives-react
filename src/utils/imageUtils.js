// ============================================================
// IMAGE OPTIMIZATION UTILITIES
// Uses images.weserv.nl as a FREE image proxy/CDN
// 
// This service:
// - Resizes images on-the-fly (no re-uploading needed!)
// - Converts to WebP automatically for smaller sizes
// - Caches images globally for fast delivery
// - Works with ANY image URL (file.garden, imgur, etc.)
//
// Usage:
//   import { getThumbnailUrl, getMediumUrl, getOptimizedUrl } from './imageUtils';
//   <img src={getThumbnailUrl(car.racehud)} />
// ============================================================

/**
 * Get a thumbnail version of an image (small, for grids/lists)
 * @param {string} originalUrl - The original image URL
 * @param {number} width - Target width in pixels (default: 240)
 * @param {number} quality - JPEG/WebP quality 1-100 (default: 70)
 * @returns {string} - Optimized thumbnail URL
 */
export const getThumbnailUrl = (originalUrl, width = 240, quality = 70) => {
	if (!originalUrl) return originalUrl;
	
	// Remove protocol for weserv.nl
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	
	// Parameters:
	// w = width
	// q = quality (1-100)
	// we = convert to WebP if browser supports it
	// il = interlace/progressive loading
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we&il`;
};

/**
 * Get a medium-sized version (for modals, detail views)
 * @param {string} originalUrl - The original image URL
 * @param {number} width - Target width in pixels (default: 500)
 * @param {number} quality - Quality 1-100 (default: 80)
 * @returns {string} - Optimized medium URL
 */
export const getMediumUrl = (originalUrl, width = 500, quality = 80) => {
	if (!originalUrl) return originalUrl;
	
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we`;
};

/**
 * Get a tiny placeholder (for blur-up effect)
 * @param {string} originalUrl - The original image URL
 * @returns {string} - Very small placeholder URL
 */
export const getPlaceholderUrl = (originalUrl) => {
	if (!originalUrl) return originalUrl;
	
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	// Very small (60px wide), low quality for fast loading placeholder
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=60&q=30&we&il`;
};

/**
 * Get an optimized image with custom parameters
 * @param {string} originalUrl - The original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height (optional)
 * @param {number} options.quality - Quality 1-100
 * @param {string} options.fit - Fit mode: 'contain', 'cover', 'fill', 'inside', 'outside'
 * @param {boolean} options.webp - Convert to WebP (default: true)
 * @param {string} options.bg - Background color for transparent images (hex without #)
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (originalUrl, options = {}) => {
	if (!originalUrl) return originalUrl;
	
	const {
		width,
		height,
		quality = 80,
		fit,
		webp = true,
		bg,
	} = options;
	
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	
	let params = [`url=${encodeURIComponent(urlWithoutProtocol)}`];
	
	if (width) params.push(`w=${width}`);
	if (height) params.push(`h=${height}`);
	if (quality) params.push(`q=${quality}`);
	if (fit) params.push(`fit=${fit}`);
	if (webp) params.push('we');
	if (bg) params.push(`bg=${bg}`);
	
	return `https://images.weserv.nl/?${params.join('&')}`;
};

/**
 * Presets for common use cases
 */
export const ImagePresets = {
	// For card grids (like car lists)
	CARD_THUMB: { width: 240, quality: 70 },
	
	// For race HUD displays
	RACE_HUD: { width: 200, quality: 75 },
	
	// For modal/detail views
	MODAL: { width: 500, quality: 85 },
	
	// For pack art
	PACK_ART: { width: 300, quality: 80 },
	
	// For track backgrounds
	TRACK_BG: { width: 400, quality: 75 },
	
	// Full size but optimized (WebP conversion only)
	FULL_OPTIMIZED: { quality: 90 },
};

/**
 * Get URL using a preset
 * @param {string} originalUrl - The original image URL
 * @param {string} presetName - One of: CARD_THUMB, RACE_HUD, MODAL, PACK_ART, TRACK_BG, FULL_OPTIMIZED
 * @returns {string} - Optimized URL
 */
export const getPresetUrl = (originalUrl, presetName) => {
	const preset = ImagePresets[presetName] || ImagePresets.CARD_THUMB;
	return getOptimizedUrl(originalUrl, preset);
};

// ============================================================
// USAGE EXAMPLES:
// ============================================================
//
// Basic thumbnail:
//   <img src={getThumbnailUrl(car.racehud)} />
//
// Medium for modals:
//   <img src={getMediumUrl(car.racehud)} />
//
// With lazy loading (react-lazy-load-image-component):
//   <LazyLoadImage
//     src={getThumbnailUrl(car.racehud)}
//     placeholderSrc={getPlaceholderUrl(car.racehud)}
//     effect="blur"
//   />
//
// Custom sizing:
//   <img src={getOptimizedUrl(car.racehud, { width: 300, height: 200, fit: 'cover' })} />
//
// Using presets:
//   <img src={getPresetUrl(packData.packArt, 'PACK_ART')} />
//
// ============================================================
