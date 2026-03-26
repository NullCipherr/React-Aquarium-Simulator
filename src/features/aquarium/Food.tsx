
import React from 'react';
import type { FoodParticle } from '../../types';

interface FoodProps {
  food: FoodParticle;
}

export const Food: React.FC<FoodProps> = ({ food }) => {
  const foodStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${food.x}px`,
    top: `${food.y}px`,
    transform: 'translate(-50%, -50%)',
    // transition: 'top 0.1s linear', // Removed for smooth JS animation
  };

  return <div style={foodStyle} className="w-2 h-2 bg-yellow-900 rounded-full shadow-inner"></div>;
};
