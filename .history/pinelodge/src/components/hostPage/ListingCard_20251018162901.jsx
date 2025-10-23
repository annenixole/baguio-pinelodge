import React from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import EditListing from "./EditListing";
import ListingModal from "./ListingModal";

export default function ListingGrid({
  filter,
  setFilter,
  listings,
  setListings,
  refreshListings,
  setSelectedIndex,
}) {
  const [editingListing, setEditingListing] = React.useState(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewingListing, setViewingListing] = React.useState(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDeleteListing = async (listing) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${listing.title}"?`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteDoc(
        doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id)
      );
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      alert("Listing deleted successfully!");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setEditOpen(true);
  };

  const handleViewListing = (listing) => {
    setViewingListing(listing);
    setViewOpen(true);
  };

  // 🧩 Filtered listings
  const filteredListings =
    filter === "all"
      ? listings
      : listings.filter((listing) => listing.type === filter);

  // 🌀 Loading state (for delete or first render)
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

  // 🚫 Empty listings state
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

  // ✅ Render grid
  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9ff" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {filter === "all"
          ? "All Listings"
          : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Listings`}
      </Typography>

      <Grid container spacing={3}>
        {filteredListings.map((listing) => (
          <Grid item key={listing.id} xs={12} sm={6} md={4}>
            <ListingCard
              listing={listing}
              onEdit={handleEditListing}
              onDelete={handleDeleteListing}
              onView={handleViewListing}
            />
          </Grid>
        ))}
      </Grid>

      {/* Edit Modal */}
      <EditListing
        open={editOpen}
        onClose={() => setEditOpen(false)}
        listing={editingListing}
        onUpdated={async () => {
          await refreshListings();
          setSelectedIndex(1);
        }}
      />

      {/* View Modal */}
      <ListingModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        listing={viewingListing}
      />
    </Box>
  );
}
