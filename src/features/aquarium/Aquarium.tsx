
import React, { forwardRef, useEffect, useRef, useMemo } from 'react';
// FIX: Changed import from '../../types' to '../../types/index' to resolve module ambiguity.
import type { FishInstance, FoodParticle, EnvironmentType, DecorationInstance, EcosystemState, EatingEffect as EatingEffectType } from '../../types/index';
import { Fish } from '../fish/Fish';
import { Food } from './Food';
import { Decoration } from './Decoration';
import { EatingEffect } from './EatingEffect';

interface AquariumProps {
  fishList: FishInstance[];
  foodList: FoodParticle[];
  decorations: DecorationInstance[];
  eatingEffects: EatingEffectType[];
  environment: EnvironmentType;
  ecosystem: EcosystemState;
  onAddFood: (x: number, y: number) => void;
}

// Helper to interpolate between two colors
const interpolateColor = (color1: number[], color2: number[], factor: number) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return `rgb(${result.join(',')})`;
};

// Advanced Gradient Logic with 4 stages
const getBackgroundColor = (timeOfDay: number, environment: EnvironmentType) => {
    // Palettes [R, G, B]
    const deepNightTop = [5, 10, 30];
    const deepNightBot = [0, 5, 15];

    const sunriseTop = [255, 140, 100]; // Salmon/Orange
    const sunriseBot = [60, 40, 100];   // Deep Purple
    
    // Freshwater: Greenish/Teal Tint
    const dayTopFresh = [60, 180, 180]; 
    const dayBotFresh = [20, 70, 60];   
    
    // Saltwater: Deep Royal/Clear Blue
    const dayTopSalt = [0, 100, 220];   
    const dayBotSalt = [0, 20, 60];     

    const sunsetTop = [255, 100, 80];   // Red/Pink
    const sunsetBot = [45, 20, 60];     // Dark Purple

    // Determine Day Palette based on environment
    const dayTop = environment === 'freshwater' ? dayTopFresh : dayTopSalt;
    const dayBot = environment === 'freshwater' ? dayBotFresh : dayBotSalt;

    let topColor, botColor;
    
    // Time Logic (0-24)
    if (timeOfDay >= 5 && timeOfDay < 8) { 
        // Sunrise (Night -> Sunrise -> Day)
        const progress = (timeOfDay - 5) / 3;
        if (progress < 0.5) {
            // Night to Sunrise
            const factor = progress * 2;
            topColor = interpolateColor(deepNightTop, sunriseTop, factor);
            botColor = interpolateColor(deepNightBot, sunriseBot, factor);
        } else {
            // Sunrise to Day
            const factor = (progress - 0.5) * 2;
            topColor = interpolateColor(sunriseTop, dayTop, factor);
            botColor = interpolateColor(sunriseBot, dayBot, factor);
        }
    } else if (timeOfDay >= 8 && timeOfDay < 17) { 
        // Full Day
        topColor = `rgb(${dayTop.join(',')})`;
        botColor = `rgb(${dayBot.join(',')})`;
    } else if (timeOfDay >= 17 && timeOfDay < 21) { 
        // Sunset (Day -> Sunset -> Night)
        const progress = (timeOfDay - 17) / 4;
        if (progress < 0.5) {
            // Day to Sunset
            const factor = progress * 2;
            topColor = interpolateColor(dayTop, sunsetTop, factor);
            botColor = interpolateColor(dayBot, sunsetBot, factor);
        } else {
            // Sunset to Night
            const factor = (progress - 0.5) * 2;
            topColor = interpolateColor(sunsetTop, deepNightTop, factor);
            botColor = interpolateColor(sunsetBot, deepNightBot, factor);
        }
    } else { 
        // Night
        topColor = `rgb(${deepNightTop.join(',')})`;
        botColor = `rgb(${deepNightBot.join(',')})`;
    }

    return `linear-gradient(to bottom, ${topColor}, ${botColor})`;
};

