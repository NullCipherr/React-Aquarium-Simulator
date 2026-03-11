
import React, { useMemo } from 'react';
import { FISH_SPECIES } from '../../constants/index';
import type { FishInstance } from '../../types/index';

interface FishProps {
  fish: FishInstance;
}

const RAD_TO_DEG = 180 / Math.PI;

export const Fish: React.FC<FishProps> = ({ fish }) => {
  const species = FISH_SPECIES.find(s => s.id === fish.speciesId);

  const { containerStyle, tailStyle } = useMemo(() => {
    if (!species) return { containerStyle: {}, tailStyle: {} };

    // Use the smoothed rotation from the game loop
    const rotationDeg = fish.rotation * RAD_TO_DEG;

    // FIX FOR BACKWARDS SWIMMING:
    // If the fish is flipped (facing left via scaleX(-1)), the coordinate system is mirrored.
    // A standard rotation of 'theta' in a mirrored system rotates the opposite visual way relative to the nose.
    // To align the fish nose with the velocity vector when flipped, we must subtract 180 degrees (or add 180).
    // Example: Moving Down-Left (135 deg). Flip=True. 
    // We want visual Down-Left. A Left-facing fish needs to rotate -45 deg to point Down-Left.
    // Formula: 135 - 180 = -45. Correct.
    const finalRotation = fish.flip ? rotationDeg - 180 : rotationDeg;

    // Composition of transforms:
    // 1. Position (translate3d for GPU)
    // 2. Center anchor (translate -50%)
    // 3. Rotate (Tilt up/down adjusted for flip)
    // 4. Flip (scaleX) - Mirroring happens last in the CSS string logic (applied first to the element)
    const transform = `translate3d(${fish.x}px, ${fish.y}px, 0) translate(-50%, -50%) rotate(${finalRotation}deg) scaleX(${fish.flip ? -1 : 1})`;

    const style: React.CSSProperties = {
        transform,
        width: `${fish.size}px`,
        height: `${fish.size / 2}px`,
        filter: `saturate(${fish.health / 100}) brightness(${0.8 + (fish.happiness/500)})`,
        zIndex: 10,
        // No CSS transition on transform to avoid conflict with JS loop
    };

    const tStyle: React.CSSProperties = {
        width: `${fish.size / 3}px`,
        height: `${fish.size / 3}px`,
        left: `-${fish.size / 3 * 0.6}px`,
        top: `calc(50% - ${fish.size / 6}px)`,
        // Constant gentle animation speed based on species base speed
        animation: `tail-wag ${1 / (species.speed || 1)}s infinite linear`, 
        transformOrigin: 'right center',
    };

    return { containerStyle: style, tailStyle: tStyle };
  }, [fish.x, fish.y, fish.size, fish.flip, fish.rotation, fish.health, fish.happiness, species]);

  if (!species) return null;

  return (
    <div style={containerStyle} className="absolute left-0 top-0 pointer-events-none will-change-transform">
        {/* Stress Indicator */}
        {fish.isStressed && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-300 text-lg font-bold animate-pulse z-20">
                !
            </div>
        )}

        {/* Dorsal Fin (Top) */}
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
                animation: 'fin-flutter 1.2s infinite ease-in-out'
            }}
        ></div>

        {/* Pelvic Fin (Bottom) */}
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
        ></div>

        {/* Caudal Fin (Tail) - Now much more natural and flowing */}
        <div style={tailStyle} className="absolute z-30">
          <div
            className={`${species.color} w-full h-full opacity-95`}
            style={{
              clipPath:
                'polygon(' +
                '0% 0%, 80% 15%, 100% 40%, ' +
                '90% 50%, ' +
                '100% 60%, 70% 75%, 0% 100%' +
                ')',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* === BODY === */}
        <div className="absolute inset-0">
          <div
            className={`${species.color} absolute inset-0 shadow-lg`}
            style={{
              clipPath:
                'polygon(' +
                '15% 10%, 45% 5%, 70% 8%, 85% 20%, ' +   // head → back curve
                '95% 50%, ' +                             // tail start
                '85% 80%, 70% 92%, 45% 95%, 15% 90%, ' +   // belly curve
                '5% 70%, 0% 50%, 5% 30%' +                 // snout
                ')',
            }}
          >
            {/* Lateral line */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-black/10"
              style={{
                background: 'linear-gradient(to right, transparent 5%, rgba(0,0,0,0.25) 50%, transparent 95%)',
              }}
            />

            {/* Shiny highlight */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: 'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
              }}
            />

            {/* Scales pattern */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-multiply"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px),
                  repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px)
                `,
                backgroundSize: '10px 10px',
              }}
            />
          </div>
        </div>

        {/* Pectoral Fin (Side Fin) */}
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
                animation: 'fin-flutter 1s infinite ease-in-out'
            }}
        >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        {/* Gill Cover */}
        <div
            className="absolute z-15 bg-black/20 rounded-full"
            style={{
                width: `${fish.size * 0.15}px`,
                height: `${fish.size * 0.3}px`,
                right: `${fish.size * 0.3}px`,
                top: `${fish.size * 0.15}px`,
                transform: 'skewX(-20deg) rotate(10deg)',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 80%)'
            }}
        ></div>

        {/* Eye */}
        <div
            className="absolute z-20 bg-white rounded-full flex items-center justify-center shadow-sm"
            style={{
                width: `${fish.size * 0.2}px`,
                height: `${fish.size * 0.2}px`,
                right: `${fish.size * 0.15}px`,
                top: `${fish.size * 0.12}px`
            }}
        >
            <div className="bg-black rounded-full w-1/2 h-1/2 translate-x-1/4"></div>
            <div className="absolute top-1 right-1 w-1/4 h-1/4 bg-white rounded-full"></div>
        </div>

        {/* Mouth - Subtle and realistic */}
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

        <style>{`
            .fish-tail {
                clip-path: polygon(0 0, 100% 50%, 0 100%);
            }
            @keyframes tail-wag {
                0% { transform: rotate(20deg) scaleY(1); }
                25% { transform: rotate(0deg) scaleY(0.9); }
                50% { transform: rotate(-20deg) scaleY(1); }
                75% { transform: rotate(0deg) scaleY(0.9); }
                100% { transform: rotate(20deg) scaleY(1); }
            }
            @keyframes fin-flutter {
                0% { transform: translateY(-50%) rotate(10deg); }
                50% { transform: translateY(-50%) rotate(-10deg); }
                100% { transform: translateY(-50%) rotate(10deg); }
            }
        `}</style>
    </div>
  );
};
