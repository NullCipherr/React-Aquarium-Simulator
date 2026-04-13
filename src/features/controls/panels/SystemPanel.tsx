import React from 'react';
import { SaveIcon } from '../../../components/icons/SaveIcon';
import { LoadIcon } from '../../../components/icons/LoadIcon';

type WorldTemplateId = 'reproduction_lab' | 'rival_warzone';

interface SystemPanelProps {
    onSave: () => void;
    onLoad: () => void;
    onApplyTemplate: (templateId: WorldTemplateId) => void;
}

export const SystemPanel: React.FC<SystemPanelProps> = ({ onSave, onLoad, onApplyTemplate }) => {
    return (
        <div className="flex flex-col gap-4 border-t border-gray-700 pt-4">
            <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">Templates de teste</h3>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => onApplyTemplate('reproduction_lab')}
                        className="w-full rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-fuchsia-600"
                    >
                        Laboratório de Reprodução
                    </button>
                    <button
                        type="button"
                        onClick={() => onApplyTemplate('rival_warzone')}
                        className="w-full rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-600"
                    >
                        Zona de Guerra (Rivais)
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Save Data</h3>
                <div className="flex gap-2">
                    <button type="button" onClick={onSave} className="flex-1 flex items-center justify-center bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <SaveIcon /> Save
                    </button>
                    <button type="button" onClick={onLoad} className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <LoadIcon /> Load
                    </button>
                </div>
            </section>
        </div>
    );
};
