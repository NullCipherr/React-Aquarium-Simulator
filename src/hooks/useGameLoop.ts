import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  DecorationInstance,
  EatingEffect,
  EquipmentState,
  EcosystemState,
  EnvironmentType,
  FishInstance,
  FoodParticle,
  WaterQuality,
} from '../types';
import { FISH_SPECIES } from '../constants';

interface GameLoopProps {
  fishList: FishInstance[];
  setFishList: Dispatch<SetStateAction<FishInstance[]>>;
  foodList: FoodParticle[];
  setFoodList: Dispatch<SetStateAction<FoodParticle[]>>;
  decorations: DecorationInstance[];
  setDecorations: Dispatch<SetStateAction<DecorationInstance[]>>;
  eatingEffects: EatingEffect[];
  setEatingEffects: Dispatch<SetStateAction<EatingEffect[]>>;
  waterQuality: WaterQuality;
  setWaterQuality: Dispatch<SetStateAction<WaterQuality>>;
  equipment: EquipmentState;
  ecosystem: EcosystemState;
  setEcosystem: Dispatch<SetStateAction<EcosystemState>>;
  environment: EnvironmentType;
  getAquariumDimensions: () => { width: number; height: number };
}

const GAME_HOUR_DURATION_SECONDS = 15;
const EATING_EFFECT_DURATION = 400;
const REPRODUCTION_CHANCE = 0.0005;

const speciesById = new Map(FISH_SPECIES.map((species) => [species.id, species]));

