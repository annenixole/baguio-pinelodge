import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Tabs, Tab, TextField, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import axios from "axios";

export default function EditListing({ open, onClose, listing, onUpdated }) {
  const [activeTab, setActiveTab] = useState(0);
  const [availabilityRange, setAvailabilityRange] = useState([new Date(), new Date()]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    capacity: "",
    bedrooms: "",
    area: "",
    street: "",
    barangay: "",
    photos: [],
    type: "",
    mapUrl: "",
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [newInclusion, setNewInclusion] = useState("");
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price || "",
        capacity: listing.capacity || listing.maxGuests || listing.groupSize || "",
        bedrooms: listing.bedrooms || "",
        area: listing.address?.area || "",
        street: listing.address?.street || "",
        barangay: listing.address?.barangay || "",
        photos: listing.photos || [],
        type: listing.type || "",
        mapUrl: listing.mapUrl || "",
      });

      if (listing.availability?.start && listing.availability?.end) {
        setAvailabilityRange([
          new Date(listing.availability.start.toDate ? listing.availability.start.toDate() : listing.availability.start),
          new Date(listing.availability.end.toDate ? listing.availability.end.toDate() : listing.availability.end),
        ]);
      }

      setInclusions(listing.inclusions || []);
      setRules(listing.rules || []);
    }
  }, [listing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    setNewPhotos(Array.from(e.target.files));
  };

  const uploadToImageBB = async (files) => {
    const uploadedUrls = [];
    const apiKey = "7f4c7b4492854bfb596c83c843fc2418";
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          formData
        );
        uploadedUrls.push(response.data.data.url);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
    return uploadedUrls;
  };

  const handleSave = async () => {
    try {
      if (!listing || !auth.currentUser) return;
      const userEmail = auth.currentUser.email;
      const docRef = doc(db, "users", userEmail, `${listing.type}s`, listing.id);

      let uploadedUrls = formData.photos;
      if (newPhotos.length > 0) {
        const uploaded = await uploadToImageBB(newPhotos);
        uploadedUrls = [...uploadedUrls, ...uploaded];
      }

      await updateDoc(docRef, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        bedrooms: parseInt(formData.bedrooms),
        photos: uploadedUrls,
        mapUrl: formData.mapUrl,
        inclusions,
        rules,
        address: {
          area: formData.area,
          street: formData.street,
          barangay: formData.barangay,
          city: "Baguio",
          province: "Benguet",
          postalCode: "2600",
        },
        availability: {
          start: availabilityRange[0],
          end: availabilityRange[1],
        },
        updatedAt: new Date(),
      });

      alert("Listing updated successfully!");
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing.");
    }
  };

  const handleAddItem = (type) => {
    if (type === "inclusion" && newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
    if (type === "rule" && newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveItem = (type, index) => {
    if (type === "inclusion") {
      setInclusions(inclusions.filter((_, i) => i !== index));
    }
    if (type === "rule") {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const renderPhotoPreview = (photos) => (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        justifyContent: "center",
      }}
    >
      {photos.map((photo, i) => (
        <Box key={i} sx={{ position: "relative" }}>
          <img
            src={photo}
            alt={`photo-${i}`}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
          <IconButton
            size="small"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                photos: prev.photos.filter((_, index) => index !== i),
              }))
            }
            sx={{
              position: "absolute",
              top: -6,
              right: -6,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );

  if (!listing) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          height: "90vh",
          overflowY: "auto",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          borderBottom: "1px solid #ddd",
          mb: 2,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
        variant="fullWidth"
      >
        <Tab label="Listing Details" />
        <Tab label="Edit Calendar" />
      </Tabs>

      <DialogContent dividers>
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/*Location Details */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Location Details
            </Typography>

            <TextField
              label="Area in Baguio City *"
              name="area"
              placeholder="e.g., Near Session Road"
              value={formData.area}
              onChange={handleChange}
              variant="outlined"
              fullWidth />

            <TextField
              label="Street Address *"
              name="street"
              placeholder="Enter street address"
              value={formData.street}
              onChange={handleChange}
              variant="outlined"
              fullWidth />

            <TextField
              label="Barangay / Subdivision *"
              name="barangay"
              placeholder="Enter barangay or subdivision"
              value={formData.barangay}
              onChange={handleChange}
              variant="outlined"
              fullWidth />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="City"
                value="Baguio"
                fullWidth
                disabled
                variant="outlined" />

              <TextField
                label="Province"
                value="Benguet"
                fullWidth
                disabled
                variant="outlined" />

              <TextField
                label="Postal Code"
                value="2600"
                fullWidth
                disabled
                variant="outlined" />
            </Box>
            {/*Listing Details */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Listing Details
            </Typography>
            <TextField
              label="Listing Title *"
              name="title"
              placeholder="Enter listing title"
              value={formData.title}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            {/* Description */}
            <TextField
              label="Description *"
              name="description"
              placeholder="Describe your listing"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
            />

            {/* Price */}
            <TextField
              label="Price (₱) *"
              name="price"
              type="number"
              placeholder="Enter listing price"
              value={formData.price}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            {/* Capacity */}
            <TextField
              label="Capacity *"
              name="capacity"
              type="number"
              placeholder="Enter max number of guests"
              value={formData.capacity}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            {/* Bedrooms */}
            {formData.type === "accommodation" && (
              <TextField
                label="Number of Bedrooms *"
                name="bedrooms"
                type="number"
                placeholder="Enter number of bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            )}

            {/* 🖼 Photos Section */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Photos
            </Typography>

            <Box
              sx={{
                border: "2px dashed #c7c7c7",
                borderRadius: 2,
                py: 3,
                textAlign: "center",
                position: "relative",
                bgcolor: "#fafafa",
              }}
            >
              {/* Upload input */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Click to upload new images
              </Typography>

              {/* Preview uploaded or existing photos */}
              {formData.photos?.length > 0 ? (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    justifyContent: "center",
                  }}
                >
                  {formData.photos.map((photo, i) => (
                    <Box key={i} sx={{ position: "relative" }}>
                      <img
                        src={photo}
                        alt={`photo-${i}`}
                        style={{
                          width: 70,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            photos: prev.photos.filter((_, index) => index !== i),
                          }))
                        }
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No photos uploaded yet.
                </Typography>
              )}
                {renderPhotoPreview(formData.photos)}
            </Box>


            {/* Map URL */}
            <TextField
              label="Location Map Link (Optional)"
              name="mapUrl"
              type="url"
              placeholder="Paste your Google Maps URL"
              value={formData.mapUrl}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            {/* Inclusions */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Inclusions
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add inclusion"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("inclusion"))}
              />
              <Button variant="outlined" onClick={() => handleAddItem("inclusion")}>
                Add
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {inclusions.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ mr: 1 }}>{item}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveItem("inclusion", i)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* Rules */}
            <Typography variant="subtitle1" sx={{ mt: 0 }}>
              Rules
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add rule"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("rule"))}
              />
              <Button variant="outlined" onClick={() => handleAddItem("rule")}>
                Add
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {rules.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ mr: 1 }}>{item}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveItem("rule", i)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Calendar Availability
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Select the date range when your listing is available.
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                "& .react-calendar": {
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  width: "100%",
                  maxWidth: 350,
                },
              }}
            >
              <Calendar
                selectRange={true}
                minDate={new Date()}
                onChange={(range) => setAvailabilityRange(range)}
                value={availabilityRange}
              />
            </Box>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Availability:
              </Typography>
              {availabilityRange?.length === 2 ? (
                <Typography sx={{ color: "#70873F" }}>
                  {`${availabilityRange[0].toLocaleDateString()} → ${availabilityRange[1].toLocaleDateString()}`}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No range selected yet.
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            borderRadius: 2,
            bgcolor: "#5ca166",
            textTransform: "none",
            "&:hover": { bgcolor: "#4c8954" },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
