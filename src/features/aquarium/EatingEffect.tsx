import React from 'react';

interface EatingEffectProps {
  x: number;
  y: number;
}

export const EatingEffect: React.FC<EatingEffectProps> = ({ x, y }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: 25,
  };

  return (
    <div style={style} className="pointer-events-none">
      <div className="w-8 h-8 border-2 border-yellow-300 rounded-full animate-eat-effect"></div>
      <style>{`
        @keyframes eat-effect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-eat-effect {
          animation: eat-effect 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
