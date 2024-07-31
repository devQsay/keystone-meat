// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ user, redirectPath = "/login" }) => {
  const location = useLocation();

  if (!user) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the children (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
