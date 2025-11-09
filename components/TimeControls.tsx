// components/TimeControls.tsx
import React, { useState } from 'react';
// Fix: Correctly import types from the newly defined types file.
import { GameAction, TimeControlsProps } from '../game/types';
import { PlayIcon, PauseIcon } from './Icons';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';

const TimeControls: React.FC<TimeControlsProps> = ({ isSimulating, daysToSimulate, isPaused, dispatch, date, language }) => {
    
    const handleSkip = (days: number) => {
        dispatch({ type: 'SKIP_DAYS', payload: { days } });
    };

    const handleTogglePause = () => {
        // Prevent unpausing while a long simulation is running
        if (isSimulating) return;
        dispatch({ type: 'SET_PAUSED', payload: !isPaused });
    }

    if (isSimulating) {
        return (
             <div className="flex items-center justify-center space-x-2">
                 <div className="bg-stone-800 rounded-md p-2 text-center">
                    <div className="font-mono text-lg text-amber-400 animate-pulse">
                        {t('simulating', language)} {daysToSimulate > 1 ? `${daysToSimulate} days` : ''}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="bg-stone-800 rounded-md p-2 text-center">
                <div className="font-mono text-lg text-amber-400">
                    {String(date.hour).padStart(2, '0')}:00
                </div>
            </div>

            <div className="flex items-center bg-stone-800 rounded-md">
                <button
                    title={t(isPaused ? 'play' : 'pause', language)}
                    onClick={handleTogglePause}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors"
                >
                    {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
            </div>
             <div className="flex items-center bg-stone-800 rounded-md text-sm font-bold">
                <button
                    title={t('skipDay', language)}
                    onClick={() => handleSkip(1)}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors"
                >
                    {t('skipDay', language)}
                </button>
                 <button
                    title={t('skip1Week', language)}
                    onClick={() => handleSkip(7)}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors border-l border-stone-700"
                >
                    {t('skip1Week', language)}
                </button>
                <button
                    title={t('skip2Weeks', language)}
                    onClick={() => handleSkip(14)}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors border-l border-stone-700"
                >
                    {t('skip2Weeks', language)}
                </button>
            </div>
        </div>
    );
};

export default TimeControls;