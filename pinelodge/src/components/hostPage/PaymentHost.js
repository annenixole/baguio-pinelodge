import React from "react";
import { Box, Typography, Card, CardContent, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ProfileMenu from './ProfileMenu';
import { auth } from '../firebase';

export default function PaymentHost({ onProfileSettingsClick }) {

  const [userEmail, setUserEmail] = React.useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Payment
        </Typography>

        {/* Profile area (responsive) */}
        {userEmail && (
          <ProfileMenu
            userEmail={isMobile ? null : userEmail} // hide email on mobile
            onProfileSettingsClick={onProfileSettingsClick}
          />
        )}
      </Box>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your property listings here.
      </Typography>

      <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6">Your Active Properties</Typography>
          <Typography>8 properties currently listed.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
