import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CityDistrict,
  NavigationTab,
  RiskLevel,
} from "../../types/climate";
import {
  MapPin,
  Compass,
  Maximize2,
  Filter,
  Droplets,
  Flame,
  ShieldAlert,
  Building,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface FullMapRiskViewProps {
  locations: CityDistrict[];
  onSelectForAnalysis?: (district: CityDistrict) => void;
  onSelectLocationForAnalysis?: (district: CityDistrict) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

const INDIA_CENTER: [number, number] = [21.5937, 78.9629];
const INDIA_INITIAL_ZOOM = 5;

export const FullMapRiskView: React.FC<FullMapRiskViewProps> = ({
  locations,
  onSelectForAnalysis,
  onSelectLocationForAnalysis,
  onNavigateTab,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterHazard, setFilterHazard] = useState<string>("ALL");
  const [activeLocation, setActiveLocation] = useState<CityDistrict | null>(
    locations[0] || null
  );

  // Initialize Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: INDIA_INITIAL_ZOOM,
      zoomControl: true,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 18,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when locations or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filtered = locations.filter((loc) => {
      if (filterSeverity !== "ALL" && loc.currentRiskLevel !== filterSeverity)
        return false;
      if (filterHazard !== "ALL" && loc.currentHazard !== filterHazard)
        return false;
      return true;
    });

    filtered.forEach((loc) => {
      const { lat, lng } = loc.coordinates;
      const isCritical = loc.currentRiskLevel === "CRITICAL";
      const isHigh = loc.currentRiskLevel === "HIGH";
      const isMedium = loc.currentRiskLevel === "MEDIUM";

      const pinColor = isCritical
        ? "#e11d48"
        : isHigh
        ? "#f59e0b"
        : isMedium
        ? "#0284c7"
        : "#10b981";

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            position: absolute;
            width: ${isCritical ? "44px" : "34px"};
            height: ${isCritical ? "44px" : "34px"};
            border-radius: 50%;
            background-color: ${pinColor};
            opacity: 0.25;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            background-color: ${pinColor};
            color: white;
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>${loc.name}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 6px;">
              ${loc.currentRiskScore || 0}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-india-pin",
        html: iconHtml,
        iconSize: [100, 36],
        iconAnchor: [50, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on("click", () => {
        setActiveLocation(loc);
        map.flyTo([lat, lng], 10, { duration: 1.2 });
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, filterSeverity, filterHazard]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, INDIA_INITIAL_ZOOM, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Ribbon (Section 15) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>National Climate Risk Geospatial Map (All India Grid)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geospatial distribution of monitored municipal risk scores with real-time severity classification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Risk Severities</option>
            <option value="CRITICAL">Critical (75+)</option>
            <option value="HIGH">High (60–74)</option>
            <option value="MEDIUM">Medium (40–59)</option>
            <option value="LOW">Low (0–39)</option>
          </select>

          {/* Hazard Filter */}
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Hazard Profiles</option>
            <option value="Flood Risk">Flood Risk</option>
            <option value="Heat Risk">Heat Risk</option>
          </select>

          <button
            onClick={handleResetView}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Overview India</span>
          </button>
        </div>
      </div>

      {/* Main Map + Selected Location Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative min-h-[500px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] shadow-md flex items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Severity:
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Low</span>
            </div>
          </div>
        </div>

        {/* Selected Location Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {activeLocation ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>{activeLocation.state}, India</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeLocation.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {activeLocation.coordinates.lat.toFixed(4)}° N,{" "}
                    {activeLocation.coordinates.lng.toFixed(4)}° E
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {activeLocation.currentRiskScore || 0}
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      activeLocation.currentRiskLevel === "CRITICAL"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    }`}
                  >
                    {activeLocation.currentRiskLevel || "LOW"}
                  </span>
                </div>
              </div>

              {/* Dominant Hazard Profile */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  {activeLocation.currentHazard === "Flood Risk" ? (
                    <Droplets className="w-4 h-4 text-sky-600" />
                  ) : (
                    <Flame className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Dominant Threat: {activeLocation.currentHazard}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {activeLocation.vulnerabilityDescription}
                </p>
              </div>

              {/* Topographic Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Elevation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeLocation.elevationM} m ASL
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Drainage Cap:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeLocation.stormDrainageCapacityMmH} mm/hr
                  </span>
                </div>
              </div>

              {/* Critical Assets Monitored */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    Critical Assets ({activeLocation.criticalAssets?.length || 0})
                  </span>
                </span>
                <div className="space-y-1.5">
                  {activeLocation.criticalAssets?.slice(0, 2).map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {asset.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-semibold">
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Directives */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeLocation) {
                      if (onSelectForAnalysis) onSelectForAnalysis(activeLocation);
                      else if (onSelectLocationForAnalysis) onSelectLocationForAnalysis(activeLocation);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Risk Engine</span>
                </button>

                <button
                  onClick={() => onNavigateTab?.("locations")}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Click any pin on the map to inspect localized vulnerability data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
