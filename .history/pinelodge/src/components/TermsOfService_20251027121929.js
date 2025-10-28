// src/TermsOfService.js
import React from "react";
import { Box, Typography, Button, Modal, Paper, Divider, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import GavelIcon from '@mui/icons-material/Gavel';

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
            maxWidth: 600,
            borderRadius: "20px",
            boxShadow: "0px 10px 40px rgba(0,0,0,0.15)",
            backgroundColor: "#fff",
            position: "relative",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "#666",
              "&:hover": { 
                backgroundColor: "rgba(222, 112, 1, 0.1)",
                color: "#DE7001"
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "rgba(48, 65, 13, 0.1)",
                mb: 2,
              }}
            >
              <GavelIcon sx={{ fontSize: 32, color: "#30410D" }} />
            </Box>
            <Typography
              id="tos-modal-title"
              variant="h4"
              fontWeight={700}
              sx={{ mb: 1.5, color: "#1C1C1C", fontSize: { xs: "24px", sm: "28px" } }}
            >
              TERMS OF SERVICE
            </Typography>

            <Typography
              variant="body2"
              sx={{ mb: 2, color: "#666", fontSize: "15px", lineHeight: 1.6, px: 2 }}
            >
              Please read the following Terms of Service carefully before using BAGUIO PINELODGE's website, booking services, and host platform.
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Content */}
          <Box
            sx={{
              textAlign: "left",
              flex: 1,
              overflowY: "auto",
              pr: 2,
              mb: 3,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#70873F",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#30410D",
                },
              },
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  mb: 1, 
                  color: "#30410D",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(48, 65, 13, 0.1)",
                  fontSize: "14px",
                  fontWeight: 700
                }}>1</Box>
                Set Rules for Using the Website
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                Users must not post harmful, abusive, or illegal content, and must
                not use the site for unlawful activities. Misuse or interference
                may result in account suspension.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  mb: 1, 
                  color: "#30410D",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(48, 65, 13, 0.1)",
                  fontSize: "14px",
                  fontWeight: 700
                }}>2</Box>
                Limit Legal Liability
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                BAGUIO PINELODGE is not liable for technical errors, downtime, or
                misuse of services. Guests and hosts are responsible for verifying
                booking details and compliance with local laws.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  mb: 1, 
                  color: "#30410D",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(48, 65, 13, 0.1)",
                  fontSize: "14px",
                  fontWeight: 700
                }}>3</Box>
                Define Intellectual Property Rights
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                All content, logos, and media belong to BAGUIO PINELODGE and
                cannot be copied or distributed without permission.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  mb: 1, 
                  color: "#30410D",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(48, 65, 13, 0.1)",
                  fontSize: "14px",
                  fontWeight: 700
                }}>4</Box>
                Describe Account or Membership Rules
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                Guests and hosts must provide accurate information during
                registration. We reserve the right to suspend or terminate
                accounts that violate policies or applicable laws.
              </Typography>
            </Box>

            <Box sx={{ mb: 0 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  mb: 1, 
                  color: "#30410D",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(48, 65, 13, 0.1)",
                  fontSize: "14px",
                  fontWeight: 700
                }}>5</Box>
                Governing Law
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                These Terms are governed by the laws of the Republic of the
                Philippines under the jurisdiction of the courts in Baguio City.
              </Typography>
            </Box>
          </Box>

          {/* Footer Button */}
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#30410D",
                color: "#fff",
                fontWeight: 600,
                py: 1.2,
                borderRadius: "12px",
                fontSize: "15px",
                textTransform: "none",
                "&:hover": { 
                  backgroundColor: "#DE7001",
                  transform: "translateY(-2px)",
                  boxShadow: "0px 4px 12px rgba(222, 112, 1, 0.3)"
                },
                transition: "all 0.3s ease"
              }}
              onClick={handleClose}
            >
              I Understand
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
