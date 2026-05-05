"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import type { AdminStory } from "@/lib/storyAdmin";
import type { StoryCategoryMeta } from "@/lib/categories";
import { moveStoryPinAction } from "../stories/[id]/actions";

const DEFAULT_CENTER = { lat: 41.9028, lng: 12.4964 }; // Rome, our flagship city.
const DEFAULT_ZOOM = 12;

// Dark map style tuned for the admin chrome. Standard "Maps JavaScript
// API" styling — the same provider the Flutter app uses, so admin pin
// drops land on the same buildings the consumer sees.
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0e1320" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8d97a8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0e1320" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#3a4257" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bcc3d4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2030" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5a6478" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#252c3f" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070a14" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a4257" }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: DARK_MAP_STYLE,
  disableDefaultUI: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  backgroundColor: "#06070d",
};

export function AdminWorldMap({
  apiKey,
  stories,
  categories,
}: {
  apiKey: string;
  stories: AdminStory[];
  categories: ReadonlyArray<StoryCategoryMeta>;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    // No optional libraries needed for Phase 1; clustering / heatmaps
    // can be added when we wire those features.
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const colorById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.color])),
    [categories],
  );

  const initialCenter = useMemo(() => {
    const first = stories[0];
    if (first && first.lat !== undefined && first.lon !== undefined) {
      return { lat: first.lat, lng: first.lon };
    }
    return DEFAULT_CENTER;
  }, [stories]);

  const onDragEnd = useCallback(
    async (storyId: string, e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSavingId(storyId);
      setError(null);
      try {
        await moveStoryPinAction(storyId, lat, lng);
        setSavedAt(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  if (!apiKey) {
    return (
      <div className="flex min-h-screen items-center justify-center px-8">
        <div className="max-w-md rounded-md border border-white/10 bg-white/[0.02] p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Google Maps not configured
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-white">
            Add a web Maps key
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Set <code className="text-white/85">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code>{" "}
            on Hostinger to a Google Cloud key with the <em>Maps JavaScript API</em>
            {" "}enabled and HTTP-referrer restricted to{" "}
            <code className="text-white/85">https://ciroai.com/*</code>. The iOS
            and Android keys already in the app cannot be used here because they
            are restricted to mobile bundle IDs.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-8">
        <p className="rounded-md border border-red-400/30 bg-red-400/[0.06] px-5 py-3 text-sm text-red-300">
          Could not load Google Maps. Check the API key restrictions and that
          the Maps JavaScript API is enabled.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs uppercase tracking-[0.32em] text-white/40">
        Loading map…
      </div>
    );
  }

  const active = stories.find((s) => s.id === activeId) ?? null;

  return (
    <div className="relative min-h-screen">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
      >
        {stories.map((s) => {
          if (s.lat === undefined || s.lon === undefined) return null;
          const color = colorById[s.category] ?? "#FFD54F";
          return (
            <Marker
              key={s.id}
              position={{ lat: s.lat, lng: s.lon }}
              draggable
              onClick={() => setActiveId(s.id)}
              onDragEnd={(e) => onDragEnd(s.id, e)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#06070d",
                strokeWeight: 3,
                scale: 9,
              }}
              title={s.title}
            />
          );
        })}
      </GoogleMap>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-6">
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-md border border-white/10 bg-[#06070d]/85 px-4 py-2.5 text-[12px] text-white/70 backdrop-blur">
          <span className="uppercase tracking-[0.28em] text-white/45">
            World · {stories.length} pinned
          </span>
          <div className="flex items-center gap-4">
            {savingId && <span>Saving…</span>}
            {savedAt && !savingId && !error && (
              <span className="text-emerald-300/80">Saved · {savedAt}</span>
            )}
            {error && <span className="text-red-300">{error}</span>}
            <Link
              href="/admin/stories"
              className="text-white/60 hover:text-white"
            >
              Open table view ›
            </Link>
          </div>
        </div>

        <div className="pointer-events-auto mx-auto mt-3 flex max-w-7xl flex-wrap items-center gap-3 rounded-md border border-white/10 bg-[#06070d]/85 px-4 py-2.5 text-[11px] text-white/55 backdrop-blur">
          <span className="uppercase tracking-[0.22em] text-white/40">
            Legend
          </span>
          {categories.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: c.color }}
              />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {active && (
        <aside className="absolute right-0 top-0 z-20 flex h-screen w-full max-w-sm flex-col border-l border-white/10 bg-[#06070d]/95 backdrop-blur">
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-6 py-5">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: colorById[active.category] }}
              >
                {categories.find((c) => c.id === active.category)?.label}
              </p>
              <h3 className="mt-2 font-display text-xl tracking-tight text-white">
                {active.title}
              </h3>
              <p className="mt-1 text-xs text-white/40">{active.id}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="text-white/45 transition-colors hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-white/70">
            <p>{active.description}</p>
            <dl className="mt-6 space-y-2 text-xs">
              <Row k="City" v={active.city} />
              <Row
                k="Coords"
                v={
                  active.lat !== undefined && active.lon !== undefined
                    ? `${active.lat.toFixed(5)}, ${active.lon.toFixed(5)}`
                    : "—"
                }
              />
              <Row k="Duration" v={active.durationLabel ?? "—"} />
              <Row
                k="Status"
                v={active.published ? "Published" : "Draft"}
              />
            </dl>
          </div>
          <div className="border-t border-white/[0.06] px-6 py-4">
            <Link
              href={`/admin/stories/${active.id}`}
              className="block w-full rounded-md bg-white px-4 py-2.5 text-center text-sm font-medium text-[#06070d] transition-opacity hover:bg-white/90"
            >
              Open in editor
            </Link>
            <p className="mt-3 text-[11px] text-white/40">
              Drag the pin on the map to reposition. Saves immediately.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/[0.04] py-1.5">
      <dt className="text-[10px] uppercase tracking-[0.22em] text-white/40">
        {k}
      </dt>
      <dd className="tabular-nums text-white/85">{v}</dd>
    </div>
  );
}
