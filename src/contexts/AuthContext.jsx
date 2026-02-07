import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// API base URL - update this to match your PHP API location
const API_BASE_URL = '/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on mount
    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/check-auth.php`, {
                method: 'GET',
                credentials: 'include', // Important for cookies/sessions
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.authenticated && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function
    const login = async (username, password) => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                setError(data.error || 'Login failed');
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (err) {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (username, email, password) => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/register.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                setError(data.error || 'Registration failed');
                return { success: false, error: data.error || 'Registration failed' };
            }
        } catch (err) {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);

        try {
            await fetch(`${API_BASE_URL}/logout.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    // Clear error
    const clearError = () => setError(null);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
