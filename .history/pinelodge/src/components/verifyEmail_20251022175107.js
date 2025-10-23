import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import logo from "../elements/BaguioPinelodgelogo.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage("Your email has been successfully verified! You can now sign in.");
          setOpen(true);
        })
        .catch(() => {
          setMessage("Verification link is invalid or has expired.");
          setOpen(true);
        });
    } else {
      setMessage("No verification code found.");
      setOpen(true);
    }
  }, [searchParams, auth]);

  const handleClose = () => {
    setOpen(false);
    navigate("/SignIn");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          borderRadius: "16px",
          textAlign: "center",
          padding: "20px",
        },
      }}
    >
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <img src={logo} alt="Baguio Pinelodge" width="60" />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#30410D" }}>
            BAGUIO PINELODGE
          </Typography>
          <Typography sx={{ mt: 1, mb: 2, fontSize: "15px", color: "#333" }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{
            backgroundColor: "#1C1C1C",
            color: "#DE7001",
            borderRadius: "10px",
            px: 3,
            "&:hover": { backgroundColor: "#DE7001", color: "#1C1C1C" },
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
