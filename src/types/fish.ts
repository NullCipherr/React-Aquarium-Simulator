
import type { EnvironmentType } from './environment';

export interface FishSpecies {
  id: string;
  name: string;
  color: string;
  size: number; // base size
  maxSize: number;
  environment: EnvironmentType | 'both';
  speed: number;
  waterQualityTolerance: {
    ph: [number, number];
    temperature: [number, number];
    ammoniaMax: number;
    nitriteMax: number;
    nitrateMax: number;
  };
}

export interface FishInstance {
  id: string;
  speciesId: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  hunger: number;
  age: number;
  health: number;
  target: { x: number; y: number } | null;
  flip: boolean;
  isStressed: boolean;
  happiness: number;
  rotation: number;
}
