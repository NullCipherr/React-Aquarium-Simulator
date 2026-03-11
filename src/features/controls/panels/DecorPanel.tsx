
import React from 'react';
// FIX: Changed import from '../../../types' to '../../../types/index' to resolve module ambiguity.
import type { EnvironmentType, DecorationType } from '../../../types/index';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);
const WaterDropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a5 5 0 01-.9-9.9L12 3l5.9 3.1A5 5 0 0117 16a5 5 0 01-10 0z" />
    </svg>
);


interface DecorPanelProps {
    currentEnvironment: EnvironmentType;
    onChangeEnvironment: (env: EnvironmentType) => void;
    onAddDecoration: (type: DecorationType) => void;
    onClearDecorations: () => void;
    onCleanAlgae: () => void;
    onWaterChange: () => void;
}

export const DecorPanel: React.FC<DecorPanelProps> = ({ 
    currentEnvironment, 
    onChangeEnvironment, 
    onAddDecoration, 
    onClearDecorations,
    onCleanAlgae,
    onWaterChange
}) => {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Biome</h3>
                <div className="flex rounded-lg bg-gray-700 p-1">
                    <button 
                        onClick={() => onChangeEnvironment('freshwater')}
                        className={`w-1/2 py-2 rounded-md transition-all font-medium text-sm ${currentEnvironment === 'freshwater' ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                        Freshwater
                    </button>
                    <button 
                        onClick={() => onChangeEnvironment('saltwater')}
                        className={`w-1/2 py-2 rounded-md transition-all font-medium text-sm ${currentEnvironment === 'saltwater' ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                        Saltwater
                    </button>
                </div>
            </div>

            <div>
                 <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Decorations</h3>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <button onClick={() => onAddDecoration('plant')} className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm">
                        + Plant
                    </button>
                    <button onClick={() => onAddDecoration('rock')} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm">
                        + Rock
                    </button>
                </div>
                <button onClick={onClearDecorations} className="w-full flex items-center justify-center bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 font-semibold py-2 px-4 rounded-lg transition-colors">
                    <TrashIcon /> Clear All
                </button>
            </div>

             <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Maintenance</h3>
                 <div className="flex flex-col gap-2">
                    <button onClick={onCleanAlgae} className="flex items-center justify-center bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">
                        Scrub Algae
                    </button>
                    <button onClick={onWaterChange} className="flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">
                        <WaterDropIcon /> 50% Water Change
                    </button>
                 </div>
            </div>
        </div>
    );
};