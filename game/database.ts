// game/database.ts
import { GameState, Country, Asset, AssetCategory, CompanyType, CompanyData, GlobalFactors } from './types';

export const COUNTRIES: Country[] = [
    { id: 'USA', name: 'United States', taxRate: 0.21, companyCostModifier: 1.0, localMarkets: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'PFE', 'MRNA', 'JNJ', 'CAT', 'PG', 'NY_RealEstate'], immigrationCost: 10000000, politicalParties: [{id: 'dems', name: 'Democrats'}, {id: 'gop', name: 'Republicans'}], electionCycle: { year: 2024, month: 11, interval: 4 } },
    { id: 'CHN', name: 'China', taxRate: 0.25, companyCostModifier: 0.7, localMarkets: ['TCEHY', 'BABA'], immigrationCost: 20000000, politicalParties: [{id: 'ccp', name: 'Communist Party'}] },
    { id: 'DEU', name: 'Germany', taxRate: 0.30, companyCostModifier: 1.2, localMarkets: ['VOW3_DE', 'SIE_DE', 'SAP'], immigrationCost: 8000000, politicalParties: [{id: 'cdu', name: 'CDU/CSU'}, {id: 'spd', name: 'SPD'}] },
    { id: 'JPN', name: 'Japan', taxRate: 0.23, companyCostModifier: 1.1, localMarkets: ['TM', 'TKY_RealEstate'], immigrationCost: 12000000, politicalParties: [{id: 'ldp', name: 'LDP'}] },
    { id: 'GBR', name: 'United Kingdom', taxRate: 0.25, companyCostModifier: 1.3, localMarkets: ['LSE_RealEstate', 'BP', 'HSBC'], immigrationCost: 13000000, politicalParties: [{id: 'con', name: 'Conservatives'}, {id: 'lab', name: 'Labour'}] },
    { id: 'AUS', name: 'Australia', taxRate: 0.30, companyCostModifier: 1.2, localMarkets: ['SYD_RealEstate', 'BHP'], immigrationCost: 9000000, politicalParties: [{id: 'lib', name: 'Liberal'}, {id: 'lab', name: 'Labor'}] },
    { id: 'IND', name: 'India', taxRate: 0.22, companyCostModifier: 0.6, localMarkets: ['TTM', 'RELIANCE'], immigrationCost: 5000000, politicalParties: [{id: 'bjp', name: 'BJP'}, {id: 'inc', name: 'Congress'}] },
    { id: 'BRA', name: 'Brazil', taxRate: 0.34, companyCostModifier: 0.8, localMarkets: ['RIO_RealEstate', 'PBR'], immigrationCost: 6000000, politicalParties: [{id: 'pl', name: 'Liberal Party'}, {id: 'pt', name: 'Workers Party'}] },
    { id: 'RUS', name: 'Russia', taxRate: 0.20, companyCostModifier: 0.8, localMarkets: ['RUS_SCAM'], immigrationCost: 15000000, politicalParties: [{id: 'ur', name: 'United Russia'}] },
    { id: 'FRA', name: 'France', taxRate: 0.28, companyCostModifier: 1.3, localMarkets: ['LVMUY', 'TTE'], immigrationCost: 9000000, politicalParties: [{id: 'rem', name: 'La République En Marche!'}, {id: 'rn', name: 'National Rally'}] },
    { id: 'KOR', name: 'South Korea', taxRate: 0.25, companyCostModifier: 0.9, localMarkets: ['SSNLF', 'HYMTF'], immigrationCost: 11000000, politicalParties: [{id: 'dp', name: 'Democratic Party'}, {id: 'ppp', name: 'People Power Party'}] },
    { id: 'NLD', name: 'Netherlands', taxRate: 0.25, companyCostModifier: 1.2, localMarkets: ['ASML', 'UL'], immigrationCost: 10000000, politicalParties: [{id: 'vvd', name: 'VVD'}] },
    { id: 'TWN', name: 'Taiwan', taxRate: 0.20, companyCostModifier: 1.0, localMarkets: ['TSM'], immigrationCost: 14000000, politicalParties: [{id: 'dpp', name: 'DPP'}, {id: 'kmt', name: 'KMT'}] },
    { id: 'CHE', name: 'Switzerland', taxRate: 0.18, companyCostModifier: 1.5, localMarkets: ['RHHBY', 'NVS', 'UBS'], immigrationCost: 25000000, politicalParties: [{id: 'svp', name: 'SVP'}] },
    { id: 'CAN', name: 'Canada', taxRate: 0.26, companyCostModifier: 1.1, localMarkets: ['VAN_RealEstate', 'SHOP'], immigrationCost: 7000000, politicalParties: [{id: 'lib', name: 'Liberal'}, {id: 'con', name: 'Conservative'}] },
    { id: 'ARE', name: 'UAE', taxRate: 0.09, companyCostModifier: 1.4, localMarkets: ['DBI_RealEstate'], immigrationCost: 18000000, politicalParties: [{id: 'monarchy', name: 'Monarchy'}] },
    { id: 'SAU', name: 'Saudi Arabia', taxRate: 0.20, companyCostModifier: 1.1, localMarkets: ['RUH_RealEstate', 'SAOC'], immigrationCost: 16000000, politicalParties: [{id: 'monarchy', name: 'Monarchy'}] },
];

