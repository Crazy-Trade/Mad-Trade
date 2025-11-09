// components/AnalystModal.tsx
import React, { useState } from 'react';
import { AnalystModalProps } from '../game/types';
import Modal from './Modal';
import { formatCurrency } from '../utils';
import { t } from '../game/translations';

const PREDICTION_COST = 70000;
const ANALYSIS_COST = 35000;

const AnalystModal: React.FC<AnalystModalProps> = ({ onClose, analysisType, playerCash, assets, dispatch, language }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string>('');
    const cost = analysisType === 'prediction' ? PREDICTION_COST : ANALYSIS_COST;

    const canAfford = playerCash >= cost;
    const isButtonDisabled = !selectedAssetId || isLoading || !canAfford;

    const handleGenerateReport = async () => {
        if (!selectedAssetId) return;

        setIsLoading(true);
        setReport('');

        const asset = assets[selectedAssetId];
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call latency

            let generatedReport = '';
            if (analysisType === 'prediction') {
                // Simulate a 70% success rate
                const isCorrect = Math.random() < 0.7;
                const actualTrendPositive = asset.trend > 0 || Object.values(asset.dna).reduce((a, b) => a + b, 0) > 0;
                
                let predictedTrend: 'positive' | 'negative';
                if (isCorrect) {
                    predictedTrend = actualTrendPositive ? 'positive' : 'negative';
                } else {
                    predictedTrend = actualTrendPositive ? 'negative' : 'positive';
                }

                generatedReport = t('analystPredictionReport', language, {
                    trend: t(predictedTrend, language),
                    assetName: asset.name,
                });
            } else { // Analysis
                const drivers = Object.entries(asset.dna)
                    .sort(([, a], [, b]) => Math.abs(b!) - Math.abs(a!))
                    .slice(0, 2);
                
                if(drivers.length >= 2) {
                     generatedReport = t('analystTrendReport', language, {
                        assetName: asset.name,
                        driver1_direction: t(drivers[0][1]! > 0 ? 'positive' : 'negative', language),
                        driver1: t(drivers[0][0].toLowerCase() as any, language),
                        driver2_direction: t(drivers[1][1]! > 0 ? 'positive' : 'negative', language),
                        driver2: t(drivers[1][0].toLowerCase() as any, language),
                    });
                } else {
                    generatedReport = `${asset.name} is a highly stable asset with no single dominant market driver.`;
                }
            }
            
            setReport(generatedReport);
            dispatch({ type: 'ANALYST_REPORT_PURCHASED', payload: { cost, message: `Purchased ${analysisType} report for ${asset.name}.` } });

        } catch (error) {
            console.error("Error generating report:", error);
            setReport('An error occurred while generating the report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const title = analysisType === 'prediction' ? t('marketPrediction', language) : t('trendAnalysis', language);

    return (
        <Modal onClose={onClose} title={title} lang={language}>
            <div className="space-y-4">
                <p className="text-sm text-stone-400">
                    {analysisType === 'prediction'
                        ? 'Our analysts will provide a short-term price trend prediction (70% accuracy). The strength and duration of the trend are uncertain.'
                        : 'Receive a detailed breakdown of the top two key global factors influencing a selected asset.'
                    }
                </p>

                <select
                    value={selectedAssetId}
                    onChange={e => setSelectedAssetId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    disabled={isLoading}
                >
                    <option value="">Select an asset...</option>
                    {Object.values(assets).map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                </select>

                {report && (
                    <div className="bg-stone-950 p-4 rounded-md text-sm text-stone-300 italic">
                        <h4 className="font-bold text-amber-400 mb-2">Analyst Report:</h4>
                        <p>{report}</p>
                    </div>
                )}
                
                {isLoading && (
                     <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                        <p className="text-stone-400 mt-2">Generating report...</p>
                    </div>
                )}

                {!report && !isLoading && (
                    <button
                        onClick={handleGenerateReport}
                        disabled={isButtonDisabled}
                        className="w-full py-3 rounded-md font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:bg-violet-800 disabled:cursor-not-allowed disabled:text-stone-400"
                    >
                        {t('confirm', language)} ({formatCurrency(cost)})
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default AnalystModal;