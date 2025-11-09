// components/TimeControls.tsx
import React from 'react';
import { GameAction, TimeControlsProps } from '../game/types';
import { PlayIcon, PauseIcon, ForwardIcon, SpeedIcon } from './Icons';
import { t } from '../game/translations';

const TimeControls: React.FC<TimeControlsProps> = ({ gameSpeed, isPaused, dispatch, date, language }) => {
    const speeds = [1, 2, 5, 10, 25, 50, 100];
    const currentSpeedIndex = speeds.indexOf(gameSpeed);
    
    const handleSetSpeed = () => {
        const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        dispatch({ type: 'SET_SPEED', payload: speeds[nextSpeedIndex] });
    };

    const handleSkipDay = () => {
        dispatch({ type: 'SKIP_TO_NEXT_DAY' });
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
                    onClick={() => dispatch({ type: 'SET_PAUSED', payload: !isPaused })}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors"
                >
                    {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button
                    title={t('skipDay', language)}
                    onClick={handleSkipDay}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors border-l border-stone-700"
                >
                    <ForwardIcon />
                </button>
                <button
                    onClick={handleSetSpeed}
                    className="p-2 text-stone-300 hover:text-amber-400 transition-colors border-l border-stone-700 font-mono w-12"
                >
                    x{gameSpeed}
                </button>
            </div>
        </div>
    );
};

export default TimeControls;
