// game/types.ts

export type Language = 'en' | 'fa';

export interface GameDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    dayProgress: number; // 0 to 1
}

export type GlobalFactor = 
    | 'globalStability' | 'usEconomy' | 'chinaEconomy' | 'euEconomy' | 'japanEconomy' 
    | 'indiaEconomy' | 'russiaEconomy' | 'middleEastTension' | 'asiaTensions' 
    | 'techInnovation' | 'globalSupplyChain' | 'oilSupply' | 'usFedPolicy' 
    | 'secRegulation' | 'usJobGrowth' | 'publicSentiment' | 'climateChangeImpact' 
    | 'pharmaDemand' | 'inflation';

export type GlobalFactors = Record<GlobalFactor, number>;

export interface PriceHistory {
    date: { year: number, month: number, day: number };
    price: number;
}
export interface Asset {
    id: string;
    name: string;
    category: AssetCategory;
    price: number;
    basePrice: number;
    volatility: number;
    trend: number; // small positive or negative base trend
    dna: Partial<Record<GlobalFactor, number>>;
    priceHistory: PriceHistory[];
    isScam?: boolean;
}

export interface PortfolioItem {
    assetId: string;
    quantity: number;
    costBasis: number; // Average price paid per share
}

export interface MarginPosition {
    id: string;
    assetId: string;
    quantity: number;
    entryPrice: number;
    leverage: number;
    type: 'long' | 'short';
    margin: number;
}

export type CompanyEffectType = 'income_halt' | 'tax_break';
export interface CompanyEffect {
    type: CompanyEffectType;
    durationMonths: number;
}

export interface Company {
    id: string;
    name: string;
    type: CompanyType;
    level: number;
    monthlyIncome: number;
    specialAbilityChance: number;
    countryId: string;
    effects: CompanyEffect[];
}

export interface LogEntry {
    id: string;
    date: GameDate;
    message: string;
    type: 'trade' | 'corporate' | 'system' | 'loan' | 'politics';
}

export interface PendingOrder {
    id: string;
    assetId: string;
    type: 'buy-limit' | 'sell-limit';
    quantity: number;
    limitPrice: number;
}

export interface Player {
    name: string;
    cash: number;
    portfolio: Record<string, PortfolioItem>;
    marginPositions: Record<string, MarginPosition>;
    companies: Company[];
    loan: {
        amount: number;
        interestRate: number;
        defermentsUsed: number;
        isDeferredThisMonth: boolean;
    };
    politicalCapital: Record<string, number>;
    currentResidency: string; // Country ID
    residencyHistory: string[];
    log: LogEntry[];
    pendingOrders: PendingOrder[];
}

export interface NewsItem {
    id: string;
    headline: string;
    source: string;
}

export interface MajorEvent {
    titleKey: string;
    descriptionKey: string;
    effects: Partial<Record<GlobalFactor, number>>;
}

export interface DailyNewsScheduleItem {
    triggerHour: number;
    news: NewsItem;
    triggered: boolean;
}

export interface GameState {
    date: GameDate;
    gameSpeed: number; // 1, 2, 5, etc.
    isPaused: boolean;
    isSimulating: boolean; // For showing loading states on long skips
    assets: Record<string, Asset>;
    globalFactors: GlobalFactors;
    player: Player;
    newsTicker: NewsItem[];
    newsArchive: NewsItem[];
    majorEvent: MajorEvent | null;
    majorEventQueue: MajorEvent[];
    dailyNewsSchedule: DailyNewsScheduleItem[];
    priceUpdateAccumulator: number;
    language: Language;
}

export type ModalType =
    | null
    | { type: 'country-selection' }
    | { type: 'trade'; assetId: string }
    | { type: 'order'; assetId: string }
    | { type: 'chart'; assetId: string }
    | { type: 'company'; companyType: CompanyType }
    | { type: 'upgrade-company'; company: Company } // Kept for simplicity, though management modal is primary
    | { type: 'company-management'; company: Company }
    | { type: 'politics' }
    | { type: 'lobbying' }
    | { type: 'immigration' }
    | { type: 'global-influence' }
    | { type: 'event-popup'; event: MajorEvent }
    | { type: 'analyst'; analysisType: 'prediction' | 'analysis' };

export type CorporateActionType = 'marketing' | 'research' | 'lobbying';
export interface CorporateAction {
    companyId: string;
    type: CorporateActionType;
    cost: number;
}

export type GameAction =
    | { type: 'LOAD_STATE'; payload: GameState }
    | { type: 'SET_PAUSED'; payload: boolean }
    | { type: 'SET_SPEED'; payload: number }
    | { type: 'TICK'; payload: { deltaTime: number } }
    | { type: 'ADVANCE_DAY' }
    | { type: 'SKIP_DAYS'; payload: { days: number } }
    | { type: 'SET_INITIAL_STATE'; payload: { countryId: string, playerName: string } }
    | { type: 'SPOT_TRADE'; payload: { assetId: string; quantity: number; price: number; type: 'buy' | 'sell' } }
    | { type: 'OPEN_MARGIN_POSITION'; payload: { assetId: string; quantity: number; price: number; leverage: number; type: 'long' | 'short' } }
    | { type: 'CLOSE_MARGIN_POSITION'; payload: { positionId: string } }
    | { type: 'ESTABLISH_COMPANY'; payload: Company }
    | { type: 'UPGRADE_COMPANY'; payload: { companyId: string, cost: number, outcome: UpgradeOutcome } }
    | { type: 'EXECUTE_CORPORATE_ACTION'; payload: CorporateAction }
    | { type: 'TAKE_LOAN'; payload: number }
    | { type: 'REPAY_LOAN'; payload: number }
    | { type: 'DEFER_LOAN_PAYMENT' }
    | { type: 'CHANGE_RESIDENCY'; payload: { countryId: string, cost: number } }
    | { type: 'EXECUTE_POLITICAL_ACTION'; payload: PoliticalAction }
    | { type: 'EXECUTE_LOCAL_LOBBY'; payload: { category: AssetCategory, costPC: number } }
    | { type: 'EXECUTE_GLOBAL_INFLUENCE'; payload: { factor: GlobalFactor, direction: 'promote' | 'disrupt', costPC: number, costCash: number } }
    | { type: 'ANALYST_REPORT_PURCHASED', payload: { cost: number, message: string } }
    | { type: 'DISMISS_MAJOR_EVENT' }
    | { type: 'SET_LANGUAGE'; payload: Language }
    | { type: 'PLACE_PENDING_ORDER'; payload: PendingOrder }
    | { type: 'CANCEL_PENDING_ORDER'; payload: { orderId: string } };


