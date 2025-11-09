// App.tsx
import React, { useEffect, useReducer, useRef, useState } from 'react';
// Fix: Correctly import types from the newly defined types file.
import { GameState, ModalType, Language } from './game/types';
// Fix: Add .js extension to satisfy module resolution.
import { gameReducer } from './game/reducer.js';
import { getInitialState } from './game/database';
import Header from './components/Header';
import MainContent from './components/MainContent';
import CountrySelectionModal from './components/CountrySelectionModal';
import { COUNTRIES } from './game/database';
// Fix: Add .js extension to satisfy module resolution.
import { t } from './game/translations.js';
import NewsHeader from './components/NewsHeader';
import GameOverModal from './components/GameOverModal';

const App: React.FC = () => {
    const [state, dispatch] = useReducer(gameReducer, getInitialState());
    const [activeModal, setActiveModal] = useState<ModalType>({ type: 'country-selection' });
    const lastTick = useRef<number>(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const savedState = localStorage.getItem('deepTradingSimulatorState');
        if (savedState) {
            try {
                const parsedState: GameState = JSON.parse(savedState);
                dispatch({ type: 'LOAD_STATE', payload: parsedState });
                if (parsedState.player.name) {
                    setActiveModal(null);
                }
            } catch (e) {
                console.error("Failed to parse saved state:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!state.isPaused && state.player.name && state.player.bankruptcyState !== 'game_over') { 
            localStorage.setItem('deepTradingSimulatorState', JSON.stringify(state));
        }
    }, [state]);

    useEffect(() => {
        const gameLoop = (timestamp: number) => {
            if (lastTick.current) {
                const deltaTime = timestamp - lastTick.current;
                dispatch({ type: 'TICK', payload: { deltaTime } });
            }
            lastTick.current = timestamp;
            animationFrameId.current = requestAnimationFrame(gameLoop);
        };

        if (!state.isPaused) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            lastTick.current = 0;
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [state.isPaused]);
    
    useEffect(() => {
        if (state.date.dayProgress >= 1) {
            dispatch({ type: 'ADVANCE_DAY' });
        }
    }, [state.date.dayProgress]);

    useEffect(() => {
        if (state.majorEvent && activeModal?.type !== 'event-popup' && state.player.bankruptcyState !== 'game_over') {
            setActiveModal({ type: 'event-popup', event: state.majorEvent });
        }
    }, [state.majorEvent]);
    
    useEffect(() => {
        if (state.penaltyRequired && activeModal?.type !== 'penalty-choice' && state.player.bankruptcyState !== 'game_over') {
            setActiveModal({ type: 'penalty-choice', penaltyInfo: state.penaltyRequired });
        }
    }, [state.penaltyRequired]);

    useEffect(() => {
        if (state.player.bankruptcyState === 'game_over' && activeModal?.type !== 'game-over') {
            setActiveModal({ type: 'game-over' });
        }
    }, [state.player.bankruptcyState]);


    useEffect(() => {
        document.documentElement.lang = state.language;
        document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
        document.body.style.fontFamily = state.language === 'fa' ? "'Vazirmatn', sans-serif" : "'Lato', sans-serif";
    }, [state.language]);

    const handleCountrySelect = (countryId: string, playerName: string) => {
        dispatch({ type: 'SET_INITIAL_STATE', payload: { countryId, playerName } });
        setActiveModal(null);
    };

    const handleSave = () => {
        if(state.player.name) {
            localStorage.setItem('deepTradingSimulatorState', JSON.stringify(state));
            alert(t('saveConfirmation', state.language));
        }
    };

    const handleQuit = () => {
        if(window.confirm(t('quitConfirmation', state.language))) {
            localStorage.removeItem('deepTradingSimulatorState');
            window.location.reload();
        }
    };

    const handleDelete = () => {
        if(window.confirm(t('deleteConfirmation', state.language))) {
            localStorage.removeItem('deepTradingSimulatorState');
            window.location.reload();
        }
    };

    return (
        <div className="bg-stone-950 text-stone-200 min-h-screen font-lato flex flex-col">
            <Header 
                gameState={state} 
                dispatch={dispatch}
                onSave={handleSave}
                onQuit={handleQuit}
                onDelete={handleDelete}
            />
            {state.player.name && <NewsHeader majorEvent={state.majorEvent} tickerNews={state.newsTicker} language={state.language} />}
            {state.player.name && <MainContent
                gameState={state}
                dispatch={dispatch}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
            />}

            {activeModal?.type === 'country-selection' && (
                <CountrySelectionModal
                    onSelect={handleCountrySelect}
                    countries={COUNTRIES}
                    language={state.language}
                />
            )}
            
            {activeModal?.type === 'game-over' && (
                <GameOverModal
                    reason={state.player.gameOverReason}
                    onRestart={handleDelete}
                    language={state.language}
                />
            )}
        </div>
    );
};

export default App;