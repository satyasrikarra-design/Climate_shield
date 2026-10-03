import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Maximize2, Compass, CheckCircle2, ShieldAlert } from "lucide-react";
import { CityDistrict } from "../types/climate";

interface IndiaRiskMapProps {
  selectedDistrict: CityDistrict | null;
  onMapClickLocation?: (lat: number, lng: number) => void;
  isDataLoaded: boolean;
}

// Initial overview center for India
const INDIA_CENTER: [number, number] = [21.7679, 78.8718];
const INDIA_INITIAL_ZOOM = 4.8;

export function IndiaRiskMap({
  selectedDistrict,
  onMapClickLocation,
  isDataLoaded,
}: IndiaRiskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map Instance
    const map = L.map(mapContainerRef.current, {
      center: selectedDistrict
        ? [selectedDistrict.coordinates.lat, selectedDistrict.coordinates.lng]
        : INDIA_CENTER,
      zoom: selectedDistrict ? 9 : INDIA_INITIAL_ZOOM,
      zoomControl: true,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 18,
    });

    // Add CartoDB Positron clean map tiles (clean, high contrast, perfect for data dashboards)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Optional click handler to pick any point on map
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickLocation) {
        onMapClickLocation(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center, marker, and highlight ring when selectedDistrict changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedDistrict) {
      map.flyTo(INDIA_CENTER, INDIA_INITIAL_ZOOM, { duration: 1.2 });
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      return;
    }

    const { lat, lng } = selectedDistrict.coordinates;

    // Smoothly fly and center to selected location
    map.flyTo([lat, lng], 11, {
      duration: 1.4,
      easeLinearity: 0.25,
    });

    // Remove prior marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Custom high-contrast Pin Icon with glowing badge
    const isFloodRisk = selectedDistrict.primaryRiskPropensity === "Flood Risk";
    const pinColor = isFloodRisk ? "#0284c7" : "#ea580c";

    const customPinHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
        <div class="absolute w-8 h-8 rounded-full animate-ping opacity-40" style="background-color: ${pinColor}"></div>
        <div class="w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white cursor-pointer transition-transform hover:scale-110" style="background-color: ${pinColor}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      html: customPinHtml,
      className: "custom-climate-pin",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    marker
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; padding: 2px 4px; min-width: 140px;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${selectedDistrict.name}</strong>
          <span style="color: #64748b; font-size: 11px;">${selectedDistrict.state}, India</span>
          <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #475569;">
            ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
          </div>
        </div>`,
        { closeButton: false }
      )
      .openPopup();

    markerRef.current = marker;

    // Highlight area circle (radar impact zone)
    const circle = L.circle([lat, lng], {
      radius: 4500, // 4.5km municipal zone
      color: pinColor,
      fillColor: pinColor,
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: "4, 4",
    }).addTo(map);

    circleRef.current = circle;
  }, [selectedDistrict]);

  const handleResetViewToIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, INDIA_INITIAL_ZOOM, { duration: 1.2 });
    }
  };

  return (
    <section id="section-india-map" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              INDIA CLIMATE MAP
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vulnerability &amp; Location Geospatial Tracker
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive national map tracking municipal climate risk across Indian cities &amp; districts
          </p>
        </div>

        <button
          onClick={handleResetViewToIndia}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Reset to India View</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Leaflet India Map Canvas */}
        <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 min-h-[380px] h-[400px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay Badge: Mode Indicator */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive India Map &bull; Pan &amp; Zoom Active</span>
          </div>

          {/* Map Hint */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md pointer-events-none">
            Click anywhere on map to pin location
          </div>
        </div>

        {/* Selected Location Card */}
        <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                SELECTED LOCATION
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                India Focus
              </span>
            </div>

            {selectedDistrict ? (
              <div className="mt-3 space-y-2.5">
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedDistrict.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedDistrict.region}, {selectedDistrict.state}, India
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Latitude:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedDistrict.coordinates.lat.toFixed(4)}° N
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Longitude:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedDistrict.coordinates.lng.toFixed(4)}° E
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 text-[11px]">Elevation:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedDistrict.elevationM} m ASL
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Terrain Typology:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px]">
                      {selectedDistrict.type}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedDistrict.vulnerabilityDescription}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Navigation className="w-8 h-8 mx-auto text-slate-300 animate-bounce" />
                <p className="text-xs">
                  Type any Indian location in the search bar above or click on the map.
                </p>
              </div>
            )}
          </div>

          {/* Operational Status Pill */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              STATUS:
            </span>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Location Ready for Risk Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
