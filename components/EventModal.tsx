// components/EventModal.tsx
import React from 'react';
// Fix: Correctly import types from the newly defined types file.
import { EventModalProps } from '../game/types';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';

const EventModal: React.FC<EventModalProps> = ({ onClose, event, language }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 border-2 border-rose-500 rounded-lg shadow-xl w-full max-w-lg animate-modal-fade-in text-center p-8">
                <h2 className="text-2xl font-bold text-rose-500 mb-4">{t('breakingNews', language)}</h2>
                <h3 className="text-xl font-semibold text-amber-400 mb-2">{t(event.titleKey, language, event.params)}</h3>
                <p className="text-stone-300 mb-6">{t(event.descriptionKey, language, event.params)}</p>
                <button
                    onClick={onClose}
                    className="bg-sky-500 text-white font-bold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors"
                >
                    {t('acknowledge', language)}
                </button>
            </div>
        </div>
    );
};

export default EventModal;