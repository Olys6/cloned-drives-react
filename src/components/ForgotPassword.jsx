import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material';
import { Email, ArrowBack, CheckCircle, Info } from '@mui/icons-material';

const API_BASE_URL = '/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        Check Your Email
                    </Typography>
                    <Typography
                        sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}
                    >
                        If an account with that email exists, we've sent a password reset link. 
                        Check your inbox (and spam folder) and click the link to reset your password.
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}
                    >
                        The link will expire in 1 hour.
                    </Typography>
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
                        Back to Login
                    </Link>
                </Paper>
            </Box>
        );
    }

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
                    <Email sx={{ fontSize: 48, color: '#b8860b', mb: 1 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        Forgot Password
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
                    >
                        Enter your email and we'll send you a reset link
                    </Typography>
                </Box>

                {/* Info notice about email requirement */}
                <Alert 
                    severity="info" 
                    icon={<Info />}
                    sx={{ 
                        mb: 2,
                        backgroundColor: 'rgba(33, 150, 243, 0.15)',
                        color: 'rgba(255,255,255,0.9)',
                        '& .MuiAlert-icon': {
                            color: '#2196f3',
                        },
                    }}
                >
                    This only works if you added an email to your account during registration.
                </Alert>

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
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        autoComplete="email"
                        autoFocus
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
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                                color: '#b8860b',
                            },
                        }}
                    >
                        <ArrowBack sx={{ fontSize: 18 }} />
                        Back to Login
                    </Link>
                </Box>

                {/* Help text for users without email */}
                <Box 
                    sx={{ 
                        mt: 3, 
                        pt: 2, 
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                        Didn't add an email? Contact us on{' '}
                        <Link
                            href="https://discord.gg/p3UbVP9BxB"
                            target="_blank"
                            sx={{
                                color: '#7289da',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Discord
                        </Link>
                        {' '}for help.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default ForgotPassword;
