
import type { FishSpecies } from '../types';

const freshwaterTolerance = {
  ph: [6.5, 7.8] as [number, number],
  temperature: [22, 28] as [number, number],
  ammoniaMax: 0.25,
  nitriteMax: 0.5,
  nitrateMax: 50,
};

const saltwaterTolerance = {
  ph: [7.8, 8.4] as [number, number],
  temperature: [24, 29] as [number, number],
  ammoniaMax: 0.1,
  nitriteMax: 0.2,
  nitrateMax: 30,
};


export const FISH_SPECIES: FishSpecies[] = [
  // Original Freshwater
  { id: 'neon_tetra', name: 'Neon Tetra', color: 'bg-blue-400', size: 15, maxSize: 30, environment: 'freshwater', speed: 1, waterQualityTolerance: freshwaterTolerance },
  { id: 'betta', name: 'Betta', color: 'bg-red-500', size: 25, maxSize: 50, environment: 'freshwater', speed: 0.8, waterQualityTolerance: freshwaterTolerance },
  { id: 'guppy', name: 'Guppy', color: 'bg-yellow-400', size: 18, maxSize: 35, environment: 'freshwater', speed: 1.2, waterQualityTolerance: freshwaterTolerance },
  
  // New Freshwater
  { id: 'angelfish', name: 'Angelfish', color: 'bg-slate-300', size: 30, maxSize: 80, environment: 'freshwater', speed: 0.9, waterQualityTolerance: freshwaterTolerance },
  { id: 'discus', name: 'Discus', color: 'bg-amber-400', size: 40, maxSize: 100, environment: 'freshwater', speed: 0.7, waterQualityTolerance: freshwaterTolerance },
  { id: 'pleco', name: 'Plecostomus', color: 'bg-gray-800', size: 50, maxSize: 150, environment: 'freshwater', speed: 0.6, waterQualityTolerance: freshwaterTolerance },
  { id: 'corydoras', name: 'Cory Catfish', color: 'bg-stone-400', size: 20, maxSize: 40, environment: 'freshwater', speed: 1, waterQualityTolerance: freshwaterTolerance },
  { id: 'oscar', name: 'Oscar', color: 'bg-zinc-700', size: 60, maxSize: 200, environment: 'freshwater', speed: 1.2, waterQualityTolerance: freshwaterTolerance },
  { id: 'cardinal_tetra', name: 'Cardinal Tetra', color: 'bg-red-600', size: 15, maxSize: 30, environment: 'freshwater', speed: 1.1, waterQualityTolerance: freshwaterTolerance },
  { id: 'ram_cichlid', name: 'Ram Cichlid', color: 'bg-cyan-300', size: 25, maxSize: 50, environment: 'freshwater', speed: 0.9, waterQualityTolerance: freshwaterTolerance },
  { id: 'platy', name: 'Platy', color: 'bg-red-400', size: 20, maxSize: 40, environment: 'freshwater', speed: 1.2, waterQualityTolerance: freshwaterTolerance },

  // Original Saltwater
  { id: 'clownfish', name: 'Clownfish', color: 'bg-orange-500', size: 30, maxSize: 60, environment: 'saltwater', speed: 1.1, waterQualityTolerance: saltwaterTolerance },
  { id: 'yellow_tang', name: 'Yellow Tang', color: 'bg-yellow-300', size: 35, maxSize: 70, environment: 'saltwater', speed: 1.5, waterQualityTolerance: saltwaterTolerance },
  { id: 'blue_damselfish', name: 'Blue Damselfish', color: 'bg-sky-500', size: 20, maxSize: 40, environment: 'saltwater', speed: 1.3, waterQualityTolerance: saltwaterTolerance },

  // New Saltwater
  { id: 'royal_gramma', name: 'Royal Gramma', color: 'bg-purple-500', size: 25, maxSize: 50, environment: 'saltwater', speed: 1, waterQualityTolerance: saltwaterTolerance },
  { id: 'firefish_goby', name: 'Firefish Goby', color: 'bg-pink-400', size: 20, maxSize: 40, environment: 'saltwater', speed: 1.4, waterQualityTolerance: saltwaterTolerance },
  { id: 'mandarin_goby', name: 'Mandarin Goby', color: 'bg-teal-500', size: 28, maxSize: 55, environment: 'saltwater', speed: 0.8, waterQualityTolerance: saltwaterTolerance },
  { id: 'six_line_wrasse', name: 'Six Line Wrasse', color: 'bg-indigo-600', size: 25, maxSize: 50, environment: 'saltwater', speed: 1.6, waterQualityTolerance: saltwaterTolerance },
  { id: 'foxface_rabbitfish', name: 'Foxface', color: 'bg-yellow-500', size: 40, maxSize: 120, environment: 'saltwater', speed: 1.3, waterQualityTolerance: saltwaterTolerance },
  { id: 'banggai_cardinal', name: 'Banggai Cardinal', color: 'bg-gray-400', size: 25, maxSize: 50, environment: 'saltwater', speed: 0.9, waterQualityTolerance: saltwaterTolerance },
  { id: 'flame_angel', name: 'Flame Angelfish', color: 'bg-red-600', size: 30, maxSize: 70, environment: 'saltwater', speed: 1.2, waterQualityTolerance: saltwaterTolerance },
  { id: 'kole_tang', name: 'Kole Tang', color: 'bg-slate-600', size: 35, maxSize: 90, environment: 'saltwater', speed: 1.5, waterQualityTolerance: saltwaterTolerance },
  { id: 'anthias', name: 'Lyretail Anthias', color: 'bg-rose-400', size: 28, maxSize: 60, environment: 'saltwater', speed: 1.4, waterQualityTolerance: saltwaterTolerance },
];
