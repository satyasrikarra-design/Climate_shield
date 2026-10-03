import React, { useState } from "react";
import {
  CityDistrict,
  CriticalAsset,
  HazardType,
  NavigationTab,
  OperationalRole,
} from "../../types/climate";
import {
  MapPin,
  Building,
  Plus,
  Trash2,
  Edit3,
  Star,
  ShieldCheck,
  AlertTriangle,
  Hospital,
  GraduationCap,
  Zap,
  Factory,
  Compass,
  CheckCircle,
  ExternalLink,
  Search,
  ChevronRight,
  Info,
} from "lucide-react";
import { searchIndianLocations, convertGeocodedToDistrict } from "../../services/locationService";

interface LocationsManagementViewProps {
  locations: CityDistrict[];
  activeRole?: OperationalRole;
  onAddLocation?: (district: CityDistrict) => void;
  onRemoveLocation?: (id: string) => void;
  onToggleImportant?: (id: string) => void;
  onAddCriticalAsset?: (locationId: string, asset: CriticalAsset) => void;
  onRemoveCriticalAsset?: (locationId: string, assetId: string) => void;
  onSelectForAnalysis?: (district: CityDistrict) => void;
  onSelectLocationForAnalysis?: (district: CityDistrict) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const LocationsManagementView: React.FC<LocationsManagementViewProps> = ({
  locations,
  activeRole = "Operator",
  onAddLocation,
  onRemoveLocation,
  onToggleImportant,
  onAddCriticalAsset,
  onRemoveCriticalAsset,
  onSelectForAnalysis,
  onSelectLocationForAnalysis,
  onNavigateTab,
}) => {
  const safeLocations = locations || [];
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    safeLocations[0]?.id || ""
  );

  const handleLaunchAnalysis = (loc: CityDistrict) => {
    if (onSelectForAnalysis) {
      onSelectForAnalysis(loc);
    } else if (onSelectLocationForAnalysis) {
      onSelectLocationForAnalysis(loc);
    }
  };

  // Search state for adding any Indian location
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Asset creation form state
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<CriticalAsset["type"]>("Hospital");
  const [assetAddress, setAssetAddress] = useState("");
  const [assetVulnerability, setAssetVulnerability] = useState("");

  const selectedLoc =
    safeLocations.find((l) => l.id === selectedLocationId) || safeLocations[0];

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");

    try {
      const results = await searchIndianLocations(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
        setSearchError(
          "No Indian municipal location found. Please enter a valid city, town, or district in India."
        );
      }
    } catch {
      setSearchError("Failed to search location. Please check query.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: any) => {
    // Check if already in locations
    const existing = locations.find((l) => l.name.toLowerCase() === res.city.toLowerCase() || l.id === res.placeId);
    if (existing) {
      setSelectedLocationId(existing.id);
      setSearchResults([]);
      setSearchQuery("");
      return;
    }

    const newDistrict = convertGeocodedToDistrict(res);
    const enrichedDistrict: CityDistrict = {
      ...newDistrict,
      isMonitored: true,
      isImportant: false,
      vulnerabilityLevel: "Medium",
      currentRiskScore: 50,
      currentRiskLevel: "MEDIUM",
      currentHazard: newDistrict.primaryRiskPropensity,
      lastUpdated: "Just added",
      operationalStatus: "Monitoring",
      repeatedIncidentsCount: 0,
      criticalAssets: [
        {
          id: `ast-${Date.now()}-1`,
          name: `${res.city} Civil Hospital & Health Center`,
          type: "Hospital",
          address: `Central Road, ${res.city}`,
          vulnerabilityFactor: "Emergency lifeline for regional medical triage during extreme weather.",
          coordinates: { lat: res.lat, lng: res.lng },
          status: "Normal",
        },
      ],
    };

    if (onAddLocation) {
      onAddLocation(enrichedDistrict);
    }
    setSelectedLocationId(enrichedDistrict.id);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !selectedLoc) return;

    const newAsset: CriticalAsset = {
      id: `ast-${Date.now()}`,
      name: assetName.trim(),
      type: assetType,
      address: assetAddress.trim() || `${selectedLoc.name} Municipal Area`,
      vulnerabilityFactor:
        assetVulnerability.trim() ||
        "Critical community asset requiring operational climate surveillance.",
      coordinates: {
        lat: selectedLoc.coordinates.lat + (Math.random() - 0.5) * 0.02,
        lng: selectedLoc.coordinates.lng + (Math.random() - 0.5) * 0.02,
      },
      status: "Normal",
    };

    if (onAddCriticalAsset) {
      onAddCriticalAsset(selectedLoc.id, newAsset);
    }
    setAssetName("");
    setAssetAddress("");
    setAssetVulnerability("");
    setShowAddAssetModal(false);
  };

