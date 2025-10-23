import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button } from "@mui/material";
import logo from "../elements/BaguioPinelodgelogo.png";
import logoCursor from "../elements/logoCursor.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage("Your email has been successfully verified!");
          setSuccess(true);
        })
        .catch(() => {
          setMessage("Verification link is invalid or has expired.");
          setSuccess(false);
        });
    } else {
      setMessage("No verification code found.");
      setSuccess(false);
    }
  }, [searchParams, auth]);

  const handleContinue = () => {
    navigate("/SignIn");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}
    >
      {/* Main Card */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: { xs: 340, sm: 420, md: 420 },
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          sx={{ mb: 4 }}
        >
          <img
            src={logo}
            alt="Baguio PineLodge Logo"
            style={{
              width: 48,
              height: 48,
              cursor: `url(${logoCursor}) 0 0, pointer`,
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "lighter",
                fontSize: 26,
                mb: -1,
                color: "#30410D",
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
                color: "#30410D",
                fontFamily: "'Questrial', sans-serif",
              }}
            >
              PINELODGE
            </Typography>
          </Box>
        </Box>

        {/* Title and Message */}
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          sx={{ fontSize: { xs: "20px", sm: "22px" }, mb: 2 }}
        >
          Email Verification
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          sx={{
            mb: 4,
            fontSize: { xs: "13px", sm: "14px" },
            color: success ? "#30410D" : "#B00020",
          }}
        >
          {message}
        </Typography>

        {success && (
          <Button
            variant="contained"
            onClick={handleContinue}
            fullWidth
            sx={{
              py: 1.1,
              backgroundColor: "#1C1C1C",
              color: "#DE7001",
              fontWeight: 550,
              borderRadius: "12px",
              height: "38px",
              "&:hover": {
                backgroundColor: "#DE7001",
                color: "#1C1C1C",
              },
            }}
          >
            Continue to Sign In
          </Button>
        )}
      </Paper>
    </Box>
  );
}
