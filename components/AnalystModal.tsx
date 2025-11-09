// components/AnalystModal.tsx
import React, { useState } from 'react';
import { AnalystModalProps } from '../game/types';
import Modal from './Modal';
import { formatCurrency } from '../utils';
import { t } from '../game/translations';
import { ASSETS } from '../game/database';

const AnalystModal: React.FC<AnalystModalProps> = ({ onClose, analysisType, playerCash, assets, dispatch, language }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string>(Object.keys(assets)[0]);
    const [result, setResult] = useState<string | null>(null);

    const isPrediction = analysisType === 'prediction';
    const cost = isPrediction ? 100000 : 50000;
    const canAfford = playerCash >= cost;

    const handleConfirm = () => {
        if (!canAfford) return;

        let message = '';
        if (isPrediction) {
            const assetKeys = Object.keys(ASSETS);
            const randomAssetId = assetKeys[Math.floor(Math.random() * assetKeys.length)];
            const asset = ASSETS[randomAssetId];
            const willGoUp = asset.trend >= 0; // Simple trend check
            
            const isCorrect = Math.random() < 0.55;
            const prediction = isCorrect ? (willGoUp ? 'RISE' : 'FALL') : (willGoUp ? 'FALL' : 'RISE');
            
            message = t('analyst_prediction_log', language, { assetName: asset.name, prediction: t(prediction.toLowerCase() as any, language) });
        } else { // Analysis
            const asset = ASSETS[selectedAssetId];
            const drivers = Object.keys(asset.dna).sort((a, b) => Math.abs(asset.dna[b as keyof typeof asset.dna]!) - Math.abs(asset.dna[a as keyof typeof asset.dna]!));
            const topDriver = drivers[0];
            const topDriverImpact = asset.dna[topDriver as keyof typeof asset.dna]! > 0 ? t('positive', language) : t('negative', language);
            message = t('analyst_analysis_log', language, { assetName: asset.name, driver: t(topDriver.toLowerCase() as any, language), impact: topDriverImpact });
        }

        dispatch({ type: 'ANALYST_REPORT_PURCHASED', payload: { cost, message }});
        setResult(message);
    };

    return (
        <Modal onClose={onClose} title={t('analystReport', language)} lang={language}>
            {result ? (
                <div className="space-y-6 text-center">
                    <p className="text-stone-300 leading-relaxed">{result}</p>
                     <button
                        onClick={onClose}
                        className="w-1/2 py-2 rounded-md font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors"
                    >
                        {t('close', language)}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-sm text-stone-400 text-center">
                        {isPrediction 
                            ? 'Our top analyst will provide a short-term prediction on a random market asset. (55% Accuracy)' 
                            : 'Select an asset to receive a detailed analysis of its primary economic drivers.'
                        }
                    </p>

                    {!isPrediction && (
                         <select
                            value={selectedAssetId}
                            onChange={e => setSelectedAssetId(e.target.value)}
                            className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            {Object.values(assets).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                        </select>
                    )}
                    
                    <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-lg">
                            <span className="text-amber-400">{t('cost', language)}:</span>
                            <span className="text-amber-400">{formatCurrency(cost)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!canAfford}
                        className="w-full py-3 rounded-md font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors disabled:bg-violet-800 disabled:cursor-not-allowed disabled:text-stone-400"
                    >
                        {t(isPrediction ? 'getPrediction' : 'getAnalysis', language)}
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default AnalystModal;
