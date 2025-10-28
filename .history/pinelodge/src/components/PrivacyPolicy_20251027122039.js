import React from "react";
import { Box, Typography, Button, Modal, Paper, Divider, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';

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
              <SecurityIcon sx={{ fontSize: 32, color: "#30410D" }} />
            </Box>
            <Typography
              id="privacy-modal-title"
              variant="h4"
              fontWeight={700}
              sx={{ mb: 1.5, color: "#1C1C1C", fontSize: { xs: "24px", sm: "28px" } }}
            >
              PRIVACY POLICY
            </Typography>

            <Typography
              variant="body2"
              sx={{ mb: 2, color: "#666", fontSize: "15px", lineHeight: 1.6, px: 2 }}
            >
              This Privacy Policy explains how BAGUIO PINELODGE collects, uses,
              and protects your personal data when you use our website, booking
              services, and host platform.
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
                Information We Collect
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                We collect personal information such as your name, email address,
                contact number, and booking details when you use our platform.
                Non-personal data like browser type and IP address may also be
                collected to improve our services.
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
                How We Use Your Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                Your data helps us confirm reservations, process payments, and
                improve guest and host experiences. We may also send updates,
                promotions, or service announcements.
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
                Data Protection
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                We implement reasonable safeguards, such as encryption and limited
                access, to protect your data against unauthorized use, alteration,
                or disclosure.
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
                Sharing Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                We do not sell or rent personal information. We may share data
                with trusted service providers (like payment processors) who help
                operate our services under confidentiality agreements.
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
                }}>5</Box>
                Cookies
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                Our website may use cookies to enhance user experience. You can
                disable cookies through your browser settings, but some features
                may not function properly.
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
                }}>6</Box>
                Your Rights
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                You have the right to access, correct, or delete your personal
                data. To make a request, please contact us at:{" "}
                <Box 
                  component="span" 
                  sx={{ 
                    fontWeight: 600, 
                    color: "#30410D",
                    backgroundColor: "rgba(48, 65, 13, 0.1)",
                    px: 1,
                    py: 0.3,
                    borderRadius: "4px",
                    display: "inline-block",
                    mt: 0.5
                  }}
                >
                  baguiopinelodge@gmail.com
                </Box>
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
                }}>7</Box>
                Policy Updates
              </Typography>
              <Typography variant="body2" sx={{ mb: 0, color: "#444", lineHeight: 1.7, fontSize: "14px" }}>
                We may update this Privacy Policy periodically. All updates will
                be posted on our website and take effect immediately upon posting.
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
