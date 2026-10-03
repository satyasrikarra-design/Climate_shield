import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily if API key is present
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Failed to initialize Google Gen AI:", err);
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "ClimateShield",
    version: "1.0.0-phase1-mvp",
    hasAiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Geocoding Proxy Endpoint for Indian Locations
app.get("/api/geocode", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&addressdetails=1&limit=8`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "ClimateShield-SmartCity-Phase1/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Geocoding upstream error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error("Geocoding proxy error:", err);
    res.status(500).json({ error: "Internal geocoding proxy error" });
  }
});

// AI Resilience Brief Endpoint
app.post("/api/ai-advisory", async (req, res) => {
  const { location, environmentalData, riskAssessment } = req.body;

  if (!location || !environmentalData || !riskAssessment) {
    return res.status(400).json({ error: "Missing required assessment data" });
  }

  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `You are the chief urban climate resilience advisor for the ClimateShield platform.
Analyze the following live smart-city climate risk situation:

Location: ${location.name} (Type: ${location.type}, Elevation: ${location.elevation}m, Impervious Surface: ${location.imperviousSurfacePercent}%, Tree Canopy: ${location.treeCanopyPercent}%)
Environmental Conditions:
- Temperature: ${environmentalData.temperatureC}°C (${(environmentalData.temperatureC * 9/5 + 32).toFixed(1)}°F)
- Rainfall (24h): ${environmentalData.rainfall24hMm} mm
- Rainfall Intensity: ${environmentalData.rainfallIntensityMmH} mm/hr
- Humidity: ${environmentalData.humidityPercent}%
- Weather Condition: ${environmentalData.condition}

Calculated Risk:
- Climate Risk Score: ${riskAssessment.score}/100
- Risk Level: ${riskAssessment.level}
- Primary Hazard: ${riskAssessment.hazard}
- Contributing Factors: ${riskAssessment.contributingFactors.map((f: { factor: string; impact: string }) => `${f.factor} (${f.impact})`).join(", ")}

Provide a concise, professional, military/municipal grade 3-paragraph executive resilience brief:
1. Executive Situation Assessment: Exactly WHERE is the risk, WHAT is it, and HOW SEVERE.
2. Causal Mechanism: WHY is this location critically vulnerable to this specific environmental condition (ground hydrology or urban heat mass).
3. Immediate 30-Minute Priority Command: The single most vital municipal action to prevent casualties or infrastructure failure.

Keep the tone calm, urgent, professional, and free of marketing buzzwords.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const briefText = response.text || "";
      return res.json({ brief: briefText, source: "gemini-3.8-flash" });
    } catch (err: unknown) {
      console.warn("Gemini generation failed, falling back to deterministic expert synthesis:", err);
    }
  }

  // Deterministic high-precision fallback synthesizer
  let synthesizedBrief = "";
  if (riskAssessment.hazard === "Heavy Rain / Flood Risk") {
    synthesizedBrief = `EXECUTIVE SITUATION: ${location.name} is currently facing an escalating ${riskAssessment.level} Flood Risk with a Climate Risk Score of ${riskAssessment.score}/100. Sustained precipitation of ${environmentalData.rainfall24hMm}mm combined with peak intensity of ${environmentalData.rainfallIntensityMmH}mm/hr directly threatens low-lying infrastructure.

CAUSAL MECHANISM: Surface runoff is severely exacerbated by the district's ${location.imperviousSurfacePercent}% impervious surface cover and low elevation of ${location.elevation}m. The local stormwater discharge channels are operating at peak hydraulic capacity, causing water backflow into arterial underpasses and vulnerable basement utilities.

IMMEDIATE 30-MINUTE COMMAND: Immediately deploy mobile high-volume dewatering pumps to Zone A culverts, trigger digital variable-message signs diverting traffic from low-lying underpasses, and mobilize swift-water response units along the perimeter canal.`;
  } else {
    synthesizedBrief = `EXECUTIVE SITUATION: ${location.name} is under a critical ${riskAssessment.level} Extreme Heat Warning with a Climate Risk Score of ${riskAssessment.score}/100. Ambient temperatures have reached ${environmentalData.temperatureC}°C, compounded by high humidity yielding dangerous thermal stress conditions.

CAUSAL MECHANISM: The district's low vegetative canopy (${location.treeCanopyPercent}%) and high concrete-to-asphalt density create an acute Urban Heat Island (UHI) effect, trapping heat in dense pedestrian corridors with minimal nocturnal radiative cooling.

IMMEDIATE 30-MINUTE COMMAND: Open all designated municipal cooling sanctuaries within 500m of transit hubs, dispatch emergency hydration patrols to unsheltered populations, and mandate temporary halts on heavy outdoor municipal labor.`;
  }

  return res.json({ brief: synthesizedBrief, source: "expert-engine" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClimateShield server running on http://localhost:${PORT}`);
  });
}

startServer();
