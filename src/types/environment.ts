export type EnvironmentType = 'freshwater' | 'saltwater';

export interface WaterQuality {
  ph: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  temperature: number;
  targetTemperature: number;
  oxygen: number;
  co2: number;
  gh: number;
  kh: number;
  salinity: number;
  phosphate: number;
  waterLevel: number;
  tds: number;
}

export interface EcosystemState {
  timeOfDay: number; // 0-24
  lightOn: boolean;
  algaeLevel: number; // 0-100
}

export interface EquipmentState {
  biologicalFiltration: number; // 0-100
  mechanicalFiltration: number; // 0-100
  aeration: number; // 0-100
  co2Injection: number; // 0-100
  lightIntensity: number; // 0-100
  heaterPower: number; // 0-100
}

export interface SensorState {
  calibrationOffsetPh: number;
  calibrationOffsetTemp: number;
  readingNoise: number; // 0-100
}

export interface WaterHistoryPoint {
  timestamp: number;
  ph: number;
  nitrate: number;
  temperature: number;
  salinity: number;
  oxygen: number;
}
