// components/MainContent.tsx
import React, { useState } from 'react';
// Fix: Correctly import types from the newly defined types file.
// Fix: Import MarginPosition and PortfolioItem types
import { MainContentProps, MarginPosition, PortfolioItem } from '../game/types';
import MarketsView from './views/MarketsView';
import PortfolioView from './views/PortfolioView';
import CompaniesView from './views/CompaniesView';
import PoliticsView from './views/PoliticsView';
// Fix: Add .js extension to satisfy module resolution.
import BankView from './views/BankView.js';
import LogView from './views/LogView';
import NewsView from './views/NewsView';
import TradeModal from './TradeModal';
import OrderModal from './OrderModal';
import ChartModal from './ChartModal';
import CompanyModal from './CompanyModal';
import UpgradeCompanyModal from './UpgradeCompanyModal';
import CompanyManagementModal from './CompanyManagementModal';
import PoliticsModal from './PoliticsModal';
import LobbyingModal from './LobbyingModal';
import ImmigrationModal from './ImmigrationModal';
import GlobalInfluenceModal from './GlobalInfluenceModal';
import EventModal from './EventModal';
import AnalystModal from './AnalystModal';
import PenaltyChoiceModal from './PenaltyChoiceModal';
import GameOverModal from './GameOverModal';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../game/translations.js';
import { COUNTRIES } from '../game/database';
import TimeControls from './TimeControls';

type Tab = 'markets' | 'portfolio' | 'corporate' | 'politics' | 'bank' | 'log' | 'news';

