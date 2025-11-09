// game/reducer.ts
import { GameState, GameAction, PortfolioItem, MarginPosition, Company, LogEntry, CompanyEffect, UpgradeOutcome, GlobalFactor, AssetCategory, CorporateAction, CompanyEffectType, Asset } from './types';
import { getInitialState, COMPANY_TYPES, COUNTRIES, ASSETS } from './database';
import { DAY_DURATION_MS, PRICE_UPDATE_INTERVAL_MS, applyIntradayNoise, updateAllPrices, processEvents, generateDailyNewsSchedule, generateElectionEvent, generatePositiveCompanyNews } from './engine';
import { t } from './translations';

const MAX_HISTORY = 365; // Store up to 1 year of price data

const advanceDayCycle = (state: GameState): GameState => {
    const nextDay = new Date(state.date.year, state.date.month - 1, state.date.day + 1);
            
    let playerCash = state.player.cash;
    const newCompanies = JSON.parse(JSON.stringify(state.player.companies)) as Company[];
    let newLog = [...state.player.log];
    let newLoan = { ...state.player.loan };

    if (nextDay.getDate() === 1) { // Monthly tasks
        const country = COUNTRIES.find(c => c.id === state.player.currentResidency);
        const countryTax = country?.taxRate || 0;

        // Corporate Income & Taxes
        let totalIncome = 0;
        newCompanies.forEach(company => {
            let companyIncome = company.monthlyIncome;
            let effectiveTaxRate = countryTax;
            
            // Process effects
            const newEffects: CompanyEffect[] = [];
            company.effects.forEach(effect => {
                if (effect.type === 'income_halt') {
                    companyIncome = 0;
                }
                if (effect.type === 'tax_break') {
                    effectiveTaxRate *= 0.5; // 50% tax break
                }
                
                effect.durationMonths -= 1;
                if (effect.durationMonths > 0) {
                    newEffects.push(effect);
                } else {
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Effect '${effect.type}' has expired for ${company.name}.`});
                }
            });
            company.effects = newEffects;
            
            totalIncome += companyIncome;
            const taxAmount = companyIncome * effectiveTaxRate;
            playerCash -= taxAmount;
            if(taxAmount > 0) {
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Paid $${taxAmount.toFixed(2)} in taxes for ${company.name}.`});
            }
        });
        playerCash += totalIncome;
        if(totalIncome > 0) {
            newLog.push({id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Received $${totalIncome.toFixed(2)} in monthly income.`});
        }
        
        // Loan Payment Logic
        if (newLoan.amount > 0) {
            if (newLoan.isDeferredThisMonth) {
                const penalty = 2299;
                playerCash -= penalty;
                newLoan.interestRate += 0.0015; // Changed from 1.5% to 0.15% monthly
                newLoan.defermentsUsed += 1;
                newLoan.isDeferredThisMonth = false; // Reset for next month
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('loanDefermentPenalty', state.language, { penalty: penalty.toFixed(2)})});
            } else {
                const monthlyInterest = newLoan.amount * (newLoan.interestRate / 12);
                const principalPayment = newLoan.amount * 0.02; // Pay 2% of principal each month
                const totalPayment = monthlyInterest + principalPayment;

                if (playerCash >= totalPayment) {
                    playerCash -= totalPayment;
                    newLoan.amount -= principalPayment;
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('monthlyLoanPayment', state.language, {amount: totalPayment.toFixed(2)})});
                } else {
                    // Not enough cash for payment - could add a penalty here in future
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: `Failed to make monthly loan payment of $${totalPayment.toFixed(2)} due to insufficient funds.`});
                }
            }
        }
    }

    const eventsResult = processEvents(state);
    const newsScheduleResult = generateDailyNewsSchedule(state);

    // Check for elections
    for (const country of COUNTRIES) {
        if (country.electionCycle && (nextDay.getFullYear() % country.electionCycle.interval === 0) && country.electionCycle.year <= nextDay.getFullYear() && country.electionCycle.month === (nextDay.getMonth() + 1)) {
            const electionEvent = generateElectionEvent(country, nextDay.getFullYear(), state.language);
            eventsResult.majorEventQueue = [...(eventsResult.majorEventQueue || []), electionEvent];
        }
    }
    
    // Player company influence
    newCompanies.forEach(company => {
        if (company.level >= 5) {
            const influenceChance = (company.level - 4) * 0.02; // 2% chance per level above 4
            if (Math.random() < influenceChance) {
                const positiveNews = generatePositiveCompanyNews(company, state.language);
                newsScheduleResult.schedule.push({
                    triggerHour: Math.floor(Math.random() * 12) + 8,
                    news: positiveNews,
                    triggered: false,
                });
            }
        }
    });

    const newNewsArchive = [...state.newsTicker, ...state.newsArchive].slice(0, 50);

    const priceUpdatedState = { ...state, ...eventsResult };
    const newAssets = updateAllPrices(priceUpdatedState);

    // --- RECORD PRICE HISTORY ---
    const dateRecord = { year: state.date.year, month: state.date.month, day: state.date.day };
    for (const assetId in newAssets) {
        const asset = newAssets[assetId];
        asset.priceHistory.push({ date: dateRecord, price: asset.price });
        if (asset.priceHistory.length > MAX_HISTORY) {
            asset.priceHistory.shift();
        }
    }

    return {
        ...state,
        date: {
            year: nextDay.getFullYear(),
            month: nextDay.getMonth() + 1,
            day: nextDay.getDate(),
            hour: 0,
            dayProgress: 0,
        },
        assets: newAssets,
        globalFactors: newsScheduleResult.factors,
        majorEvent: eventsResult.majorEventQueue.length > 0 ? eventsResult.majorEventQueue[0] : null,
        majorEventQueue: eventsResult.majorEventQueue.slice(1),
        dailyNewsSchedule: newsScheduleResult.schedule,
        newsTicker: [],
        newsArchive: newNewsArchive,
        player: {
            ...state.player,
            cash: playerCash,
            companies: newCompanies,
            loan: newLoan,
            log: newLog,
        },
    };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'LOAD_STATE':
            // "Revive" the date object after loading from JSON
            const loadedState = action.payload;
            loadedState.date = new Date(loadedState.date as any) as unknown as GameState['date'];
            return loadedState;

        case 'SET_PAUSED':
            return { ...state, isPaused: action.payload };
        
        case 'SET_SPEED':
            return { ...state, gameSpeed: action.payload };

        case 'SET_LANGUAGE':
            // Regenerate daily news with new language
            const newsScheduleResult = generateDailyNewsSchedule({ ...state, language: action.payload });
            return { 
                ...state, 
                language: action.payload,
                dailyNewsSchedule: newsScheduleResult.schedule,
                newsTicker: [], // Clear old ticker
            };
        
        case 'TICK': {
            if (state.isPaused || state.isSimulating) return state;

            const { deltaTime } = action.payload;
            const newDayProgress = state.date.dayProgress + (deltaTime * state.gameSpeed) / DAY_DURATION_MS;
            
            const newState = { ...state };
            let newPriceAccumulator = state.priceUpdateAccumulator + (deltaTime * state.gameSpeed);

            if (newPriceAccumulator >= PRICE_UPDATE_INTERVAL_MS) {
                newState.assets = applyIntradayNoise(state.assets);
                newPriceAccumulator = 0;
                 // --- PENDING ORDER EXECUTION LOGIC ---
                const triggeredOrders = [];
                const remainingOrders = [];
                let playerCash = newState.player.cash;
                const playerPortfolio = { ...newState.player.portfolio };
                let playerLog = [...newState.player.log];

                for (const order of newState.player.pendingOrders) {
                    const asset = newState.assets[order.assetId];
                    if (!asset) {
                        remainingOrders.push(order);
                        continue;
                    };

                    let triggered = false;
                    if (order.type === 'buy-limit' && asset.price <= order.limitPrice) {
                        triggered = true;
                    } else if (order.type === 'sell-limit' && asset.price >= order.limitPrice) {
                        triggered = true;
                    }

                    if (triggered) {
                        triggeredOrders.push(order);
                        const price = order.limitPrice; // Execute at the limit price
                        const quantity = order.quantity;

                        if (order.type === 'buy-limit') {
                            const totalCost = quantity * price;
                            if (playerCash >= totalCost) {
                                playerCash -= totalCost;
                                const existingItem = playerPortfolio[order.assetId];
                                const newPortfolioItem: PortfolioItem = {
                                    assetId: order.assetId,
                                    quantity: (existingItem?.quantity || 0) + quantity,
                                    costBasis: existingItem
                                        ? (existingItem.costBasis * existingItem.quantity + totalCost) / (existingItem.quantity + quantity)
                                        : price,
                                };
                                playerPortfolio[order.assetId] = newPortfolioItem;
                                playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'trade', message: `Executed Buy Limit: ${quantity} ${order.assetId} @ $${price.toFixed(2)}` });
                            } else {
                                remainingOrders.push(order); // Not enough cash, keep order
                                playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'system', message: `Buy Limit for ${order.assetId} failed: insufficient funds.` });
                            }
                        } else { // sell-limit
                            const existingItem = playerPortfolio[order.assetId];
                            if (existingItem && existingItem.quantity >= quantity) {
                                const totalProceeds = quantity * price;
                                playerCash += totalProceeds;
                                existingItem.quantity -= quantity;
                                if (existingItem.quantity === 0) {
                                    delete playerPortfolio[order.assetId];
                                }
                                playerLog.push({ id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Executed Sell Limit: ${quantity} ${order.assetId} @ $${price.toFixed(2)}` });
                            } else {
                                // Not enough assets to sell, cancel the order
                                playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'system', message: `Sell Limit for ${order.assetId} cancelled: insufficient assets.` });
                            }
                        }
                    } else {
                        remainingOrders.push(order);
                    }
                }

                if (triggeredOrders.length > 0) {
                    newState.player = {
                        ...newState.player,
                        cash: playerCash,
                        portfolio: playerPortfolio,
                        log: playerLog,
                        pendingOrders: remainingOrders,
                    };
                }
                // --- END PENDING ORDER LOGIC ---
            }
            
            // Check for scheduled news
            const currentHour = Math.floor(newDayProgress * 24);
            const newSchedule = [...state.dailyNewsSchedule];
            let newTicker = [...state.newsTicker];
            let newsAdded = false;
            newSchedule.forEach(item => {
                if (!item.triggered && currentHour >= item.triggerHour) {
                    item.triggered = true;
                    newTicker.push(item.news);
                    newsAdded = true;
                }
            });

            if (newDayProgress >= 1) {
                // Return a new state to trigger ADVANCE_DAY effect in App.tsx
                return { ...state, date: { ...state.date, dayProgress: 1 } };
            }

            return {
                ...newState,
                date: { ...newState.date, dayProgress: newDayProgress, hour: currentHour },
                priceUpdateAccumulator: newPriceAccumulator,
                dailyNewsSchedule: newSchedule,
                newsTicker: newsAdded ? newTicker : state.newsTicker,
            };
        }
        
        case 'ADVANCE_DAY': {
            return advanceDayCycle(state);
        }

        case 'SKIP_DAYS': {
            const { days } = action.payload;
            let intermediateState: GameState = { ...state, isSimulating: true, isPaused: true };
            
            for (let i = 0; i < days; i++) {
                intermediateState = advanceDayCycle(intermediateState);
            }

            return { ...intermediateState, isSimulating: false, isPaused: false };
        }

        case 'SET_INITIAL_STATE': {
            const { countryId, playerName } = action.payload;
            const politicalCapital = { [countryId]: 100 };
            const newsSchedule = generateDailyNewsSchedule(state);
            return {
                ...state,
                isPaused: false,
                dailyNewsSchedule: newsSchedule.schedule,
                player: {
                    ...state.player,
                    name: playerName,
                    currentResidency: countryId,
                    residencyHistory: [countryId],
                    politicalCapital: politicalCapital
                }
            };
        }

        case 'SPOT_TRADE': {
            const { assetId, quantity, price, type } = action.payload;
            const currentPortfolio = { ...state.player.portfolio };
            const existingItem = currentPortfolio[assetId];

            if (type === 'buy') {
                const totalCost = quantity * price;
                if (state.player.cash < totalCost) return state; // Not enough cash

                const newPortfolioItem: PortfolioItem = {
                    assetId,
                    quantity: (existingItem?.quantity || 0) + quantity,
                    costBasis: existingItem
                        ? (existingItem.costBasis * existingItem.quantity + totalCost) / (existingItem.quantity + quantity)
                        : price,
                };
                currentPortfolio[assetId] = newPortfolioItem;
                const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Bought ${quantity} ${assetId} @ $${price.toFixed(2)}` };
                return { ...state, player: { ...state.player, cash: state.player.cash - totalCost, portfolio: currentPortfolio, log: [...state.player.log, newLogEntry] } };
            } else { // sell
                if (!existingItem || existingItem.quantity < quantity) return state; // Not enough shares

                const totalProceeds = quantity * price;
                existingItem.quantity -= quantity;

                if (existingItem.quantity === 0) {
                    delete currentPortfolio[assetId];
                }
                const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Sold ${quantity} ${assetId} @ $${price.toFixed(2)}` };
                return { ...state, player: { ...state.player, cash: state.player.cash + totalProceeds, portfolio: currentPortfolio, log: [...state.player.log, newLogEntry] } };
            }
        }

        case 'OPEN_MARGIN_POSITION': {
            const { assetId, quantity, price, leverage, type } = action.payload;
            const marginAmount = (quantity * price) / leverage;
            if (state.player.cash < marginAmount) return state;

            const newPosition: MarginPosition = {
                id: crypto.randomUUID(),
                assetId,
                quantity,
                entryPrice: price,
                leverage,
                type,
                margin: marginAmount,
            };

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Opened ${leverage}x ${type.toUpperCase()} on ${quantity} ${assetId} @ $${price.toFixed(2)}` };

            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - marginAmount,
                    marginPositions: { ...state.player.marginPositions, [newPosition.id]: newPosition },
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'CLOSE_MARGIN_POSITION': {
            const { positionId } = action.payload;
            const position = state.player.marginPositions[positionId];
            if (!position) return state;

            const currentPrice = state.assets[position.assetId].price;
            const entryValue = position.entryPrice * position.quantity;
            const currentValue = currentPrice * position.quantity;
            
            let pnl = 0;
            if (position.type === 'long') {
                pnl = currentValue - entryValue;
            } else { // short
                pnl = entryValue - currentValue;
            }

            const cashReturned = position.margin + pnl;
            const newPositions = { ...state.player.marginPositions };
            delete newPositions[positionId];

            const newLogEntry: LogEntry = {
                id: crypto.randomUUID(),
                date: state.date,
                type: 'trade',
                message: `Closed ${position.type.toUpperCase()} position on ${position.assetId} for a ${pnl >= 0 ? 'profit' : 'loss'} of $${Math.abs(pnl).toFixed(2)}`
            };

            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash + cashReturned,
                    marginPositions: newPositions,
                    log: [...state.player.log, newLogEntry]
                }
            };
        }
        
        case 'ANALYST_REPORT_PURCHASED': {
            const { cost, message } = action.payload;
            if (state.player.cash < cost) return state;

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'system', message };
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - cost,
                    log: [...state.player.log, newLogEntry],
                }
            };
        }
        
        case 'ESTABLISH_COMPANY': {
            const newCompany = action.payload;
            const cost = COMPANY_TYPES[newCompany.type].baseCost * (COUNTRIES.find(c => c.id === state.player.currentResidency)?.companyCostModifier || 1);
            if (state.player.cash < cost) return state;

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Established new company '${newCompany.name}' for $${cost.toFixed(2)}.` };

            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - cost,
                    companies: [...state.player.companies, newCompany],
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'UPGRADE_COMPANY': {
            const { companyId, cost, outcome } = action.payload;
            const companies = [...state.player.companies];
            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return state;
            
            let finalCost = cost;
            let logMessage = '';

            const company = { ...companies[companyIndex] };

            switch (outcome) {
                case 'success':
                    company.level += 1;
                    logMessage = `Successfully upgraded '${company.name}' to Level ${company.level}.`;
                    break;
                case 'critical_success':
                    company.level += 2;
                    finalCost *= 0.5; // 50% refund
                    logMessage = `Critical success! Upgraded '${company.name}' to Level ${company.level} and received a 50% refund.`;
                    break;
                case 'complication_cost':
                    company.level += 1;
                    finalCost *= 1.1; // 10% more expensive
                    logMessage = `Complication! Upgrade for '${company.name}' cost 10% more than expected.`;
                    break;
                case 'complication_delay':
                    company.effects.push({ type: 'income_halt', durationMonths: 1 });
                    logMessage = `Complication! Upgrade for '${company.name}' caused a construction delay. Income is halted for 1 month.`;
                    break;
            }
            
            if (state.player.cash < finalCost) return state;

            const companyData = COMPANY_TYPES[company.type];
            company.monthlyIncome = companyData.baseIncome * Math.pow(companyData.incomeMultiplier, company.level - 1);
            
            companies[companyIndex] = company;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: logMessage };
            
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - finalCost,
                    companies,
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'EXECUTE_CORPORATE_ACTION': {
            const { companyId, type, cost } = action.payload;
            if (state.player.cash < cost) return state;

            const companies = [...state.player.companies];
            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return state;
            
            const company = { ...companies[companyIndex] };
            let logMessage = '';
            let newGlobalFactors = { ...state.globalFactors };
            let newNewsSchedule = [...state.dailyNewsSchedule];
            let success = Math.random() < 0.8; // 80% success chance for corporate actions

            if (type === 'marketing') {
                if (success) {
                    const positiveNews = generatePositiveCompanyNews(company, state.language);
                    newNewsSchedule.push({ triggerHour: state.date.hour + 1, news: positiveNews, triggered: false });
                    logMessage = `Marketing campaign for ${company.name} was a success, generating positive press.`;
                } else {
                    logMessage = `Marketing campaign for ${company.name} failed to generate significant interest.`;
                }
            } else if (type === 'research') {
                 if (success) {
                    newGlobalFactors.techInnovation = Math.min(1, newGlobalFactors.techInnovation + 0.05);
                    logMessage = `R&D investment by ${company.name} has led to a breakthrough, boosting tech innovation.`;
                } else {
                    logMessage = `R&D investment by ${company.name} did not yield any immediate breakthroughs.`;
                }
            } else if (type === 'lobbying') {
                 if (success) {
                    company.effects.push({ type: 'tax_break', durationMonths: 3 });
                    logMessage = `${company.name} has successfully lobbied for a 3-month tax break.`;
                } else {
                    logMessage = `Lobbying efforts by ${company.name} were unsuccessful.`;
                }
            }
            
            companies[companyIndex] = company;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: logMessage };

            return {
                ...state,
                globalFactors: newGlobalFactors,
                dailyNewsSchedule: newNewsSchedule,
                player: {
                    ...state.player,
                    cash: state.player.cash - cost,
                    companies: companies,
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'TAKE_LOAN':
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash + action.payload,
                    loan: { ...state.player.loan, amount: state.player.loan.amount + action.payload }
                }
            };
        
        case 'REPAY_LOAN': {
            const amountToPay = action.payload;
            const amountToClear = Math.min(amountToPay * 1.02, state.player.loan.amount); // 2% bonus, can't clear more than total loan
            
            if(state.player.cash < amountToPay) return state;

            const bonusAmount = amountToClear - amountToPay;
            const newLogEntry: LogEntry = {
                id: crypto.randomUUID(),
                date: state.date,
                type: 'loan',
                message: t('loanRepaymentDiscount', state.language, { amount: amountToClear.toFixed(2), savedAmount: bonusAmount.toFixed(2), paidAmount: amountToPay.toFixed(2) })
            };
            
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - amountToPay,
                    loan: { ...state.player.loan, amount: state.player.loan.amount - amountToClear },
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'DEFER_LOAN_PAYMENT': {
             if (state.player.loan.defermentsUsed >= 24) return state; // Max deferments reached
             if (state.player.loan.isDeferredThisMonth) return state; // Already deferred

             return {
                 ...state,
                 player: {
                     ...state.player,
                     loan: { ...state.player.loan, isDeferredThisMonth: true },
                 }
             }
        }

        case 'CHANGE_RESIDENCY': {
            const { countryId, cost } = action.payload;
            if (state.player.cash < cost) return state;
            const residencyHistorySet = new Set(state.player.residencyHistory);
            residencyHistorySet.add(countryId);

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'system', message: `Changed residency to ${countryId} for $${cost.toFixed(2)}.` };
            
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - cost,
                    currentResidency: countryId,
                    residencyHistory: Array.from(residencyHistorySet),
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'EXECUTE_POLITICAL_ACTION': {
            const { type, countryId, amount, party } = action.payload as { type: 'donate', countryId: string, party: string, amount: number }; // Assuming only donate for now
            if (type === 'donate') {
                if (state.player.cash < amount) return state;
                const pcGain = Math.floor(amount / 10000); // 1 PC per 10k donated
                const newPoliticalCapital = { ...state.player.politicalCapital };
                newPoliticalCapital[countryId] = (newPoliticalCapital[countryId] || 0) + pcGain;
                
                const newLogEntry: LogEntry = {
                    id: crypto.randomUUID(),
                    date: state.date,
                    type: 'politics',
                    message: `Donated $${amount.toFixed(2)} to ${party} in ${countryId}, gaining ${pcGain} Political Capital.`
                };

                return {
                    ...state,
                    player: {
                        ...state.player,
                        cash: state.player.cash - amount,
                        politicalCapital: newPoliticalCapital,
                        log: [...state.player.log, newLogEntry]
                    }
                };
            }
            return state;
        }

        case 'EXECUTE_LOCAL_LOBBY': {
            const { category, costPC } = action.payload;
            const currentPC = state.player.politicalCapital[state.player.currentResidency] || 0;
            if (currentPC < costPC) return state;

            const newPoliticalCapital = { ...state.player.politicalCapital };
            newPoliticalCapital[state.player.currentResidency] -= costPC;

            let logMessage = '';
            const success = Math.random() < 0.75; // 75% success chance

            if (success) {
                // Find assets in this category and give a temporary boost to their trend
                const newAssets = { ...state.assets };
                Object.values(newAssets).forEach(asset => {
                    if(asset.category === category) {
                        asset.trend += 0.0005; // a small but significant boost
                    }
                });
                logMessage = `Successfully lobbied for the ${category} industry, boosting its outlook.`;
            } else {
                logMessage = `Lobbying efforts for the ${category} industry failed to pass.`;
            }
            
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'politics', message: logMessage };

            return {
                ...state,
                player: {
                    ...state.player,
                    politicalCapital: newPoliticalCapital,
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'EXECUTE_GLOBAL_INFLUENCE': {
            const { factor, direction, costPC, costCash } = action.payload;
            const totalPC = Object.values(state.player.politicalCapital).reduce((sum, val) => sum + val, 0);
            if (totalPC < costPC || state.player.cash < costCash) {
                return state;
            }

            // Distribute PC cost across all residencies
            let remainingPCCost = costPC;
            const newPoliticalCapital = { ...state.player.politicalCapital };
            for(const countryId in newPoliticalCapital) {
                const pcInCountry = newPoliticalCapital[countryId];
                const deduction = Math.min(pcInCountry, remainingPCCost);
                newPoliticalCapital[countryId] -= deduction;
                remainingPCCost -= deduction;
                if(remainingPCCost <= 0) break;
            }

            const newCash = state.player.cash - costCash;
            const rand = Math.random();
            let logMessage = '';
            let newGlobalFactors = { ...state.globalFactors };

            const effectStrength = 0.05; // 5% change on success
            const effect = direction === 'promote' ? effectStrength : -effectStrength;

            if (rand < 0.70) { // Success
                newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] + effect));
                logMessage = t('influence_success', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) });
            } else if (rand < 0.90) { // Failure
                logMessage = t('influence_fail', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) });
            } else { // Backfire
                newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] - effect));
                logMessage = t('influence_backfire', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) });
            }

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'politics', message: logMessage };

            return {
                ...state,
                globalFactors: newGlobalFactors,
                player: {
                    ...state.player,
                    cash: newCash,
                    politicalCapital: newPoliticalCapital,
                    log: [...state.player.log, newLogEntry]
                }
            };
        }
        
        case 'PLACE_PENDING_ORDER': {
            const order = action.payload;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Placed ${order.type} for ${order.quantity} ${order.assetId} @ $${order.limitPrice.toFixed(2)}` };

            return {
                ...state,
                player: {
                    ...state.player,
                    pendingOrders: [...state.player.pendingOrders, order],
                    log: [...state.player.log, newLogEntry]
                }
            };
        }

        case 'CANCEL_PENDING_ORDER': {
            const { orderId } = action.payload;
            const order = state.player.pendingOrders.find(o => o.id === orderId);
            if (!order) return state;

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Cancelled order for ${order.quantity} ${order.assetId}.` };
            
            return {
                ...state,
                player: {
                    ...state.player,
                    pendingOrders: state.player.pendingOrders.filter(o => o.id !== orderId),
                    log: [...state.player.log, newLogEntry]
                }
            };
        }
        
        case 'DISMISS_MAJOR_EVENT':
            return { ...state, majorEvent: null };

        default:
            return state;
    }
};