import { useState } from "react";
import { Header } from "./components/Header";
import { OperatorControlBar } from "./components/OperatorControlBar";
import { IndiaRiskMap } from "./components/IndiaRiskMap";
import { EnvironmentalDataSection } from "./components/EnvironmentalDataSection";
import { RiskResultSection } from "./components/RiskResultSection";
import { VulnerabilityMapSection } from "./components/VulnerabilityMapSection";
import { ActiveAlertSection } from "./components/ActiveAlertSection";
import { RecommendedActionsSection } from "./components/RecommendedActionsSection";

// Phase 2 Enterprise Resilience Modules
import { NavigationHeader } from "./components/phase2/NavigationHeader";
import { CommandCenterDashboard } from "./components/phase2/CommandCenterDashboard";
import { LocationsManagementView } from "./components/phase2/LocationsManagementView";
import { FullMapRiskView } from "./components/phase2/FullMapRiskView";
import { AssetVulnerabilityView } from "./components/phase2/AssetVulnerabilityView";
import { AlertsManagementView } from "./components/phase2/AlertsManagementView";
import { IncidentsResponseView } from "./components/phase2/IncidentsResponseView";
import { TasksManagementView } from "./components/phase2/TasksManagementView";
import { PreparednessPlansView } from "./components/phase2/PreparednessPlansView";
import { RecoveryTrackingView } from "./components/phase2/RecoveryTrackingView";
import { RiskMemoryView } from "./components/phase2/RiskMemoryView";
import { ReportsView } from "./components/phase2/ReportsView";
import { SettingsThresholdsView } from "./components/phase2/SettingsThresholdsView";

// Services & Seed Data
import { DEMO_SCENARIOS } from "./services/districtData";
import { CURATED_INDIAN_LOCATIONS, convertGeocodedToDistrict } from "./services/locationService";
import { calculateClimateRisk } from "./services/riskEngine";
import { generateClimateAlert } from "./services/alertEngine";
import { generateRecommendedActions } from "./services/actionEngine";
import {
  INITIAL_MONITORED_LOCATIONS,
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  INITIAL_PREPAREDNESS_PLANS,
  INITIAL_RISK_PATTERNS,
  INITIAL_HISTORICAL_INCIDENTS,
  INITIAL_RECOVERY_RECORDS,
  DEFAULT_SMART_THRESHOLDS,
  INITIAL_NOTIFICATIONS,
} from "./services/platformState";

import {
  CityDistrict,
  EnvironmentalData,
  AppWorkflowState,
  RiskAssessment,
  ClimateAlert,
  RecommendedAction,
  NavigationTab,
  OperationalRole,
  ClimateIncident,
  IncidentLifecycleStatus,
  IncidentTask,
  TaskStatus,
  EscalationLevel,
  AlertLifecycleStatus,
  SmartRiskThresholds,
  InAppNotification,
  CriticalAsset,
  RecoveryRecord,
} from "./types/climate";

import {
  ArrowRight,
  Shield,
  Cpu,
  Compass,
  ArrowUpRight,
  Zap,
} from "lucide-react";

