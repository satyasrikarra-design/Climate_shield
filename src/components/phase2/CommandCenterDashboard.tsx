import React, { useState } from "react";
import {
  CityDistrict,
  ClimateAlert,
  ClimateIncident,
  NavigationTab,
  RiskMemoryPattern,
} from "../../types/climate";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Droplets,
  Activity,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Radio,
  Filter,
  CheckCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface CommandCenterDashboardProps {
  locations: CityDistrict[];
  alerts: ClimateAlert[];
  incidents: ClimateIncident[];
  riskPatterns: RiskMemoryPattern[];
  onSelectLocationForAnalysis?: (district: CityDistrict) => void;
  onSelectForAnalysis?: (district: CityDistrict) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onSelectIncident?: (incidentId: string) => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  locations,
  alerts,
  incidents,
  riskPatterns,
  onSelectLocationForAnalysis,
  onSelectForAnalysis,
  onNavigateTab,
  onSelectIncident,
}) => {
  const [filterHazard, setFilterHazard] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  // Summary Metrics (Section 14)
  const safeLocations = locations || [];
  const safeAlerts = alerts || [];
  const safeIncidents = incidents || [];
  const safeRiskPatterns = riskPatterns || [];

  const totalLocations = safeLocations.length;
  const activeAlertsCount = safeAlerts.filter((a) => a.isActive).length;
  const criticalIncidentsCount = safeIncidents.filter(
    (i) => i.severity === "CRITICAL" && i.status !== "RESOLVED"
  ).length;
  const highRiskLocationsCount = safeLocations.filter(
    (l) => (l.currentRiskScore || 0) >= 60
  ).length;
  const inProgressIncidentsCount = safeIncidents.filter(
    (i) => i.status === "RESPONSE" || i.status === "ACKNOWLEDGED"
  ).length;
  const resolvedIncidentsCount = safeIncidents.filter(
    (i) => i.status === "RESOLVED"
  ).length;
  const recurringLocationsCount = safeRiskPatterns.length;

  // Filtered locations
  const filteredLocations = safeLocations.filter((loc) => {
    if (filterHazard !== "ALL" && loc.currentHazard !== filterHazard) return false;
    if (filterSeverity !== "ALL" && loc.currentRiskLevel !== filterSeverity) return false;
    return true;
  });

  // Chart 1 Data: Risk score ranking across cities
  const barChartData = safeLocations.map((loc) => ({
    name: loc.name,
    score: loc.currentRiskScore || 0,
    hazard: loc.currentHazard,
    level: loc.currentRiskLevel || "LOW",
  })).sort((a, b) => b.score - a.score);

  // Chart 2 Data: Hazard exposure
  const floodCount = safeLocations.filter((l) => l.currentHazard === "Flood Risk").length;
  const heatCount = safeLocations.filter((l) => l.currentHazard === "Heat Risk").length;
  const hazardPieData = [
    { name: "Flood Risk", value: floodCount, color: "#0284c7" },
    { name: "Heat Risk", value: heatCount, color: "#ea580c" },
  ];

  // Chart 3 Data: Incident Status distribution
  const statusCounts = {
    DETECTED: safeIncidents.filter((i) => i.status === "DETECTED").length,
    ACKNOWLEDGED: safeIncidents.filter((i) => i.status === "ACKNOWLEDGED").length,
    RESPONSE: safeIncidents.filter((i) => i.status === "RESPONSE").length,
    RECOVERY: safeIncidents.filter((i) => i.status === "RECOVERY").length,
    RESOLVED: safeIncidents.filter((i) => i.status === "RESOLVED").length,
  };
  const incidentStatusData = [
    { name: "Response Active", value: statusCounts.RESPONSE, fill: "#dc2626" },
    { name: "Acknowledged", value: statusCounts.ACKNOWLEDGED, fill: "#f59e0b" },
    { name: "Under Recovery", value: statusCounts.RECOVERY, fill: "#0d9488" },
    { name: "Resolved", value: statusCounts.RESOLVED, fill: "#10b981" },
  ];

  const getRiskLevelBadge = (level?: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800";
      case "HIGH":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800";
      case "MEDIUM":
        return "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800";
      default:
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Incident Active":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "Alert Active":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Under Recovery":
        return "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Operational Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Multi-Location Command Center
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            ClimateShield Operational Command &amp; Multi-City Risk Matrix
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Continuous surveillance of municipal flood inundation thresholds and extreme heat hardscape hazards across monitored Indian urban centers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="cmd-view-map-btn"
            onClick={() => onNavigateTab("map")}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>National Risk Map</span>
          </button>
          <button
            id="cmd-view-alerts-btn"
            onClick={() => onNavigateTab("alerts")}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition flex items-center gap-1.5 shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Alerts ({activeAlertsCount})</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Metric Blocks (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Monitored Cities
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalLocations}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
            <Radio className="w-3 h-3" /> Telemetry Live
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Active Alerts
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {activeAlertsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Requiring Review</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
            Critical Incidents
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {criticalIncidentsCount}
          </div>
          <div className="text-[10px] text-rose-600 font-medium mt-1">Priority 1 Response</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            High-Risk Zones
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {highRiskLocationsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Score &ge; 60/100</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            In Progress
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {inProgressIncidentsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Operations Active</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Resolved Incidents
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedIncidentsCount}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <CheckCircle className="w-3 h-3" /> Logged to History
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Risk Memory
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {recurringLocationsCount}
          </div>
          <div className="text-[10px] text-purple-600 font-medium mt-1">Recurring Patterns</div>
        </div>
      </div>

      {/* 3. Decision-Focused Analytical Charts (Section 14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Score Ranking Bar Chart */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Municipal Risk Severity Index (Current Cycle)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Composite risk score (0–100) combining hazard telemetry with local topographic and drainage capacity.
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300">
              Critical Threshold: 75+
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}/100`, "Risk Score"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => {
                    const color =
                      entry.score >= 75
                        ? "#e11d48" // Rose/Critical
                        : entry.score >= 60
                        ? "#f59e0b" // Amber/High
                        : entry.score >= 40
                        ? "#0284c7" // Sky/Medium
                        : "#10b981"; // Emerald/Low
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Breakdown & Operational Readiness */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Dominant Hazard &amp; Response Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Distribution of primary climatic threats currently active across urban districts.
            </p>

            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hazardPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={32}
                    paddingAngle={4}
                  >
                    {hazardPieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <div className="flex items-center justify-center gap-1 text-sky-700 dark:text-sky-300 font-bold">
                  <Droplets className="w-3.5 h-3.5" /> Flood Threat
                </div>
                <div className="text-lg font-bold text-sky-800 dark:text-sky-200 mt-0.5">
                  {floodCount} Cities
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5" /> Heat Threat
                </div>
                <div className="text-lg font-bold text-amber-800 dark:text-amber-200 mt-0.5">
                  {heatCount} Cities
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Preparedness Playbooks:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              100% Operational
            </span>
          </div>
        </div>
      </div>

      {/* 4. Multi-Location Surveillance Matrix (Section 1) */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-600" />
              <span>Monitored Urban Locations Surveillance Table</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live status, dominant hazard exposure, and risk scores across India municipal surveillance nodes.
            </p>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={filterHazard}
              onChange={(e) => setFilterHazard(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flood Risk">Flood Risk</option>
              <option value="Heat Risk">Heat Risk</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-4">Location Name</th>
                <th className="py-2.5 px-3">Current Risk Score</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Dominant Hazard</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3">Critical Assets</th>
                <th className="py-2.5 px-3">Last Updated</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLocations.map((loc) => {
                const isCritical = loc.currentRiskLevel === "CRITICAL";
                return (
                  <tr
                    key={loc.id}
                    className={`transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isCritical ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span>{loc.name}</span>
                          <span className="text-[10px] block font-normal text-slate-400">
                            {loc.state} &bull; {loc.elevationM}m ASL
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            (loc.currentRiskScore || 0) >= 75
                              ? "text-rose-600 dark:text-rose-400"
                              : (loc.currentRiskScore || 0) >= 60
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-700 dark:text-slate-300"
                          }
                        >
                          {loc.currentRiskScore || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getRiskLevelBadge(
                          loc.currentRiskLevel
                        )}`}
                      >
                        {loc.currentRiskLevel || "LOW"}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        {loc.currentHazard === "Flood Risk" ? (
                          <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{loc.currentHazard}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          loc.operationalStatus
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{loc.operationalStatus || "Monitoring"}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {loc.criticalAssets?.length || 0} Assets Monitored
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{loc.lastUpdated || "Live"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (onSelectLocationForAnalysis) {
                              onSelectLocationForAnalysis(loc);
                            } else if (onSelectForAnalysis) {
                              onSelectForAnalysis(loc);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold text-[11px] cursor-pointer transition flex items-center gap-1"
                          title="Open in Phase 1 live analysis engine"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Analyze</span>
                        </button>

                        <button
                          onClick={() => onNavigateTab?.("locations")}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="View Asset Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Active Critical Incident Operational Triage (Section 7, 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Incident Flash Cards */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Priority Response Incidents</span>
            </h3>
            <button
              onClick={() => onNavigateTab?.("incidents")}
              className="text-xs text-sky-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Incidents</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {incidents
              .filter((inc) => inc.status !== "RESOLVED")
              .slice(0, 3)
              .map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident?.(inc.id)}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{inc.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {inc.locationName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {inc.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {inc.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                    <span className="text-slate-500">
                      Tasks: {(inc.tasks || []).filter((t) => t.status === "COMPLETED").length}/
                      {(inc.tasks || []).length} Completed
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Stage: {inc.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Risk Memory Recurring Hotspot Alert (Section 13) */}
        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Risk Memory: Recurring Risk Patterns</span>
            </h3>
            <button
              onClick={() => onNavigateTab("risk-memory")}
              className="text-xs text-purple-700 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Memory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
            Historical incident records identify chronic vulnerability zones where repeated climate impacts occur under predictable meteorological triggers.
          </p>

          <div className="space-y-2">
            {riskPatterns.slice(0, 2).map((pattern) => (
              <div
                key={pattern.id}
                className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-800 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pattern.locationName}: {pattern.zoneAffected}
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950">
                    {pattern.previousIncidentsCount} Incidents Logged
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {pattern.vulnerabilityExplanation}
                </p>
                <div className="mt-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Recommendation: {pattern.preparednessRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
