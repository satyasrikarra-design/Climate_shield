import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Search,
  MapPin,
  Loader2,
  CloudRain,
  Play,
  RotateCcw,
  Cpu,
  Database,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { CityDistrict, DemoScenario, AppWorkflowState } from "../types/climate";
import {
  GeocodedLocation,
  searchIndianLocations,
  convertGeocodedToDistrict,
  CURATED_INDIAN_LOCATIONS,
} from "../services/locationService";

interface OperatorControlBarProps {
  selectedDistrict: CityDistrict | null;
  onSelectDistrict: (district: CityDistrict) => void;
  scenarios: DemoScenario[];
  selectedScenarioId: string;
  onSelectScenarioId: (id: string) => void;
  onLoadEnvironmentalData: () => void;
  onLoadScenario: () => void;
  onAnalyzeRisk: () => void;
  onResetAnalysis: () => void;
  workflowState: AppWorkflowState;
}

export function OperatorControlBar({
  selectedDistrict,
  onSelectDistrict,
  scenarios,
  selectedScenarioId,
  onSelectScenarioId,
  onLoadEnvironmentalData,
  onLoadScenario,
  onAnalyzeRisk,
  onResetAnalysis,
  workflowState,
}: OperatorControlBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>(selectedDistrict ? selectedDistrict.name : "");
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync search input when selectedDistrict changes externally
  useEffect(() => {
    if (selectedDistrict) {
      setSearchTerm(selectedDistrict.name);
    }
  }, [selectedDistrict?.id]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for typing in location input
  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchIndianLocations(query);
        setSuggestions(results);
        if (results.length === 0) {
          setSearchError("Location not found. Please enter a valid city, town, district or area in India.");
        }
      } catch {
        setSearchError("Failed to reach geocoding service. Using local Indian registry.");
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectSuggestion = (geo: GeocodedLocation) => {
    const district = convertGeocodedToDistrict(geo);
    onSelectDistrict(district);
    setSearchTerm(geo.name);
    setShowSuggestions(false);
    setSearchError(null);
  };

  const handleManualSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchIndianLocations(searchTerm.trim());
      if (results.length > 0) {
        handleSelectSuggestion(results[0]);
      } else {
        setSearchError("Location not found. Please enter a valid city, town, district or area in India.");
      }
    } catch {
      setSearchError("Please select a valid location in India.");
    } finally {
      setIsSearching(false);
    }
  };

  const isDataLoaded = workflowState === "data_loaded" || workflowState === "analyzed";
  const isAnalyzing = workflowState === "analyzing";

  return (
    <section id="operator-controls-panel" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Top Instructions Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              OPERATOR CONSOLE
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Dynamic India Search &rarr; Load Telemetry &rarr; Analyze Climate Risk
            </span>
          </div>

          <div className="flex items-center gap-2">
            {workflowState !== "initial" && (
              <button
                onClick={onResetAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                title="Clear current analysis and test another location or scenario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET ANALYSIS</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Control Grids: Dynamic Location Search & Demo Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 1. Dynamic Location Search Block (7 Cols) */}
          <div className="md:col-span-7 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-search-location" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Search Location (Any Indian City, Town, District)</span>
              </label>
              {selectedDistrict && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  Active: {selectedDistrict.name}, {selectedDistrict.state}
                </span>
              )}
            </div>

            {/* Search Input with Autocomplete Dropdown */}
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-search-location"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Enter any city, town, district or area in India…"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg pl-8 pr-8 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 text-sky-500 absolute right-2.5 top-2.5 animate-spin" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !searchTerm.trim()}
                  className="px-3 py-2 text-xs font-bold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  Search
                </button>

                <button
                  type="button"
                  id="btn-load-environmental-data"
                  onClick={onLoadEnvironmentalData}
                  disabled={!selectedDistrict || isAnalyzing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Load Data</span>
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 border-b border-slate-100 dark:border-slate-800">
                    Indian Location Suggestions
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.placeId}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 last:border-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            {item.district ? `${item.district}, ` : ""}
                            {item.state}, India
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message if not found */}
            {searchError && (
              <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Quick-Pick Popular Indian Locations */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="text-slate-400">Quick Pick:</span>
              {[
                "Palakollu",
                "Visakhapatnam",
                "Vijayawada",
                "Hyderabad",
                "Narsapuram",
                "Araku Valley",
                "Mumbai",
                "Delhi",
              ].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    const match = CURATED_INDIAN_LOCATIONS.find(
                      (l) => l.name.toLowerCase() === name.toLowerCase()
                    );
                    if (match) {
                      onSelectDistrict(match);
                      setSearchTerm(match.name);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition-colors cursor-pointer ${
                    selectedDistrict?.name === name
                      ? "bg-sky-600 text-white border-sky-600 font-bold"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Demo Scenario Selection Block (5 Cols) */}
          <div className="md:col-span-5 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="scenario-select-dropdown" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Demo Scenarios (Jury Quick-Switch)</span>
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  3 Presets
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  id="scenario-select-dropdown"
                  value={selectedScenarioId}
                  onChange={(e) => onSelectScenarioId(e.target.value)}
                  className="flex-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {scenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} &rarr; {sc.expectedResult}
                    </option>
                  ))}
                </select>

                <button
                  id="btn-load-scenario"
                  onClick={onLoadScenario}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Loads demonstration values (Normal, Extreme Heat, Heavy Rain / Flood) for {selectedDistrict?.name || "the location"}.
            </p>
          </div>
        </div>

        {/* 3. Primary Action: Prominent ANALYZE CLIMATE RISK Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/40 dark:to-sky-950/40 p-3 rounded-xl border border-emerald-500/30">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Step 3: Execute Risk Calculation &amp; Action Directives
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              {isDataLoaded
                ? `Environmental data ready for ${selectedDistrict?.name}. Click to execute transparent risk engine.`
                : "Search a location and load environmental data/scenario to enable analysis."}
            </span>
          </div>

          <button
            id="btn-analyze-climate-risk"
            onClick={onAnalyzeRisk}
            disabled={!isDataLoaded || isAnalyzing}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all cursor-pointer shadow-md ${
              isDataLoaded && !isAnalyzing
                ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white ring-4 ring-emerald-500/30 scale-100 hover:scale-[1.02]"
                : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-60"
            }`}
          >
            <Cpu className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>
              {isAnalyzing
                ? "ANALYZING CLIMATE RISK..."
                : "ANALYZE CLIMATE RISK"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
