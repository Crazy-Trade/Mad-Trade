// components/views/PoliticsView.tsx
import React from 'react';
// Fix: Changed COUNTRIES import from types to database
import { PoliticsViewProps } from '../../game/types';
import { COUNTRIES } from '../../game/database';
import { t } from '../../game/translations';
import { formatNumber } from '../../utils';

const PoliticsView: React.FC<PoliticsViewProps> = ({ gameState, setActiveModal, language }) => {
    const { player } = gameState;
    const country = COUNTRIES.find(c => c.id === player.currentResidency);
    if (!country) return <div>Error: Country not found</div>;
    
    const currentPoliticalCapital = player.politicalCapital[country.id] || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* National Politics */}
            <div className="md:col-span-2 bg-stone-900 border border-stone-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('nationalPolitics', language)}</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-stone-400">{t('currentResidency', language)}:</span>
                        <span className="font-bold text-lg">{country.name}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-stone-400">{t('politicalCapital', language)}:</span>
                        <span className="font-bold text-lg text-violet-400">{formatNumber(currentPoliticalCapital)}</span>
                    </div>
                    <div>
                        <h3 className="text-stone-400 mb-2">{t('majorParties', language)}:</h3>
                        <div className="flex space-x-4">
                            {country.politicalParties.map(party => (
                                <span key={party.id} className="bg-stone-800 text-stone-300 px-3 py-1 rounded-full text-sm">{party.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
                 <h2 className="text-xl font-bold text-amber-400 mb-4">{t('politicalActions', language)}</h2>
                 <div className="space-y-3">
                     <button
                        onClick={() => setActiveModal({ type: 'politics' })}
                        className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                     >
                         {t('donateToParty', language)} / {t('localLobbying', language)}
                    </button>
                    <button
                        disabled={true}
                        className="w-full bg-stone-700 text-stone-400 font-bold py-2 px-4 rounded-md cursor-not-allowed"
                     >
                         {t('globalOperations', language)} (Soon)
                    </button>
                    <button
                        onClick={() => setActiveModal({ type: 'immigration' })}
                        className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                     >
                         {t('changeResidency', language)}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default PoliticsView;