import { AlertOctagon, AlertTriangle, Info, BellRing, Radio } from "lucide-react";
import { ClimateAlert } from "../types/climate";

interface ActiveAlertSectionProps {
  alert: ClimateAlert;
}

export function ActiveAlertSection({ alert }: ActiveAlertSectionProps) {
  const { level, hazard, title, message, actionGuidance, locationName, score, code, issuedAt } = alert;

  const isCritical = level === "CRITICAL";
  const isHigh = level === "HIGH";
  const isMedium = level === "MEDIUM";

  const bannerTheme = isCritical
    ? {
        container: "bg-rose-600 text-white border-rose-700 shadow-rose-600/20",
        badge: "bg-black/30 text-rose-100 border-rose-400/40",
        icon: AlertOctagon,
        glow: "animate-pulse",
      }
    : isHigh
    ? {
        container: "bg-orange-600 text-white border-orange-700 shadow-orange-600/20",
        badge: "bg-black/30 text-orange-100 border-orange-400/40",
        icon: AlertTriangle,
        glow: "",
      }
    : isMedium
    ? {
        container: "bg-amber-600 text-white border-amber-700 shadow-amber-600/20",
        badge: "bg-black/30 text-amber-100 border-amber-400/40",
        icon: AlertTriangle,
        glow: "",
      }
    : {
        container: "bg-emerald-700 text-white border-emerald-800 shadow-emerald-700/20",
        badge: "bg-black/20 text-emerald-100 border-emerald-400/40",
        icon: Info,
        glow: "",
      };

  const IconComponent = bannerTheme.icon;

  return (
    <section
      id="section-active-alert"
      className={`rounded-xl border p-5 sm:p-6 shadow-md ${bannerTheme.container} transition-all`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Icon & Heading */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shrink-0 mt-0.5">
            <IconComponent className={`w-7 h-7 ${bannerTheme.glow}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${bannerTheme.badge}`}>
                {code}
              </span>
              <span className="text-xs font-semibold opacity-90">
                Issued for {locationName} at {issuedAt}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>

            <p className="text-sm font-medium opacity-95 mt-1 max-w-3xl leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Right Action Guidance Box */}
        <div className="md:border-l md:border-white/30 md:pl-5 flex flex-col justify-center min-w-[240px]">
          <span className="text-[11px] uppercase tracking-wider font-bold opacity-80 flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Directive / Guidance:
          </span>
          <div className="text-base font-black tracking-tight bg-white/15 px-3 py-2 rounded-lg backdrop-blur-xs border border-white/20">
            {actionGuidance}
          </div>
          <span className="text-[11px] opacity-80 mt-1">
            Calculated Risk Score: <strong>{score}/100</strong> ({hazard})
          </span>
        </div>
      </div>
    </section>
  );
}
