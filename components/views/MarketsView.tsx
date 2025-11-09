// components/views/MarketsView.tsx
import React, { useState } from 'react';
import { MarketsViewProps, AssetCategory } from '../../game/types';
import { formatCurrency, getFractionDigits } from '../../utils';
import { ArrowUpIcon, ArrowDownIcon } from '../Icons';
import { t } from '../../game/translations';
// Fix: Imported COUNTRIES constant to resolve reference error.
import { COUNTRIES } from '../../game/database';

const MarketsView: React.FC<MarketsViewProps> = ({ assets, residency, setActiveModal, language }) => {
    const [filter, setFilter] = useState<AssetCategory | 'All'>('All');
    
    const categories: (AssetCategory | 'All')[] = ['All', 'Tech', 'Commodity', 'Crypto', 'Pharma', 'Real Estate', 'Global', 'Industrial', 'Consumer'];

    const filteredAssets = Object.values(assets).filter(asset => filter === 'All' || asset.category === filter);

    return (
        <div>
            <div className="mb-4 flex items-center space-x-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${filter === cat ? 'bg-amber-400 text-stone-900' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'}`}>
                        {t(cat.toLowerCase() as any, language) || cat}
                    </button>
                ))}
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-stone-800 text-xs text-stone-400 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('assets', language)}</th>
                            <th scope="col" className="px-6 py-3">{t('price', language)}</th>
                            <th scope="col" className="px-6 py-3">{t('change24h', language)}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('actions', language)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map(asset => {
                            const change = asset.price - asset.basePrice;
                            const changePercent = asset.basePrice > 0 ? (change / asset.basePrice) * 100 : 0;
                            const isLocked = !COUNTRIES.find(c => c.id === residency)?.localMarkets.includes(asset.id) && (asset.category === 'Real Estate' || ['SIE_DE', 'VOW3_DE'].includes(asset.id));

                            return (
                                <tr key={asset.id} className="border-b border-stone-800 hover:bg-stone-800/50">
                                    <th scope="row" className="px-6 py-4 font-bold text-stone-200 whitespace-nowrap">{asset.name}</th>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(asset.price, { maximumFractionDigits: getFractionDigits(asset.price) })}</td>
                                    <td className={`px-6 py-4 font-mono ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className="flex items-center">
                                            {change >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                            {changePercent.toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isLocked ? (
                                            <span className="text-xs text-stone-500 italic">{t('marketLocked', language)}</span>
                                        ) : (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setActiveModal({ type: 'trade', assetId: asset.id })} className="font-semibold text-sky-400 hover:text-sky-300">{t('trade', language)}</button>
                                                <button onClick={() => setActiveModal({ type: 'order', assetId: asset.id })} className="font-semibold text-stone-400 hover:text-stone-300">{t('order', language)}</button>
                                                <button onClick={() => setActiveModal({ type: 'chart', assetId: asset.id })} className="font-semibold text-amber-400 hover:text-amber-300">{t('chart', language)}</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketsView;