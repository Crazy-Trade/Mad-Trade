// components/GameOverModal.tsx
import React from 'react';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';
import { Language } from '../game/types';

interface GameOverModalProps {
    reason: 'prison' | 'execution' | null;
    onRestart: () => void;
    language: Language;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ reason, onRestart, language }) => {
    const title = t('gameOver', language);
    const message = reason === 'execution' ? t('gameOverExecuted', language) : t('gameOverImprisoned', language);
    const icon = reason === 'execution' ? '💀' : '⛓️';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-modal-fade-in">
            <div className="bg-stone-950 border-2 border-rose-700 rounded-lg shadow-xl w-full max-w-lg text-center p-8">
                <div className="text-6xl mb-4">{icon}</div>
                <h2 className="text-3xl font-bold text-rose-500 mb-4">{title}</h2>
                <p className="text-stone-300 mb-8">{message}</p>
                <button
                    onClick={onRestart}
                    className="bg-sky-500 text-white font-bold py-3 px-8 rounded-md hover:bg-sky-600 transition-colors"
                >
                    {t('startNewGame', language)}
                </button>
            </div>
        </div>
    );
};

export default GameOverModal;