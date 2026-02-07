import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Grid,
    Tooltip,
} from '@mui/material';
import {
    Settings,
    PersonAdd,
    PersonRemove,
    EmojiEvents,
    Casino,
    Flag,
    Mouse,
    TrendingUp,
    CalendarToday,
} from '@mui/icons-material';
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

// Background gradient mapping - vertical fade to transparent
const backgroundGradients = {
    default: 'linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(30,30,30,0.4) 100%)',
    gradient1: 'linear-gradient(180deg, #667eea 0%, #764ba2 50%, rgba(30,30,30,0.4) 100%)',
    gradient2: 'linear-gradient(180deg, #2193b0 0%, #6dd5ed 50%, rgba(30,30,30,0.4) 100%)',
    gradient3: 'linear-gradient(180deg, #134e5e 0%, #71b280 50%, rgba(30,30,30,0.4) 100%)',
    racing: 'linear-gradient(180deg, #1a1a2e 0%, #0f3460 50%, rgba(30,30,30,0.4) 100%)',
    garage: 'linear-gradient(180deg, #414345 0%, #232526 50%, rgba(30,30,30,0.4) 100%)',
    night: 'linear-gradient(180deg, #1a1a2e 0%, #0c0c0c 50%, rgba(30,30,30,0.4) 100%)',
    sunset: 'linear-gradient(180deg, #f12711 0%, #f5af19 50%, rgba(30,30,30,0.4) 100%)',
};

