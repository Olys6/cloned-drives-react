/**
 * Cloud Save System for CD Clicker
 * 
 * Uses a CLEAN, SIMPLE format with actual carIDs (e.g., "c00001")
 * No index encoding - human readable and future-proof!
 * 
 * Example cloud save:
 * {
 *   "v": 1,
 *   "money": 1500000,
 *   "tokens": 50,
 *   "collection": { "c00001": 5, "c00042": 2 },
 *   "garage": ["c00001", "c00042"],
 *   "enhancements": { "c00001": 3 },
 *   ...
 * }
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = '/api';
const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
const CLOUD_SAVE_VERSION = 1;

/**
 * Hook for cloud save functionality
 * @param {Object} gameState - Current game state object from context
 * @param {Function} loadCloudSave - Function to load clean format into game
 * @param {boolean} isAuthenticated - Whether user is logged in
 */
export const useCloudSave = (gameState, loadCloudSave, isAuthenticated) => {
    const [cloudStatus, setCloudStatus] = useState({
        loading: false,
        saving: false,
        lastSaved: null,
        lastLoaded: null,
        error: null,
        hasCloudSave: false,
        isOnline: navigator.onLine,
        pendingSave: false,
    });
    
    const autoSaveIntervalRef = useRef(null);
    const lastSaveHashRef = useRef(null);
    const pendingSaveRef = useRef(false);
    const hasAutoLoadedRef = useRef(false);
    const saveToCloudRef = useRef(null);
    
    /**
     * Simple hash to detect state changes
     */
    const getStateHash = useCallback((state) => {
        if (!state) return '';
        const collectionSize = state.collection ? Object.keys(state.collection).length : 0;
        return `${Math.floor(state.money)}-${state.tokens}-${collectionSize}-${state.packsOpened}-${state.racesWon}`;
    }, []);
    
    /**
     * Convert game state to clean cloud format
     * Uses actual carIDs - no index encoding!
     */
    const toCloudFormat = useCallback((state) => {
        if (!state) return null;
        
        // Convert Set to Array for lockedCars
        let lockedCarsArray = [];
        if (state.lockedCars) {
            lockedCarsArray = state.lockedCars instanceof Set 
                ? Array.from(state.lockedCars) 
                : (Array.isArray(state.lockedCars) ? state.lockedCars : []);
        }
        
        return {
            // Meta
            v: CLOUD_SAVE_VERSION,
            savedAt: new Date().toISOString(),
            
            // Currency
            money: Math.floor(state.money || 0),
            tokens: state.tokens || 0,
            tuneTokens: state.tuneTokens || 0,
            
            // Cars - using actual carIDs!
            garage: state.garage || [],
            collection: state.collection || {},
            enhancements: state.carEnhancements || {},
            lockedCars: lockedCarsArray,
            prizeCarBonuses: state.prizeCarBonuses || {},
            
            // Upgrades & Progression
            upgrades: state.upgrades || {},
            packPurchases: state.packPurchases || {},
            purchasedChallenges: state.purchasedChallenges || [],
            unlockedDifficulties: state.unlockedDifficulties || ['low_cr'],
            activeChallenge: state.activeChallenge || null,
            
            // Statistics
            totalCollects: state.totalCollects || 0,
            totalEarnings: Math.floor(state.totalEarnings || 0),
            packsOpened: state.packsOpened || 0,
            carsSold: state.carsSold || 0,
            moneyFromSales: Math.floor(state.moneyFromSales || 0),
            racesWon: state.racesWon || 0,
            racesLost: state.racesLost || 0,
            
            // State
            hasClaimedStarter: state.hasClaimedStarter || false,
            lastCollect: state.lastCollect || 0,
        };
    }, []);
    
    /**
     * Convert cloud format back to game state
     */
    const fromCloudFormat = useCallback((cloud) => {
        if (!cloud) return null;
        
        return {
            money: cloud.money || 1000,
            tokens: cloud.tokens || 0,
            tuneTokens: cloud.tuneTokens || 0,
            
            garage: cloud.garage || [],
            collection: cloud.collection || {},
            carEnhancements: cloud.enhancements || {},
            lockedCars: new Set(cloud.lockedCars || []),
            prizeCarBonuses: cloud.prizeCarBonuses || {},
            
            upgrades: cloud.upgrades || {},
            packPurchases: cloud.packPurchases || {},
            purchasedChallenges: cloud.purchasedChallenges || [],
            unlockedDifficulties: cloud.unlockedDifficulties || ['low_cr'],
            activeChallenge: cloud.activeChallenge || null,
            
            totalCollects: cloud.totalCollects || 0,
            totalEarnings: cloud.totalEarnings || 0,
            packsOpened: cloud.packsOpened || 0,
            carsSold: cloud.carsSold || 0,
            moneyFromSales: cloud.moneyFromSales || 0,
            racesWon: cloud.racesWon || 0,
            racesLost: cloud.racesLost || 0,
            
            hasClaimedStarter: cloud.hasClaimedStarter || false,
            lastCollect: cloud.lastCollect || 0,
        };
    }, []);
    
    /**
     * Save to cloud
     */
    const saveToCloud = useCallback(async (force = false) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Not logged in' };
        }
        
        if (!navigator.onLine) {
            pendingSaveRef.current = true;
            setCloudStatus(prev => ({ 
                ...prev, 
                pendingSave: true, 
                error: 'Offline - will save when reconnected' 
            }));
            return { success: false, error: 'Offline', queued: true };
        }
        
        // Check if state has changed
        const currentHash = getStateHash(gameState);
        if (!force && currentHash === lastSaveHashRef.current) {
            return { success: true, message: 'No changes to save' };
        }
        
        const cloudData = toCloudFormat(gameState);
        if (!cloudData) {
            return { success: false, error: 'Failed to create save data' };
        }
        
        setCloudStatus(prev => ({ ...prev, saving: true, error: null }));
        
        try {
            const response = await fetch(`${API_BASE_URL}/clicker-save.php`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    save_data: cloudData,
                    stats: {
                        money: cloudData.money,
                        tokens: cloudData.tokens,
                        tuneTokens: cloudData.tuneTokens,
                        uniqueCars: Object.keys(cloudData.collection).length,
                        totalCars: Object.values(cloudData.collection).reduce((a, b) => a + b, 0),
                        packsOpened: cloudData.packsOpened,
                        racesWon: cloudData.racesWon,
                    }
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                lastSaveHashRef.current = currentHash;
                pendingSaveRef.current = false;
                setCloudStatus(prev => ({
                    ...prev,
                    saving: false,
                    lastSaved: new Date(),
                    hasCloudSave: true,
                    pendingSave: false,
                    error: null,
                }));
                console.log('[CloudSave] Saved successfully');
                return { success: true, saved_at: data.saved_at };
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } catch (err) {
            console.error('[CloudSave] Save error:', err);
            pendingSaveRef.current = true;
            setCloudStatus(prev => ({
                ...prev,
                saving: false,
                error: err.message || 'Save failed',
                pendingSave: true,
            }));
            return { success: false, error: err.message, queued: true };
        }
    }, [isAuthenticated, gameState, toCloudFormat, getStateHash]);
    
    /**
     * Load from cloud
     */
    const loadFromCloud = useCallback(async () => {
        if (!isAuthenticated) {
            return { success: false, error: 'Not logged in' };
        }
        
        if (!navigator.onLine) {
            return { success: false, error: 'Offline' };
        }
        
        setCloudStatus(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const response = await fetch(`${API_BASE_URL}/clicker-load.php`, {
                method: 'GET',
                credentials: 'include',
            });
            
            const data = await response.json();
            
            if (data.success && data.has_save && data.save_data) {
                const gameData = fromCloudFormat(data.save_data);
                
                if (gameData && loadCloudSave) {
                    loadCloudSave(gameData);
                    lastSaveHashRef.current = getStateHash(gameData);
                    
                    setCloudStatus(prev => ({
                        ...prev,
                        loading: false,
                        hasCloudSave: true,
                        lastLoaded: new Date(),
                    }));
                    
                    console.log('[CloudSave] Loaded successfully');
                    return { 
                        success: true, 
                        saved_at: data.saved_at,
                        stats: data.stats,
                    };
                } else {
                    throw new Error('Failed to parse save data');
                }
            }
            
            if (data.success && !data.has_save) {
                setCloudStatus(prev => ({
                    ...prev,
                    loading: false,
                    hasCloudSave: false,
                }));
                return { success: true, has_save: false };
            }
            
            throw new Error(data.error || 'Load failed');
        } catch (err) {
            console.error('[CloudSave] Load error:', err);
            setCloudStatus(prev => ({
                ...prev,
                loading: false,
                error: err.message || 'Network error',
            }));
            return { success: false, error: err.message || 'Network error' };
        }
    }, [isAuthenticated, loadCloudSave, fromCloudFormat, getStateHash]);
    
    /**
     * Check for cloud save and optionally auto-load
     */
    const checkCloudSave = useCallback(async (autoLoad = false) => {
        if (!isAuthenticated || !navigator.onLine) return null;
        
        try {
            const response = await fetch(`${API_BASE_URL}/clicker-load.php`, {
                method: 'GET',
                credentials: 'include',
            });
            
            const data = await response.json();
            const hasSave = data.success && data.has_save;
            
            setCloudStatus(prev => ({ ...prev, hasCloudSave: hasSave }));
            
            if (autoLoad && hasSave && data.save_data && !hasAutoLoadedRef.current) {
                hasAutoLoadedRef.current = true;
                
                const gameData = fromCloudFormat(data.save_data);
                if (gameData && loadCloudSave) {
                    loadCloudSave(gameData);
                    lastSaveHashRef.current = getStateHash(gameData);
                    
                    setCloudStatus(prev => ({
                        ...prev,
                        lastLoaded: new Date(),
                    }));
                    
                    console.log('[CloudSave] Auto-loaded on startup');
                    return { loaded: true, stats: data.stats };
                }
            }
            
            return { exists: hasSave, stats: data.stats };
        } catch (err) {
            console.error('[CloudSave] Check error:', err);
            return null;
        }
    }, [isAuthenticated, loadCloudSave, fromCloudFormat, getStateHash]);
    
    // Online/offline handlers
    useEffect(() => {
        const handleOnline = () => {
            console.log('[CloudSave] Back online');
            setCloudStatus(prev => ({ ...prev, isOnline: true }));
            
            if (pendingSaveRef.current && isAuthenticated) {
                setTimeout(() => {
                    if (saveToCloudRef.current) saveToCloudRef.current(true);
                }, 1000);
            }
        };
        
        const handleOffline = () => {
            console.log('[CloudSave] Gone offline');
            setCloudStatus(prev => ({ ...prev, isOnline: false }));
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isAuthenticated]);
    
    // Keep ref in sync with latest saveToCloud
    useEffect(() => {
        saveToCloudRef.current = saveToCloud;
    }, [saveToCloud]);
    
    // Auto-save interval and startup check
    useEffect(() => {
        if (isAuthenticated) {
            if (!hasAutoLoadedRef.current) {
                checkCloudSave(true);
            }
            
            autoSaveIntervalRef.current = setInterval(() => {
                if (saveToCloudRef.current) {
                    saveToCloudRef.current(false);
                }
            }, AUTO_SAVE_INTERVAL);
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [isAuthenticated, checkCloudSave]);
    
    // Save on page close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isAuthenticated && navigator.onLine && gameState) {
                const cloudData = toCloudFormat(gameState);
                if (cloudData) {
                    const blob = new Blob([JSON.stringify({
                        save_data: cloudData,
                        stats: {
                            money: cloudData.money,
                            tokens: cloudData.tokens,
                            tuneTokens: cloudData.tuneTokens,
                            uniqueCars: Object.keys(cloudData.collection).length,
                            totalCars: Object.values(cloudData.collection).reduce((a, b) => a + b, 0),
                            packsOpened: cloudData.packsOpened,
                            racesWon: cloudData.racesWon,
                        }
                    })], { type: 'application/json' });
                    
                    navigator.sendBeacon(`${API_BASE_URL}/clicker-save.php`, blob);
                }
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isAuthenticated, gameState, toCloudFormat]);
    
    return {
        cloudStatus,
        saveToCloud,
        loadFromCloud,
        checkCloudSave,
    };
};

export default useCloudSave;
