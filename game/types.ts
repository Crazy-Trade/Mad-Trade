// game/types.ts
import React from 'react';

// Base Types
export type Language = 'en' | 'fa';
export interface GameDate { year: number; month: number; day: number; hour: number; dayProgress: number; }

// Global Factors
export type GlobalFactor = 'globalStability' | 'usEconomy' | 'chinaEconomy' | 'euEconomy' | 'japanEconomy' | 'indiaEconomy' | 'russiaEconomy' | 'middleEastTension' | 'asiaTensions' | 'techInnovation' | 'globalSupplyChain' | 'oilSupply' | 'usFedPolicy' | 'secRegulation' | 'usJobGrowth' | 'publicSentiment' | 'climateChangeImpact' | 'pharmaDemand' | 'inflation';
export type GlobalFactors = Record<GlobalFactor, number>;

// Assets & Markets
export type AssetCategory = 'Tech' | 'Commodity' | 'Crypto' | 'Pharma' | 'Real Estate' | 'Global' | 'Industrial' | 'Consumer' | 'Finance';
export interface PriceHistory { date: Pick<GameDate, 'year' | 'month' | 'day'>; open: number; high: number; low: number; close: number; }
export type Candle = PriceHistory;
export interface Asset { id: string; name: string; category: AssetCategory; price: number; basePrice: number; volatility: number; trend: number; dna: Partial<Record<GlobalFactor, number>>; priceHistory: PriceHistory[]; dayOpen: number; dayHigh: number; dayLow: number; isStateOwned?: boolean; isScam?: boolean; }
export interface PendingOrder { id: string; assetId: string; type: 'buy-limit' | 'sell-limit'; quantity: number; limitPrice: number; }

// Player & Portfolio
export interface PortfolioItem { assetId: string; quantity: number; costBasis: number; }
export interface MarginPosition { id: string; assetId: string; quantity: number; entryPrice: number; leverage: number; type: 'long' | 'short'; margin: number; stopLoss?: number; takeProfit?: number; }
export interface TradeBan { assetIds: string[]; expiryDate: GameDate; }
export interface RevivalLoan { principal: number; interestRate: number; paymentsRemaining: number; monthlyPayment: number; }
export interface VentureLoan { id: string; principal: number; interestRate: number; companyId: string | null; deadlineDate: GameDate; profitShareRepaid: number; }

// Companies
export type CompanyType = 'tech' | 'mining' | 'pharma' | 'media' | 'finance' | 'real_estate';
export type CompanyEffectType = 'income_halt' | 'tax_break';
export interface CompanyEffect { type: CompanyEffectType; durationMonths: number; }
export interface Company { id: string; name: string; type: CompanyType; level: number; monthlyIncome: number; specialAbilityChance: number; countryId: string; effects: CompanyEffect[]; }
export interface CompanyData { baseCost: number; baseIncome: number; upgradeCostMultiplier: number; incomeMultiplier: number; }
export type UpgradeOutcome = 'success' | 'critical_success' | 'complication_cost' | 'complication_delay';
export type CorporateAction = 'marketing' | 'research' | 'lobbying';

// Politics & Country
export interface PoliticalParty { id: string; name: string; }
export interface ElectionCycle { year: number; month: number; interval: number; }
export interface Country { id: string; name: string; taxRate: number; companyCostModifier: number; localMarkets: string[]; immigrationCost: number; politicalParties: PoliticalParty[]; electionCycle?: ElectionCycle; isAuthoritarian?: boolean; }

// Events, News & Logs
export interface NewsItem { id: string; headline: string; source: string; isMajor: boolean; }
export interface MajorEvent { titleKey: string; descriptionKey: string; effects: Partial<Record<GlobalFactor, number>>; params?: Record<string, string | number>; }
export interface DailyNewsScheduleItem { triggerHour: number; news: NewsItem; triggered: boolean; }
export type LogType = 'all' | 'trade' | 'corporate' | 'system' | 'loan' | 'politics';
export interface LogEntry { id: string; date: GameDate; type: LogType; message: string; }

