// components/Header.tsx
import React from 'react';
import { GameState, GameAction, PortfolioItem } from '../game/types';
import { formatCurrency } from '../utils';
import { t } from '../game/translations';

interface HeaderProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const Header: React.FC<HeaderProps> = ({ gameState, dispatch }) => {
    const { player, date, assets, language } = gameState;

    const portfolioValue = Object.values(player.portfolio as Record<string, PortfolioItem>).reduce((acc, item) => {
        const asset = assets[item.assetId];
        return acc + (asset ? asset.price * item.quantity : 0);
    }, 0);

    const marginEquity = Object.values(player.marginPositions).reduce((acc, pos) => {
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
            <h1 className="text-xl font-bold text-amber-400">Deep Trading Simulator</h1>
            <div className="flex items-center space-x-6 text-sm">
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
