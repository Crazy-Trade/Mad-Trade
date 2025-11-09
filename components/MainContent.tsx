// components/MainContent.tsx
import React, { useState } from 'react';
import { MainContentProps } from '../game/types';
import MarketsView from './views/MarketsView';
import PortfolioView from './views/PortfolioView';
import CompaniesView from './views/CompaniesView';
import PoliticsView from './views/PoliticsView';
import BankView from './views/BankView';
import LogView from './views/LogView';
import NewsView from './views/NewsView';
import TradeModal from './TradeModal';
import OrderModal from './OrderModal';
import CompanyModal from './CompanyModal';
import UpgradeCompanyModal from './UpgradeCompanyModal';
import PoliticsModal from './PoliticsModal';
import ImmigrationModal from './ImmigrationModal';
import GlobalInfluenceModal from './GlobalInfluenceModal';
import EventModal from './EventModal';
import AnalystModal from './AnalystModal';
import { t } from '../game/translations';
import { COUNTRIES } from '../game/database';
import TimeControls from './TimeControls';

type Tab = 'markets' | 'portfolio' | 'corporate' | 'politics' | 'bank' | 'log' | 'news';

const MainContent: React.FC<MainContentProps> = ({ gameState, dispatch, activeModal, setActiveModal }) => {
    const [activeTab, setActiveTab] = useState<Tab>('markets');
    const { assets, player, language } = gameState;

    const renderActiveView = () => {
        switch (activeTab) {
            case 'markets':
                return <MarketsView assets={assets} residency={player.currentResidency} setActiveModal={setActiveModal} language={language} />;
            case 'portfolio':
                return <PortfolioView gameState={gameState} dispatch={dispatch} language={language} />;
            case 'corporate':
                return <CompaniesView companies={player.companies} playerCash={player.cash} setActiveModal={setActiveModal} language={language} />;
            case 'politics':
                return <PoliticsView gameState={gameState} setActiveModal={setActiveModal} language={language} />;
            case 'bank':
                return <BankView loan={player.loan} netWorth={player.cash} playerCash={player.cash} dispatch={dispatch} setActiveModal={setActiveModal} language={language} />;
            case 'log':
                return <LogView log={player.log} language={language} />;
            case 'news':
                return <NewsView newsArchive={gameState.newsArchive} language={language} />;
            default:
                return null;
        }
    };
    
    const netWorth = player.cash; // Simplified for now
    const totalPoliticalCapital = Object.values(player.politicalCapital).reduce((sum, val) => sum + val, 0);


    const tabs: { id: Tab, label: string }[] = [
        { id: 'markets', label: t('markets', language) },
        { id: 'portfolio', label: t('portfolio', language) },
        { id: 'corporate', label: t('corporate', language) },
        { id: 'politics', label: t('politics', language) },
        { id: 'bank', label: t('bank', language) },
        { id: 'news', label: t('news', language) },
        { id: 'log', label: t('log', language) },
    ];

    return (
        <main className="flex-grow p-6 flex flex-col">
            <div className="flex justify-center mb-6">
                <TimeControls
                    gameSpeed={gameState.gameSpeed}
                    isPaused={gameState.isPaused}
                    dispatch={dispatch}
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
            {activeModal?.type === 'politics' && (
                <PoliticsModal
                    onClose={() => setActiveModal(null)}
                    dispatch={dispatch}
                    residency={player.currentResidency}
                    politicalCapital={player.politicalCapital[player.currentResidency] || 0}
                    playerCash={player.cash}
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
        </main>
    );
};

export default MainContent;
