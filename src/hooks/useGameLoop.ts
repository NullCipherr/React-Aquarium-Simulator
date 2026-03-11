
import { useCallback, useEffect, useRef } from 'react';
// FIX: Changed import from '../types' to '../types/index' to resolve module ambiguity.
import type { FishInstance, FoodParticle, DecorationInstance, WaterQuality, EcosystemState, EatingEffect } from '../types/index';
// FIX: Changed import from '../constants' to '../constants/index' to resolve module ambiguity.
import { FISH_SPECIES } from '../constants/index';

interface GameLoopProps {
    fishList: FishInstance[];
    setFishList: React.Dispatch<React.SetStateAction<FishInstance[]>>;
    foodList: FoodParticle[];
    setFoodList: React.Dispatch<React.SetStateAction<FoodParticle[]>>;
    decorations: DecorationInstance[];
    setDecorations: React.Dispatch<React.SetStateAction<DecorationInstance[]>>;
    eatingEffects: EatingEffect[];
    setEatingEffects: React.Dispatch<React.SetStateAction<EatingEffect[]>>;
    waterQuality: WaterQuality;
    setWaterQuality: React.Dispatch<React.SetStateAction<WaterQuality>>;
    ecosystem: EcosystemState;
    setEcosystem: React.Dispatch<React.SetStateAction<EcosystemState>>;
    getAquariumDimensions: () => { width: number, height: number };
}

