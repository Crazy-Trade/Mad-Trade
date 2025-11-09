// components/CompanyModal.tsx
import React, { useState } from 'react';
// Fix: Correctly import types from the newly defined types file.
import { CompanyModalProps, Company } from '../game/types';
import Modal from './Modal';
import { formatCurrency } from '../utils';
import { COMPANY_TYPES, COUNTRIES } from '../game/database';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';

const CompanyModal: React.FC<CompanyModalProps> = ({ onClose, companyType, dispatch, playerCash, residency, language }) => {
    const [name, setName] = useState('');
    const companyData = COMPANY_TYPES[companyType];
    const countryModifier = COUNTRIES.find(c => c.id === residency)?.companyCostModifier || 1;
    const cost = companyData.baseCost * countryModifier;
    const canAfford = playerCash >= cost;

    const handleConfirm = () => {
        if (name.trim() === '' || !canAfford) return;
        const newCompany: Company = {
            id: crypto.randomUUID(),
            name: name.trim(),
            type: companyType,
            level: 1,
            monthlyIncome: companyData.baseIncome,
            specialAbilityChance: 0.05,
            countryId: residency,
            effects: [],
        };
        dispatch({ type: 'ESTABLISH_COMPANY', payload: newCompany });
        onClose();
    };

    return (
        <Modal onClose={onClose} title={t('establishNewCompany', language)} lang={language}>
            <div>
                <div className="mb-4">
                    <label className="block text-sm font-bold text-stone-400 mb-2">{t('companyName', language)}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Apex Innovations"
                        className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>
                <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span>{t('companyType', language)}:</span><span className="font-semibold">{t(companyType, language)}</span></div>
                    <div className="flex justify-between"><span>{t('monthlyIncome', language)}:</span><span>{formatCurrency(companyData.baseIncome)}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span className="text-amber-400">{t('cost', language)}:</span><span className="text-amber-400">{formatCurrency(cost)}</span></div>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!canAfford || name.trim() === ''}
                    className="w-full py-3 rounded-md font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                    {t('confirm', language)}
                </button>
            </div>
        </Modal>
    );
};

export default CompanyModal;