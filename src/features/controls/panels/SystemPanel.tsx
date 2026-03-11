import React from 'react';
import { SaveIcon } from '../../../components/icons/SaveIcon';
import { LoadIcon } from '../../../components/icons/LoadIcon';

interface SystemPanelProps {
    onSave: () => void;
    onLoad: () => void;
}

export const SystemPanel: React.FC<SystemPanelProps> = ({ onSave, onLoad }) => {
    return (
        <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Save Data</h3>
            <div className="flex gap-2">
                 <button onClick={onSave} className="flex-1 flex items-center justify-center bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <SaveIcon /> Save
                </button>
                <button onClick={onLoad} className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <LoadIcon /> Load
                </button>
            </div>
        </div>
    );
};
