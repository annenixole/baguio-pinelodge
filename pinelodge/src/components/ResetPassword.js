import React, { useState, useEffect } from 'react';
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';
import logo from '../elements/BaguioPinelodgelogo.png';
import logoCursor from '../elements/logoCursor.png';

export default function ResetPassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(''); // Add userId state
    const [isValidToken, setIsValidToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyResetToken = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setMsg('❌ Invalid reset link. Please request a new password reset.');
                setLoading(false);
                return;
            }

            try {
                // Decode token to get user ID
                const decodedToken = atob(token);
                const userId = decodedToken.split('-')[0];
                
                // Get user document from Firestore using UID
                const userDocRef = doc(db, "users", userId);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    setMsg('❌ User not found.');
                    setLoading(false);
                    return;
                }

                const userData = userDoc.data();

                // Verify token matches
                if (userData.resetToken !== token) {
                    setMsg('❌ Invalid reset token.');
                    setLoading(false);
                    return;
                }

                // Check if token has expired
                const expiryDate = userData.resetTokenExpiry?.toDate();
                if (!expiryDate || expiryDate < new Date()) {
                    setMsg('❌ Reset link has expired. Please request a new one.');
                    setLoading(false);
                    return;
                }

                // Token is valid
                setEmail(userData.email); // Get email from user data
                setUserId(userId); // Store userId for later use
                setIsValidToken(true);
                setLoading(false);

            } catch (error) {
                console.error('Token verification error:', error);
                setMsg('❌ Invalid reset link.');
                setLoading(false);
            }
        };

        verifyResetToken();
    }, [location]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Validation
        if (newPassword !== confirmPassword) {
            setMsg('❌ Passwords do not match.');
            return;
        }
        
        if (newPassword.length < 6) {
            setMsg('❌ Password must be at least 6 characters.');
            return;
        }

        if (!email || !isValidToken) {
            setMsg('❌ Invalid or expired reset link.');
            return;
        }

        try {
            // Sign in with old password first to authenticate
            const userCredential = await signInWithEmailAndPassword(auth, email, oldPassword);
            
            // Now update to new password
            await updatePassword(userCredential.user, newPassword);
            
            // Clear the reset token from Firestore using userId
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                resetToken: null,
                resetTokenExpiry: null,
            });

            setMsg('✅ Password reset successful! Redirecting to sign in...');
            
            // Sign out and redirect to sign in
            await auth.signOut();
            setTimeout(() => {
                navigate('/SignIn');
            }, 2000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/wrong-password') {
                setMsg('❌ Current password is incorrect.');
            } else if (error.code === 'auth/too-many-requests') {
                setMsg('❌ Too many attempts. Please try again later.');
            } else {
                setMsg(`❌ Error: ${error.message}`);
            }
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #30410d 0%, #5a7a1f 100%)',
                cursor: `url(${logoCursor}), auto`,
                padding: 2
            }}
        >
            {loading ? (
                <Typography sx={{ color: '#ffffff' }}>Verifying reset link...</Typography>
            ) : !isValidToken ? (
                <Paper
                    elevation={10}
                    sx={{
                        maxWidth: 450,
                        width: '100%',
                        padding: 4,
                        borderRadius: 3,
                        background: '#ffffff',
                        textAlign: 'center'
                    }}
                >
                    <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>
                    <Button
                        component={Link}
                        to="/ForgotPass"
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: '#30410d',
                            color: '#ffffff',
                            '&:hover': { backgroundColor: '#5a7a1f' }
                        }}
                    >
                        Request New Reset Link
                    </Button>
                </Paper>
            ) : (
                <Paper
                    elevation={10}
                    sx={{
                        maxWidth: 450,
                        width: '100%',
                        padding: 4,
                        borderRadius: 3,
                        background: '#ffffff'
                    }}
                >
                    <Stack spacing={3}>
                        {/* Logo */}
                        <Box sx={{ textAlign: 'center' }}>
                            <img
                                src={logo}
                                alt="Baguio PineLodge"
                                style={{
                                    width: '120px',
                                    height: 'auto',
                                    marginBottom: '16px'
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#30410d',
                                    fontFamily: '"Questrial", sans-serif'
                                }}
                            >
                                Reset Password
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: '#666', marginTop: 1 }}
                            >
                                Enter your new password for: {email}
                            </Typography>
                        </Box>

                        {/* Success/Error Message */}
                        {msg && (
                            <Alert
                                severity={msg.includes('✅') ? 'success' : 'error'}
                                sx={{ borderRadius: 2 }}
                            >
                                {msg}
                            </Alert>
                        )}

                        {/* Reset Password Form */}
                        <form onSubmit={handleResetPassword}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Current Password"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#30410d'
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#30410d'
                                        }
                                    }}
                                />
                                
                                <TextField
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#30410d'
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#30410d'
                                        }
                                    }}
                                />

                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#30410d'
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#30410d'
                                        }
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#30410d',
                                        color: '#ffffff',
                                        padding: '12px',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: '#5a7a1f'
                                        }
                                    }}
                                >
                                    Reset Password
                                </Button>
                            </Stack>
                        </form>

                        {/* Back to Sign In */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Remember your password?{' '}
                                <Link
                                    to="/SignIn"
                                    style={{
                                        color: '#30410d',
                                        textDecoration: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}
