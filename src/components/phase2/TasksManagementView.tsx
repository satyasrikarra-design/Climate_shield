import React, { useState, useMemo } from "react";
import {
  ClimateIncident,
  IncidentTask,
  TaskStatus,
  OperationalRole,
  NavigationTab,
} from "../../types/climate";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Flame,
  CloudRain,
  UserCheck,
} from "lucide-react";

interface TasksManagementViewProps {
  incidents: ClimateIncident[];
  activeRole: OperationalRole;
  onUpdateTaskStatus?: (incidentId: string, taskId: string, status: TaskStatus) => void;
  onAddTask?: (incidentId: string, task: Omit<IncidentTask, "id" | "incidentId">) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const TasksManagementView: React.FC<TasksManagementViewProps> = ({
  incidents,
  activeRole,
  onUpdateTaskStatus,
  onAddTask,
  onNavigateTab,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New task form state
  const [targetIncidentId, setTargetIncidentId] = useState<string>(incidents[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newDepartment, setNewDepartment] = useState("Disaster Operations");
  const [newPriority, setNewPriority] = useState<IncidentTask["priority"]>("High");
  const [newDueTime, setNewDueTime] = useState("Within 45 mins");
  const [newNotes, setNewNotes] = useState("");

  // Flatten all tasks with their incident metadata
  const allTasks = useMemo(() => {
    const list: {
      task: IncidentTask;
      incident: ClimateIncident;
    }[] = [];

    incidents.forEach((inc) => {
      (inc.tasks || []).forEach((task) => {
        list.push({ task, incident: inc });
      });
    });

    return list;
  }, [incidents]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(({ task, incident }) => {
      if (selectedStatus !== "all" && task.status !== selectedStatus) return false;
      if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
      if (selectedIncident !== "all" && incident.id !== selectedIncident) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesAssignee = task.assignedTo.toLowerCase().includes(q);
        const matchesDept = task.department.toLowerCase().includes(q);
        const matchesLoc = incident.locationName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAssignee && !matchesDept && !matchesLoc) return false;
      }
      return true;
    });
  }, [allTasks, selectedStatus, selectedPriority, selectedIncident, searchQuery]);

