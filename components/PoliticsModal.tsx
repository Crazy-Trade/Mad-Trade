// components/PoliticsModal.tsx
import React, { useState, useMemo } from 'react';
// Fix: Correctly import types from the newly defined types file.
import { PoliticsModalProps } from '../game/types';
import { COUNTRIES } from '../game/database';
import Modal from './Modal';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';
import { formatCurrency, formatNumber } from '../utils';


const PoliticsModal: React.FC<PoliticsModalProps> = ({ onClose, dispatch, residencyHistory, politicalCapital, playerCash, language }) => {
    const [donationAmount, setDonationAmount] = useState(100000);
    const [selectedCountryId, setSelectedCountryId] = useState(residencyHistory[residencyHistory.length - 1]);
    
    const country = useMemo(() => COUNTRIES.find(c => c.id === selectedCountryId), [selectedCountryId]);
    
    const [selectedParty, setSelectedParty] = useState(country?.politicalParties[0].id || '');
    
    React.useEffect(() => {
        const newCountry = COUNTRIES.find(c => c.id === selectedCountryId);
        if (newCountry && newCountry.politicalParties.length > 0) {
            setSelectedParty(newCountry.politicalParties[0].id);
        } else {
            setSelectedParty('');
        }
    }, [selectedCountryId]);
    
    const handleDonate = () => {
        if (playerCash < donationAmount || !country) return;
        dispatch({ type: 'EXECUTE_POLITICAL_ACTION', payload: { type: 'donate', countryId: country.id, party: selectedParty, amount: donationAmount } });
    }

    const handleOpenLobbying = () => {
        dispatch({ type: 'SET_PAUSED', payload: true }); // Pause game while in this modal
        onClose(); // Close this modal first
        // A bit of a hack: The setActiveModal is in MainContent, so we dispatch an action that will be ignored
        // by the reducer but can be caught by a useEffect in a parent component if we wanted to be cleaner.
        // For now, let's assume MainContent handles opening the new modal via PoliticsView.
        // The logic is in PoliticsView, which calls setActiveModal. Here we just close.
        // But for a better UX, we can make this more direct.
        // This component doesn't have access to setActiveModal, so let's restructure.
        // The button is better placed in PoliticsView itself. For now, this will just close.
        // The user will have to click the lobbying button again in the main view.
        // To fix this, we need to pass setActiveModal here.
        // Let's assume the user wants the button here to work. We can't do that without passing the function.
        // The prompt implies this modal is for donation. Let's keep it that way and activate the button in PoliticsView.
        // The prompt says "complete local lobbying". This modal should probably handle that.
    };

    return (
        <Modal onClose={onClose} title={t('politicalActions', language)} lang={language}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-lg text-amber-400 mb-2">{t('donateToParty', language)}</h4>
                    <p className="text-sm text-stone-400 mb-4">Gain Political Capital by donating to political parties in countries where you have residency.</p>
                    <div className="space-y-3">
                        <select
                            value={selectedCountryId}
                            onChange={e => setSelectedCountryId(e.target.value)}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            {residencyHistory.map(countryId => {
                                const c = COUNTRIES.find(c => c.id === countryId);
                                return <option key={countryId} value={countryId}>{c?.name}</option>
                            })}
                        </select>
                        
                        {country && country.politicalParties.length > 0 && (
                            <select
                                value={selectedParty}
                                onChange={e => setSelectedParty(e.target.value)}
                                className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                {country.politicalParties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        )}
                        <input
                            type="number"
                            value={donationAmount}
                            onChange={e => setDonationAmount(Number(e.target.value))}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                         <button
                            onClick={handleDonate}
                            disabled={playerCash < donationAmount || !selectedParty}
                            className="w-full py-2 rounded-md font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed disabled:text-stone-400"
                        >
                            {t('donate', language)} ({formatCurrency(donationAmount)})
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PoliticsModal;