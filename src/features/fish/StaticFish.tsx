import React from 'react';
import type { FishSpecies } from '../../types';

interface StaticFishProps {
  species: FishSpecies;
}

export const StaticFish: React.FC<StaticFishProps> = ({ species }) => {
  const size = 50; // A fixed size for the preview
  const tailSize = size / 3;

  return (
    <div className="relative w-[50px] h-[25px]">
        {/* Pelvic Fin (Bottom) */}
        <div 
            className={`absolute ${species.color} origin-top-left brightness-90`}
            style={{
                width: `${size * 0.25}px`,
                height: `${size * 0.2}px`,
                left: '35%',
                top: '80%', 
                clipPath: 'polygon(0% 0%, 100% 60%, 40% 100%, 20% 0%)',
                transform: 'skewX(-15deg)',
                zIndex: 5,
            }}
        ></div>

        {/* Tail */}
        <div 
            style={{
              width: `${tailSize}px`, 
              height: `${tailSize}px`, 
              left: `-${tailSize * 0.6}px`, 
              top: `calc(50% - ${tailSize/2}px)`,
            }} 
            className={`absolute ${species.color} opacity-90 fish-tail origin-right z-5`}
        >
        </div>

        {/* Body */}
        <div className={`absolute w-full h-full ${species.color} rounded-full z-10 shadow-sm overflow-hidden`}>
             <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/20"></div>
        </div>

        {/* Pectoral Fin (Side Fin) */}
        <div 
            className={`absolute z-20 ${species.color}`}
            style={{
                width: `${size * 0.3}px`,
                height: `${size * 0.3}px`,
                left: `${size * 0.3}px`, 
                top: '50%',
                transform: 'translateY(-50%) rotate(5deg)',
                opacity: 0.8,
                clipPath: 'polygon(0 20%, 100% 40%, 100% 60%, 0 80%)',
            }}
        >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        {/* Eye */}
        <div 
            className="absolute z-20 bg-white rounded-full flex items-center justify-center shadow-sm"
            style={{
                width: `${size * 0.25}px`,
                height: `${size * 0.25}px`,
                right: `${size * 0.15}px`, 
                top: `${size * 0.1}px`
            }}
        >
            <div className="bg-black rounded-full w-1/2 h-1/2 translate-x-1/4"></div>
        </div>
      <style>{`.fish-tail { clip-path: polygon(0 0, 100% 50%, 0 100%); }`}</style>
    </div>
  );
};
