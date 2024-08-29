// client/src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context";

const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const token = sessionStorage.getItem("token");
  const expiresAt = sessionStorage.getItem("expiresAt");

  // Check if user is logged in, token exists, AND if the token is not expired
  if (
    !user ||
    !token ||
    (expiresAt && new Date().getTime() > parseInt(expiresAt, 10))
  ) {
    // If not logged in or token expired, redirect to login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If logged in and token is valid, render the children (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
