import {
  EnvironmentalData,
  CityDistrict,
  RiskAssessment,
  HazardType,
  RiskLevel,
  ContributingFactor,
  RiskSubScores,
} from "../types/climate";

/**
 * Transparent Rule-Based Climate Risk Engine
 * Calculates score from 0–100, determines dominant hazard (Heat vs Flood),
 * and provides explainable contributing factors.
 */
export function calculateClimateRisk(
  env: EnvironmentalData,
  district: CityDistrict
): RiskAssessment {
  // ==========================================
  // 1. HEAT RISK LOGIC
  // Factors: Temperature, Humidity, Urban Heat Island Hardscape
  // ==========================================
  let heatScore = 0;

  // Temperature factor (Baseline safe: < 30°C)
  if (env.temperatureC >= 43) {
    heatScore += 65; // Severe heatwave threshold
  } else if (env.temperatureC >= 40) {
    heatScore += 52;
  } else if (env.temperatureC >= 36) {
    heatScore += 38;
  } else if (env.temperatureC >= 32) {
    heatScore += 22;
  } else if (env.temperatureC >= 28) {
    heatScore += 10;
  } else {
    heatScore += 5;
  }

  // Humidity compounding with temperature (Heat Index / Wet Bulb stress)
  if (env.temperatureC >= 38) {
    if (env.humidityPercent >= 50) {
      heatScore += 20; // Dangerous apparent heat
    } else if (env.humidityPercent >= 30) {
      heatScore += 12; // Arid dry furnace effect
    }
  } else if (env.temperatureC >= 32 && env.humidityPercent >= 65) {
    heatScore += 18;
  } else if (env.humidityPercent >= 50 && env.temperatureC >= 28) {
    heatScore += 8;
  }

  // District Physical Vulnerability: Impervious Surface & Canopy deficit
  const hardscapeBonus = (district.imperviousSurfacePercent / 100) * 10;
  const canopyDeficitBonus = ((100 - district.treeCanopyPercent) / 100) * 8;
  heatScore += Math.round(hardscapeBonus + canopyDeficitBonus);

  // Clamp heat score to 0–100
  const finalHeatScore = Math.min(100, Math.max(0, Math.round(heatScore)));

  // ==========================================
  // 2. FLOOD RISK LOGIC
  // Factors: Rainfall, Rainfall Intensity, Humidity (Soil Saturation), Lowland Elevation
  // ==========================================
  let floodScore = 0;

  // 24h Rainfall accumulation factor
  if (env.rainfall24hMm >= 140) {
    floodScore += 45; // Torrential accumulation
  } else if (env.rainfall24hMm >= 90) {
    floodScore += 35;
  } else if (env.rainfall24hMm >= 50) {
    floodScore += 24;
  } else if (env.rainfall24hMm >= 20) {
    floodScore += 12;
  } else if (env.rainfall24hMm >= 5) {
    floodScore += 4;
  }

  // Rainfall Intensity (mm/hr) - direct trigger for urban waterlogging
  if (env.rainfallIntensityMmH >= 40) {
    floodScore += 32; // Flash flood cloudburst rate
  } else if (env.rainfallIntensityMmH >= 25) {
    floodScore += 24;
  } else if (env.rainfallIntensityMmH >= 12) {
    floodScore += 14;
  } else if (env.rainfallIntensityMmH >= 5) {
    floodScore += 6;
  }

  // Humidity (Indicates saturated boundary atmosphere & reduced ground percolation)
  if (env.humidityPercent >= 85) {
    floodScore += 12;
  } else if (env.humidityPercent >= 70) {
    floodScore += 6;
  }

  // District Topography & Drainage Vulnerability
  // Delta / low elevation (< 5m) or low conduit capacity (< 30mm/hr)
  if (district.elevationM <= 3.0) {
    floodScore += 10; // Extreme low-lying alluvial basin (e.g. Palakollu, Narsapuram)
  } else if (district.elevationM <= 10.0) {
    floodScore += 6;
  }

  if (district.stormDrainageCapacityMmH < 30 && env.rainfallIntensityMmH > 15) {
    floodScore += 8; // Drainage capacity shortfall
  }

  // Clamp flood score to 0–100
  const finalFloodScore = Math.min(100, Math.max(0, Math.round(floodScore)));

  // ==========================================
  // 3. HAZARD ARBITRATION & RISK LEVEL DETERMINATION
  // ==========================================
  let dominantHazard: HazardType = "Flood Risk";
  let compositeScore = 0;

  if (finalFloodScore >= finalHeatScore) {
    dominantHazard = "Flood Risk";
    compositeScore = finalFloodScore;
  } else {
    dominantHazard = "Heat Risk";
    compositeScore = finalHeatScore;
  }

  // Score Classification:
  // 0–24   → LOW
  // 25–49  → MEDIUM
  // 50–74  → HIGH
  // 75–100 → CRITICAL
  let level: RiskLevel = "LOW";
  if (compositeScore >= 75) {
    level = "CRITICAL";
  } else if (compositeScore >= 50) {
    level = "HIGH";
  } else if (compositeScore >= 25) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  // Sub-scores distribution for transparency
  const subScores: RiskSubScores = {
    hazardIntensity:
      dominantHazard === "Flood Risk"
        ? Math.min(100, Math.round((env.rainfallIntensityMmH / 45) * 100))
        : Math.min(100, Math.round(((env.temperatureC - 24) / 20) * 100)),
    vulnerabilityExposure: Math.round(district.imperviousSurfacePercent * 0.8),
    accumulationMoisture:
      dominantHazard === "Flood Risk"
        ? Math.min(100, Math.round((env.rainfall24hMm / 150) * 100))
        : Math.min(100, Math.round(env.humidityPercent)),
  };

  // ==========================================
  // 4. MAIN CONTRIBUTING FACTORS GENERATION
  // Explain clearly WHY the score was generated
  // ==========================================
  const contributingFactors: ContributingFactor[] = [];

  if (dominantHazard === "Flood Risk") {
    // Factor 1: Rainfall accumulation
    if (env.rainfall24hMm >= 80) {
      contributingFactors.push({
        factor: "Heavy Accumulated Rainfall",
        value: `${env.rainfall24hMm} mm in 24h`,
        impact: "Critical",
        scoreImpact: 35,
        explanation: "Excessive volume of precipitation has fully saturated soil absorption capacity.",
      });
    } else if (env.rainfall24hMm >= 20) {
      contributingFactors.push({
        factor: "Moderate Rainfall Accumulation",
        value: `${env.rainfall24hMm} mm in 24h`,
        impact: "Elevated",
        scoreImpact: 18,
        explanation: "Continuous precipitation causing gradual ground moisture buildup.",
      });
    }

    // Factor 2: Rainfall Intensity
    if (env.rainfallIntensityMmH >= 30) {
      contributingFactors.push({
        factor: "High Rainfall Intensity",
        value: `${env.rainfallIntensityMmH} mm/hr`,
        impact: "Critical",
        scoreImpact: 30,
        explanation: `Downpour rate significantly exceeds standard drainage discharge capacity (${district.stormDrainageCapacityMmH} mm/hr).`,
      });
    } else if (env.rainfallIntensityMmH >= 10) {
      contributingFactors.push({
        factor: "Elevated Rainfall Rate",
        value: `${env.rainfallIntensityMmH} mm/hr`,
        impact: "High",
        scoreImpact: 16,
        explanation: "Intense downpour straining local street grates and municipal conduits.",
      });
    }

    // Factor 3: Humidity & Soil Saturation
    if (env.humidityPercent >= 85) {
      contributingFactors.push({
        factor: "High Relative Humidity",
        value: `${env.humidityPercent}%`,
        impact: "High",
        scoreImpact: 14,
        explanation: "Near-total atmospheric saturation prevents natural surface water evaporation.",
      });
    }

    // Factor 4: Location Vulnerability (Terrain / Delta Elevation)
    if (district.elevationM <= 3.5) {
      contributingFactors.push({
        factor: "Vulnerable Lowland Delta Terrain",
        value: `${district.elevationM}m Elevation`,
        impact: "High",
        scoreImpact: 15,
        explanation: `${district.name} sits in a flat alluvial basin where stormwater cannot drain by gravity during high water levels.`,
      });
    }
  } else {
    // Heat Risk Contributing Factors
    if (env.temperatureC >= 40) {
      contributingFactors.push({
        factor: "Extreme Ambient Temperature",
        value: `${env.temperatureC}°C (${((env.temperatureC * 9) / 5 + 32).toFixed(1)}°F)`,
        impact: "Critical",
        scoreImpact: 45,
        explanation: "Dangerous thermal threshold causing rapid physiological heat strain in exposed populations.",
      });
    } else if (env.temperatureC >= 34) {
      contributingFactors.push({
        factor: "High Ambient Heat",
        value: `${env.temperatureC}°C`,
        impact: "High",
        scoreImpact: 26,
        explanation: "Above-average seasonal temperature elevating thermal load on urban areas.",
      });
    }

    if (env.humidityPercent <= 40 && env.temperatureC >= 38) {
      contributingFactors.push({
        factor: "Arid Heat Wave Dynamics",
        value: `${env.humidityPercent}% Humidity`,
        impact: "High",
        scoreImpact: 18,
        explanation: "Dry scorching conditions accelerate dehydration and rapid surface heating of masonry and roads.",
      });
    } else if (env.humidityPercent >= 60 && env.temperatureC >= 32) {
      contributingFactors.push({
        factor: "High Humidity Heat Index Compounding",
        value: `${env.humidityPercent}% Humidity`,
        impact: "High",
        scoreImpact: 20,
        explanation: "High moisture content suppresses human evaporative cooling, elevating apparent heat stress.",
      });
    }

    if (district.imperviousSurfacePercent >= 80) {
      contributingFactors.push({
        factor: "Urban Concrete Heat Mass",
        value: `${district.imperviousSurfacePercent}% Paved`,
        impact: "High",
        scoreImpact: 16,
        explanation: `${district.name}'s dense asphalt and buildings retain solar radiation and re-radiate heat into pedestrian zones.`,
      });
    }
  }

  // Baseline fallback factor if all conditions are benign
  if (contributingFactors.length === 0) {
    contributingFactors.push({
      factor: "Normal Baseline Parameters",
      value: "Within Safe Limits",
      impact: "Moderate",
      scoreImpact: 5,
      explanation: "Atmospheric readings, rainfall, and thermal levels are well within municipal safe operating thresholds.",
    });
  }

  let summaryStatement = "";
  if (level === "CRITICAL") {
    summaryStatement = `CRITICAL RISK DETECTED: ${dominantHazard.toUpperCase()} conditions in ${district.name} require immediate municipal emergency intervention.`;
  } else if (level === "HIGH") {
    summaryStatement = `HIGH RISK WARNING: Elevated ${dominantHazard.toLowerCase()} conditions require proactive municipal preparedness in ${district.name}.`;
  } else if (level === "MEDIUM") {
    summaryStatement = `MEDIUM RISK ADVISORY: Moderate ${dominantHazard.toLowerCase()} conditions indicate heightened surveillance in vulnerable sectors.`;
  } else {
    summaryStatement = `LOW RISK: Stable baseline conditions. Continuous routine environmental monitoring active for ${district.name}.`;
  }

  return {
    score: compositeScore,
    level,
    hazard: dominantHazard,
    subScores,
    heatSpecificScore: finalHeatScore,
    floodSpecificScore: finalFloodScore,
    contributingFactors,
    summaryStatement,
    calculationMethodology:
      "Rule-Based Climate Engine: Evaluates atmospheric thresholds (precipitation/temperature intensity) calibrated against location elevation, drainage capacity, and urban hardscape.",
    calculatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}
