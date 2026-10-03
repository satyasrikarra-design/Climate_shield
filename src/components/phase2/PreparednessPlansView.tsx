import React, { useState } from "react";
import { PreparednessPlan, NavigationTab, ClimateIncident } from "../../types/climate";
import {
  BookOpen,
  Droplets,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface PreparednessPlansViewProps {
  plans: PreparednessPlan[];
  incidents: ClimateIncident[];
  onNavigateTab: (tab: NavigationTab) => void;
  onSelectIncidentId: (id: string) => void;
}

export const PreparednessPlansView: React.FC<PreparednessPlansViewProps> = ({
  plans,
  incidents,
  onNavigateTab,
  onSelectIncidentId,
}) => {
  const safePlans = plans || [];
  const safeIncidents = incidents || [];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(safePlans[0]?.id || "");

  const activePlan = safePlans.find((p) => p.id === selectedPlanId) || safePlans[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Hazard Standard Operating Procedures
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Municipal Climate Preparedness &amp; Early Action Playbooks
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Standardized, multi-agency protocols designed to automatically guide response operators and disaster coordination squads when climatic thresholds are breached.
        </p>
      </div>

      {/* 2. Playbook Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safePlans.map((plan) => {
          const isSelected = plan.id === activePlan?.id;
          const isFlood = plan.hazard === "Flood Risk";
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                isSelected
                  ? isFlood
                    ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-xs"
                    : "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isFlood ? (
                    <Droplets className="w-5 h-5 text-sky-600" />
                  ) : (
                    <Flame className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFlood
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {plan.hazard}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {plan.description}
              </p>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>{(plan.standardActions || []).length} Standard Operating Actions</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Ready for Dispatch
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed Protocol Specifications */}
      {activePlan && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activePlan.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applicable to: {activePlan.targetZonesExample}
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Approved Inter-Agency Protocol
            </div>
          </div>

          {/* Lead Agencies Involved */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Mandated Coordinating Agencies</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(activePlan?.leadAgencies || []).map((agency, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>{agency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Operational Directives */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tactical Action Sequence</span>
            </span>
            <div className="space-y-2">
              {(activePlan?.standardActions || []).map((action, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {action}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard SLA: Within 30 to 60 minutes of alert acknowledgement
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents Using this Plan */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Incidents Governed by this Playbook
            </span>
            <div className="space-y-1.5">
              {(safeIncidents || [])
                .filter((inc) => inc.attachedPlanId === activePlan?.id)
                .map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncidentId(inc.id);
                      onNavigateTab("incidents");
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        #{inc.id}
                      </span>
                      <span>
                        {inc.locationName} &bull; {inc.title}
                      </span>
                    </div>
                    <span className="text-sky-600 font-semibold flex items-center gap-1">
                      <span>View in Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
