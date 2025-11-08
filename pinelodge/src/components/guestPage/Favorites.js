import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, IconButton, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collectionGroup, getDocs } from 'firebase/firestore';
import ListingCardGuest from './ListingCardGuest';
import NavbarGuest from './NavbarGuest';
import Footer from '../Footer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
    
    // Listen for favorites updates from ListingCardGuest
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.log("No user signed in");
        setFavorites([]);
        setLoading(false);
        return;
      }

      console.log("Loading favorites for user:", user.uid);

      // Get user's favorite IDs from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log("User document not found");
        setFavorites([]);
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const favoriteIds = userData.favorites || [];

      console.log("Favorite IDs from Firestore:", favoriteIds);

      if (favoriteIds.length === 0) {
        console.log("No favorites found");
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch all favorite listings from all listing types using collectionGroup
      const allListings = [];
      
      // Fetch accommodations from all users using collectionGroup
      const accommodationsGroup = collectionGroup(db, "accommodations");
      const accomSnapshot = await getDocs(accommodationsGroup);
      accomSnapshot.forEach((doc) => {
        if (favoriteIds.includes(doc.id)) {
          const pathSegments = doc.ref.path.split('/');
          const hostEmail = pathSegments[1]; // users/{hostEmail}/accommodations/{id}
          console.log("Found favorite accommodation:", doc.id);
          allListings.push({ 
            id: doc.id, 
            hostEmail, 
            ...doc.data(), 
            type: 'Accommodation' 
          });
        }
      });

      // Fetch experiences from all users using collectionGroup
      const experiencesGroup = collectionGroup(db, "experiences");
      const expSnapshot = await getDocs(experiencesGroup);
      expSnapshot.forEach((doc) => {
        if (favoriteIds.includes(doc.id)) {
          const pathSegments = doc.ref.path.split('/');
          const hostEmail = pathSegments[1]; // users/{hostEmail}/experiences/{id}
          console.log("Found favorite experience:", doc.id);
          allListings.push({ 
            id: doc.id, 
            hostEmail, 
            ...doc.data(), 
            type: 'Experience' 
          });
        }
      });

      // Fetch services from all users using collectionGroup
      const servicesGroup = collectionGroup(db, "services");
      const servSnapshot = await getDocs(servicesGroup);
      servSnapshot.forEach((doc) => {
        if (favoriteIds.includes(doc.id)) {
          const pathSegments = doc.ref.path.split('/');
          const hostEmail = pathSegments[1]; // users/{hostEmail}/services/{id}
          console.log("Found favorite service:", doc.id);
          allListings.push({ 
            id: doc.id, 
            hostEmail, 
            ...doc.data(), 
            type: 'Service' 
          });
        }
      });

      console.log("Total favorites loaded:", allListings.length);
      setFavorites(allListings);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewListing = (listing) => {
    navigate('/BookingPage', { state: { listing } });
  };

  // Calculate pagination
  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fffdf3ff' }}>
      {/* Navbar */}
      <NavbarGuest />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/guestPage/GuestPage')}
              sx={{
                color: '#30410D',
                '&:hover': { backgroundColor: '#dceeb46c' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1C1C1C',
                fontSize: { xs: '24px', md: '32px' },
              }}
            >
              My Favorites
            </Typography>
          </Box>
          
          {favorites.length > 0 && (
            <Typography
              variant="body1"
              sx={{
                color: '#6B6B6B',
                fontSize: '16px',
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
          )}
        </Box>

        {/* Favorites Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#30410D' }} />
          </Box>
        ) : favorites.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {currentFavorites.map((listing) => (
                <Grid item key={listing.id} xs={12} sm={6} md={4}>
                  <ListingCardGuest
                    listing={listing}
                    onView={handleViewListing}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  sx={{
                    color: '#30410D',
                    borderColor: '#30410D',
                    '&:hover': { borderColor: '#70873F', backgroundColor: '#dceeb46c' },
                    '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#999' }
                  }}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "contained" : "outlined"}
                    onClick={() => setCurrentPage(index + 1)}
                    sx={{
                      minWidth: '40px',
                      color: currentPage === index + 1 ? '#fff' : '#30410D',
                      backgroundColor: currentPage === index + 1 ? '#30410D' : 'transparent',
                      borderColor: '#30410D',
                      '&:hover': {
                        backgroundColor: currentPage === index + 1 ? '#70873F' : '#dceeb46c',
                        borderColor: '#70873F'
                      }
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  sx={{
                    color: '#30410D',
                    borderColor: '#30410D',
                    '&:hover': { borderColor: '#70873F', backgroundColor: '#dceeb46c' },
                    '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#999' }
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Empty State
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
            }}
          >
            <FavoriteBorderIcon 
              sx={{ 
                fontSize: 120, 
                color: '#e0e0e0',
                mb: 3,
              }} 
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#666',
                mb: 2,
              }}
            >
              No Favorites Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#999',
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Start exploring amazing accommodations, services, and experiences in Baguio City. Click the heart icon on any listing to save it here!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/guestPage/GuestPage')}
              sx={{
                backgroundColor: '#30410D',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#70873F' },
              }}
            >
              Explore Listings
            </Button>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
