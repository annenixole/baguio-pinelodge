import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box
} from "@mui/material";
import logo from "../elements/BaguioPinelodgelogo.png";
import logoCursor from "../elements/logoCursor.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
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
          setOpen(true);
        })
        .catch(() => {
          setMessage("Verification link is invalid or has expired.");
          setSuccess(false);
          setOpen(true);
        });
    } else {
      setMessage("No verification code found.");
      setSuccess(false);
      setOpen(true);
    }
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
        backgroundColor: "#fff",
      }}
    >
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
            sx={{ mt: 3, mb: 1, fontSize: "18px", color: "#30410D" }}
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
