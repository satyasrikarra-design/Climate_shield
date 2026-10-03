export type HazardType = "Heat Risk" | "Flood Risk";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AppWorkflowState = "initial" | "data_loaded" | "analyzing" | "analyzed";

export type OperationalRole =
  | "Administrator"
  | "Risk Analyst"
  | "Response Operator"
  | "Manager";

export type AlertLifecycleStatus =
  | "NEW"
  | "ACKNOWLEDGED"
  | "ASSIGNED"
  | "IN PROGRESS"
  | "RESOLVED";

export type IncidentLifecycleStatus =
  | "DETECTED"
  | "ACKNOWLEDGED"
  | "RESPONSE"
  | "RECOVERY"
  | "RESOLVED";

export type TaskStatus = "PENDING" | "IN PROGRESS" | "COMPLETED";

export type EscalationLevel =
  | "Level 1 - Response Operator"
  | "Level 2 - Municipal Manager"
  | "Level 3 - Disaster Management Team";

export type NavigationTab =
  | "command-center"
  | "risk-analysis"
  | "locations"
  | "map"
  | "assets"
  | "alerts"
  | "incidents"
  | "tasks"
  | "preparedness"
  | "recovery"
  | "risk-memory"
  | "reports"
  | "settings";

export type PriorityLevel = "P1" | "P2" | "P3" | "P4";

export interface RiskPriorityExplanation {
  priority: PriorityLevel;
  label: string; // "P1 — Immediate" | "P2 — High" | "P3 — Moderate" | "P4 — Routine"
  summary: string;
  factors: string[];
}

export interface EnvironmentalData {
  temperatureC: number;
  rainfall24hMm: number;
  humidityPercent: number;
  rainfallIntensityMmH: number;
  condition: string;
  windSpeedKmh?: number;
  isSimulated?: boolean;
  recordedAt?: string;
}

export type AssetCategory =
  | "Hospital"
  | "School"
  | "School/University"
  | "Road"
  | "Drainage system"
  | "Power facility"
  | "Water facility"
  | "Industrial facility"
  | "Industrial Facility"
  | "Public building"
  | "Public Infrastructure"
  | "Utility Facility"
  | "Residential zone";

export interface CriticalAsset {
  id: string;
  name: string;
  type: AssetCategory;
  locationId?: string;
  locationName?: string;
  address: string;
  criticality?: "Critical" | "High" | "Moderate" | "Routine";
  vulnerabilityLevel?: "Critical" | "High" | "Medium" | "Low";
  vulnerabilityFactor: string;
  associatedHazards?: HazardType[];
  coordinates: { lat: number; lng: number };
  status: "Normal" | "Heightened Alert" | "Impacted" | "Under Recovery";
  impactChain?: {
    riskTrigger: string;
    vulnerabilityMechanism: string;
    assetImpact: string;
  };
}

export interface LocationZone {
  id: string;
  name: string;
  type: string;
  vulnerabilityFactor: string;
  riskSeverity: "Low" | "Medium" | "High" | "Critical";
  coordinates: { x: number; y: number };
  details: string;
  infrastructureAtRisk: string;
}

export interface CityDistrict {
  id: string;
  name: string;
  region: string;
  state: string;
  type: string;
  coordinates: { lat: number; lng: number };
  elevationM: number;
  imperviousSurfacePercent: number;
  treeCanopyPercent: number;
  stormDrainageCapacityMmH: number;
  primaryRiskPropensity: HazardType;
  vulnerabilityDescription: string;
  baselineEnv: EnvironmentalData;
  zones: LocationZone[];
  // Phase 2 Operational Properties
  isMonitored?: boolean;
  isImportant?: boolean;
  vulnerabilityLevel?: "Low" | "Medium" | "High" | "Critical";
  criticalAssets?: CriticalAsset[];
  currentRiskScore?: number;
  currentRiskLevel?: RiskLevel;
  currentHazard?: HazardType;
  lastUpdated?: string;
  operationalStatus?: "Monitoring" | "Alert Active" | "Incident Active" | "Under Recovery";
  repeatedIncidentsCount?: number;
}

export interface ContributingFactor {
  factor: string;
  value: string;
  impact: "Moderate" | "Elevated" | "High" | "Critical";
  scoreImpact: number;
  explanation: string;
}

export interface RiskSubScores {
  hazardIntensity: number; // 0 - 100
  vulnerabilityExposure: number; // 0 - 100
  accumulationMoisture: number; // 0 - 100
}

export interface RiskAssessment {
  score: number; // 0 - 100
  level: RiskLevel;
  hazard: HazardType;
  subScores: RiskSubScores;
  heatSpecificScore: number;
  floodSpecificScore: number;
  contributingFactors: ContributingFactor[];
  summaryStatement: string;
  calculationMethodology: string;
  calculatedAt: string;
}

