"use client";

import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Brand } from "@/components/brand/brand";

const utilityButtonStyles = {
  width: 44,
  height: 44,
  borderRadius: 0,
  color: "#676A6C",
  "&:hover": { color: "#1C84C6", backgroundColor: "#ECEEEF" },
} as const;

export function TopNavbar({
  navigationExpanded,
  onNavigationAction,
}: {
  navigationExpanded: boolean;
  onNavigationAction: () => void;
}) {
  return (
    <AppBar component="header" position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.appBar, color: "#676A6C", backgroundColor: "#F5F5F5", borderBottom: "1px solid #E7EAEC" }}>
      <Toolbar disableGutters sx={{ minHeight: "54px !important", px: 1.5 }}>
        <Tooltip title={navigationExpanded ? "Contraer navegación" : "Expandir navegación"}>
          <IconButton
            aria-label={navigationExpanded ? "Contraer navegación de módulos" : "Expandir navegación de módulos"}
            aria-expanded={navigationExpanded}
            onClick={onNavigationAction}
            sx={{ ...utilityButtonStyles, mr: 1.25 }}
          >
            <MenuRoundedIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>

        <Brand compact />
        <Box sx={{ width: "1px", height: 34, mx: 1.5, backgroundColor: "#D5D7D8" }} />
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 13, color: "#676A6C" }}>Operaciones</Typography>
        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: { xs: "none", md: "inline-flex" }, alignItems: "center", gap: 0.6, mr: 1.4, px: 1.25, py: 0.45, color: "#8F5700", backgroundColor: "#FFD08A", borderRadius: "12px" }}>
          <AccessTimeFilledRoundedIcon sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Entorno de demostración</Typography>
        </Box>

        <Tooltip title="Vista móvil">
          <IconButton aria-label="Vista móvil" sx={{ ...utilityButtonStyles, display: { xs: "none", sm: "inline-flex" } }}>
            <SmartphoneRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notificaciones">
          <IconButton aria-label="Notificaciones" sx={utilityButtonStyles}>
            <NotificationsRoundedIcon sx={{ fontSize: 21 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Perfil local">
          <IconButton aria-label="Perfil local" sx={utilityButtonStyles}>
            <PersonRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
