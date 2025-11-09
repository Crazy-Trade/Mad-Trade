// game/reducer.ts
// Fix: Import GameDate type to resolve 'Cannot find name' errors.
import { GameState, GameAction, PortfolioItem, MarginPosition, Company, LogEntry, CompanyEffect, UpgradeOutcome, GlobalFactor, AssetCategory, CorporateAction, CompanyEffectType, Asset, NewsItem, VentureLoan, TradeBan, GameDate } from './types';
import { getInitialState, COMPANY_TYPES, COUNTRIES, ASSETS } from './database';
import { DAY_DURATION_MS, PRICE_UPDATE_INTERVAL_MS, applyIntradayNoise, updateAllPrices, processEvents, generateDailyNewsSchedule, generateElectionEvent, generatePositiveCompanyNews } from './engine';
import { t } from './translations';

const MAX_HISTORY = 365; // Store up to 1 year of price data

function isDatePast(date1: GameDate, date2: GameDate) {
    if (date1.year > date2.year) return true;
    if (date1.year < date2.year) return false;
    if (date1.month > date2.month) return true;
    if (date1.month < date2.month) return false;
    return date1.day > date2.day;
}

const advanceDayCycle = (state: GameState): GameState => {
    const nextDay = new Date(state.date.year, state.date.month - 1, state.date.day + 1);
    const newDate = {
        year: nextDay.getFullYear(),
        month: nextDay.getMonth() + 1,
        day: nextDay.getDate(),
        hour: 0,
        dayProgress: 0,
    };
            
    let playerCash = state.player.cash;
    const newCompanies = JSON.parse(JSON.stringify(state.player.companies)) as Company[];
    let newLog = [...state.player.log];
    let newLoan = { ...state.player.loan };
    let newVentureLoans = [...state.player.ventureLoans];
    let newTradeBans = [...state.player.tradeBans].filter(ban => !isDatePast(newDate, ban.expiryDate));

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
            
            // Venture Loan Profit Sharing
            const linkedVentureLoan = newVentureLoans.find(vl => vl.companyId === company.id);
            if(linkedVentureLoan && linkedVentureLoan.profitShareRepaid < linkedVentureLoan.principal * 0.3) {
                const profitShare = companyIncome * 0.2;
                companyIncome -= profitShare;
                linkedVentureLoan.profitShareRepaid += profitShare;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('ventureLoanProfitShare', state.language, { amount: profitShare.toFixed(2), companyName: company.name})});
            }

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
                newLoan.interestRate += 0.0015;
                newLoan.defermentsUsed += 1;
                newLoan.isDeferredThisMonth = false;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('loanDefermentPenalty', state.language, { penalty: penalty.toFixed(2)})});
            } else {
                const monthlyInterest = newLoan.amount * (newLoan.interestRate / 12);
                const principalPayment = newLoan.amount * 0.02;
                const totalPayment = monthlyInterest + principalPayment;

                if (playerCash >= totalPayment) {
                    playerCash -= totalPayment;
                    newLoan.amount -= principalPayment;
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('monthlyLoanPayment', state.language, {amount: totalPayment.toFixed(2)})});
                } else {
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: `Failed to make monthly loan payment of $${totalPayment.toFixed(2)} due to insufficient funds.`});
                }
            }
        }
        
        // Venture Loan Payments
        newVentureLoans.forEach(vl => {
            const interest = vl.principal * (vl.interestRate / 12);
            if (playerCash >= interest) {
                playerCash -= interest;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('ventureLoanInterestPayment', state.language, { amount: interest.toFixed(2)})});
            } else {
                 newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: `Failed to make venture loan interest payment of $${interest.toFixed(2)}.`});
            }
        });

        // Reset monthly loan counter
        state.player.loanActionsThisMonth = 0;
    }

    // Check Venture Loan Deadlines
    newVentureLoans.forEach(vl => {
        if (!vl.companyId && isDatePast(newDate, vl.deadlineDate)) {
            const penalty = vl.principal * 1.5;
            playerCash -= penalty;
            vl.principal = 0; // Mark as resolved
            newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('ventureLoanDeadlineMissed', state.language, { penalty: penalty.toFixed(2)})});
        }
    });

    const eventsResult = processEvents(state);
    const newsScheduleResult = generateDailyNewsSchedule(state);

    for (const country of COUNTRIES) {
        if (country.electionCycle && (nextDay.getFullYear() % country.electionCycle.interval === 0) && country.electionCycle.year <= nextDay.getFullYear() && country.electionCycle.month === (nextDay.getMonth() + 1)) {
            const electionEvent = generateElectionEvent(country, nextDay.getFullYear(), state.language);
            eventsResult.majorEventQueue = [...(eventsResult.majorEventQueue || []), electionEvent];
        }
    }
    
    newCompanies.forEach(company => {
        if (company.level >= 5) {
            const influenceChance = (company.level - 4) * 0.02;
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
    
    const allNewNews = [
        ...eventsResult.newsArchive,
        ...state.dailyNewsSchedule.filter(s => s.triggered).map(s => s.news),
    ];
    
    let combinedNewsArchive = [...allNewNews, ...state.newsArchive];
    const uniqueNewsIds = new Set();
    const uniqueNewsArchive = combinedNewsArchive.filter(item => {
        if (!uniqueNewsIds.has(item.id)) {
            uniqueNewsIds.add(item.id);
            return true;
        }
        return false;
    }).slice(0, 50);

    const priceUpdatedState = { ...state, globalFactors: eventsResult.globalFactors };
    const finalDayPrices = updateAllPrices(priceUpdatedState);

    const dateRecord = { year: state.date.year, month: state.date.month, day: state.date.day };
    for (const assetId in finalDayPrices) {
        const asset = finalDayPrices[assetId];
        asset.priceHistory.push({ 
            date: dateRecord, 
            open: asset.dayOpen,
            high: asset.dayHigh,
            low: asset.dayLow,
            close: asset.price 
        });
        if (asset.priceHistory.length > MAX_HISTORY) {
            asset.priceHistory.shift();
        }
        asset.basePrice = asset.price;
        asset.dayOpen = asset.price;
        asset.dayHigh = asset.price;
        asset.dayLow = asset.price;
    }

    return {
        ...state,
        date: newDate,
        assets: finalDayPrices,
        globalFactors: eventsResult.globalFactors,
        majorEvent: eventsResult.majorEventQueue.length > 0 ? eventsResult.majorEventQueue[0] : null,
        majorEventQueue: eventsResult.majorEventQueue.slice(1),
        dailyNewsSchedule: newsScheduleResult.schedule,
        newsTicker: [],
        newsArchive: uniqueNewsArchive,
        player: {
            ...state.player,
            cash: playerCash,
            companies: newCompanies,
            loan: newLoan,
            ventureLoans: newVentureLoans,
            tradeBans: newTradeBans,
            log: newLog,
        },
    };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'LOAD_STATE':
            const loadedState = action.payload;
            // Fix: The following line was incorrect because it converted the GameDate object (from JSON)
            // into a JS Date object, which have incompatible structures, causing type errors downstream.
            // loadedState.date = new Date(loadedState.date as any) as unknown as GameState['date'];
            return loadedState;

        case 'SET_PAUSED':
            return { ...state, isPaused: action.payload };
        
        case 'SET_SPEED':
            return { ...state, gameSpeed: action.payload };

        case 'SET_LANGUAGE':
            const newsScheduleResult = generateDailyNewsSchedule({ ...state, language: action.payload });
            return { 
                ...state, 
                language: action.payload,
                dailyNewsSchedule: newsScheduleResult.schedule,
                newsTicker: [],
            };
        
        case 'TICK': {
            if (state.isPaused || state.isSimulating) return state;

            const { deltaTime } = action.payload;
            const newDayProgress = state.date.dayProgress + (deltaTime * state.gameSpeed) / DAY_DURATION_MS;
            
            let newState = { ...state };
            let newPriceAccumulator = state.priceUpdateAccumulator + (deltaTime * state.gameSpeed);

            if (newPriceAccumulator >= PRICE_UPDATE_INTERVAL_MS) {
                newState.assets = applyIntradayNoise(state.assets);
                newPriceAccumulator = 0;
                 
                let playerCash = newState.player.cash;
                const playerPortfolio = { ...newState.player.portfolio };
                let playerMarginPositions = { ...newState.player.marginPositions };
                let playerLog = [...newState.player.log];
                
                // --- PENDING ORDER EXECUTION LOGIC ---
                const remainingOrders = [];
                for (const order of newState.player.pendingOrders) {
                    const asset = newState.assets[order.assetId];
                    if (!asset) {
                        remainingOrders.push(order);
                        continue;
                    };
                    let triggered = false;
                    if (order.type === 'buy-limit' && asset.price <= order.limitPrice) triggered = true;
                    else if (order.type === 'sell-limit' && asset.price >= order.limitPrice) triggered = true;

                    if (triggered) {
                         const price = order.limitPrice;
                        const quantity = order.quantity;
                        if (order.type === 'buy-limit') {
                            const totalCost = quantity * price;
                            if (playerCash >= totalCost) {
                                playerCash -= totalCost;
                                const existingItem = playerPortfolio[order.assetId];
                                playerPortfolio[order.assetId] = {
                                    assetId: order.assetId,
                                    quantity: (existingItem?.quantity || 0) + quantity,
                                    costBasis: existingItem ? (existingItem.costBasis * existingItem.quantity + totalCost) / (existingItem.quantity + quantity) : price,
                                };
                                playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'trade', message: `Executed Buy Limit: ${quantity} ${order.assetId} @ $${price.toFixed(2)}` });
                            } else { remainingOrders.push(order); }
                        } else { // sell-limit
                            const existingItem = playerPortfolio[order.assetId];
                            if (existingItem && existingItem.quantity >= quantity) {
                                playerCash += quantity * price;
                                existingItem.quantity -= quantity;
                                if (existingItem.quantity === 0) delete playerPortfolio[order.assetId];
                                playerLog.push({ id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Executed Sell Limit: ${quantity} ${order.assetId} @ $${price.toFixed(2)}` });
                            } else {
                                playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'system', message: `Sell Limit for ${order.assetId} cancelled: insufficient assets.` });
                            }
                        }
                    } else { remainingOrders.push(order); }
                }
                newState.player.pendingOrders = remainingOrders;
                
                // --- SL/TP EXECUTION LOGIC ---
                for (const posId in playerMarginPositions) {
                    const pos = playerMarginPositions[posId];
                    const asset = newState.assets[pos.assetId];
                    if (!asset) continue;

                    let triggeredPrice: number | undefined = undefined;
                    if (pos.type === 'long') {
                        if (pos.stopLoss && asset.price <= pos.stopLoss) triggeredPrice = pos.stopLoss;
                        if (pos.takeProfit && asset.price >= pos.takeProfit) triggeredPrice = pos.takeProfit;
                    } else { // short
                        if (pos.stopLoss && asset.price >= pos.stopLoss) triggeredPrice = pos.stopLoss;
                        if (pos.takeProfit && asset.price <= pos.takeProfit) triggeredPrice = pos.takeProfit;
                    }
                    
                    if(triggeredPrice) {
                        const entryValue = pos.entryPrice * pos.quantity;
                        const currentValue = triggeredPrice * pos.quantity;
                        const pnl = pos.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
                        playerCash += pos.margin + pnl;
                        delete playerMarginPositions[posId];
                        playerLog.push({ id: crypto.randomUUID(), date: newState.date, type: 'trade', message: `Position on ${pos.assetId} auto-closed by SL/TP at $${triggeredPrice.toFixed(2)} for a P/L of $${pnl.toFixed(2)}`});
                    }
                }
                newState.player.marginPositions = playerMarginPositions;
                newState.player.cash = playerCash;
                newState.player.portfolio = playerPortfolio;
                newState.player.log = playerLog;
            }
            
            const currentHour = Math.floor(newDayProgress * 24);
            const newSchedule = [...state.dailyNewsSchedule];
            let newTicker = [...state.newsTicker];
            let newNewsArchive = [...state.newsArchive];
            let newsAdded = false;
            newSchedule.forEach(item => {
                if (!item.triggered && currentHour >= item.triggerHour) {
                    item.triggered = true;
                    const newsItemWithFlag = { ...item.news, isMajor: false };
                    newTicker.push(newsItemWithFlag);
                    newNewsArchive.unshift(newsItemWithFlag);
                    newsAdded = true;
                }
            });

            if (newDayProgress >= 1) {
                return { ...state, date: { ...state.date, dayProgress: 1 } };
            }

            return {
                ...newState,
                date: { ...newState.date, dayProgress: newDayProgress, hour: currentHour },
                priceUpdateAccumulator: newPriceAccumulator,
                dailyNewsSchedule: newSchedule,
                newsTicker: newsAdded ? newTicker : state.newsTicker,
                newsArchive: newsAdded ? newNewsArchive.slice(0, 50) : state.newsArchive,
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
            const newsSchedule = generateDailyNewsSchedule(state);
            const initialAssets = { ...state.assets };
            for(const assetId in initialAssets) {
                const asset = initialAssets[assetId];
                asset.dayOpen = asset.price;
                asset.dayHigh = asset.price;
                asset.dayLow = asset.price;
                asset.basePrice = asset.price;
            }

            return {
                ...state,
                isPaused: false,
                assets: initialAssets,
                dailyNewsSchedule: newsSchedule.schedule,
                player: {
                    ...state.player,
                    name: playerName,
                    currentResidency: countryId,
                    residencyHistory: [countryId],
                    politicalCapital: { [countryId]: 100 }
                }
            };
        }

        case 'SPOT_TRADE': {
            const { assetId, quantity, price, type } = action.payload;
            const currentPortfolio = { ...state.player.portfolio };
            const existingItem = currentPortfolio[assetId];
            if (type === 'buy') {
                const totalCost = quantity * price;
                if (state.player.cash < totalCost) return state;
                const newPortfolioItem: PortfolioItem = {
                    assetId,
                    quantity: (existingItem?.quantity || 0) + quantity,
                    costBasis: existingItem ? (existingItem.costBasis * existingItem.quantity + totalCost) / (existingItem.quantity + quantity) : price,
                };
                currentPortfolio[assetId] = newPortfolioItem;
                const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Bought ${quantity} ${assetId} @ $${price.toFixed(2)}` };
                return { ...state, player: { ...state.player, cash: state.player.cash - totalCost, portfolio: currentPortfolio, log: [...state.player.log, newLogEntry] } };
            } else { // sell
                if (!existingItem || existingItem.quantity < quantity) return state;
                const totalProceeds = quantity * price;
                existingItem.quantity -= quantity;
                if (existingItem.quantity === 0) delete currentPortfolio[assetId];
                const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Sold ${quantity} ${assetId} @ $${price.toFixed(2)}` };
                return { ...state, player: { ...state.player, cash: state.player.cash + totalProceeds, portfolio: currentPortfolio, log: [...state.player.log, newLogEntry] } };
            }
        }

        case 'OPEN_MARGIN_POSITION': {
            const { assetId, quantity, price, leverage, type, stopLoss, takeProfit } = action.payload;
            const marginAmount = (quantity * price) / leverage;
            if (state.player.cash < marginAmount) return state;

            const newPosition: MarginPosition = { id: crypto.randomUUID(), assetId, quantity, entryPrice: price, leverage, type, margin: marginAmount, stopLoss, takeProfit };
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Opened ${leverage}x ${type.toUpperCase()} on ${quantity} ${assetId} @ $${price.toFixed(2)}` };
            return { ...state, player: { ...state.player, cash: state.player.cash - marginAmount, marginPositions: { ...state.player.marginPositions, [newPosition.id]: newPosition }, log: [...state.player.log, newLogEntry] } };
        }

        case 'CLOSE_MARGIN_POSITION': {
            const { positionId, closingPrice } = action.payload;
            const position = state.player.marginPositions[positionId];
            if (!position) return state;

            const currentPrice = closingPrice || state.assets[position.assetId].price;
            const pnl = (position.type === 'long' ? (currentPrice - position.entryPrice) : (position.entryPrice - currentPrice)) * position.quantity;
            const cashReturned = position.margin + pnl;
            const newPositions = { ...state.player.marginPositions };
            delete newPositions[positionId];
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Closed ${position.type.toUpperCase()} position on ${position.assetId} for a ${pnl >= 0 ? 'profit' : 'loss'} of $${Math.abs(pnl).toFixed(2)}`};
            return { ...state, player: { ...state.player, cash: state.player.cash + cashReturned, marginPositions: newPositions, log: [...state.player.log, newLogEntry]}};
        }
        
        case 'ANALYST_REPORT_PURCHASED': {
            const { cost, message } = action.payload;
            if (state.player.cash < cost) return state;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'system', message };
            return { ...state, player: { ...state.player, cash: state.player.cash - cost, log: [...state.player.log, newLogEntry]}};
        }
        
        case 'ESTABLISH_COMPANY': {
            const newCompany = action.payload;
            const cost = COMPANY_TYPES[newCompany.type].baseCost * (COUNTRIES.find(c => c.id === state.player.currentResidency)?.companyCostModifier || 1);
            if (state.player.cash < cost) return state;

            let newVentureLoans = [...state.player.ventureLoans];
            const openVentureLoan = newVentureLoans.find(vl => !vl.companyId);
            if(openVentureLoan) {
                openVentureLoan.companyId = newCompany.id;
            }
            
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Established new company '${newCompany.name}' for $${cost.toFixed(2)}.` };
            return { ...state, player: { ...state.player, cash: state.player.cash - cost, companies: [...state.player.companies, newCompany], ventureLoans: newVentureLoans, log: [...state.player.log, newLogEntry]}};
        }

        case 'UPGRADE_COMPANY': {
            // Unchanged
            const { companyId, cost, outcome } = action.payload;
            const companies = [...state.player.companies];
            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return state;
            let finalCost = cost;
            let logMessage = '';
            const company = { ...companies[companyIndex] };
            switch (outcome) {
                case 'success': company.level += 1; logMessage = `Successfully upgraded '${company.name}' to Level ${company.level}.`; break;
                case 'critical_success': company.level += 2; finalCost *= 0.5; logMessage = `Critical success! Upgraded '${company.name}' to Level ${company.level} and received a 50% refund.`; break;
                case 'complication_cost': company.level += 1; finalCost *= 1.1; logMessage = `Complication! Upgrade for '${company.name}' cost 10% more than expected.`; break;
                case 'complication_delay': company.effects.push({ type: 'income_halt', durationMonths: 1 }); logMessage = `Complication! Upgrade for '${company.name}' caused a construction delay. Income is halted for 1 month.`; break;
            }
            if (state.player.cash < finalCost) return state;
            const companyData = COMPANY_TYPES[company.type];
            company.monthlyIncome = companyData.baseIncome * Math.pow(companyData.incomeMultiplier, company.level - 1);
            companies[companyIndex] = company;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: logMessage };
            return { ...state, player: { ...state.player, cash: state.player.cash - finalCost, companies, log: [...state.player.log, newLogEntry]}};
        }

        case 'EXECUTE_CORPORATE_ACTION': {
             // Unchanged
            const { companyId, type, cost } = action.payload;
            if (state.player.cash < cost) return state;
            const companies = [...state.player.companies];
            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return state;
            const company = { ...companies[companyIndex] };
            let logMessage = '';
            let newGlobalFactors = { ...state.globalFactors };
            let newNewsSchedule = [...state.dailyNewsSchedule];
            let success = Math.random() < 0.8;
            if (type === 'marketing') {
                if (success) { const positiveNews = generatePositiveCompanyNews(company, state.language); newNewsSchedule.push({ triggerHour: state.date.hour + 1, news: positiveNews, triggered: false }); logMessage = `Marketing campaign for ${company.name} was a success, generating positive press.`; }
                else { logMessage = `Marketing campaign for ${company.name} failed to generate significant interest.`; }
            } else if (type === 'research') {
                 if (success) { newGlobalFactors.techInnovation = Math.min(1, newGlobalFactors.techInnovation + 0.05); logMessage = `R&D investment by ${company.name} has led to a breakthrough, boosting tech innovation.`; }
                 else { logMessage = `R&D investment by ${company.name} did not yield any immediate breakthroughs.`; }
            } else if (type === 'lobbying') {
                 if (success) { company.effects.push({ type: 'tax_break', durationMonths: 3 }); logMessage = `${company.name} has successfully lobbied for a 3-month tax break.`; }
                 else { logMessage = `Lobbying efforts by ${company.name} were unsuccessful.`; }
            }
            companies[companyIndex] = company;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'corporate', message: logMessage };
            return { ...state, globalFactors: newGlobalFactors, dailyNewsSchedule: newNewsSchedule, player: { ...state.player, cash: state.player.cash - cost, companies: companies, log: [...state.player.log, newLogEntry]}};
        }

        case 'TAKE_LOAN': {
            const loanAmount = action.payload;
            if (state.player.loanActionsThisMonth >= 3) {
                return { ...state, penaltyRequired: { loanAmount } };
            }
            const newLog = [...state.player.log, {id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('loanTaken', state.language, {amount: loanAmount.toFixed(2)})}]
            return { ...state, player: { ...state.player, cash: state.player.cash + loanAmount, loan: { ...state.player.loan, amount: state.player.loan.amount + loanAmount }, loanActionsThisMonth: state.player.loanActionsThisMonth + 1, log: newLog }};
        }
        
        case 'TAKE_VENTURE_LOAN': {
            const { amount, interestRate } = action.payload;
            const deadline = new Date(state.date.year + 1, state.date.month - 1, state.date.day);
            const newVentureLoan: VentureLoan = {
                id: crypto.randomUUID(),
                principal: amount,
                interestRate,
                companyId: null,
// Fix: Add missing hour and dayProgress properties to conform to the GameDate type.
                deadlineDate: { year: deadline.getFullYear(), month: deadline.getMonth() + 1, day: deadline.getDate(), hour: 0, dayProgress: 0 },
                profitShareRepaid: 0,
            };
            const newLog = [...state.player.log, {id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('ventureLoanTaken', state.language, {amount: amount.toFixed(2)})}]
            return { ...state, player: { ...state.player, cash: state.player.cash + amount, ventureLoans: [...state.player.ventureLoans, newVentureLoan], log: newLog }};
        }

        case 'REPAY_LOAN': {
            const amountToPay = action.payload;
            const amountToClear = Math.min(amountToPay * 1.02, state.player.loan.amount);
            if(state.player.cash < amountToPay) return state;
            const bonusAmount = amountToClear - amountToPay;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'loan', message: t('loanRepaymentDiscount', state.language, { amount: amountToClear.toFixed(2), savedAmount: bonusAmount.toFixed(2), paidAmount: amountToPay.toFixed(2) })};
            return { ...state, player: { ...state.player, cash: state.player.cash - amountToPay, loan: { ...state.player.loan, amount: state.player.loan.amount - amountToClear }, log: [...state.player.log, newLogEntry]}};
        }

        case 'DEFER_LOAN_PAYMENT': {
             if (state.player.loan.defermentsUsed >= 24 || state.player.loan.isDeferredThisMonth) return state;
             return { ...state, player: { ...state.player, loan: { ...state.player.loan, isDeferredThisMonth: true }}};
        }
        
        case 'CHOOSE_PENALTY': {
            const { type, loanAmount } = action.payload;
            let newCash = state.player.cash;
            let newTradeBans = [...state.player.tradeBans];
            let newLog = [...state.player.log];
            
            if (type === 'fine') {
                const fineAmount = loanAmount * 0.3;
                newCash -= fineAmount;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: t('penaltyFinePaid', state.language, {amount: fineAmount.toFixed(2)})});
            } else { // ban
                const bannedAssetIds = Object.values(ASSETS).filter(a => a.isStateOwned).map(a => a.id);
                const expiry = new Date(state.date.year, state.date.month, state.date.day); // +1 month
// Fix: Add missing hour and dayProgress properties to conform to the GameDate type.
                const newExpiryDate: GameDate = { year: expiry.getFullYear(), month: expiry.getMonth() + 1, day: expiry.getDate(), hour: 0, dayProgress: 0 };
                newTradeBans.push({ assetIds: bannedAssetIds, expiryDate: newExpiryDate });
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: t('penaltyTradeBan', state.language)});
            }
            
            return { ...state, player: { ...state.player, cash: newCash, tradeBans: newTradeBans, log: newLog }, penaltyRequired: null };
        }

        case 'CHANGE_RESIDENCY': {
            const { countryId, cost } = action.payload;
            if (state.player.cash < cost) return state;
            const residencyHistorySet = new Set(state.player.residencyHistory);
            residencyHistorySet.add(countryId);
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'system', message: `Changed residency to ${countryId} for $${cost.toFixed(2)}.` };
            return { ...state, player: { ...state.player, cash: state.player.cash - cost, currentResidency: countryId, residencyHistory: Array.from(residencyHistorySet), log: [...state.player.log, newLogEntry]}};
        }

        case 'EXECUTE_POLITICAL_ACTION': {
            // Unchanged
            const { type, countryId, amount, party } = action.payload as { type: 'donate', countryId: string, party: string, amount: number };
            if (type === 'donate') {
                if (state.player.cash < amount) return state;
                const pcGain = Math.floor(amount / 10000);
                const newPoliticalCapital = { ...state.player.politicalCapital };
                newPoliticalCapital[countryId] = (newPoliticalCapital[countryId] || 0) + pcGain;
                const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'politics', message: `Donated $${amount.toFixed(2)} to ${party} in ${countryId}, gaining ${pcGain} Political Capital.`};
                return { ...state, player: { ...state.player, cash: state.player.cash - amount, politicalCapital: newPoliticalCapital, log: [...state.player.log, newLogEntry]}};
            }
            return state;
        }

        case 'EXECUTE_LOCAL_LOBBY': {
            // Unchanged
            const { category, costPC } = action.payload;
            const currentPC = state.player.politicalCapital[state.player.currentResidency] || 0;
            if (currentPC < costPC) return state;
            const newPoliticalCapital = { ...state.player.politicalCapital };
            newPoliticalCapital[state.player.currentResidency] -= costPC;
            let logMessage = '';
            const success = Math.random() < 0.75;
            if (success) {
                const newAssets = { ...state.assets };
                Object.values(newAssets).forEach(asset => { if(asset.category === category) { asset.trend += 0.0005; }});
                logMessage = `Successfully lobbied for the ${category} industry, boosting its outlook.`;
            } else { logMessage = `Lobbying efforts for the ${category} industry failed to pass.`; }
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'politics', message: logMessage };
            return { ...state, player: { ...state.player, politicalCapital: newPoliticalCapital, log: [...state.player.log, newLogEntry]}};
        }

        case 'EXECUTE_GLOBAL_INFLUENCE': {
             // Unchanged
            const { factor, direction, costPC, costCash } = action.payload;
            const totalPC = Object.values(state.player.politicalCapital).reduce((sum, val) => sum + val, 0);
            if (totalPC < costPC || state.player.cash < costCash) return state;
            let remainingPCCost = costPC;
            const newPoliticalCapital = { ...state.player.politicalCapital };
            for(const countryId in newPoliticalCapital) {
                const deduction = Math.min(newPoliticalCapital[countryId], remainingPCCost);
                newPoliticalCapital[countryId] -= deduction;
                remainingPCCost -= deduction;
                if(remainingPCCost <= 0) break;
            }
            const newCash = state.player.cash - costCash;
            const rand = Math.random();
            let logMessage = '';
            let newGlobalFactors = { ...state.globalFactors };
            const effect = direction === 'promote' ? 0.05 : -0.05;
            if (rand < 0.70) { newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] + effect)); logMessage = t('influence_success', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) }); }
            else if (rand < 0.90) { logMessage = t('influence_fail', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) }); }
            else { newGlobalFactors[factor] = Math.max(0, Math.min(1, newGlobalFactors[factor] - effect)); logMessage = t('influence_backfire', state.language, { direction: t(direction, state.language), factor: t(factor.toLowerCase() as any, state.language) }); }
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'politics', message: logMessage };
            return { ...state, globalFactors: newGlobalFactors, player: { ...state.player, cash: newCash, politicalCapital: newPoliticalCapital, log: [...state.player.log, newLogEntry]}};
        }
        
        case 'PLACE_PENDING_ORDER': {
            const order = action.payload;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Placed ${order.type} for ${order.quantity} ${order.assetId} @ $${order.limitPrice.toFixed(2)}` };
            return { ...state, player: { ...state.player, pendingOrders: [...state.player.pendingOrders, order], log: [...state.player.log, newLogEntry]}};
        }

        case 'CANCEL_PENDING_ORDER': {
            const { orderId } = action.payload;
            const order = state.player.pendingOrders.find(o => o.id === orderId);
            if (!order) return state;
            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'trade', message: `Cancelled order for ${order.quantity} ${order.assetId}.` };
            return { ...state, player: { ...state.player, pendingOrders: state.player.pendingOrders.filter(o => o.id !== orderId), log: [...state.player.log, newLogEntry]}};
        }
        
        case 'DISMISS_MAJOR_EVENT':
            return { ...state, majorEvent: null };

        default:
            return state;
    }
};