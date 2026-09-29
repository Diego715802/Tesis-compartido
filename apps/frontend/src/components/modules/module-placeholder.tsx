import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ModuleDefinition } from "@/config/modules";

export function ModulePlaceholder({ module }: { module: ModuleDefinition }) {
  const Icon = module.icon;

  return (
    <Box sx={{ minHeight: "calc(100dvh - 54px)", backgroundColor: "#FFFFFF" }}>
      <Box sx={{ display: "flex", height: 56, alignItems: "center", gap: 1.5, px: { xs: 2, md: 2.5 }, borderBottom: "1px solid #E7EAEC", backgroundColor: "#FDFDFD" }}>
        <HelpOutlineRoundedIcon sx={{ color: "#1C84C6", fontSize: 30 }} />
        <Typography component="h1" sx={{ color: "#676A6C", fontSize: { xs: 20, md: 24 }, fontWeight: 400 }}>{module.label}</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, ml: 1.5, color: "#1C84C6", fontSize: 13 }}>Inicio</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#9A9C9D", fontSize: 13 }}>/</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#676A6C", fontSize: 13 }}>{module.label}</Typography>
      </Box>

      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 3.75 }}>
        <Box sx={{ minHeight: 300, backgroundColor: "#FDFDFD", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
          <Box sx={{ display: "flex", minHeight: 56, alignItems: "center", gap: 1, px: 2, borderBottom: "1px solid #E7EAEC" }}>
            <Icon sx={{ color: "#1C84C6", fontSize: 21 }} />
            <Typography component="h2" sx={{ color: "#4B4E51", fontSize: 16, fontWeight: 500 }}>{module.label}</Typography>
          </Box>
          <Box sx={{ display: "grid", minHeight: 244, placeItems: "center", px: 2, textAlign: "center" }}>
            <Box>
              <Typography sx={{ color: "#676A6C", fontSize: 14, fontWeight: 600 }}>Módulo en preparación</Typography>
              <Typography sx={{ maxWidth: 420, mt: 0.75, color: "#8A8C8E", fontSize: 13, lineHeight: 1.55 }}>
                La interfaz operativa de {module.label.toLocaleLowerCase("es-MX")} se integrará en esta sección.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
