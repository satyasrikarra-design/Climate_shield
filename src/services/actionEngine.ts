import { RecommendedAction, RiskAssessment, CityDistrict } from "../types/climate";

export function generateRecommendedActions(
  assessment: RiskAssessment,
  district: CityDistrict
): RecommendedAction[] {
  const { hazard, level } = assessment;

  if (hazard === "Flood Risk") {
    // Exact requested Flood recommendations
    return [
      {
        id: "act-fl-1",
        priority: level === "CRITICAL" ? "Critical" : level === "HIGH" ? "High" : "Moderate",
        title: "Inspect Drainage Systems",
        description: `Inspect primary stormwater channels, culverts, and canal sluice gates across ${district.name} to ensure debris is cleared and gravity flow is unblocked.`,
        department: "Municipal Drainage & Stormwater Division",
        status: "Pending",
        targetZone: district.zones[0]?.name || "Outfall Conduits",
      },
      {
        id: "act-fl-2",
        priority: level === "CRITICAL" ? "Critical" : level === "HIGH" ? "High" : "Moderate",
        title: "Monitor Waterlogging-Prone Areas",
        description: `Deploy field monitoring teams to depressed underpasses, low-lying markets, and vulnerable arterial transit corridors in ${district.name}.`,
        department: "Urban Roads & Traffic Patrol Bureau",
        status: "Pending",
        targetZone: district.zones[1]?.name || "Lowland Corridors",
      },
      {
        id: "act-fl-3",
        priority: level === "CRITICAL" ? "Critical" : "High",
        title: "Prepare Response Personnel",
        description: `Mobilize civil emergency personnel, swift-water rescue equipment, sandbag distribution crews, and portable high-volume dewatering pumps.`,
        department: "Disaster Response Force & Fire Services",
        status: "Pending",
        targetZone: `${district.name} Emergency Hub`,
      },
      {
        id: "act-fl-4",
        priority: level === "CRITICAL" ? "High" : "Moderate",
        title: "Issue Precautionary Warnings",
        description: `Broadcast automated SMS warnings and civic loudspeaker advisories to residents in low-elevation wards advising caution near canal banks and open drains.`,
        department: "Public Information & Civil Protection",
        status: "Pending",
        targetZone: "Public Broadcast Network",
      },
    ];
  } else {
    // Exact requested Heat recommendations
    return [
      {
        id: "act-ht-1",
        priority: level === "CRITICAL" ? "Critical" : level === "HIGH" ? "High" : "Moderate",
        title: "Monitor High-Exposure Areas",
        description: `Deploy municipal surveillance teams to open commercial streets, outdoor markets, and unsheltered bus transit stops in ${district.name}.`,
        department: "Public Safety & Municipal Ward Rangers",
        status: "Pending",
        targetZone: district.zones[0]?.name || "Commercial Core",
      },
      {
        id: "act-ht-2",
        priority: level === "CRITICAL" ? "Critical" : level === "HIGH" ? "High" : "Moderate",
        title: "Issue Heat-Safety Warnings",
        description: `Issue public health advisories across digital transit displays and local broadcasts urging residents to avoid direct sun exposure between 12:00 PM and 4:00 PM.`,
        department: "District Health & Family Welfare Bureau",
        status: "Pending",
        targetZone: `${district.name} Urban Display Network`,
      },
      {
        id: "act-ht-3",
        priority: level === "CRITICAL" ? "Critical" : "High",
        title: "Ensure Drinking-Water Availability",
        description: `Set up subsidized cold drinking water kiosks, ORS hydration distribution points, and temporary misting stations at high-density public intersections.`,
        department: "Water Supply & Urban Health Mission",
        status: "Pending",
        targetZone: "Transit Plazas & Market Hubs",
      },
      {
        id: "act-ht-4",
        priority: level === "CRITICAL" ? "High" : "Moderate",
        title: "Increase Monitoring of Vulnerable Zones",
        description: `Coordinate with community healthcare workers to conduct direct checks on elderly citizens, outdoor laborers, and informal settlements lacking active indoor cooling.`,
        department: "Social Welfare & Community Health Directorate",
        status: "Pending",
        targetZone: "Vulnerable Residential Clusters",
      },
    ];
  }
}
