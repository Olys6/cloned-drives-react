/**
 * Avatar utility functions
 */

// Preset avatar options
export const presetAvatars = [
    'default', 'car1', 'car2', 'car3', 'car4', 'car5',
    'racing1', 'racing2', 'racing3', 'trophy1', 'trophy2',
    'wheel1', 'wheel2', 'flag1', 'flag2'
];

// Preset avatar display info (emoji icons and colors)
export const presetAvatarInfo = {
    default: { icon: '👤', color: '#666' },
    car1: { icon: '🚗', color: '#e74c3c' },
    car2: { icon: '🏎️', color: '#3498db' },
    car3: { icon: '🚙', color: '#2ecc71' },
    car4: { icon: '🚕', color: '#f1c40f' },
    car5: { icon: '🚐', color: '#9b59b6' },
    racing1: { icon: '🏁', color: '#1abc9c' },
    racing2: { icon: '🏆', color: '#e67e22' },
    racing3: { icon: '⚡', color: '#f39c12' },
    trophy1: { icon: '🥇', color: '#f1c40f' },
    trophy2: { icon: '🥈', color: '#bdc3c7' },
    wheel1: { icon: '🛞', color: '#34495e' },
    wheel2: { icon: '⚙️', color: '#7f8c8d' },
    flag1: { icon: '🚩', color: '#e74c3c' },
    flag2: { icon: '🎌', color: '#3498db' },
};

/**
 * Check if avatar is a custom upload
 * @param {string} avatar - Avatar identifier
 * @returns {boolean}
 */
export const isCustomAvatar = (avatar) => {
    return avatar && avatar.startsWith('avatar_');
};

/**
 * Get avatar URL for custom avatars
 * @param {string} avatar - Avatar identifier
 * @returns {string|null} URL for custom avatars, null for presets
 */
export const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    
    if (isCustomAvatar(avatar)) {
        return `/uploads/avatars/${avatar}`;
    }
    
    return null;
};

/**
 * Get avatar display props for MUI Avatar component
 * @param {string} avatar - Avatar identifier
 * @param {string} displayName - User's display name (for fallback letter)
 * @param {string} accentColor - User's accent color
 * @returns {object} Props for MUI Avatar component
 */
export const getAvatarProps = (avatar, displayName = '', accentColor = '#b8860b') => {
    const customUrl = getAvatarUrl(avatar);
    
    if (customUrl) {
        return {
            src: customUrl,
            sx: { bgcolor: accentColor }
        };
    }
    
    // Preset avatar - show emoji
    const presetInfo = presetAvatarInfo[avatar];
    
    if (presetInfo) {
        return {
            sx: { bgcolor: presetInfo.color, fontSize: '1.5rem' },
            children: presetInfo.icon
        };
    }
    
    // Default fallback - first letter
    return {
        sx: { bgcolor: accentColor, fontWeight: 'bold' },
        children: displayName?.charAt(0).toUpperCase() || '?'
    };
};

export default {
    presetAvatars,
    presetAvatarInfo,
    isCustomAvatar,
    getAvatarUrl,
    getAvatarProps,
};
