import React, { memo, useMemo } from 'react';
import { FISH_SPECIES } from '../../constants';
import type { FishInstance } from '../../types';

interface FishProps {
  fish: FishInstance;
}

const RAD_TO_DEG = 180 / Math.PI;
const speciesById = new Map(FISH_SPECIES.map((species) => [species.id, species]));

const FishComponent: React.FC<FishProps> = ({ fish }) => {
  const species = speciesById.get(fish.speciesId);

  const { containerStyle, tailStyle } = useMemo(() => {
    if (!species) return { containerStyle: {}, tailStyle: {} };

    const rotationDeg = fish.rotation * RAD_TO_DEG;
    const finalRotation = fish.flip ? rotationDeg - 180 : rotationDeg;

    const transform = `translate3d(${fish.x}px, ${fish.y}px, 0) translate(-50%, -50%) rotate(${finalRotation}deg) scaleX(${fish.flip ? -1 : 1})`;

    const style: React.CSSProperties = {
      transform,
      width: `${fish.size}px`,
      height: `${fish.size / 2}px`,
      filter: `saturate(${fish.health / 100}) brightness(${0.8 + fish.happiness / 500})`,
      zIndex: 10,
    };

    const nextTailStyle: React.CSSProperties = {
      width: `${fish.size / 3}px`,
      height: `${fish.size / 3}px`,
      left: `-${(fish.size / 3) * 0.6}px`,
      top: `calc(50% - ${fish.size / 6}px)`,
      animation: `tail-wag ${1 / (species.speed || 1)}s infinite linear`,
      transformOrigin: 'right center',
    };

    return { containerStyle: style, tailStyle: nextTailStyle };
  }, [fish.flip, fish.happiness, fish.health, fish.rotation, fish.size, fish.x, fish.y, species]);

  if (!species) return null;

  return (
    <div style={containerStyle} className="absolute left-0 top-0 pointer-events-none will-change-transform">
      {fish.isStressed && (
        <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2 animate-pulse text-lg font-bold text-yellow-300">
          !
        </div>
      )}

      <div
        className={`absolute ${species.color} origin-bottom-left brightness-90`}
        style={{
          width: `${fish.size * 0.3}px`,
          height: `${fish.size * 0.25}px`,
          left: '30%',
          top: '-10%',
          clipPath: 'polygon(0% 100%, 100% 100%, 80% 0%, 20% 0%)',
          transform: 'skewX(15deg)',
          zIndex: 5,
          animation: 'fin-flutter 1.2s infinite ease-in-out',
        }}
      />

      <div
        className={`absolute ${species.color} origin-top-left brightness-90`}
        style={{
          width: `${fish.size * 0.25}px`,
          height: `${fish.size * 0.2}px`,
          left: '35%',
          top: '80%',
          clipPath: 'polygon(0% 0%, 100% 60%, 40% 100%, 20% 0%)',
          transform: 'skewX(-15deg)',
          zIndex: 5,
        }}
      />

      <div style={tailStyle} className="absolute z-30">
        <div
          className={`${species.color} fish-tail-shape h-full w-full opacity-95`}
          style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      <div className="absolute inset-0">
        <div
          className={`${species.color} absolute inset-0 shadow-lg`}
          style={{
            clipPath:
              'polygon(' +
              '15% 10%, 45% 5%, 70% 8%, 85% 20%, ' +
              '95% 50%, ' +
              '85% 80%, 70% 92%, 45% 95%, 15% 90%, ' +
              '5% 70%, 0% 50%, 5% 30%' +
              ')',
          }}
        >
          <div
            className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-black/10"
            style={{
              background:
                'linear-gradient(to right, transparent 5%, rgba(0,0,0,0.25) 50%, transparent 95%)',
            }}
          />

          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
            }}
          />

          <div
            className="absolute inset-0 mix-blend-multiply opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px)',
              backgroundSize: '10px 10px',
            }}
          />
        </div>
      </div>

      <div
        className={`absolute z-20 ${species.color}`}
        style={{
          width: `${fish.size * 0.3}px`,
          height: `${fish.size * 0.3}px`,
          left: `${fish.size * 0.2}px`,
          top: '50%',
          transformOrigin: 'right center',
          opacity: 1,
          clipPath: 'polygon(0 20%, 100% 40%, 100% 60%, 0 80%)',
          animation: 'fin-flutter 1s infinite ease-in-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      <div
        className="absolute z-[15] rounded-full bg-black/20"
        style={{
          width: `${fish.size * 0.15}px`,
          height: `${fish.size * 0.3}px`,
          right: `${fish.size * 0.3}px`,
          top: `${fish.size * 0.15}px`,
          transform: 'skewX(-20deg) rotate(10deg)',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 80%)',
        }}
      />

      <div
        className="absolute z-20 flex items-center justify-center rounded-full bg-white shadow-sm"
        style={{
          width: `${fish.size * 0.2}px`,
          height: `${fish.size * 0.2}px`,
          right: `${fish.size * 0.15}px`,
          top: `${fish.size * 0.12}px`,
        }}
      >
        <div className="h-1/2 w-1/2 translate-x-1/4 rounded-full bg-black" />
        <div className="absolute right-1 top-1 h-1/4 w-1/4 rounded-full bg-white" />
      </div>

      <div
        className="absolute z-20"
        style={{
          width: `${fish.size * 0.12}px`,
          height: `${fish.size * 0.08}px`,
          right: `${fish.size * 0.2}px`,
          top: `${fish.size * 0.38}px`,
          border: `${Math.max(1.5, fish.size * 0.025)}px solid rgba(0,0,0,0.6)`,
          borderTop: 'none',
          borderRadius: '0 0 100% 100%',
        }}
      />
    </div>
  );
};

export const Fish = memo(FishComponent);
