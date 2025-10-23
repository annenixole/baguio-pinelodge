import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { collection, getDocs, doc, deleteDoc, onSnapshot } from "firebase/firestore"; // ✅ Added onSnapshot
import { db, auth } from "../firebase";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import EditListing from "./EditListing";

export default function ListingGrid({ filter, setFilter, setSelectedIndex }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewingListing, setViewingListing] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // 🔹 Real-time Firestore listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const types = ["accommodations", "services", "experiences"];
      const unsubscribers = [];

      setLoading(true);

      types.forEach((type) => {
        const colRef = collection(db, "users", user.email, type);
        const unsubscribeCol = onSnapshot(colRef, (snapshot) => {
          const updated = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            type: type.slice(0, -1),
            ...docItem.data(),
          }));

          // ✅ Merge all listing types together
          setListings((prev) => {
            const others = prev.filter((l) => l.type !== type.slice(0, -1));
            return [...others, ...updated];
          });

          setLoading(false);
        });

        unsubscribers.push(unsubscribeCol);
      });

      return () => unsubscribers.forEach((u) => u());
    });

    return () => unsubscribeAuth();
  }, []);

  // 🔹 Delete a listing
  const handleDeleteListing = async (listing) => {
    const confirm = window.confirm(`Are you sure you want to delete "${listing.title}"?`);
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.email, `${listing.type}s`, listing.id));
      alert("Listing deleted successfully!");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    }
  };

  // 🔹 Edit + View handlers
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

  // 🔹 Apply filter
  const filteredListings =
    filter === "all" ? listings : listings.filter((l) => l.type === filter);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9ff" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {filter === "all"
          ? "All Listings"
          : filter.charAt(0).toUpperCase() + filter.slice(1) + " Listings"}
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

      {/* 🔹 Edit Modal */}
      <EditListing
        open={editOpen}
        onClose={() => setEditOpen(false)}
        listing={editingListing}
        onUpdated={() => {
          setEditOpen(false);
        }}
      />

      {/* 🔹 View Modal */}
      <ListingModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        listing={viewingListing}
      />
    </Box>
  );
}
