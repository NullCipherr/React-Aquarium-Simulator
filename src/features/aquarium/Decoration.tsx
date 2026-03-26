
import React from 'react';
import type { DecorationInstance } from '../../types';

const Rock: React.FC = () => (
    <div className="relative w-full h-full">
        <div className="absolute bottom-0 w-full h-3/4 bg-gray-600 rounded-t-full rounded-b-md shadow-inner"></div>
        <div className="absolute top-0 left-1/4 w-3/4 h-3/4 bg-gray-500 rounded-full shadow-md"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gray-500/50 rounded-full"></div>
    </div>
);

const Plant: React.FC = () => (
    <div className="relative w-full h-full flex justify-center items-end">
        {/* Stem */}
        <div className="w-1.5 sm:w-2 bg-green-800 h-full rounded-t-md"></div>
        {/* Leaves */}
        <div 
            className="absolute w-4 h-12 bg-green-700 rounded-full top-1/4 -left-1 transform -rotate-20 origin-bottom-right" 
            style={{ clipPath: 'ellipse(40% 50% at 50% 50%)' }}
        ></div>
        <div 
            className="absolute w-4 h-12 bg-green-700 rounded-full top-1/2 -right-1 transform rotate-20 origin-bottom-left" 
            style={{ clipPath: 'ellipse(40% 50% at 50% 50%)' }}
        ></div>
        <div 
            className="absolute w-4 h-10 bg-green-600 rounded-full top-1 -left-0.5 transform -rotate-45 origin-bottom-right" 
            style={{ clipPath: 'ellipse(50% 50% at 50% 50%)' }}
        ></div>
    </div>
);

export const Decoration: React.FC<{ decoration: DecorationInstance }> = ({ decoration }) => {
    const depth = decoration.depth || 0;
    
    // Depth calculations:
    // depth 0 = front (larger, normal brightness, higher z-index)
    // depth 1 = back (smaller, darker, lower z-index)
    const scale = 1 - depth * 0.3;
    const brightness = 1 - depth * 0.4;
    // zIndex layer 0-5. Fish are typically at z-10 or higher.
    const zIndex = Math.floor((1 - depth) * 5);

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${decoration.x}px`,
        bottom: `${decoration.y}px`,
        width: `${decoration.width}px`,
        height: `${decoration.height}px`,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'bottom center',
        zIndex: zIndex,
        filter: `brightness(${brightness})`,
        pointerEvents: 'none', // decorations shouldn't block clicks usually
    };

    return (
        <div style={style}>
            {decoration.type === 'plant' && <Plant />}
            {decoration.type === 'rock' && <Rock />}
        </div>
    );
};
