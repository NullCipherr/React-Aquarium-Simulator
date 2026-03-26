import React from 'react';
import type { FishSpecies } from '../../types';
import { StaticFish } from './StaticFish';

interface FishCardProps {
  species: FishSpecies;
  onClick: (species: FishSpecies) => void;
  isAvailable: boolean;
}

export const FishCard: React.FC<FishCardProps> = ({ species, onClick, isAvailable }) => {
  return (
    <button
      type="button"
      onClick={() => isAvailable && onClick(species)}
      disabled={!isAvailable}
      aria-disabled={!isAvailable}
      className={`
        bg-gray-700/50 border border-gray-600 rounded-lg p-4 transition-all duration-200 transform
        ${isAvailable 
          ? 'cursor-pointer group hover:bg-gray-700 hover:border-blue-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20'
          : 'opacity-50 grayscale cursor-not-allowed'
        }
      `}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 h-[25px]">
          <StaticFish species={species} />
        </div>
        <h3 className="font-bold text-white text-md mb-1">{species.name}</h3>
        <div className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
          Max Size: {species.maxSize}
        </div>
        {!isAvailable && (
          <div className="text-xs text-yellow-400 mt-2 font-semibold">
            Incompatible
          </div>
        )}
      </div>
    </button>
  );
};
