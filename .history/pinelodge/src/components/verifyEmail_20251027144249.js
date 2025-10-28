import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import logo from "../elements/BaguioPinelodgelogo.png";
import logoCursor from "../elements/logoCursor.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("No verification token found.");
        setSuccess(false);
        setOpen(true);
        setLoading(false);
        return;
      }

      try {
        // Decode the token to get user ID
        const decodedToken = atob(token);
        const userId = decodedToken.split('-')[0];

        // Get user document from Firestore
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setMessage("User not found.");
          setSuccess(false);
          setLoading(false);
          setOpen(true);
          return;
        }

        const userData = userDoc.data();

        // Check if already verified
        if (userData.emailVerified) {
          setMessage("Your email is already verified!");
          setSuccess(true);
          setLoading(false);
          setOpen(true);
          return;
        }

        // Verify the token matches
        if (userData.verificationToken !== token) {
          setMessage("Invalid verification token.");
          setSuccess(false);
          setLoading(false);
          setOpen(true);
          return;
        }

        // Update user as verified
        await updateDoc(userDocRef, {
          emailVerified: true,
          verificationStatus: "Verified",
          verifiedAt: new Date(),
        });

        setMessage("Your email has been successfully verified!");
        setSuccess(true);
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("An error occurred during verification. Please try again.");
        setSuccess(false);
      } finally {
        setLoading(false);
        setOpen(true);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    setOpen(false);
    navigate("/SignIn");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress sx={{ color: "#30410D" }} />
          <Typography variant="body2" sx={{ color: "#30410D" }}>
            Verifying your email...
          </Typography>
        </Box>
      ) : (
        <Dialog
          open={open}
          onClose={handleContinue}
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              width: "100%",
              maxWidth: { xs: 340, sm: 400 },
              boxShadow: "0px 0px 20px rgba(0,0,0,0.2)",
            },
          }}
        >
          <DialogContent>
            {/* Logo + App Name */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
              sx={{ mb: 1 }}
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

            {/* Main Message */}
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mt: 5,
                mb: 1,
                fontSize: "18px",
                color: "#1C1C1C",
              }}
            >
              {success
                ? "Email Verified Successfully!"
                : "Email Verification Failed"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#333",
                mb: 5,
                maxWidth: "90%",
                mx: "auto",
              }}
            >
              {message}
            </Typography>

            <Button
              variant="contained"
              onClick={handleContinue}
              fullWidth
              sx={{
                py: 1,
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
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
