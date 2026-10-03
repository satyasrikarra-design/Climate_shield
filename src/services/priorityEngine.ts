import {
  RiskLevel,
  HazardType,
  CriticalAsset,
  PriorityLevel,
  RiskPriorityExplanation,
} from "../types/climate";

export interface PriorityContext {
  riskScore: number;
  riskLevel: RiskLevel;
  hazard: HazardType;
  vulnerabilityLevel?: "Low" | "Medium" | "High" | "Critical";
  criticalAssets?: CriticalAsset[];
  historicalRecurrenceCount?: number;
  hasUnresolvedIncidents?: boolean;
  unresolvedIncidentsCount?: number;
}

/**
 * Section 4: Risk Priority Engine
 * Computes an explainable, multi-factor operational response priority:
 * P1 — Immediate | P2 — High | P3 — Moderate | P4 — Routine
 */
export function calculateRiskPriority(ctx: PriorityContext): RiskPriorityExplanation {
  const {
    riskScore,
    riskLevel,
    hazard,
    vulnerabilityLevel = "Medium",
    criticalAssets = [],
    historicalRecurrenceCount = 0,
    hasUnresolvedIncidents = false,
    unresolvedIncidentsCount = 0,
  } = ctx;

  const factors: string[] = [];
  let scorePoints = 0;

  // 1. Risk Score & Level Contribution
  if (riskLevel === "CRITICAL" || riskScore >= 75) {
    scorePoints += 45;
    factors.push(`Risk score is Critical (${riskScore}/100)`);
  } else if (riskLevel === "HIGH" || riskScore >= 60) {
    scorePoints += 30;
    factors.push(`Risk score is High (${riskScore}/100)`);
  } else if (riskLevel === "MEDIUM" || riskScore >= 40) {
    scorePoints += 15;
    factors.push(`Risk score is Moderate (${riskScore}/100)`);
  } else {
    scorePoints += 5;
    factors.push(`Risk score is Low (${riskScore}/100)`);
  }

  // 2. Critical Asset Vulnerability & Status
  const impactedAssets = criticalAssets.filter(
    (a) => a.status === "Impacted" || a.status === "Heightened Alert"
  );
  const hasCriticalLifeline = criticalAssets.some(
    (a) =>
      (a.criticality === "Critical" || a.type === "Hospital" || a.type === "Power facility" || a.type === "Water facility") &&
      (a.status === "Impacted" || a.status === "Heightened Alert")
  );

  if (hasCriticalLifeline) {
    scorePoints += 30;
    factors.push("Critical lifeline infrastructure (hospital/utility/power) is in heightened alert or impacted");
  } else if (impactedAssets.length > 0) {
    scorePoints += 18;
    factors.push(`${impactedAssets.length} registered municipal asset(s) under heightened risk`);
  } else if (criticalAssets.length > 0) {
    scorePoints += 5;
    factors.push(`${criticalAssets.length} registered asset(s) within hazard perimeter`);
  }

  // 3. Vulnerability Level
  if (vulnerabilityLevel === "Critical") {
    scorePoints += 20;
    factors.push("Underlying demographic and physical vulnerability is Critical");
  } else if (vulnerabilityLevel === "High") {
    scorePoints += 12;
    factors.push("High physical exposure/low drainage buffer in district");
  }

  // 4. Historical Recurrence Pattern
  if (historicalRecurrenceCount >= 5) {
    scorePoints += 20;
    factors.push(`Identified Chronic Hotspot with ${historicalRecurrenceCount} previous recorded events`);
  } else if (historicalRecurrenceCount >= 3) {
    scorePoints += 10;
    factors.push(`Recurring hazard history (${historicalRecurrenceCount} previous events logged)`);
  }

  // 5. Active Unresolved Incidents
  if (hasUnresolvedIncidents || unresolvedIncidentsCount > 0) {
    scorePoints += 15;
    factors.push(`District has ${unresolvedIncidentsCount || 1} active unresolved incident(s) under triage`);
  }

  // Determine Priority Level
  let priority: PriorityLevel = "P4";
  let label = "P4 — Routine";

  if (scorePoints >= 70 || (riskLevel === "CRITICAL" && (hasCriticalLifeline || historicalRecurrenceCount >= 4))) {
    priority = "P1";
    label = "P1 — Immediate";
  } else if (scorePoints >= 45 || riskLevel === "HIGH" || hasCriticalLifeline) {
    priority = "P2";
    label = "P2 — High";
  } else if (scorePoints >= 25 || riskLevel === "MEDIUM") {
    priority = "P3";
    label = "P3 — Moderate";
  } else {
    priority = "P4";
    label = "P4 — Routine";
  }

  // Construct Human-Readable Summary
  let summary = "";
  if (priority === "P1") {
    summary = `Priority P1 (Immediate) because hazard intensity is ${riskLevel.toLowerCase()}, ${
      hasCriticalLifeline
        ? "critical lifeline facilities are impacted or at heightened risk"
        : "vulnerability threshold is exceeded"
    }, and ${
      historicalRecurrenceCount >= 3
        ? "similar incidents have repeatedly recurred in this area."
        : "active tactical response is mandated immediately."
    }`;
  } else if (priority === "P2") {
    summary = `Priority P2 (High) due to ${riskLevel.toLowerCase()} ${hazard.toLowerCase()} exposure with ${
      impactedAssets.length > 0 ? "multiple assets under heightened alert" : "significant local vulnerability"
    }. Rapid staging recommended.`;
  } else if (priority === "P3") {
    summary = `Priority P3 (Moderate) requiring active operational monitoring and routine precautionary readiness checks.`;
  } else {
    summary = `Priority P4 (Routine) within baseline municipal operating parameters. Standard telemetry surveillance active.`;
  }

  return {
    priority,
    label,
    summary,
    factors,
  };
}

export function getPriorityBadgeColor(priority: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case "P1":
      return {
        bg: "bg-rose-100 dark:bg-rose-950/70",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-300 dark:border-rose-800",
      };
    case "P2":
      return {
        bg: "bg-amber-100 dark:bg-amber-950/70",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-800",
      };
    case "P3":
      return {
        bg: "bg-sky-100 dark:bg-sky-950/70",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-300 dark:border-sky-800",
      };
    case "P4":
    default:
      return {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-300 dark:border-slate-700",
      };
  }
}