const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x1 - x2, y1 - y2);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random()}`;
};

export const useGameLoop = ({
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
}: GameLoopProps) => {
  const animationFrameId = useRef<number | null>(null);
  const lastTime = useRef<number>(performance.now());

  const fishListRef = useRef(fishList);
  const foodListRef = useRef(foodList);
  const decorationsRef = useRef(decorations);
  const eatingEffectsRef = useRef(eatingEffects);
  const waterQualityRef = useRef(waterQuality);
  const equipmentRef = useRef(equipment);
  const ecosystemRef = useRef(ecosystem);
  const environmentRef = useRef(environment);
  const getAquariumDimensionsRef = useRef(getAquariumDimensions);

  useEffect(() => {
    fishListRef.current = fishList;
  }, [fishList]);

  useEffect(() => {
    foodListRef.current = foodList;
  }, [foodList]);

  useEffect(() => {
    decorationsRef.current = decorations;
  }, [decorations]);

  useEffect(() => {
    eatingEffectsRef.current = eatingEffects;
  }, [eatingEffects]);

  useEffect(() => {
    waterQualityRef.current = waterQuality;
  }, [waterQuality]);

  useEffect(() => {
    equipmentRef.current = equipment;
  }, [equipment]);

  useEffect(() => {
    ecosystemRef.current = ecosystem;
  }, [ecosystem]);

  useEffect(() => {
    environmentRef.current = environment;
  }, [environment]);

  useEffect(() => {
    getAquariumDimensionsRef.current = getAquariumDimensions;
  }, [getAquariumDimensions]);

  const gameLoop = useCallback(() => {
    const now = performance.now();
    const rawDelta = (now - lastTime.current) / 16.67;
    const delta = Math.min(rawDelta, 4);
    lastTime.current = now;

    const { width, height } = getAquariumDimensionsRef.current();

    const currentFishList = fishListRef.current;
    const currentFoodList = foodListRef.current;
    const currentDecorations = decorationsRef.current;
    const currentEatingEffects = eatingEffectsRef.current;
    const currentWaterQuality = waterQualityRef.current;
    const currentEquipment = equipmentRef.current;
    const currentEcosystem = ecosystemRef.current;
    const currentEnvironment = environmentRef.current;

    const nextTimeOfDay =
      (currentEcosystem.timeOfDay + delta / (60 * GAME_HOUR_DURATION_SECONDS)) % 24;
    const isDay = nextTimeOfDay >= 6 && nextTimeOfDay < 20;
    const lightAvailable = isDay && currentEcosystem.lightOn;
    const lightFactor = currentEquipment.lightIntensity / 100;

    let nextAlgaeLevel = currentEcosystem.algaeLevel;
    if (lightAvailable && currentWaterQuality.nitrate > 15) {
      nextAlgaeLevel += (currentWaterQuality.nitrate - 15) * (0.00006 + lightFactor * 0.00008) * delta;
    } else {
      nextAlgaeLevel -= 0.005 * delta;
    }
    nextAlgaeLevel = Math.max(0, Math.min(100, nextAlgaeLevel));

    const nextEcosystem: EcosystemState = {
      ...currentEcosystem,
      timeOfDay: nextTimeOfDay,
      algaeLevel: nextAlgaeLevel,
    };

    const fishBioload = currentFishList.reduce((load, fish) => load + fish.size / 20, 0);
    const filterCapacity = 0.00015;

    let {
      ph,
      ammonia,
      nitrite,
      nitrate,
      temperature,
      oxygen,
      targetTemperature,
      co2,
      gh,
      kh,
      salinity,
      phosphate,
      waterLevel,
      tds,
    } = currentWaterQuality;

    const heaterFactor = 0.6 + currentEquipment.heaterPower / 100;
    if (temperature < targetTemperature) {
      temperature = Math.min(targetTemperature, temperature + 0.005 * delta * heaterFactor);
    } else if (temperature > targetTemperature) {
      temperature = Math.max(targetTemperature, temperature - 0.004 * delta);
    }

    ph -= (ammonia + nitrite) * 0.00005 * delta;
    ph += 0.000002 * delta;
    ph -= (currentEquipment.co2Injection / 100) * 0.00025 * delta;

    ammonia += (fishBioload * 0.00001 + currentFoodList.length * 0.000002) * delta;
    const bioFilterEfficiency = 0.5 + currentEquipment.biologicalFiltration / 100;
    const ammoniaConverted = Math.min(ammonia, filterCapacity * delta * bioFilterEfficiency);
    ammonia -= ammoniaConverted;
    nitrite += ammoniaConverted;

    const nitriteConverted = Math.min(nitrite, filterCapacity * 0.8 * delta * bioFilterEfficiency);
    nitrite -= nitriteConverted;
    nitrate += nitriteConverted;

    const mechanicalEffect = currentEquipment.mechanicalFiltration / 100;
    phosphate += currentFoodList.length * 0.000002 * delta;
    phosphate = Math.max(0, phosphate - mechanicalEffect * 0.001 * delta);

    oxygen -= fishBioload * 0.0001 * delta;
    co2 += fishBioload * 0.00008 * delta;
    oxygen += 0.0008 * delta + (currentEquipment.aeration / 100) * 0.01 * delta;
    co2 -= 0.0005 * delta + (currentEquipment.aeration / 100) * 0.006 * delta;
    co2 += (currentEquipment.co2Injection / 100) * 0.01 * delta;

    const evaporationRate = 0.0008 + (temperature - 20) * 0.00004 + (currentEquipment.lightIntensity / 100) * 0.0004;
    waterLevel = Math.max(70, waterLevel - evaporationRate * delta);

    if (currentEnvironment === 'saltwater') {
      const concentrationFactor = 100 / waterLevel;
      salinity = Math.min(1.03, 1.024 * concentrationFactor);
    } else {
      salinity = 1 + (100 - waterLevel) * 0.00002;
    }

    gh += (100 - waterLevel) * 0.00002 * delta;
    kh += (100 - waterLevel) * 0.000015 * delta;

    currentDecorations.forEach((decoration) => {
      if (decoration.type === 'plant' && lightAvailable && decoration.height > 10) {
        const plantMass = decoration.height / 100;
        oxygen += plantMass * 0.005 * delta * (0.4 + lightFactor);
        co2 -= plantMass * 0.005 * delta * (0.4 + lightFactor);
        nitrate -= plantMass * 0.0001 * delta * (0.4 + lightFactor);
        phosphate -= plantMass * 0.00008 * delta * (0.4 + lightFactor);
      }
    });

    oxygen = Math.max(0, Math.min(100, oxygen));
    co2 = Math.max(0, co2);
    nitrate = Math.max(0, nitrate);
    phosphate = Math.max(0, phosphate);
    gh = Math.max(1, gh);
    kh = Math.max(1, kh);
    tds = Math.max(10, 180 * gh + 22 * kh + (currentEnvironment === 'saltwater' ? salinity * 1000 : 0));

    const nextWaterQuality: WaterQuality = {
      ...currentWaterQuality,
      ph,
      ammonia,
      nitrite,
      nitrate,
      temperature,
      oxygen,
      co2,
      targetTemperature,
      gh,
      kh,
      salinity,
      phosphate,
      waterLevel,
      tds,
    };

    const nextDecorations = currentDecorations.map((decoration) => {
      if (
        decoration.type === 'plant' &&
        lightAvailable &&
        nextWaterQuality.nitrate > 2 &&
        nextWaterQuality.co2 > 5 &&
        decoration.height < 250
      ) {
        return { ...decoration, height: decoration.height + 0.005 * delta };
      }
      return decoration;
    });

    const eatenFoodIds = new Set<string>();
    const newEatingEffects: { x: number; y: number }[] = [];
    const newBornFish: FishInstance[] = [];

    const updatedFishList = currentFishList
      .map((fish) => {
        const species = speciesById.get(fish.speciesId);
        if (!species) return fish;

        let { x, y, dx, dy, hunger, age, size, flip, health, happiness, target, rotation } = fish;

        hunger += 0.02 * delta;
        age += 0.001 * delta;

        const tolerance = species.waterQualityTolerance;
        let isStressed = false;

        if (nextWaterQuality.ammonia > tolerance.ammoniaMax) {
          health -= 0.1 * delta;
          isStressed = true;
        }
        if (nextWaterQuality.nitrite > tolerance.nitriteMax) {
          health -= 0.2 * delta;
          isStressed = true;
        }
        if (nextWaterQuality.nitrate > tolerance.nitrateMax) {
          health -= 0.05 * delta;
          isStressed = true;
        }
        if (
          nextWaterQuality.ph < tolerance.ph[0] ||
          nextWaterQuality.ph > tolerance.ph[1]
        ) {
          health -= 0.05 * delta;
          isStressed = true;
        }
        if (
          nextWaterQuality.temperature < tolerance.temperature[0] ||
          nextWaterQuality.temperature > tolerance.temperature[1]
        ) {
          health -= 0.05 * delta;
          isStressed = true;
        }

        const decorationBonus = Math.min(20, nextDecorations.length * 2);
        const crowdingPenalty = Math.max(0, currentFishList.length - 10) * 5;
        const targetHappiness = 60 + decorationBonus - crowdingPenalty - (isStressed ? 30 : 0);

        if (happiness < targetHappiness) {
          happiness = Math.min(targetHappiness, happiness + 0.05 * delta);
        }
        if (happiness > targetHappiness) {
          happiness = Math.max(targetHappiness, happiness - 0.05 * delta);
        }
        happiness = Math.max(0, Math.min(100, happiness));

        if (!isStressed && health < 100) {
          const healthRegen = 0.02 + (happiness > 80 ? 0.01 : 0);
          health = Math.min(100, health + healthRegen * delta);
        }
        health = Math.max(0, health);

        if (hunger < 50 && size < species.maxSize) {
          size += 0.02 * delta;
        }

        const maxSpeed = species.speed * (isStressed ? 1.5 : 1);

        let hasValidTarget = target !== null;
        let targetX = target?.x ?? 0;
        let targetY = target?.y ?? 0;

        if (hasValidTarget) {
          const distToTarget = getDistance(x, y, targetX, targetY);
          if (distToTarget < 20) {
            hasValidTarget = false;
            target = null;
          }
        }

        const halfFishWidth = size / 2;
        const halfFishHeight = size / 4;
        const swimPaddingX = Math.max(halfFishWidth + 10, 24);
        const swimPaddingY = Math.max(halfFishHeight + 10, 24);
        const minTargetX = swimPaddingX;
        const maxTargetX = Math.max(minTargetX, width - swimPaddingX);
        const minTargetY = swimPaddingY;
        const maxTargetY = Math.max(minTargetY, height - swimPaddingY);

        if (!hasValidTarget) {
          if (hunger > 30) {
            let closestFood: FoodParticle | null = null;
            let minDist = Infinity;
            const foodDetectionRadius = Math.max(180, Math.min(width, height) * 0.45);

            currentFoodList.forEach((food) => {
              if (eatenFoodIds.has(food.id)) return;
              const distance = getDistance(x, y, food.x, food.y);
              if (distance < foodDetectionRadius && distance < minDist) {
                minDist = distance;
                closestFood = food;
              }
            });

            if (closestFood) {
              target = { x: closestFood.x, y: closestFood.y };
              targetX = closestFood.x;
              targetY = closestFood.y;
              hasValidTarget = true;
            }
          }

          if (!hasValidTarget) {
            target = {
              x: minTargetX + Math.random() * (maxTargetX - minTargetX),
              y: minTargetY + Math.random() * (maxTargetY - minTargetY),
            };
            targetX = target.x;
            targetY = target.y;
          }
        }

        if (hunger > 30) {
          currentFoodList.forEach((food) => {
            if (eatenFoodIds.has(food.id)) return;
            const distance = getDistance(x, y, food.x, food.y);
            if (distance < size * 0.8) {
              hunger = Math.max(0, hunger - 40);
              eatenFoodIds.add(food.id);
              newEatingEffects.push({ x: food.x, y: food.y });
              if (target && Math.abs(target.x - food.x) < 1 && Math.abs(target.y - food.y) < 1) {
                target = null;
              }
            }
          });
        }

        const angle = Math.atan2(targetY - y, targetX - x);
        const desiredDx = Math.cos(angle) * maxSpeed;
        const desiredDy = Math.sin(angle) * maxSpeed;
        const turnFactor = 0.05;

        dx += (desiredDx - dx) * turnFactor * delta;
        dy += (desiredDy - dy) * turnFactor * delta;

        const velocity = Math.hypot(dx, dy);
        if (velocity > maxSpeed) {
          const scale = maxSpeed / velocity;
          dx *= scale;
          dy *= scale;
        }

        x += dx * delta;
        y += dy * delta;

        let didBounce = false;
        const minX = halfFishWidth;
        const maxX = Math.max(minX, width - halfFishWidth);
        const minY = halfFishHeight;
        const maxY = Math.max(minY, height - halfFishHeight);

        if (x < minX) {
          x = minX;
          dx = Math.abs(dx) * 0.92;
          target = null;
          didBounce = true;
        }
        if (x > maxX) {
          x = maxX;
          dx = -Math.abs(dx) * 0.92;
          target = null;
          didBounce = true;
        }
        if (y < minY) {
          y = minY;
          dy = Math.abs(dy) * 0.92;
          target = null;
          didBounce = true;
        }
        if (y > maxY) {
          y = maxY;
          dy = -Math.abs(dy) * 0.92;
          target = null;
          didBounce = true;
        }

        x = clamp(x, minX, maxX);
        y = clamp(y, minY, maxY);

        if (didBounce) {
          rotation = Math.atan2(dy, dx);
        }

        if (dx > 0.1) {
          flip = false;
        } else if (dx < -0.1) {
          flip = true;
        }

        const speed = Math.hypot(dx, dy);
        if (speed > 0.1 && !didBounce) {
          const targetRotation = Math.atan2(dy, dx);
          let rotationDiff = targetRotation - rotation;

          while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
          while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

          rotation += rotationDiff * 0.1 * delta;
        }

        if (
          age > 20 &&
          hunger < 20 &&
          health > 95 &&
          happiness > 85 &&
          size >= species.maxSize * 0.85 &&
          currentFishList.length < 40 &&
          Math.random() < REPRODUCTION_CHANCE * delta
        ) {
          const hasPartner = currentFishList.some(
            (candidate) =>
              candidate.id !== fish.id &&
              candidate.speciesId === fish.speciesId &&
              getDistance(x, y, candidate.x, candidate.y) < 50,
          );

          if (hasPartner) {
            const babyDx = Math.random() - 0.5;
            const babyDy = Math.random() - 0.5;

            newBornFish.push({
              id: randomId('fish'),
              speciesId: species.id,
              x,
              y,
              dx: babyDx,
              dy: babyDy,
              size: species.size * 0.4,
              hunger: 50,
              age: 0,
              health: 100,
              target: null,
              flip: babyDx < 0,
              rotation: Math.atan2(babyDy, babyDx),
              isStressed: false,
              happiness: 70,
            });
            hunger = 60;
          }
        }

        return {
          ...fish,
          x,
          y,
          dx,
          dy,
          hunger,
          age,
          size,
          target,
          flip,
          rotation,
          health,
          isStressed,
          happiness,
        };
      })
      .filter((fish) => fish.hunger < 120 && fish.health > 0);

    const updatedFoodList = currentFoodList
      .map((food) => ({ ...food, y: food.y + 0.5 * delta }))
      .filter((food) => food.y < height - 10 && !eatenFoodIds.has(food.id));

    const updatedEatingEffects = currentEatingEffects.filter(
      (effect) => now - effect.createdAt < EATING_EFFECT_DURATION,
    );

    const nextFishList =
      newBornFish.length > 0
        ? [...updatedFishList.filter((fish) => fish.health > 0), ...newBornFish]
        : updatedFishList;

    const nextEatingEffects: EatingEffect[] = [
      ...updatedEatingEffects,
      ...newEatingEffects.map((effect) => ({
        ...effect,
        id: randomId('effect'),
        createdAt: now,
      })),
    ];

    fishListRef.current = nextFishList;
    foodListRef.current = updatedFoodList;
    decorationsRef.current = nextDecorations;
    eatingEffectsRef.current = nextEatingEffects;
    waterQualityRef.current = nextWaterQuality;
    ecosystemRef.current = nextEcosystem;

    setEcosystem(nextEcosystem);
    setWaterQuality(nextWaterQuality);
    setDecorations(nextDecorations);
    setFishList(nextFishList);
    setFoodList(updatedFoodList);
    setEatingEffects(nextEatingEffects);

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [
    setDecorations,
    setEatingEffects,
    setEcosystem,
    setFishList,
    setFoodList,
    setWaterQuality,
  ]);

  useEffect(() => {
    lastTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);
};
