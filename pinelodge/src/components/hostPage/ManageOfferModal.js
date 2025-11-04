import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Popover,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function ManageOfferModal({
  open,
  onClose,
  activePromotion,
  listingId,
  listingType = "accommodations",
  listingPrice = 0,
  listingAvailability,
}) {
  const [formData, setFormData] = useState({
    promoCode: "",
    percentageDiscount: "",
    actualDiscountedPrice: "",
    startDate: "",
    endDate: "",
    minSpendRequired: "",
    maxUsers: "",
    termsAndConditions: [],
  });
  const [newTerm, setNewTerm] = useState("");
  
  // Date picker states
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const dateButtonRef = useRef(null);
  const [displayDates, setDisplayDates] = useState("");

  // Calculate discounted price dynamically
  const calculateDiscount = (discountPercent) => {
    const discount = parseFloat(discountPercent);
    if (!listingPrice || isNaN(discount) || discount <= 0) return "";
    const discountedPrice = listingPrice - (listingPrice * discount) / 100;
    return discountedPrice.toFixed(2);
  };

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !listingId) return;

        const docRef = doc(db, "users", user.email, `${listingType}s`, listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().promotion) {
          const promo = docSnap.data().promotion;
          setFormData({
            promoCode: promo.promoCode || "",
            percentageDiscount: promo.percentageDiscount || "",
            actualDiscountedPrice: promo.actualDiscountedPrice || calculateDiscount(promo.percentageDiscount),
            startDate: promo.startDate || "",
            endDate: promo.endDate || "",
            minSpendRequired: promo.minSpendRequired || "",
            maxUsers: promo.maxUsers || "",
            termsAndConditions: promo.termsAndConditions || [],
          });
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
      }
    };

    if (open) fetchPromotion();
  }, [open, listingId, listingType]);

  // Populate form when editing
  useEffect(() => {
    if (activePromotion) {
      setFormData({
        promoCode: activePromotion.promoCode || "",
        percentageDiscount: activePromotion.percentageDiscount || "",
        actualDiscountedPrice: activePromotion.actualDiscountedPrice || calculateDiscount(activePromotion.percentageDiscount),
        startDate: activePromotion.startDate || "",
        endDate: activePromotion.endDate || "",
        minSpendRequired: activePromotion.minSpendRequired || "",
        maxUsers: activePromotion.maxUsers || "",
        termsAndConditions: activePromotion.termsAndConditions || [],
      });
      
      // Set date range for calendar
      if (activePromotion.startDate && activePromotion.endDate) {
        const startDate = new Date(activePromotion.startDate);
        const endDate = new Date(activePromotion.endDate);
        setDateRange([startDate, endDate]);
        
        // Format display dates
        const formatDate = (date) => {
          const month = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();
          const year = date.getFullYear();
          return `${month} ${day}, ${year}`;
        };
        
        if (startDate.toDateString() === endDate.toDateString()) {
          setDisplayDates(formatDate(startDate));
        } else {
          setDisplayDates(`${formatDate(startDate)} - ${formatDate(endDate)}`);
        }
      }
    } else {
      setFormData({
        promoCode: "",
        percentageDiscount: "",
        actualDiscountedPrice: "",
        startDate: "",
        endDate: "",
        minSpendRequired: "",
        maxUsers: "",
        termsAndConditions: [],
      });
      setDateRange([null, null]);
      setDisplayDates("");
    }
  }, [activePromotion, open]);

  // Handle input change and live discount update
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === "percentageDiscount") {
      updated.actualDiscountedPrice = calculateDiscount(value);
    }

    setFormData(updated);
  };

  // Generate random promo code
  const handleGenerateCode = () => {
    const newCode = "PROMO" + Math.random().toString(36).substring(2, 7).toUpperCase();
    setFormData({ ...formData, promoCode: newCode });
  };

  // Add term to the list
  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setFormData({
        ...formData,
        termsAndConditions: [...formData.termsAndConditions, newTerm.trim()],
      });
      setNewTerm("");
    }
  };

  // Remove term from the list
  const handleRemoveTerm = (indexToRemove) => {
    setFormData({
      ...formData,
      termsAndConditions: formData.termsAndConditions.filter((_, index) => index !== indexToRemove),
    });
  };

  // Handle date picker
  const handleDateClick = () => {
    setDateAnchorEl(dateButtonRef.current);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    
    const formatDate = (date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    const formatISODate = (date) => {
      return date.toISOString().split('T')[0];
    };

    if (Array.isArray(value)) {
      const [start, end] = value;
      if (start && end) {
        setFormData({
          ...formData,
          startDate: formatISODate(start),
          endDate: formatISODate(end),
        });
        if (start.toDateString() === end.toDateString()) {
          setDisplayDates(formatDate(start));
        } else {
          setDisplayDates(`${formatDate(start)} - ${formatDate(end)}`);
        }
      } else if (start) {
        setFormData({
          ...formData,
          startDate: formatISODate(start),
          endDate: "",
        });
        setDisplayDates(formatDate(start));
      }
    }
    handleDateClose();
  };

  const handleClearDates = () => {
    setDateRange([null, null]);
    setDisplayDates("");
    setFormData({
      ...formData,
      startDate: "",
      endDate: "",
    });
    handleDateClose();
  };

  // ✅ Save promotion to Firestore
  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to manage promotions.");
        return;
      }

      if (!formData.percentageDiscount || formData.percentageDiscount <= 0) {
        alert("Please enter a valid percentage discount.");
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert("Please select a promo validity range.");
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        alert("End date must be after start date.");
        return;
      }

      const availabilityEnd = listingAvailability?.end
        ? new Date(
            listingAvailability.end.seconds
              ? listingAvailability.end.seconds * 1000
              : listingAvailability.end
          )
        : null;

      if (availabilityEnd && endDate > availabilityEnd) {
        alert("Promo end date cannot exceed your listing's availability end date!");
        return;
      }

      const promotionData = {
        promoCode: formData.promoCode,
        percentageDiscount: formData.percentageDiscount,
        actualDiscountedPrice: calculateDiscount(formData.percentageDiscount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        minSpendRequired: formData.minSpendRequired || null,
        maxUsers: formData.maxUsers || null,
        termsAndConditions: formData.termsAndConditions,
        createdAt: new Date(),
      };

      const docRef = doc(db, "users", user.email, `${listingType}s`, listingId);
      await updateDoc(docRef, {
        promotion: promotionData,
      });

      alert(
        activePromotion
          ? "Promotion updated successfully!"
          : "Promotion created successfully!"
      );
      onClose();
    } catch (error) {
      console.error("Error saving promotion:", error);
      alert("Failed to save promotion.");
    }
  };

  // ✅ Remove promotion
  const handleRemove = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to remove promotions.");
        return;
      }

      const docRef = doc(db, "users", user.email, `${listingType}s`, listingId);
      await updateDoc(docRef, { promotion: null });

      alert("Promotion removed successfully!");
      onClose();
    } catch (error) {
      console.error("Error removing promotion:", error);
      alert("Failed to remove promotion.");
    }
  };

  const isEditing = Boolean(activePromotion);

  // Limit date range based on listing availability
  const maxDate =
    listingAvailability?.end &&
    new Date(
      listingAvailability.end.seconds
        ? listingAvailability.end.seconds * 1000
        : listingAvailability.end
    )
      .toISOString()
      .split("T")[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Manage Offers
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 400 }}>
          Add Promotion to your listing
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Promo Code */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
              Promotion Code
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                name="promoCode"
                value={formData.promoCode}
                onChange={handleChange}
                fullWidth
                placeholder="Enter promo code"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#E3F2FD",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90CAF9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42A5F5",
                    },
                  },
                }}
              />
              <Button
                onClick={handleGenerateCode}
                startIcon={<RefreshIcon />}
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#E3F2FD",
                  color: "#1976D2",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  px: 2.5,
                  "&:hover": {
                    bgcolor: "#BBDEFB",
                    boxShadow: "none",
                  },
                }}
              >
                Generate
              </Button>
            </Box>
          </Box>

          {/* Percentage Discount & Actual Discounted Price */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
                % Percentage Discount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                name="percentageDiscount"
                value={formData.percentageDiscount}
                onChange={handleChange}
                type="number"
                fullWidth
                placeholder=""
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F5F7FA",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#BDBDBD",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976D2",
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
                Actual Discounted Price
              </Typography>
              <TextField
                name="actualDiscountedPrice"
                value={formData.actualDiscountedPrice ? `₱${formData.actualDiscountedPrice}` : ""}
                fullWidth
                placeholder="(uneditable)"
                variant="outlined"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "transparent",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#BDBDBD",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#BDBDBD",
                      borderStyle: "dashed",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#BDBDBD",
                      borderStyle: "dashed",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#999",
                    textAlign: "center",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Promo Validity Range */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
              Promo Validity range
            </Typography>
            <Box
              ref={dateButtonRef}
              onClick={handleDateClick}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                bgcolor: "#F5F7FA",
                borderRadius: "8px",
                border: "1px solid #E0E0E0",
                px: 2,
                py: 1.5,
                "&:hover": {
                  borderColor: "#BDBDBD",
                },
              }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: "1rem", color: displayDates ? "#30410D" : "#999" }}>
                {displayDates || "Select date range"}
              </Typography>
              <CalendarTodayIcon sx={{ color: "#757575" }} />
            </Box>
            
            <Popover
              open={Boolean(dateAnchorEl)}
              anchorEl={dateAnchorEl}
              onClose={handleDateClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Calendar
                  onChange={handleDateChange}
                  value={dateRange}
                  selectRange={true}
                  minDate={new Date()}
                  maxDate={listingAvailability?.end ? new Date(
                    listingAvailability.end.seconds
                      ? listingAvailability.end.seconds * 1000
                      : listingAvailability.end
                  ) : undefined}
                />
                <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    onClick={handleClearDates}
                    sx={{ textTransform: "none", color: "#666" }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Box>

          {/* Min Spend Required & Max Users */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
                Min. Spend Required
              </Typography>
              <TextField
                name="minSpendRequired"
                value={formData.minSpendRequired}
                onChange={handleChange}
                type="number"
                fullWidth
                placeholder="Unlimited if empty"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F5F7FA",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#BDBDBD",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976D2",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#999",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
                Max Users
              </Typography>
              <TextField
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                type="number"
                fullWidth
                placeholder="Unlimited if empty"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F5F7FA",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#BDBDBD",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976D2",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#999",
                    opacity: 1,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Terms and Conditions */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
              Terms and condition
            </Typography>
            <TextField
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              fullWidth
              placeholder="Add a term or condition"
              variant="outlined"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTerm();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleAddTerm}
                      sx={{
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "#f0f0f0" },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#F5F7FA",
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#BDBDBD",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976D2",
                  },
                },
              }}
            />

            {/* Display terms as chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {formData.termsAndConditions.map((term, index) => (
                <Chip
                  key={index}
                  label={term}
                  onDelete={() => handleRemoveTerm(index)}
                  sx={{
                    bgcolor: "transparent",
                    border: "1px dashed #BDBDBD",
                    borderRadius: "16px",
                    "& .MuiChip-deleteIcon": {
                      color: "#757575",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Create/Update and Remove Promotion Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
            {isEditing && (
              <Button
                variant="contained"
                onClick={handleRemove}
                sx={{
                  bgcolor: "#333",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "24px",
                  px: 4,
                  py: 1.2,
                  fontSize: "0.95rem",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#555",
                    boxShadow: "none",
                  },
                }}
              >
                Remove Promotion
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: "#E68600",
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "24px",
                px: 5,
                py: 1.2,
                fontSize: "0.95rem",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#CC7700",
                  boxShadow: "none",
                },
              }}
            >
              {isEditing ? "Update" : "Create Promotion"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
