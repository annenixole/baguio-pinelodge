import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"; // 💌 Mail icon
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
      const oobCode = searchParams.get("oobCode");

      if (!oobCode) {
        setMessage("No verification code found.");
        setSuccess(false);
        setOpen(true);
        setLoading(false);
        return;
      }

      try {
        // ✅ Check if the action code is still valid
        await checkActionCode(auth, oobCode);

        // ✅ Apply the verification
        await applyActionCode(auth, oobCode);

        setMessage("Your email has been successfully verified!");
        setSuccess(true);
      } catch (error) {
        console.error("Verification error:", error);

        // ✅ Handle known Firebase error codes gracefully
        if (error.code === "auth/invalid-action-code" || error.code === "auth/expired-action-code") {
          setMessage("Verification link is invalid or has expired.");
          setSuccess(false);
        } else if (error.code === "auth/user-disabled") {
          setMessage("This account has been disabled.");
          setSuccess(false);
        } else {
          // ✅ Usually means the user is already verified
          const user = auth.currentUser;
          if (user && user.emailVerified) {
            setMessage("Your email is already verified!");
            setSuccess(true);
          } else {
            setMessage("An unexpected error occurred during verification.");
            setSuccess(false);
          }
        }
      } finally {
        setLoading(false);
        setOpen(true);
      }
    };

    verifyEmail();
  }, [searchParams, auth]);

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

            {/* 💌 Email Icon */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2, mb: 2 }}
            >
              <EmailOutlinedIcon
                sx={{
                  fontSize: 52,
                  color: success ? "#30410D" : "#B00020",
                }}
              />
            </Box>

            {/* Main Message */}
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mt: 1,
                mb: 1,
                fontSize: "18px",
                color: success ? "#30410D" : "#B00020",
              }}
            >
              {success
                ? "Email Verified Successfully!"
                : "Verification Failed"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#333",
                mb: 3,
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
