import React from "react";
import { Box, Typography, Card, CardContent, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ProfileMenu from './ProfileMenu';
import { auth, db } from '../firebase';
import { collection, query, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';

export default function DashboardHost({ onProfileSettingsClick }) {

  const [userEmail, setUserEmail] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [notificationsCount, setNotificationsCount] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        loadNotifications(user.uid);
      } else {
        setUserEmail('');
        setNotifications([]);
        setNotificationsCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load notifications from Firestore
  const loadNotifications = async (userId) => {
    try {
      console.log('🔍 Loading notifications for host:', userId);
      const notificationsRef = collection(db, "users", userId, "notifications");
      
      let querySnapshot;
      try {
        const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));
        querySnapshot = await getDocs(q);
      } catch (orderError) {
        console.warn('⚠️ orderBy failed, trying without:', orderError.message);
        const q = query(notificationsRef, limit(10));
        querySnapshot = await getDocs(q);
      }
      
      const notificationsList = [];
      querySnapshot.forEach((doc) => {
        notificationsList.push({ id: doc.id, ...doc.data() });
      });
      
      notificationsList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      
      setNotifications(notificationsList);
      const unreadCount = notificationsList.filter(n => !n.read).length;
      setNotificationsCount(unreadCount);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      const user = auth.currentUser;
      if (user && !notification.read) {
        const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
        await loadNotifications(user.uid);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Refresh notifications
  const handleRefreshNotifications = () => {
    const user = auth.currentUser;
    if (user) {
      loadNotifications(user.uid);
    }
  };

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
          Dashboard
        </Typography>

        {/* Profile area (responsive) */}
        {userEmail && (
          <ProfileMenu
            userEmail={isMobile ? null : userEmail} // hide email on mobile
            onProfileSettingsClick={onProfileSettingsClick}
            notifications={notifications}
            notificationsCount={notificationsCount}
            onNotificationClick={handleNotificationClick}
            onRefreshNotifications={handleRefreshNotifications}
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
