import React, { useState, useMemo } from "react";
import {
  RecoveryRecord,
  RecoveryStage,
  ClimateIncident,
  CityDistrict,
  OperationalRole,
  NavigationTab,
} from "../../types/climate";
import {
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ShieldCheck,
  Building2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface RecoveryTrackingViewProps {
  recoveryRecords: RecoveryRecord[];
  incidents: ClimateIncident[];
  locations: CityDistrict[];
  activeRole: OperationalRole;
  onUpdateRecoveryRecord?: (
    id: string,
    updates: Partial<Omit<RecoveryRecord, "id">>
  ) => void;
  onAddRecoveryRecord?: (record: Omit<RecoveryRecord, "id">) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const RecoveryTrackingView: React.FC<RecoveryTrackingViewProps> = ({
  recoveryRecords,
  incidents,
  locations,
  activeRole,
  onUpdateRecoveryRecord,
  onAddRecoveryRecord,
  onNavigateTab,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New recovery form state
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || ""
  );
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<RecoveryRecord["assetType"]>("Road");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [restorationAction, setRestorationAction] = useState("");
  const [targetCompletion, setTargetCompletion] = useState("Within 48 hours");

  const canEdit =
    activeRole === "ADMINISTRATOR" ||
    activeRole === "RESPONSE OPERATOR" ||
    activeRole === "MANAGER";

  // Filter records
  const filteredRecords = useMemo(() => {
    return recoveryRecords.filter((rec) => {
      if (selectedStage !== "all" && rec.stage !== selectedStage) return false;
      if (selectedLocation !== "all" && rec.locationId !== selectedLocation) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAsset = rec.assetName.toLowerCase().includes(q);
        const matchesTeam = rec.assignedTeam.toLowerCase().includes(q);
        const matchesLoc = rec.locationName.toLowerCase().includes(q);
        const matchesAction = rec.restorationAction.toLowerCase().includes(q);
        if (!matchesAsset && !matchesTeam && !matchesLoc && !matchesAction) return false;
      }
      return true;
    });
  }, [recoveryRecords, selectedStage, selectedLocation, searchQuery]);

  const handleCreateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assignedTeam.trim() || !onAddRecoveryRecord) return;

    const targetIncident = incidents.find((i) => i.id === selectedIncidentId);
    const locId = targetIncident?.locationId || locations[0]?.id || "palakollu";
    const locName = targetIncident?.locationName || locations[0]?.name || "Palakollu";

    onAddRecoveryRecord({
      incidentId: selectedIncidentId,
      locationId: locId,
      locationName: locName,
      assetId: `ast-${Date.now()}`,
      assetName: assetName.trim(),
      assetType,
      stage: "ASSESSMENT",
      progressPercent: 20,
      assignedTeam: assignedTeam.trim(),
      damageAssessmentNotes:
        damageNotes.trim() || "Initial post-event physical damage inspection underway.",
      restorationAction:
        restorationAction.trim() || "Structural repair and municipal service reactivation.",
      startedAt: "Just now",
      targetCompletion,
      isCompleted: false,
    });

    // Reset & close
    setAssetName("");
    setAssignedTeam("");
    setDamageNotes("");
    setRestorationAction("");
    setIsAddModalOpen(false);
  };

  const getStageBadge = (stage: RecoveryStage) => {
    switch (stage) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            RESOLVED
          </span>
        );
      case "VERIFICATION":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            VERIFICATION
          </span>
        );
      case "RESTORATION":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
            <Wrench className="w-3 h-3 text-sky-600" />
            RESTORATION
          </span>
        );
      case "ASSESSMENT":
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            ASSESSMENT
          </span>
        );
    }
  };

  // Helper to step through stages
  const advanceStage = (rec: RecoveryRecord) => {
    if (!onUpdateRecoveryRecord) return;
    if (rec.stage === "ASSESSMENT") {
      onUpdateRecoveryRecord(rec.id, {
        stage: "RESTORATION",
        progressPercent: Math.max(rec.progressPercent, 50),
      });
    } else if (rec.stage === "RESTORATION") {
      onUpdateRecoveryRecord(rec.id, {
        stage: "VERIFICATION",
        progressPercent: Math.max(rec.progressPercent, 85),
      });
    } else if (rec.stage === "VERIFICATION") {
      onUpdateRecoveryRecord(rec.id, {
        stage: "RESOLVED",
        progressPercent: 100,
        isCompleted: true,
        verificationNotes: "Final engineering audit verified all recovery metrics fulfilled.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Section 12 &bull; Post-Event Resilience
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {recoveryRecords.length} Active Recovery Tracks
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Post-Incident Recovery Tracking
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              ClimateShield does not stop at early warnings. Track continuous restoration and
              rehabilitation across the 4 stages:{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                ASSESSMENT &rarr; RESTORATION &rarr; VERIFICATION &rarr; RESOLVED
              </strong>
              .
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Asset Recovery</span>
            </button>
          )}
        </div>

        {/* 4-Stage Lifecycle Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              1. Assessment
            </span>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {recoveryRecords.filter((r) => r.stage === "ASSESSMENT").length}
            </div>
            <span className="text-[11px] text-amber-600">Damage appraisal & scoping</span>
          </div>

          <div className="p-3.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40">
            <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
              2. Restoration
            </span>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-1">
              {recoveryRecords.filter((r) => r.stage === "RESTORATION").length}
            </div>
            <span className="text-[11px] text-sky-600">Active engineering repairs</span>
          </div>

          <div className="p-3.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              3. Verification
            </span>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
              {recoveryRecords.filter((r) => r.stage === "VERIFICATION").length}
            </div>
            <span className="text-[11px] text-purple-600">Safety & quality audits</span>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              4. Resolved
            </span>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {recoveryRecords.filter((r) => r.stage === "RESOLVED").length}
            </div>
            <span className="text-[11px] text-emerald-600">Fully restored to service</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset name, restoration action, or assigned squad..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Recovery Stages</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="RESTORATION">Restoration</option>
              <option value="VERIFICATION">Verification</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}, {loc.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recovery Record Cards */}
      <div className="space-y-4">
        {filteredRecords.map((rec) => {
          return (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {rec.assetName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        &bull; {rec.locationName} &bull; Type: {rec.assetType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => onNavigateTab("incidents")}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-500 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Incident #{rec.incidentId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-500">Started: {rec.startedAt}</span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-500">Target: {rec.targetCompletion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {getStageBadge(rec.stage)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Restoration Progress:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {rec.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      rec.progressPercent >= 100
                        ? "bg-emerald-500"
                        : rec.progressPercent >= 60
                        ? "bg-sky-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${rec.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Detail Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Damage Assessment:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.damageAssessmentNotes}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Active Restoration Action:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.restorationAction}
                  </p>
                </div>
              </div>

              {rec.verificationNotes && (
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-900 dark:text-purple-200">
                      Audit Verification:
                    </span>{" "}
                    <span className="text-purple-800 dark:text-purple-300">
                      {rec.verificationNotes}
                    </span>
                  </div>
                </div>
              )}

              {/* Assignment & Stage Transition Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Assigned Team:</span>{" "}
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                    {rec.assignedTeam}
                  </strong>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    {rec.stage !== "RESOLVED" && (
                      <button
                        onClick={() => advanceStage(rec)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <span>
                          Advance to{" "}
                          {rec.stage === "ASSESSMENT"
                            ? "Restoration"
                            : rec.stage === "RESTORATION"
                            ? "Verification"
                            : "Resolved"}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {onUpdateRecoveryRecord && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500">Progress:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={rec.progressPercent}
                          onChange={(e) =>
                            onUpdateRecoveryRecord(rec.id, {
                              progressPercent: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-20 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No active recovery records found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter selection to view tracked rehabilitation efforts.
          </p>
        </div>
      )}

      {/* Add Recovery Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Initiate Post-Incident Asset Recovery
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track reconstruction and rehabilitation of impacted infrastructure.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRecovery} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Associated Incident Ticket
                </label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      #{inc.id} &bull; {inc.locationName} ({inc.hazard}) - {inc.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Impacted Asset Name
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g., Highway Culvert #4"
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Asset Type
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as RecoveryRecord["assetType"])}
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Road">Road</option>
                    <option value="Drainage system">Drainage system</option>
                    <option value="Hospital">Hospital</option>
                    <option value="School">School</option>
                    <option value="Power facility">Power facility</option>
                    <option value="Water facility">Water facility</option>
                    <option value="Public building">Public building</option>
                    <option value="Industrial facility">Industrial facility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Restoration Team
                </label>
                <input
                  type="text"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  placeholder="e.g., Municipal Road Engineering & PHED Squad"
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Damage Assessment Summary
                </label>
                <textarea
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Observed structural or water damage..."
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Restoration Action Plan
                </label>
                <textarea
                  rows={2}
                  value={restorationAction}
                  onChange={(e) => setRestorationAction(e.target.value)}
                  placeholder="Concrete patch, dewatering, electrical replacement..."
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
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  Start Recovery Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
