import axios from "axios";
import React from "react";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context";

const API_URL = "http://localhost:3002/api/auth/login/";

function Login() {
  const navigate = useNavigate();

  const { setUser } = useAuth(); // Get the setUser function from the context

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      console.log("Login response:", response.data);

      sessionStorage.setItem("token", response.data.token); // Store token in sessionStorage

      // Calculate expiry time (3 hours from now)
      const expiresAt = new Date().getTime() + 3 * 60 * 60 * 1000;
      sessionStorage.setItem("expiresAt", expiresAt);

      setUser(response.data); // Update user state (assuming backend sends user data)
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      console.error("Login error:", error);
      console.log("Full request path:", error.config.url);

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
