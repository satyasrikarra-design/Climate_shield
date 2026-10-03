import { ClimateAlert, RiskAssessment, CityDistrict, EnvironmentalData } from "../types/climate";

export function generateClimateAlert(
  assessment: RiskAssessment,
  district: CityDistrict,
  env: EnvironmentalData
): ClimateAlert {
  const { level, hazard, score } = assessment;
  const isEmergency = level === "HIGH" || level === "CRITICAL";

  let title = "";
  let message = "";
  let actionGuidance = "";

  if (level === "CRITICAL") {
    if (hazard === "Flood Risk") {
      title = "⚠ CRITICAL FLOOD RISK";
      message = `Severe rainfall accumulation (${env.rainfall24hMm} mm) and high intensity (${env.rainfallIntensityMmH} mm/hr) indicate imminent localized inundation and severe drainage surcharge in ${district.name}.`;
    } else {
      title = "⚠ CRITICAL HEAT RISK";
      message = `Extreme ambient temperatures (${env.temperatureC}°C) in ${district.name} have crossed life-threatening thermal thresholds, aggravated by urban concrete heat retention.`;
    }
    actionGuidance = "Immediate preparedness and local monitoring recommended.";
  } else if (level === "HIGH") {
    title = `⚠ HIGH CLIMATE RISK — ${hazard.toUpperCase()}`;
    if (hazard === "Flood Risk") {
      message = `Heavy precipitation conditions (${env.rainfall24hMm} mm) in ${district.name} indicate increased risk of surface waterlogging across depressed roadways and low-lying wards.`;
    } else {
      message = `Sustained high temperatures (${env.temperatureC}°C) in ${district.name} create elevated heat stress across open commercial and transit corridors.`;
    }
    actionGuidance = "Preparedness action recommended.";
  } else if (level === "MEDIUM") {
    title = `MEDIUM RISK — ${hazard.toUpperCase()}`;
    message = `Environmental indicators for ${district.name} are elevated above baseline seasonal norms. Moderate moisture/thermal load detected.`;
    actionGuidance = "Increased monitoring recommended.";
  } else {
    title = "LOW RISK";
    message = `All environmental metrics in ${district.name} remain within standard municipal safety limits. Atmospheric conditions are stable.`;
    actionGuidance = "No immediate action required. Continue monitoring.";
  }

  const code = `CS-ALERT-${district.id.substring(0, 3).toUpperCase()}-${level}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: `alert-${Date.now()}`,
    isActive: isEmergency,
    level,
    hazard,
    title,
    locationName: district.name,
    score,
    message,
    actionGuidance,
    issuedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    code,
  };
}
