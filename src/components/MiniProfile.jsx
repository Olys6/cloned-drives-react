import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Popper,
    Fade,
    Chip,
    CircularProgress,
    Button,
} from '@mui/material';
import { PersonAdd, PersonRemove, EmojiEvents } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
    isCustomAvatar, 
    getAvatarUrl, 
    presetAvatarInfo 
} from '../utils/avatarUtils';

const API_BASE_URL = '/api';

// Accent color mapping
const accentColors = {
    gold: '#b8860b',
    blue: '#2196f3',
    red: '#f44336',
    green: '#4caf50',
    purple: '#9c27b0',
    pink: '#e91e63',
    orange: '#ff9800',
    teal: '#009688',
    silver: '#9e9e9e',
};

/**
 * MiniProfile Component
 * Shows a hover card with user info when hovering over a username
 * 
 * Usage:
 * <MiniProfile username="someuser">
 *   <Typography>@someuser</Typography>
 * </MiniProfile>
 */
const MiniProfile = ({ username, children }) => {
    const { user: currentUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const open = Boolean(anchorEl);

    // Fetch profile on hover
    const fetchProfile = async () => {
        if (profile) return; // Already loaded

        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/get-profile.php?username=${encodeURIComponent(username)}`,
                { credentials: 'include' }
            );
            const data = await response.json();

            if (data.success) {
                setProfile(data.profile);
            }
        } catch (err) {
            console.error('Failed to fetch mini profile:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle mouse enter with delay
    const handleMouseEnter = (event) => {
        const target = event.currentTarget;
        const timeout = setTimeout(() => {
            setAnchorEl(target);
            fetchProfile();
        }, 300);
        setHoverTimeout(timeout);
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setAnchorEl(null);
    };

    // Handle follow/unfollow
    const handleFollowToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || !profile) return;

        setFollowLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/follow.php`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: profile.id,
                    action: profile.is_following ? 'unfollow' : 'follow',
                }),
            });

            const data = await response.json();

            if (data.success) {
                setProfile((prev) => ({
                    ...prev,
                    is_following: data.is_following,
                    followers_count: data.is_following
                        ? prev.followers_count + 1
                        : prev.followers_count - 1,
                }));
            }
        } catch (err) {
            console.error('Follow error:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    // Get avatar display props
    const getAvatarDisplay = () => {
        if (!profile) return {};
        
        const customUrl = getAvatarUrl(profile.avatar);
        
        if (customUrl) {
            return { src: customUrl };
        }
        
        const presetInfo = presetAvatarInfo[profile.avatar];
        if (presetInfo) {
            return { 
                children: presetInfo.icon,
                sx: { fontSize: '1.5rem' }
            };
        }
        
        return { 
            children: (profile.display_name || profile.username)?.charAt(0).toUpperCase() 
        };
    };

    const accentColor = profile 
        ? accentColors[profile.accent_color] || accentColors.gold
        : accentColors.gold;

    return (
        <>
            <Box
                component="span"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{ display: 'inline', cursor: 'pointer' }}
            >
                {children}
            </Box>

            <Popper
                open={open}
                anchorEl={anchorEl}
                placement="top"
                transition
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <Paper
                            onMouseEnter={() => setAnchorEl(anchorEl)}
                            onMouseLeave={handleMouseLeave}
                            sx={{
                                p: 2,
                                minWidth: 280,
                                maxWidth: 320,
                                background: 'rgba(30, 30, 30, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                border: `1px solid ${accentColor}44`,
                                boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={32} sx={{ color: accentColor }} />
                                </Box>
                            ) : profile ? (
                                <>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Avatar
                                            {...getAvatarDisplay()}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: accentColor,
                                                fontWeight: 'bold',
                                                ...getAvatarDisplay().sx,
                                            }}
                                        />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    component={RouterLink}
                                                    to={`/profile/${profile.username}`}
                                                    sx={{
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        textDecoration: 'none',
                                                        '&:hover': { textDecoration: 'underline' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {profile.display_name || profile.username}
                                                </Typography>
                                                {profile.role === 'admin' && (
                                                    <Chip
                                                        label="Admin"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            bgcolor: accentColor,
                                                            color: 'white',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'rgba(255,255,255,0.5)' }}
                                            >
                                                @{profile.username}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Bio */}
                                    {profile.bio && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255,255,255,0.8)',
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {profile.bio}
                                        </Typography>
                                    )}

                                    {/* Stats */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 3,
                                            mb: 2,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
                                            >
                                                {profile.followers_count}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'rgba(255,255,255,0.5)' }}
                                            >
                                                Followers
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
                                            >
                                                {profile.following_count}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'rgba(255,255,255,0.5)' }}
                                            >
                                                Following
                                            </Typography>
                                        </Box>
                                        {profile.badges?.length > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EmojiEvents sx={{ color: accentColor, fontSize: 18 }} />
                                                <Typography
                                                    sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
                                                >
                                                    {profile.badges.length}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: 'rgba(255,255,255,0.5)' }}
                                                >
                                                    Badges
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    {currentUser && !profile.is_own_profile && (
                                        <Button
                                            fullWidth
                                            size="small"
                                            variant={profile.is_following ? 'outlined' : 'contained'}
                                            startIcon={
                                                followLoading ? (
                                                    <CircularProgress size={16} />
                                                ) : profile.is_following ? (
                                                    <PersonRemove />
                                                ) : (
                                                    <PersonAdd />
                                                )
                                            }
                                            onClick={handleFollowToggle}
                                            disabled={followLoading}
                                            sx={{
                                                bgcolor: profile.is_following ? 'transparent' : accentColor,
                                                borderColor: accentColor,
                                                color: profile.is_following ? accentColor : 'white',
                                                '&:hover': {
                                                    bgcolor: profile.is_following
                                                        ? `${accentColor}22`
                                                        : accentColor,
                                                    borderColor: accentColor,
                                                },
                                            }}
                                        >
                                            {profile.is_following ? 'Following' : 'Follow'}
                                        </Button>
                                    )}

                                    {profile.is_own_profile && (
                                        <Button
                                            fullWidth
                                            size="small"
                                            component={RouterLink}
                                            to="/settings"
                                            variant="outlined"
                                            sx={{
                                                borderColor: accentColor,
                                                color: accentColor,
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Profile not found
                                </Typography>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </>
    );
};

export default MiniProfile;