const MainContent: React.FC<MainContentProps> = ({ gameState, dispatch, activeModal, setActiveModal }) => {
    const [activeTab, setActiveTab] = useState<Tab>('markets');
    const { assets, player, language } = gameState;
    const [daysToSimulate, setDaysToSimulate] = useState(0);

    // Fix: Calculate netWorth correctly, not just as player.cash
    const portfolioValue = Object.values(player.portfolio).reduce((acc: number, item: PortfolioItem) => {
        const asset = assets[item.assetId];
        return acc + (asset ? asset.price * item.quantity : 0);
    }, 0);

    const marginEquity = Object.values(player.marginPositions).reduce((acc: number, pos: MarginPosition) => {
        const asset = assets[pos.assetId];
        if (!asset) return acc;
        const currentValue = asset.price * pos.quantity;
        const entryValue = pos.entryPrice * pos.quantity;
        const pnl = pos.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
        return acc + pos.margin + pnl;
    }, 0);
    
    const companyValue = player.companies.length * 500000; // Simplified
    
    const netWorth = player.cash + portfolioValue + marginEquity + companyValue - player.loan.amount;

    const renderActiveView = () => {
        if (player.bankruptcyState === 'game_over') {
            return <div className="text-center text-2xl text-rose-500 font-bold">GAME OVER</div>;
        }
        switch (activeTab) {
            case 'markets':
                return <MarketsView assets={assets} tradeBans={player.tradeBans} date={gameState.date} residency={player.currentResidency} setActiveModal={setActiveModal} language={language} />;
            case 'portfolio':
                return <PortfolioView gameState={gameState} dispatch={dispatch} language={language} />;
            case 'corporate':
                return <CompaniesView companies={player.companies} playerCash={player.cash} setActiveModal={setActiveModal} language={language} />;
            case 'politics':
                return <PoliticsView gameState={gameState} setActiveModal={setActiveModal} language={language} />;
            case 'bank':
                // Fix: Pass correct netWorth and missing props (politicalCapital, portfolio) to BankView
                return <BankView loan={player.loan} ventureLoans={player.ventureLoans} revivalLoan={player.revivalLoan} bankruptcyState={player.bankruptcyState} companies={player.companies} netWorth={netWorth} playerCash={player.cash} date={gameState.date} dispatch={dispatch} setActiveModal={setActiveModal} language={language} politicalCapital={player.politicalCapital} portfolio={player.portfolio} />;
            case 'log':
                return <LogView log={player.log} language={language} />;
            case 'news':
                return <NewsView newsArchive={gameState.newsArchive} language={language} />;
            default:
                return null;
        }
    };
    
    // Fix: Add explicit types to reduce function callback to resolve 'unknown' type errors.
    const totalPoliticalCapital = Object.values(player.politicalCapital).reduce<number>((sum, val) => sum + val, 0);

    const tabs: { id: Tab, label: string }[] = [
        { id: 'markets', label: t('markets', language) },
        { id: 'portfolio', label: t('portfolio', language) },
        { id: 'corporate', label: t('corporate', language) },
        { id: 'politics', label: t('politics', language) },
        { id: 'bank', label: t('bank', language) },
        { id: 'news', label: t('news', language) },
        { id: 'log', label: t('log', language) },
    ];

    // This is a bit of a hack to get the number of days for the UI
    const originalDispatch = dispatch;
    const customDispatch: typeof dispatch = (action) => {
        if(action.type === 'SKIP_DAYS') {
            setDaysToSimulate(action.payload.days);
        }
        originalDispatch(action);
    }
     React.useEffect(() => {
        if (!gameState.isSimulating) {
            setDaysToSimulate(0);
        }
    }, [gameState.isSimulating]);


    return (
        <main className="flex-grow p-6 flex flex-col">
            <div className="flex justify-center mb-6">
                <TimeControls
                    isSimulating={gameState.isSimulating}
                    daysToSimulate={daysToSimulate}
                    isPaused={gameState.isPaused}
                    dispatch={customDispatch}
                    date={gameState.date}
                    language={language}
                />
            </div>

            <div className="border-b border-stone-800 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-amber-400 text-amber-400'
                                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow">
                {renderActiveView()}
            </div>

            {activeModal?.type === 'trade' && assets[activeModal.assetId] && (
                <TradeModal
                    onClose={() => setActiveModal(null)}
                    asset={assets[activeModal.assetId]}
                    portfolioItem={player.portfolio[activeModal.assetId]}
                    playerCash={player.cash}
                    dispatch={dispatch}
                    language={language}
                />
            )}
            {activeModal?.type === 'order' && assets[activeModal.assetId] && (
                 <OrderModal 
                    onClose={() => setActiveModal(null)} 
                    asset={assets[activeModal.assetId]}
                    portfolioItem={player.portfolio[activeModal.assetId]}
                    playerCash={player.cash}
                    dispatch={dispatch}
                    language={language}
                />
            )}
            {activeModal?.type === 'chart' && assets[activeModal.assetId] && (
                <ChartModal
                    onClose={() => setActiveModal(null)}
                    asset={assets[activeModal.assetId]}
                    language={language}
                />
            )}
             {activeModal?.type === 'company' && (
                <CompanyModal 
                    onClose={() => setActiveModal(null)} 
                    companyType={activeModal.companyType} 
                    dispatch={dispatch} 
                    playerCash={player.cash}
                    residency={player.currentResidency}
                    language={language}
                />
            )}
            {activeModal?.type === 'upgrade-company' && (
                <UpgradeCompanyModal
                    onClose={() => setActiveModal(null)}
                    company={activeModal.company}
                    dispatch={dispatch}
                    playerCash={player.cash}
                    language={language}
                />
            )}
             {activeModal?.type === 'company-management' && (
                <CompanyManagementModal
                    onClose={() => setActiveModal(null)}
                    company={activeModal.company}
                    dispatch={dispatch}
                    playerCash={player.cash}
                    language={language}
                />
            )}
            {activeModal?.type === 'politics' && (
                <PoliticsModal
                    onClose={() => setActiveModal(null)}
                    dispatch={dispatch}
                    residencyHistory={player.residencyHistory}
                    politicalCapital={player.politicalCapital}
                    playerCash={player.cash}
                    language={language}
                />
            )}
            {activeModal?.type === 'lobbying' && (
                <LobbyingModal
                    onClose={() => setActiveModal(null)}
                    dispatch={dispatch}
                    politicalCapital={player.politicalCapital[player.currentResidency] || 0}
                    language={language}
                />
            )}
             {activeModal?.type === 'immigration' && (
                <ImmigrationModal
                    onClose={() => setActiveModal(null)}
                    dispatch={dispatch}
                    residency={player.currentResidency}
                    netWorth={netWorth}
                    playerCash={player.cash}
                    countries={COUNTRIES}
                    language={language}
                />
            )}
            {activeModal?.type === 'global-influence' && (
                <GlobalInfluenceModal
                    onClose={() => setActiveModal(null)}
                    dispatch={dispatch}
                    politicalCapital={totalPoliticalCapital}
                    playerCash={player.cash}
                    language={language}
                />
            )}
            {activeModal?.type === 'analyst' && (
                <AnalystModal
                    onClose={() => setActiveModal(null)}
                    analysisType={activeModal.analysisType}
                    playerCash={player.cash}
                    assets={assets}
                    dispatch={dispatch}
                    language={language}
                />
            )}
            {activeModal?.type === 'event-popup' && (
                <EventModal event={activeModal.event} onClose={() => {
                    dispatch({ type: 'DISMISS_MAJOR_EVENT' });
                    setActiveModal(null);
                }} language={language} />
            )}
             {activeModal?.type === 'penalty-choice' && (
                <PenaltyChoiceModal
                    onClose={() => setActiveModal(null)}
                    penaltyInfo={activeModal.penaltyInfo}
                    dispatch={dispatch}
                    language={language}
                />
            )}
        </main>
    );
};

export default MainContent;