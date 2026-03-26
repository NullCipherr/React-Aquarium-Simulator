import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Aquarium } from './features/aquarium/Aquarium';
import { StatsPanel } from './features/aquarium/StatsPanel';
import { Ribbon } from './features/controls/Ribbon';
import { DecorPanel } from './features/controls/panels/DecorPanel';
import { LifePanel } from './features/controls/panels/LifePanel';
import { SimulationPanel } from './features/controls/panels/SimulationPanel';
import { SystemPanel } from './features/controls/panels/SystemPanel';
import { WaterQualityPanel } from './features/controls/panels/WaterQualityPanel';
import { EcosystemPanel } from './features/ecosystem/EcosystemPanel';
import { AddFishModal } from './features/fish/AddFishModal';
import { useGameLoop } from './hooks/useGameLoop';
import { loadState, saveState } from './services/storage';
import type { TabType } from './features/controls/Ribbon';
import type {
  DecorationInstance,
  DecorationType,
  EquipmentState,
  EcosystemState,
  EatingEffect,
  EnvironmentType,
  FishInstance,
  FishSpecies,
  FoodParticle,
  SensorState,
  WaterHistoryPoint,
  WaterQuality,
} from './types';

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random()}`;
};

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

const getDefaultEcosystem = (): EcosystemState => ({
  timeOfDay: 8,
  lightOn: true,
  algaeLevel: 0,
});

const getDefaultEquipment = (): EquipmentState => ({
  biologicalFiltration: 70,
  mechanicalFiltration: 65,
  aeration: 60,
  co2Injection: 20,
  lightIntensity: 65,
  heaterPower: 70,
});

const getDefaultSensors = (): SensorState => ({
  calibrationOffsetPh: 0,
  calibrationOffsetTemp: 0,
  readingNoise: 8,
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('life');
  const [fishList, setFishList] = useState<FishInstance[]>([]);
  const [foodList, setFoodList] = useState<FoodParticle[]>([]);
  const [decorations, setDecorations] = useState<DecorationInstance[]>([]);
  const [eatingEffects, setEatingEffects] = useState<EatingEffect[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentType>('freshwater');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [waterQuality, setWaterQuality] = useState<WaterQuality>(getDefaultWaterQuality('freshwater'));
  const [equipment, setEquipment] = useState<EquipmentState>(getDefaultEquipment());
  const [sensors, setSensors] = useState<SensorState>(getDefaultSensors());
  const [waterHistory, setWaterHistory] = useState<WaterHistoryPoint[]>([]);
  const [ecosystem, setEcosystem] = useState<EcosystemState>(getDefaultEcosystem());

  const aquariumRef = useRef<HTMLDivElement>(null);
  const messageTimeoutRef = useRef<number | null>(null);
  const waterQualitySnapshotRef = useRef<WaterQuality>(waterQuality);

  const showSystemMessage = useCallback((message: string) => {
    setSystemMessage(message);
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setSystemMessage(null);
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const getAquariumDimensions = useCallback(() => {
    if (aquariumRef.current) {
      return {
        width: aquariumRef.current.offsetWidth,
        height: aquariumRef.current.offsetHeight,
      };
    }
    return { width: 800, height: 600 };
  }, []);

  useEffect(() => {
    waterQualitySnapshotRef.current = waterQuality;
  }, [waterQuality]);

  const stats = useMemo(() => {
    const fishCount = fishList.length;
    const totalAge = fishList.reduce((sum, fish) => sum + fish.age, 0);
    const totalHunger = fishList.reduce((sum, fish) => sum + fish.hunger, 0);

    return {
      fishCount,
      averageAge: fishCount > 0 ? totalAge / fishCount : 0,
      averageHunger: fishCount > 0 ? totalHunger / fishCount : 0,
    };
  }, [fishList]);

  const resetAquarium = useCallback((nextEnvironment: EnvironmentType) => {
    setFishList([]);
    setFoodList([]);
    setDecorations([]);
    setEatingEffects([]);
    setEnvironment(nextEnvironment);
    setWaterQuality(getDefaultWaterQuality(nextEnvironment));
    setEquipment(getDefaultEquipment());
    setSensors(getDefaultSensors());
    setWaterHistory([]);
    setEcosystem(getDefaultEcosystem());
  }, []);

  const addFish = useCallback(
    (species: FishSpecies) => {
      const { width, height } = getAquariumDimensions();
      const dx = (Math.random() - 0.5) * species.speed;
      const dy = (Math.random() - 0.5) * species.speed;

      const newFish: FishInstance = {
        id: createId('fish'),
        speciesId: species.id,
        x: Math.random() * width,
        y: Math.random() * height,
        dx,
        dy,
        size: species.size,
        hunger: 50,
        age: 0,
        health: 100,
        target: null,
        flip: dx < 0,
        rotation: Math.atan2(dy, dx),
        isStressed: false,
        happiness: 70,
      };

      setFishList((prev) => [...prev, newFish]);
    },
    [getAquariumDimensions],
  );

  const addFood = useCallback((x: number, y: number) => {
    setFoodList((prev) => {
      if (prev.length >= 50) return prev;
      return [...prev, { id: createId('food'), x, y }];
    });
  }, []);

  const handleWaterChange = useCallback(() => {
    setWaterQuality((prev) => ({
      ...prev,
      ph: environment === 'freshwater' ? 7.2 : 8.2,
      ammonia: prev.ammonia * 0.1,
      nitrite: prev.nitrite * 0.1,
      nitrate: Math.max(0, prev.nitrate * 0.5),
      phosphate: prev.phosphate * 0.7,
      oxygen: 100,
      co2: 10,
      gh: prev.gh * 0.92,
      kh: prev.kh * 0.92,
      waterLevel: 100,
      salinity: environment === 'saltwater' ? 1.024 : 1,
    }));
    showSystemMessage('Troca de água de 50% aplicada.');
  }, [environment, showSystemMessage]);

  const handleTemperatureChange = useCallback((newTemp: number) => {
    setWaterQuality((prev) => ({ ...prev, targetTemperature: newTemp }));
  }, []);

  const addDecoration = useCallback(
    (type: DecorationType) => {
      const { width } = getAquariumDimensions();
      const id = createId('deco');
      const depth = Math.random();
      const rockSize = 40 + Math.random() * 40;

      const newDecoration: DecorationInstance =
        type === 'plant'
          ? {
              id,
              type,
              x: Math.random() * width,
              y: 0,
              width: 15 + Math.random() * 10,
              height: 50 + Math.random() * 100,
              growth: 100,
              depth,
            }
          : {
              id,
              type,
              x: Math.random() * width,
              y: 0,
              width: rockSize,
              height: rockSize * (0.5 + Math.random() * 0.5),
              depth,
            };

      setDecorations((prev) => [...prev, newDecoration]);
    },
    [getAquariumDimensions],
  );

  const clearDecorations = useCallback(() => setDecorations([]), []);
  const handleToggleLight = useCallback(
    () => setEcosystem((prev) => ({ ...prev, lightOn: !prev.lightOn })),
    [],
  );
  const handleCleanAlgae = useCallback(
    () => setEcosystem((prev) => ({ ...prev, algaeLevel: 0 })),
    [],
  );

  useGameLoop({
    fishList,
    setFishList,
    foodList,
    setFoodList,
    decorations,
    setDecorations,
    eatingEffects,
    setEatingEffects,
    waterQuality,
    setWaterQuality,
    equipment,
    ecosystem,
    setEcosystem,
    environment,
    getAquariumDimensions,
  });

  const handleSave = useCallback(() => {
    saveState({ fishList, foodList, environment, decorations, waterQuality, ecosystem, equipment, sensors });
    showSystemMessage('Aquário salvo com sucesso.');
  }, [decorations, ecosystem, environment, equipment, fishList, foodList, sensors, showSystemMessage, waterQuality]);

  const handleLoad = useCallback(() => {
    const savedState = loadState();
    if (!savedState) {
      showSystemMessage('Nenhum salvamento válido encontrado.');
      return;
    }

    setFishList(savedState.fishList ?? []);
    setFoodList(savedState.foodList ?? []);
    setEnvironment(savedState.environment ?? 'freshwater');
    setDecorations(savedState.decorations ?? []);
    setWaterQuality(savedState.waterQuality ?? getDefaultWaterQuality(savedState.environment ?? 'freshwater'));
    setEquipment(savedState.equipment ?? getDefaultEquipment());
    setSensors(savedState.sensors ?? getDefaultSensors());
    setEcosystem(savedState.ecosystem ?? getDefaultEcosystem());
    setEatingEffects([]);
    setWaterHistory([]);
    showSystemMessage('Aquário carregado com sucesso.');
  }, [showSystemMessage]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWaterHistory((prev) => {
        const snapshot = waterQualitySnapshotRef.current;
        const point: WaterHistoryPoint = {
          timestamp: Date.now(),
          ph: snapshot.ph,
          nitrate: snapshot.nitrate,
          temperature: snapshot.temperature,
          salinity: snapshot.salinity,
          oxygen: snapshot.oxygen,
        };
        const next = [...prev, point];
        return next.slice(-120);
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const drift = window.setInterval(() => {
      setSensors((prev) => ({
        ...prev,
        calibrationOffsetPh: Math.max(-0.25, Math.min(0.25, prev.calibrationOffsetPh + (Math.random() - 0.5) * 0.01)),
        calibrationOffsetTemp: Math.max(-1.5, Math.min(1.5, prev.calibrationOffsetTemp + (Math.random() - 0.5) * 0.04)),
      }));
    }, 10000);

    return () => window.clearInterval(drift);
  }, []);

  const measuredWaterQuality = useMemo(() => {
    const noiseFactor = sensors.readingNoise / 100;
    const n = () => (Math.random() - 0.5) * noiseFactor;
    return {
      ...waterQuality,
      ph: waterQuality.ph + sensors.calibrationOffsetPh + n() * 0.12,
      temperature: waterQuality.temperature + sensors.calibrationOffsetTemp + n() * 0.8,
    };
  }, [sensors, waterQuality]);

  const handleTopOffWater = useCallback(() => {
    setWaterQuality((prev) => ({
      ...prev,
      waterLevel: 100,
      salinity: environment === 'saltwater' ? 1.024 : 1,
      gh: prev.gh * 0.98,
      kh: prev.kh * 0.98,
    }));
    showSystemMessage('Reposição de evaporação concluída.');
  }, [environment, showSystemMessage]);

  const handleCalibrateSensors = useCallback(() => {
    setSensors((prev) => ({
      ...prev,
      calibrationOffsetPh: 0,
      calibrationOffsetTemp: 0,
    }));
    showSystemMessage('Sensores calibrados.');
  }, [showSystemMessage]);

  const handleFeed = useCallback(() => {
    const { width } = getAquariumDimensions();
    const foodAmount = Math.max(1, Math.min(25, Math.ceil(fishList.length / 2)));

    for (let i = 0; i < foodAmount; i += 1) {
      addFood(Math.random() * width, 20 + Math.random() * 40);
    }
  }, [addFood, fishList.length, getAquariumDimensions]);

  const sidePanelContent = useMemo(() => {
    switch (activeTab) {
      case 'life':
        return <LifePanel onAddFish={() => setIsModalOpen(true)} onFeed={handleFeed} />;
      case 'decor':
        return (
          <DecorPanel
            currentEnvironment={environment}
            onChangeEnvironment={resetAquarium}
            onAddDecoration={addDecoration}
            onClearDecorations={clearDecorations}
            onCleanAlgae={handleCleanAlgae}
            onWaterChange={handleWaterChange}
          />
        );
      case 'water':
        return (
          <WaterQualityPanel
            waterQuality={waterQuality}
            measuredWaterQuality={measuredWaterQuality}
            environment={environment}
            onTemperatureChange={handleTemperatureChange}
          />
        );
      case 'sim':
        return (
          <SimulationPanel
            equipment={equipment}
            sensors={sensors}
            waterQuality={waterQuality}
            history={waterHistory}
            onEquipmentChange={setEquipment}
            onSensorChange={setSensors}
            onTopOffWater={handleTopOffWater}
            onCalibrateSensors={handleCalibrateSensors}
          />
        );
      case 'system':
        return (
          <div className="flex flex-col gap-4">
            <EcosystemPanel ecosystem={ecosystem} onToggleLight={handleToggleLight} />
            <SystemPanel onSave={handleSave} onLoad={handleLoad} />
          </div>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    addDecoration,
    clearDecorations,
    ecosystem,
    environment,
    equipment,
    handleCleanAlgae,
    handleCalibrateSensors,
    handleFeed,
    handleLoad,
    handleSave,
    handleTopOffWater,
    handleTemperatureChange,
    handleToggleLight,
    handleWaterChange,
    measuredWaterQuality,
    resetAquarium,
    sensors,
    waterHistory,
    waterQuality,
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-900 font-sans text-white">
      <header className="relative z-30 flex-shrink-0">
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-2">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">
            AquaSim <span className="text-base font-normal text-gray-500">2026</span>
          </h1>
          <div className="text-xs uppercase tracking-widest text-gray-500">Interactive Simulator</div>
        </div>
        {systemMessage && (
          <div
            className="border-b border-blue-900/40 bg-blue-950/40 px-6 py-1.5 text-xs text-blue-200"
            role="status"
            aria-live="polite"
          >
            {systemMessage}
          </div>
        )}
        <Ribbon activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className="relative flex flex-grow">
        <section className="relative flex-grow overflow-hidden bg-black shadow-inner" aria-label="Aquário">
          <Aquarium
            ref={aquariumRef}
            fishList={fishList}
            foodList={foodList}
            decorations={decorations}
            eatingEffects={eatingEffects}
            environment={environment}
            ecosystem={ecosystem}
            onAddFood={addFood}
          />
          <div className="pointer-events-none absolute bottom-4 left-4 right-4">
            <StatsPanel stats={stats} />
          </div>
        </section>

        <aside className="z-20 flex w-80 flex-shrink-0 flex-col border-l border-gray-700 bg-gray-800/95 shadow-2xl backdrop-blur-md transition-all duration-300">
          <div className="border-b border-gray-700/50 p-4">
            <h2 className="text-lg font-bold text-gray-200">
              {activeTab === 'life' && 'Life Support'}
              {activeTab === 'decor' && 'Environment & Decor'}
              {activeTab === 'water' && 'Water Chemistry'}
              {activeTab === 'sim' && 'Simulation Lab'}
              {activeTab === 'system' && 'System Control'}
            </h2>
            <p className="text-xs text-gray-500">
              {activeTab === 'life' && 'Manage your population'}
              {activeTab === 'decor' && 'Customize the tank'}
              {activeTab === 'water' && 'Monitor parameters'}
              {activeTab === 'sim' && 'Tune simulation models'}
              {activeTab === 'system' && 'Global settings'}
            </p>
          </div>
          <div className="custom-scrollbar flex-grow overflow-y-auto p-4">{sidePanelContent}</div>
        </aside>
      </main>

      <AddFishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFish={addFish}
        environment={environment}
      />
    </div>
  );
};

export default App;
