import { Box, CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./components/Header";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import theme from "./styles/theme";

import {
  Animals,
  Dashboard,
  Login,
  Customers,
  Inventory,
  Orders,
  Reports,
  Settings,
} from "./pages";

import { AuthProvider } from "./context";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Box sx={{ display: "flex" }}>
            {" "}
            {/* Main container is flex for horizontal layout */}
            <CssBaseline />
            {/* Sidebar in its own flex item */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Header toggleSidebar={toggleSidebar} />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/animals" element={<Animals />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/login" replace />} />{" "}
                  {/* Redirect to login for unknown routes */}
                </Routes>
              </Box>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
