import {
  CityDistrict,
  ClimateIncident,
  ClimateAlert,
  PreparednessPlan,
  ClimateResilienceScore,
} from "../types/climate";

export interface ResilienceContext {
  district: CityDistrict;
  incidents: ClimateIncident[];
  alerts: ClimateAlert[];
  preparednessPlans: PreparednessPlan[];
}

/**
 * Section 14: Climate Resilience Score
 * Computes an explainable 0–100 resilience score derived strictly from
 * available operational data in the application.
 */
export function calculateResilienceScore(ctx: ResilienceContext): ClimateResilienceScore {
  const { district, incidents, alerts, preparednessPlans } = ctx;

  const districtIncidents = incidents.filter(
    (inc) => inc.locationId === district.id || inc.locationName === district.name
  );
  const districtAlerts = alerts.filter(
    (a) => a.locationId === district.id || a.locationName === district.name
  );

  const unresolvedIncidents = districtIncidents.filter((inc) => inc.status !== "RESOLVED");
  const activeAlerts = districtAlerts.filter((a) => a.status !== "RESOLVED" && a.isActive !== false);

  // Calculate task completion rate
  let totalTasks = 0;
  let completedTasks = 0;
  districtIncidents.forEach((inc) => {
    (inc.tasks || []).forEach((t) => {
      totalTasks++;
      if (t.status === "COMPLETED") completedTasks++;
    });
  });
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 85;

  // Check preparedness plan coverage
  const hasPlan = preparednessPlans.some((p) => p.hazard === district.primaryRiskPropensity);

  // Asset protection status
  const assets = district.criticalAssets || [];
  const normalAssets = assets.filter((a) => a.status === "Normal").length;
  const assetHealthRate = assets.length > 0 ? (normalAssets / assets.length) * 100 : 80;

  // Start with baseline 100
  let score = 100;
  const positiveFactors: string[] = [];
  const areasNeedingImprovement: string[] = [];
  const recommendedActions: string[] = [];

  // Deductions:
  // 1. Unresolved incidents penalty (-8 per unresolved incident, up to -30)
  if (unresolvedIncidents.length > 0) {
    const penalty = Math.min(unresolvedIncidents.length * 8, 30);
    score -= penalty;
    areasNeedingImprovement.push(
      `${unresolvedIncidents.length} active unresolved incident(s) currently straining municipal response capacity`
    );
    recommendedActions.push("Expedite task completion on open response tickets to return facilities to normal operations.");
  } else {
    positiveFactors.push("Zero open unresolved incidents in the active triage queue");
  }

  // 2. Active alerts penalty (-5 per alert, up to -15)
  if (activeAlerts.length > 0) {
    const penalty = Math.min(activeAlerts.length * 5, 15);
    score -= penalty;
    areasNeedingImprovement.push(`${activeAlerts.length} active alert(s) under observation`);
  } else {
    positiveFactors.push("No active critical weather/hazard alerts currently triggered");
  }

  // 3. Vulnerability level penalty
  if (district.vulnerabilityLevel === "Critical") {
    score -= 18;
    areasNeedingImprovement.push("Baseline physical and drainage exposure in district is evaluated as Critical");
    recommendedActions.push("Upgrade arterial stormwater channels and expand permeable urban surface cover.");
  } else if (district.vulnerabilityLevel === "High") {
    score -= 10;
    areasNeedingImprovement.push("High physical vulnerability due to dense hardscape and limited canopy buffer");
    recommendedActions.push("Increase shade canopy coverage and inspect vulnerable culverts.");
  } else {
    positiveFactors.push("Favorable baseline buffer: low impervious surface density and resilient base elevation");
  }

  // 4. Repeated incidents / Chronic hotspot penalty
  const recurrence = district.repeatedIncidentsCount || 0;
  if (recurrence >= 5) {
    score -= 15;
    areasNeedingImprovement.push(`Chronic hazard recurrence pattern (${recurrence} recorded historical occurrences)`);
    recommendedActions.push("Establish permanent structural retention and pre-positioned rapid pump assets.");
  } else if (recurrence >= 2) {
    score -= 8;
    areasNeedingImprovement.push(`Recurring hazard history (${recurrence} logged incidents in database)`);
  } else {
    positiveFactors.push("Low historical recurrence rate across previous monitoring seasons");
  }

  // 5. Response completion reward / deduction
  if (taskCompletionRate >= 80) {
    score += 5;
    positiveFactors.push(`High response task execution rate (${Math.round(taskCompletionRate)}% tasks completed)`);
  } else if (taskCompletionRate < 50) {
    score -= 10;
    areasNeedingImprovement.push(`Low response task completion rate (${Math.round(taskCompletionRate)}%)`);
    recommendedActions.push("Reallocate tactical response personnel to clear bottlenecked task queues.");
  }

  // 6. Preparedness plan status
  if (hasPlan) {
    score += 5;
    positiveFactors.push(`Standard ${district.primaryRiskPropensity} Preparedness & Action Plan active`);
  } else {
    score -= 10;
    areasNeedingImprovement.push("No specialized contingency preparedness playbook attached");
    recommendedActions.push(`Formalize and adopt a municipal ${district.primaryRiskPropensity} preparedness plan.`);
  }

  // 7. Asset operational stability
  if (assetHealthRate >= 80) {
    positiveFactors.push(`${normalAssets}/${assets.length} critical community assets currently operating at normal status`);
  } else {
    areasNeedingImprovement.push(`${assets.length - normalAssets} registered asset(s) under heightened risk or impacted`);
    recommendedActions.push("Deploy specialized engineering inspections to safeguard impacted critical assets.");
  }

  // Clamp score between 10 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let rating: ClimateResilienceScore["rating"] = "Moderate Resilience";
  if (score >= 80) {
    rating = "High Resilience";
  } else if (score >= 60) {
    rating = "Moderate Resilience";
  } else if (score >= 40) {
    rating = "Vulnerable";
  } else {
    rating = "Critically Vulnerable";
  }

  return {
    score,
    rating,
    positiveFactors,
    areasNeedingImprovement,
    recommendedActions,
  };
}
