"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Brand } from "@/components/brand/brand";
import { modules } from "@/config/modules";
import { useEffect, useState } from "react";

export const SIDEBAR_COLLAPSED_WIDTH = 75;
export const SIDEBAR_EXPANDED_WIDTH = 238;

type SidebarNavigationProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const billingItems = [
  { hash: "borradores", label: "Borradores", icon: EditNoteRoundedIcon },
  { hash: "emitidas", label: "Emitidas", icon: ReceiptLongOutlinedIcon },
  { hash: "notas", label: "Notas de crédito", icon: ArticleOutlinedIcon },
  { hash: "pagos", label: "Pagos", icon: AttachMoneyRoundedIcon },
  { hash: "promesas", label: "Promesas de pago", icon: PaidOutlinedIcon },
  { hash: "comprobantes", label: "Comprobantes de Pago", icon: PictureAsPdfOutlinedIcon },
  { hash: "arqueos", label: "Arqueos de caja", icon: PointOfSaleOutlinedIcon },
] as const;

function NavigationContent({
  collapsed = false,
  mobile = false,
  onCloseMobile,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const showLabels = mobile || !collapsed;
  const [billingOpen, setBillingOpen] = useState(pathname === "/facturacion" || pathname.startsWith("/facturacion/"));
  const [billingHash, setBillingHash] = useState("borradores");

  useEffect(() => {
    const syncHash = () => setBillingHash(window.location.hash.replace("#", "") || "borradores");
    const frame = window.requestAnimationFrame(() => {
      if (pathname === "/facturacion" || pathname.startsWith("/facturacion/")) setBillingOpen(true);
      syncHash();
    });
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: "column", backgroundColor: "#FDFDFD" }}>
      {mobile && (
        <Box sx={{ display: "flex", minHeight: 54, alignItems: "center", justifyContent: "space-between", px: 1.5, borderBottom: "1px solid #E7EAEC" }}>
          <Brand compact />
          <IconButton aria-label="Cerrar navegación" onClick={onCloseMobile} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      )}

      {!mobile && (
        <Box sx={{ minHeight: 48, px: showLabels ? 2 : 1, pt: 2, pb: 1, overflow: "hidden", borderBottom: "1px solid #E7EAEC", transition: "padding 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <Typography aria-hidden={!showLabels} sx={{ width: showLabels ? "auto" : 0, opacity: showLabels ? 1 : 0, transform: showLabels ? "translateX(0)" : "translateX(-10px)", color: "#8A8C8E", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", transition: "opacity 150ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
            Módulos
          </Typography>
        </Box>
      )}

      <Box
        component="nav"
        aria-label="Módulos del ERP"
        sx={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", overflowY: "auto", overflowX: "hidden", py: mobile ? 1 : 0.75, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      >
        {modules.map((module) => {
          const isActive = pathname === module.href || (module.slug === "facturacion" && pathname.startsWith("/facturacion/"));
          const Icon = module.icon;

          return (
            <Box key={module.slug}>
              <Tooltip title={showLabels ? "" : module.label} placement="right" enterDelay={250}>
                <Box
                component={Link}
                href={module.href}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => {
                  if (module.slug === "facturacion" && pathname.startsWith("/facturacion")) {
                    event.preventDefault();
                    setBillingOpen((open) => !open);
                    return;
                  }
                  if (mobile) onCloseMobile?.();
                }}
                sx={{
                  position: "relative",
                  display: "flex",
                  minHeight: mobile ? 48 : 46,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1.25,
                  px: showLabels ? 2 : "25px",
                  color: isActive ? "#1C84C6" : "#676A6C",
                  backgroundColor: isActive ? "#F0F2F3" : "transparent",
                  borderLeft: isActive ? "3px solid #1C84C6" : "3px solid transparent",
                  textDecoration: "none",
                  transition: "color 140ms ease, background-color 140ms ease, padding 220ms cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": { color: "#1C84C6", backgroundColor: "#F3F5F6" },
                  "&:focus-visible": { outlineOffset: -3 },
                }}
              >
                <Icon sx={{ flex: "0 0 auto", fontSize: mobile ? 21 : 20 }} />
                <Box sx={{ minWidth: 0, maxWidth: showLabels ? 160 : 0, flex: 1, overflow: "hidden", opacity: showLabels ? 1 : 0, transform: showLabels ? "translateX(0)" : "translateX(-8px)", transition: "max-width 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
                  <Typography aria-hidden={!showLabels} sx={{ overflow: "hidden", fontSize: 13, fontWeight: isActive ? 650 : 500, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {module.label}
                  </Typography>
                </Box>
                {module.slug === "facturacion" && showLabels && <ExpandMoreRoundedIcon sx={{ ml: "auto", fontSize: 18, transform: billingOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 180ms ease" }} />}
                </Box>
              </Tooltip>
              {module.slug === "facturacion" && (
                <Box sx={{ display: "grid", gridTemplateRows: billingOpen ? "1fr" : "0fr", transition: "grid-template-rows 240ms cubic-bezier(0.16,1,0.3,1)" }}>
                  <Box sx={{ minHeight: 0, overflow: "hidden" }}>
                    {billingItems.map((item) => {
                      const SubIcon = item.icon;
                      const subActive = pathname === `/facturacion/${item.hash}` || (pathname === "/facturacion" && billingHash === item.hash);
                      return <Tooltip key={item.hash} title={showLabels ? "" : item.label} placement="right" enterDelay={250}><Box component={Link} href={`/facturacion/${item.hash}`} onClick={mobile ? onCloseMobile : undefined} sx={{ display: "flex", minHeight: 38, alignItems: "center", justifyContent: showLabels ? "flex-start" : "center", gap: 1, pl: showLabels ? 4.2 : 0, pr: showLabels ? 1.4 : 0, color: subActive ? "#1C84C6" : "#6F7376", backgroundColor: subActive ? "#F0F2F3" : "transparent", textDecoration: "none", transition: "color 140ms ease, background-color 140ms ease", "&:hover": { color: "#1C84C6", backgroundColor: "#F3F5F6" } }}><SubIcon sx={{ flex: "0 0 auto", fontSize: 16 }} /><Typography aria-hidden={!showLabels} sx={{ maxWidth: showLabels ? 160 : 0, overflow: "hidden", fontSize: 11.5, fontWeight: subActive ? 700 : 500, textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: showLabels ? 1 : 0, transition: "max-width 220ms ease, opacity 140ms ease" }}>{item.label}</Typography></Box></Tooltip>;
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {mobile && (
        <Box sx={{ display: "flex", minHeight: 42, alignItems: "center", justifyContent: "center", borderTop: "1px solid #E7EAEC", color: "#8A8C8E" }}>
          <Typography sx={{ fontSize: 12 }}>Modo de interfaz</Typography>
        </Box>
      )}
    </Box>
  );
}

export function SidebarNavigation({ collapsed, mobileOpen, onCloseMobile }: SidebarNavigationProps) {
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <>
      <Box
        component="aside"
        aria-label={collapsed ? "Navegación compacta" : "Navegación expandida"}
        sx={{
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 54,
          width: desktopWidth,
          minWidth: desktopWidth,
          height: "calc(100dvh - 54px)",
          alignSelf: "flex-start",
          flex: "0 0 auto",
          borderRight: "1px solid #E7EAEC",
          transition: "width 260ms cubic-bezier(0.16, 1, 0.3, 1), min-width 260ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "width",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <NavigationContent collapsed={collapsed} />
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: { sx: { width: "min(280px, calc(100vw - 28px))", backgroundImage: "none", borderRight: 0, boxShadow: "10px 0 28px rgba(0,0,0,0.16)" } },
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.32)" } },
        }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <NavigationContent mobile onCloseMobile={onCloseMobile} />
      </Drawer>
    </>
  );
}
