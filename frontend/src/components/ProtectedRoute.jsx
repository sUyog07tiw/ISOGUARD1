import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * Redirects to login if user is not authenticated, preserving the intended destination
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const authed = isAuthenticated();
  // Debug: log auth state and token presence
  // (remove or comment out in production)
  try {
    // eslint-disable-next-line no-console
    console.debug('ProtectedRoute - isAuthenticated:', authed, 'access_token:', localStorage.getItem('access_token'));
  } catch (e) {}

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
