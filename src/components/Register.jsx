import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, isAuthenticated, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const validateForm = () => {
        // Username validation
        if (!username.trim()) {
            setFormError('Please enter a username');
            return false;
        }
        if (username.length < 3 || username.length > 30) {
            setFormError('Username must be 3-30 characters long');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setFormError('Username can only contain letters, numbers, and underscores');
            return false;
        }

        // Email validation (only if provided)
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (!password) {
            setFormError('Please enter a password');
            return false;
        }
        if (password.length < 8) {
            setFormError('Password must be at least 8 characters long');
            return false;
        }

        // Confirm password
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Pass empty string if no email provided
        const emailValue = email.trim().toLowerCase() || '';
        const result = await register(username.trim(), emailValue, password);

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setFormError(result.error);
        }

        setIsSubmitting(false);
    };

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
                    <PersonAdd sx={{ fontSize: 48, color: '#b8860b', mb: 1 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        Create Account
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
                    >
                        Join the CD Club community
                    </Typography>
                </Box>

                {(formError || error) && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        onClose={() => {
                            setFormError('');
                            clearError();
                        }}
                    >
                        {formError || error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSubmitting}
                        helperText="3-30 characters, letters, numbers, and underscores only"
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
                        autoComplete="username"
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Email (optional)"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        helperText="Only used for password reset — we won't spam you!"
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
                        autoComplete="email"
                    />

                    <TextField
                        fullWidth
                        label="Password"
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
                        label="Confirm Password"
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
                            'Create Account'
                        )}
                    </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        Already have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/login"
                            sx={{
                                color: '#b8860b',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Register;