  const canEdit =
    activeRole === "ADMINISTRATOR" ||
    activeRole === "RESPONSE OPERATOR" ||
    activeRole === "MANAGER";

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAssignedTo.trim() || !onAddTask) return;

    onAddTask(targetIncidentId, {
      title: newTitle.trim(),
      assignedTo: newAssignedTo.trim(),
      department: newDepartment,
      priority: newPriority,
      dueTime: newDueTime,
      status: "PENDING",
      notes: newNotes.trim() || "Task initialized via Tactical Response Queue.",
    });

    // Reset & close
    setNewTitle("");
    setNewAssignedTo("");
    setNewNotes("");
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            COMPLETED
          </span>
        );
      case "IN PROGRESS":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-spin" />
            IN PROGRESS
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            PENDING
          </span>
        );
    }
  };

  // Quick Preset Handlers for Flood & Heat
  const applyFloodPreset = () => {
    setNewTitle("Inspect drainage culverts and deploy dewatering pumps");
    setNewDepartment("Engineering & Drainage");
    setNewAssignedTo("Rapid Dewatering Unit Alpha");
    setNewPriority("Critical");
    setNewDueTime("Within 30 mins");
    setNewNotes("Inspect railway subway sumps and clear debris grates.");
  };

  const applyHeatPreset = () => {
    setNewTitle("Activate emergency public drinking water kiosks & heat advisory");
    setNewDepartment("Public Health Surveillance");
    setNewAssignedTo("Municipal Health Response Squad");
    setNewPriority("High");
    setNewDueTime("Within 45 mins");
    setNewNotes("Distribute oral rehydration salts at central transit concourses.");
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Section 9 &bull; Response Operations
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {allTasks.length} Active Operational Directives
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Tactical Response Task Management
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Coordinate field interventions across flood and extreme heat emergencies. Track task
              execution from{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                PENDING &rarr; IN PROGRESS &rarr; COMPLETED
              </strong>{" "}
              with real-time accountability.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Response Task</span>
            </button>
          )}
        </div>

        {/* Task Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Dispatched Tasks
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {allTasks.length}
            </div>
            <span className="text-[11px] text-slate-500">Across {incidents.length} active incidents</span>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Pending Acknowledgment
            </span>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {allTasks.filter((t) => t.task.status === "PENDING").length}
            </div>
            <span className="text-[11px] text-amber-600">Awaiting squad deployment</span>
          </div>

          <div className="p-3.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40">
            <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Active In Progress
            </span>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-1">
              {allTasks.filter((t) => t.task.status === "IN PROGRESS").length}
            </div>
            <span className="text-[11px] text-sky-600">Field units currently executing</span>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Successfully Completed
            </span>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {allTasks.filter((t) => t.task.status === "COMPLETED").length}
            </div>
            <span className="text-[11px] text-emerald-600">Verified and logged</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task name, squad, department, or district..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Incident Filter */}
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Associated Incidents</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  #{inc.id} &bull; {inc.locationName} ({inc.hazard})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.map(({ task, incident }) => {
          const isCritical = task.priority === "Critical";

          return (
            <div
              key={task.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                task.status === "COMPLETED"
                  ? "border-slate-200 dark:border-slate-800/80 opacity-80"
                  : isCritical
                  ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/10"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="space-y-2 flex-1">
                {/* Header Line */}
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(task.status)}

                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                      task.priority === "Critical"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        : task.priority === "High"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Priority: {task.priority}
                  </span>

                  <button
                    onClick={() => onNavigateTab("incidents")}
                    className="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>Incident #{incident.id}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>

                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {incident.hazard === "Heat Risk" ? (
                      <Flame className="w-3 h-3 text-orange-500" />
                    ) : (
                      <CloudRain className="w-3 h-3 text-sky-500" />
                    )}
                    <span>
                      {incident.locationName}, {incident.state}
                    </span>
                  </span>
                </div>

                {/* Task Title */}
                <h3
                  className={`text-base font-bold text-slate-900 dark:text-white ${
                    task.status === "COMPLETED" ? "line-through text-slate-500" : ""
                  }`}
                >
                  {task.title}
                </h3>

                {/* Notes & Details */}
                {task.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <strong className="font-semibold text-slate-700 dark:text-slate-300">
                      Field Notes:
                    </strong>{" "}
                    {task.notes}
                  </p>
                )}

                {/* Assignment & Due Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                      {task.assignedTo} ({task.department})
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due:</span>
                    <strong
                      className={`font-semibold ${
                        isCritical && task.status !== "COMPLETED"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {task.dueTime}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Transition Control (Lifecycle: PENDING -> IN PROGRESS -> COMPLETED) */}
              {canEdit && onUpdateTaskStatus && (
                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500">Lifecycle State:</span>
                  <div className="flex items-center gap-1">
                    {task.status !== "PENDING" && (
                      <button
                        onClick={() => onUpdateTaskStatus(incident.id, task.id, "PENDING")}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title="Revert to Pending"
                      >
                        Pending
                      </button>
                    )}

                    {task.status !== "IN PROGRESS" && (
                      <button
                        onClick={() => onUpdateTaskStatus(incident.id, task.id, "IN PROGRESS")}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/60 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-200 transition cursor-pointer flex items-center gap-1"
                        title="Mark as In Progress"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}

                    {task.status !== "COMPLETED" && (
                      <button
                        onClick={() => onUpdateTaskStatus(incident.id, task.id, "COMPLETED")}
                        className="px-3 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Complete Task"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No matching tasks found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter selection to view assigned operational tasks.
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dispatch Operational Task
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign a tactical field action to an active emergency incident.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {/* Operational Playbook Quick-Fill Buttons */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Quick-Load Protocol Template:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyFloodPreset}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 hover:bg-sky-200 flex items-center gap-1 cursor-pointer"
                >
                  <CloudRain className="w-3 h-3 text-sky-600" />
                  <span>Flood Protocol Task</span>
                </button>
                <button
                  type="button"
                  onClick={applyHeatPreset}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 hover:bg-orange-200 flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3 h-3 text-orange-600" />
                  <span>Heatwave Task</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Incident Ticket
                </label>
                <select
                  value={targetIncidentId}
                  onChange={(e) => setTargetIncidentId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      #{inc.id} &bull; {inc.locationName} ({inc.hazard}) - {inc.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Task Action Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Deploy 2x mobile pump trailers to market culvert"
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Responder / Squad
                  </label>
                  <input
                    type="text"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    placeholder="e.g., PHED Rapid Drainage Team"
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="e.g., Engineering & Drainage"
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as IncidentTask["priority"])}
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Target
                  </label>
                  <input
                    type="text"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    placeholder="e.g., Within 45 mins"
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Operational Execution Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Specific equipment, safety precautions, or contact points..."
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
