import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    CloudUpload,
    CloudDownload,
    Cloud,
    CloudOff,
    ContentCopy,
    ContentPaste,
    DeleteForever,
    CheckCircle,
    Warning,
} from '@mui/icons-material';

/**
 * SaveDialog - Handles both local (code) and cloud saves
 */
const SaveDialog = ({ 
    open, 
    onClose, 
    onExport, 
    onImport, 
    onReset,
    // Cloud save props
    isAuthenticated = false,
    cloudStatus = {},
    onCloudSave,
    onCloudLoad,
}) => {
    const [importCode, setImportCode] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [cloudLoading, setCloudLoading] = useState(false);
    
    // Clear state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setImportCode('');
            setMessage({ type: '', text: '' });
            setShowConfirmReset(false);
        }
    }, [open]);
    
    // Handle local export
    const handleExport = () => {
        onExport();
        setMessage({ type: 'success', text: 'Save code copied to clipboard!' });
    };
    
    // Handle local import
    const handleImport = () => {
        if (!importCode.trim()) {
            setMessage({ type: 'error', text: 'Please paste a save code' });
            return;
        }
        
        const success = onImport(importCode.trim());
        if (success) {
            setMessage({ type: 'success', text: 'Game loaded successfully!' });
            setImportCode('');
        } else {
            setMessage({ type: 'error', text: 'Invalid save code' });
        }
    };
    
    // Handle cloud save
    const handleCloudSave = async () => {
        if (!onCloudSave) return;
        
        setCloudLoading(true);
        setMessage({ type: '', text: '' });
        
        const result = await onCloudSave(true); // Force save
        
        setCloudLoading(false);
        
        if (result.success) {
            setMessage({ type: 'success', text: 'Saved to cloud!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Cloud save failed' });
        }
    };
    
    // Handle cloud load
    const handleCloudLoad = async () => {
        if (!onCloudLoad) return;
        
        setCloudLoading(true);
        setMessage({ type: '', text: '' });
        
        const result = await onCloudLoad();
        
        setCloudLoading(false);
        
        if (result.success) {
            if (result.has_save === false) {
                setMessage({ type: 'info', text: 'No cloud save found' });
            } else {
                setMessage({ type: 'success', text: 'Loaded from cloud!' });
            }
        } else {
            setMessage({ type: 'error', text: result.error || 'Cloud load failed' });
        }
    };
    
    // Handle reset
    const handleReset = () => {
        if (!showConfirmReset) {
            setShowConfirmReset(true);
            return;
        }
        
        onReset();
        setShowConfirmReset(false);
        onClose();
    };
    
    // Format last saved time
    const formatLastSaved = (date) => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleString();
    };
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#1a1a1a',
                    color: 'white',
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💾 Save / Load Game
                {isAuthenticated && (
                    <Chip 
                        icon={<Cloud sx={{ fontSize: 16 }} />} 
                        label="Cloud Enabled" 
                        size="small"
                        sx={{ 
                            bgcolor: '#4caf50', 
                            color: 'white',
                            ml: 'auto',
                        }} 
                    />
                )}
            </DialogTitle>
            
            <DialogContent>
                {message.text && (
                    <Alert 
                        severity={message.type} 
                        sx={{ mb: 2 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}
                
                {/* Cloud Save Section */}
                {isAuthenticated ? (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Cloud /> Cloud Save
                        </Typography>
                        
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(255,255,255,0.05)', 
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            {/* Cloud status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {!cloudStatus.isOnline ? (
                                    <>
                                        <CloudOff sx={{ color: '#f44336', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ color: '#f44336' }}>
                                            Offline {cloudStatus.pendingSave && '- changes will save when reconnected'}
                                        </Typography>
                                    </>
                                ) : cloudStatus.hasCloudSave ? (
                                    <>
                                        <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                            Last saved: {formatLastSaved(cloudStatus.lastSaved)}
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Warning sx={{ color: '#ff9800', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                            No cloud save found
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            
                            {/* Cloud buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    startIcon={cloudLoading && cloudStatus.saving ? <CircularProgress size={16} /> : <CloudUpload />}
                                    onClick={handleCloudSave}
                                    disabled={cloudLoading}
                                    sx={{ 
                                        flex: 1,
                                        bgcolor: '#2196f3',
                                        '&:hover': { bgcolor: '#1976d2' },
                                    }}
                                >
                                    Save to Cloud
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={cloudLoading && cloudStatus.loading ? <CircularProgress size={16} /> : <CloudDownload />}
                                    onClick={handleCloudLoad}
                                    disabled={cloudLoading || !cloudStatus.hasCloudSave}
                                    sx={{ 
                                        flex: 1,
                                        borderColor: '#2196f3',
                                        color: '#2196f3',
                                    }}
                                >
                                    Load from Cloud
                                </Button>
                            </Box>
                            
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1 }}>
                                Auto-saves every 60 seconds • Saves on page close • Queues while offline
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CloudOff sx={{ color: 'rgba(255,255,255,0.5)' }} />
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Cloud Save Available
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                            Log in to enable automatic cloud saves and sync your progress across devices.
                        </Typography>
                        <Button 
                            href="/login" 
                            variant="outlined" 
                            size="small"
                            sx={{ borderColor: '#b8860b', color: '#b8860b' }}
                        >
                            Log In
                        </Button>
                    </Box>
                )}
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                
                {/* Local Save Section */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Manual Save Code
                </Typography>
                
                {/* Export */}
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={handleExport}
                        fullWidth
                        sx={{ 
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': { borderColor: '#b8860b' },
                        }}
                    >
                        Copy Save Code
                    </Button>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                        Copies your save to clipboard for backup
                    </Typography>
                </Box>
                
                {/* Import */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Paste save code here..."
                        value={importCode}
                        onChange={(e) => setImportCode(e.target.value)}
                        sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#b8860b' },
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<ContentPaste />}
                        onClick={handleImport}
                        fullWidth
                        disabled={!importCode.trim()}
                        sx={{ 
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#388e3c' },
                        }}
                    >
                        Load Save Code
                    </Button>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                
                {/* Reset */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#f44336' }}>
                        ⚠️ Danger Zone
                    </Typography>
                    
                    {showConfirmReset ? (
                        <Box sx={{ p: 2, bgcolor: 'rgba(244,67,54,0.1)', borderRadius: 2, border: '1px solid #f44336' }}>
                            <Typography sx={{ mb: 2, color: '#f44336' }}>
                                Are you sure? This will delete ALL progress and cannot be undone!
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleReset}
                                >
                                    Yes, Delete Everything
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowConfirmReset(false)}
                                    sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteForever />}
                            onClick={handleReset}
                        >
                            Reset Game
                        </Button>
                    )}
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ color: 'white' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaveDialog;
