// components/PoliticsModal.tsx
import React, { useState } from 'react';
// Fix: Changed COUNTRIES import from types to database
import { PoliticsModalProps } from '../game/types';
import { COUNTRIES } from '../game/database';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatCurrency, formatNumber } from '../utils';


const PoliticsModal: React.FC<PoliticsModalProps> = ({ onClose, dispatch, residency, politicalCapital, playerCash, language }) => {
    const [amount, setAmount] = useState(100000);
    const country = COUNTRIES.find(c => c.id === residency);
    if (!country) return null;
    
    const [selectedParty, setSelectedParty] = useState(country.politicalParties[0].id);

    const handleDonate = () => {
        if (playerCash < amount) return;
        dispatch({ type: 'EXECUTE_POLITICAL_ACTION', payload: { type: 'donate', countryId: residency, party: selectedParty, amount } });
        onClose();
    }

    return (
        <Modal onClose={onClose} title={t('politicalActions', language)} lang={language}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-lg text-amber-400 mb-2">{t('donateToParty', language)}</h4>
                    <p className="text-sm text-stone-400 mb-4">Gain Political Capital by donating to a political party.</p>
                    <div className="space-y-3">
                        <select
                            value={selectedParty}
                            onChange={e => setSelectedParty(e.target.value)}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            {country.politicalParties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                         <button
                            onClick={handleDonate}
                            disabled={playerCash < amount}
                            className="w-full py-2 rounded-md font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed disabled:text-stone-400"
                        >
                            {t('donate', language)} ({formatCurrency(amount)})
                        </button>
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-lg text-amber-400 mb-2">{t('localLobbying', language)}</h4>
                    <p className="text-sm text-stone-400 mb-4">Spend Political Capital to create positive events for local industries.</p>
                    <button
                        disabled={true}
                        className="w-full py-2 rounded-md font-bold text-white bg-stone-700 cursor-not-allowed disabled:text-stone-400"
                    >
                        Lobbying Feature Coming Soon
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PoliticsModal;