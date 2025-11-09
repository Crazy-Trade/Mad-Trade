// game/engine.ts
import { GameState, Asset, NewsItem, DailyNewsScheduleItem, MajorEvent, GlobalFactors, Country, Company, Language } from './types';
import { ASSETS, COUNTRIES } from './database';
import { t } from './translations';

export const DAY_DURATION_MS = 180000; // 3 minutes per day
export const PRICE_UPDATE_INTERVAL_MS = 15000; // Update prices every 15 seconds

export const applyIntradayNoise = (assets: Record<string, Asset>): Record<string, Asset> => {
    const newAssets = { ...assets };
    for (const assetId in newAssets) {
        const asset = { ...newAssets[assetId] };
        const noise = (Math.random() - 0.5) * asset.volatility * 0.1;
        asset.price *= (1 + noise);
        newAssets[assetId] = asset;
    }
    return newAssets;
};

export const updateAllPrices = (state: GameState): Record<string, Asset> => {
    const newAssets = { ...state.assets };
    for (const assetId in newAssets) {
        const asset = { ...newAssets[assetId] };
        let priceChange = asset.trend;
        
        for (const factor in asset.dna) {
            const factorInfluence = asset.dna[factor as keyof typeof asset.dna]!;
            const factorValue = state.globalFactors[factor as keyof GlobalFactors];
            priceChange += (factorValue - 0.5) * factorInfluence * 0.001;
        }

        const randomFactor = (Math.random() - 0.5) * asset.volatility;
        priceChange += randomFactor * 0.1;
        
        asset.price *= (1 + priceChange);
        asset.price = Math.max(0.00000001, asset.price);
        asset.basePrice = asset.price; // Update base price for next day's 24h change calc
        newAssets[assetId] = asset;
    }
    return newAssets;
};

export const processEvents = (state: GameState): { majorEventQueue: MajorEvent[], globalFactors: GlobalFactors } => {
    const majorEventQueue = [...state.majorEventQueue];
    const globalFactors = { ...state.globalFactors };
    const eventPool: MajorEvent[] = [
        { titleKey: 'event_tech_summit_title', descriptionKey: 'event_tech_summit_desc', effects: { techInnovation: 0.2, publicSentiment: 0.1 } },
        { titleKey: 'event_us_fed_hike_title', descriptionKey: 'event_us_fed_hike_desc', effects: { usFedPolicy: -0.3, usEconomy: -0.1, globalStability: -0.1 } },
        { titleKey: 'event_china_5_year_plan_title', descriptionKey: 'event_china_5_year_plan_desc', effects: { chinaEconomy: 0.2, techInnovation: 0.1 } },
        { titleKey: 'event_eu_trade_deal_title', descriptionKey: 'event_eu_trade_deal_desc', effects: { euEconomy: 0.15, globalSupplyChain: 0.1 } },
        { titleKey: 'event_opec_cuts_title', descriptionKey: 'event_opec_cuts_desc', effects: { oilSupply: -0.4, middleEastTension: 0.1 } },
        { titleKey: 'event_cyber_attack_title', descriptionKey: 'event_cyber_attack_desc', effects: { globalStability: -0.2, secRegulation: 0.1, techInnovation: -0.05 } },
        { titleKey: 'event_green_energy_title', descriptionKey: 'event_green_energy_desc', effects: { techInnovation: 0.15, oilSupply: 0.1, climateChangeImpact: 0.1 } },
        { titleKey: 'event_g7_summit_title', descriptionKey: 'event_g7_summit_desc', effects: { globalStability: 0.15, asiaTensions: -0.1, middleEastTension: -0.1 } },
        { titleKey: 'event_inflation_surprise_title', descriptionKey: 'event_inflation_surprise_desc', effects: { inflation: 0.2, usFedPolicy: -0.2, publicSentiment: -0.1 } },
    ];

    if (Math.random() < 0.35) { // 35% chance of a major event per day
        const event = eventPool[Math.floor(Math.random() * eventPool.length)];
        majorEventQueue.push(event);
    }
    
    // Apply effects from current event if any
    const currentEvent = state.majorEvent;
    if (currentEvent) {
        for (const factor in currentEvent.effects) {
            const key = factor as keyof GlobalFactors;
            globalFactors[key] = Math.max(0, Math.min(1, (globalFactors[key] || 0.5) + currentEvent.effects[key]!));
        }
    }
    
    // Factor decay/mean reversion
    for (const factor in globalFactors) {
        const key = factor as keyof GlobalFactors;
        globalFactors[key] += (0.5 - globalFactors[key]) * 0.05; // Slowly return to neutral
    }

    return { majorEventQueue, globalFactors };
};

export const generateDailyNewsSchedule = (state: GameState): { schedule: DailyNewsScheduleItem[], factors: GlobalFactors } => {
    const { language } = state;
    const schedule: DailyNewsScheduleItem[] = [];
    const factors = { ...state.globalFactors };
    
    const newsSources = ["Reuters", "Bloomberg", "Associated Press", "CNBC"];
    const assetIds = Object.keys(ASSETS);
    
    const numNews = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numNews; i++) {
        const randomAssetId = assetIds[Math.floor(Math.random() * assetIds.length)];
        const asset = ASSETS[randomAssetId];
        
        const headlineKeys = [
            'news_earnings_strong', 'news_investigation', 'news_positive_outlook', 
            'news_supply_concerns', 'news_buyback', 'news_regulatory_scrutiny',
            'news_consumer_confidence', 'news_new_competition'
        ];
        const headlineKey = headlineKeys[Math.floor(Math.random() * headlineKeys.length)];

        schedule.push({
            triggerHour: Math.floor(Math.random() * 12) + 8, // Between 8am and 8pm
            news: {
                id: crypto.randomUUID(),
                headline: t(headlineKey, language, { assetName: asset.name }),
                source: newsSources[Math.floor(Math.random() * newsSources.length)],
            },
            triggered: false,
        });
    }

    return { schedule, factors };
};

export const generateElectionEvent = (country: Country, year: number, language: Language): MajorEvent => {
    const winner = country.politicalParties[Math.floor(Math.random() * country.politicalParties.length)];
    const countryName = country.name; // Use the actual country name
    const winnerName = winner.name;
    
    return {
        titleKey: 'electionResults',
        // Pass parameters to the description translation key
        descriptionKey: t('election_description', language, { winnerName, countryName }),
        effects: { globalStability: -0.05, publicSentiment: Math.random() * 0.2 - 0.1 } // Add some sentiment shift
    };
};

export const generatePositiveCompanyNews = (company: Company, language: Language): NewsItem => {
    return {
        id: crypto.randomUUID(),
        headline: t('company_news_positive', language, { companyName: company.name }),
        source: "Business Wire"
    };
};