import * as React from 'react';
import { Box } from "@mui/material";
import SidebarHost from "./SidebarHost";
import ListingHost from './ListingHost';
import PaymentHost from './PaymentHost';
import DashboardHost from './DashboardHost';
import ProfileSettings from './ProfileSettings';
import ManageBookings from './ManageBookings';

export default function HomeHost() {
  const [selectedIndex, setSelectedIndex] = React.useState(() => {
  const savedIndex = localStorage.getItem("selectedIndex");
  return savedIndex ? parseInt(savedIndex) : 0;
});

React.useEffect(() => {
  localStorage.setItem("selectedIndex", selectedIndex);
}, [selectedIndex]);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <DashboardHost onProfileSettingsClick={() => setSelectedIndex(4)} />;
      case 1:
           return <ListingHost onProfileSettingsClick={() => setSelectedIndex(4)} />;
      case 2:
        return <ManageBookings onProfileSettingsClick={() => setSelectedIndex(4)} />;
      case 3:
        return <PaymentHost onProfileSettingsClick={() => setSelectedIndex(4)} />;  
      case 4:
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <SidebarHost
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: { sm: "240px" },
          overflowY: "auto",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
