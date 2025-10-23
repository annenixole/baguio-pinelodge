import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get("oobCode");

      if (!oobCode) {
        setMessage("No verification code found.");
        setSuccess(false);
        setLoading(false);
        setOpen(true);
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        setMessage("Your email has been successfully verified!");
        setSuccess(true);
      } catch (error) {
        console.error("Verification failed:", error);
        setMessage("Verification link is invalid or has expired.");
        setSuccess(false);
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
        height: "100vh",
        width: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Loading Spinner */}
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress sx={{ color: "#30410D" }} />
          <Typography variant="body2" sx={{ color: "#30410D" }}>
            Verifying your email...
          </Typography>
        </Box>
      )}

      {/* Success / Error Modal */}
      <Dialog
        open={open && !loading}
        onClose={handleContinue}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            width: "100%",
            maxWidth: { xs: 340, sm: 400 },
          },
        }}
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <img
              src={logo}
              alt="Baguio PineLodge"
              width="50"
              style={{ cursor: `url(${logoCursor}) 0 0, pointer` }}
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

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mt: 3,
              mb: 1,
              fontSize: "18px",
              color: success ? "#30410D" : "#B00020",
            }}
          >
            {success ? "Email Verified Successfully!" : "Verification Failed"}
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
    </Box>
  );
}
