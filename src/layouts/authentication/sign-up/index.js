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

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "../components/BasicLayout";
import { Divider } from "@mui/material";

function SignUp() {
  return (
    <BasicLayout>
      <Card sx={{ p: 4, borderRadius: "16px", boxShadow: 4, maxWidth: 400, width: "100%" }}>
        <MDBox textAlign="center" mb={3}>
          <MDTypography variant="h4" fontWeight="bold" color="info">
            Crie sua conta no ManagerApp
          </MDTypography>
        </MDBox>
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
           >
          Continuar com Google
        </MDButton>
         <MDBox display="flex" alignItems="center" my={2}>
          <Divider sx={{ flex: 1 }} />
          <MDTypography variant="button" color="text" mx={2}>
            ou cadastre-se com email
          </MDTypography>
          <Divider sx={{ flex: 1 }} />
        </MDBox>
        <MDBox component="form" role="form">
          <MDBox mb={2}>
            <MDInput type="text" label="Nome" fullWidth />
          </MDBox>
          <MDBox mb={2}>
            <MDInput type="email" label="Email" fullWidth />
          </MDBox>
          <MDBox mb={2}>
            <MDInput type="password" label="Senha" fullWidth />
          </MDBox>
          <MDBox mt={3} mb={1}>
            <MDButton variant="gradient" color="info" fullWidth>
              CADASTRAR
            </MDButton>
          </MDBox>

          <MDBox mt={3} textAlign="center">
            <MDTypography variant="button" color="text">
              Já tem uma conta?{" "}
              <MDTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="info"
                fontWeight="medium"
              >
                Entrar
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default SignUp;