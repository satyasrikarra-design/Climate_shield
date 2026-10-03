import React, { useState } from "react";
import {
  SmartRiskThresholds,
  OperationalRole,
} from "../../types/climate";
import {
  Settings,
  Sliders,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  RotateCcw,
  Save,
  Thermometer,
  CloudRain,
  Gauge,
  Info,
} from "lucide-react";
import { DEFAULT_SMART_THRESHOLDS } from "../../services/platformState";

interface SettingsThresholdsViewProps {
  thresholds: SmartRiskThresholds;
  onUpdateThresholds: (newThresholds: SmartRiskThresholds) => void;
  activeRole: OperationalRole;
  onSelectRole: (role: OperationalRole) => void;
}

export const SettingsThresholdsView: React.FC<SettingsThresholdsViewProps> = ({
  thresholds,
  onUpdateThresholds,
  activeRole,
  onSelectRole,
}) => {
  const [formThresholds, setFormThresholds] = useState<SmartRiskThresholds>(thresholds);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(formThresholds);
    setSaveMessage("Smart risk thresholds updated successfully. Active alerts and monitoring will evaluate against these new limits.");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleResetDefaults = () => {
    setFormThresholds(DEFAULT_SMART_THRESHOLDS);
    onUpdateThresholds(DEFAULT_SMART_THRESHOLDS);
    setSaveMessage("Thresholds reset to standard IMD / NDMA municipal resilience baselines.");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const rolePermissions = [
    {
      role: "Administrator" as OperationalRole,
      title: "System Administrator",
      desc: "Full operational authority: add/remove monitored cities, adjust meteorological thresholds, and manage system roles.",
      badge: "Full Control",
    },
    {
      role: "Risk Analyst" as OperationalRole,
      title: "Climate Risk Analyst",
      desc: "Monitor live atmospheric telemetry, run algorithmic risk calculations, evaluate contributing factors, and assess micro-zone vulnerability.",
      badge: "Analysis & Telemetry",
    },
    {
      role: "Response Operator" as OperationalRole,
      title: "Emergency Response Operator",
      desc: "Acknowledge new incoming alerts, create operational incident tickets, assign tactical tasks to field squads, and report recovery status.",
      badge: "Alerts & Task Dispatch",
    },
    {
      role: "Manager" as OperationalRole,
      title: "Municipal Disaster Manager",
      desc: "Authorize inter-departmental incident escalations, command regional heavy equipment allocation, and formalize incident resolution debriefs.",
      badge: "Escalation & Resolution",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sky-600" />
          <span className="text-xs uppercase tracking-widest text-sky-600 font-bold">
            Platform Configuration
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Smart Risk Thresholds &amp; Operational Roles
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Calibrate automated trigger points for climate alerts and manage operational role permissions across the ClimateShield platform.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 2. Smart Risk Thresholds Form (Section 5) */}
      <form
        onSubmit={handleSave}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-600" />
              <span>Smart Risk Threshold Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When live telemetry or model scenarios exceed these values, alerts automatically trigger into the NEW queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Standards</span>
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Temperature Critical Threshold */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Critical Temperature</span>
              </label>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {formThresholds.temperatureCriticalC} °C
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="50"
              step="0.5"
              value={formThresholds.temperatureCriticalC}
              onChange={(e) =>
                setFormThresholds({
                  ...formThresholds,
                  temperatureCriticalC: parseFloat(e.target.value),
                })
              }
              className="w-full cursor-pointer accent-rose-600"
            />
            <p className="text-[11px] text-slate-500">
              Triggers Critical Heat Alert &amp; UHI urban warning.
            </p>
          </div>

          {/* 24h Rainfall Critical Threshold */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-500" />
                <span>24h Rainfall Accumulation</span>
              </label>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {formThresholds.rainfallCritical24hMm} mm
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={formThresholds.rainfallCritical24hMm}
              onChange={(e) =>
                setFormThresholds({
                  ...formThresholds,
                  rainfallCritical24hMm: parseFloat(e.target.value),
                })
              }
              className="w-full cursor-pointer accent-sky-600"
            />
            <p className="text-[11px] text-slate-500">
              Threshold where prolonged precipitation saturates local delta drainage.
            </p>
          </div>

          {/* Rainfall Intensity Threshold */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>Downpour Intensity</span>
              </label>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {formThresholds.rainfallIntensityCriticalMmH} mm/hr
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="1"
              value={formThresholds.rainfallIntensityCriticalMmH}
              onChange={(e) =>
                setFormThresholds({
                  ...formThresholds,
                  rainfallIntensityCriticalMmH: parseFloat(e.target.value),
                })
              }
              className="w-full cursor-pointer accent-sky-600"
            />
            <p className="text-[11px] text-slate-500">
              Flash storm burst rate overwhelming culvert and subway storm drains.
            </p>
          </div>

          {/* Critical Risk Score Threshold */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Critical Score Threshold</span>
              </label>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {formThresholds.criticalScoreThreshold} / 100
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="90"
              step="1"
              value={formThresholds.criticalScoreThreshold}
              onChange={(e) =>
                setFormThresholds({
                  ...formThresholds,
                  criticalScoreThreshold: parseInt(e.target.value),
                })
              }
              className="w-full cursor-pointer accent-rose-600"
            />
            <p className="text-[11px] text-slate-500">
              Composite severity qualifying an event as CRITICAL requiring response.
            </p>
          </div>

          {/* High Risk Score Threshold */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>High Score Threshold</span>
              </label>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {formThresholds.highScoreThreshold} / 100
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="70"
              step="1"
              value={formThresholds.highScoreThreshold}
              onChange={(e) =>
                setFormThresholds({
                  ...formThresholds,
                  highScoreThreshold: parseInt(e.target.value),
                })
              }
              className="w-full cursor-pointer accent-amber-600"
            />
            <p className="text-[11px] text-slate-500">
              Score marking municipal zone for heightened surveillance alert.
            </p>
          </div>
        </div>
      </form>

      {/* 3. Operational Roles Matrix (Section 8) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Operational Roles &amp; Incident Authority Matrix</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click any role below to instantly assume its privileges and test platform behavior during live evaluation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rolePermissions.map((rp) => {
            const isCurrent = activeRole === rp.role;
            return (
              <div
                key={rp.role}
                onClick={() => onSelectRole(rp.role)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  isCurrent
                    ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {rp.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isCurrent ? "Active Role" : rp.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rp.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
