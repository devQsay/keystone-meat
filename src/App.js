import { Box, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./components/Header";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import theme from "./styles/theme";

import {
  Animals,
  Dashboard,
  Customers,
  Inventory,
  Orders,
  Reports,
  Settings,
} from "./pages";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CssBaseline /> {/* Normalize styles for different browsers */}
          <Header toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {" "}
            {/* Main content area with flexGrow */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
