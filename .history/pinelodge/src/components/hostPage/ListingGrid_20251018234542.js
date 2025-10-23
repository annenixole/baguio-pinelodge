import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import EditListing from "./EditListing";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function ListingGrid({ typeFilter, setSelectedIndex, reloadTrigger }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewingListing, setViewingListing] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("published"); // default to published

  // 🔹 Fetch listings from Firestore
  const fetchListings = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("No user found. Skipping fetch.");
        setLoading(false);
        return;
      }

      const types = ["accommodations", "services", "experiences"];
      const allListings = [];

      for (const type of types) {
        const querySnapshot = await getDocs(collection(db, "users", user.email, type));
        querySnapshot.forEach((docItem) => {
          allListings.push({
            id: docItem.id,
            type: type.slice(0, -1), // “accommodations” -> “accommodation”
            ...docItem.data(),
          });
        });
      }

      setListings(allListings);
      console.log("Fetched listings:", allListings.length);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load listings on mount & when reloadTrigger changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchListings();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [reloadTrigger]);

  // Hadle publish listing
  const handlePublishListing = async (listing) => {
  try {
    const ref = doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id);
    await updateDoc(ref, { status: "published" });
    alert("Listing published successfully!");
    fetchListings();
  } catch (err) {
    console.error("Error publishing listing:", err);
    alert("Failed to publish listing.");
  }
};

  // 🔹 Handle delete listing
  const handleDeleteListing = async (listing) => {
    const confirm = window.confirm(`Are you sure you want to delete "${listing.title}"?`);
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id));
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      alert("Listing deleted successfully!");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    }
  };

  // 🔹 Handle edit & view
  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setEditOpen(true);
  };

  const handleViewListing = (listing) => {
    setViewingListing(listing);
    setViewOpen(true);
  };

  // 🔹 Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 🔹 Empty state
  if (!listings || listings.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" color="text.secondary">
          You haven’t added any listings yet.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click “Add Listing” to create your first one.
        </Typography>
      </Box>
    );
  }

  // 🔹 Combined Filtering Logic
  const filteredListings = listings.filter((listing) => {
    const matchesType = typeFilter === "all" ? true : listing.type === typeFilter;
    const matchesStatus = listing.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // 🔹 Render listings
  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9ff" }}>
      {/* Header: Title + Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {typeFilter === "all"
            ? "All Listings"
            : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + "s"}
        </Typography>

        {/* 🟧 Published / Drafts Toggle */}
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(e, newValue) => {
            if (newValue) setStatusFilter(newValue);
          }}
          sx={{
            backgroundColor: "#f4f4f4",
            borderRadius: "20px",
            padding: "3px",
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
              border: "none",
              borderRadius: "18px",
              px: 2.5,
              py: 0.8,
              color: "#555",
              "&.Mui-selected": {
                backgroundColor: "#de7001",
                color: "#fff",
                "&:hover": { backgroundColor: "#c76100" },
              },
              "&:not(.Mui-selected):hover": {
                backgroundColor: "transparent",
              },
            },
          }}
        >
          <ToggleButton value="published">Published</ToggleButton>
          <ToggleButton value="draft">Drafts</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No {statusFilter} listings found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredListings.map((listing) => (
            <Grid item key={listing.id} xs={12} sm={6} md={4}>
              <ListingCard
                listing={listing}
                onEdit={handleEditListing}
                onDelete={handleDeleteListing}
                onView={handleViewListing}
                onPublish={handlePublishListing}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modals */}
      <EditListing
        open={editOpen}
        onClose={() => setEditOpen(false)}
        listing={editingListing}
        onUpdated={async () => {
          await fetchListings(); // refresh instantly
        }}
      />
      <ListingModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        listing={viewingListing}
      />
    </Box>
  );
}
