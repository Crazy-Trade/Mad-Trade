// components/GlobalInfluenceModal.tsx
import React from 'react';
import { GlobalInfluenceModalProps, GlobalFactor } from '../game/types';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatCurrency, formatNumber } from '../utils';

const INFLUENCE_COST_PC = 500;
const INFLUENCE_COST_CASH = 5000000;

const influenceableFactors: GlobalFactor[] = [
    'globalStability',
    'techInnovation',
    'middleEastTension',
    'oilSupply',
    'secRegulation',
    'publicSentiment',
];

const GlobalInfluenceModal: React.FC<GlobalInfluenceModalProps> = ({ onClose, dispatch, politicalCapital, playerCash, language }) => {

    const canAfford = politicalCapital >= INFLUENCE_COST_PC && playerCash >= INFLUENCE_COST_CASH;

    const handleAction = (factor: GlobalFactor, direction: 'promote' | 'disrupt') => {
        if (!canAfford) return;
        dispatch({
            type: 'EXECUTE_GLOBAL_INFLUENCE',
            payload: {
                factor,
                direction,
                costPC: INFLUENCE_COST_PC,
                costCash: INFLUENCE_COST_CASH,
            }
        });
        onClose();
    };

    return (
        <Modal onClose={onClose} title={t('globalInfluence', language)} lang={language}>
            <div className="space-y-4">
                <p className="text-sm text-stone-400 text-center mb-4">
                    Use your international political capital to influence global trends. These are costly and risky operations.
                    <br />(70% Success, 20% Failure, 10% Backfire)
                </p>

                <div className="bg-stone-950 p-3 rounded-md flex justify-around text-center">
                    <div>
                        <div className="text-xs text-stone-400">{t('cost', language)} ({t('pc', language)})</div>
                        <div className={`font-bold ${politicalCapital >= INFLUENCE_COST_PC ? 'text-violet-400' : 'text-rose-400'}`}>{formatNumber(INFLUENCE_COST_PC)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-stone-400">{t('cost', language)} ({t('cash', language)})</div>
                        <div className={`font-bold ${playerCash >= INFLUENCE_COST_CASH ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(INFLUENCE_COST_CASH)}</div>
                    </div>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {influenceableFactors.map(factor => (
                        <div key={factor} className="bg-stone-800 p-3 rounded-md flex items-center justify-between">
                            <span className="font-bold">{t(factor.toLowerCase() as any, language)}</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAction(factor, 'promote')}
                                    disabled={!canAfford}
                                    className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed"
                                >
                                    {t('promote', language)}
                                </button>
                                <button
                                    onClick={() => handleAction(factor, 'disrupt')}
                                    disabled={!canAfford}
                                    className="px-3 py-1 text-xs font-bold rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed"
                                >
                                    {t('disrupt', language)}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default GlobalInfluenceModal;