export const Aquarium = forwardRef<HTMLDivElement, AquariumProps>(({ fishList, foodList, decorations, environment, ecosystem, onAddFood, eatingEffects }, ref) => {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const animationRef = useRef<number | null>(null);

  // Animate Caustics
  useEffect(() => {
    let frame = 0;
    const animate = () => {
        if (turbulenceRef.current) {
            // Slow oscillation of baseFrequency to simulate water movement
            const freqX = 0.01 + Math.sin(frame * 0.005) * 0.002;
            const freqY = 0.02 + Math.cos(frame * 0.003) * 0.002;
            turbulenceRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
        }
        frame++;
        animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref && typeof ref !== 'function' && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onAddFood(x, y);
    }
  };

  const backgroundStyle = {
    background: getBackgroundColor(ecosystem.timeOfDay, environment),
    transition: 'background 1s linear', // Smooth transition for colors
  };

  // Generate Plankton/Dust particles
  const particles = useMemo(() => {
      const count = environment === 'saltwater' ? 60 : 30;
      return Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${15 + Math.random() * 25}s`,
          animationDelay: `-${Math.random() * 20}s`,
          size: environment === 'saltwater' ? Math.random() * 2 + 1 : Math.random() * 4 + 2,
      }));
  }, [environment]);

  // Generate Bubbles (Freshwater only)
  const bubbles = useMemo(() => {
    if (environment !== 'freshwater') return [];
    return Array.from({ length: 15 }).map((_, i) => ({
        id: `bubble_${i}`,
        left: `${10 + Math.random() * 80}%`,
        animationDuration: `${4 + Math.random() * 6}s`,
        animationDelay: `-${Math.random() * 10}s`,
        size: Math.random() * 6 + 2,
    }));
  }, [environment]);

  const isDay = ecosystem.timeOfDay >= 6 && ecosystem.timeOfDay < 20;

  // Environment specific styles
  const causticOpacity = environment === 'saltwater' ? 0.45 : 0.25;
  const particleColor = environment === 'saltwater' ? 'rgba(200, 230, 255, 0.7)' : 'rgba(120, 140, 100, 0.5)';
  const particleShadow = environment === 'saltwater' && isDay ? '0 0 4px rgba(255, 255, 255, 0.8)' : 'none';

  return (
    <div
      ref={ref}
      style={backgroundStyle}
      className={`relative w-full h-full overflow-hidden cursor-crosshair`}
      onClick={handleClick}
    >
      {/* 1. SVG Filter Definition for Caustics */}
      <svg className="absolute w-0 h-0">
        <filter id="caustic-filter">
          <feTurbulence 
            ref={turbulenceRef} 
            type="fractalNoise" 
            baseFrequency="0.01" 
            numOctaves="2" 
            result="noise" 
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
        </filter>
      </svg>

      {/* 2. Caustics Layer (Light refraction) */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay z-0"
        style={{
            background: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.4), transparent 70%)',
            filter: 'url(#caustic-filter)',
            transform: 'scale(1.1)',
            opacity: causticOpacity,
            transition: 'opacity 1s ease'
        }}
      ></div>

      {/* 3. Sunbeams / God Rays */}
      {isDay && ecosystem.lightOn && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-32 h-[150%] bg-gradient-to-b from-white/10 to-transparent transform rotate-12 blur-xl"></div>
            <div className="absolute -top-20 left-1/2 w-48 h-[150%] bg-gradient-to-b from-white/15 to-transparent transform -rotate-12 blur-2xl"></div>
            <div className="absolute -top-20 right-1/3 w-24 h-[150%] bg-gradient-to-b from-white/10 to-transparent transform rotate-6 blur-xl"></div>
        </div>
      )}

      {/* 4. Plankton/Dust Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map(p => (
            <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                    left: p.left,
                    top: p.top,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: particleColor,
                    boxShadow: particleShadow,
                    animation: `float-particle ${p.animationDuration} infinite linear`,
                    animationDelay: p.animationDelay,
                }}
            />
        ))}
      </div>

      {/* 5. Freshwater Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {bubbles.map(b => (
             <div
                key={b.id}
                className="absolute rounded-full border border-white/40 bg-white/10"
                style={{
                    left: b.left,
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    bottom: '-20px',
                    animation: `rise-bubble ${b.animationDuration} infinite ease-in`,
                    animationDelay: b.animationDelay,
                }}
             />
         ))}
      </div>

      {/* 6. Algae Overlay (Dynamic) */}
      <div 
        className="absolute inset-0 bg-green-900/40 pointer-events-none z-20"
        style={{ 
            opacity: ecosystem.algaeLevel / 100, 
            mixBlendMode: 'multiply',
            transition: 'opacity 0.5s'
        }}
      ></div>

      {/* Surface Overlay (Water Tension from below) */}
       <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white/20 to-transparent z-10 opacity-50"></div>


      {/* Decorations */}
      {decorations.map(deco => (
        <Decoration key={deco.id} decoration={deco} />
      ))}
      
      {/* Entities */}
      {foodList.map(food => (
        <Food key={food.id} food={food} />
      ))}
      {fishList.map(fish => (
        <Fish key={fish.id} fish={fish} />
      ))}
      {eatingEffects.map(effect => (
        <EatingEffect key={effect.id} x={effect.x} y={effect.y} />
      ))}

      {/* Styles for Particle Animation */}
      <style>{`
        @keyframes float-particle {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes rise-bubble {
            0% { bottom: -20px; transform: translateX(0); opacity: 0; }
            10% { opacity: 0.6; }
            50% { transform: translateX(10px); }
            100% { bottom: 110%; transform: translateX(-10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
});