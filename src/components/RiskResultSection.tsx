import { ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, HelpCircle } from "lucide-react";
import { RiskAssessment, CityDistrict } from "../types/climate";

interface RiskResultSectionProps {
  assessment: RiskAssessment;
  district: CityDistrict;
}

export function RiskResultSection({
  assessment,
  district,
}: RiskResultSectionProps) {
  const { score, level, hazard, contributingFactors, summaryStatement } = assessment;

  // Level Badges & Colors
  const levelStyles = {
    LOW: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-600 text-white",
      ring: "text-emerald-500",
      icon: CheckCircle,
    },
    MEDIUM: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-600 text-white",
      ring: "text-amber-500",
      icon: AlertTriangle,
    },
    HIGH: {
      bg: "bg-orange-50 dark:bg-orange-950/40",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-300",
      badge: "bg-orange-600 text-white",
      ring: "text-orange-500",
      icon: AlertTriangle,
    },
    CRITICAL: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      text: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-600 text-white",
      ring: "text-rose-500",
      icon: ShieldAlert,
    },
  }[level];

  const IconComponent = levelStyles.icon;

  return (
    <section
      id="section-risk-result"
      className={`rounded-xl border ${levelStyles.border} ${levelStyles.bg} p-5 sm:p-6 shadow-xs transition-all`}
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${levelStyles.badge}`}>
              CLIMATE RISK ASSESSMENT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Calculated at {assessment.calculatedAt}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {district.name} Resilience Evaluation
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400">Methodology:</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Transparent Rule-Based Scoring (0–100)
          </span>
        </div>
      </div>

      {/* 4 Primary Assessment Output Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Metric 1: Location */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Target Location
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {district.name}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {district.type} ({district.elevationM}m elevation)
          </span>
        </div>

        {/* Metric 2: Risk Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Risk Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black ${levelStyles.text}`}>
              {score}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                level === "CRITICAL"
                  ? "bg-rose-600"
                  : level === "HIGH"
                  ? "bg-orange-500"
                  : level === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Risk Level */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Risk Classification
          </span>
          <div className="flex items-center gap-2">
            <IconComponent className={`w-6 h-6 ${levelStyles.text}`} />
            <span className={`text-2xl font-black tracking-tight ${levelStyles.text}`}>
              {level}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {level === "CRITICAL" && "Immediate emergency intervention"}
            {level === "HIGH" && "Proactive municipal warning"}
            {level === "MEDIUM" && "Heightened localized monitoring"}
            {level === "LOW" && "Routine monitoring & baseline safety"}
          </span>
        </div>

        {/* Metric 4: Detected Hazard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Detected Primary Hazard
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {hazard}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {hazard === "Flood Risk"
              ? "Pluvial Runoff & Drainage Surcharge"
              : "Thermal Mass & Ambient Heat Stress"}
          </span>
        </div>
      </div>

      {/* Summary Narrative Statement */}
      <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-5">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {summaryStatement}
        </p>
      </div>

      {/* Transparent Contributing Factors Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Why Was This Score Generated? — Contributing Factors
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            {contributingFactors.length} Primary Causal Triggers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contributingFactors.map((cf, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  &bull; {cf.factor}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cf.impact === "Critical"
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                      : cf.impact === "High"
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {cf.impact} Impact (+{cf.scoreImpact} pts)
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Observed Value: <strong className="text-slate-900 dark:text-white">{cf.value}</strong>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {cf.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