  const getAssetIcon = (type: CriticalAsset["type"]) => {
    switch (type) {
      case "Hospital":
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case "School/University":
        return <GraduationCap className="w-4 h-4 text-sky-600" />;
      case "Utility Facility":
        return <Zap className="w-4 h-4 text-amber-600" />;
      case "Industrial Facility":
        return <Factory className="w-4 h-4 text-purple-600" />;
      default:
        return <Building className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Location Search / Add Module */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-600" />
              <span>Location Management &amp; Critical Asset Intelligence</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure monitored Indian cities, manage vulnerable infrastructure assets, and track repeated climate exposures.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {safeLocations.length} Locations Active in Surveillance Grid
          </div>
        </div>

        {/* Dynamic Search Input to add ANY location in India (Section 2) */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-and-add-location-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search and add ANY Indian city, town, or district to the surveillance grid..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isSearching ? "Searching..." : "Search & Add City"}</span>
            </button>
          </div>

          {searchError && (
            <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{searchError}</span>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Select Indian Location to Add to Surveillance
              </div>
              {searchResults.map((res) => (
                <div
                  key={res.placeId}
                  onClick={() => handleSelectSearchResult(res)}
                  className="p-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {res.city}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {res.displayName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-600 font-bold px-2 py-1 rounded bg-sky-50 dark:bg-sky-950 border border-sky-200">
                    + Add to Grid
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* 2. Main 2-Column Layout: Location List vs Selected Location Intelligence Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Monitored Locations List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Surveillance Nodes</span>
            <span>{safeLocations.length} Locations</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {safeLocations.map((loc) => {
              const isSelected = loc.id === selectedLoc?.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleImportant?.(loc.id);
                      }}
                      className="text-slate-300 hover:text-amber-500 p-0.5"
                      title="Mark as Critical Priority"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          loc.isImportant
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {loc.name}
                        </span>
                        {loc.isImportant && (
                          <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold shrink-0">
                            Priority
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {loc.state} &bull; {loc.elevationM}m ASL
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {loc.currentRiskScore || 0}/100
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          loc.currentRiskLevel === "CRITICAL"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            : loc.currentRiskLevel === "HIGH"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {loc.currentRiskLevel || "LOW"}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Location Vulnerability & Critical Asset Intelligence (Section 3) */}
        {selectedLoc && (
          <div className="lg:col-span-8 space-y-5">
            {/* Location Overview Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLoc.name}, {selectedLoc.state}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      [{selectedLoc.coordinates.lat.toFixed(4)}° N, {selectedLoc.coordinates.lng.toFixed(4)}° E]
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Typology: {selectedLoc.type} &bull; Base Elevation: {selectedLoc.elevationM}m ASL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchAnalysis(selectedLoc)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                    title="Launch Phase 1 live risk engine for this location"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Risk Engine</span>
                  </button>

                  {safeLocations.length > 1 && activeRole === "Administrator" && (
                    <button
                      onClick={() => onRemoveLocation?.(selectedLoc.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove from monitoring grid"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vulnerability Profile (Section 3) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Vulnerability Profile: {selectedLoc?.vulnerabilityLevel || "Medium"}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {selectedLoc?.repeatedIncidentsCount || 0} Historical Climate Incidents Logged
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedLoc?.vulnerabilityDescription}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Impervious Surface:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedLoc?.imperviousSurfacePercent || 0}% Hardscape
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Tree Canopy:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedLoc?.treeCanopyPercent || 0}% Shade Cover
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">Storm Drain Capacity:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedLoc?.stormDrainageCapacityMmH || 0} mm/hr Max
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Assets Surveillance Section (Section 3) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-sky-600" />
                      <span>Critical Infrastructure Assets ({selectedLoc?.criticalAssets?.length || 0})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Hospitals, transit hubs, utility substations, and emergency lifelines
                    </span>
                  </div>

                  <button
                    onClick={() => setShowAddAssetModal(true)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Asset</span>
                  </button>
                </div>

                {/* Add Asset Modal / Inline Form */}
                {showAddAssetModal && (
                  <form
                    onSubmit={handleCreateAsset}
                    className="p-3.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Register New Critical Infrastructure Asset</span>
                      <button
                        type="button"
                        onClick={() => setShowAddAssetModal(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Asset Name
                        </label>
                        <input
                          type="text"
                          required
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          placeholder="e.g. Municipal Trauma Hospital, Central 220kV Substation"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Asset Typology
                        </label>
                        <select
                          value={assetType}
                          onChange={(e) => setAssetType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="Hospital">Hospital / Healthcare</option>
                          <option value="School/University">School / University</option>
                          <option value="Utility Facility">Utility / Power / Water Facility</option>
                          <option value="Industrial Facility">Industrial Facility</option>
                          <option value="Public Infrastructure">Public Transit / Civic Infrastructure</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Specific Vulnerability Factor
                      </label>
                      <input
                        type="text"
                        value={assetVulnerability}
                        onChange={(e) => setAssetVulnerability(e.target.value)}
                        placeholder="e.g. Ground floor trauma bay subject to 0.5m stormwater ingress during high-intensity rain."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                      >
                        Save Asset
                      </button>
                    </div>
                  </form>
                )}

                {/* Asset Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(!selectedLoc?.criticalAssets || selectedLoc.criticalAssets.length === 0) ? (
                    <div className="col-span-2 p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                      No critical assets registered yet. Click &quot;Add Asset&quot; to identify schools, hospitals, or utility nodes.
                    </div>
                  ) : (
                    (selectedLoc.criticalAssets || []).map((asset) => (
                      <div
                        key={asset.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-2xs space-y-1.5 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                            {getAssetIcon(asset.type)}
                            <span>{asset.name}</span>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              asset.status === "Heightened Alert"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : asset.status === "Impacted"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {asset.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {asset.type} &bull; {asset.address}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                          <strong>Vulnerability:</strong> {asset.vulnerabilityFactor}
                        </p>

                        <button
                          onClick={() => onRemoveCriticalAsset?.(selectedLoc.id, asset.id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-600 transition"
                          title="Remove asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
