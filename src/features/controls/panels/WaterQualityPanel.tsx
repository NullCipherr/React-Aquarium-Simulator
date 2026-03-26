
import React from 'react';
import type { EnvironmentType, WaterQuality } from '../../../types';

interface MeterProps {
  label: string;
  value: number | string;
  unit: string;
  color: string;
}

const Meter: React.FC<MeterProps> = ({ label, value, unit, color }) => (
    <div className="flex items-center justify-between text-sm py-1">
        <span className="font-semibold text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
            <span className="font-mono text-gray-400">{value}{unit}</span>
            <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
        </div>
    </div>
);

const getMeterColor = (value: number, good: [number, number], warn: [number, number]): string => {
    if (value >= good[0] && value <= good[1]) return 'bg-green-500 shadow-green-500/50';
    if (value >= warn[0] && value <= warn[1]) return 'bg-yellow-500 shadow-yellow-500/50';
    return 'bg-red-500 shadow-red-500/50';
};

interface WaterQualityPanelProps {
    waterQuality: WaterQuality;
    measuredWaterQuality: WaterQuality;
    environment: EnvironmentType;
    onTemperatureChange: (temp: number) => void;
}

export const WaterQualityPanel: React.FC<WaterQualityPanelProps> = ({
    waterQuality,
    measuredWaterQuality,
    environment,
    onTemperatureChange
}) => {
    const { ph, ammonia, nitrite, nitrate, temperature, targetTemperature, oxygen, co2, gh, kh, salinity, phosphate } = waterQuality;
    const measuredTemp = measuredWaterQuality.temperature;
    const measuredPh = measuredWaterQuality.ph;

    const phRanges = environment === 'freshwater' 
        ? { good: [6.8, 7.8] as [number, number], warn: [6.5, 8.1] as [number, number] }
        : { good: [8.0, 8.4] as [number, number], warn: [7.8, 8.6] as [number, number] };

    return (
        <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-2 bg-gray-700/30 p-3 rounded-lg border border-gray-700/50">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-300">Temperature</span>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-200 font-mono">{temperature.toFixed(1)}°C</span>
                        <div className={`w-2 h-2 rounded-full ${getMeterColor(temperature, [23, 28], [21, 30])}`}></div>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Target: {targetTemperature}°C</span>
                    <span>Sensor: {measuredTemp.toFixed(1)}°C</span>
                </div>
                <input
                    type="range"
                    min="18"
                    max="32"
                    step="1"
                    value={targetTemperature}
                    onChange={(e) => onTemperatureChange(Number(e.target.value))}
                    aria-label="Temperatura alvo da água"
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            <div className="bg-gray-700/20 p-3 rounded-lg border border-gray-700/50 flex flex-col gap-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Parameters</h3>
                <Meter 
                    label="pH Level" 
                    value={ph.toFixed(2)} 
                    unit="" 
                    color={getMeterColor(ph, phRanges.good, phRanges.warn)} 
                />
                <Meter
                    label="pH (Sensor)"
                    value={measuredPh.toFixed(2)}
                    unit=""
                    color={getMeterColor(measuredPh, phRanges.good, phRanges.warn)}
                />
                <Meter 
                    label="Dissolved O₂" 
                    value={oxygen.toFixed(1)} 
                    unit="%" 
                    color={getMeterColor(oxygen, [90, 101], [70, 90])} 
                />
                <Meter 
                    label="CO₂ (ppm)" 
                    value={co2.toFixed(1)} 
                    unit="" 
                    color={getMeterColor(co2, [5, 25], [25, 35])} 
                />
                <Meter
                    label="GH"
                    value={gh.toFixed(1)}
                    unit=" dGH"
                    color={getMeterColor(gh, [4, 12], [2, 16])}
                />
                <Meter
                    label="KH"
                    value={kh.toFixed(1)}
                    unit=" dKH"
                    color={getMeterColor(kh, [3, 10], [2, 14])}
                />
                <Meter
                    label="Salinity"
                    value={salinity.toFixed(3)}
                    unit=" sg"
                    color={environment === 'saltwater' ? getMeterColor(salinity, [1.023, 1.026], [1.02, 1.028]) : getMeterColor(salinity, [1, 1.002], [0.998, 1.005])}
                />
                <Meter
                    label="Phosphate"
                    value={phosphate.toFixed(2)}
                    unit=" ppm"
                    color={getMeterColor(phosphate, [0, 0.1], [0.1, 0.2])}
                />
            </div>

            <div className="bg-gray-700/20 p-3 rounded-lg border border-gray-700/50 flex flex-col gap-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Cycle Status</h3>
                <Meter 
                    label="Ammonia" 
                    value={ammonia.toFixed(2)} 
                    unit="ppm" 
                    color={getMeterColor(ammonia, [-1, 0.1], [0.1, 0.25])} 
                />
                <Meter 
                    label="Nitrite" 
                    value={nitrite.toFixed(2)} 
                    unit="ppm" 
                    color={getMeterColor(nitrite, [-1, 0.1], [0.1, 0.5])} 
                />
                <Meter 
                    label="Nitrate" 
                    value={nitrate.toFixed(1)} 
                    unit="ppm" 
                    color={getMeterColor(nitrate, [-1, 20], [20, 40])} 
                />
            </div>
        </div>
    );
};
