// components/ImmigrationModal.tsx
import React, { useState } from 'react';
import { ImmigrationModalProps } from '../game/types';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatCurrency } from '../utils';

const ImmigrationModal: React.FC<ImmigrationModalProps> = ({ onClose, dispatch, residency, netWorth, playerCash, countries, language }) => {
    const [selectedCountryId, setSelectedCountryId] = useState('');
    const selectedCountry = countries.find(c => c.id === selectedCountryId);

    const canAfford = selectedCountry ? playerCash >= selectedCountry.immigrationCost : false;
    const meetsNetWorth = true; // For now

    const handleApply = () => {
        if (!selectedCountry || !canAfford || !meetsNetWorth) return;
        dispatch({ type: 'CHANGE_RESIDENCY', payload: { countryId: selectedCountry.id, cost: selectedCountry.immigrationCost } });
        onClose();
    }

    return (
        <Modal onClose={onClose} title={t('immigration', language)} lang={language}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-lg text-amber-400 mb-2">{t('applyForResidency', language)}</h4>
                    <div className="space-y-3">
                        <select
                            value={selectedCountryId}
                            onChange={e => setSelectedCountryId(e.target.value)}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">Select a country</option>
                            {countries.filter(c => c.id !== residency).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        
                        {selectedCountry && (
                            <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>{t('residencyCost', language)}:</span>
                                    <span className={canAfford ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(selectedCountry.immigrationCost)}</span>
                                </div>
                                {/* <div className="flex justify-between">
                                    <span>{t('minNetWorth', language)}:</span>
                                    <span className={meetsNetWorth ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(0)}</span>
                                </div> */}
                            </div>
                        )}

                         <button
                            onClick={handleApply}
                            disabled={!selectedCountry || !canAfford || !meetsNetWorth}
                            className="w-full py-2 rounded-md font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed disabled:text-stone-400"
                        >
                            {t('apply', language)}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ImmigrationModal;
