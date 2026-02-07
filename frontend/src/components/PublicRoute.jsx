import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

/**
 * PublicRoute - Wrapper for routes that should redirect authenticated users
 * (e.g., login/signup pages should redirect to dashboard if already logged in)
 */
export default function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
