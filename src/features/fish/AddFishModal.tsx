
import React from 'react';
import { FISH_SPECIES } from '../../constants/index';
import type { FishSpecies, EnvironmentType } from '../../types/index';
import { FishCard } from './FishCard';

interface AddFishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFish: (species: FishSpecies) => void;
  environment: EnvironmentType;
}

export const AddFishModal: React.FC<AddFishModalProps> = ({ isOpen, onClose, onAddFish, environment }) => {
  if (!isOpen) return null;

  const freshwaterSpecies = FISH_SPECIES.filter(s => s.environment === 'freshwater' || s.environment === 'both');
  const saltwaterSpecies = FISH_SPECIES.filter(s => s.environment === 'saltwater' || s.environment === 'both');

  const renderSection = (title: string, speciesList: FishSpecies[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-300 mb-3 pl-1">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {speciesList.map(species => (
          <FishCard
            key={species.id}
            species={species}
            onClick={onAddFish}
            isAvailable={environment === 'freshwater' ? species.environment !== 'saltwater' : species.environment !== 'freshwater'}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-4xl m-4 transform transition-all duration-300 scale-95 animate-modal-enter" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-600/50 pb-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Select a Fish to Add</h2>
            <p className="text-sm text-gray-400">Your current tank is: <span className="font-semibold text-blue-400">{environment.charAt(0).toUpperCase() + environment.slice(1)}</span></p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-3xl bg-gray-700/50 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {renderSection('Freshwater Species', freshwaterSpecies)}
            {renderSection('Saltwater Species', saltwaterSpecies)}
        </div>
      </div>
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
