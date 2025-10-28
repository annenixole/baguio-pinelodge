import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, TextField, Button, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ManageOfferModal({ open,onClose,activePromotion,listingPrice = 0,listingAvailability}) {
  const [formData, setFormData] = useState({
    promoCode: "",
    percentageDiscount: "",
    actualDiscountedPrice: "",
    maxUses: "",
    expiryDate: "",
    description: "",
  });

  // ✅ Function to calculate the discounted price safely
  const calculateDiscount = (discountPercent) => {
    const discount = parseFloat(discountPercent);
    if (!listingPrice || isNaN(discount) || discount <= 0) return "";
    const discountedPrice = listingPrice - (listingPrice * discount) / 100;
    return discountedPrice.toFixed(2);
  };

  // ✅ Initialize or reset form depending on mode
  useEffect(() => {
    if (activePromotion) {
      setFormData({
        promoCode: activePromotion.promoCode || "",
        percentageDiscount: activePromotion.percentageDiscount || "",
        maxUses: activePromotion.maxUses || "",
        expiryDate: activePromotion.expiryDate || "",
        description: activePromotion.description || "",
        actualDiscountedPrice:
          activePromotion.actualDiscountedPrice ||
          calculateDiscount(activePromotion.percentageDiscount),
      });
    } else {
      setFormData({
        promoCode: "",
        percentageDiscount: "",
        actualDiscountedPrice: "",
        maxUses: "",
        expiryDate: "",
        description: "",
      });
    }
  }, [activePromotion, open]);

  // ✅ Handle input changes + auto update price
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === "percentageDiscount") {
      updated.actualDiscountedPrice = calculateDiscount(value);
    }

    setFormData(updated);
  };

  // ✅ Generate random promo code
  const handleGenerateCode = () => {
    const newCode =
      "PROMO" + Math.random().toString(36).substring(2, 7).toUpperCase();
    setFormData({ ...formData, promoCode: newCode });
  };

  // ✅ Submit handler
  const handleSubmit = () => {
    const data = {
      ...formData,
      actualDiscountedPrice: calculateDiscount(formData.percentageDiscount),
    };
    if (activePromotion) {
      alert("Promotion updated: " + JSON.stringify(data, null, 2));
    } else {
      alert("Promotion created: " + JSON.stringify(data, null, 2));
    }
    onClose();
  };

  // ✅ Remove handler
  const handleRemove = () => {
    alert("Promotion removed!");
    onClose();
  };

  const isEditing = Boolean(activePromotion);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1.5 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Manage Promotion" : "Create Promotion"}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {isEditing
            ? "Remove or Edit Promotion for this listing"
            : "Add Promotion to your listing"}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Promo Code (Editable + Generatable) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              label="Promotion Code"
              name="promoCode"
              value={formData.promoCode}
              onChange={handleChange}
              fullWidth
              placeholder="Enter or generate promo code"
            />
            <Button
              onClick={handleGenerateCode}
              variant="outlined"
              sx={{ textTransform: "none", padding: 2 }} >
              Generate
            </Button>
          </Box>

          {/* Percentage Discount */}
          <TextField
            label="% Percentage Discount *"
            name="percentageDiscount"
            value={formData.percentageDiscount}
            onChange={handleChange}
            type="number"
            fullWidth
          />

          {/* Actual Discounted Price (auto-computed) */}
          <TextField
            label="Actual Discounted Price"
            name="actualDiscountedPrice"
            value={
              formData.actualDiscountedPrice
                ? `₱${formData.actualDiscountedPrice}`
                : ""
            }
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={
              listingPrice
                ? `Base price: ₱${listingPrice.toLocaleString()}`
                : ""
            }
          />

          {/* Max Uses */}
          <TextField
            label="Max Uses (Optional)"
            name="maxUses"
            placeholder="Unlimited if left empty"
            value={formData.maxUses}
            onChange={handleChange}
            fullWidth
          />

          {/* Expiry Date */}
          <TextField
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split("T")[0], // can't be before today
              max:
                listingAvailability?.end &&
                new Date(listingAvailability.end.seconds
                  ? listingAvailability.end.seconds * 1000
                  : listingAvailability.end
                )
                  .toISOString()
                  .split("T")[0], // ✅ can't go past listing's availability end
            }}
            helperText={
              listingAvailability?.end
                ? `Promotion must end by ${new Date(
                  listingAvailability.end.seconds
                    ? listingAvailability.end.seconds * 1000
                    : listingAvailability.end
                ).toLocaleDateString()}`
                : "Select expiry date within your listing’s availability"
            }
            fullWidth
          />


          {/* Description */}
          <TextField
            label="Description (Optional)"
            name="description"
            placeholder="e.g., 15% off for early bookings"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: isEditing ? "space-between" : "flex-end",
              mt: 3,
            }}
          >
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    bgcolor: "#E68600",
                    "&:hover": { bgcolor: "#cc7600" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Update
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRemove}
                  sx={{
                    bgcolor: "#2F2B2B",
                    "&:hover": { bgcolor: "#000" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Remove Promotion
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  bgcolor: "#E68600",
                  "&:hover": { bgcolor: "#cc7600" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Create Promotion
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
