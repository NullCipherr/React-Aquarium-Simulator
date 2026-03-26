
import type {
  DecorationInstance,
  EquipmentState,
  EcosystemState,
  EnvironmentType,
  FishInstance,
  FoodParticle,
  SensorState,
  WaterQuality,
} from '../types';

interface AppState {
    fishList: FishInstance[];
    foodList: FoodParticle[];
    environment: EnvironmentType;
    decorations: DecorationInstance[];
    waterQuality: WaterQuality;
    ecosystem: EcosystemState;
    equipment?: EquipmentState;
    sensors?: SensorState;
}

export const saveState = (state: AppState) => {
    try {
        const stateString = JSON.stringify(state);
        localStorage.setItem('aquariumState', stateString);
    } catch (error) {
        console.error("Failed to save state:", error);
    }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isWaterQuality = (value: unknown): value is WaterQuality => {
  if (!isObject(value)) return false;
  return (
    typeof value.ph === 'number' &&
    typeof value.ammonia === 'number' &&
    typeof value.nitrite === 'number' &&
    typeof value.nitrate === 'number' &&
    typeof value.temperature === 'number' &&
    typeof value.targetTemperature === 'number' &&
    typeof value.oxygen === 'number' &&
    typeof value.co2 === 'number' &&
    typeof value.gh === 'number' &&
    typeof value.kh === 'number' &&
    typeof value.salinity === 'number' &&
    typeof value.phosphate === 'number' &&
    typeof value.waterLevel === 'number' &&
    typeof value.tds === 'number'
  );
};

const isEcosystemState = (value: unknown): value is EcosystemState => {
  if (!isObject(value)) return false;
  return (
    typeof value.timeOfDay === 'number' &&
    typeof value.lightOn === 'boolean' &&
    typeof value.algaeLevel === 'number'
  );
};

const isEquipmentState = (value: unknown): value is EquipmentState => {
  if (!isObject(value)) return false;
  return (
    typeof value.biologicalFiltration === 'number' &&
    typeof value.mechanicalFiltration === 'number' &&
    typeof value.aeration === 'number' &&
    typeof value.co2Injection === 'number' &&
    typeof value.lightIntensity === 'number' &&
    typeof value.heaterPower === 'number'
  );
};

const isSensorState = (value: unknown): value is SensorState => {
  if (!isObject(value)) return false;
  return (
    typeof value.calibrationOffsetPh === 'number' &&
    typeof value.calibrationOffsetTemp === 'number' &&
    typeof value.readingNoise === 'number'
  );
};

export const loadState = (): AppState | null => {
    try {
        const savedState = localStorage.getItem('aquariumState');
        if (savedState === null) {
            return null;
        }

        const parsed: unknown = JSON.parse(savedState);
        if (!isObject(parsed)) return null;

        const environmentCandidate = parsed.environment;
        const environment: EnvironmentType =
          environmentCandidate === 'saltwater' ? 'saltwater' : 'freshwater';

        return {
          fishList: Array.isArray(parsed.fishList) ? (parsed.fishList as FishInstance[]) : [],
          foodList: Array.isArray(parsed.foodList) ? (parsed.foodList as FoodParticle[]) : [],
          environment,
          decorations: Array.isArray(parsed.decorations)
            ? (parsed.decorations as DecorationInstance[])
            : [],
          waterQuality: isWaterQuality(parsed.waterQuality)
            ? parsed.waterQuality
            : {
                ph: environment === 'freshwater' ? 7.2 : 8.2,
                ammonia: 0,
                nitrite: 0,
                nitrate: 5,
                temperature: environment === 'freshwater' ? 25 : 27,
                targetTemperature: environment === 'freshwater' ? 25 : 27,
                oxygen: 100,
                co2: 10,
                gh: environment === 'freshwater' ? 6 : 8,
                kh: environment === 'freshwater' ? 4 : 9,
                salinity: environment === 'saltwater' ? 1.024 : 1,
                phosphate: 0.04,
                waterLevel: 100,
                tds: environment === 'freshwater' ? 320 : 540,
              },
          ecosystem: isEcosystemState(parsed.ecosystem)
            ? parsed.ecosystem
            : { timeOfDay: 8, lightOn: true, algaeLevel: 0 },
          equipment: isEquipmentState(parsed.equipment)
            ? parsed.equipment
            : undefined,
          sensors: isSensorState(parsed.sensors)
            ? parsed.sensors
            : undefined,
        };
    } catch (error) {
        console.error("Failed to load state:", error);
        return null;
    }
};
