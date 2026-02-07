import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Avatar,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Divider,
    InputAdornment,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Person,
    Security,
    Palette,
    Visibility,
    VisibilityOff,
    Save,
    Check,
    CloudUpload,
    Delete,
    ArrowBack,
} from '@mui/icons-material';
import { 
    presetAvatars, 
    presetAvatarInfo, 
    isCustomAvatar, 
    getAvatarUrl 
} from '../utils/avatarUtils';

const API_BASE_URL = '/api';

const backgroundOptions = [
    { id: 'default', label: 'Default', preview: 'rgba(255,255,255,0.1)' },
    { id: 'gradient1', label: 'Sunset', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', label: 'Ocean', preview: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
    { id: 'gradient3', label: 'Forest', preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
    { id: 'racing', label: 'Racing', preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
    { id: 'garage', label: 'Garage', preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
    { id: 'night', label: 'Night', preview: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)' },
    { id: 'sunset', label: 'Fire', preview: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
];

const colorOptions = [
    { id: 'gold', color: '#b8860b', label: 'Gold' },
    { id: 'blue', color: '#2196f3', label: 'Blue' },
    { id: 'red', color: '#f44336', label: 'Red' },
    { id: 'green', color: '#4caf50', label: 'Green' },
    { id: 'purple', color: '#9c27b0', label: 'Purple' },
    { id: 'pink', color: '#e91e63', label: 'Pink' },
    { id: 'orange', color: '#ff9800', label: 'Orange' },
    { id: 'teal', color: '#009688', label: 'Teal' },
    { id: 'silver', color: '#9e9e9e', label: 'Silver' },
];

const Settings = () => {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile state
    const [profile, setProfile] = useState({
        display_name: '',
        bio: '',
        avatar: 'default',
        profile_background: 'default',
        accent_color: 'gold',
        is_public: true,
        email: '',
    });

    // Avatar preview for upload
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Security state
    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: '',
        emailPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
        email: false,
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get-profile.php`, {
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.success) {
                    setProfile({
                        display_name: data.profile.display_name || '',
                        bio: data.profile.bio || '',
                        avatar: data.profile.avatar || 'default',
                        profile_background: data.profile.profile_background || 'default',
                        accent_color: data.profile.accent_color || 'gold',
                        is_public: data.profile.is_public ?? true,
                        email: data.profile.email || '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Please use JPG, PNG, GIF, or WebP.' });
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File too large. Maximum size is 2MB.' });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Upload avatar
    const handleUploadAvatar = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/upload-avatar.php`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setProfile((prev) => ({ ...prev, avatar: data.avatar }));
                setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
                setSelectedFile(null);
                setAvatarPreview(null);
                // Refresh user data in AuthContext so Navbar updates
                if (refreshUser) refreshUser();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    // Delete avatar
    const handleDeleteAvatar = async () => {
        if (!isCustomAvatar(profile.avatar)) return;

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/delete-avatar.php`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setProfile((prev) => ({ ...prev, avatar: 'default' }));
                setMessage({ type: 'success', text: 'Avatar removed' });
                if (refreshUser) refreshUser();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to delete avatar' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Cancel file selection
    const handleCancelUpload = () => {
        setSelectedFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/update-profile.php`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    display_name: profile.display_name,
                    bio: profile.bio,
                    avatar: profile.avatar,
                    profile_background: profile.profile_background,
                    accent_color: profile.accent_color,
                    is_public: profile.is_public,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                if (refreshUser) refreshUser();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        setMessage({ type: '', text: '' });

        if (!security.currentPassword) {
            setMessage({ type: 'error', text: 'Current password is required' });
            return;
        }
        if (!security.newPassword) {
            setMessage({ type: 'error', text: 'New password is required' });
            return;
        }
        if (security.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
            return;
        }
        if (security.newPassword !== security.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/change-password.php`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: security.currentPassword,
                    new_password: security.newPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setSecurity((prev) => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Change email
    const handleChangeEmail = async () => {
        setMessage({ type: '', text: '' });

        if (!security.emailPassword) {
            setMessage({ type: 'error', text: 'Password is required to change email' });
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/change-email.php`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: security.emailPassword,
                    new_email: security.newEmail,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setProfile((prev) => ({ ...prev, email: data.email || '' }));
                setSecurity((prev) => ({ ...prev, newEmail: '', emailPassword: '' }));
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change email' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Get current avatar display
    const getCurrentAvatarDisplay = () => {
        if (avatarPreview) {
            return { src: avatarPreview };
        }
        
        if (isCustomAvatar(profile.avatar)) {
            return { src: getAvatarUrl(profile.avatar) };
        }
        
        const presetInfo = presetAvatarInfo[profile.avatar];
        if (presetInfo) {
            return { children: presetInfo.icon, sx: { bgcolor: presetInfo.color, fontSize: '2rem' } };
        }
        
        return { 
            children: (profile.display_name || user?.username || '?').charAt(0).toUpperCase(),
            sx: { bgcolor: accentColor }
        };
    };

    const accentColor = colorOptions.find((c) => c.id === profile.accent_color)?.color || '#b8860b';

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#b8860b' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 2, px: 2 }}>
            {/* Header with back button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button
                    component={RouterLink}
                    to={`/profile/${user?.username}`}
                    startIcon={<ArrowBack />}
                    sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    Back to Profile
                </Button>
                <Typography
                    variant="h4"
                    sx={{ color: 'white', fontWeight: 'bold' }}
                >
                    Settings
                </Typography>
            </Box>

            <Paper
                sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => {
                        setActiveTab(v);
                        setMessage({ type: '', text: '' });
                    }}
                    sx={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' },
                        '& .Mui-selected': { color: accentColor },
                        '& .MuiTabs-indicator': { bgcolor: accentColor },
                    }}
                >
                    <Tab icon={<Person />} label="Profile" />
                    <Tab icon={<Palette />} label="Appearance" />
                    <Tab icon={<Security />} label="Security" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {message.text && (
                        <Alert
                            severity={message.type}
                            sx={{ mb: 3 }}
                            onClose={() => setMessage({ type: '', text: '' })}
                        >
                            {message.text}
                        </Alert>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 0 && (
                        <Box>
                            <TextField
                                fullWidth
                                label="Display Name"
                                value={profile.display_name}
                                onChange={(e) =>
                                    setProfile((prev) => ({
                                        ...prev,
                                        display_name: e.target.value,
                                    }))
                                }
                                placeholder={user?.username}
                                helperText="Leave empty to use your username"
                                sx={{ mb: 3, ...textFieldStyles }}
                            />

                            <TextField
                                fullWidth
                                label="Bio"
                                value={profile.bio}
                                onChange={(e) =>
                                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                                }
                                multiline
                                rows={3}
                                placeholder="Tell us about yourself..."
                                helperText={`${profile.bio.length}/500 characters`}
                                inputProps={{ maxLength: 500 }}
                                sx={{ mb: 3, ...textFieldStyles }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={profile.is_public}
                                        onChange={(e) =>
                                            setProfile((prev) => ({
                                                ...prev,
                                                is_public: e.target.checked,
                                            }))
                                        }
                                        sx={{
                                            '& .Mui-checked': { color: accentColor },
                                            '& .Mui-checked + .MuiSwitch-track': {
                                                bgcolor: accentColor,
                                            },
                                        }}
                                    />
                                }
                                label="Public Profile"
                                sx={{ color: 'white', mb: 3, display: 'block' }}
                            />

                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                onClick={handleSaveProfile}
                                disabled={saving}
                                sx={{
                                    bgcolor: accentColor,
                                    '&:hover': { bgcolor: accentColor },
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 1 && (
                        <Box>
                            {/* Custom Avatar Upload */}
                            <Typography sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                                Avatar
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'flex-start' }}>
                                {/* Current/Preview Avatar */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar
                                        {...getCurrentAvatarDisplay()}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            border: `3px solid ${accentColor}`,
                                            ...getCurrentAvatarDisplay().sx,
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, display: 'block' }}>
                                        {avatarPreview ? 'Preview' : 'Current'}
                                    </Typography>
                                </Box>

                                {/* Upload Controls */}
                                <Box sx={{ flex: 1 }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        style={{ display: 'none' }}
                                    />
                                    
                                    {!selectedFile ? (
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloudUpload />}
                                                onClick={() => fileInputRef.current?.click()}
                                                sx={{
                                                    borderColor: accentColor,
                                                    color: accentColor,
                                                    mb: 1,
                                                    '&:hover': { borderColor: accentColor, bgcolor: `${accentColor}22` },
                                                }}
                                            >
                                                Upload Custom Avatar
                                            </Button>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                                                JPG, PNG, GIF, or WebP. Max 2MB.
                                            </Typography>
                                            
                                            {isCustomAvatar(profile.avatar) && (
                                                <Button
                                                    size="small"
                                                    startIcon={<Delete />}
                                                    onClick={handleDeleteAvatar}
                                                    sx={{ color: '#f44336', mt: 1 }}
                                                >
                                                    Remove Custom Avatar
                                                </Button>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                                                onClick={handleUploadAvatar}
                                                disabled={uploading}
                                                sx={{ bgcolor: accentColor }}
                                            >
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={handleCancelUpload}
                                                disabled={uploading}
                                                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                            {/* Preset Avatars */}
                            <Typography sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                                Or Choose a Preset
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                {presetAvatars.map((avatar) => {
                                    const info = presetAvatarInfo[avatar];
                                    return (
                                        <Tooltip key={avatar} title={avatar} arrow>
                                            <Avatar
                                                onClick={() => {
                                                    setProfile((prev) => ({ ...prev, avatar }));
                                                    handleCancelUpload();
                                                }}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    cursor: 'pointer',
                                                    bgcolor: info?.color || '#333',
                                                    fontSize: '1.5rem',
                                                    border:
                                                        profile.avatar === avatar && !avatarPreview
                                                            ? `3px solid ${accentColor}`
                                                            : '3px solid transparent',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { transform: 'scale(1.1)' },
                                                }}
                                            >
                                                {info?.icon || avatar.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    );
                                })}
                            </Box>

                            {/* Accent Color */}
                            <Typography sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                                Accent Color
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                {colorOptions.map((colorOpt) => (
                                    <Tooltip key={colorOpt.id} title={colorOpt.label} arrow>
                                        <Box
                                            onClick={() =>
                                                setProfile((prev) => ({
                                                    ...prev,
                                                    accent_color: colorOpt.id,
                                                }))
                                            }
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                bgcolor: colorOpt.color,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border:
                                                    profile.accent_color === colorOpt.id
                                                        ? '3px solid white'
                                                        : '3px solid transparent',
                                                transition: 'all 0.2s',
                                                '&:hover': { transform: 'scale(1.1)' },
                                            }}
                                        >
                                            {profile.accent_color === colorOpt.id && (
                                                <Check sx={{ color: 'white' }} />
                                            )}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>

                            {/* Profile Background */}
                            <Typography sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                                Profile Background
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                                {backgroundOptions.map((bg) => (
                                    <Tooltip key={bg.id} title={bg.label} arrow>
                                        <Box
                                            onClick={() =>
                                                setProfile((prev) => ({
                                                    ...prev,
                                                    profile_background: bg.id,
                                                }))
                                            }
                                            sx={{
                                                width: 80,
                                                height: 50,
                                                borderRadius: 1,
                                                background: bg.preview,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border:
                                                    profile.profile_background === bg.id
                                                        ? `2px solid ${accentColor}`
                                                        : '2px solid transparent',
                                                transition: 'all 0.2s',
                                                '&:hover': { transform: 'scale(1.05)' },
                                            }}
                                        >
                                            {profile.profile_background === bg.id && (
                                                <Check sx={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                                            )}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                onClick={handleSaveProfile}
                                disabled={saving}
                                sx={{
                                    bgcolor: accentColor,
                                    '&:hover': { bgcolor: accentColor },
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    )}

                    {/* Security Tab */}
                    {activeTab === 2 && (
                        <Box>
                            {/* Change Password Section */}
                            <Typography
                                sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}
                            >
                                Change Password
                            </Typography>

                            <TextField
                                fullWidth
                                label="Current Password"
                                type={showPasswords.current ? 'text' : 'password'}
                                value={security.currentPassword}
                                onChange={(e) =>
                                    setSecurity((prev) => ({
                                        ...prev,
                                        currentPassword: e.target.value,
                                    }))
                                }
                                sx={{ mb: 2, ...textFieldStyles }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPasswords((prev) => ({
                                                        ...prev,
                                                        current: !prev.current,
                                                    }))
                                                }
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                            >
                                                {showPasswords.current ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="New Password"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={security.newPassword}
                                onChange={(e) =>
                                    setSecurity((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                helperText="Minimum 8 characters"
                                sx={{ mb: 2, ...textFieldStyles }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPasswords((prev) => ({
                                                        ...prev,
                                                        new: !prev.new,
                                                    }))
                                                }
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                            >
                                                {showPasswords.new ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={security.confirmPassword}
                                onChange={(e) =>
                                    setSecurity((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                sx={{ mb: 2, ...textFieldStyles }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPasswords((prev) => ({
                                                        ...prev,
                                                        confirm: !prev.confirm,
                                                    }))
                                                }
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                            >
                                                {showPasswords.confirm ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleChangePassword}
                                disabled={saving}
                                sx={{
                                    mb: 4,
                                    bgcolor: accentColor,
                                    '&:hover': { bgcolor: accentColor },
                                }}
                            >
                                {saving ? <CircularProgress size={20} /> : 'Change Password'}
                            </Button>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                            {/* Change Email Section */}
                            <Typography
                                sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}
                            >
                                Change Email
                            </Typography>

                            <Typography
                                sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}
                            >
                                Current email: {profile.email || 'Not set'}
                            </Typography>

                            <TextField
                                fullWidth
                                label="New Email (leave empty to remove)"
                                type="email"
                                value={security.newEmail}
                                onChange={(e) =>
                                    setSecurity((prev) => ({
                                        ...prev,
                                        newEmail: e.target.value,
                                    }))
                                }
                                helperText="Email is only used for password reset"
                                sx={{ mb: 2, ...textFieldStyles }}
                            />

                            <TextField
                                fullWidth
                                label="Current Password (required)"
                                type={showPasswords.email ? 'text' : 'password'}
                                value={security.emailPassword}
                                onChange={(e) =>
                                    setSecurity((prev) => ({
                                        ...prev,
                                        emailPassword: e.target.value,
                                    }))
                                }
                                sx={{ mb: 2, ...textFieldStyles }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPasswords((prev) => ({
                                                        ...prev,
                                                        email: !prev.email,
                                                    }))
                                                }
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                            >
                                                {showPasswords.email ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleChangeEmail}
                                disabled={saving}
                                sx={{
                                    bgcolor: accentColor,
                                    '&:hover': { bgcolor: accentColor },
                                }}
                            >
                                {saving ? <CircularProgress size={20} /> : 'Update Email'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// Shared text field styles
const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
        '&.Mui-focused fieldset': { borderColor: '#b8860b' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#b8860b' },
    '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
};

export default Settings;
