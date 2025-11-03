import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ListingCardGuest from './ListingCardGuest';
import NavbarGuest from './NavbarGuest';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
    
    // Listen for storage changes (when favorites are updated in other components)
    const handleStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates on focus (when user comes back to this tab)
    window.addEventListener('focus', loadFavorites);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadFavorites);
    };
  }, []);

  const loadFavorites = () => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffff' }}>
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
        {favorites.length > 0 ? (
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
    </Box>
  );
}
