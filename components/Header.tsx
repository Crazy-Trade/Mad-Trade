// components/Header.tsx
import React from 'react';
// Fix: Correctly import types from the newly defined types file.
import { GameState, PortfolioItem, HeaderProps, MarginPosition } from '../game/types';
import { formatCurrency } from '../utils';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';

const Header: React.FC<HeaderProps> = ({ gameState, dispatch, onSave, onQuit, onDelete }) => {
    const { player, date, assets, language } = gameState;

    const portfolioValue = Object.values(player.portfolio).reduce((acc, item: PortfolioItem) => {
        const asset = assets[item.assetId];
        return acc + (asset ? asset.price * item.quantity : 0);
    }, 0);

    const marginEquity = Object.values(player.marginPositions).reduce((acc, pos: MarginPosition) => {
        const asset = assets[pos.assetId];
        if (!asset) return acc;
        const currentValue = asset.price * pos.quantity;
        const entryValue = pos.entryPrice * pos.quantity;
        const pnl = pos.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
        return acc + pos.margin + pnl;
    }, 0);
    
    const companyValue = player.companies.length * 500000; // Simplified
    
    const netWorth = player.cash + portfolioValue + marginEquity + companyValue - player.loan.amount;

    const toggleLanguage = () => {
        dispatch({ type: 'SET_LANGUAGE', payload: language === 'en' ? 'fa' : 'en' });
    };

    return (
        <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-800 p-3 px-6 flex justify-between items-center sticky top-0 z-40">
            <h1 className="text-xl font-bold text-amber-400 truncate">{player.name || 'Deep Trading Simulator'}</h1>
            <div className="flex-grow flex items-center justify-center space-x-6 text-sm">
                <div className="text-center">
                    <div className="text-stone-400 text-xs">{t('cash', language)}</div>
                    <div className="font-semibold text-emerald-400">{formatCurrency(player.cash)}</div>
                </div>
                <div className="text-center">
                    <div className="text-stone-400 text-xs">{t('netWorth', language)}</div>
                    <div className="font-semibold text-sky-400">{formatCurrency(netWorth)}</div>
                </div>
                 <div className="text-center">
                    <div className="text-stone-400 text-xs">{t('date', language)}</div>
                    <div className="font-semibold">{`${date.day}/${date.month}/${date.year}`}</div>
                </div>
            </div>
             <div className="flex items-center space-x-2">
                <button onClick={onSave} className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2 px-3 rounded-md transition-colors text-xs">{t('save', language)}</button>
                <button onClick={onQuit} className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2 px-3 rounded-md transition-colors text-xs">{t('quit', language)}</button>
                <button onClick={onDelete} className="bg-rose-800 hover:bg-rose-700 text-rose-200 font-bold py-2 px-3 rounded-md transition-colors text-xs">{t('deleteSave', language)}</button>
                <button
                    onClick={toggleLanguage}
                    className="bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold py-2 px-3 rounded-md transition-colors text-xs"
                >
                    {t('language', language)}
                </button>
            </div>
        </header>
    );
};

export default Header;