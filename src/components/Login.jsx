import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
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
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, isAuthenticated, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Clear errors when component unmounts or inputs change
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Basic validation
        if (!username.trim()) {
            setFormError('Please enter your username');
            return;
        }
        if (!password) {
            setFormError('Please enter your password');
            return;
        }

        setIsSubmitting(true);

        const result = await login(username.trim(), password);

        if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
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
                    <LoginIcon sx={{ fontSize: 48, color: '#b8860b', mb: 1 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
                    >
                        Sign in to your CD Club account
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
                        }}
                        autoComplete="username"
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        sx={{
                            mb: 1,
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
                        autoComplete="current-password"
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

                    {/* Forgot Password Link */}
                    <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Link
                            component={RouterLink}
                            to="/forgot-password"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                '&:hover': {
                                    color: '#b8860b',
                                },
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </Box>

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
                            'Sign In'
                        )}
                    </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        Don't have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/register"
                            sx={{
                                color: '#b8860b',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
