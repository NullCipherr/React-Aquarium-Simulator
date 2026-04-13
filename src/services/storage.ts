import type {
  DecorationInstance,
  EcosystemState,
  EnvironmentType,
  EquipmentState,
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

interface PersistedEnvelope {
  version: number;
  savedAt: string;
  data: AppState;
}

const STORAGE_KEY = 'aquariumState';
const STORAGE_VERSION = 2;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getDefaultWaterQuality = (environment: EnvironmentType): WaterQuality => ({
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
});

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

const normalizeState = (candidate: unknown): AppState | null => {
  if (!isObject(candidate)) return null;

  const environmentCandidate = candidate.environment;
  const environment: EnvironmentType =
    environmentCandidate === 'saltwater' ? 'saltwater' : 'freshwater';

  return {
    fishList: Array.isArray(candidate.fishList)
      ? (candidate.fishList as FishInstance[])
      : [],
    foodList: Array.isArray(candidate.foodList)
      ? (candidate.foodList as FoodParticle[])
      : [],
    environment,
    decorations: Array.isArray(candidate.decorations)
      ? (candidate.decorations as DecorationInstance[])
      : [],
    waterQuality: isWaterQuality(candidate.waterQuality)
      ? candidate.waterQuality
      : getDefaultWaterQuality(environment),
    ecosystem: isEcosystemState(candidate.ecosystem)
      ? candidate.ecosystem
      : { timeOfDay: 8, lightOn: true, algaeLevel: 0 },
    equipment: isEquipmentState(candidate.equipment)
      ? candidate.equipment
      : undefined,
    sensors: isSensorState(candidate.sensors)
      ? candidate.sensors
      : undefined,
  };
};

const parsePersistedData = (payload: unknown): AppState | null => {
  if (!isObject(payload)) return null;

  const maybeVersion = payload.version;
  const maybeData = payload.data;

  if (typeof maybeVersion === 'number' && isObject(maybeData)) {
    if (maybeVersion > STORAGE_VERSION) {
      console.warn(
        `[storage] Versão de estado (${maybeVersion}) acima da suportada (${STORAGE_VERSION}). Tentando leitura compatível.`,
      );
    }

    return normalizeState(maybeData);
  }

  // Compatibilidade com formato legado (estado salvo sem envelope/versionamento).
  return normalizeState(payload);
};

export const saveState = (state: AppState) => {
  try {
    const payload: PersistedEnvelope = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      data: state,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const loadState = (): AppState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState === null) return null;

    const parsed: unknown = JSON.parse(savedState);
    return parsePersistedData(parsed);
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
};
