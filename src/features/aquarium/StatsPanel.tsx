import React from 'react';

interface StatsPanelProps {
  stats: {
    fishCount: number;
    averageAge: number;
    averageHunger: number;
  };
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="bg-black bg-opacity-50 p-2 flex justify-around text-sm">
      <div><strong>Fish Count:</strong> {stats.fishCount}</div>
      <div><strong>Avg. Age:</strong> {stats.averageAge.toFixed(2)}</div>
      <div>
        <strong>Avg. Hunger:</strong> 
        <div className="w-24 bg-gray-600 rounded-full h-2.5 inline-block ml-2 align-middle">
            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min(stats.averageHunger, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
};
