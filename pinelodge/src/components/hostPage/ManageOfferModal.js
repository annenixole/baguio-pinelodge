// ManageOfferModal.jsx
import React, { useState } from "react";
import {Dialog,DialogTitle,DialogContent,IconButton,Typography,Box,Button,RadioGroup,FormControlLabel,Radio,TextField,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ManageOfferModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [offerType, setOfferType] = useState("");
  const [formData, setFormData] = useState({
    promoTitle: "",
    promoDescription: "",
    promoDiscount: "",
    promoInclusion: "",
    promoCode: "",
    discountRate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOffer = () => {
    console.log("Offer Added:", { type: offerType, ...formData });
    alert("Offer added successfully!");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 1.5 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Manage Offers
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: "#e0e0e0" }}>
            <Box sx={{
              width: `${(step / 2) * 100}%`,
              height: "100%",
              bgcolor: "#5ca166",
              transition: "width 0.3s ease"
            }} />
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Step {step} of 2
          </Typography>
        </Box>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              What type of offer do you want to create?
            </Typography>
            <RadioGroup
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
            >
              <FormControlLabel
                value="promotion"
                control={<Radio />}
                label="Promotion"
              />
              <FormControlLabel
                value="discount"
                control={<Radio />}
                label="Discount"
              />
            </RadioGroup>

            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button
                variant="contained"
                disabled={!offerType}
                sx={{ bgcolor: "#5ca166", color: "#fff", borderRadius: 2 }}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </Box>
          </>
        )}

        {/* Step 2: Inputs */}
        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {offerType === "promotion" ? (
              <>
                <TextField
                  name="promoTitle"
                  label="Promo Title"
                  fullWidth
                  value={formData.promoTitle}
                  onChange={handleChange}
                />
                <TextField
                  name="promoDescription"
                  label="Promo Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.promoDescription}
                  onChange={handleChange}
                />
                <TextField
                  name="promoDiscount"
                  label="Promo Discount (optional)"
                  fullWidth
                  type="number"
                  value={formData.promoDiscount}
                  onChange={handleChange}
                />
                <TextField
                  name="promoInclusion"
                  label="Promo Inclusion (additional)"
                  fullWidth
                  value={formData.promoInclusion}
                  onChange={handleChange}
                />
                <TextField
                  name="promoCode"
                  label="Promo Code"
                  fullWidth
                  value={formData.promoCode}
                  onChange={handleChange}
                />
              </>
            ) : (
              <TextField
                name="discountRate"
                label="Discount Rate (%)"
                fullWidth
                type="number"
                value={formData.discountRate}
                onChange={handleChange}
              />
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button
                variant="text"
                onClick={() => setStep(1)}
                sx={{ color: "#5ca166" }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "#5ca166", color: "#fff" }}
                onClick={handleAddOffer}
              >
                Add Offer
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