// Badge rarity colors
const rarityColors = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800',
};

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');

            try {
                const url = username
                    ? `${API_BASE_URL}/get-profile.php?username=${encodeURIComponent(username)}`
                    : `${API_BASE_URL}/get-profile.php`;

                const response = await fetch(url, {
                    credentials: 'include',
                });

                const data = await response.json();

                if (data.success) {
                    setProfile(data.profile);
                } else {
                    setError(data.error || 'Failed to load profile');
                }
            } catch (err) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    // Handle follow/unfollow
    const handleFollowToggle = async () => {
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

    // Get accent color
    const getAccentColor = () => {
        return accentColors[profile?.accent_color] || accentColors.gold;
    };

    // Get background style
    const getBackgroundStyle = () => {
        const bg = profile?.profile_background || 'default';
        return backgroundGradients[bg] || backgroundGradients.default;
    };

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
                sx: { fontSize: '3rem' }
            };
        }
        
        return { 
            children: (profile.display_name || profile.username)?.charAt(0).toUpperCase() 
        };
    };

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#b8860b' }} />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, px: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    // Private profile state
    if (profile?.is_private) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, px: 2, textAlign: 'center' }}>
                <Paper
                    sx={{
                        p: 4,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            mx: 'auto',
                            mb: 2,
                            bgcolor: '#333',
                            fontSize: '2.5rem',
                        }}
                    >
                        {profile.display_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                        {profile.display_name || profile.username}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        This profile is private
                    </Typography>
                </Paper>
            </Box>
        );
    }

    const accentColor = getAccentColor();
    const backgroundStyle = getBackgroundStyle();
    const avatarDisplay = getAvatarDisplay();

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', py: 2, px: 2 }}>
            {/* Profile Header */}
            <Paper
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${accentColor}33`,
                    background: backgroundStyle,
                }}
            >
                {/* Profile Content */}
                <Box sx={{ p: 3, pt: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'flex-start' },
                            gap: 3,
                        }}
                    >
                        {/* Avatar */}
                        <Avatar
                            {...avatarDisplay}
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: accentColor,
                                fontSize: avatarDisplay.src ? undefined : '3rem',
                                fontWeight: 'bold',
                                border: `4px solid ${accentColor}`,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                ...avatarDisplay.sx,
                            }}
                        />

                        {/* Info */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: { xs: 'center', sm: 'flex-start' },
                                    gap: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    {profile.display_name || profile.username}
                                </Typography>
                                {profile.role === 'admin' && (
                                    <Chip
                                        label="Admin"
                                        size="small"
                                        sx={{ bgcolor: accentColor, color: 'white' }}
                                    />
                                )}
                            </Box>

                            <Typography
                                sx={{ 
                                    color: 'rgba(255,255,255,0.7)', 
                                    mb: 2,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                }}
                            >
                                @{profile.username}
                            </Typography>

                            {profile.bio && (
                                <Typography
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.9)', 
                                        mb: 2,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    {profile.bio}
                                </Typography>
                            )}

                            {/* Stats Row */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 3,
                                    justifyContent: { xs: 'center', sm: 'flex-start' },
                                    flexWrap: 'wrap',
                                    mb: 2,
                                }}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        sx={{ 
                                            color: 'white', 
                                            fontWeight: 'bold',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {profile.followers_count}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        Followers
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        sx={{ 
                                            color: 'white', 
                                            fontWeight: 'bold',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {profile.following_count}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        Following
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <CalendarToday
                                        sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        Joined{' '}
                                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    justifyContent: { xs: 'center', sm: 'flex-start' },
                                }}
                            >
                                {profile.is_own_profile ? (
                                    <Button
                                        component={RouterLink}
                                        to="/settings"
                                        variant="outlined"
                                        startIcon={<Settings />}
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            color: 'white',
                                            backdropFilter: 'blur(4px)',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                            },
                                        }}
                                    >
                                        Edit Profile
                                    </Button>
                                ) : currentUser ? (
                                    <Button
                                        variant={profile.is_following ? 'outlined' : 'contained'}
                                        startIcon={
                                            profile.is_following ? (
                                                <PersonRemove />
                                            ) : (
                                                <PersonAdd />
                                            )
                                        }
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        sx={{
                                            bgcolor: profile.is_following
                                                ? 'rgba(0,0,0,0.2)'
                                                : accentColor,
                                            borderColor: profile.is_following 
                                                ? 'rgba(255,255,255,0.5)' 
                                                : accentColor,
                                            color: 'white',
                                            backdropFilter: 'blur(4px)',
                                            '&:hover': {
                                                bgcolor: profile.is_following
                                                    ? 'rgba(255,255,255,0.1)'
                                                    : accentColor,
                                                borderColor: profile.is_following
                                                    ? 'white'
                                                    : accentColor,
                                            },
                                        }}
                                    >
                                        {profile.is_following ? 'Following' : 'Follow'}
                                    </Button>
                                ) : (
                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        variant="contained"
                                        sx={{ bgcolor: accentColor }}
                                    >
                                        Login to Follow
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs */}
            <Paper
                sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' },
                        '& .Mui-selected': { color: accentColor },
                        '& .MuiTabs-indicator': { bgcolor: accentColor },
                    }}
                >
                    <Tab label="Showcase" />
                    <Tab label="Badges" />
                    <Tab label="Stats" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {/* Showcase Tab */}
                    {activeTab === 0 && (
                        <Box>
                            {profile.showcase?.length > 0 ? (
                                <Grid container spacing={2}>
                                    {profile.showcase.map((item, index) => (
                                        <Grid item xs={6} sm={3} key={index}>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    sx={{ color: accentColor }}
                                                >
                                                    {profile.stats?.[item.stat_type] || 0}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: 'rgba(255,255,255,0.6)' }}
                                                >
                                                    {item.stat_type
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography
                                    sx={{
                                        color: 'rgba(255,255,255,0.5)',
                                        textAlign: 'center',
                                        py: 4,
                                    }}
                                >
                                    No showcase items yet
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Badges Tab */}
                    {activeTab === 1 && (
                        <Box>
                            {profile.badges?.length > 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                    }}
                                >
                                    {profile.badges.map((badge, index) => (
                                        <Tooltip
                                            key={index}
                                            title={badge.description}
                                            arrow
                                        >
                                            <Chip
                                                icon={<EmojiEvents />}
                                                label={badge.name}
                                                sx={{
                                                    bgcolor: `${rarityColors[badge.rarity]}33`,
                                                    color: rarityColors[badge.rarity],
                                                    borderColor: rarityColors[badge.rarity],
                                                    border: '1px solid',
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            ) : (
                                <Typography
                                    sx={{
                                        color: 'rgba(255,255,255,0.5)',
                                        textAlign: 'center',
                                        py: 4,
                                    }}
                                >
                                    No badges earned yet
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 2 && (
                        <Grid container spacing={2}>
                            {profile.stats && Object.keys(profile.stats).length > 0 ? (
                                <>
                                    <Grid item xs={6} sm={4}>
                                        <StatCard
                                            icon={<Casino />}
                                            label="Packs Opened"
                                            value={profile.stats.packs_opened || 0}
                                            color={accentColor}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <StatCard
                                            icon={<Flag />}
                                            label="Races Won"
                                            value={profile.stats.races_won || 0}
                                            color={accentColor}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <StatCard
                                            icon={<Mouse />}
                                            label="Total Clicks"
                                            value={formatNumber(profile.stats.clicker_total_clicks || 0)}
                                            color={accentColor}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <StatCard
                                            icon={<TrendingUp />}
                                            label="Hi-Lo Highscore"
                                            value={profile.stats.higherlower_highscore || 0}
                                            color={accentColor}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <StatCard
                                            icon={<EmojiEvents />}
                                            label="Legendaries"
                                            value={profile.stats.legendaries_pulled || 0}
                                            color={accentColor}
                                        />
                                    </Grid>
                                </>
                            ) : (
                                <Grid item xs={12}>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255,255,255,0.5)',
                                            textAlign: 'center',
                                            py: 4,
                                        }}
                                    >
                                        No stats recorded yet
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
    <Paper
        sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.3)',
            borderRadius: 2,
        }}
    >
        <Box sx={{ color, mb: 1 }}>{icon}</Box>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {label}
        </Typography>
    </Paper>
);

// Format large numbers
const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export default Profile;
