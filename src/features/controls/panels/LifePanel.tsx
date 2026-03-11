import React from 'react';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

interface LifePanelProps {
    onAddFish: () => void;
    onFeed: () => void;
}

export const LifePanel: React.FC<LifePanelProps> = ({ onAddFish, onFeed }) => {
    return (
        <div className="flex flex-col gap-4">
            <button onClick={onAddFish} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30">
                <PlusIcon /> Add Fish
            </button>
            <button onClick={onFeed} className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-yellow-500/30">
                Feed All
            </button>
            <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
                <p>Tip: Fish grow when fed properly. Overfeeding can spike ammonia levels!</p>
            </div>
        </div>
    );
};