export default function App() {
  // Navigation & Role State (Phase 2)
  const [activeTab, setActiveTab] = useState<NavigationTab>("command-center");
  const [activeRole, setActiveRole] = useState<OperationalRole>("Administrator");
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_NOTIFICATIONS);

  // Platform Operational Data State (Phase 2)
  const [monitoredLocations, setMonitoredLocations] = useState<CityDistrict[]>(INITIAL_MONITORED_LOCATIONS);
  const [incidents, setIncidents] = useState<ClimateIncident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<ClimateAlert[]>(INITIAL_ALERTS);
  const [preparednessPlans] = useState(INITIAL_PREPAREDNESS_PLANS);
  const [riskPatterns] = useState(INITIAL_RISK_PATTERNS);
  const [historicalIncidents] = useState(INITIAL_HISTORICAL_INCIDENTS);
  const [smartThresholds, setSmartThresholds] = useState<SmartRiskThresholds>(DEFAULT_SMART_THRESHOLDS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(INITIAL_INCIDENTS[0]?.id || "CS-1042");
  const [recoveryRecords, setRecoveryRecords] = useState<RecoveryRecord[]>(INITIAL_RECOVERY_RECORDS);

  // ==========================================
  // PHASE 1 LIVE RISK ENGINE WORKFLOW STATE
  // ==========================================
  const [workflowState, setWorkflowState] = useState<AppWorkflowState>("initial");
  const [selectedDistrict, setSelectedDistrict] = useState<CityDistrict>(CURATED_INDIAN_LOCATIONS[0]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario-flood");
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [climateAlert, setClimateAlert] = useState<ClimateAlert | null>(null);
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([]);

  // Phase 1 Handlers
  const handleSelectDistrict = (district: CityDistrict) => {
    setSelectedDistrict(district);
    if (workflowState === "analyzed") {
      setWorkflowState("initial");
      setRiskAssessment(null);
      setClimateAlert(null);
      setRecommendedActions([]);
    }
  };

  const handleMapClickLocation = async (lat: number, lng: number) => {
    let closest = CURATED_INDIAN_LOCATIONS[0];
    let minDistance = Number.MAX_VALUE;

    for (const loc of CURATED_INDIAN_LOCATIONS) {
      const d = Math.hypot(loc.coordinates.lat - lat, loc.coordinates.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closest = loc;
      }
    }

    if (minDistance < 1.0) {
      handleSelectDistrict(closest);
    } else {
      const customDistrict = convertGeocodedToDistrict({
        placeId: `map-click-${lat.toFixed(2)}-${lng.toFixed(2)}`,
        name: `Zone [${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E]`,
        displayName: `Zone at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E, India`,
        city: `Sector (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
        state: "India Regional Grid",
        country: "India",
        lat,
        lng,
        type: "Geospatial Point",
      });
      handleSelectDistrict(customDistrict);
    }
  };

  const handleLoadEnvironmentalData = () => {
    if (!selectedDistrict) return;
    setEnvData(selectedDistrict.baselineEnv);
    setWorkflowState("data_loaded");
    setRiskAssessment(null);
    setClimateAlert(null);
    setRecommendedActions([]);
  };

  const handleLoadScenario = () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
    setEnvData(scenario.envData);
    setWorkflowState("data_loaded");
    setRiskAssessment(null);
    setClimateAlert(null);
    setRecommendedActions([]);
  };

  const handleAnalyzeRisk = () => {
    if (!envData || !selectedDistrict) return;

    setWorkflowState("analyzing");

    setTimeout(() => {
      const assessment = calculateClimateRisk(envData, selectedDistrict);
      const alert = generateClimateAlert(assessment, selectedDistrict, envData);
      const actions = generateRecommendedActions(assessment, selectedDistrict);

      setRiskAssessment(assessment);
      setClimateAlert(alert);
      setRecommendedActions(actions);
      setWorkflowState("analyzed");

      // Auto-bridge into Phase 2 Alert feed if high or critical
      if (assessment.score >= 60) {
        const newPlatformAlert: ClimateAlert = {
          id: `ALT-${Date.now().toString().slice(-4)}`,
          locationId: selectedDistrict.id,
          locationName: selectedDistrict.name,
          state: selectedDistrict.state,
          hazard: assessment.hazard,
          level: assessment.level,
          score: assessment.score,
          issuedAt: "Just now",
          title: alert.title,
          message: alert.message,
          actionGuidance: actions[0]?.title || "Initiate municipal early action protocol.",
          status: "NEW",
          thresholdExceeded: `${assessment.hazard} composite score reached ${assessment.score}/100`,
        };

        setAlerts((prev) => [newPlatformAlert, ...prev]);

        // Push notification
        const newNotification: InAppNotification = {
          id: `notif-${Date.now()}`,
          title: `New ${assessment.level} Alert: ${selectedDistrict.name}`,
          message: `${assessment.hazard} score ${assessment.score}/100 detected.`,
          timestamp: "Just now",
          type: "alert",
          isRead: false,
          linkTab: "alerts",
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }, 600);
  };

  const handleResetAnalysis = () => {
    setWorkflowState("initial");
    setEnvData(null);
    setRiskAssessment(null);
    setClimateAlert(null);
    setRecommendedActions([]);
  };

  // Launch Phase 1 Risk Engine directly targeting a specific monitored location
  const handleLaunchAnalysisForLocation = (district: CityDistrict) => {
    setSelectedDistrict(district);
    setEnvData(district.baselineEnv);
    setWorkflowState("data_loaded");
    setRiskAssessment(null);
    setClimateAlert(null);
    setRecommendedActions([]);
    setActiveTab("risk-analysis");
  };

  // ==========================================
  // PHASE 2 OPERATIONAL HANDLERS
  // ==========================================

  // 1. Alerts Lifecycle (Section 6)
  const handleUpdateAlertStatus = (alertId: string, status: AlertLifecycleStatus) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status,
            acknowledgedBy:
              status === "ACKNOWLEDGED" && !a.acknowledgedBy
                ? activeRole
                : a.acknowledgedBy,
          };
        }
        return a;
      })
    );
  };

  // 2. Formalize Alert to Incident (Section 6, 7)
  const handleFormalizeIncidentFromAlert = (alert: ClimateAlert) => {
    const newIncidentId = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
    const attachedPlan =
      preparednessPlans.find((p) => p.hazard === alert.hazard) || preparednessPlans[0];

    const initialTasks: IncidentTask[] = (attachedPlan?.standardActions || [])
      .slice(0, 3)
      .map((action, idx) => ({
        id: `tsk-${newIncidentId}-${idx + 1}`,
        incidentId: newIncidentId,
        title: action,
        assignedTo:
          attachedPlan?.leadAgencies && attachedPlan.leadAgencies.length > 0
            ? attachedPlan.leadAgencies[idx % attachedPlan.leadAgencies.length]
            : "Disaster Response Cell",
        department: "Disaster Response Unit",
        priority: idx === 0 ? "Critical" : "High",
        dueTime: "Within 45 mins",
        status: "PENDING",
      }));

    const newIncident: ClimateIncident = {
      id: newIncidentId,
      locationId: alert.locationId,
      locationName: alert.locationName,
      state: alert.state || "India",
      hazard: alert.hazard,
      riskScore: alert.score,
      severity: alert.level,
      status: "ACKNOWLEDGED",
      title: `${alert.hazard} Response: ${alert.locationName}`,
      summary: alert.message,
      createdAt: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ownerName: activeRole,
      ownerRole: activeRole,
      escalationLevel: "Level 1 - Response Operator",
      attachedPlanId: attachedPlan.id,
      tasks: initialTasks,
      timeline: [
        {
          id: `ev-${Date.now()}-1`,
          timestamp: "Just now",
          title: "Incident Formalized",
          actor: activeRole,
          details: `Formalized from Alert ${alert.id} (${alert.score}/100 severity). Standard Playbook attached.`,
        },
      ],
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // Update alert to link incident
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, incidentId: newIncidentId, status: "IN PROGRESS" } : a))
    );

    setSelectedIncidentId(newIncidentId);
    setActiveTab("incidents");

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Incident #${newIncidentId} Created`,
        message: `Response mobilized for ${alert.locationName}.`,
        timestamp: "Just now",
        type: "incident",
        isRead: false,
        linkTab: "incidents",
      },
      ...prev,
    ]);
  };

  // 3. Incident Lifecycle & Task Management (Section 7, 8, 9, 11, 12)
  const handleUpdateIncidentStatus = (incidentId: string, status: IncidentLifecycleStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const newTimeline = [
            ...inc.timeline,
            {
              id: `ev-${Date.now()}`,
              timestamp: nowTime,
              title: `Lifecycle Advanced to ${status}`,
              actor: activeRole,
              details: `Operational status transitioned to ${status}.`,
            },
          ];

          return {
            ...inc,
            status,
            timeline: newTimeline,
            recoveryStartedAt: status === "RECOVERY" ? nowTime : inc.recoveryStartedAt,
            resolvedAt: status === "RESOLVED" ? nowTime : inc.resolvedAt,
          };
        }
        return inc;
      })
    );
  };

  const handleAddTaskToIncident = (incidentId: string, task: IncidentTask) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            tasks: [...inc.tasks, task],
            timeline: [
              ...inc.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: "Just now",
                title: `Task Assigned: ${task.title}`,
                actor: activeRole,
                details: `Assigned to ${task.assignedTo} (${task.priority} Priority).`,
              },
            ],
          };
        }
        return inc;
      })
    );
  };

  const handleUpdateTaskStatus = (incidentId: string, taskId: string, status: TaskStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            tasks: inc.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
          };
        }
        return inc;
      })
    );
  };

  const handleEscalateIncident = (
    incidentId: string,
    newLevel: EscalationLevel,
    reason: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            escalationLevel: newLevel,
            escalationReason: reason,
            timeline: [
              ...inc.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: "Just now",
                title: `Escalated to ${newLevel}`,
                actor: activeRole,
                details: reason,
              },
            ],
          };
        }
        return inc;
      })
    );
  };

  const handleAttachPlanToIncident = (incidentId: string, planId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, attachedPlanId: planId } : inc))
    );
  };

  const handleSaveResolutionNotes = (incidentId: string, notes: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, resolutionNotes: notes } : inc))
    );
  };

  // 4. Locations & Assets Management (Section 3)
  const handleAddMonitoredLocation = (district: CityDistrict) => {
    setMonitoredLocations((prev) => {
      if (prev.some((p) => p.id === district.id)) return prev;
      return [district, ...prev];
    });
  };

  const handleRemoveMonitoredLocation = (locationId: string) => {
    setMonitoredLocations((prev) => prev.filter((loc) => loc.id !== locationId));
  };

  const handleToggleImportant = (locationId: string) => {
    setMonitoredLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId ? { ...loc, isImportant: !loc.isImportant } : loc
      )
    );
  };

  const handleAddCriticalAsset = (locationId: string, asset: Omit<CriticalAsset, "id"> | CriticalAsset) => {
    const assetWithId: CriticalAsset = {
      ...asset,
      id: "id" in asset && asset.id ? asset.id : `ast-${Date.now()}`,
    };
    setMonitoredLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            criticalAssets: [...(loc.criticalAssets || []), assetWithId],
          };
        }
        return loc;
      })
    );
  };

  const handleUpdateAssetStatus = (
    locationId: string,
    assetId: string,
    status: CriticalAsset["status"]
  ) => {
    setMonitoredLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          criticalAssets: (loc.criticalAssets || []).map((asset) =>
            asset.id === assetId ? { ...asset, status } : asset
          ),
        };
      })
    );
  };

  const handleRemoveCriticalAsset = (locationId: string, assetId: string) => {
    setMonitoredLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            criticalAssets: (loc.criticalAssets || []).filter((a) => a.id !== assetId),
          };
        }
        return loc;
      })
    );
  };

  // Recovery & Direct Task Handlers (Section 9, 12)
  const handleUpdateRecoveryRecord = (
    id: string,
    updates: Partial<Omit<RecoveryRecord, "id">>
  ) => {
    setRecoveryRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    );
  };

  const handleAddRecoveryRecord = (record: Omit<RecoveryRecord, "id">) => {
    const newId = `rec-${Date.now().toString().slice(-4)}`;
    const newRec: RecoveryRecord = { ...record, id: newId };
    setRecoveryRecords((prev) => [newRec, ...prev]);
  };

  const handleAddTaskDirect = (
    incidentId: string,
    task: Omit<IncidentTask, "id" | "incidentId">
  ) => {
    const newTask: IncidentTask = {
      ...task,
      id: `tsk-${Date.now().toString().slice(-4)}`,
      incidentId,
    };
    handleAddTaskToIncident(incidentId, newTask);
  };

  // 5. Thresholds Configuration (Section 5)
  const handleUpdateThresholds = (newThresholds: SmartRiskThresholds) => {
    setSmartThresholds(newThresholds);
  };

  // Notification clear
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* 1. SaaS Navigation Header with Role Selector & Notifications */}
      <NavigationHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* ========================================== */}
        {/* TAB 1: COMMAND CENTER (Section 2, 14, 16) */}
        {/* ========================================== */}
        {activeTab === "command-center" && (
          <CommandCenterDashboard
            locations={monitoredLocations}
            incidents={incidents}
            alerts={alerts}
            riskPatterns={riskPatterns}
            onSelectLocationForAnalysis={handleLaunchAnalysisForLocation}
            onNavigateTab={setActiveTab}
            onSelectIncident={setSelectedIncidentId}
          />
        )}

        {/* ========================================== */}
        {/* TAB 2: LIVE RISK ENGINE (PHASE 1 MVP WORKFLOW) */}
        {/* ========================================== */}
        {activeTab === "risk-analysis" && (
          <div className="space-y-5">
            {/* Visual Workflow Steps Breadcrumb */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-2xs overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0 text-sky-600 dark:text-sky-400">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>Search Indian Location</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 mx-1" />

              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  selectedDistrict ? "text-sky-600 dark:text-sky-400" : "text-slate-400"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>India Map Pin</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 mx-1" />

              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  envData ? "text-sky-600 dark:text-sky-400" : "text-slate-400"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span>Load Environmental Data</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 mx-1" />

              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  workflowState === "analyzed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : workflowState === "analyzing"
                    ? "text-amber-600 animate-pulse"
                    : "text-slate-400"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-[10px]">
                  4
                </span>
                <span>Analyze Climate Risk</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 mx-1" />

              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  climateAlert ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center font-bold text-[10px]">
                  5
                </span>
                <span>Alert &amp; Action Directives</span>
              </div>
            </div>

            {/* 1. OPERATOR CONTROL BAR: Dynamic Search & Scenario Loader */}
            <OperatorControlBar
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              scenarios={DEMO_SCENARIOS}
              selectedScenarioId={selectedScenarioId}
              onSelectScenarioId={setSelectedScenarioId}
              onLoadEnvironmentalData={handleLoadEnvironmentalData}
              onLoadScenario={handleLoadScenario}
              onAnalyzeRisk={handleAnalyzeRisk}
              onResetAnalysis={handleResetAnalysis}
              workflowState={workflowState}
            />

            {/* 2. INTERACTIVE INDIA MAP & SELECTED LOCATION CARD */}
            <IndiaRiskMap
              selectedDistrict={selectedDistrict}
              onMapClickLocation={handleMapClickLocation}
              isDataLoaded={Boolean(envData)}
            />

            {/* 3. INITIAL STATE PROMPT BANNER (if data not yet loaded) */}
            {workflowState === "initial" && (
              <div
                id="state-initial-banner"
                className="p-5 rounded-xl border border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Location Selected: {selectedDistrict?.name}, {selectedDistrict?.state}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ready to load telemetry. Click <strong>Load Telemetry</strong> or choose a <strong>Demo Scenario</strong> (e.g. Heavy Rain / Flood) then click <strong>Load Scenario</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleLoadEnvironmentalData}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-xs"
                  >
                    Load Telemetry for {selectedDistrict?.name}
                  </button>
                </div>
              </div>
            )}

            {/* 4. ENVIRONMENTAL DATA SECTION (Visible once data is loaded) */}
            {envData && selectedDistrict && (
              <EnvironmentalDataSection envData={envData} district={selectedDistrict} />
            )}

            {/* 5. ANALYZING COMPUTATION STATE */}
            {workflowState === "analyzing" && (
              <div
                id="state-analyzing-card"
                className="p-8 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-center flex flex-col items-center justify-center space-y-3 shadow-xs"
              >
                <Cpu className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Computing Climate Risk Assessment for {selectedDistrict?.name}...
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                  Evaluating local atmospheric conditions against elevation thresholds, stormwater conduit capacities, and heat absorption.
                </p>
              </div>
            )}

            {/* 6. RISK CALCULATED & ALERT GENERATED (Visible once analyzed) */}
            {workflowState === "analyzed" && riskAssessment && climateAlert && selectedDistrict && (
              <div className="space-y-5">
                {/* Dynamic Active Alert Banner */}
                <ActiveAlertSection alert={climateAlert} />

                {/* Highly Visible Risk Result Panel with Contributing Factors */}
                <RiskResultSection assessment={riskAssessment} district={selectedDistrict} />

                {/* 2-Column Grid: Micro-Zone Vulnerability View + Recommended Action Directives */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6">
                    <VulnerabilityMapSection district={selectedDistrict} assessment={riskAssessment} />
                  </div>

                  <div className="lg:col-span-6">
                    <RecommendedActionsSection
                      actions={recommendedActions}
                      assessment={riskAssessment}
                      district={selectedDistrict}
                    />
                  </div>
                </div>

                {/* Bridge to Phase 2 Operational Management */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold">
                        Analysis Complete &bull; Escalation Pipeline Ready
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        This risk assessment is automatically registered into the ClimateShield Command Center.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("alerts")}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage Alerts</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setActiveTab("incidents")}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer flex items-center gap-1"
                    >
                      <span>Open Incident Workspace</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: NATIONAL RISK MAP (Section 15) */}
        {/* ========================================== */}
        {(activeTab === "map" || (activeTab as string) === "map-view") && (
          <FullMapRiskView
            locations={monitoredLocations}
            onSelectForAnalysis={handleLaunchAnalysisForLocation}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 4: LOCATIONS (Section 3) */}
        {/* ========================================== */}
        {activeTab === "locations" && (
          <LocationsManagementView
            locations={monitoredLocations}
            activeRole={activeRole}
            onAddLocation={handleAddMonitoredLocation}
            onRemoveLocation={handleRemoveMonitoredLocation}
            onToggleImportant={handleToggleImportant}
            onAddCriticalAsset={handleAddCriticalAsset}
            onRemoveCriticalAsset={handleRemoveCriticalAsset}
            onSelectForAnalysis={handleLaunchAnalysisForLocation}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 4B: ASSET & VULNERABILITY IMPACT CHAIN (Section 4) */}
        {/* ========================================== */}
        {activeTab === "assets" && (
          <AssetVulnerabilityView
            locations={monitoredLocations}
            activeRole={activeRole}
            onAddCriticalAsset={handleAddCriticalAsset}
            onUpdateAssetStatus={handleUpdateAssetStatus}
            onSelectForAnalysis={handleLaunchAnalysisForLocation}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 5: ALERTS LIFECYCLE (Section 6) */}
        {/* ========================================== */}
        {activeTab === "alerts" && (
          <AlertsManagementView
            alerts={alerts}
            activeRole={activeRole}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onFormalizeIncidentFromAlert={handleFormalizeIncidentFromAlert}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 6: INCIDENTS & TACTICAL RESPONSE (Section 7, 8, 11) */}
        {/* ========================================== */}
        {activeTab === "incidents" && (
          <IncidentsResponseView
            incidents={incidents}
            activeRole={activeRole}
            preparednessPlans={preparednessPlans}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onAddTaskToIncident={handleAddTaskToIncident}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onEscalateIncident={handleEscalateIncident}
            onAttachPlanToIncident={handleAttachPlanToIncident}
            onSaveResolutionNotes={handleSaveResolutionNotes}
            selectedIncidentId={selectedIncidentId}
            onSelectIncidentId={setSelectedIncidentId}
          />
        )}

        {/* ========================================== */}
        {/* TAB 6B: TACTICAL RESPONSE TASKS (Section 9) */}
        {/* ========================================== */}
        {activeTab === "tasks" && (
          <TasksManagementView
            incidents={incidents}
            activeRole={activeRole}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTaskDirect}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 7: PREPAREDNESS PLAYBOOKS (Section 10) */}
        {/* ========================================== */}
        {activeTab === "preparedness" && (
          <PreparednessPlansView
            plans={preparednessPlans}
            incidents={incidents}
            onNavigateTab={setActiveTab}
            onSelectIncidentId={setSelectedIncidentId}
          />
        )}

        {/* ========================================== */}
        {/* TAB 7B: POST-INCIDENT RECOVERY TRACKING (Section 12) */}
        {/* ========================================== */}
        {activeTab === "recovery" && (
          <RecoveryTrackingView
            recoveryRecords={recoveryRecords}
            incidents={incidents}
            locations={monitoredLocations}
            activeRole={activeRole}
            onUpdateRecoveryRecord={handleUpdateRecoveryRecord}
            onAddRecoveryRecord={handleAddRecoveryRecord}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ========================================== */}
        {/* TAB 8: RISK MEMORY & HISTORY (Section 4, 13) */}
        {/* ========================================== */}
        {activeTab === "risk-memory" && (
          <RiskMemoryView
            patterns={riskPatterns}
            historicalIncidents={historicalIncidents}
          />
        )}

        {/* ========================================== */}
        {/* TAB 9: REPORTS & AUDIT INSIGHTS (Section 17) */}
        {/* ========================================== */}
        {activeTab === "reports" && (
          <ReportsView
            locations={monitoredLocations}
            incidents={incidents}
            historicalIncidents={historicalIncidents}
            riskPatterns={riskPatterns}
          />
        )}

        {/* ========================================== */}
        {/* TAB 10: SETTINGS & THRESHOLDS (Section 5, 8) */}
        {/* ========================================== */}
        {activeTab === "settings" && (
          <SettingsThresholdsView
            thresholds={smartThresholds}
            onUpdateThresholds={handleUpdateThresholds}
            activeRole={activeRole}
            onSelectRole={setActiveRole}
          />
        )}
      </main>

      {/* Platform SaaS Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ClimateShield
            </span>
            <span>&bull; Phase 2 Productized Smart-City Climate Resilience Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Operational Role: <strong className="text-slate-700 dark:text-slate-300">{activeRole}</strong></span>
            <span>&bull;</span>
            <span>{monitoredLocations.length} Municipal Zones Monitored</span>
            <span>&bull;</span>
            <span>Lifecycle: Monitor &rarr; Assess &rarr; Prioritize &rarr; Alert &rarr; Assign &rarr; Respond &rarr; Recover &rarr; Learn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
