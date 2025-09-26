/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useContext, useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import { AuthContext } from "contexts/AuthContext";

function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);


   // 🔧 estados controlados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔧 estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔧 navegação e contexto de auth
  const navigate = useNavigate();
  const { signIn } = useContext(AuthContext);

  // 🔧 submit do formulário
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password); // chama login -> salva token -> chama /me
      // Se quiser usar "lembrar-me" pra persistir em localStorage vs sessionStorage,
      // depois te mostro como ajustar o auth.js pra respeitar esse flag.
      navigate("/dashboard");
    } catch (err) {
      setError("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ boxShadow: 6, borderRadius: "16px", p: 2 }}>
        <MDBox textAlign="center" mt={2} mb={3}>
          <MDTypography variant="h4" fontWeight="bold" color="info">
            Bem-vindo ao ManagerApp
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDButton
          variant="outlined"
          fullWidth
          sx={{
             mb: 2,
             textTransform: "none",
             justifyContent: "center",
             borderColor: "#ccc",
             color: "#555",
             "&:hover": { backgroundColor: "#f5f5f5" },
           }}
           startIcon={
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: 20, height: 20 }}
             />
            }
             // onClick={() => ... auth com Google no futuro }
            type="button"
          >
            Continuar com Google
          </MDButton>
            <MDBox mb={2}>
              <MDInput 
              type="email" 
              label="Email" 
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required/>
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
               type="password"
               label="Senha"
               fullWidth
               value={password}
               onChange={(e) => setPassword(e.target.value)} 
               autoComplete="current-password"
               required/>
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Lembrar-me
              </MDTypography>
            </MDBox>

            {/* 🔧 mensagem de erro (opcional) */}
            {error && (
              <MDBox mt={2}>
                <MDTypography variant="button" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton
              type="submit" 
              variant="gradient" 
              color="info" 
              fullWidth
              disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}  
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Não tem uma conta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Cadastre-se
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default SignIn;
