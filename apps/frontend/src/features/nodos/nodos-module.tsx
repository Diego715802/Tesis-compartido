"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useState, type ReactNode } from "react";
import { GoogleMap, type GoogleMapMarker } from "@/components/maps/google-map";
import { networkNodes, type NetworkNode } from "./node-data";

const pageSizes = [10, 20, 50, 100, 500] as const;

function Availability({ node }: { node: NetworkNode }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45, fontVariantNumeric: "tabular-nums" }}>
      <Chip label={node.used} size="small" sx={{ height: 22, color: "#FFFFFF", backgroundColor: "#4FC1C5", fontSize: "0.68rem", fontWeight: 750, "& .MuiChip-label": { px: 0.8 } }} />
      <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>/</Typography>
      <Chip label={node.capacity} size="small" sx={{ height: 22, color: "#FFFFFF", backgroundColor: "#4FC1C5", fontSize: "0.68rem", fontWeight: 750, "& .MuiChip-label": { px: 0.8 } }} />
    </Box>
  );
}

function PageButton({ active = false, children, onClick, ariaLabel, disabled = false }: { active?: boolean; children: ReactNode; onClick: () => void; ariaLabel?: string; disabled?: boolean }) {
  return (
    <Button
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      size="small"
      variant={active ? "contained" : "outlined"}
      sx={{ minWidth: 34, height: 32, px: 0.8, boxShadow: "none", fontSize: "0.68rem" }}
    >
      {children}
    </Button>
  );
}

function CoverageDialog({ node, onClose }: { node: NetworkNode; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
      <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.6, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: "1.08rem", fontWeight: 700 }}>Detalles Cobertura</Typography>
          <Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.7rem" }}>{node.name}</Typography>
        </Box>
        <IconButton aria-label="Cerrar coberturas" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Descripción</TableCell><TableCell align="right">Disponibilidad</TableCell></TableRow></TableHead>
            <TableBody><TableRow><TableCell sx={{ fontWeight: 700 }}>{node.name}</TableCell><TableCell>{node.coverageDescription}</TableCell><TableCell align="right"><Availability node={node} /></TableCell></TableRow></TableBody>
          </Table>
        </TableContainer>

        <Typography component="h3" sx={{ mt: 2.5, mb: 1, fontSize: "0.86rem", fontWeight: 700 }}>Coberturas</Typography>
        <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>SSID &amp; Amplitud</TableCell><TableCell>Artículo</TableCell><TableCell align="right">Disponibilidad</TableCell></TableRow></TableHead>
            <TableBody><TableRow><TableCell><Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>{node.coverageName}</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>360°</Typography></TableCell><TableCell>—</TableCell><TableCell align="right"><Availability node={node} /></TableCell></TableRow></TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

