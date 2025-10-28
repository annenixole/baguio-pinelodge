import baguioVillage from '../elements/BaguioVillage.mp4'
import logoCursor from '../elements/logoCursor.png';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../elements/BaguioPinelodgelogo.png';
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Paper, Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import TermsOfService from "./TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy";
import emailjs from '@emailjs/browser';
import { emailConfig } from './emailConfig';

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confpassword, setConfPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openTOS, setOpenTOS] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    if (savedRole) setRole(savedRole);
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  //Password strength validator
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  //Sign up
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!firstname || !lastname || !email || !password || !confpassword) {
      setMsg("Please fill in all fields.");
      return;
    }

    if (!validatePassword(password)) {
      setMsg("Password must be at least 8 characters long and include at least one uppercase letter and one number.");
      return;
    }

    if (password !== confpassword) {
      setMsg("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstname} ${lastname}`,
      });
      await sendEmailVerification(userCredential.user);

      // Save to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        firstName: firstname,
        lastName: lastname,
        role,
        isNewUser: true,
        verificationStatus: "Pending",
        createdAt: serverTimestamp(),
      });

      alert('Account created successfully. Please verify your email.');
      setTimeout(() => navigate('/SignIn'), 3000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMsg("Email already in use");
      } else {
        setMsg(error.message);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100vh',
        width: '100%',
        mb: 8,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Left Side - Image and Overlay Text (hidden on small screens) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          flex: 1,
          borderRadius: '32px',
          overflow: 'hidden',
          backgroundColor: '#1C1C1C',
          height: { md: "100%" },
          mt: { md: 2 },
          ml: { md: 2 },
        }}
      >
        <Box
          component="video"
          src={baguioVillage}
          autoPlay
          loop
          muted
          playsInline
          alt="Baguio"
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

      {/* Right Side - Sign Up Form */}
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
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 6 }}>
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
          Create an Account
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

        {/* Sign Up Form */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: 340, sm: 420, md: 480 },
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: "18px" }}>
            Sign up {role === "host" ? "as a Host" : ""}
          </Typography>
          <Typography variant="body2" mb={3} mt={-1}>
            Enter your information to create an account
          </Typography>

          <form onSubmit={handleSignup}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="First name"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '38px' } }}
                />
                <TextField
                  label="Last name"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '38px' } }}
                />
              </Stack>

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
                label="Create Password"
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

              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                size="small"
                value={confpassword}
                onChange={(e) => setConfPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '38px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box 
                sx={{ 
                  mt: 1.5,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: agree ? '#70873F' : '#e0e0e0',
                  backgroundColor: agree ? 'rgba(112, 135, 63, 0.05)' : '#fafafa',
                  transition: 'all 0.3s ease',
                }}
              >
                <Box display="flex" alignItems="flex-start">
                  <Checkbox
                    color="primary"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    sx={{ 
                      mt: -1,
                      '& .MuiSvgIcon-root': { fontSize: 22 },
                      color: '#70873F',
                      '&.Mui-checked': { color: '#70873F' }
                    }} 
                  />
                  <Typography
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '13px', sm: '14px' }, 
                      lineHeight: 1.7,
                      color: '#333'
                    }}
                  >
                    I agree to the{' '}
                    <Box
                      component="span"
                      onClick={() => setOpenTOS(true)}
                      sx={{
                        color: "#70873F",
                        cursor: "pointer",
                        fontWeight: 600,
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          textDecorationColor: '#70873F',
                          color: '#30410D'
                        }
                      }}
                    >
                      Terms of Service
                    </Box>
                    {' '}and{' '}
                    <Box
                      component="span"
                      onClick={() => setOpenPrivacy(true)}
                      sx={{
                        color: "#70873F",
                        cursor: "pointer",
                        fontWeight: 600,
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          textDecorationColor: '#70873F',
                          color: '#30410D'
                        }
                      }}
                    >
                      Privacy Policy
                    </Box>
                  </Typography>
                </Box>
              </Box>



              {msg && (
                <Alert severity={msg.startsWith('') ? "success" : "error"} sx={{ fontSize: '13px' }}>
                  {msg}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={!agree}
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
                Create Account
              </Button>

              <Typography textAlign="center" variant="body2" sx={{ mt: 1 }}>
                Already have an account?{" "}
                <Link to="/SignIn" style={{ color: '#70873F', textDecoration: 'none', fontWeight: 600 }}>
                  Sign In
                </Link>
              </Typography>
            </Stack>
          </form>
          <TermsOfService open={openTOS} handleClose={() => setOpenTOS(false)} />
          <PrivacyPolicy open={openPrivacy} handleClose={() => setOpenPrivacy(false)} />
        </Paper>
      </Box>
    </Box>
  );
}
