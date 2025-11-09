// App.tsx
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { GameState, ModalType, Language } from './game/types';
import { gameReducer } from './game/reducer';
import { getInitialState } from './game/database';
import Header from './components/Header';
import MainContent from './components/MainContent';
import CountrySelectionModal from './components/CountrySelectionModal';
import { COUNTRIES } from './game/database';
import { t } from './game/translations';

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
                if (parsedState.player.currentResidency) {
                    setActiveModal(null);
                }
            } catch (e) {
                console.error("Failed to parse saved state:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!state.isPaused) {
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
        if (state.majorEvent && activeModal?.type !== 'event-popup') {
            setActiveModal({ type: 'event-popup', event: state.majorEvent });
        }
    }, [state.majorEvent]);

    useEffect(() => {
        document.documentElement.lang = state.language;
        document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
        document.body.style.fontFamily = state.language === 'fa' ? "'Vazirmatn', sans-serif" : "'Lato', sans-serif";
    }, [state.language]);

    const handleCountrySelect = (countryId: string) => {
        dispatch({ type: 'SET_INITIAL_STATE', payload: { countryId } });
        setActiveModal(null);
    };

    return (
        <div className="bg-stone-950 text-stone-200 min-h-screen font-lato flex flex-col">
            <Header gameState={state} dispatch={dispatch} />
            <MainContent
                gameState={state}
                dispatch={dispatch}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
            />

            {activeModal?.type === 'country-selection' && (
                <CountrySelectionModal
                    onSelect={handleCountrySelect}
                    countries={COUNTRIES}
                    language={state.language}
                />
            )}
        </div>
    );
};

export default App;
