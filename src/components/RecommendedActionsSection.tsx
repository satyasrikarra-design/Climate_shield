import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  MapPin,
  Check,
  Share2,
} from "lucide-react";
import { RecommendedAction, RiskAssessment, CityDistrict } from "../types/climate";

interface RecommendedActionsSectionProps {
  actions: RecommendedAction[];
  assessment: RiskAssessment;
  district: CityDistrict;
}

export function RecommendedActionsSection({
  actions: initialActions,
  assessment,
  district,
}: RecommendedActionsSectionProps) {
  const [actions, setActions] = useState<RecommendedAction[]>(initialActions);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sync state whenever actions prop updates (e.g., hazard switches between Flood and Heat)
  useEffect(() => {
    setActions(initialActions);
  }, [initialActions, assessment.hazard]);

  const toggleActionStatus = (id: string) => {
    setActions((prev) =>
      prev.map((act) => {
        if (act.id !== id) return act;
        const nextStatus =
          act.status === "Pending"
            ? "In Progress"
            : act.status === "In Progress"
            ? "Completed"
            : "Pending";
        return { ...act, status: nextStatus };
      })
    );
  };

  const handleCopyDispatchPlan = () => {
    const text = `CLIMATESHIELD MUNICIPAL DIRECTIVES
Location: ${district.name}
Hazard: ${assessment.hazard} (Score: ${assessment.score}/100 - ${assessment.level})
Timestamp: ${new Date().toLocaleString()}

RECOMMENDED ACTIONS:
${actions
  .map(
    (a, i) =>
      `${i + 1}. [${a.status.toUpperCase()}] ${a.title}
   Department: ${a.department}
   Target: ${a.targetZone}
   Directive: ${a.description}`
  )
  .join("\n\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const completedCount = actions.filter((a) => a.status === "Completed").length;

  return (
    <section
      id="section-recommended-actions"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              RECOMMENDED ACTIONS
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Municipal Protocol for {assessment.hazard} ({district.name})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Targeted directives dynamically generated based on detected hazard &amp; severity
          </p>
        </div>

        <button
          onClick={handleCopyDispatchPlan}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copiedNotification ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Directives Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Directives</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Status Banner */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Action Progress:
          </span>
          <span className="text-slate-500">
            {completedCount} of {actions.length} protocols completed
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click status to toggle (Pending &rarr; In Progress &rarr; Completed)
        </span>
      </div>

      {/* Action Cards List */}
      <div className="space-y-3">
        {actions.map((action) => {
          const priorityStyles = {
            Critical: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200",
            High: "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200",
            Moderate: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200",
            Precautionary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200",
          }[action.priority];

          const statusBadgeStyles = {
            Pending: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border-slate-200",
            "In Progress": "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200 border-amber-300",
            Completed: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 border-emerald-300",
          }[action.status];

          return (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityStyles}`}>
                    {action.priority}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {action.title}
                  </h4>
                </div>

                <button
                  onClick={() => toggleActionStatus(action.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${statusBadgeStyles}`}
                  title="Click to advance status"
                >
                  {action.status === "Completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : action.status === "In Progress" ? (
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Status: {action.status}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {action.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead Division: <strong className="text-slate-700 dark:text-slate-300">{action.department}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Zone: <strong className="text-slate-700 dark:text-slate-300">{action.targetZone}</strong></span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