const ASSETS_LIST: Omit<Asset, 'priceHistory'>[] = [
    // Commodities
    { id: 'OIL', name: 'Crude Oil', category: 'Commodity', price: 75, basePrice: 75, volatility: 0.03, trend: 0.0001, dna: { globalStability: -0.8, usEconomy: 0.5, chinaEconomy: 0.6, middleEastTension: 1.5, oilSupply: -2.0, russiaEconomy: 0.7 } },
    { id: 'GOLD', name: 'Gold', category: 'Commodity', price: 1800, basePrice: 1800, volatility: 0.015, trend: 0, dna: { globalStability: -1.5, usFedPolicy: -1.2, inflation: 1.0, publicSentiment: -0.5 } },
    { id: 'SILVER', name: 'Silver', category: 'Commodity', price: 22, basePrice: 22, volatility: 0.02, trend: 0, dna: { globalStability: -1.0, usFedPolicy: -0.8, inflation: 0.8, techInnovation: 0.3 } },
    { id: 'COPPER', name: 'Copper', category: 'Commodity', price: 4.5, basePrice: 4.5, volatility: 0.025, trend: 0.0002, dna: { globalSupplyChain: -0.8, chinaEconomy: 1.2, usEconomy: 0.6, techInnovation: 0.5 } },
    { id: 'PLATINUM', name: 'Platinum', category: 'Commodity', price: 950, basePrice: 950, volatility: 0.022, trend: 0, dna: { globalStability: -0.5, techInnovation: 0.6, russiaEconomy: -0.4 } },
    { id: 'WHEAT', name: 'Wheat', category: 'Commodity', price: 6, basePrice: 6, volatility: 0.04, trend: 0.0001, dna: { climateChangeImpact: -1.5, globalSupplyChain: -1.0, russiaEconomy: 0.8, indiaEconomy: 0.5 } },

    // Tech Stocks
    { id: 'AAPL', name: 'Apple Inc.', category: 'Tech', price: 170, basePrice: 170, volatility: 0.02, trend: 0.0003, dna: { usEconomy: 1.0, techInnovation: 0.8, globalSupplyChain: -0.5, chinaEconomy: 0.4, publicSentiment: 0.3 } },
    { id: 'GOOGL', name: 'Alphabet Inc.', category: 'Tech', price: 2800, basePrice: 2800, volatility: 0.021, trend: 0.0003, dna: { usEconomy: 0.8, techInnovation: 1.2, secRegulation: -0.6, publicSentiment: 0.4 } },
    { id: 'MSFT', name: 'Microsoft Corp.', category: 'Tech', price: 300, basePrice: 300, volatility: 0.019, trend: 0.0002, dna: { usEconomy: 1.1, techInnovation: 1.0, secRegulation: -0.3, publicSentiment: 0.2 } },
    { id: 'AMZN', name: 'Amazon.com, Inc.', category: 'Tech', price: 3400, basePrice: 3400, volatility: 0.025, trend: 0.00025, dna: { usEconomy: 1.2, usJobGrowth: 0.4, globalSupplyChain: -0.3, publicSentiment: 0.5 } },
    { id: 'TSLA', name: 'Tesla, Inc.', category: 'Tech', price: 700, basePrice: 700, volatility: 0.045, trend: 0.0005, dna: { techInnovation: 1.5, oilSupply: 0.5, chinaEconomy: 0.6, secRegulation: -0.5, publicSentiment: 1.0 } },
    { id: 'NVDA', name: 'NVIDIA Corp.', category: 'Tech', price: 200, basePrice: 200, volatility: 0.035, trend: 0.0006, dna: { techInnovation: 2.0, globalSupplyChain: -0.7, chinaEconomy: 0.3, usFedPolicy: -0.4 } },
    { id: 'TSM', name: 'TSMC', category: 'Tech', price: 120, basePrice: 120, volatility: 0.03, trend: 0.0005, dna: { techInnovation: 2.2, globalSupplyChain: -1.8, asiaTensions: -1.5, usEconomy: 0.9 } },
    { id: 'SAP', name: 'SAP SE', category: 'Tech', price: 130, basePrice: 130, volatility: 0.018, trend: 0.0002, dna: { euEconomy: 1.2, techInnovation: 0.8, usEconomy: 0.5 } },
    { id: 'SHOP', name: 'Shopify Inc.', category: 'Tech', price: 65, basePrice: 65, volatility: 0.05, trend: 0.0004, dna: { usEconomy: 1.0, publicSentiment: 0.8, techInnovation: 0.6 } },


    // Crypto
    { id: 'BTC', name: 'Bitcoin', category: 'Crypto', price: 40000, basePrice: 40000, volatility: 0.05, trend: 0, dna: { globalStability: -0.8, usFedPolicy: -1.5, secRegulation: -2.0, publicSentiment: 1.2, inflation: 0.5 } },
    { id: 'ETH', name: 'Ethereum', category: 'Crypto', price: 2800, basePrice: 2800, volatility: 0.06, trend: 0.0001, dna: { techInnovation: 0.5, usFedPolicy: -1.2, secRegulation: -1.8, publicSentiment: 1.0, inflation: 0.4 } },
    { id: 'XRP', name: 'Ripple', category: 'Crypto', price: 0.75, basePrice: 0.75, volatility: 0.08, trend: 0, dna: { secRegulation: -2.5, publicSentiment: 0.8 } },
    { id: 'SOL', name: 'Solana', category: 'Crypto', price: 150, basePrice: 150, volatility: 0.09, trend: 0.0002, dna: { techInnovation: 0.8, usFedPolicy: -1.0, publicSentiment: 1.5 } },
    { id: 'ADA', name: 'Cardano', category: 'Crypto', price: 1.2, basePrice: 1.2, volatility: 0.07, trend: 0.0001, dna: { techInnovation: 0.6, publicSentiment: 0.7 } },
    { id: 'DOGE', name: 'Dogecoin', category: 'Crypto', price: 0.15, basePrice: 0.15, volatility: 0.15, trend: 0, dna: { publicSentiment: 2.5 } },
    { id: 'SHIB', name: 'Shiba Inu', category: 'Crypto', price: 0.000025, basePrice: 0.000025, volatility: 0.20, trend: 0, dna: { publicSentiment: 3.0 } },

    // Pharma
    { id: 'PFE', name: 'Pfizer Inc.', category: 'Pharma', price: 50, basePrice: 50, volatility: 0.018, trend: 0.0001, dna: { pharmaDemand: 1.5, globalStability: -0.3, secRegulation: -0.4 } },
    { id: 'MRNA', name: 'Moderna, Inc.', category: 'Pharma', price: 150, basePrice: 150, volatility: 0.04, trend: 0.0002, dna: { pharmaDemand: 2.0, techInnovation: 0.5 } },
    { id: 'JNJ', name: 'Johnson & Johnson', category: 'Pharma', price: 160, basePrice: 160, volatility: 0.015, trend: 0, dna: { pharmaDemand: 1.0, usEconomy: 0.3 } },
    { id: 'RHHBY', name: 'Roche Holding AG', category: 'Pharma', price: 400, basePrice: 400, volatility: 0.016, trend: 0, dna: { pharmaDemand: 1.2, euEconomy: 0.5 } },
    { id: 'NVS', name: 'Novartis AG', category: 'Pharma', price: 90, basePrice: 90, volatility: 0.017, trend: 0, dna: { pharmaDemand: 1.1, euEconomy: 0.4 } },
    
    // Real Estate
    { id: 'NY_RealEstate', name: 'New York Real Estate', category: 'Real Estate', price: 1000, basePrice: 1000, volatility: 0.005, trend: 0.0001, dna: { usEconomy: 1.5, usFedPolicy: -2.0, usJobGrowth: 1.0, globalStability: 0.5 } },
    { id: 'VAN_RealEstate', name: 'Vancouver Real Estate', category: 'Real Estate', price: 1200, basePrice: 1200, volatility: 0.006, trend: 0.0001, dna: { chinaEconomy: 1.0, asiaTensions: 1.5, globalStability: 0.6 } },
    { id: 'DBI_RealEstate', name: 'Dubai Real Estate', category: 'Real Estate', price: 800, basePrice: 800, volatility: 0.008, trend: 0.0002, dna: { oilSupply: 1.0, middleEastTension: -1.0, globalStability: 0.8, russiaEconomy: 0.5 } },
    { id: 'TKY_RealEstate', name: 'Tokyo Real Estate', category: 'Real Estate', price: 900, basePrice: 900, volatility: 0.004, trend: 0, dna: { japanEconomy: 2.0, asiaTensions: -0.5, globalStability: 0.4 } },
    { id: 'LSE_RealEstate', name: 'London Real Estate', category: 'Real Estate', price: 1300, basePrice: 1300, volatility: 0.005, trend: 0.0001, dna: { euEconomy: 0.8, usEconomy: 0.5, globalStability: 0.7 } },
    { id: 'SYD_RealEstate', name: 'Sydney Real Estate', category: 'Real Estate', price: 1100, basePrice: 1100, volatility: 0.007, trend: 0.00015, dna: { chinaEconomy: 1.2, globalStability: 0.5, asiaTensions: -0.4 } },
    { id: 'RIO_RealEstate', name: 'Rio de Janeiro RE', category: 'Real Estate', price: 500, basePrice: 500, volatility: 0.01, trend: 0.0001, dna: { globalStability: 0.4, publicSentiment: -0.8 } },
    { id: 'RUH_RealEstate', name: 'Riyadh Real Estate', category: 'Real Estate', price: 750, basePrice: 750, volatility: 0.009, trend: 0.0002, dna: { oilSupply: 1.2, middleEastTension: -0.8, globalStability: 0.6 } },

    // Global Stocks
    { id: 'TCEHY', name: 'Tencent Holdings', category: 'Global', price: 60, basePrice: 60, volatility: 0.03, trend: 0.0002, dna: { chinaEconomy: 1.5, secRegulation: -1.0, asiaTensions: -0.8 } },
    { id: 'BABA', name: 'Alibaba Group', category: 'Global', price: 120, basePrice: 120, volatility: 0.032, trend: 0.0001, dna: { chinaEconomy: 1.8, secRegulation: -1.2, asiaTensions: -1.0, globalSupplyChain: 0.4 } },
    { id: 'SAOC', name: 'Saudi Aramco', category: 'Global', price: 11, basePrice: 11, volatility: 0.02, trend: 0.0001, dna: { oilSupply: 1.8, middleEastTension: -1.2, globalStability: 0.4 } },
    { id: 'TM', name: 'Toyota Motor Corp.', category: 'Global', price: 180, basePrice: 180, volatility: 0.018, trend: 0.0001, dna: { japanEconomy: 1.2, globalSupplyChain: -0.6, oilSupply: 0.2 } },
    { id: 'SSNLF', name: 'Samsung Electronics', category: 'Global', price: 1300, basePrice: 1300, volatility: 0.025, trend: 0.0002, dna: { techInnovation: 1.0, globalSupplyChain: -0.8, asiaTensions: -0.5 } },
    { id: 'LVMUY', name: 'LVMH', category: 'Global', price: 800, basePrice: 800, volatility: 0.02, trend: 0.0002, dna: { euEconomy: 1.0, chinaEconomy: 0.8, publicSentiment: 0.6 } },
    { id: 'ASML', name: 'ASML Holding', category: 'Global', price: 700, basePrice: 700, volatility: 0.028, trend: 0.0004, dna: { techInnovation: 2.5, globalSupplyChain: -1.5, chinaEconomy: -0.5, usEconomy: 0.8 } },
    { id: 'VOW3_DE', name: 'Volkswagen AG', category: 'Global', price: 180, basePrice: 180, volatility: 0.022, trend: 0, dna: { euEconomy: 1.2, globalSupplyChain: -0.7, oilSupply: -0.3 } },
    { id: 'TTM', name: 'Tata Motors', category: 'Global', price: 30, basePrice: 30, volatility: 0.03, trend: 0.0003, dna: { indiaEconomy: 1.5, globalSupplyChain: -0.4 } },
    { id: 'BP', name: 'BP plc', category: 'Global', price: 35, basePrice: 35, volatility: 0.025, trend: 0.0001, dna: { oilSupply: -1.5, globalStability: -0.6, euEconomy: 0.5, climateChangeImpact: -1.0 } },
    { id: 'HSBC', name: 'HSBC Holdings', category: 'Global', price: 30, basePrice: 30, volatility: 0.022, trend: 0.0001, dna: { globalStability: 1.0, usEconomy: 0.6, chinaEconomy: 0.8, euEconomy: 0.7, usFedPolicy: -0.5 } },
    { id: 'PBR', name: 'Petrobras', category: 'Global', price: 15, basePrice: 15, volatility: 0.04, trend: 0, dna: { oilSupply: -1.2, globalStability: -0.7 } },
    { id: 'RUS_SCAM', name: 'Gazprom Invest', category: 'Global', price: 2, basePrice: 2, volatility: 0.35, trend: 0.005, dna: { russiaEconomy: 1.5, publicSentiment: 0.5, globalStability: -1.0 }, isScam: true },
    { id: 'TTE', name: 'TotalEnergies SE', category: 'Global', price: 55, basePrice: 55, volatility: 0.026, trend: 0.0001, dna: { oilSupply: -1.6, euEconomy: 0.6, climateChangeImpact: -0.8 } },
    { id: 'HYMTF', name: 'Hyundai Motor', category: 'Global', price: 45, basePrice: 45, volatility: 0.028, trend: 0.0002, dna: { globalSupplyChain: -0.7, asiaTensions: -0.4, usEconomy: 0.5 } },
    { id: 'UBS', name: 'UBS Group AG', category: 'Global', price: 18, basePrice: 18, volatility: 0.024, trend: 0.0001, dna: { globalStability: 1.2, euEconomy: 0.8, usFedPolicy: 0.6 } },

    // Industrial
    { id: 'CAT', name: 'Caterpillar Inc.', category: 'Industrial', price: 220, basePrice: 220, volatility: 0.019, trend: 0.0001, dna: { usEconomy: 1.2, usJobGrowth: 0.8, globalSupplyChain: -0.3 } },
    { id: 'SIE_DE', name: 'Siemens AG', category: 'Industrial', price: 140, basePrice: 140, volatility: 0.018, trend: 0, dna: { euEconomy: 1.2, globalSupplyChain: -0.5 } },
    { id: 'BHP', name: 'BHP Group', category: 'Industrial', price: 50, basePrice: 50, volatility: 0.028, trend: 0.0002, dna: { chinaEconomy: 1.5, globalSupplyChain: -0.6, usEconomy: 0.4 } },
    { id: 'RELIANCE', name: 'Reliance Industries', category: 'Industrial', price: 35, basePrice: 35, volatility: 0.029, trend: 0.0003, dna: { indiaEconomy: 1.8, oilSupply: 0.5, globalSupplyChain: -0.3 } },

    // Consumer
    { id: 'PG', name: 'Procter & Gamble', category: 'Consumer', price: 150, basePrice: 150, volatility: 0.012, trend: 0, dna: { usEconomy: 0.8, globalStability: 0.3, inflation: -0.2 } },
    { id: 'UL', name: 'Unilever PLC', category: 'Consumer', price: 50, basePrice: 50, volatility: 0.014, trend: 0, dna: { euEconomy: 0.7, globalStability: 0.4, inflation: -0.3 } },
];

