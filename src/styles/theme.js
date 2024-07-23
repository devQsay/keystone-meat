import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5D4239", // Rich brown for a classic butcher shop feel
      light: "#8B6559", // Lighter brown for accents
      dark: "#3E2C26", // Darker brown for contrast
    },
    secondary: {
      main: "#A98C8D", // Deep red for highlighting meats
      light: "#D6B1B2", // Lighter red for subtler accents
    },
    background: {
      default: "#F2F2F2", // Light neutral background for readability
      paper: "#FFFFFF", // White for content areas
    },
    text: {
      primary: "#333333", // Dark gray for body text
      secondary: "#666666", // Medium gray for secondary text
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontFamily: "Lora, serif",
      fontSize: "2rem",
      fontWeight: 700, // 700 worked here.
    },
    h2: {
      fontFamily: "Lora, serif", // Lora for secondary headers
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h3: {
      // ... other header styles (using Roboto or other fonts)
    },
    body1: {
      fontFamily: "Lora, serif",

      fontSize: "1rem",
    },
    body2: {
      // ... other body text styles
    },
    // Add more typography variants as needed
  },

  components: {
    // ... your component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "4px", // Slightly rounded corners for a softer look
        },
      },
    },
  },
});

export default theme;
