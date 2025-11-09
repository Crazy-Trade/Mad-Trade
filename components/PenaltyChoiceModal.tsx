// components/PenaltyChoiceModal.tsx
import React from 'react';
import { PenaltyChoiceModalProps } from '../game/types';
import Modal from './Modal';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';
import { formatCurrency } from '../utils';

const PenaltyChoiceModal: React.FC<PenaltyChoiceModalProps> = ({ onClose, penaltyInfo, dispatch, language }) => {
    
    const fineAmount = penaltyInfo.loanAmount * 0.3;

    const handleChooseFine = () => {
        dispatch({ type: 'CHOOSE_PENALTY', payload: { type: 'fine', loanAmount: penaltyInfo.loanAmount } });
        onClose();
    };

    const handleChooseBan = () => {
        dispatch({ type: 'CHOOSE_PENALTY', payload: { type: 'ban', loanAmount: penaltyInfo.loanAmount } });
        onClose();
    };

    return (
        <Modal onClose={onClose} title={t('loanAbuseTitle', language)} lang={language}>
            <div className="text-center space-y-4">
                <p className="text-stone-300">{t('loanAbuseDesc', language)}</p>

                <div className="flex space-x-4 pt-4">
                    <button
                        onClick={handleChooseFine}
                        className="w-full bg-rose-600 text-white font-bold py-3 px-4 rounded-md hover:bg-rose-700 transition-colors flex flex-col items-center justify-center"
                    >
                        <span>{t('penaltyOptionFine', language)}</span>
                        <span className="text-sm font-normal">({formatCurrency(fineAmount)})</span>
                    </button>
                    <button
                        onClick={handleChooseBan}
                        className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-700 transition-colors flex flex-col items-center justify-center"
                    >
                        <span>{t('penaltyOptionBan', language)}</span>
                        <span className="text-sm font-normal">(on State-Owned Assets)</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PenaltyChoiceModal;