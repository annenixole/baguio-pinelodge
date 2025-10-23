// src/TermsOfService.js
import React from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";

export default function TermsOfService({ open, handleClose }) {
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="tos-modal-title">
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
            id="tos-modal-title"
            variant="h5"
            fontWeight={700}
            sx={{ mb: 1, color: "#1C1C1C" }}
          >
            TERMS OF SERVICE
          </Typography>

          <Typography
            variant="body2"
            sx={{ mb: 3, color: "#666", fontSize: "14px" }}
          >
            Please read the following Terms of Service carefully before using
            Baguio Pine Lodge’s website, booking services, and host platform.
          </Typography>

          <Box
            sx={{
              textAlign: "left",
              maxHeight: "50vh",
              overflowY: "auto",
              pr: 1,
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              1. Set Rules for Using the Website
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Users must not post harmful, abusive, or illegal content, and must
              not use the site for unlawful activities. Misuse or interference
              may result in account suspension.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              2. Limit Legal Liability
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Baguio Pine Lodge is not liable for technical errors, downtime, or
              misuse of services. Guests and hosts are responsible for verifying
              booking details and compliance with local laws.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              3. Define Intellectual Property Rights
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              All content, logos, and media belong to Baguio Pine Lodge and
              cannot be copied or distributed without permission.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              4. Describe Account or Membership Rules
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Guests and hosts must provide accurate information during
              registration. We reserve the right to suspend or terminate
              accounts that violate policies or applicable laws.
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              5. Governing Law
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              These Terms are governed by the laws of the Republic of the
              Philippines under the jurisdiction of the courts in Baguio City.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1C1C1C",
                color: "#fff",
                "&:hover": { backgroundColor: "#DE7001" },
              }}
              onClick={handleClose}
            >
              ACCEPT
            </Button>
           
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
