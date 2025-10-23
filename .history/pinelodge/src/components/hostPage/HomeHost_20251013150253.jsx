import * as React from 'react';
import { Box } from "@mui/material";
import SidebarHost from "./SidebarHost";
import ListingHost from './ListingHost';
import PaymentHost from './PaymentHost';
import DashboardHost from './DashboardHost';

export default function HomeHost() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <DashboardHost />;
      case 1:
        return <ListingHost />;
      case 2:
        return <PaymentHost />;  
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
