"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { TopNavbar } from "@/components/navigation/top-navbar";

export function ErpShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(true);

  function handleNavigationAction() {
    if (desktop) {
      setDesktopCollapsed((collapsed) => !collapsed);
      return;
    }
    setMobileOpen(true);
  }

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: "background.default" }}>
      <Box
        component="a"
        href="#contenido-principal"
        sx={{
          position: "fixed",
          zIndex: 2000,
          top: 10,
          left: 10,
          px: 2,
          py: 1,
          color: "#FFFFFF",
          backgroundColor: "primary.dark",
          borderRadius: 0,
          textDecoration: "none",
          transform: "translateY(-160%)",
          transition: "transform 160ms ease",
          "&:focus": { transform: "translateY(0)" },
        }}
      >
        Ir al contenido
      </Box>
      <TopNavbar
        navigationExpanded={desktop ? !desktopCollapsed : mobileOpen}
        onNavigationAction={handleNavigationAction}
      />
      <Box sx={{ display: "flex", minHeight: "100dvh", pt: "54px" }}>
        <SidebarNavigation
          collapsed={desktopCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <Box
          id="contenido-principal"
          component="main"
          tabIndex={-1}
          sx={{
            minWidth: 0,
            minHeight: "calc(100dvh - 54px)",
            flex: 1,
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
