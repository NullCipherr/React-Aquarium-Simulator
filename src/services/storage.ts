
// FIX: Changed import from '../types' to '../types/index' to resolve module ambiguity.
import type { FishInstance, FoodParticle, DecorationInstance, WaterQuality, EcosystemState, EnvironmentType } from '../types/index';

interface AppState {
    fishList: FishInstance[];
    foodList: FoodParticle[];
    environment: EnvironmentType;
    decorations: DecorationInstance[];
    waterQuality: WaterQuality;
    ecosystem: EcosystemState;
}

export const saveState = (state: AppState) => {
    try {
        const stateString = JSON.stringify(state);
        localStorage.setItem('aquariumState', stateString);
        alert('Aquarium saved!');
    } catch (error) {
        console.error("Failed to save state:", error);
        alert('Failed to save aquarium.');
    }
};

export const loadState = (): AppState | null => {
    try {
        const savedState = localStorage.getItem('aquariumState');
        if (savedState === null) {
            alert('No saved aquarium found.');
            return null;
        }
        return JSON.parse(savedState);
    } catch (error) {
        console.error("Failed to load state:", error);
        alert('Failed to load aquarium. Data might be corrupted.');
        return null;
    }
};