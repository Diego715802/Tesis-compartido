"use client";

import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";

export type MapPoint = {
  lat: number;
  lng: number;
};

export type GoogleMapMarker = {
  id: string;
  label?: string;
  title: string;
  position: MapPoint;
  radiusMeters?: number;
};

type GoogleMapsListener = { remove: () => void };
type GoogleMapsEvent = { latLng?: { lat: () => number; lng: () => number } };
type GoogleMapsObject = { setMap: (map: GoogleMapInstance | null) => void };
type GoogleMapInstance = {
  addListener: (eventName: string, handler: (event: GoogleMapsEvent) => void) => GoogleMapsListener;
  fitBounds: (bounds: GoogleMapsBounds, padding?: number) => void;
};
type GoogleMapsBounds = { extend: (point: MapPoint) => void };
type GoogleMapsNamespace = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
  Marker: new (options: Record<string, unknown>) => GoogleMapsObject & {
    addListener: (eventName: string, handler: (event: GoogleMapsEvent) => void) => GoogleMapsListener;
  };
  Circle: new (options: Record<string, unknown>) => GoogleMapsObject;
  LatLngBounds: new () => GoogleMapsBounds;
};

let googleMapsPromise: Promise<GoogleMapsNamespace> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps solo se carga en el navegador."));

  const existingGoogle = (window as typeof window & { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
  if (existingGoogle) return Promise.resolve(existingGoogle);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const currentScript = document.querySelector<HTMLScriptElement>('script[data-comecore-google-maps="true"]');
    const resolveMaps = () => {
      const maps = (window as typeof window & { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
      if (maps) resolve(maps);
      else reject(new Error("Google Maps no pudo inicializarse."));
    };

    if (currentScript) {
      currentScript.addEventListener("load", resolveMaps, { once: true });
      currentScript.addEventListener("error", () => reject(new Error("No fue posible cargar Google Maps.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=es&region=MX`;
    script.async = true;
    script.defer = true;
    script.dataset.comecoreGoogleMaps = "true";
    script.addEventListener("load", resolveMaps, { once: true });
    script.addEventListener("error", () => reject(new Error("No fue posible cargar Google Maps.")), { once: true });
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function GoogleMapFallback({ point, zoom, title }: { point: MapPoint; zoom: number; title: string }) {
  const embedUrl = `https://www.google.com/maps?q=${point.lat},${point.lng}&z=${zoom}&output=embed&hl=es`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;

  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Box
        component="iframe"
        title={title}
        src={embedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ width: "100%", height: "100%", border: 0 }}
      />
      <Link
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        underline="none"
        sx={{
          position: "absolute",
          right: 10,
          bottom: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.7,
          color: "#38434D",
          backgroundColor: "rgba(255,255,255,.94)",
          boxShadow: "0 3px 10px rgba(22,37,50,.18)",
          fontSize: "0.67rem",
          fontWeight: 700,
        }}
      >
        Abrir en Google Maps <LaunchRoundedIcon sx={{ fontSize: 14 }} />
      </Link>
    </Box>
  );
}

type GoogleMapProps = {
  ariaLabel: string;
  center: MapPoint;
  markers?: GoogleMapMarker[];
  selectedMarkerId?: string;
  zoom?: number;
  minHeight?: number;
  onMapClick?: (position: MapPoint) => void;
  onMarkerClick?: (markerId: string) => void;
};

export function GoogleMap({
  ariaLabel,
  center,
  markers = [],
  selectedMarkerId,
  zoom = 13,
  minHeight = 300,
  onMapClick,
  onMarkerClick,
}: GoogleMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const selectedPoint = useMemo(
    () => markers.find((marker) => marker.id === selectedMarkerId)?.position ?? center,
    [center, markers, selectedMarkerId],
  );

  useEffect(() => {
    if (!apiKey || !mapElementRef.current) {
      setLoadState("fallback");
      return;
    }

    let cancelled = false;
    const listeners: GoogleMapsListener[] = [];
    const overlays: GoogleMapsObject[] = [];
    setLoadState("loading");

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapElementRef.current) return;

        const map = new maps.Map(mapElementRef.current, {
          center: selectedPoint,
          zoom,
          clickableIcons: false,
          fullscreenControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: { position: 6 },
          streetViewControl: false,
          zoomControl: true,
          gestureHandling: "greedy",
        });

        if (onMapClick) {
          listeners.push(map.addListener("click", (event) => {
            if (!event.latLng) return;
            onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
          }));
        }

        const bounds = new maps.LatLngBounds();
        markers.forEach((marker, index) => {
          const selected = marker.id === selectedMarkerId;
          const mapMarker = new maps.Marker({
            map,
            position: marker.position,
            title: marker.title,
            label: marker.label ? { text: marker.label, color: "#FFFFFF", fontSize: "10px", fontWeight: "700" } : undefined,
            draggable: Boolean(onMapClick && selected),
            zIndex: selected ? 1000 : 100 - index,
          });
          overlays.push(mapMarker);
          bounds.extend(marker.position);

          if (onMarkerClick) listeners.push(mapMarker.addListener("click", () => onMarkerClick(marker.id)));
          if (onMapClick && selected) {
            listeners.push(mapMarker.addListener("dragend", (event) => {
              if (!event.latLng) return;
              onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            }));
          }

          if (marker.radiusMeters) {
            const circle = new maps.Circle({
              map,
              center: marker.position,
              radius: marker.radiusMeters,
              fillColor: selected ? "#1C84C6" : "#0CA8CF",
              fillOpacity: selected ? 0.14 : 0.07,
              strokeColor: selected ? "#1C84C6" : "#0CA8CF",
              strokeOpacity: selected ? 0.72 : 0.32,
              strokeWeight: selected ? 2 : 1,
            });
            overlays.push(circle);
          }
        });

        if (markers.length > 1) map.fitBounds(bounds, 42);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("fallback");
      });

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
      overlays.forEach((overlay) => overlay.setMap(null));
    };
  }, [apiKey, markers, onMapClick, onMarkerClick, selectedMarkerId, selectedPoint, zoom]);

  return (
    <Box
      role="region"
      aria-label={ariaLabel}
      sx={{ position: "relative", minHeight, overflow: "hidden", backgroundColor: "#E8EDF2" }}
    >
      <Box ref={mapElementRef} sx={{ position: "absolute", inset: 0 }} />
      {loadState === "fallback" && <GoogleMapFallback point={selectedPoint} zoom={zoom} title={ariaLabel} />}
      {loadState === "loading" && (
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", backgroundColor: "#EEF2F5" }}>
          <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", fontWeight: 650 }}>Cargando Google Maps…</Typography>
        </Box>
      )}
    </Box>
  );
}