// Vector Helper functions
const getDistance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const useGameLoop = ({
    fishList, setFishList,
    foodList, setFoodList,
    decorations, setDecorations,
    eatingEffects, setEatingEffects,
    waterQuality, setWaterQuality,
    ecosystem, setEcosystem,
    getAquariumDimensions,
}: GameLoopProps) => {
    const animationFrameId = useRef<number | null>(null);
    const lastTime = useRef<number>(Date.now());

    const gameLoop = useCallback(() => {
        const { width, height } = getAquariumDimensions();
        const now = Date.now();
        // Cap delta to prevent huge jumps if tab was inactive
        const rawDelta = (now - lastTime.current) / 16.67;
        const delta = Math.min(rawDelta, 4); 
        lastTime.current = now;
        
        // --- Update Ecosystem ---
        setEcosystem(prev => {
          const GAME_HOUR_DURATION_SECONDS = 15;
          let newTimeOfDay = prev.timeOfDay + (delta / (60 * GAME_HOUR_DURATION_SECONDS));
          if (newTimeOfDay >= 24) newTimeOfDay -= 24;
          
          const isDay = newTimeOfDay >= 6 && newTimeOfDay < 20;
          const lightAvailable = isDay && prev.lightOn;
          let newAlgaeLevel = prev.algaeLevel;
          if (lightAvailable && waterQuality.nitrate > 15) {
            newAlgaeLevel += (waterQuality.nitrate - 15) * 0.0001 * delta;
          } else {
            newAlgaeLevel -= 0.005 * delta;
          }
          newAlgaeLevel = Math.max(0, Math.min(100, newAlgaeLevel));
          
          return { ...prev, timeOfDay: newTimeOfDay, algaeLevel: newAlgaeLevel };
        });
    
        // --- Update Water Quality ---
        setWaterQuality(prev => {
            let { ph, ammonia, nitrite, nitrate, temperature, oxygen, targetTemperature, co2 } = prev;
            const fishBioload = fishList.reduce((load, fish) => load + fish.size / 20, 0);
            const filterCapacity = 0.00015;
            const isDay = ecosystem.timeOfDay >= 6 && ecosystem.timeOfDay < 20;
            const lightAvailable = isDay && ecosystem.lightOn;
    
            if (temperature < targetTemperature) temperature = Math.min(targetTemperature, temperature + 0.005 * delta);
            else if (temperature > targetTemperature) temperature = Math.max(targetTemperature, temperature - 0.005 * delta);
    
            ph -= (ammonia + nitrite) * 0.00005 * delta;
            ph += 0.000002 * delta;
            ammonia += (fishBioload * 0.00001 + foodList.length * 0.000002) * delta;
            const ammoniaConverted = Math.min(ammonia, filterCapacity * delta);
            ammonia -= ammoniaConverted;
            nitrite += ammoniaConverted;
            const nitriteConverted = Math.min(nitrite, filterCapacity * 0.8 * delta);
            nitrite -= nitriteConverted;
            nitrate += nitriteConverted;
    
            oxygen -= fishBioload * 0.0001 * delta;
            co2 += fishBioload * 0.00008 * delta;
            oxygen += 0.0008 * delta;
            co2 -= 0.0005 * delta;
    
            decorations.forEach(deco => {
              if (deco.type === 'plant' && lightAvailable && deco.height > 10) {
                  const plantMass = deco.height / 100;
                  oxygen += plantMass * 0.005 * delta;
                  co2 -= plantMass * 0.005 * delta;
                  nitrate -= plantMass * 0.0001 * delta;
              }
            });
            
            oxygen = Math.max(0, Math.min(100, oxygen));
            co2 = Math.max(0, co2);
            nitrate = Math.max(0, nitrate);
    
            return { ...prev, ph, ammonia, nitrite, nitrate, temperature, oxygen, co2 };
        });
    
        // Update Decorations (Plant Growth)
        setDecorations(prev => prev.map(deco => {
          const isDay = ecosystem.timeOfDay >= 6 && ecosystem.timeOfDay < 20;
          const lightAvailable = isDay && ecosystem.lightOn;
          if(deco.type === 'plant' && lightAvailable && waterQuality.nitrate > 2 && waterQuality.co2 > 5 && deco.height < 250) {
            return { ...deco, height: deco.height + 0.005 * delta };
          }
          return deco;
        }));
        
        // --- Batch update for interactive elements ---
        const eatenFoodIds = new Set<string>();
        const newEatingEffects: { x: number; y: number }[] = [];
        const newBornFish: FishInstance[] = [];
    
        const updatedFishList = fishList.map(fish => {
            const species = FISH_SPECIES.find(s => s.id === fish.speciesId);
            if (!species) return fish;
    
            let { x, y, dx, dy, hunger, age, size, flip, health, happiness, target, rotation } = fish;
            
            // --- Biological Stats Updates ---
            hunger += 0.02 * delta; 
            age += 0.001 * delta;
    
            const tol = species.waterQualityTolerance;
            let isStressed = false;
            if (waterQuality.ammonia > tol.ammoniaMax) { health -= 0.1 * delta; isStressed = true; }
            if (waterQuality.nitrite > tol.nitriteMax) { health -= 0.2 * delta; isStressed = true; }
            if (waterQuality.nitrate > tol.nitrateMax) { health -= 0.05 * delta; isStressed = true; }
            if (waterQuality.ph < tol.ph[0] || waterQuality.ph > tol.ph[1]) { health -= 0.05 * delta; isStressed = true; }
            if (waterQuality.temperature < tol.temperature[0] || waterQuality.temperature > tol.temperature[1]) { health -= 0.05 * delta; isStressed = true; }
            
            // Happiness calc
            const decorationBonus = Math.min(20, decorations.length * 2);
            const crowdingPenalty = Math.max(0, fishList.length - 10) * 5;
            let targetHappiness = 60 + decorationBonus - crowdingPenalty - (isStressed ? 30 : 0);
            
            if(happiness < targetHappiness) happiness = Math.min(targetHappiness, happiness + 0.05 * delta);
            if(happiness > targetHappiness) happiness = Math.max(targetHappiness, happiness - 0.05 * delta);
            happiness = Math.max(0, Math.min(100, happiness));
            
            // Health regen
            if (!isStressed && health < 100) {
                const healthRegen = 0.02 + (happiness > 80 ? 0.01 : 0);
                health = Math.min(100, health + healthRegen * delta);
            }
            health = Math.max(0, health);
            
            // Growth
            if (hunger < 50 && size < species.maxSize) size += 0.02 * delta;
    
            // ----------------------------------------------------
            // MOVEMENT LOGIC
            // ----------------------------------------------------
            
            const maxSpeed = species.speed * (isStressed ? 1.5 : 1.0);
            
            // 1. DECISION MAKING: Where do I want to go?
            
            let hasValidTarget = target !== null;
            let targetX = target ? target.x : 0;
            let targetY = target ? target.y : 0;
            
            if (hasValidTarget) {
                const distToTarget = getDistance(x, y, targetX, targetY);
                if (distToTarget < 20) {
                    hasValidTarget = false; 
                    target = null;
                }
            }

            if (!hasValidTarget) {
                if (hunger > 30) {
                    let closestFood: FoodParticle | null = null;
                    let minDist = Infinity;
                    
                    foodList.forEach(food => {
                        if (eatenFoodIds.has(food.id)) return;
                        const d = getDistance(x, y, food.x, food.y);
                        if (d < 500 && d < minDist) { 
                            minDist = d;
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
                    const padding = 50;
                    target = {
                        x: padding + Math.random() * (width - padding * 2),
                        y: padding + Math.random() * (height - padding * 2)
                    };
                    targetX = target.x;
                    targetY = target.y;
                    hasValidTarget = true;
                }
            }

            // 2. EATING LOGIC
            if (hunger > 30) {
                 foodList.forEach(food => {
                    if (eatenFoodIds.has(food.id)) return;
                    const d = getDistance(x, y, food.x, food.y);
                    if (d < size * 0.8) {
                        hunger = Math.max(0, hunger - 40);
                        eatenFoodIds.add(food.id);
                        newEatingEffects.push({ x: food.x, y: food.y });
                        if (target && Math.abs(target.x - food.x) < 1 && Math.abs(target.y - food.y) < 1) {
                            target = null;
                        }
                    }
                 });
            }

            // 3. PHYSICS CALCULATION
            const angle = Math.atan2(targetY - y, targetX - x);
            
            const desiredDx = Math.cos(angle) * maxSpeed;
            const desiredDy = Math.sin(angle) * maxSpeed;

            const turnFactor = 0.05;
            dx += (desiredDx - dx) * turnFactor * delta;
            dy += (desiredDy - dy) * turnFactor * delta;

            x += dx * delta;
            y += dy * delta;

            // 4. BOUNDARY CHECKS & ROTATION SNAP
            // If hitting a wall, snap rotation immediately to avoid "drifting backwards" during turn
            let didBounce = false;
            if (x < 0) { x = 0; dx *= -1; target = null; didBounce = true; }
            if (x > width) { x = width; dx *= -1; target = null; didBounce = true; }
            if (y < 0) { y = 0; dy *= -1; target = null; didBounce = true; }
            if (y > height) { y = height; dy *= -1; target = null; didBounce = true; }
            
            if (didBounce) {
                // Reset rotation to align with new velocity immediately
                rotation = Math.atan2(dy, dx);
            }

            // 5. ORIENTATION & ROTATION
            // Hysteresis for flipping
            if (dx > 0.1) flip = false; 
            else if (dx < -0.1) flip = true;

            const speed = Math.sqrt(dx * dx + dy * dy);
            
            // Only update rotation target if moving
            if (speed > 0.1 && !didBounce) {
                 // Use absolute world angle. The visual flip logic in Fish.tsx handles the mirroring.
                 const targetRotation = Math.atan2(dy, dx);
                 
                 // Interpolate rotation (shortest path)
                 let rotDiff = targetRotation - rotation;
                 while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                 while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                 
                 rotation += rotDiff * 0.1 * delta;
            }

            // 6. REPRODUCTION
            const REPRODUCTION_CHANCE = 0.0005; 
            if (
                age > 20 && hunger < 20 && health > 95 && happiness > 85 &&
                size >= species.maxSize * 0.85 && fishList.length < 40 &&
                Math.random() < REPRODUCTION_CHANCE * delta
            ) {
                 const hasPartner = fishList.some(f => f.id !== fish.id && f.speciesId === fish.speciesId && getDistance(x, y, f.x, f.y) < 50);
                 if (hasPartner) {
                     const babyDx = (Math.random() - 0.5);
                     const babyDy = (Math.random() - 0.5);
                     newBornFish.push({
                        id: `fish_${Date.now()}_${Math.random()}`,
                        speciesId: species.id,
                        x: x, y: y,
                        dx: babyDx, dy: babyDy,
                        size: species.size * 0.4, 
                        hunger: 50, age: 0, health: 100, target: null, 
                        flip: babyDx < 0, 
                        rotation: Math.atan2(babyDy, babyDx), // Absolute world angle
                        isStressed: false, happiness: 70
                     });
                     hunger = 60;
                 }
            }
            
            return { ...fish, x, y, dx, dy, hunger, age, size, target, flip, rotation, health, isStressed, happiness };
        }).filter(f => f.hunger < 120 && f.health > 0);
    
        const updatedFoodList = foodList
            .map(food => ({ ...food, y: food.y + 0.5 * delta }))
            .filter(food => food.y < height - 10 && !eatenFoodIds.has(food.id));
    
        const EATING_EFFECT_DURATION = 400; 
        const updatedEatingEffects = eatingEffects.filter(e => now - e.createdAt < EATING_EFFECT_DURATION);
    
        if (newBornFish.length > 0) {
            setFishList(prev => [...prev.filter(f => f.health > 0), ...newBornFish]);
        } else {
            setFishList(updatedFishList);
        }

        setFoodList(updatedFoodList);
        setEatingEffects([
            ...updatedEatingEffects,
            ...newEatingEffects.map(e => ({
                ...e,
                id: `effect_${now}_${Math.random()}`,
                createdAt: now,
            }))
        ]);
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }, [
        foodList, getAquariumDimensions, fishList, waterQuality, 
        decorations, ecosystem, eatingEffects, setEcosystem, setWaterQuality,
        setDecorations, setFishList, setFoodList, setEatingEffects
    ]);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return () => {
          if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
      }, [gameLoop]);
};
