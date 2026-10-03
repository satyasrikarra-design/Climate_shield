import React, { useState } from "react";
import {
  ClimateIncident,
  IncidentLifecycleStatus,
  IncidentTask,
  TaskStatus,
  EscalationLevel,
  OperationalRole,
  PreparednessPlan,
} from "../../types/climate";
import {
  ClipboardList,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Droplets,
  Flame,
  BookOpen,
  Calendar,
  Check,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface IncidentsResponseViewProps {
  incidents: ClimateIncident[];
  activeRole: OperationalRole;
  preparednessPlans: PreparednessPlan[];
  onUpdateIncidentStatus: (incidentId: string, status: IncidentLifecycleStatus) => void;
  onAddTaskToIncident: (incidentId: string, task: IncidentTask) => void;
  onUpdateTaskStatus: (incidentId: string, taskId: string, status: TaskStatus) => void;
  onEscalateIncident: (incidentId: string, newLevel: EscalationLevel, reason: string) => void;
  onAttachPlanToIncident: (incidentId: string, planId: string) => void;
  onSaveResolutionNotes: (incidentId: string, notes: string) => void;
  selectedIncidentId?: string;
  onSelectIncidentId: (id: string) => void;
}

export const IncidentsResponseView: React.FC<IncidentsResponseViewProps> = ({
  incidents,
  activeRole,
  preparednessPlans,
  onUpdateIncidentStatus,
  onAddTaskToIncident,
  onUpdateTaskStatus,
  onEscalateIncident,
  onAttachPlanToIncident,
  onSaveResolutionNotes,
  selectedIncidentId,
  onSelectIncidentId,
}) => {
  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  // Local state for adding a task
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("Drainage Quick Response Team Alpha");
  const [taskDepartment, setTaskDepartment] = useState("Engineering & Drainage");
  const [taskPriority, setTaskPriority] = useState<IncidentTask["priority"]>("High");
  const [taskDueTime, setTaskDueTime] = useState("Within 45 mins");

  // Local state for Escalation modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateLevel, setEscalateLevel] = useState<EscalationLevel>(
    "Level 2 - Municipal Manager"
  );
  const [escalateReason, setEscalateReason] = useState("");

  // Local state for resolution notes
  const [resolutionNotesInput, setResolutionNotesInput] = useState(
    activeIncident?.resolutionNotes || ""
  );

  const lifecycleStages: IncidentLifecycleStatus[] = [
    "DETECTED",
    "ACKNOWLEDGED",
    "RESPONSE",
    "RECOVERY",
    "RESOLVED",
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeIncident) return;

    const newTask: IncidentTask = {
      id: `tsk-${activeIncident.id}-${Date.now()}`,
      incidentId: activeIncident.id,
      title: taskTitle.trim(),
      assignedTo: taskAssignedTo,
      department: taskDepartment,
      priority: taskPriority,
      dueTime: taskDueTime,
      status: "PENDING",
      notes: "Assigned via ClimateShield Incident Response Center.",
    };

    onAddTaskToIncident(activeIncident.id, newTask);
    setTaskTitle("");
    setShowAddTaskModal(false);
  };

  const handleExecuteEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncident || !escalateReason.trim()) return;

    onEscalateIncident(activeIncident.id, escalateLevel, escalateReason.trim());
    setEscalateReason("");
    setShowEscalateModal(false);
  };

  // One-click populate standard tasks from attached preparedness plan
  const handlePopulateStandardPlaybookTasks = () => {
    if (!activeIncident) return;
    const plan =
      preparednessPlans.find((p) => p.id === activeIncident.attachedPlanId) ||
      preparednessPlans[0];

    (plan?.standardActions || []).slice(0, 3).forEach((action, idx) => {
      const newTask: IncidentTask = {
        id: `tsk-playbook-${Date.now()}-${idx}`,
        incidentId: activeIncident.id,
        title: action,
        assignedTo:
          plan?.leadAgencies && plan.leadAgencies.length > 0
            ? plan.leadAgencies[idx % plan.leadAgencies.length]
            : "Disaster Response Unit",
        department: "Disaster Operations",
        priority: idx === 0 ? "Critical" : "High",
        dueTime: "Immediate Standard Operating Procedure",
        status: "PENDING",
      };
      onAddTaskToIncident(activeIncident.id, newTask);
    });
  };

  const activeTasks = activeIncident?.tasks || [];
  const completedTasksCount =
    activeTasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasksCount = activeTasks.length;
  const taskProgressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Operational Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            <span>Incident Management &amp; Tactical Response Lifecycle</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coordination hub for high-risk climate events: task allocation, inter-agency escalation, recovery tracking, and resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Active Incidents: {incidents.filter((i) => i.status !== "RESOLVED").length}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Resolved: {incidents.filter((i) => i.status === "RESOLVED").length}
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column: Incident Directory vs Active Incident Response Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Incidents Directory */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Incident Records Directory
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {incidents.map((inc) => {
              const isSelected = inc.id === activeIncident?.id;
              const isCritical = inc.severity === "CRITICAL";
              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        #{inc.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {inc.locationName}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isCritical
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {inc.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-mono">
                      Stage: {inc.status}
                    </span>
                    <span className="text-slate-400">
                      {(inc.tasks || []).filter((t) => t.status === "COMPLETED").length}/{(inc.tasks || []).length} Tasks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Response Workspace (Section 7, 9, 10, 11, 12) */}
        {activeIncident && (
          <div className="lg:col-span-8 space-y-5">
            {/* Active Incident Header & Status Pipeline */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2.5 py-0.5 rounded-md">
                      #{activeIncident.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeIncident.locationName}: {activeIncident.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Logged: {activeIncident.createdAt} &bull; Owner: {activeIncident.ownerName} ({activeIncident.ownerRole})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      activeIncident.severity === "CRITICAL"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-300"
                    }`}
                  >
                    Risk Score: {activeIncident.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Lifecycle Stage Stepper (Section 12: DETECTED -> ACKNOWLEDGED -> RESPONSE -> RECOVERY -> RESOLVED) */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Incident Response Lifecycle Stage
                </div>
                <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  {lifecycleStages.map((stage, idx) => {
                    const isPassed =
                      lifecycleStages.indexOf(activeIncident.status) >= idx;
                    const isCurrent = activeIncident.status === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => onUpdateIncidentStatus(activeIncident.id, stage)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                            : isPassed
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                        title="Click to transition incident stage"
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operational Brief & Escalation Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Incident Summary
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeIncident.summary}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">
                      Escalation Status
                    </span>
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Escalate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {activeIncident.escalationLevel}
                  </div>
                  {activeIncident.escalationReason && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Reason:</strong> {activeIncident.escalationReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Attached Preparedness Plan Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Attached Preparedness Plan:{" "}
                    <strong>
                      {preparednessPlans.find((p) => p.id === activeIncident.attachedPlanId)?.name ||
                        "Standard Operating Playbook"}
                    </strong>
                  </span>
                </div>

                <button
                  onClick={handlePopulateStandardPlaybookTasks}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition flex items-center gap-1 shrink-0"
                  title="Automatically populate standard actions into the incident task list"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Populate Playbook Tasks</span>
                </button>
              </div>
            </div>

            {/* Task Assignment Board (Section 9) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Tactical Task Assignment Board</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {completedTasksCount}/{totalTasksCount} Completed
                    </span>
                  </h4>
                  <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${taskProgressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Add Task Modal / Form */}
              {showAddTaskModal && (
                <form
                  onSubmit={handleCreateTask}
                  className="p-4 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Add Operational Action Task to Incident #{activeIncident.id}</span>
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Task Directive
                    </label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Deploy 150HP diesel dewatering pump unit to Canal Sump"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Assigned Squad / Person
                      </label>
                      <input
                        type="text"
                        value={taskAssignedTo}
                        onChange={(e) => setTaskAssignedTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Priority Level
                      </label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Precautionary">Precautionary</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Target Resolution SLA
                      </label>
                      <input
                        type="text"
                        value={taskDueTime}
                        onChange={(e) => setTaskDueTime(e.target.value)}
                        placeholder="e.g. Within 30 mins"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                    >
                      Assign Task
                    </button>
                  </div>
                </form>
              )}

              {/* Task Cards List (Section 9: PENDING -> IN PROGRESS -> COMPLETED) */}
              <div className="space-y-2.5">
                {(activeIncident.tasks || []).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                    No tasks assigned yet. Click &quot;Populate Playbook Tasks&quot; or &quot;Create Task&quot; above.
                  </div>
                ) : (
                  (activeIncident.tasks || []).map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              task.priority === "Critical"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {task.title}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>Assigned: {task.assignedTo} ({task.department})</span>
                          <span>&bull;</span>
                          <span>Due: {task.dueTime}</span>
                        </div>

                        {task.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Note:</strong> {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Status Stepper Button for Task */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(["PENDING", "IN PROGRESS", "COMPLETED"] as TaskStatus[]).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                onUpdateTaskStatus(activeIncident.id, task.id, status)
                              }
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                                task.status === status
                                  ? status === "COMPLETED"
                                  ? "bg-emerald-600 text-white"
                                  : status === "IN PROGRESS"
                                  ? "bg-amber-600 text-white"
                                  : "bg-slate-700 text-white"
                                  : "bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                              }`}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recovery Tracking & Resolution Notes (Section 12) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Recovery Tracking &amp; Incident Resolution</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Response Initiated:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeIncident.responseStartedAt || "10:25 AM Today"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Recovery Stage:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeIncident.recoveryStartedAt || "Pending Full Dewatering"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Resolved At:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeIncident.resolvedAt || "Active"}
                  </span>
                </div>
              </div>

              {/* Resolution Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Post-Response Operational Debrief &amp; Resolution Notes
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={resolutionNotesInput}
                    onChange={(e) => setResolutionNotesInput(e.target.value)}
                    placeholder="Enter debrief notes on sluice clearance, pump effectiveness, and infrastructure restoration..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() =>
                      onSaveResolutionNotes(activeIncident.id, resolutionNotesInput)
                    }
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shrink-0 cursor-pointer self-end"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Timeline Audit Log */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Incident Audit Timeline
                </span>
                <div className="space-y-2">
                  {activeIncident.timeline.map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-start gap-2.5"
                    >
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">
                        {event.timestamp}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {event.title} &bull; <span className="text-slate-500 font-normal">{event.actor}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {event.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Escalation Modal */}
            {showEscalateModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleExecuteEscalation}
                  className="w-full max-w-md p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Escalate Incident #{activeIncident.id}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowEscalateModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Escalation Hierarchy Target
                    </label>
                    <select
                      value={escalateLevel}
                      onChange={(e) => setEscalateLevel(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Level 2 - Municipal Manager">
                        Level 2 - Municipal Manager
                      </option>
                      <option value="Level 3 - Disaster Management Team">
                        Level 3 - Disaster Management Team (SDMA / NDRF)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Reason for Escalation
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder="e.g. Hydraulic capacity exceeded in municipal drainage basin; external emergency pumping resources required immediately."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                    >
                      Confirm Escalation
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