export function NodosModule() {
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(networkNodes[0]?.id ?? "");
  const [coverageNode, setCoverageNode] = useState<NetworkNode | null>(null);

  const pageCount = Math.max(1, Math.ceil(networkNodes.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const firstIndex = (safePage - 1) * pageSize;
  const visibleNodes = networkNodes.slice(firstIndex, firstIndex + pageSize);
  const selectedNode = networkNodes.find((node) => node.id === selectedId) ?? visibleNodes[0] ?? networkNodes[0];
  const mapMarkers = useMemo<GoogleMapMarker[]>(() => networkNodes.map((node) => ({
    id: node.id,
    label: String(node.sequentialId),
    title: node.name,
    position: { lat: node.latitude, lng: node.longitude },
  })), []);

  function updatePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5, xl: 3 }, py: { xs: 2, md: 2.5 } }}>
      <Breadcrumbs separator={<ChevronRightRoundedIcon sx={{ fontSize: 14 }} />} aria-label="Ruta de navegación" sx={{ mb: 1, "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
        <Link href="/" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>Inicio</Link>
        <Typography color="text.primary" sx={{ fontSize: 12, fontWeight: 650 }}>Nodos</Typography>
      </Breadcrumbs>

      <Box component="header" sx={{ display: "flex", alignItems: "center", gap: 1.3, mb: 2 }}>
        <Tooltip title="Ayuda de nodos">
          <IconButton aria-label="Ayuda de nodos" sx={{ width: 40, height: 40, color: "#FFFFFF", backgroundColor: "primary.main", "&:hover": { backgroundColor: "primary.dark" } }}><HelpOutlineRoundedIcon /></IconButton>
        </Tooltip>
        <Box>
          <Typography component="h1" sx={{ color: "#4B4E51", fontSize: { xs: 24, sm: 28 }, fontWeight: 650, lineHeight: 1.12 }}>Nodos</Typography>
          <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.75rem" }}>Disponibilidad y cobertura de la red</Typography>
        </Box>
      </Box>

      <Box sx={{ overflow: "hidden", backgroundColor: "#FFFFFF", boxShadow: "3px 3px 8px rgba(0,0,0,.16)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(430px,.86fr) minmax(520px,1.2fr)" }, alignItems: "stretch" }}>
          <Box sx={{ minWidth: 0, borderRight: { lg: "1px solid #E7EAEC" } }}>
            <TableContainer sx={{ maxHeight: { xs: 560, lg: "calc(100dvh - 255px)" }, minHeight: { lg: 520 }, overflow: "auto" }}>
              <Table stickyHeader size="small" aria-label="Listado de nodos" sx={{ minWidth: 470 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56, color: "#1C84C6", fontSize: 12, fontWeight: 750 }}># ▲</TableCell>
                    <TableCell sx={{ color: "#1C84C6", fontSize: 12, fontWeight: 750 }}>Nombre</TableCell>
                    <TableCell sx={{ width: 152, color: "#5B5E61", fontSize: 12, fontWeight: 750 }}>Disponibilidad</TableCell>
                    <TableCell align="center" sx={{ width: 92, color: "#5B5E61", fontSize: 12, fontWeight: 750 }}>Cobertura</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleNodes.map((node) => (
                    <TableRow
                      key={node.id}
                      hover
                      selected={node.id === selectedNode?.id}
                      onClick={() => setSelectedId(node.id)}
                      sx={{ cursor: "pointer", "&.Mui-selected": { backgroundColor: "#E8F4FA" }, "&.Mui-selected:hover": { backgroundColor: "#DCEFF7" } }}
                    >
                      <TableCell sx={{ py: 0.9, color: "text.secondary", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{node.sequentialId}</TableCell>
                      <TableCell sx={{ py: 0.9, color: "#4B4E51", fontSize: 12.5, fontWeight: 520 }}>{node.name}</TableCell>
                      <TableCell sx={{ py: 0.9 }}><Availability node={node} /></TableCell>
                      <TableCell align="center" sx={{ py: 0.65 }}>
                        <Tooltip title="Ver coberturas">
                          <IconButton
                            aria-label={`Ver coberturas de ${node.name}`}
                            onClick={(event) => { event.stopPropagation(); setSelectedId(node.id); setCoverageNode(node); }}
                            sx={{ width: 34, height: 34, color: "#FFFFFF", backgroundColor: "#278CB6", borderRadius: "2px", "&:hover": { backgroundColor: "#16759E" } }}
                          >
                            <WifiRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", px: 1.5, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.69rem" }}>Mostrando Nodos {networkNodes.length ? firstIndex + 1 : 0} - {Math.min(firstIndex + pageSize, networkNodes.length)} de {networkNodes.length} en total</Typography>
              <Box sx={{ display: "flex", gap: 0.45 }}>
                {pageCount > 2 && <PageButton ariaLabel="Primera página" disabled={safePage === 1} onClick={() => setPage(1)}><FirstPageRoundedIcon sx={{ fontSize: 16 }} /></PageButton>}
                <PageButton ariaLabel="Página anterior" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><NavigateBeforeRoundedIcon sx={{ fontSize: 16 }} /></PageButton>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <PageButton key={pageNumber} active={pageNumber === safePage} onClick={() => setPage(pageNumber)}>{pageNumber}</PageButton>)}
                <PageButton ariaLabel="Página siguiente" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><NavigateNextRoundedIcon sx={{ fontSize: 16 }} /></PageButton>
                {pageCount > 2 && <PageButton ariaLabel="Última página" disabled={safePage === pageCount} onClick={() => setPage(pageCount)}><LastPageRoundedIcon sx={{ fontSize: 16 }} /></PageButton>}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.45, px: 1.5, py: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ mr: 0.4, color: "text.secondary", fontSize: "0.68rem" }}>Paginar de a</Typography>
              {pageSizes.map((size) => <PageButton key={size} active={size === pageSize} onClick={() => updatePageSize(size)}>{size}</PageButton>)}
            </Box>
          </Box>

          <Box sx={{ position: { lg: "sticky" }, top: { lg: 82 }, minHeight: { xs: 390, lg: 640 }, borderTop: { xs: "1px solid #E7EAEC", lg: 0 } }}>
            {selectedNode && (
              <GoogleMap
                ariaLabel="Mapa de nodos"
                center={{ lat: selectedNode.latitude, lng: selectedNode.longitude }}
                markers={mapMarkers}
                selectedMarkerId={selectedNode.id}
                zoom={11}
                minHeight={640}
                onMarkerClick={setSelectedId}
              />
            )}
            {selectedNode && (
              <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 2, maxWidth: "calc(100% - 24px)", px: 1.25, py: 0.9, backgroundColor: "rgba(255,255,255,.96)", boxShadow: "0 4px 14px rgba(22,37,50,.18)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}><HubOutlinedIcon sx={{ color: "primary.main", fontSize: 18 }} /><Typography sx={{ overflow: "hidden", fontSize: "0.75rem", fontWeight: 750, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedNode.name}</Typography></Box>
                <Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.64rem" }}>{selectedNode.latitude.toFixed(5)}, {selectedNode.longitude.toFixed(5)}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {coverageNode && <CoverageDialog node={coverageNode} onClose={() => setCoverageNode(null)} />}
    </Box>
  );
}
