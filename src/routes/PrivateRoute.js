import { Navigate } from "react-router-dom";
import { getAuthData } from "../services/auth";

export function PrivateRoute({ children }) {
  const token = getAuthData();
  return token ? children : <Navigate to="/login" />;
}
