// game/engine.ts
// Fix: Imported GlobalFactors type to resolve name not found error.
import { GameState, Asset, MajorEvent, NewsItem, GlobalFactors } from "./types";

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
        // Volatility is a major driver of intraday noise, crypto is much noisier
        const changePercent = noise * asset.volatility * 0.05;
        asset.price *= (1 + changePercent);
    }
    return newAssets;
}

/**
 * Calculates the major overnight price change for all assets based on global factors and asset DNA.
 */
export function updateAllPrices(state: GameState): Record<string, Asset> {
    const newAssets = { ...state.assets };
    const factorChanges: Record<string, number> = {};

    // For simplicity, we'll simulate some random factor changes each day.
    // A more complex system would have these driven by events.
    for (const factor in state.globalFactors) {
        factorChanges[factor] = (Math.random() - 0.5) * 0.1; // Small random change
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
        
        // Update base price for the next day
        asset.basePrice *= (1 + totalChangePercent);
        // Set current price to the new day's base price
        asset.price = asset.basePrice;

        newAssets[assetId] = asset;
    }
    return newAssets;
}

/**
 * Generates major and minor events for the day.
 */
export function processEvents(state: GameState): Partial<GameState> {
    const newState: Partial<GameState> = {};
    let newGlobalFactors = { ...state.globalFactors };
    
    // Placeholder for a much more complex event engine
    // ~1% chance of a major event each day
    if (Math.random() < 0.01) {
        const majorEvent: MajorEvent = {
            title: "Global Tech Summit Announces Breakthrough in AI",
            description: "A major breakthrough in artificial intelligence has been announced, promising to revolutionize various industries. Tech stocks are expected to react strongly.",
            effects: { techInnovation: 0.15, publicSentiment: 0.1 }
        };
        newState.majorEventQueue = [...state.majorEventQueue, majorEvent];
        for(const effect in majorEvent.effects) {
            const factor = effect as keyof typeof newGlobalFactors;
            newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] + majorEvent.effects[factor]!));
        }
    }

    newState.globalFactors = newGlobalFactors;
    return newState;
}

// A pool of low-impact news headlines for daily flavour
const minorNewsPool: NewsItem[] = [
    { id: 'mn1', source: 'Market Watch', headline: 'Analysts debate the impact of recent inflation data on consumer spending.' },
    { id: 'mn2', source: 'Global Trade Org', headline: 'Minor disruptions reported in key shipping lanes, but supply chains remain stable.' },
    { id: 'mn3', source: 'Tech Chronicle', headline: 'Speculation grows about the next generation of consumer electronics.' },
    { id: 'mn4', source: 'Energy Tribune', headline: 'OPEC+ meeting concludes with no change to production quotas.' },
    { id: 'mn5', source: 'Financial Times', headline: 'Central bank hints at maintaining current interest rates for the foreseeable future.' },
    { id: 'mn6', source: 'Pharma Journal', headline: 'Early-stage clinical trial for a new drug shows promising, but inconclusive, results.' },
    { id: 'mn7', source: 'World News', headline: 'Diplomatic talks between two nations conclude with a statement of mutual cooperation.' },
    { id: 'mn8', source: 'Economic Forum', headline: 'New report suggests a slight increase in global manufacturing output.' },
];

export function generateDailyNewsSchedule(state: GameState): { schedule: GameState['dailyNewsSchedule'], factors: GlobalFactors } {
    const schedule: GameState['dailyNewsSchedule'] = [];
    const newFactors = { ...state.globalFactors };
    const numberOfNews = Math.floor(Math.random() * 4) + 1; // 1 to 4 news items

    for (let i = 0; i < numberOfNews; i++) {
        const randomHour = Math.floor(Math.random() * 16) + 8; // 8 AM to 11 PM
        const randomNews = minorNewsPool[Math.floor(Math.random() * minorNewsPool.length)];
        schedule.push({
            triggerHour: randomHour,
            news: { ...randomNews, id: `${randomNews.id}-${state.date.day}-${i}` },
            triggered: false,
        });
    }
    
    // Very small random impact just for flavour
    newFactors.publicSentiment = Math.max(0, Math.min(1, newFactors.publicSentiment + (Math.random() - 0.5) * 0.01));

    return { schedule, factors: newFactors };
}