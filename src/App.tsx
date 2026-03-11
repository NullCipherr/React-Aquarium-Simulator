
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Aquarium } from './features/aquarium/Aquarium';
import { Ribbon } from './features/controls/Ribbon';
import { LifePanel } from './features/controls/panels/LifePanel';
import { DecorPanel } from './features/controls/panels/DecorPanel';
import { SystemPanel } from './features/controls/panels/SystemPanel';
import { StatsPanel } from './features/aquarium/StatsPanel';
import { AddFishModal } from './features/fish/AddFishModal';
import { WaterQualityPanel } from './features/controls/panels/WaterQualityPanel';
import { EcosystemPanel } from './features/ecosystem/EcosystemPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { saveState, loadState } from './services/storage';

import type { TabType } from './features/controls/Ribbon';
// FIX: Changed import from './types' to './types/index' to resolve module ambiguity.
import type { FishInstance, FoodParticle, DecorationInstance, DecorationType, EatingEffect, FishSpecies, EnvironmentType, WaterQuality, EcosystemState } from './types/index';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('life');
  const [fishList, setFishList] = useState<FishInstance[]>([]);
  const [foodList, setFoodList] = useState<FoodParticle[]>([]);
  const [decorations, setDecorations] = useState<DecorationInstance[]>([]);
  const [eatingEffects, setEatingEffects] = useState<EatingEffect[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentType>('freshwater');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ fishCount: 0, averageAge: 0, averageHunger: 0 });
  
  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
    ph: 7.2,
    ammonia: 0,
    nitrite: 0,
    nitrate: 5,
    temperature: 25,
    targetTemperature: 25,
    oxygen: 100,
    co2: 10,
  });

  const [ecosystem, setEcosystem] = useState<EcosystemState>({
    timeOfDay: 8,
    lightOn: true,
    algaeLevel: 0,
  });

  const aquariumRef = useRef<HTMLDivElement>(null);

  const getAquariumDimensions = useCallback(() => {
    if (aquariumRef.current) {
      return {
        width: aquariumRef.current.offsetWidth,
        height: aquariumRef.current.offsetHeight,
      };
    }
    return { width: 800, height: 600 };
  }, []);

  const resetAquarium = useCallback((newEnvironment: EnvironmentType) => {
    setFishList([]);
    setFoodList([]);
    setDecorations([]);
    setEnvironment(newEnvironment);
    setWaterQuality({
        ph: newEnvironment === 'freshwater' ? 7.2 : 8.2,
        ammonia: 0,
        nitrite: 0,
        nitrate: 5,
        temperature: newEnvironment === 'freshwater' ? 25 : 27,
        targetTemperature: newEnvironment === 'freshwater' ? 25 : 27,
        oxygen: 100,
        co2: 10,
    });
    setEcosystem({ timeOfDay: 8, lightOn: true, algaeLevel: 0 });
  }, []);

  const addFish = (species: FishSpecies) => {
    const { width, height } = getAquariumDimensions();
    const dx = (Math.random() - 0.5) * species.speed;
    const dy = (Math.random() - 0.5) * species.speed;
    const flip = dx < 0;
    
    const newFish: FishInstance = {
      id: `fish_${Date.now()}_${Math.random()}`,
      speciesId: species.id,
      x: Math.random() * width,
      y: Math.random() * height,
      dx: dx,
      dy: dy,
      size: species.size,
      hunger: 50,
      age: 0,
      health: 100,
      target: null,
      flip: flip,
      rotation: Math.atan2(dy, dx), // Absolute world angle
      isStressed: false,
      happiness: 70,
    };
    setFishList(prev => [...prev, newFish]);
  };

  const addFood = (x: number, y: number) => {
    if (foodList.length > 50) return;
    const newFood: FoodParticle = {
      id: `food_${Date.now()}_${Math.random()}`,
      x,
      y,
    };
    setFoodList(prev => [...prev, newFood]);
  };
  
  const handleWaterChange = () => {
    setWaterQuality(prev => ({
        ...prev,
        ph: environment === 'freshwater' ? 7.2 : 8.2,
        ammonia: prev.ammonia * 0.1,
        nitrite: prev.nitrite * 0.1,
        nitrate: Math.max(0, prev.nitrate * 0.5),
        oxygen: 100,
        co2: 10,
    }));
    alert('Performed a 50% water change!');
  };

  const handleTemperatureChange = (newTemp: number) => {
    setWaterQuality(prev => ({ ...prev, targetTemperature: newTemp }));
  };

  const addDecoration = (type: DecorationType) => {
    const { width } = getAquariumDimensions();
    const id = `deco_${Date.now()}_${Math.random()}`;
    let newDecoration: DecorationInstance;
    
    const depth = Math.random(); 

    if (type === 'plant') {
        newDecoration = {
            id, type,
            x: Math.random() * width,
            y: 0,
            width: 15 + Math.random() * 10,
            height: 50 + Math.random() * 100,
            growth: 100,
            depth: depth 
        };
    } else { // rock
        const size = 40 + Math.random() * 40;
        newDecoration = {
            id, type,
            x: Math.random() * width,
            y: 0,
            width: size,
            height: size * (0.5 + Math.random() * 0.5),
            depth: depth
        };
    }
    setDecorations(prev => [...prev, newDecoration]);
  };

  const clearDecorations = () => setDecorations([]);
  const handleToggleLight = () => setEcosystem(prev => ({...prev, lightOn: !prev.lightOn}));
  const handleCleanAlgae = () => setEcosystem(prev => ({...prev, algaeLevel: 0}));

  // Use the custom hook for the game loop logic
  useGameLoop({
      fishList, setFishList,
      foodList, setFoodList,
      decorations, setDecorations,
      eatingEffects, setEatingEffects,
      waterQuality, setWaterQuality,
      ecosystem, setEcosystem,
      getAquariumDimensions,
  });
  
  useEffect(() => {
    const totalAge = fishList.reduce((sum, fish) => sum + fish.age, 0);
    const totalHunger = fishList.reduce((sum, fish) => sum + fish.hunger, 0);
    const fishCount = fishList.length;
    setStats({
      fishCount,
      averageAge: fishCount > 0 ? totalAge / fishCount : 0,
      averageHunger: fishCount > 0 ? totalHunger / fishCount : 0,
    });
  }, [fishList]);

  const handleSave = () => {
    const currentState = { fishList, foodList, environment, decorations, waterQuality, ecosystem };
    saveState(currentState);
  };

  const handleLoad = () => {
    const savedState = loadState();
    if (savedState) {
        setFishList(savedState.fishList || []);
        setFoodList(savedState.foodList || []);
        setEnvironment(savedState.environment || 'freshwater');
        setDecorations(savedState.decorations || []);
        setWaterQuality(savedState.waterQuality || waterQuality);
        setEcosystem(savedState.ecosystem || ecosystem);
        alert('Aquarium loaded!');
    }
  };

  const renderSidePanel = () => {
      switch (activeTab) {
        case 'life':
            return <LifePanel onAddFish={() => setIsModalOpen(true)} onFeed={() => {
                const {width} = getAquariumDimensions();
                // Drop food based on the number of fish, with a max cap
                const foodAmount = Math.max(1, Math.min(25, Math.ceil(fishList.length / 2)));
                for (let i = 0; i < foodAmount; i++) {
                    // Stagger the drop position
                    addFood(Math.random() * width, 20 + Math.random() * 40);
                }
            }} />;
        case 'decor':
            return <DecorPanel 
                currentEnvironment={environment}
                onChangeEnvironment={resetAquarium}
                onAddDecoration={addDecoration}
                onClearDecorations={clearDecorations}
                onCleanAlgae={handleCleanAlgae}
                onWaterChange={handleWaterChange}
            />;
        case 'water':
            return <WaterQualityPanel 
                waterQuality={waterQuality} 
                environment={environment}
                onTemperatureChange={handleTemperatureChange}
            />;
        case 'system':
            return (
                <div className="flex flex-col gap-4">
                    <EcosystemPanel 
                        ecosystem={ecosystem}
                        onToggleLight={handleToggleLight}
                    />
                    <SystemPanel onSave={handleSave} onLoad={handleLoad} />
                </div>
            );
        default:
            return null;
      }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
      
      <header className="flex-shrink-0 z-30 relative">
          <div className="bg-gray-900 px-6 py-2 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider text-blue-400">AquaSim <span className="text-gray-500 text-base font-normal">2024</span></h1>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Interactive Simulator</div>
          </div>
          <Ribbon activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      
      <main className="flex-grow flex relative">
        <div className="flex-grow relative bg-black shadow-inner overflow-hidden">
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
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
             <StatsPanel stats={stats} />
          </div>
        </div>

        <div className="w-80 bg-gray-800/95 backdrop-blur-md border-l border-gray-700 flex-shrink-0 flex flex-col shadow-2xl z-20 transition-all duration-300">
            <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-lg font-bold text-gray-200">
                    {activeTab === 'life' && 'Life Support'}
                    {activeTab === 'decor' && 'Environment & Decor'}
                    {activeTab === 'water' && 'Water Chemistry'}
                    {activeTab === 'system' && 'System Control'}
                </h2>
                <p className="text-xs text-gray-500">
                    {activeTab === 'life' && 'Manage your population'}
                    {activeTab === 'decor' && 'Customize the tank'}
                    {activeTab === 'water' && 'Monitor parameters'}
                    {activeTab === 'system' && 'Global settings'}
                </p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                {renderSidePanel()}
            </div>
        </div>
      </main>

      <AddFishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFish={addFish}
        environment={environment}
      />

        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.2);
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
    </div>
  );
};

export default App;