// State & Actions
export interface PlayerState { name: string; cash: number; portfolio: Record<string, PortfolioItem>; marginPositions: Record<string, MarginPosition>; companies: Company[]; loan: { amount: number; interestRate: number; defermentsUsed: number; isDeferredThisMonth: boolean; }; ventureLoans: VentureLoan[]; revivalLoan: RevivalLoan | null; loanActionsThisMonth: number; tradeBans: TradeBan[]; politicalCapital: Record<string, number>; currentResidency: string; residencyHistory: string[]; log: LogEntry[]; pendingOrders: PendingOrder[]; bankruptcyState: 'none' | 'grace_period' | 'revival_loan' | 'game_over'; gracePeriodExpiryDate: GameDate | null; gameOverReason: 'prison' | 'execution' | null; }
export interface PenaltyInfo { loanAmount: number; }
export interface GameState { date: GameDate; gameSpeed: number; isPaused: boolean; isSimulating: boolean; assets: Record<string, Asset>; globalFactors: GlobalFactors; player: PlayerState; newsTicker: NewsItem[]; newsArchive: NewsItem[]; majorEvent: MajorEvent | null; majorEventQueue: MajorEvent[]; dailyNewsSchedule: DailyNewsScheduleItem[]; priceUpdateAccumulator: number; language: Language; penaltyRequired: PenaltyInfo | null; }

export type GameAction =
    | { type: 'LOAD_STATE'; payload: GameState }
    | { type: 'SET_PAUSED'; payload: boolean }
    | { type: 'SET_SPEED'; payload: number }
    | { type: 'SET_LANGUAGE'; payload: Language }
    | { type: 'TICK'; payload: { deltaTime: number } }
    | { type: 'ADVANCE_DAY' }
    | { type: 'SKIP_DAYS'; payload: { days: number } }
    | { type: 'SET_INITIAL_STATE'; payload: { countryId: string; playerName: string } }
    | { type: 'SPOT_TRADE'; payload: { assetId: string; quantity: number; price: number; type: 'buy' | 'sell' } }
    | { type: 'OPEN_MARGIN_POSITION'; payload: { assetId: string; quantity: number; price: number; leverage: number; type: 'long' | 'short'; stopLoss?: number; takeProfit?: number; } }
    | { type: 'CLOSE_MARGIN_POSITION'; payload: { positionId: string; closingPrice?: number } }
    | { type: 'ANALYST_REPORT_PURCHASED', payload: { cost: number, message: string }}
    | { type: 'ESTABLISH_COMPANY'; payload: Company }
    | { type: 'UPGRADE_COMPANY'; payload: { companyId: string; cost: number; outcome: UpgradeOutcome } }
    | { type: 'EXECUTE_CORPORATE_ACTION'; payload: { companyId: string; type: CorporateAction; cost: number } }
    | { type: 'TAKE_LOAN'; payload: number }
    | { type: 'TAKE_VENTURE_LOAN', payload: { amount: number, interestRate: number } }
    | { type: 'TAKE_REVIVAL_LOAN', payload: { amount: number } }
    | { type: 'REPAY_LOAN'; payload: number }
    | { type: 'DEFER_LOAN_PAYMENT' }
    | { type: 'CHOOSE_PENALTY', payload: { type: 'fine' | 'ban', loanAmount: number } }
    | { type: 'CHANGE_RESIDENCY'; payload: { countryId: string; cost: number } }
    | { type: 'EXECUTE_POLITICAL_ACTION'; payload: { type: 'donate', countryId: string, party: string, amount: number } }
    | { type: 'EXECUTE_LOCAL_LOBBY', payload: { category: AssetCategory, costPC: number } }
    | { type: 'EXECUTE_GLOBAL_INFLUENCE', payload: { factor: GlobalFactor, direction: 'promote' | 'disrupt', costPC: number, costCash: number }}
    | { type: 'PLACE_PENDING_ORDER'; payload: PendingOrder }
    | { type: 'CANCEL_PENDING_ORDER'; payload: { orderId: string } }
    | { type: 'DISMISS_MAJOR_EVENT' };

