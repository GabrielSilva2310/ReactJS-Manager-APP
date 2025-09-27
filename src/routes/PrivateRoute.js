import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid /*, removeAuthData*/ } from "services/auth";

export default function PrivateRoute({ children }) {
  const location = useLocation();

  if (!isTokenValid(30)) {
    // opcional: limpar token antigo
    // removeAuthData();
    return (
      <Navigate
        to="/authentication/sign-in"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
