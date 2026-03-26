import React from 'react';
import type { EquipmentState, SensorState, WaterHistoryPoint, WaterQuality } from '../../../types';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, onChange, min = 0, max = 100 }) => (
  <label className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs text-gray-300">
      <span>{label}</span>
      <span className="font-mono text-gray-400">{value.toFixed(0)}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step="1"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full cursor-pointer appearance-none rounded-lg bg-gray-600 accent-cyan-500"
      aria-label={label}
    />
  </label>
);

interface SimulationPanelProps {
  equipment: EquipmentState;
  sensors: SensorState;
  waterQuality: WaterQuality;
  history: WaterHistoryPoint[];
  onEquipmentChange: (equipment: EquipmentState) => void;
  onSensorChange: (sensors: SensorState) => void;
  onTopOffWater: () => void;
  onCalibrateSensors: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  equipment,
  sensors,
  waterQuality,
  history,
  onEquipmentChange,
  onSensorChange,
  onTopOffWater,
  onCalibrateSensors,
}) => {
  const latest = history[history.length - 1];
  const previous = history[history.length - 6] ?? latest;

  const deltaNitrate = latest ? latest.nitrate - previous.nitrate : 0;
  const deltaTemp = latest ? latest.temperature - previous.temperature : 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-gray-700/50 bg-gray-700/20 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase text-gray-400">Equipamentos</h3>
        <div className="flex flex-col gap-2">
          <SliderControl
            label="Filtragem biológica"
            value={equipment.biologicalFiltration}
            onChange={(value) => onEquipmentChange({ ...equipment, biologicalFiltration: value })}
          />
          <SliderControl
            label="Filtragem mecânica"
            value={equipment.mechanicalFiltration}
            onChange={(value) => onEquipmentChange({ ...equipment, mechanicalFiltration: value })}
          />
          <SliderControl
            label="Aeração"
            value={equipment.aeration}
            onChange={(value) => onEquipmentChange({ ...equipment, aeration: value })}
          />
          <SliderControl
            label="Injeção de CO2"
            value={equipment.co2Injection}
            onChange={(value) => onEquipmentChange({ ...equipment, co2Injection: value })}
          />
          <SliderControl
            label="Intensidade de luz"
            value={equipment.lightIntensity}
            onChange={(value) => onEquipmentChange({ ...equipment, lightIntensity: value })}
          />
          <SliderControl
            label="Potência do aquecedor"
            value={equipment.heaterPower}
            onChange={(value) => onEquipmentChange({ ...equipment, heaterPower: value })}
          />
        </div>
      </section>

      <section className="rounded-lg border border-gray-700/50 bg-gray-700/20 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase text-gray-400">Sensores</h3>
        <div className="flex flex-col gap-2">
          <SliderControl
            label="Ruído de leitura"
            value={sensors.readingNoise}
            onChange={(value) => onSensorChange({ ...sensors, readingNoise: value })}
          />
          <button
            type="button"
            onClick={onCalibrateSensors}
            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            Calibrar sensores
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-700/50 bg-gray-700/20 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase text-gray-400">Hidrologia</h3>
        <div className="mb-3 text-sm text-gray-300">
          <p>
            Nível de água: <span className="font-mono text-cyan-300">{waterQuality.waterLevel.toFixed(1)}%</span>
          </p>
          <p>
            Salinidade: <span className="font-mono text-cyan-300">{waterQuality.salinity.toFixed(3)} sg</span>
          </p>
          <p>
            TDS: <span className="font-mono text-cyan-300">{waterQuality.tds.toFixed(0)} ppm</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onTopOffWater}
          className="w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Repor evaporação (top-off)
        </button>
      </section>

      <section className="rounded-lg border border-gray-700/50 bg-gray-700/20 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase text-gray-400">Tendências (últimos minutos)</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-gray-800/80 p-2">
            <div className="text-gray-400">Nitrato</div>
            <div className="font-mono text-white">{deltaNitrate >= 0 ? '+' : ''}{deltaNitrate.toFixed(2)} ppm</div>
          </div>
          <div className="rounded bg-gray-800/80 p-2">
            <div className="text-gray-400">Temperatura</div>
            <div className="font-mono text-white">{deltaTemp >= 0 ? '+' : ''}{deltaTemp.toFixed(2)}°C</div>
          </div>
        </div>
      </section>
    </div>
  );
};
