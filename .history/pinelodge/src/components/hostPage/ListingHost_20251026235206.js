import React from "react";
import { Box, Typography, Card, CardContent, useMediaQuery, Button, Dialog, DialogTitle, DialogContent, IconButton, RadioGroup, FormControlLabel, Radio, Divider, Chip, } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ProfileMenu from "./ProfileMenu";
import { auth, db } from "../firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, doc, addDoc } from "firebase/firestore";
import axios from "axios";
import ListingGrid from "./ListingGrid";


export default function ListingHost({ setSelectedIndex }) {
  const [reloadTrigger, setReloadTrigger] = React.useState(0);
  const [userEmail, setUserEmail] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [listingType, setListingType] = React.useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // Rules per listing type
  const [accommodationRules, setAccommodationRules] = React.useState([]);
  const [serviceRules, setServiceRules] = React.useState([]);
  const [experienceRules, setExperienceRules] = React.useState([]);
  const [newRules, setRules] = React.useState("");
  // Inclusions per listing type
  const [accommodationInclusions, setAccommodationInclusions] = React.useState([]);
  const [serviceInclusions, setServiceInclusions] = React.useState([]);
  const [experienceInclusions, setExperienceInclusions] = React.useState([]);
  const [newInclusion, setNewInclusion] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  // Rules per listing type
  const getCurrentRules = () => {
    if (listingType === "accommodation") return accommodationRules;
    if (listingType === "service") return serviceRules;
    if (listingType === "experience") return experienceRules;
    return [];
  };

  const setCurrentRules = (updatedList) => {
    if (listingType === "accommodation") setAccommodationRules(updatedList);
    if (listingType === "service") setServiceRules(updatedList);
    if (listingType === "experience") setExperienceRules(updatedList);
  };

  const handleAddRule = () => {
    const trimmed = newRules.trim();
    if (!trimmed) return;
    const current = getCurrentRules();
    if (!current.includes(trimmed)) {
      setCurrentRules([...current, trimmed]);
      setRules("");
    }
  };

  const handleRemoveRule = (item) => {
    const current = getCurrentRules();
    const updated = current.filter((i) => i !== item);
    setCurrentRules(updated);
  };

  // Inclusions per listing type
  const getCurrentInclusions = () => {
    if (listingType === "accommodation") return accommodationInclusions;
    if (listingType === "service") return serviceInclusions;
    if (listingType === "experience") return experienceInclusions;
    return [];
  };
  const setCurrentInclusions = (updatedList) => {
    if (listingType === "accommodation") setAccommodationInclusions(updatedList);
    if (listingType === "service") setServiceInclusions(updatedList);
    if (listingType === "experience") setExperienceInclusions(updatedList);
  };
  // Add inclusion
  const handleAddInclusion = () => {
    const trimmed = newInclusion.trim();
    if (!trimmed) return;

    const current = getCurrentInclusions();
    if (!current.includes(trimmed)) {
      setCurrentInclusions([...current, trimmed]);
      setNewInclusion("");
    }
  };
  // Remove inclusion
  const handleRemoveInclusion = (item) => {
    const current = getCurrentInclusions();
    const updated = current.filter((i) => i !== item);
    setCurrentInclusions(updated);
  };


  // Address (Step 2)
  const [area, setArea] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [barangay, setBarangay] = React.useState("");
  // Accommodation (Step 3 - type specific)
  const [listingTitle, setListingTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [bedrooms, setBedroom] = React.useState("");
  const [photos, setPhotos] = React.useState([]);
  // Service (Step 3 - type specific)
  const [serviceTitle, setServiceTitle] = React.useState("");
  const [serviceDescription, setServiceDescription] = React.useState("");
  const [serviceRate, setServiceRate] = React.useState("");
  const [serviceMaxGuests, setServiceMaxGuests] = React.useState("");
  const [servicePhotos, setServicePhotos] = React.useState([]);
  // Experience (Step 3 - type specific)
  const [expTitle, setExpTitle] = React.useState("");
  const [expDescription, setExpDescription] = React.useState("");
  const [expPrice, setExpPrice] = React.useState("");
  const [expGroupSize, setExpGroupSize] = React.useState("");
  const [expPhotos, setExpPhotos] = React.useState([]);
  // Availability (Step 4)
  const [availabilityRange, setAvailabilityRange] = React.useState([new Date(), new Date()]);

  const canProceedStep2 = area && street && barangay;

  //validation for Step 3
  const canProceedStep3 =
    listingType === "accommodation" ? listingTitle && description && price && capacity && bedrooms
      : listingType === "service" ? serviceTitle && serviceDescription && serviceRate && serviceMaxGuests
        : listingType === "experience" ? expTitle && expDescription && expPrice && expGroupSize
          : false;

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user ? user.email : "");
    });
    return () => unsubscribe();
  }, []);

  const handleOpen = () => {
    setStep(1);
    setListingType("");
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Photo handlers per type
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (listingType === "accommodation") setPhotos(files);
    if (listingType === "service") setServicePhotos(files);
    if (listingType === "experience") setExpPhotos(files);
  };

  const handleContinue = () => {
    if (step < 4) setStep(step + 1);
  };

  {/*for viewing images as public*/ }
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
        uploadedUrls.push(response.data.data.url); //image URL
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    return uploadedUrls;
  };

  {/*Firestore database */ }
  const handleSubmitListing = async (isDraft = false) => {
    if (!userEmail || !listingType) return;

    const listingData = {
      type: listingType,
      address: {
        area,
        street,
        barangay,
        city: "Baguio",
        province: "Benguet",
        postalCode: "2600",
      },
      createdAt: new Date(),
      inclusions: getCurrentInclusions(),
      rules: getCurrentRules(),
      availability: {
        start: availabilityRange[0],
        end: availabilityRange[1],
      },
      status: isDraft ? "draft" : "published", // NEW FIELD
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      listingData.hostName = currentUser.displayName || "Host";
      listingData.hostId = currentUser.uid; 
    }


    let uploadedUrls = [];
    if (listingType === "accommodation" && photos.length > 0)
      uploadedUrls = await uploadToImageBB(photos);
    else if (listingType === "service" && servicePhotos.length > 0)
      uploadedUrls = await uploadToImageBB(servicePhotos);
    else if (listingType === "experience" && expPhotos.length > 0)
      uploadedUrls = await uploadToImageBB(expPhotos);

    // Type-specific fields
    if (listingType === "accommodation") {
      listingData.title = listingTitle;
      listingData.description = description;
      listingData.price = parseFloat(price);
      listingData.bedrooms = parseInt(bedrooms);
      listingData.capacity = parseInt(capacity);
      listingData.photos = uploadedUrls;
    } else if (listingType === "service") {
      listingData.title = serviceTitle;
      listingData.description = serviceDescription;
      listingData.price = parseFloat(serviceRate);
      listingData.maxGuests = parseInt(serviceMaxGuests);
      listingData.photos = uploadedUrls;
    } else if (listingType === "experience") {
      listingData.title = expTitle;
      listingData.description = expDescription;
      listingData.price = parseFloat(expPrice);
      listingData.groupSize = parseInt(expGroupSize);
      listingData.photos = uploadedUrls;
    }

    try {
      const subcollectionRef = collection(db, "users", userEmail, `${listingType}s`);
      await addDoc(subcollectionRef, listingData);

      alert(isDraft ? "Listing saved as draft!" : `${listingType} published successfully!`);
      setOpen(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing.");
    }
  };


  const step3Header = {
    title:
      listingType === "accommodation" ? "Tell us about your accommodation"
        : listingType === "service" ? "Tell us about your service"
          : listingType === "experience" ? "Tell us about your experience"
            : "Tell us about your listing",
    subtitle:
      listingType === "accommodation" ? "Add details and photos to make your place stand out"
        : listingType === "service" ? "Describe what you offer and how guests can book you"
          : listingType === "experience" ? "Describe the activity and what participants can expect"
            : "Add details to make your listing stand out",
    priceLabel:
      listingType === "accommodation" ? "Price per night (₱)"
        : listingType === "service" ? "Rate / per person (₱)"
          : "Price / per person (₱)",
  };

  // Step 3 form for the selected type
  const renderStep3Form = () => {
    const commonPhotoPreview = (files) => (
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {files.map((file, i) => (
          <img
            key={i}
            src={URL.createObjectURL(file)}
            alt={`upload-${i}`}
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

    // ACCOMMODATION
    if (listingType === "accommodation") {
      return (
        <>
          {/* Listing Title */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Listing Title
            </Typography>
            <input
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              required
              type="text"
              placeholder="Add a name that captures your space’s vibe"
              style={inputStyle}
            />
          </Box>
          {/* Description */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Description
            </Typography>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your accommodation and what guests can expect"
              rows={4}
              style={textareaStyle}
            />
          </Box>
          {/* Price per night */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {step3Header.priceLabel}
            </Typography>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              type="number"
              min="1"
              placeholder="Enter price per night"
              style={inputStyle}
            />
          </Box>
          {/*number of bedrooms */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Bedroom/s
            </Typography>
            <input
              type="number"
              min="1"
              placeholder="Enter the number of bedrooms"
              value={bedrooms}
              onChange={(e) => setBedroom(e.target.value)}
              required
              style={inputStyle}
            />
          </Box>
          {/* Capacity */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Capacity
            </Typography>
            <input
              type="number"
              min="1"
              placeholder="Enter maximum number of guests"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              style={inputStyle}
            />
          </Box>
          {/* Photos */}
          <Box>
            <Typography sx={{ mb: 1 }}>Photos</Typography>
            <Box sx={uploaderStyle}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={uploaderInputStyle}
              />
              <Typography variant="body2" color="text.secondary">
                Click to upload images
              </Typography>
              {commonPhotoPreview(photos)}
            </Box>
          </Box>
          {/* Map Link (Optional) */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Location Map Link (Optional)
            </Typography>
            <input
              type="url"
              placeholder="Paste your Google Maps location URL"
              style={inputStyle}
            />
          </Box>
        </>
      );
    }
    // SERVICE
    if (listingType === "service") {
      return (
        <>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Service Title
            </Typography>
            <input
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
              type="text"
              placeholder="Specify the service you provide"
              style={inputStyle}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Description
            </Typography>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              required
              placeholder="Describe your service and what guests can expect"
              rows={4}
              style={textareaStyle}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {step3Header.priceLabel}
            </Typography>
            <input
              value={serviceRate}
              onChange={(e) => setServiceRate(e.target.value)}
              required
              type="number"
              min="1"
              placeholder="Enter your rate"
              style={inputStyle}
            />
          </Box>

          <Box>
            <Typography sx={{ mb: 1 }}>Photos</Typography>
            <Box sx={uploaderStyle}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={uploaderInputStyle}
              />
              <Typography variant="body2" color="text.secondary">
                Click to upload images
              </Typography>
              {commonPhotoPreview(servicePhotos)}
            </Box>
          </Box>
        </>
      );
    }
    // EXPERIENCE
    if (listingType === "experience") {
      return (
        <>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Experience Title
            </Typography>
            <input
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              required
              type="text"
              placeholder="What adventure or experience are you offering"
              style={inputStyle}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Description
            </Typography>
            <textarea
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              required
              placeholder="Describe what guests can expect from this experience"
              rows={4}
              style={textareaStyle}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {step3Header.priceLabel}
            </Typography>
            <input
              value={expPrice}
              onChange={(e) => setExpPrice(e.target.value)}
              required
              type="number"
              min="1"
              placeholder="Enter the price"
              style={inputStyle}
            />
          </Box>

          <Box>
            <Typography sx={{ mb: 1 }}>Photos</Typography>
            <Box sx={uploaderStyle}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={uploaderInputStyle}
              />
              <Typography variant="body2" color="text.secondary">
                Click to upload images
              </Typography>
              {commonPhotoPreview(expPhotos)}
            </Box>
          </Box>
        </>
      );
    }
    // Default (no type yet)
    return (
      <Typography variant="body2" color="text.secondary">
        Please choose a listing type first.
      </Typography>
    );
  };

  // Shared styles for inputs
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: -2 }}>
          Listings
        </Typography>
        {userEmail && <ProfileMenu userEmail={isMobile ? null : userEmail} />}
      </Box>

      <Typography color="text.secondary" sx={{ mb: 5 }}>
        Manage your property listings here
      </Typography>

      {/* Filter + Add Listing Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Filter Buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {["all", "accommodation", "service", "experience"].map((category) => (
            <Button
              key={category}
              variant={filter === category ? "contained" : "outlined"}
              onClick={() => setFilter(category)}
              sx={{
                textTransform: "capitalize",
                borderRadius: 2,
                fontWeight: 600,
                color: filter === category ? "#fff" : "#30410D",
                backgroundColor:
                  filter === category ? "#30410D" : "transparent",
                borderColor: "#30410D",
                "&:hover": {
                  backgroundColor:
                    filter === category ? "#30410D" : "rgba(112,135,63,0.1)",
                },
              }}
            >
              {category === "all"
                ? "All"
                : category.charAt(0).toUpperCase() + category.slice(1) + (category !== "service" ? "s" : "")}
            </Button>
          ))}
        </Box>

        {/* Add Listing Button */}
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            color: "#fff",
            bgcolor: "#30410D",
            "&:hover": { bgcolor: "#70873F" },
          }}
          onClick={handleOpen}
        >
          Add Listing
        </Button>
      </Box>

      <Box sx={{ backgroundColor: "#f9f9f9ff", borderRadius: 3, p: 3 }}>
        <ListingGrid typeFilter={filter} setSelectedIndex={setSelectedIndex} reloadTrigger={reloadTrigger} />
      </Box>

      {/* Create Listing Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
            height: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, flexShrink: 0 }}>
          Create New Listing
          <IconButton onClick={handleClose} sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#e0e0e0",
                overflowY: "auto",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${(step / 4) * 100}%`,
                  height: "100%",
                  bgcolor: "#30410D",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontWeight: 500 }}>
              Step {step} of 4
            </Typography>
          </Box>

          {/* Step 1: Choose Type */}
          {step === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                What would you like to list?
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                Choose the type of listing you want to create
              </Typography>

              <RadioGroup value={listingType} onChange={(e) => setListingType(e.target.value)}>
                {/* Accommodation */}
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    mb: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    "&:hover": { borderColor: "#30410D" },
                  }}
                >
                  <FormControlLabel
                    value="accommodation"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          <HomeIcon sx={{ verticalAlign: "middle", mr: 1, color: "#70873F" }} />
                          Accommodation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lodges, Transient, vacation rentals, and other places to stay
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Service */}
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    mb: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    "&:hover": { borderColor: "#70873F" },
                  }}
                >
                  <FormControlLabel
                    value="service"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          <StorefrontIcon
                            sx={{ verticalAlign: "middle", mr: 1, color: "#70873F" }}
                          />
                          Service
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tours, transportation, guides, and other services
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Experience */}
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    mb: 1,
                    p: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    "&:hover": { borderColor: "#70873F" },
                  }}
                >
                  <FormControlLabel
                    value="experience"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          <LocalActivityIcon
                            sx={{ verticalAlign: "middle", mr: 1, color: "#70873F" }}
                          />
                          Experience
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cultural activities, events, workshops, and more
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#30410D",
                    color: "#fff",
                    borderRadius: 2,
                    px: 3,
                    "&:hover": { bgcolor: "#70873F" },
                  }}
                  disabled={!listingType}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </Box>
            </>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Where is your accommodation located?
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                Provide the complete address in Baguio City
              </Typography>

              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Area Dropdown */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Area in Baguio City (Landmark)
                  </Typography>
                  <select
                    defaultValue=""
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    style={{
                      width: "95%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">Select an area</option>
                    <option value="Near Session Road">Near Session Road</option>
                    <option value="Near Burnham Park">Near Burnham Park</option>
                    <option value="Near Camp John Hay">Near Camp John Hay</option>
                    <option value="Near Mines View Park">Near Mines View Park</option>
                    <option value="Near Loakan">Near Loakan</option>
                    <option value="Near SM Baguio">Near SM City Baguio</option>
                  </select>
                </Box>

                {/* Street */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Street address
                  </Typography>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    type="text"
                    placeholder="Enter street address and house/building number"
                    style={{
                      width: "90%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "0.95rem",
                    }}
                  />
                </Box>

                {/* Barangay */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Barangay / Subdivision
                  </Typography>
                  <input
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    required
                    type="text"
                    placeholder="Enter barangay or subdivision"
                    style={{
                      width: "90%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "0.95rem",
                    }}
                  />
                </Box>

                {/* City / Province / Postal */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      City
                    </Typography>
                    <input
                      type="text"
                      value="Baguio City"
                      disabled
                      style={{
                        width: "75%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        backgroundColor: "#f9f9f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Province
                    </Typography>
                    <input
                      type="text"
                      value="Benguet"
                      disabled
                      style={{
                        width: "75%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        backgroundColor: "#f9f9f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Postal Code
                    </Typography>
                    <input
                      type="text"
                      value="2600"
                      disabled
                      style={{
                        width: "75%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        backgroundColor: "#f9f9f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
                <Button
                  variant="text"
                  sx={{ textTransform: "none", color: "#30410D", fontWeight: 600 }}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    sx={{
                      bgcolor: canProceedStep2 ? "#30410D" : "#ccc",
                      color: "#fff",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": { bgcolor: canProceedStep2 ? "#70873F" : "#ccc" },
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 3: Type-specific */}
          {step === 3 && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (canProceedStep3) setStep(4);
              }}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {step3Header.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                {step3Header.subtitle}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {renderStep3Form()}
              </Box>

              {/* Inclusions Field */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Add Inclusions
                </Typography>

                {/* Input + Add button */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    width: "90%",
                    mb: 2,
                  }}
                >
                  <input
                    type="text"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInclusion())}
                    placeholder="Add Inclusions"
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                  <IconButton size="small" onClick={handleAddInclusion}>
                    <AddIcon sx={{ color: "gray" }} />
                  </IconButton>
                </Box>

                {/* Show inclusions dynamically */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {getCurrentInclusions().map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        border: "1px dashed #999",
                        borderRadius: "12px",
                        px: 1.5,
                        py: 0.5,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      <Typography sx={{ mr: 1 }}>{item}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveInclusion(item)}
                        sx={{ p: 0.2 }}
                      >
                        <CloseIcon sx={{ fontSize: "1rem", color: "gray" }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/*Adding Rules*/}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Add Rules
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    width: "90%",
                    mb: 2,
                  }}
                >
                  <input
                    type="text"
                    value={newRules}
                    onChange={(e) => setRules(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRule())}
                    placeholder="Add Rules"
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                  <IconButton size="small" onClick={handleAddRule}>
                    <AddIcon sx={{ color: "gray" }} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {getCurrentRules().map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        border: "1px dashed #999",
                        borderRadius: "12px",
                        px: 1.5,
                        py: 0.5,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      <Typography sx={{ mr: 1 }}>{item}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRule(item)}
                        sx={{ p: 0.2 }}
                      >
                        <CloseIcon sx={{ fontSize: "1rem", color: "gray" }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
                <Button
                  variant="text"
                  sx={{ textTransform: "none", color: "#30410D", fontWeight: 600 }}
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!canProceedStep3}
                    sx={{
                      borderRadius: 2,
                      bgcolor: canProceedStep3 ? "#30410D" : "#ccc",
                      color: "#fff",
                      px: 3,
                      "&:hover": { bgcolor: canProceedStep3 ? "#70873F" : "#ccc" },
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Booking Availability
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                Select the date range your {listingType || "listing"} is available for booking.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  "& .react-calendar": {
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    fontFamily: "inherit",
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
                {availabilityRange && availabilityRange.length === 2 ? (
                  <Typography sx={{ color: "#70873F" }}>
                    {`${availabilityRange[0].toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} → ${availabilityRange[1].toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No range selected yet.
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
                <Button
                  variant="text"
                  sx={{ textTransform: "none", color: "#30410D", fontWeight: 600 }}
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>

                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Save as Draft Button */}
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#30410D",
                      color: "#30410D",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": { bgcolor: "rgba(112,135,63,0.1)" },
                    }}
                    onClick={() => handleSubmitListing(true)} // pass true for draft
                  >
                    Save as Draft
                  </Button>
                  {/* Finish / Publish Button */}
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#30410D",
                      color: "#fff",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": { bgcolor: "#70873F" },
                    }}
                    onClick={() => handleSubmitListing(false)} // false = publish
                  >
                    Publish
                  </Button>
                </Box>
              </Box>

            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
