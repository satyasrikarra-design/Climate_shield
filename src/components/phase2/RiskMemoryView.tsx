import React, { useState } from "react";
import {
  HistoricalIncident,
  RiskMemoryPattern,
  HazardType,
  RiskLevel,
} from "../../types/climate";
import {
  History,
  Brain,
  AlertTriangle,
  Droplets,
  Flame,
  Filter,
  CheckCircle,
  Clock,
  Lightbulb,
  ShieldCheck,
  Search,
} from "lucide-react";

interface RiskMemoryViewProps {
  patterns: RiskMemoryPattern[];
  historicalIncidents: HistoricalIncident[];
}

export const RiskMemoryView: React.FC<RiskMemoryViewProps> = ({
  patterns,
  historicalIncidents,
}) => {
  const [filterHazard, setFilterHazard] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchLocation, setSearchLocation] = useState<string>("");

  const filteredHistory = historicalIncidents.filter((inc) => {
    if (filterHazard !== "ALL" && inc.hazard !== filterHazard) return false;
    if (filterSeverity !== "ALL" && inc.severity !== filterSeverity) return false;
    if (
      searchLocation.trim() &&
      !inc.locationName.toLowerCase().includes(searchLocation.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Concept Explainer (Section 13) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white border border-purple-800/40 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
            Municipal Risk Memory &amp; Pattern Intelligence
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          Historical Incident Intelligence &amp; Recurring Risk Memory
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Transforms resolved climate incidents into actionable municipal memory. By correlating historical flood surcharges and thermal distress patterns, ClimateShield equips operators with empirical lessons for pre-disaster readiness.
        </p>
      </div>

      {/* 2. Risk Memory Recurring Hotspot Intelligence (Section 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Identified Recurring Risk Patterns (Municipal Memory)</span>
          </h3>
          <span className="text-xs text-slate-500">
            {patterns.length} High-Vulnerability Hotspots Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((item) => {
            const isFlood = item.hazard === "Flood Risk";
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      {isFlood ? (
                        <Droplets className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Flame className="w-4 h-4 text-amber-600" />
                      )}
                      <span>
                        {item.locationName} &bull; {item.zoneAffected}
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold block mt-0.5">
                      Pattern: {item.riskPattern}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shrink-0 border border-purple-200">
                    {item.previousIncidentsCount} Logged Incidents
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg leading-relaxed">
                  <strong>Vulnerability Root Cause:</strong> {item.vulnerabilityExplanation}
                </p>

                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Preparedness Action Directive:
                    </strong>
                    <span className="text-[11px]">{item.preparednessRecommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Historical Incident Intelligence Archive (Section 4) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-600" />
              <span>Resolved Incident Archive &amp; Post-Disaster Lessons</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter past incidents by hazard, severity, or municipality to inspect tactical recovery logs and response performance.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search city..."
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={filterHazard}
              onChange={(e) => setFilterHazard(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flood Risk">Flood Risk</option>
              <option value="Heat Risk">Heat Risk</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Historical Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Location &amp; Zone</th>
                <th className="py-2.5 px-3">Hazard</th>
                <th className="py-2.5 px-3">Severity &amp; Score</th>
                <th className="py-2.5 px-3">Resolution Time</th>
                <th className="py-2.5 px-3">Actions Taken</th>
                <th className="py-2.5 px-3">Key Lesson Learned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {inc.incidentCode}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {inc.dateTime}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {inc.locationName}
                    <span className="block text-[10px] font-normal text-slate-500">
                      {inc.zoneAffected}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      {inc.hazard === "Flood Risk" ? (
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>{inc.hazard}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {inc.severity} ({inc.riskScore}/100)
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{inc.resolutionTimeHours} hrs MTTR</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs">
                    <ul className="list-disc list-inside space-y-0.5">
                      {inc.actionsTaken.map((action, i) => (
                        <li key={i} className="truncate">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-700 dark:text-slate-300 max-w-sm">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Lesson:
                    </span>{" "}
                    {inc.keyLessonLearned}
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
