// components/CountrySelectionModal.tsx
import React from 'react';
import { CountrySelectionModalProps } from '../game/types';
import { formatPercent } from '../utils';
import { t } from '../game/translations';

const CountrySelectionModal: React.FC<CountrySelectionModalProps> = ({ onSelect, countries, language }) => {
    return (
        <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl text-center">
                <h1 className="text-3xl font-bold text-amber-400 mb-8">{t('selectCountry', language)}</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {countries.map(country => (
                        <div key={country.id} className="bg-stone-900 border border-stone-800 rounded-lg p-4 hover:bg-stone-800 hover:border-amber-400 transition-all duration-200 cursor-pointer" onClick={() => onSelect(country.id)}>
                            <h2 className="text-xl font-bold mb-3">{country.name}</h2>
                            <div className="text-left text-sm space-y-2">
                                <div>
                                    <span className="text-stone-400">{t('taxRate', language)}: </span>
                                    <span className="font-semibold text-rose-400">{formatPercent(country.taxRate)}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400">{t('companyCost', language)}: </span>
                                    <span className="font-semibold text-sky-400">{country.companyCostModifier}x</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CountrySelectionModal;
