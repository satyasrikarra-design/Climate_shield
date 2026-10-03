import { Thermometer, CloudRain, Droplets, Wind, Sun, Info, AlertTriangle } from "lucide-react";
import { EnvironmentalData, CityDistrict } from "../types/climate";

interface EnvironmentalDataSectionProps {
  envData: EnvironmentalData;
  district: CityDistrict;
}

export function EnvironmentalDataSection({
  envData,
  district,
}: EnvironmentalDataSectionProps) {
  return (
    <section
      id="section-environmental-data"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs"
    >
      {/* Section Header with Simulation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              TELEMETRY LOADED
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Environmental Conditions for {district.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atmospheric &amp; precipitation metrics feeding the Climate Risk Engine
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-300 self-start sm:self-auto font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>Simulated Environmental Telemetry (Demo Feed)</span>
        </div>
      </div>

      {/* 5 Primary Environmental Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Temperature */}
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Temperature</span>
            <Thermometer className={`w-4 h-4 ${envData.temperatureC >= 40 ? "text-rose-600" : "text-amber-600"}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {envData.temperatureC.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((envData.temperatureC * 9) / 5 + 32).toFixed(1)}°F Ambient
          </div>
          {envData.temperatureC >= 40 && (
            <div className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Extreme Thermal Threshold
            </div>
          )}
        </div>

        {/* 2. Rainfall */}
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">24h Rainfall</span>
            <CloudRain className={`w-4 h-4 ${envData.rainfall24hMm >= 80 ? "text-blue-600" : "text-sky-600"}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {envData.rainfall24hMm.toFixed(1)} <span className="text-sm font-semibold">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Accumulated Volume
          </div>
          {envData.rainfall24hMm >= 80 && (
            <div className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Torrential Inundation Rate
            </div>
          )}
        </div>

        {/* 3. Humidity */}
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Relative Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {envData.humidityPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {envData.humidityPercent >= 80
              ? "High Soil Moisture Saturation"
              : envData.humidityPercent <= 40
              ? "Arid / Rapid Evaporation"
              : "Moderate Moisture"}
          </div>
        </div>

        {/* 4. Rainfall Intensity */}
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Rainfall Intensity</span>
            <Wind className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {envData.rainfallIntensityMmH.toFixed(1)} <span className="text-sm font-semibold">mm/h</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Drain Capacity: {district.stormDrainageCapacityMmH} mm/h
          </div>
          {envData.rainfallIntensityMmH > district.stormDrainageCapacityMmH && (
            <div className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Exceeds Sump Capacity
            </div>
          )}
        </div>

        {/* 5. Weather Condition */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Weather Condition</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {envData.condition}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Local Micro-Atmosphere
          </div>
        </div>
      </div>
    </section>
  );
}
