import * as React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from "react-router-dom";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    navigate(path);
    toggleSidebar(); // Close the sidebar after clicking an item
  };
  return (
    <Drawer anchor="left" open={isOpen} onClose={toggleSidebar}>
      <Box sx={{ width: 250, padding: 2 }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>Keystone SCM</Typography>
        <Divider />
        <List>
          <ListItem button onClick={() => handleItemClick('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/animals')}>
            <ListItemIcon>
              <InventoryIcon /> 
            </ListItemIcon>
            <ListItemText primary="Animals" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/customers')}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Customers" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/orders')}>
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/inventory')}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Inventory" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/reports')}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/settings')}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
