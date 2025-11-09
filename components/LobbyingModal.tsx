// components/LobbyingModal.tsx
import React, { useState } from 'react';
import { LobbyingModalProps, AssetCategory } from '../game/types';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatNumber } from '../utils';

const LOBBY_COST_PC = 250;

const industries: AssetCategory[] = ['Tech', 'Commodity', 'Pharma', 'Industrial', 'Consumer'];

const LobbyingModal: React.FC<LobbyingModalProps> = ({ onClose, dispatch, politicalCapital, language }) => {
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | ''>('');

    const canAfford = politicalCapital >= LOBBY_COST_PC;
    const isButtonDisabled = !selectedCategory || !canAfford;

    const handleConfirm = () => {
        if (isButtonDisabled || !selectedCategory) return;
        dispatch({
            type: 'EXECUTE_LOCAL_LOBBY',
            payload: {
                category: selectedCategory,
                costPC: LOBBY_COST_PC,
            }
        });
        onClose();
    };

    return (
        <Modal onClose={onClose} title={t('localLobbying', language)} lang={language}>
            <div className="space-y-4">
                <p className="text-sm text-stone-400">
                    Spend Political Capital to create a favorable environment for a specific industry in your current country of residence. Success is not guaranteed.
                </p>

                 <div className="bg-stone-950 p-3 rounded-md text-center">
                    <div>
                        <div className="text-xs text-stone-400">{t('cost', language)} ({t('pc', language)})</div>
                        <div className={`font-bold text-lg ${canAfford ? 'text-violet-400' : 'text-rose-400'}`}>
                            {formatNumber(LOBBY_COST_PC)}
                        </div>
                    </div>
                </div>

                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as AssetCategory)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                    <option value="">{t('selectAnIndustry', language)}</option>
                    {industries.map(cat => (
                        <option key={cat} value={cat}>{t(cat.toLowerCase() as any, language)}</option>
                    ))}
                </select>

                <button
                    onClick={handleConfirm}
                    disabled={isButtonDisabled}
                    className="w-full py-3 rounded-md font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                    {t('lobby', language)}
                </button>
            </div>
        </Modal>
    );
};

export default LobbyingModal;