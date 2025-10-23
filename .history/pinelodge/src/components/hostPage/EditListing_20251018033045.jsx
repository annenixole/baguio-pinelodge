import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import axios from "axios";

export default function EditListing({ open, onClose, listing, onUpdated }) {
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
  });
  const [newPhotos, setNewPhotos] = useState([]);

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
      });
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
        photos: uploadedUrls,
        address: {
          area: formData.area,
          street: formData.street,
          barangay: formData.barangay,
          city: "Baguio",
          province: "Benguet",
          postalCode: "2600",
        },
        updatedAt: new Date(),
      });

      alert("✅ Listing updated successfully!");
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("❌ Failed to update listing.");
    }
  };

  const inputStyle = {
    width: "90%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
  };
  const textareaStyle = {
    width: "90%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    resize: "none",
  };
  const uploaderStyle = {
    border: "2px dashed #c7c7c7",
    borderRadius: 2,
    width: "95%",
    textAlign: "center",
    py: 4,
    position: "relative",
  };
  const uploaderInputStyle = {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
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
        <img
          key={i}
          src={photo}
          alt={`photo-${i}`}
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
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

      <DialogContent dividers>
        {/* Address Section */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Location Details
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Area in Baguio City *
            </Typography>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select an area</option>
              <option value="Session Road">Session Road</option>
              <option value="Burnham Park">Burnham Park</option>
              <option value="Camp John Hay">Camp John Hay</option>
              <option value="Mines View">Mines View</option>
              <option value="Loakan">Loakan</option>
              <option value="La Trinidad">La Trinidad</option>
            </select>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Street
            </Typography>
            <input
              name="street"
              placeholder="Enter street name and number"
              value={formData.street}
              onChange={handleChange}
              style={inputStyle}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Barangay
            </Typography>
            <input
              name="barangay"
              placeholder="Enter barangay"
              value={formData.barangay}
              onChange={handleChange}
              style={inputStyle}
            />
          </Box>

          {/* City, Province, Postal */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <input value="Baguio" disabled style={{ ...inputStyle, width: "30%" }} />
            <input value="Benguet" disabled style={{ ...inputStyle, width: "30%" }} />
            <input value="2600" disabled style={{ ...inputStyle, width: "30%" }} />
          </Box>
        </Box>

        {/* Details Section */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Edit Details
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <input
            name="title"
            placeholder={
              formData.type === "service"
                ? "Specify the service you provide"
                : "Enter title"
            }
            value={formData.title}
            onChange={handleChange}
            style={inputStyle}
          />

          <textarea
            name="description"
            placeholder="Describe what guests can expect"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={textareaStyle}
          />

          <input
            name="price"
            type="number"
            placeholder="Enter price or rate (₱)"
            value={formData.price}
            onChange={handleChange}
            style={inputStyle}
          />
          
          <input
            name="bedrooms"
            type="number"
            placeholder="Number of bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="capacity"
            type="number"
            placeholder={
              formData.type === "accommodation"
                ? "Guest capacity"
                : formData.type === "service"
                  ? "Guests per rate"
                  : "Group size"
            }
            value={formData.capacity}
            onChange={handleChange}
            style={inputStyle}
          />
        </Box>

        {/* Photo Upload */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Photos
        </Typography>
        <Box sx={uploaderStyle}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={uploaderInputStyle}
          />
          <Typography variant="body2" color="text.secondary">
            Click to upload new images
          </Typography>
          {renderPhotoPreview(formData.photos)}
          {newPhotos.length > 0 && (
            <Typography sx={{ mt: 1, color: "gray" }}>
              {newPhotos.length} new photo(s) selected
            </Typography>
          )}
        </Box>
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
