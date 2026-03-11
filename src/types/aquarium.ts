export interface FoodParticle {
  id: string;
  x: number;
  y: number;
}

export type DecorationType = 'plant' | 'rock';

export interface DecorationInstance {
  id:string;
  type: DecorationType;
  x: number;
  y: number; // position from bottom
  width: number;
  height: number;
  growth?: number; // 0-100, for plants
  depth?: number; // 0 (front) to 1 (back)
}

export interface EatingEffect {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}
