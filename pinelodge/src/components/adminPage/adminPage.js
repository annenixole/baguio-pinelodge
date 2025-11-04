import * as React from 'react';
import { Box, Typography } from "@mui/material";
import SidebarAdmin from "./SidebarAdmin";

export default function AdminPage() {
  const [selectedIndex, setSelectedIndex] = React.useState(() => {
    const savedIndex = localStorage.getItem("adminSelectedIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem("adminSelectedIndex", selectedIndex);
  }, [selectedIndex]);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <DashboardAdmin />;
      case 1:
        return <UsersManagement />;
      case 2:
        return <ListingsManagement />;
      case 3:
        return <Verifications />;
      case 4:
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <SidebarAdmin
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
          backgroundColor: "#f9f9f9",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

// Placeholder components for each section
function DashboardAdmin() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Typography color="text.secondary">
        Overview and analytics will be displayed here
      </Typography>
    </Box>
  );
}

function UsersManagement() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: 2 }}>
        Users Management
      </Typography>
      <Typography color="text.secondary">
        Manage all users (hosts and guests)
      </Typography>
    </Box>
  );
}

function ListingsManagement() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: 2 }}>
        Listings Management
      </Typography>
      <Typography color="text.secondary">
        View and moderate all listings
      </Typography>
    </Box>
  );
}

function Verifications() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: 2 }}>
        Verifications
      </Typography>
      <Typography color="text.secondary">
        Verify host accounts and listings
      </Typography>
    </Box>
  );
}

function Reports() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#30410D', mb: 2 }}>
        Reports & Analytics
      </Typography>
      <Typography color="text.secondary">
        View system reports and analytics
      </Typography>
    </Box>
  );
}
