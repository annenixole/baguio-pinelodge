import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return null;
  if (!user) {
    //If no user is logged in, redirect to login or landing page
    return <Navigate to="/" replace />;
  }

  //If logged in, render the protected page
  return children;
}
