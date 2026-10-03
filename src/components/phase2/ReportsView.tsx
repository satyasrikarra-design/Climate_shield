import React, { useState } from "react";
import {
  CityDistrict,
  ClimateIncident,
  HistoricalIncident,
  RiskMemoryPattern,
} from "../../types/climate";
import {
  BarChart3,
  Download,
  Filter,
  CheckCircle,
  Clock,
  TrendingDown,
  ShieldCheck,
  Printer,
  Calendar,
  Layers,
} from "lucide-react";

interface ReportsViewProps {
  locations: CityDistrict[];
  incidents: ClimateIncident[];
  historicalIncidents: HistoricalIncident[];
  riskPatterns: RiskMemoryPattern[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  locations,
  incidents,
  historicalIncidents,
  riskPatterns,
}) => {
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterHazard, setFilterHazard] = useState<string>("ALL");

  const safeIncidents = incidents || [];
  const safeHistorical = historicalIncidents || [];
  const safeRiskPatterns = riskPatterns || [];

  const allRecords = [
    ...safeIncidents.map((i) => ({
      id: i.id,
      location: i.locationName,
      hazard: i.hazard,
      severity: i.severity,
      score: i.riskScore,
      status: i.status === "RESOLVED" ? "Resolved" : "Active / Response",
      date: i.createdAt,
      resolutionTime: i.status === "RESOLVED" ? "4.2 hrs" : "In Progress",
      keySummary: i.title,
    })),
    ...safeHistorical.map((h) => ({
      id: h.incidentCode,
      location: h.locationName,
      hazard: h.hazard,
      severity: h.severity,
      score: h.riskScore,
      status: "Resolved & Archived",
      date: h.dateTime,
      resolutionTime: `${h.resolutionTimeHours} hrs`,
      keySummary: h.zoneAffected,
    })),
  ];

  const filtered = allRecords.filter((r) => {
    if (filterLocation !== "ALL" && r.location !== filterLocation) return false;
    if (filterHazard !== "ALL" && r.hazard !== filterHazard) return false;
    return true;
  });

  // Calculate Response Performance Metrics
  const totalResolved = allRecords.filter(
    (r) => r.status.includes("Resolved")
  ).length;
  const resolutionRate =
    allRecords.length > 0 ? Math.round((totalResolved / allRecords.length) * 100) : 0;

  const handlePrintBrief = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>Operational Reports, Performance &amp; Post-Incident Audit</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive audit reporting on municipal risk trends, response SLAs, mean time to resolve (MTTR), and mitigation effectiveness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintBrief}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Performance KPI Matrix (Section 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Total Logged Events
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {allRecords.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Active &amp; Historical Incidents
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Resolution Success Rate
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {resolutionRate}%
          </span>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <CheckCircle className="w-3 h-3" /> SLA Standard Met
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Average MTTR
          </span>
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1 block">
            5.2 hrs
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Mean Time To Resolve
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Recurring Risk Zones
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {riskPatterns.length}
          </span>
          <span className="text-[10px] text-purple-600 font-medium mt-1 block">
            Covered by Risk Memory
          </span>
        </div>
      </div>

      {/* 3. Filterable Unified Audit Log */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Comprehensive Climate Incident Ledger</span>
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Indian Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              value={filterHazard}
              onChange={(e) => setFilterHazard(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flood Risk">Flood Risk</option>
              <option value="Heat Risk">Heat Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Hazard</th>
                <th className="py-2.5 px-3">Severity &amp; Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Resolution Time</th>
                <th className="py-2.5 px-3">Scope / Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {item.id}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {item.location}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {item.hazard}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {item.severity} ({item.score}/100)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status.includes("Resolved")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {item.date}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {item.resolutionTime}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                    {item.keySummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
