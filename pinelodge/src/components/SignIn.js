import baguioHouses from '../elements/BaguioHouses.mp4';
import logoCursor from '../elements/logoCursor.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../elements/BaguioPinelodgelogo.png';
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const savedRole = localStorage.getItem("selectedRole");
        if (savedRole) setRole(savedRole);
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSignin = async (e) => {
        e.preventDefault();
        setMsg("");

        // Check if admin credentials
        const ADMIN_EMAIL = "pinelodgeadmin2025@gmail.com";
        const ADMIN_PASSWORD = "Pinelodgeadmin2025";

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Admin login - no Firebase authentication needed
            localStorage.setItem("userRole", "admin");
            localStorage.setItem("isAdmin", "true");
            alert("Admin signed in successfully!");
            setTimeout(() => {
                navigate("/adminPage");
            }, 1000);
            return;
        }

        // Regular user authentication
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Try to get user document - check both UID and email as document IDs
            let userDoc = await getDoc(doc(db, "users", user.uid));
            
            // If not found by UID, try by email
            if (!userDoc.exists()) {
                userDoc = await getDoc(doc(db, "users", user.email));
            }

            if (!userDoc.exists()) {
                setMsg("No user record found.");
                await signOut(auth);
                return;
            }

            const userData = userDoc.data();

            // Check Firestore emailVerified field instead of Firebase Auth
            if (!userData.emailVerified) {
                await signOut(auth);
                setMsg("Please verify your email before signing in.");
                setVerificationStatus("Not Verified");
                return;
            }

            setVerificationStatus("Verified");
            localStorage.setItem("userRole", userData.role);
            alert("Signed in successfully!");

            setTimeout(() => {
                // Check if there's a return path from shared link
                if (location.state?.returnTo && location.state?.listing) {
                    navigate(location.state.returnTo, { state: { listing: location.state.listing } });
                } else if (userData.role === "host") {
                    if (userData.isNewUser === true)
                        navigate("/hostPage/GetStarted"); // new host
                    else
                        navigate("/hostPage/HomeHost"); // existing host
                } else if (userData.role === "customer") {
                    navigate("/guestPage/GuestPage");

                } else {
                    navigate("/");
                }
            }, 1500);
        } catch (error) {
            if (error.code === "auth/user-not-found") setMsg("User not found.");
            else if (error.code === "auth/wrong-password") setMsg("Incorrect password");
            else if (error.code === "auth/invalid-credential") setMsg("Incorrect password");
            else if (error.code === "auth/invalid-email" || error.code === "auth/missing-password") setMsg("input all fields");
            else setMsg(error.message);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', md: 'row' },
                height: '100vh',
                width: '100%',
                backgroundColor: '#fffdf3ff',
            }}
        >
            {/*Sign In Form */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 3, sm: 6 },
                    py: { xs: 4, sm: 0 },
                }}
            >
                {/* Logo */}
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
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

                <Typography
                    variant="h4"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ mt: 2, fontSize: { xs: "20px", sm: "24px" } }}
                >
                    Welcome Back
                </Typography>
                <Typography
                    variant="body1"
                    textAlign="center"
                    mb={4}
                    sx={{ mt: 1, fontSize: { xs: "13px", sm: "14px" } }}
                >
                    {role === "host"
                        ? "Begin hosting and earn today"
                        : "Start booking your perfect stay today"}
                </Typography>

                <Paper
                    elevation={1}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, sm: 4 },
                        width: '100%',
                        maxWidth: { xs: 340, sm: 420, md: 480 },
                        backgroundColor: '#fffdf3ff',
                    }}
                >
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: "18px" }}>
                        Sign In {role === "host" ? "as a Host" : ""}
                    </Typography>
                    <Typography variant="body2" mb={3} mt={-1}>
                        Enter your credentials to access your account
                    </Typography>

                    <form onSubmit={handleSignin}>
                        <Stack spacing={2}>
                            <TextField
                                label="Email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '38px' } }}
                            />

                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '38px' } }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClickShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Typography textAlign="right" sx={{ fontSize: "13px" }}>
                                <Link to="/ForgotPass" style={{ color: '#70873F', textDecoration: 'none', fontWeight: 500 }}>
                                    Forgot Password?
                                </Link>
                            </Typography>

                            {msg && (
                                <Alert severity={msg.startsWith('✅') ? "success" : "error"} sx={{ fontSize: '13px' }}>
                                    {msg}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    py: 1.1,
                                    backgroundColor: '#30410D',
                                    color: '#ffffffff',
                                    fontWeight: 550,
                                    borderRadius: '12px',
                                    height: "38px",
                                    '&:hover': { backgroundColor: '#70873F', color: '#ffffffff' },
                                }}
                            >
                                Sign In
                            </Button>

                            <Typography textAlign="center" variant="body2" sx={{ mt: 1 }}>
                                Don't have an account?{" "}
                                <Link to="/SignUp" style={{ color: '#70873F', textDecoration: 'none', fontWeight: 600 }}>
                                    Sign Up
                                </Link>
                            </Typography>
                        </Stack>
                    </form>
                </Paper>
            </Box>

            {/*Image Section (hidden on mobile) */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'relative',
                    flex: 1,
                    borderRadius: '32px',
                    overflow: 'hidden',
                    backgroundColor: '#1C1C1C',
                    height: { md: "95%" },
                    mt: { md: 2 },
                    mr: { md: 2 },
                }}
            >
                <Box
                    component="video"
                    src={baguioHouses}
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.7) sepia(0.2)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(2, 38, 6, 0.311)',
                        zIndex: 1,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 40,
                        left: 40,
                        color: '#fff',
                        zIndex: 2,
                    }}
                >
                    <Typography variant="h3" fontWeight={700} sx={{ fontSize: '48px', mb: 2 }}>
                        {role === "host"
                            ? <>Host your space<br />Earn easily</>
                            : <>Discover Your Perfect<br />Mountain Escape</>}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 300, mt: -1 }}>
                        {role === "host"
                            ? <>Join thousands of Baguio hosts earning extra income<br />by sharing their spaces</>
                            : <>Experience the charm and tranquility of Baguio City's<br />finest accommodations</>}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