// Component Props
export type ModalType = | { type: 'country-selection' } | { type: 'event-popup'; event: MajorEvent } | { type: 'penalty-choice'; penaltyInfo: PenaltyInfo } | { type: 'game-over' } | { type: 'trade'; assetId: string } | { type: 'order'; assetId: string } | { type: 'chart'; assetId: string } | { type: 'company'; companyType: CompanyType } | { type: 'upgrade-company'; company: Company } | { type: 'company-management'; company: Company } | { type: 'politics' } | { type: 'lobbying' } | { type: 'immigration' } | { type: 'global-influence' } | { type: 'analyst'; analysisType: 'prediction' | 'analysis' } | null;
export interface HeaderProps { gameState: GameState; dispatch: React.Dispatch<GameAction>; onSave: () => void; onQuit: () => void; onDelete: () => void; }
export interface TimeControlsProps { isSimulating: boolean; daysToSimulate: number; isPaused: boolean; dispatch: React.Dispatch<GameAction>; date: GameDate; language: Language; }
export interface CountrySelectionModalProps { onSelect: (countryId: string, playerName: string) => void; countries: Country[]; language: Language; }
export interface MainContentProps { gameState: GameState; dispatch: React.Dispatch<GameAction>; activeModal: ModalType; setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>; }
export interface TradeModalProps { onClose: () => void; asset: Asset; portfolioItem: PortfolioItem | undefined; playerCash: number; dispatch: React.Dispatch<GameAction>; language: Language; }
export interface OrderModalProps { onClose: () => void; asset: Asset; portfolioItem: PortfolioItem | undefined; playerCash: number; dispatch: React.Dispatch<GameAction>; language: Language; }
export interface ChartModalProps { onClose: () => void; asset: Asset; language: Language; }
export interface CompanyModalProps { onClose: () => void; companyType: CompanyType; dispatch: React.Dispatch<GameAction>; playerCash: number; residency: string; language: Language; }
export interface UpgradeCompanyModalProps { onClose: () => void; company: Company; dispatch: React.Dispatch<GameAction>; playerCash: number; language: Language; }
export interface CompanyManagementModalProps { onClose: () => void; company: Company; dispatch: React.Dispatch<GameAction>; playerCash: number; language: Language; }
export interface PoliticsModalProps { onClose: () => void; dispatch: React.Dispatch<GameAction>; residencyHistory: string[]; politicalCapital: Record<string, number>; playerCash: number; language: Language; }
export interface LobbyingModalProps { onClose: () => void; dispatch: React.Dispatch<GameAction>; politicalCapital: number; language: Language; }
export interface ImmigrationModalProps { onClose: () => void; dispatch: React.Dispatch<GameAction>; residency: string; netWorth: number; playerCash: number; countries: Country[]; language: Language; }
export interface GlobalInfluenceModalProps { onClose: () => void; dispatch: React.Dispatch<GameAction>; politicalCapital: number; playerCash: number; language: Language; }
export interface AnalystModalProps { onClose: () => void; analysisType: 'prediction' | 'analysis'; playerCash: number; assets: Record<string, Asset>; dispatch: React.Dispatch<GameAction>; language: Language; }
export interface EventModalProps { onClose: () => void; event: MajorEvent; language: Language; }
export interface PenaltyChoiceModalProps { onClose: () => void; penaltyInfo: PenaltyInfo; dispatch: React.Dispatch<GameAction>; language: Language; }
export interface MarketsViewProps { assets: Record<string, Asset>; tradeBans: TradeBan[]; date: GameDate; residency: string; setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>; language: Language; }
export interface PortfolioViewProps { gameState: GameState; dispatch: React.Dispatch<GameAction>; language: Language; }
export interface CompaniesViewProps { companies: Company[]; playerCash: number; setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>; language: Language; }
export interface PoliticsViewProps { gameState: GameState; setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>; language: Language; }
// Fix: Add politicalCapital and portfolio to BankViewProps to fix type errors and logic bugs.
export interface BankViewProps { loan: PlayerState['loan']; ventureLoans: VentureLoan[]; revivalLoan: RevivalLoan | null; bankruptcyState: PlayerState['bankruptcyState']; companies: Company[]; netWorth: number; playerCash: number; date: GameDate; dispatch: React.Dispatch<GameAction>; setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>; language: Language; politicalCapital: Record<string, number>; portfolio: Record<string, PortfolioItem>; }
export interface LogViewProps { log: LogEntry[]; language: Language; }
export interface NewsViewProps { newsArchive: NewsItem[]; language: Language; }