import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Link,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { 
    LockReset, 
    Visibility, 
    VisibilityOff, 
    CheckCircle,
    Error as ErrorIcon 
} from '@mui/icons-material';

const API_BASE_URL = '/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isValidating, setIsValidating] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('No reset token provided');
                setIsValidating(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/verify-reset-token.php?token=${encodeURIComponent(token)}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                );

                const data = await response.json();

                if (data.valid) {
                    setTokenValid(true);
                    setUsername(data.username || '');
                } else {
                    setError(data.error || 'Invalid or expired reset link');
                }
            } catch (err) {
                setError('Failed to verify reset link. Please try again.');
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!password) {
            setError('Please enter a new password');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isValidating) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '70vh',
                }}
            >
                <CircularProgress sx={{ color: '#b8860b' }} size={60} />
            </Box>
        );
    }

    // Invalid token state
    if (!tokenValid && !success) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '70vh',
                    px: 2,
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        maxWidth: 420,
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center',
                    }}
                >
                    <ErrorIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            mb: 2,
                        }}
                    >
                        Invalid Reset Link
                    </Typography>
                    <Typography
                        sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}
                    >
                        {error || 'This password reset link is invalid or has expired.'}
                    </Typography>
                    <Link
                        component={RouterLink}
                        to="/forgot-password"
                        sx={{
                            color: '#b8860b',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Request a New Reset Link
                    </Link>
                </Paper>
            </Box>
        );
    }

    // Success state
    if (success) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '70vh',
                    px: 2,
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        maxWidth: 420,
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center',
                    }}
                >
                    <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            mb: 2,
                        }}
                    >
                        Password Reset!
                    </Typography>
                    <Typography
                        sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}
                    >
                        Your password has been successfully reset. You can now log in with your new password.
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        sx={{
                            backgroundColor: '#b8860b',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#9a7209',
                            },
                        }}
                    >
                        Go to Login
                    </Button>
                </Paper>
            </Box>
        );
    }

    // Reset password form
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                px: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    maxWidth: 420,
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <LockReset sx={{ fontSize: 48, color: '#b8860b', mb: 1 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        Reset Password
                    </Typography>
                    {username && (
                        <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
                        >
                            Setting new password for <strong style={{ color: '#b8860b' }}>{username}</strong>
                        </Typography>
                    )}
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        helperText="Minimum 8 characters"
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255,255,255,0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#b8860b',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#b8860b',
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255,255,255,0.5)',
                            },
                        }}
                        autoComplete="new-password"
                        autoFocus
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255,255,255,0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#b8860b',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#b8860b',
                            },
                        }}
                        autoComplete="new-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            py: 1.5,
                            backgroundColor: '#b8860b',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: '#9a7209',
                            },
                            '&:disabled': {
                                backgroundColor: 'rgba(184, 134, 11, 0.5)',
                            },
                        }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default ResetPassword;
