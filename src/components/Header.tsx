import { Shield, Sparkles, Activity } from "lucide-react";
import { AppWorkflowState } from "../types/climate";

interface HeaderProps {
  workflowState: AppWorkflowState;
}

export function Header({ workflowState }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                ClimateShield
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PHASE 1 MVP
              </span>
            </div>
            <p className="text-xs font-medium text-slate-300 tracking-wide">
              “Turning Climate Data into Early Action.”
            </p>
          </div>
        </div>

        {/* System Workflow Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Workflow Stage:</span>
            <span className="font-semibold text-slate-200">
              {workflowState === "initial" && "1. Awaiting Location / Data Load"}
              {workflowState === "data_loaded" && "2. Environmental Data Ready"}
              {workflowState === "analyzing" && "3. Running Risk Engine..."}
              {workflowState === "analyzed" && "4. Risk & Alert Generated"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Demo Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
