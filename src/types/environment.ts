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
}

export interface EcosystemState {
  timeOfDay: number; // 0-24
  lightOn: boolean;
  algaeLevel: number; // 0-100
}