export interface ClimateAlert {
  id: string;
  locationId?: string;
  locationName: string;
  state?: string;
  isActive?: boolean;
  level: RiskLevel;
  hazard: HazardType;
  title: string;
  score: number;
  message: string;
  actionGuidance: string;
  issuedAt: string;
  code?: string;
  // Phase 2 Lifecycle Properties
  status?: AlertLifecycleStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  incidentId?: string;
  thresholdExceeded?: string;
}

export interface IncidentTask {
  id: string;
  incidentId: string;
  title: string;
  assignedTo: string;
  department: string;
  priority: "Critical" | "High" | "Moderate" | "Precautionary";
  dueTime: string;
  status: TaskStatus;
  notes?: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  stage?: IncidentLifecycleStatus;
  title: string;
  actor: string;
  details: string;
}

export interface ClimateIncident {
  id: string; // e.g. "CS-1042"
  locationId: string;
  locationName: string;
  state: string;
  hazard: HazardType;
  severity: RiskLevel;
  riskScore: number;
  status: IncidentLifecycleStatus;
  title: string;
  summary: string;
  createdAt: string;
  acknowledgedAt?: string;
  responseStartedAt?: string;
  recoveryStartedAt?: string;
  resolvedAt?: string;
  ownerName: string;
  ownerRole: OperationalRole;
  escalationLevel: EscalationLevel;
  escalationReason?: string;
  attachedPlanId?: string;
  tasks: IncidentTask[];
  resolutionNotes?: string;
  timeline: IncidentTimelineEvent[];
}

export interface HistoricalIncident {
  id: string;
  incidentCode: string;
  locationId: string;
  locationName: string;
  state: string;
  hazard: HazardType;
  dateTime: string;
  riskScore: number;
  severity: RiskLevel;
  responseStatus: "Resolved" | "Archived";
  resolutionTimeHours: number;
  actionsTaken: string[];
  zoneAffected: string;
  keyLessonLearned: string;
}

export interface RiskMemoryPattern {
  id: string;
  locationId: string;
  locationName: string;
  zoneAffected: string;
  hazard: HazardType;
  previousIncidentsCount: number;
  riskPattern: "Recurring" | "Seasonal Vulnerability" | "Critical Chronic Hotspot";
  lastIncidentDate: string;
  vulnerabilityExplanation: string;
  preparednessRecommendation: string;
  priorityLevel: "High" | "Critical";
}

export interface SmartRiskThresholds {
  temperatureCriticalC: number;
  rainfallCritical24hMm: number;
  rainfallIntensityCriticalMmH: number;
  criticalScoreThreshold: number;
  highScoreThreshold: number;
}

export type RecoveryStage = "ASSESSMENT" | "RESTORATION" | "VERIFICATION" | "RESOLVED";

export interface RecoveryRecord {
  id: string;
  incidentId: string;
  locationId: string;
  locationName: string;
  assetId: string;
  assetName: string;
  assetType: AssetCategory;
  stage: RecoveryStage;
  progressPercent: number; // 0 - 100
  assignedTeam: string;
  damageAssessmentNotes: string;
  restorationAction: string;
  verificationNotes?: string;
  startedAt: string;
  targetCompletion: string;
  isCompleted: boolean;
}

export interface ClimateResilienceScore {
  score: number; // 0 - 100
  rating: "High Resilience" | "Moderate Resilience" | "Vulnerable" | "Critically Vulnerable";
  positiveFactors: string[];
  areasNeedingImprovement: string[];
  recommendedActions: string[];
}

export interface PreparednessPlan {
  id: string;
  name: string;
  hazard: HazardType;
  description: string;
  leadAgencies: string[];
  standardActions: string[];
  targetZonesExample: string;
  beforeEvent: {
    monitoringActions: string[];
    readinessChecks: string[];
    responsibleTeam: string;
  };
  duringEvent: {
    responseActions: string[];
    communicationActions: string[];
    safetyActions: string[];
  };
  afterEvent: {
    damageAssessment: string[];
    recoveryActions: string[];
    closureChecks: string[];
  };
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "incident" | "task" | "escalation" | "recovery" | "resolved";
  timestamp: string;
  isRead: boolean;
  linkTab?: NavigationTab;
  relatedId?: string;
}

export interface RecommendedAction {
  id: string;
  priority: "Critical" | "High" | "Moderate" | "Precautionary";
  title: string;
  description: string;
  department: string;
  status: "Pending" | "In Progress" | "Completed";
  targetZone: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  envData: EnvironmentalData;
  recommendedLocationId: string;
  expectedResult: string;
}
