/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Rotas
import routes from "routes";
import PrivateRoute from "routes/PrivateRoute";

// Context do template
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Helpers de auth
import { isTokenValid } from "services/auth";

import brandLogo from "assets/images/logo.svg";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  const hideSidenav =
  pathname.startsWith("/authentication") ||
  pathname === "/" ||
  pathname.startsWith("/sign-in") ||
  pathname.startsWith("/sign-up");

  // 👉 Flag para exibir/ocultar Configurator e engrenagem
  const SHOW_CONFIGURATOR = false;

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Envolve componentes de rotas com PrivateRoute quando 'private: true'
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);

      if (route.route) {
        const element = route.private ? (
          <PrivateRoute>{route.component}</PrivateRoute>
        ) : (
          route.component
        );

        return (
          <Route
            path={route.route}
            element={element}
            key={route.key || route.route}
          />
        );
      }
      return null;
    });

  // 👉 Filtra itens do menu quando autenticado (esconde Sign In / Sign Up)
  const auth = isTokenValid();
  const menuRoutes = auth
    ? routes.filter(
        (r) =>
          r.route !== "/authentication/sign-in" &&
          r.route !== "/authentication/sign-up"
      )
    : routes;

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
       {!hideSidenav && (
  <>
    <Sidenav
      color={sidenavColor}
      brand={brandLogo}
      brandName="Manager APP"
      routes={menuRoutes}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    />
    {SHOW_CONFIGURATOR && <Configurator />}
    {SHOW_CONFIGURATOR && configsButton}
  </>
)}
        <Routes>
          {getRoutes(routes)} {/* ← todas as rotas continuam registradas */}
         <Route
  path="*"
  element={<Navigate to={auth ? "/appointments" : "/authentication/sign-in"} replace />}
/>
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {!hideSidenav && (
  <>
    <Sidenav
      color={sidenavColor}
      brand={brandLogo}
      brandName="Manager APP"
      routes={menuRoutes}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    />
    {SHOW_CONFIGURATOR && <Configurator />}
    {SHOW_CONFIGURATOR && configsButton}
  </>
)}
      <Routes>
        {getRoutes(routes)} {/* ← todas as rotas continuam registradas */}
        <Route
  path="*"
  element={<Navigate to={auth ? "/appointments" : "/authentication/sign-in"} replace />}
/>

      </Routes>
    </ThemeProvider>
  );
}
