"use client";

import { useMemo, useState } from "react";
import { GoogleMap } from "@/components/maps/google-map";
import type { SiteResponse } from "./vendor/shared/site";

/** A preview of the CMC draft. It never publishes coverage or changes towers. */
export function CoverageMap({ towers }: { towers: SiteResponse["towers"] }) {
  const [selected, setSelected] = useState("");
  const markers = useMemo(() => towers
    .filter(tower => Number.isFinite(tower.lat) && Math.abs(tower.lat) <= 90 && Number.isFinite(tower.lng) && Math.abs(tower.lng) <= 180)
    .map(tower => ({ id: tower.id, title: tower.name, position: { lat: tower.lat, lng: tower.lng }, radiusMeters: Math.max(0, tower.radiusKm) * 1000 })), [towers]);
  if (!markers.length) return <p>Agrega una emisora con coordenadas válidas para ver su ubicación.</p>;
  return <GoogleMap ariaLabel="Mapa de cobertura del sitio web" center={markers[0].position} markers={markers} selectedMarkerId={selected} onMarkerClick={setSelected} minHeight={340} />;
}
