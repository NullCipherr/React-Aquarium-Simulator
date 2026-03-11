
import React from 'react';
// FIX: Changed import from '../../types' to '../../types/index' to resolve module ambiguity.
import type { EcosystemState } from '../../types/index';

interface EcosystemPanelProps {
    ecosystem: EcosystemState;
    onToggleLight: () => void;
}

const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const EcosystemPanel: React.FC<EcosystemPanelProps> = ({ ecosystem, onToggleLight }) => {
    const { timeOfDay, lightOn, algaeLevel } = ecosystem;

    return (
        <div className="flex flex-col gap-4">
            
            <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700/50 flex flex-col gap-2">
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Clock & Power</h3>
                 
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-300">Simulated Time</span>
                    <span className="font-mono text-blue-300 text-lg">{formatTime(timeOfDay)}</span>
                </div>

                <div className="flex items-center justify-between text-sm bg-gray-800/50 p-2 rounded">
                    <span className="font-semibold text-gray-300">Tank Lights</span>
                    <label htmlFor="light-toggle" className="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" checked={lightOn} onChange={onToggleLight} id="light-toggle" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
            </div>
            
            <div className="bg-gray-700/20 p-3 rounded-lg border border-gray-700/50">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Cleanliness</h3>
                <div className="flex justify-between mb-1 text-sm">
                    <span className="font-semibold text-gray-300">Algae Buildup</span>
                    <span className={`font-mono ${algaeLevel > 30 ? 'text-red-400' : 'text-green-400'}`}>{algaeLevel.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${algaeLevel > 50 ? 'bg-green-600' : 'bg-green-800'}`} style={{ width: `${algaeLevel}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    High nitrates + Light = Algae. Turn off lights or clean to reduce.
                </p>
            </div>
        </div>
    );
};