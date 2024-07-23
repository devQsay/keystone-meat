import * as React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // For a menu button (optional)
import KeystoneLogo from "../assets/Keystone-Basic.png";

function Header({ toggleSidebar }) {
  // Receive the toggleSidebar prop

  return (
    <AppBar
      position="static"
      className="header tk-nougat-script"
      sx={{
        color: "white",
        fontWeight: 800,
        fontStyle: "normal",
      }}
    >
      <Toolbar>
        {/* Menu button to toggle sidebar */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar} // Call the toggleSidebar prop when clicked
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <img
          src={KeystoneLogo}
          alt="Keystone SCM Logo"
          style={{ height: "40px", marginRight: "16px", color: "#F2F2F2" }}
        />

        {/* Title (optional) */}
        <Typography variant="h1" sx={{ flexGrow: 1 }}>
          Keystone SCM
        </Typography>

        {/* Other buttons/actions */}
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
