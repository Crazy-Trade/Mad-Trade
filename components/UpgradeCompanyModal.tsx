// components/UpgradeCompanyModal.tsx
import React from 'react';
import { UpgradeCompanyModalProps, UpgradeOutcome } from '../game/types';
import Modal from './Modal';
import { formatCurrency } from '../utils';
import { COMPANY_TYPES } from '../game/database';
import { t } from '../game/translations';

const UpgradeCompanyModal: React.FC<UpgradeCompanyModalProps> = ({ onClose, company, dispatch, playerCash, language }) => {
    const companyData = COMPANY_TYPES[company.type];
    const cost = companyData.baseCost * Math.pow(companyData.upgradeCostMultiplier, company.level);
    const newIncome = companyData.baseIncome * Math.pow(companyData.incomeMultiplier, company.level);
    const canAfford = playerCash >= cost;

    const handleConfirm = () => {
        if (!canAfford) return;

        const rand = Math.random();
        let outcome: UpgradeOutcome;
        if (rand < 0.05) {
            outcome = 'complication_cost'; // 5%
        } else if (rand < 0.10) {
            outcome = 'complication_delay'; // 5%
        } else if (rand < 0.20) {
            outcome = 'critical_success'; // 10%
        } else {
            outcome = 'success'; // 80%
        }

        dispatch({ type: 'UPGRADE_COMPANY', payload: { companyId: company.id, cost, outcome } });
        onClose();
    };

    return (
        <Modal onClose={onClose} title={`${t('upgrade', language)} ${company.name}`} lang={language}>
            <div>
                 <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span>{t('currentLevel', language)}:</span><span>{company.level}</span></div>
                    <div className="flex justify-between"><span>{t('nextLevel', language)}:</span><span>{company.level + 1}</span></div>
                    <div className="flex justify-between"><span>{t('newIncome', language)}:</span><span>{formatCurrency(newIncome)} / mo</span></div>
                    <div className="flex justify-between font-bold text-lg"><span className="text-amber-400">{t('upgradeCost', language)}:</span><span className="text-amber-400">{formatCurrency(cost)}</span></div>
                </div>
                <div className="text-xs text-stone-400 mb-4 text-center">
                    <p>10% chance of a critical success!</p>
                    <p>10% chance of a complication!</p>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!canAfford}
                    className="w-full py-3 rounded-md font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors disabled:bg-violet-800 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                    {t('confirm', language)}
                </button>
            </div>
        </Modal>
    );
};

export default UpgradeCompanyModal;
