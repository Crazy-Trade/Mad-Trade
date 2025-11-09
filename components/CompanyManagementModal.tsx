// components/CompanyManagementModal.tsx
import React from 'react';
import { CompanyManagementModalProps, UpgradeOutcome } from '../game/types';
import Modal from './Modal';
import { formatCurrency } from '../utils';
import { COMPANY_TYPES } from '../game/database';
import { t } from '../game/translations';

const MARKETING_COST = 500000;
const RESEARCH_COST = 2000000;
const LOBBYING_COST = 1000000;

const CompanyManagementModal: React.FC<CompanyManagementModalProps> = ({ onClose, company, dispatch, playerCash, language }) => {
    const companyData = COMPANY_TYPES[company.type];
    const upgradeCost = companyData.baseCost * Math.pow(companyData.upgradeCostMultiplier, company.level);
    const newIncome = companyData.baseIncome * Math.pow(companyData.incomeMultiplier, company.level);

    const handleUpgrade = () => {
        if (playerCash < upgradeCost) return;
        const rand = Math.random();
        let outcome: UpgradeOutcome;
        if (rand < 0.05) outcome = 'complication_cost';
        else if (rand < 0.10) outcome = 'complication_delay';
        else if (rand < 0.20) outcome = 'critical_success';
        else outcome = 'success';
        dispatch({ type: 'UPGRADE_COMPANY', payload: { companyId: company.id, cost: upgradeCost, outcome } });
    };

    const handleAction = (type: 'marketing' | 'research' | 'lobbying', cost: number) => {
        if (playerCash < cost) return;
        dispatch({ type: 'EXECUTE_CORPORATE_ACTION', payload: { companyId: company.id, type, cost } });
    };

    return (
        <Modal onClose={onClose} title={`${t('companyManagement', language)}: ${company.name}`} lang={language}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Stats & Upgrade */}
                <div className="space-y-4">
                    <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between"><span>{t('companyType', language)}:</span><span className="font-semibold">{t(company.type, language)}</span></div>
                        <div className="flex justify-between"><span>{t('currentLevel', language)}:</span><span className="font-semibold">{company.level}</span></div>
                        <div className="flex justify-between"><span>{t('monthlyIncome', language)}:</span><span className="font-mono text-emerald-400">{formatCurrency(company.monthlyIncome)}</span></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-400 mb-2">{t('upgrade', language)} to Level {company.level + 1}</h4>
                        <div className="bg-stone-800 p-3 rounded-md space-y-1 text-xs mb-2">
                             <div className="flex justify-between"><span>{t('newIncome', language)}:</span><span>{formatCurrency(newIncome)} / mo</span></div>
                             <div className="flex justify-between font-bold text-base"><span className="text-amber-400">{t('cost', language)}:</span><span className="text-amber-400">{formatCurrency(upgradeCost)}</span></div>
                        </div>
                        <button
                            onClick={handleUpgrade}
                            disabled={playerCash < upgradeCost}
                            className="w-full py-2 rounded-md font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors disabled:bg-violet-800 disabled:cursor-not-allowed disabled:text-stone-400"
                        >
                            {t('upgrade', language)}
                        </button>
                    </div>
                </div>

                {/* Right side: Strategic Actions */}
                <div className="space-y-4">
                     <h4 className="font-bold text-amber-400">{t('strategicActions', language)}</h4>
                     <div className="space-y-3">
                        {/* Marketing */}
                        <div className="bg-stone-800 p-3 rounded-md">
                            <h5 className="font-bold">{t('marketingCampaign', language)}</h5>
                            <p className="text-xs text-stone-400 mb-2">Launch a campaign to generate positive news.</p>
                            <button onClick={() => handleAction('marketing', MARKETING_COST)} disabled={playerCash < MARKETING_COST} className="w-full text-sm py-1 rounded font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
                                {t('launch', language)} ({formatCurrency(MARKETING_COST)})
                            </button>
                        </div>
                        {/* R&D */}
                         <div className="bg-stone-800 p-3 rounded-md">
                            <h5 className="font-bold">{t('researchAndDevelopment', language)}</h5>
                            <p className="text-xs text-stone-400 mb-2">Fund R&D to boost global tech innovation.</p>
                            <button onClick={() => handleAction('research', RESEARCH_COST)} disabled={playerCash < RESEARCH_COST} className="w-full text-sm py-1 rounded font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
                                {t('invest', language)} ({formatCurrency(RESEARCH_COST)})
                            </button>
                        </div>
                        {/* Lobbying */}
                        <div className="bg-stone-800 p-3 rounded-md">
                            <h5 className="font-bold">{t('governmentLobbying', language)}</h5>
                            <p className="text-xs text-stone-400 mb-2">Attempt to secure a temporary tax break.</p>
                            <button onClick={() => handleAction('lobbying', LOBBYING_COST)} disabled={playerCash < LOBBYING_COST} className="w-full text-sm py-1 rounded font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
                                {t('lobby', language)} ({formatCurrency(LOBBYING_COST)})
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        </Modal>
    );
};

export default CompanyManagementModal;