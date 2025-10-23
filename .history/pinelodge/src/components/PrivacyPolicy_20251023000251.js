import React from "react";
import { Box, Typography, Button, Modal, Paper, Divider } from "@mui/material";

export default function PrivacyPolicy({ open, handleClose }) {
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="privacy-modal-title">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 550,
            borderRadius: "16px",
            boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
            textAlign: "center",
          }}
        >
          <Typography
            id="privacy-modal-title"
            variant="h5"
            fontWeight={700}
            sx={{ mb: 1, color: "#1C1C1C" }}>  PRIVACY POLICY
          </Typography>

          <Typography
            variant="body2"
            sx={{ mb: 3, color: "#666", fontSize: "14px" }}>
            This Privacy Policy explains how BAGUIO PINELODGE collects, uses,
            and protects your personal data when you use our website, booking
            services, and host platform.
          </Typography>
          <Divider/>

          <Box sx={{
              textAlign: "left",
              maxHeight: "50vh",
              overflowY: "auto",
              pr: 1,
              mb: 3,
              mt: 3, 
              }}  >

            <Typography variant="subtitle1" fontWeight={700}>
              1. Information We Collect
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We collect personal information such as your name, email address,
              contact number, and booking details when you use our platform.
              Non-personal data like browser type and IP address may also be
              collected to improve our services.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your data helps us confirm reservations, process payments, and
              improve guest and host experiences. We may also send updates,
              promotions, or service announcements.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              3. Data Protection
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We implement reasonable safeguards, such as encryption and limited
              access, to protect your data against unauthorized use, alteration,
              or disclosure.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              4. Sharing Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We do not sell or rent personal information. We may share data
              with trusted service providers (like payment processors) who help
              operate our services under confidentiality agreements.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              5. Cookies
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Our website may use cookies to enhance user experience. You can
              disable cookies through your browser settings, but some features
              may not function properly.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              6. Your Rights
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You have the right to access, correct, or delete your personal
              data. To make a request, please contact us at:
              <br />
              <strong>info@baguiopinelodge.com</strong>
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              7. Policy Updates
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We may update this Privacy Policy periodically. All updates will
              be posted on our website and take effect immediately upon posting.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "right", gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1C1C1C",
                color: "#fff",
                "&:hover": { backgroundColor: "#DE7001" },
              }}
              onClick={handleClose}
            >
              CLOSE
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
