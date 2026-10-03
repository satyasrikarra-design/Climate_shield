import { CityDistrict, HazardType, LocationZone } from "../types/climate";
import { CITY_DISTRICTS } from "./districtData";

export interface GeocodedLocation {
  placeId: string;
  name: string;
  displayName: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  type: string;
}

// Curated instant-search Indian cities, towns and districts
export const CURATED_INDIAN_LOCATIONS: CityDistrict[] = [
  ...CITY_DISTRICTS,
  {
    id: "araku-valley",
    name: "Araku Valley",
    region: "Alluri Sitharama Raju District",
    state: "Andhra Pradesh",
    type: "Elevated Hill Station & Valley",
    coordinates: { lat: 18.327, lng: 82.877 },
    elevationM: 911.0,
    imperviousSurfacePercent: 28,
    treeCanopyPercent: 64,
    stormDrainageCapacityMmH: 55,
    primaryRiskPropensity: "Flood Risk",
    vulnerabilityDescription:
      "High-altitude valley in Eastern Ghats. Steep hills create sudden flash runoff during cloudbursts, but high tree canopy moderates temperatures.",
    baselineEnv: {
      temperatureC: 22.0,
      rainfall24hMm: 12.0,
      rainfallIntensityMmH: 3.5,
      humidityPercent: 70,
      condition: "Misty & Pleasant",
      isSimulated: true,
    },
    zones: [
      {
        id: "ar-1",
        name: "Valley Stream Confluence",
        type: "Riparian Mountain Creek",
        vulnerabilityFactor: "Sudden hill torrent flash flooding",
        riskSeverity: "High",
        coordinates: { x: 45, y: 55 },
        details: "Rapid mountain stream crossing the main tourism corridor.",
        infrastructureAtRisk: "Valley bridge crossing, tribal agriculture terraces",
      },
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Mumbai Suburban & Island City",
    state: "Maharashtra",
    type: "Coastal Megacity & Lowland Hardscape",
    coordinates: { lat: 19.076, lng: 72.877 },
    elevationM: 8.0,
    imperviousSurfacePercent: 88,
    treeCanopyPercent: 11,
    stormDrainageCapacityMmH: 25,
    primaryRiskPropensity: "Flood Risk",
    vulnerabilityDescription:
      "Island megacity built over reclaimed mangrove creeks. Heavy monsoonal high tides cause severe waterlogging when combined with 50mm/hr cloudbursts.",
    baselineEnv: {
      temperatureC: 31.0,
      rainfall24hMm: 15.0,
      rainfallIntensityMmH: 4.0,
      humidityPercent: 78,
      condition: "Humid Coastal Marine",
      isSimulated: true,
    },
    zones: [
      {
        id: "mum-1",
        name: "Milan Subway & Hindmata Junction",
        type: "Depressed Road Sump",
        vulnerabilityFactor: "Severe depression prone to >1.0m flash ponding",
        riskSeverity: "Critical",
        coordinates: { x: 50, y: 65 },
        details: "Chronic monsoon bottleneck trapping vehicular traffic and suburban trains.",
        infrastructureAtRisk: "Suburban railway line, arterial commercial corridor",
      },
    ],
  },
  {
    id: "delhi",
    name: "Delhi",
    region: "National Capital Region",
    state: "Delhi",
    type: "Semi-Arid Continental Megacity",
    coordinates: { lat: 28.613, lng: 77.209 },
    elevationM: 216.0,
    imperviousSurfacePercent: 84,
    treeCanopyPercent: 13,
    stormDrainageCapacityMmH: 35,
    primaryRiskPropensity: "Heat Risk",
    vulnerabilityDescription:
      "Landlocked Northern plain with intense continental climate. Severe summer heatwaves reach 45°C+, amplified by extensive asphalt concrete canyons.",
    baselineEnv: {
      temperatureC: 38.0,
      rainfall24hMm: 0.0,
      rainfallIntensityMmH: 0.0,
      humidityPercent: 32,
      condition: "Hazy & Hot Sun",
      isSimulated: true,
    },
    zones: [
      {
        id: "del-1",
        name: "Connaught Place & Outer Ring Road",
        type: "Urban Hardscape & Commercial Hub",
        vulnerabilityFactor: "Massive thermal storage and heavy pedestrian volume",
        riskSeverity: "Critical",
        coordinates: { x: 48, y: 45 },
        details: "Dense paved concentric commercial hub with prolonged diurnal heat retention.",
        infrastructureAtRisk: "Outdoor street vendors, inter-state bus terminals",
      },
    ],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    region: "Bengaluru Urban",
    state: "Karnataka",
    type: "Deccan Plateau Lake Basin",
    coordinates: { lat: 12.971, lng: 77.594 },
    elevationM: 920.0,
    imperviousSurfacePercent: 82,
    treeCanopyPercent: 14,
    stormDrainageCapacityMmH: 38,
    primaryRiskPropensity: "Flood Risk",
    vulnerabilityDescription:
      "Built across interconnected lake valley systems. Rapid urban asphalt concrete encroachment has severed natural stormwater drainage channels (rajakaluves).",
    baselineEnv: {
      temperatureC: 27.5,
      rainfall24hMm: 8.0,
      rainfallIntensityMmH: 2.0,
      humidityPercent: 62,
      condition: "Partly Cloudy",
      isSimulated: true,
    },
    zones: [
      {
        id: "blr-1",
        name: "Bellandur - Outer Ring Road Corridor",
        type: "Tech Hardscape & Lake Catchment",
        vulnerabilityFactor: "Severed valley stormwater culverts",
        riskSeverity: "High",
        coordinates: { x: 65, y: 55 },
        details: "Arterial tech corridor prone to road submersion during sudden evening downpours.",
        infrastructureAtRisk: "IT corridors, lake perimeter embankments",
      },
    ],
  },
  {
    id: "chennai",
    name: "Chennai",
    region: "Coromandel Coast",
    state: "Tamil Nadu",
    type: "Lowland Coastal Plain & Marshland",
    coordinates: { lat: 13.082, lng: 80.270 },
    elevationM: 6.7,
    imperviousSurfacePercent: 80,
    treeCanopyPercent: 10,
    stormDrainageCapacityMmH: 30,
    primaryRiskPropensity: "Flood Risk",
    vulnerabilityDescription:
      "Lowland coastal strip between Adyar and Cooum river mouths. Northeast monsoon storms combine with flat topography to create widespread inundation.",
    baselineEnv: {
      temperatureC: 32.0,
      rainfall24hMm: 10.0,
      rainfallIntensityMmH: 2.5,
      humidityPercent: 74,
      condition: "Humid Marine Air",
      isSimulated: true,
    },
    zones: [
      {
        id: "chn-1",
        name: "Velachery & Pallikaranai Marsh Border",
        type: "Wetland Floodplain Encroachment",
        vulnerabilityFactor: "Low-lying basin retaining regional stormwater",
        riskSeverity: "Critical",
        coordinates: { x: 55, y: 70 },
        details: "Residential colony developed over historic flood marshland.",
        infrastructureAtRisk: "Residential colonies, arterial MRTS train line",
      },
    ],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    region: "Lower Gangetic Delta",
    state: "West Bengal",
    type: "Deltaic Tidal Basin",
    coordinates: { lat: 22.572, lng: 88.363 },
    elevationM: 9.0,
    imperviousSurfacePercent: 82,
    treeCanopyPercent: 9,
    stormDrainageCapacityMmH: 26,
    primaryRiskPropensity: "Flood Risk",
    vulnerabilityDescription:
      "Gangetic delta riverbank with tidal Hooghly river sluice gates that shut during high tide, backing up municipal drainage during monsoon storms.",
    baselineEnv: {
      temperatureC: 31.5,
      rainfall24hMm: 12.0,
      rainfallIntensityMmH: 3.0,
      humidityPercent: 80,
      condition: "Tropical Humid",
      isSimulated: true,
    },
    zones: [
      {
        id: "kol-1",
        name: "Thanthania & Central Avenue Lowland",
        type: "Historic Sump Corridor",
        vulnerabilityFactor: "Centuries-old brick sewer capacity choke",
        riskSeverity: "High",
        coordinates: { x: 52, y: 48 },
        details: "Dense commercial market with slow tidal gravity drainage.",
        infrastructureAtRisk: "Commercial shops, surface tram lines",
      },
    ],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    region: "Sabarmati Plains",
    state: "Gujarat",
    type: "Semi-Arid Urban Basin",
    coordinates: { lat: 23.022, lng: 72.571 },
    elevationM: 53.0,
    imperviousSurfacePercent: 86,
    treeCanopyPercent: 8,
    stormDrainageCapacityMmH: 40,
    primaryRiskPropensity: "Heat Risk",
    vulnerabilityDescription:
      "Interior plains of Gujarat characterized by extreme dry heat in summer, with temperatures routinely surpassing 44°C and heavy concrete thermal retention.",
    baselineEnv: {
      temperatureC: 39.0,
      rainfall24hMm: 0.0,
      rainfallIntensityMmH: 0.0,
      humidityPercent: 30,
      condition: "Dry Heat & Glare",
      isSimulated: true,
    },
    zones: [
      {
        id: "ahd-1",
        name: "Walled City Commercial Core",
        type: "Dense Masonry Canyons",
        vulnerabilityFactor: "Narrow streets trapping ambient summer heat",
        riskSeverity: "Critical",
        coordinates: { x: 50, y: 50 },
        details: "Centuries-old brick and concrete core with minimal air circulation.",
        infrastructureAtRisk: "Informal street markets, outdoor transport terminals",
      },
    ],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    region: "Aravalli Semi-Arid",
    state: "Rajasthan",
    type: "Desert Fringe Rocky Basin",
    coordinates: { lat: 26.912, lng: 75.787 },
    elevationM: 431.0,
    imperviousSurfacePercent: 78,
    treeCanopyPercent: 6,
    stormDrainageCapacityMmH: 45,
    primaryRiskPropensity: "Heat Risk",
    vulnerabilityDescription:
      "Arid desert fringe sheltered by rocky Aravalli ridges. Summer temperatures soar to 44°C+ with high radiant heat from stone facades and low humidity.",
    baselineEnv: {
      temperatureC: 40.0,
      rainfall24hMm: 0.0,
      rainfallIntensityMmH: 0.0,
      humidityPercent: 24,
      condition: "Intense Desert Heat",
      isSimulated: true,
    },
    zones: [
      {
        id: "jai-1",
        name: "Johari Bazaar & Pink City Core",
        type: "Dense Sandstone Urban Hardscape",
        vulnerabilityFactor: "High solar radiation absorption by pink sandstone",
        riskSeverity: "High",
        coordinates: { x: 48, y: 45 },
        details: "Paved heritage retail corridors lacking continuous shade trees.",
        infrastructureAtRisk: "Tourist corridors, open commercial plazas",
      },
    ],
  },
];

/**
 * Searches for Indian locations using the live OpenStreetMap Nominatim geocoding API,
 * combined with the curated instant Indian database for immediate responsiveness.
 */
export async function searchIndianLocations(query: string): Promise<GeocodedLocation[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const results: GeocodedLocation[] = [];
  const seenKeys = new Set<string>();

  // 1. Check curated Indian database first for instant fuzzy matches
  const lowerQuery = cleanQuery.toLowerCase();
  for (const loc of CURATED_INDIAN_LOCATIONS) {
    if (
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.region.toLowerCase().includes(lowerQuery) ||
      loc.state.toLowerCase().includes(lowerQuery)
    ) {
      const key = `${loc.name.toLowerCase()}-${loc.state.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          placeId: `curated-${loc.id}`,
          name: loc.name,
          displayName: `${loc.name}, ${loc.region}, ${loc.state}, India`,
          city: loc.name,
          district: loc.region,
          state: loc.state,
          country: "India",
          lat: loc.coordinates.lat,
          lng: loc.coordinates.lng,
          type: loc.type,
        });
      }
    }
  }

  // 2. Fetch from backend proxy /api/geocode or direct Nominatim for ANY Indian location
  try {
    let response: Response | null = null;
    
    try {
      response = await fetch(`/api/geocode?q=${encodeURIComponent(cleanQuery)}`);
    } catch {
      // Fallback to direct Nominatim if backend proxy not available
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&countrycodes=in&addressdetails=1&limit=8`;
      response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });
    }

    if (response && response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const address = item.address || {};

          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            item.name ||
            cleanQuery;

          const stateName = address.state || address.state_district || "India";
          const districtName =
            address.state_district || address.county || address.district || cityName;

          const key = `${cityName.toLowerCase()}-${stateName.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              placeId: String(item.place_id || Math.random()),
              name: cityName,
              displayName: item.display_name || `${cityName}, ${stateName}, India`,
              city: cityName,
              district: districtName,
              state: stateName,
              country: "India",
              lat,
              lng: lon,
              type: item.type || "Urban Area",
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Live geocoding network query failed; using curated results:", err);
  }

  return results;
}

/**
 * Converts a GeocodedLocation (whether searched live or chosen from curated list)
 * into a fully-functional CityDistrict ready for the ClimateShield Risk Engine.
 */
export function convertGeocodedToDistrict(geo: GeocodedLocation): CityDistrict {
  // Check if we already have detailed physical parameters for this location in curated list
  const existing = CURATED_INDIAN_LOCATIONS.find(
    (c) =>
      c.name.toLowerCase() === geo.name.toLowerCase() ||
      (Math.abs(c.coordinates.lat - geo.lat) < 0.15 &&
        Math.abs(c.coordinates.lng - geo.lng) < 0.15)
  );

  if (existing) {
    return {
      ...existing,
      name: geo.name,
      region: geo.district || existing.region,
      state: geo.state || existing.state,
      coordinates: { lat: geo.lat, lng: geo.lng },
    };
  }

  // Synthesize realistic terrain & physical metrics based on Indian geographic coordinates:
  // - High latitude/plateau vs coastal
  // - Coastal longitude (< 74° or > 80° near coast) and low elevation
  const isCoast =
    (geo.lat < 21.0 && geo.lng > 80.0) ||
    (geo.lat < 20.0 && geo.lng < 74.0) ||
    geo.displayName.toLowerCase().includes("coastal") ||
    geo.displayName.toLowerCase().includes("port");

  const isHills =
    geo.lat > 30.0 ||
    geo.displayName.toLowerCase().includes("valley") ||
    geo.displayName.toLowerCase().includes("hills") ||
    geo.displayName.toLowerCase().includes("ghats");

  const elevationM = isHills ? 850 : isCoast ? 4.5 : 210;
  const primaryHazard: HazardType = isCoast || isHills ? "Flood Risk" : "Heat Risk";
  const impervious = isHills ? 42 : isCoast ? 76 : 84;
  const canopy = isHills ? 48 : isCoast ? 14 : 10;
  const drainageCap = isCoast ? 24 : 38;

  const defaultZones: LocationZone[] = [
    {
      id: `${geo.placeId}-z1`,
      name: `${geo.name} Central Zone`,
      type: "High-Traffic Commercial Core",
      vulnerabilityFactor: primaryHazard === "Flood Risk" ? "Lowland street waterlogging" : "Paved concrete heat retention",
      riskSeverity: "High",
      coordinates: { x: 45, y: 50 },
      details: `Core urban zone in ${geo.name} with dense commercial activity.`,
      infrastructureAtRisk: "Primary transit arteries, market concourse",
    },
    {
      id: `${geo.placeId}-z2`,
      name: `${geo.name} Residential Outflow`,
      type: "Low-lying Residential Settlement",
      vulnerabilityFactor: "Stormwater accumulation node",
      riskSeverity: "Medium",
      coordinates: { x: 65, y: 65 },
      details: `Residential colony adjacent to local drainage channels in ${geo.name}.`,
      infrastructureAtRisk: "Housing basements, municipal feeder roads",
    },
  ];

  return {
    id: `geo-${geo.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    name: geo.name,
    region: geo.district || `${geo.name} Sector`,
    state: geo.state,
    type: isCoast ? "Lowland Coastal Delta" : isHills ? "Elevated Hill Basin" : "Continental Urban Core",
    coordinates: { lat: geo.lat, lng: geo.lng },
    elevationM,
    imperviousSurfacePercent: impervious,
    treeCanopyPercent: canopy,
    stormDrainageCapacityMmH: drainageCap,
    primaryRiskPropensity: primaryHazard,
    vulnerabilityDescription: `${geo.name} (${geo.state}) situated at ${elevationM}m elevation. Regional land-use features ${impervious}% impervious surface cover and ${canopy}% tree canopy, influencing municipal climate vulnerability.`,
    baselineEnv: {
      temperatureC: isHills ? 23.0 : isCoast ? 30.5 : 33.0,
      rainfall24hMm: isCoast ? 8.0 : isHills ? 14.0 : 2.0,
      rainfallIntensityMmH: isCoast ? 2.0 : isHills ? 3.0 : 0.5,
      humidityPercent: isCoast ? 72 : isHills ? 68 : 45,
      condition: isCoast ? "Partly Humid" : isHills ? "Mild & Breezy" : "Sunny & Dry",
      isSimulated: true,
    },
    zones: defaultZones,
  };
}