export type PoliticalAction = 
    | { type: 'donate', countryId: string, party: string, amount: number }
    | { type: 'lobby', countryId: string, industry: AssetCategory };

export interface Country {
    id: string;
    name: string;
    taxRate: number;
    companyCostModifier: number;
    localMarkets: string[]; // Asset IDs
    immigrationCost: number;
    politicalParties: { id: string, name: string }[];
    electionCycle?: { year: number, month: number, interval: number };
}

export type AssetCategory = 'Tech' | 'Commodity' | 'Crypto' | 'Pharma' | 'Real Estate' | 'Global' | 'Industrial' | 'Consumer';

export type CompanyType = 'tech' | 'mining' | 'pharma' | 'media' | 'finance' | 'real_estate';

export interface CompanyData {
    baseCost: number;
    baseIncome: number;
    upgradeCostMultiplier: number;
    incomeMultiplier: number;
}

export type UpgradeOutcome = 'success' | 'critical_success' | 'complication_cost' | 'complication_delay';

// Component Prop Types
export interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

export interface HeaderProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onSave: () => void;
    onQuit: () => void;
    onDelete: () => void;
}

export interface TimeControlsProps {
    isSimulating: boolean;
    isPaused: boolean;
    dispatch: React.Dispatch<GameAction>;
    date: GameDate;
    language: Language;
}

export interface NewsTickerProps {
    news: NewsItem[];
}

export interface MainContentProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    activeModal: ModalType;
    setActiveModal: (modal: ModalType) => void;
}

export interface CountrySelectionModalProps {
    onSelect: (countryId: string, playerName: string) => void;
    countries: Country[];
    language: Language;
}

export interface TradeModalProps {
    onClose: () => void;
    asset: Asset;
    portfolioItem: PortfolioItem | undefined;
    playerCash: number;
    dispatch: React.Dispatch<GameAction>;
    language: Language;
}

export interface OrderModalProps {
    onClose: () => void;
    asset: Asset;
    portfolioItem: PortfolioItem | undefined;
    playerCash: number;
    dispatch: React.Dispatch<GameAction>;
    language: Language;
}

export interface ChartModalProps {
    onClose: () => void;
    asset: Asset;
    language: Language;
}

export interface CompanyModalProps {
    onClose: () => void;
    companyType: CompanyType;
    dispatch: React.Dispatch<GameAction>;
    playerCash: number;
    residency: string;
    language: Language;
}

export interface CompanyManagementModalProps {
     onClose: () => void;
    company: Company;
    dispatch: React.Dispatch<GameAction>;
    playerCash: number;
    language: Language;
}

export interface UpgradeCompanyModalProps {
    onClose: () => void;
    company: Company;
    dispatch: React.Dispatch<GameAction>;
    playerCash: number;
    language: Language;
}

export interface PoliticsModalProps {
    onClose: () => void;
    dispatch: React.Dispatch<GameAction>;
    residencyHistory: string[];
    politicalCapital: Record<string, number>;
    playerCash: number;
    language: Language;
}

export interface LobbyingModalProps {
    onClose: () => void;
    dispatch: React.Dispatch<GameAction>;
    politicalCapital: number;
    language: Language;
}

export interface ImmigrationModalProps {
    onClose: () => void;
    dispatch: React.Dispatch<GameAction>;
    residency: string;
    netWorth: number;
    playerCash: number;
    countries: Country[];
    language: Language;
}

export interface GlobalInfluenceModalProps {
    onClose: () => void;
    dispatch: React.Dispatch<GameAction>;
    politicalCapital: number;
    playerCash: number;
    language: Language;
}

export interface EventModalProps {
    onClose: () => void;
    event: MajorEvent;
    language: Language;
}

export interface AnalystModalProps {
    onClose: () => void;
    analysisType: 'prediction' | 'analysis';
    playerCash: number;
    assets: Record<string, Asset>;
    dispatch: React.Dispatch<GameAction>;
    language: Language;
}

export interface MarketsViewProps {
    assets: Record<string, Asset>;
    residency: string;
    setActiveModal: (modal: ModalType) => void;
    language: Language;
}

export interface PortfolioViewProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    language: Language;
}

export interface CompaniesViewProps {
    companies: Company[];
    playerCash: number;
    setActiveModal: (modal: ModalType) => void;
    language: Language;
}

export interface PoliticsViewProps {
    gameState: GameState;
    setActiveModal: (modal: ModalType) => void;
    language: Language;
}

export interface BankViewProps {
    loan: Player['loan'];
    netWorth: number;
    playerCash: number;
    dispatch: React.Dispatch<GameAction>;
    setActiveModal: (modal: ModalType) => void;
    language: Language;
}

export interface LogViewProps {
    log: LogEntry[];
    language: Language;
}

export interface NewsViewProps {
    newsArchive: NewsItem[];
    language: Language;
}