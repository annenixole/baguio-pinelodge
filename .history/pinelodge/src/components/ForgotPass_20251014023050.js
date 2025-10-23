import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { Link } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, Stack, Alert
} from '@mui/material';
import logo from '../elements/BaguioPinelodgelogo.png';
import logoCursor from '../elements/logoCursor.png';

export default function ForgotPass() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMsg('Password reset email sent. Please check your inbox.');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setMsg(' No account found with this email.');
            } else if (error.code === 'auth/invalid-email') {
                setMsg('Invalid email format.');
            } else {
                setMsg(`${error.message}`);
            }
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: 'auto',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 3, sm: 6 },
                
            }}
        >

            {/* Form Card */}
            <Paper
                elevation={2}
                sx={{
                    borderRadius: 4,
                    p: { xs: 3, sm: 4 },
                    width: '100%',
                    maxWidth: { xs: 340, sm: 420, md: 420 },
                    textAlign: 'center',
                    height:"74%",
                }}
            >

                {/* Logo */}
                <Box display="flex" alignItems="center" justifyContent='center' gap={1} sx={{ mb: 8 }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <img
                            src={logo}
                            alt="Baguio PineLodge Logo"
                            style={{ width: 48, height: 48, cursor: `url(${logoCursor}) 0 0, pointer` }}
                        />
                    </Link>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'lighter',
                                fontSize: 26,
                                mb: -1,
                                color: '#30410D',
                                fontFamily: "'Kingred Serif', serif",
                            }}
                        >
                            BAGUIO
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                letterSpacing: 3,
                                fontSize: 12,
                                color: '#30410D',
                                fontFamily: "'Questrial', sans-serif",
                            }}
                        >
                            PINELODGE
                        </Typography>
                    </Box>
                </Box>

                {/* Title and subtitle */}
                <Typography
                    variant="h4"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ mt: 2, fontSize: { xs: "20px", sm: "24px" } }}
                >
                    Forgot Password
                </Typography>
                <Typography
                    variant="body1"
                    textAlign="center"
                    mb={4}
                    sx={{ mt: 1, fontSize: { xs: "13px", sm: "14px" } }}
                >
                    Enter your email to reset your password
                </Typography>

                <form onSubmit={handleReset}>
                    <Stack spacing={2}>
                        <TextField
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    height: '38px',
                                    mb: 1,
                                },
                            }}
                        />

                        {msg && (
                            <Alert
                                severity={msg.startsWith('') ? 'success' : 'error'}
                                sx={{ fontSize: '13px' }}
                            >
                                {msg}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                py: 1.1,
                                backgroundColor: '#1C1C1C',
                                color: '#DE7001',
                                fontWeight: 550,
                                borderRadius: '12px',
                                height: "38px",
                                '&:hover': { backgroundColor: '#DE7001', color: '#1C1C1C' },
                            }}
                        >
                            Send Reset Link
                        </Button>

                        <Typography textAlign="center" variant="body2" sx={{ mt: 3 }}>
                            Remember your password?{" "}
                            <Link to="/SignIn" style={{ color: '#70873F', textDecoration: 'none', fontWeight: 600, }}>
                                Sign In
                            </Link>
                        </Typography>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
