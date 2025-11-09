// game/engine.ts
import { GameState, Asset, MajorEvent, NewsItem, GlobalFactors, Country, Company } from "./types";
import { t } from './translations';

export const DAY_DURATION_MS = 180000; // 3 minutes at 1x speed
export const PRICE_UPDATE_INTERVAL_MS = 15000; // 15 seconds

const BASE_TREND_FACTOR = 0.0005;
const INTERDAY_RANDOM_FACTOR = 0.005;

/**
 * Applies a small, random fluctuation to asset prices for intraday movement.
 */
export function applyIntradayNoise(assets: Record<string, Asset>): Record<string, Asset> {
    const newAssets = { ...assets };
    for (const assetId in newAssets) {
        const asset = newAssets[assetId];
        const noise = (Math.random() - 0.5) * 2; // -1 to 1
        const changePercent = noise * asset.volatility * 0.05;
        asset.price *= (1 + changePercent);

        if(asset.price < 0.000001) asset.price = 0;
    }
    return newAssets;
}

/**
 * Calculates the major overnight price change for all assets based on global factors and asset DNA.
 */
export function updateAllPrices(state: GameState): Record<string, Asset> {
    const newAssets = { ...state.assets };
    const factorChanges: Record<string, number> = {};

    for (const factor in state.globalFactors) {
        factorChanges[factor] = (Math.random() - 0.5) * 0.1;
    }

    for (const assetId in newAssets) {
        const asset = newAssets[assetId];
        let dnaBasedChange = 0;

        for (const factor in asset.dna) {
            const sensitivity = asset.dna[factor as keyof typeof asset.dna]!;
            const change = factorChanges[factor] || 0;
            dnaBasedChange += sensitivity * change;
        }

        const randomShock = (Math.random() - 0.5) * INTERDAY_RANDOM_FACTOR;
        const trend = asset.trend * BASE_TREND_FACTOR;

        const totalChangePercent = (dnaBasedChange / 20) + randomShock + trend;
        
        asset.basePrice *= (1 + totalChangePercent);
        asset.price = asset.basePrice;
        if(asset.price < 0.000001) {
            asset.price = 0;
            asset.basePrice = 0;
        }
        newAssets[assetId] = asset;
    }
    return newAssets;
}

export const generateElectionEvent = (country: Country, year: number, language: 'en' | 'fa'): MajorEvent => {
    const isDemocratWinner = Math.random() > 0.5;
    const winner = isDemocratWinner ? country.politicalParties[0].name : country.politicalParties[1].name;
    
    return {
        title: t('election_title', language, { country: country.name, year }),
        // FIX: Cast string literal to `any` to satisfy the type of `key` for the `t` function.
        description: t('election_desc' as any, language, { winner }),
        effects: isDemocratWinner 
            ? { secRegulation: 0.1, pharmaDemand: 0.05, climateChangeImpact: -0.05, usEconomy: 0.02 } 
            : { secRegulation: -0.1, oilSupply: 0.05, usEconomy: -0.02, globalStability: -0.05 },
    };
};

/**
 * Generates major and minor events for the day.
 */
export function processEvents(state: GameState): Partial<GameState> {
    const newState: Partial<GameState> = {};
    let newGlobalFactors = { ...state.globalFactors };
    
    if (Math.random() < 0.01) {
        const majorEvent: MajorEvent = {
            // FIX: Cast string literal to `any` to satisfy the type of `key` for the `t` function.
            title: t('event_ai_breakthrough_title' as any, state.language),
            // FIX: Cast string literal to `any` to satisfy the type of `key` for the `t` function.
            description: t('event_ai_breakthrough_desc' as any, state.language),
            effects: { techInnovation: 0.15, publicSentiment: 0.1 }
        };
        newState.majorEventQueue = [...state.majorEventQueue, majorEvent];
        for(const effect in majorEvent.effects) {
            const factor = effect as keyof typeof newGlobalFactors;
            newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] + majorEvent.effects[factor]!));
        }
    }

    // Scam check
    const scamAsset = Object.values(state.assets).find(a => a.isScam);
    if (scamAsset && scamAsset.price > 0.01 && Math.random() < 0.005) { // ~0.5% chance per day
        const scamEvent: MajorEvent = {
            // FIX: Cast string literal to `any` to satisfy the type of `key` for the `t` function.
            title: t('event_scam_title' as any, state.language, { assetName: scamAsset.name }),
            // FIX: Cast string literal to `any` to satisfy the type of `key` for the `t` function.
            description: t('event_scam_desc' as any, state.language, { assetName: scamAsset.name }),
            effects: { publicSentiment: -0.2, secRegulation: 0.1, russiaEconomy: -0.1 }
        };
        newState.majorEventQueue = [...state.majorEventQueue, scamEvent];
        const newAssets = { ...state.assets };
        newAssets[scamAsset.id].price = 0.0001;
        newAssets[scamAsset.id].basePrice = 0.0001;
        newAssets[scamAsset.id].trend = -1; // Ensure it stays dead
        newState.assets = newAssets;
    }


    newState.globalFactors = newGlobalFactors;
    return newState;
}

const minorNewsKeys = ['mn1', 'mn2', 'mn3', 'mn4', 'mn5', 'mn6', 'mn7', 'mn8'];

export function generateDailyNewsSchedule(state: GameState): { schedule: GameState['dailyNewsSchedule'], factors: GlobalFactors } {
    const schedule: GameState['dailyNewsSchedule'] = [];
    const newFactors = { ...state.globalFactors };
    const numberOfNews = Math.floor(Math.random() * 4) + 2; // 2 to 5 news items

    for (let i = 0; i < numberOfNews; i++) {
        const randomHour = Math.floor(Math.random() * 24);
        const randomNewsKey = minorNewsKeys[Math.floor(Math.random() * minorNewsKeys.length)];
        
        schedule.push({
            triggerHour: randomHour,
            news: { 
                id: `${randomNewsKey}-${state.date.day}-${i}`,
                headline: t(`${randomNewsKey}_headline` as any, state.language),
                source: t(`${randomNewsKey}_source` as any, state.language),
             },
            triggered: false,
        });
    }
    
    newFactors.publicSentiment = Math.max(0, Math.min(1, newFactors.publicSentiment + (Math.random() - 0.5) * 0.01));

    return { schedule, factors: newFactors };
}

export function generatePositiveCompanyNews(company: Company, language: 'en' | 'fa'): NewsItem {
    const key = `cn${company.type}` as any;
    return {
        id: `comp-${company.id}-${Date.now()}`,
        headline: t(key, language, { companyName: company.name }),
        source: company.name,
    };
}