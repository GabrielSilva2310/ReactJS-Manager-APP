import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";

export default function Logout() {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    signOut();
    navigate("/authentication/sign-in", { replace: true });
  }, [signOut, navigate]);

  return null; 
}