export const ASSETS: Record<string, Asset> = ASSETS_LIST.reduce((acc, asset) => {
    acc[asset.id] = { ...asset, priceHistory: [] };
    return acc;
}, {} as Record<string, Asset>);

export const COMPANY_TYPES: Record<CompanyType, CompanyData> = {
    tech: { baseCost: 2000000, baseIncome: 50000, upgradeCostMultiplier: 1.8, incomeMultiplier: 1.7 },
    mining: { baseCost: 5000000, baseIncome: 120000, upgradeCostMultiplier: 2.0, incomeMultiplier: 1.6 },
    pharma: { baseCost: 8000000, baseIncome: 150000, upgradeCostMultiplier: 1.9, incomeMultiplier: 1.8 },
    media: { baseCost: 1000000, baseIncome: 30000, upgradeCostMultiplier: 1.6, incomeMultiplier: 1.5 },
    finance: { baseCost: 3000000, baseIncome: 75000, upgradeCostMultiplier: 1.7, incomeMultiplier: 1.6 },
    real_estate: { baseCost: 10000000, baseIncome: 180000, upgradeCostMultiplier: 2.2, incomeMultiplier: 1.5 },
};

export const getInitialState = (): GameState => {
    const initialGlobalFactors: GlobalFactors = {
        globalStability: 0.6, usEconomy: 0.7, chinaEconomy: 0.8, euEconomy: 0.6,
        japanEconomy: 0.5, indiaEconomy: 0.7, russiaEconomy: 0.4, middleEastTension: 0.6,
        asiaTensions: 0.5, techInnovation: 0.7, globalSupplyChain: 0.5, oilSupply: 0.6,
        usFedPolicy: 0.5, secRegulation: 0.5, usJobGrowth: 0.6, publicSentiment: 0.5,
        climateChangeImpact: 0.3, pharmaDemand: 0.6, inflation: 0.5,
    };

    return {
        date: { year: 2024, month: 1, day: 1, hour: 0, dayProgress: 0 },
        gameSpeed: 1,
        isPaused: true,
        isSimulating: false,
        assets: JSON.parse(JSON.stringify(ASSETS)), // Deep copy
        globalFactors: initialGlobalFactors,
        player: {
            name: '',
            cash: 1000000,
            portfolio: {},
            marginPositions: {},
            companies: [],
            loan: { 
                amount: 0, 
                interestRate: 0.05,
                defermentsUsed: 0,
                isDeferredThisMonth: false
            },
            politicalCapital: {},
            currentResidency: '', // To be set by player
            residencyHistory: [],
            log: [],
            pendingOrders: [],
        },
        newsTicker: [],
        newsArchive: [],
        majorEvent: null,
        majorEventQueue: [],
        dailyNewsSchedule: [],
        priceUpdateAccumulator: 0,
        language: 'en',
    };
};