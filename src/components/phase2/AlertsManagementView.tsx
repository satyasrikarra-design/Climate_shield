import React, { useState } from "react";
import {
  ClimateAlert,
  AlertLifecycleStatus,
  NavigationTab,
  OperationalRole,
} from "../../types/climate";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  ClipboardList,
  ShieldCheck,
  Droplets,
  Flame,
  ArrowRight,
  Filter,
  Check,
  UserPlus,
  ExternalLink,
} from "lucide-react";

interface AlertsManagementViewProps {
  alerts: ClimateAlert[];
  activeRole: OperationalRole;
  onUpdateAlertStatus: (alertId: string, status: AlertLifecycleStatus) => void;
  onFormalizeIncidentFromAlert: (alert: ClimateAlert) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const AlertsManagementView: React.FC<AlertsManagementViewProps> = ({
  alerts,
  activeRole,
  onUpdateAlertStatus,
  onFormalizeIncidentFromAlert,
  onNavigateTab,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const safeAlerts = alerts || [];

  const filteredAlerts = safeAlerts.filter((alert) => {
    if (filterStatus !== "ALL" && alert.status !== filterStatus) return false;
    if (filterSeverity !== "ALL" && alert.level !== filterSeverity) return false;
    return true;
  });

  const getStatusColor = (status: AlertLifecycleStatus) => {
    switch (status) {
      case "NEW":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
      case "ACKNOWLEDGED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "ASSIGNED":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300";
      case "IN PROGRESS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    }
  };

  const lifecycleStages: AlertLifecycleStatus[] = [
    "NEW",
    "ACKNOWLEDGED",
    "ASSIGNED",
    "IN PROGRESS",
    "RESOLVED",
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header & Operational Lifecycle Pipeline (Section 6) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Operational Climate Alert Lifecycle Management</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage telemetry-triggered thresholds, operator acknowledgement, and incident formalization.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Total Alerts: {safeAlerts.length}
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              Active: {safeAlerts.filter((a) => a.status !== "RESOLVED").length}
            </span>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="flex items-center justify-between gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto text-[11px] font-bold">
          {lifecycleStages.map((stage, idx) => {
            const count = safeAlerts.filter((a) => a.status === stage).length;
            return (
              <React.Fragment key={stage}>
                <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">{stage}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {count}
                  </span>
                </div>
                {idx < lifecycleStages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filters:</span>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Lifecycle States</option>
            <option value="NEW">NEW</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
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
          </select>
        </div>
      </div>

      {/* 3. Alert Cards Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl bg-white dark:bg-slate-900">
            No alerts match the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === "CRITICAL";
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs space-y-3 transition ${
                  isCritical
                    ? "border-rose-300 dark:border-rose-900/80 bg-rose-50/10 dark:bg-rose-950/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Alert Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {alert.id}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.locationName}
                    </span>
                    <span className="text-xs text-slate-400">&bull; {alert.state || "India"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                        alert.status
                      )}`}
                    >
                      Status: {alert.status}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {alert.level} ({alert.score}/100)
                    </span>
                  </div>
                </div>

                {/* Threat Details & Reason */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    {alert.hazard === "Flood Risk" ? (
                      <Droplets className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Flame className="w-4 h-4 text-amber-600" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {alert.message}
                  </p>

                  {alert.thresholdExceeded && (
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                      <strong>Threshold Trigger:</strong> {alert.thresholdExceeded}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <strong>Recommended Immediate Guidance:</strong> {alert.actionGuidance}
                  </div>
                </div>

                {/* Metadata & Operator Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Detected: {alert.issuedAt}
                    </span>
                    {alert.acknowledgedBy && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Ack: {alert.acknowledgedBy}
                      </span>
                    )}
                  </div>

                  {/* Operational Transition Buttons (Section 6, 7) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {alert.status === "NEW" && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, "ACKNOWLEDGED")}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Acknowledge Alert</span>
                      </button>
                    )}

                    {alert.status === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, "ASSIGNED")}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Assign Response Team</span>
                      </button>
                    )}

                    {/* Convert Alert to Incident button */}
                    {!alert.incidentId && alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => onFormalizeIncidentFromAlert(alert)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition flex items-center gap-1 shadow-xs"
                      >
                        <ClipboardList className="w-3 h-3" />
                        <span>Formalize into Incident</span>
                      </button>
                    )}

                    {alert.incidentId && (
                      <button
                        onClick={() => onNavigateTab("incidents")}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer flex items-center gap-1"
                      >
                        <span>View Incident #{alert.incidentId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, "RESOLVED")}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
