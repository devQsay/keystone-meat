// client/src/components/Login.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import axios from "axios";

function Login({ setUser }) {
  // Receive setUser to update authentication state
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Send login request to your backend API
      const response = await axios.post("/api/auth/login", data);

      // Handle successful login
      setUser(response.data.user); // Update user state with the received user object
      // You might want to redirect to the dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      // Handle login errors (e.g., display error message)
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Username"
            {...register("username", { required: true })} // Register input with validation
            error={!!errors.username}
            helperText={errors.username ? "Username is required" : null}
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            type="password"
            {...register("password", { required: true })}
            error={!!errors.password}
            helperText={errors.password ? "Password is required" : null}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
