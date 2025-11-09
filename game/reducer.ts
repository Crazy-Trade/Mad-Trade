// game/reducer.ts
import { GameState, GameAction, LogEntry, LogType, GameDate, Asset, PortfolioItem, MarginPosition, NewsItem, Company, TradeBan, PendingOrder, VentureLoan, CompanyEffect, RevivalLoan } from './types';
import { DAY_DURATION_MS, PRICE_UPDATE_INTERVAL_MS, updateAllPrices, processEvents, generateDailyNewsSchedule, applyIntradayNoise, generateElectionEvent, generatePositiveCompanyNews } from './engine.js';
import { getInitialState } from './database.js';
import { ASSETS, COMPANY_TYPES, COUNTRIES } from './database.js';
// Fix: Import formatCurrency to resolve multiple 'Cannot find name' errors.
import { formatCurrency } from '../utils.js';

const addLog = (log: LogEntry[], type: LogType, message: string, date: GameDate): LogEntry[] => {
    const newLog = [
        { id: crypto.randomUUID(), date, type, message },
        ...log
    ];
    return newLog.slice(0, 200); // Keep log size manageable
};

const advanceDate = (currentDate: GameDate, days: number = 1): GameDate => {
    const date = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    date.setDate(date.getDate() + days);
    return {
        ...currentDate,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: 0,
        dayProgress: 0,
    };
};

const areDatesEqual = (date1: GameDate, date2: GameDate) => {
    return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day;
};


const processDailyUpdates = (state: GameState): GameState => {
    let newState = { ...state };

    // 0. Automatic Margin Liquidation Check
    const marginPositions = { ...newState.player.marginPositions };
    let wasLiquidated = false;
    for (const posId in marginPositions) {
        const pos = marginPositions[posId];
        const asset = newState.assets[pos.assetId];
        const currentValue = asset.price * pos.quantity;
        const entryValue = pos.entryPrice * pos.quantity;
        const pnl = pos.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
        
        if (pnl <= -pos.margin) {
            // Liquidated! Close position, player loses entire margin.
            delete marginPositions[posId];
            newState.player.log = addLog(newState.player.log, 'trade', `MARGIN CALL: Position on ${asset.name} was liquidated. Loss: ${formatCurrency(pos.margin)}.`, newState.date);
            wasLiquidated = true;
        }
    }
    if (wasLiquidated) {
        newState.player = { ...newState.player, marginPositions };
    }


    // 1. Update prices for the day
    newState.assets = updateAllPrices(newState);

    // 2. Process pending orders
    const fulfilledOrders: PendingOrder[] = [];
    const remainingOrders: PendingOrder[] = [];
    newState.player.pendingOrders.forEach(order => {
        const asset = newState.assets[order.assetId];
        let fulfilled = false;
        if (order.type === 'buy-limit' && asset.dayLow <= order.limitPrice) {
            const cost = order.quantity * order.limitPrice;
             if (newState.player.cash >= cost) {
                newState.player.cash -= cost;
                const existingItem = newState.player.portfolio[order.assetId];
                if (existingItem) {
                    const totalQuantity = existingItem.quantity + order.quantity;
                    const totalCost = (existingItem.costBasis * existingItem.quantity) + cost;
                    existingItem.costBasis = totalCost / totalQuantity;
                    existingItem.quantity = totalQuantity;
                } else {
                    newState.player.portfolio[order.assetId] = { assetId: order.assetId, quantity: order.quantity, costBasis: order.limitPrice };
                }
                newState.player.log = addLog(newState.player.log, 'trade', `Fulfilled buy limit order for ${order.quantity} of ${asset.name} at ${formatCurrency(order.limitPrice)}.`, newState.date);
                fulfilled = true;
             }
        } else if (order.type === 'sell-limit' && asset.dayHigh >= order.limitPrice) {
             const existingItem = newState.player.portfolio[order.assetId];
            if (existingItem && existingItem.quantity >= order.quantity) {
                newState.player.cash += order.quantity * order.limitPrice;
                existingItem.quantity -= order.quantity;
                if(existingItem.quantity <= 0) {
                    delete newState.player.portfolio[order.assetId];
                }
                 newState.player.log = addLog(newState.player.log, 'trade', `Fulfilled sell limit order for ${order.quantity} of ${asset.name} at ${formatCurrency(order.limitPrice)}.`, newState.date);
                 fulfilled = true;
            }
        }

        if(fulfilled) fulfilledOrders.push(order);
        else remainingOrders.push(order);
    });
     newState.player.pendingOrders = remainingOrders;


    // 3. Update price history & reset day stats
    const newAssets = { ...newState.assets };
    for (const assetId in newAssets) {
        const asset = { ...newAssets[assetId] };
        asset.priceHistory.push({
            date: { year: newState.date.year, month: newState.date.month, day: newState.date.day },
            open: asset.dayOpen,
            high: asset.dayHigh,
            low: asset.dayLow,
            close: asset.price
        });
        if(asset.priceHistory.length > 500) asset.priceHistory.shift();
        asset.basePrice = asset.price;
        asset.dayOpen = asset.price;
        asset.dayHigh = asset.price;
        asset.dayLow = asset.price;
        newAssets[assetId] = asset;
    }
    newState.assets = newAssets;
    
    // 4. Handle events
    const eventResult = processEvents(newState);
    newState.majorEventQueue = eventResult.majorEventQueue;
    newState.globalFactors = eventResult.globalFactors;
    newState.newsArchive = eventResult.newsArchive;
    if (!newState.majorEvent && newState.majorEventQueue.length > 0) {
        newState.majorEvent = newState.majorEventQueue.shift() || null;
    }

    // 5. Generate news for the day
    newState.dailyNewsSchedule = generateDailyNewsSchedule(newState).schedule;
    
    // Monthly updates (Day 1 of month)
    if (newState.date.day === 1) {
        // Company Income & Effects
        let totalIncome = 0;
        const updatedCompanies: Company[] = [];
        newState.player.companies.forEach(c => {
            let company = {...c, effects: [...c.effects]};
            let incomeHalted = false;
            let taxRate = COUNTRIES.find(co => co.id === company.countryId)?.taxRate || 0.2;
            let taxBreakActive = false;

            const activeEffects: CompanyEffect[] = [];
            company.effects.forEach(effect => {
                if (effect.type === 'income_halt') incomeHalted = true;
                if (effect.type === 'tax_break') taxBreakActive = true;
                effect.durationMonths -= 1;
                if (effect.durationMonths > 0) activeEffects.push(effect);
                else newState.player.log = addLog(newState.player.log, 'corporate', `Effect '${effect.type}' on ${company.name} has expired.`, newState.date);
            });
            company.effects = activeEffects;

            if (!incomeHalted) {
                const tax = company.monthlyIncome * (taxBreakActive ? taxRate * 0.5 : taxRate);
                const netIncome = company.monthlyIncome - tax;
                totalIncome += netIncome;
            }
            updatedCompanies.push(company);
        });
        newState.player.companies = updatedCompanies;
        newState.player.cash += totalIncome;
        if(totalIncome > 0) newState.player.log = addLog(newState.player.log, 'corporate', `Received ${formatCurrency(totalIncome)} in monthly corporate income (after taxes).`, newState.date);

        // Standard Loan Payment
        if (newState.player.loan.amount > 0) {
            if (newState.player.loan.isDeferredThisMonth) {
                 newState.player.log = addLog(newState.player.log, 'loan', `Standard loan payment was deferred this month.`, newState.date);
                 newState.player.loan.isDeferredThisMonth = false;
            } else if (newState.player.cash > 0) {
                const interestPayment = newState.player.loan.amount * (newState.player.loan.interestRate / 12);
                const principalPayment = newState.player.loan.amount * 0.02; // 2% principal
                const totalPayment = interestPayment + principalPayment;
                if (newState.player.cash >= totalPayment) {
                    newState.player.cash -= totalPayment;
                    newState.player.loan.amount -= principalPayment;
                    newState.player.log = addLog(newState.player.log, 'loan', `Made automatic monthly payment of ${formatCurrency(totalPayment)} for standard loan.`, newState.date);
                }
            }
        }

        // Venture Loan Payments & Profit Sharing
        newState.player.ventureLoans.forEach(vl => {
            // Standard Payment
            const interest = vl.principal * (vl.interestRate / 12);
            const principal = vl.principal * 0.02;
            const payment = interest + principal;
            if (newState.player.cash >= payment) {
                newState.player.cash -= payment;
                vl.principal -= principal;
                newState.player.log = addLog(newState.player.log, 'loan', `Made monthly payment of ${formatCurrency(payment)} for Venture Loan #${vl.id.slice(0,5)}.`, newState.date);
            }
            // Profit Sharing
            if (vl.companyId) {
                const company = newState.player.companies.find(c => c.id === vl.companyId);
                const profitShareLimit = vl.principal * 0.3;
                if (company && vl.profitShareRepaid < profitShareLimit) {
                    const share = company.monthlyIncome * 0.20;
                    newState.player.cash -= share;
                    vl.profitShareRepaid += share;
                    newState.player.log = addLog(newState.player.log, 'loan', `Bank takes 20% profit share (${formatCurrency(share)}) from ${company.name} for Venture Loan.`, newState.date);
                }
            }
        });
        
        // Revival Loan Payment
        if (newState.player.revivalLoan) {
             const rl = newState.player.revivalLoan;
             if (newState.player.cash >= rl.monthlyPayment) {
                 newState.player.cash -= rl.monthlyPayment;
                 rl.principal -= (rl.monthlyPayment - (rl.principal * (rl.interestRate / 12)));
                 rl.paymentsRemaining -= 1;
                 newState.player.log = addLog(newState.player.log, 'loan', `Made mandatory payment of ${formatCurrency(rl.monthlyPayment)} for Revival Loan.`, newState.date);
                 if (rl.paymentsRemaining <= 0) newState.player.revivalLoan = null;
             } else {
                // Failure to pay revival loan = immediate game over
                newState.player.bankruptcyState = 'game_over';
                newState.player.gameOverReason = 'prison';
             }
        }
        
         newState.player.loanActionsThisMonth = 0;
    }
    
    // Election check
    const country = COUNTRIES.find(c => c.id === newState.player.currentResidency);
    if(country?.electionCycle) {
        const cycle = country.electionCycle;
        if(newState.date.month === cycle.month && (newState.date.year - cycle.year) % cycle.interval === 0) {
            // Fix: Removed extra `newState.language` argument to match function definition.
            const electionEvent = generateElectionEvent(country, newState.date.year);
            newState.majorEventQueue.push(electionEvent);
             newState.player.log = addLog(newState.player.log, 'politics', `${country.name} held a national election.`, newState.date);
        }
    }
    
    // Venture Loan Deadline Check
    newState.player.ventureLoans.forEach(vl => {
        if (!vl.companyId && areDatesEqual(newState.date, vl.deadlineDate)) {
            const penalty = vl.principal * 0.5;
            newState.player.cash -= penalty;
            newState.player.log = addLog(newState.player.log, 'loan', `FAILED to establish a company for Venture Loan! Paid a penalty of ${formatCurrency(penalty)}.`, newState.date);
        }
    });


    // Bankruptcy Check
    const netWorth = newState.player.cash 
        + Object.values(newState.player.portfolio).reduce((sum, item) => sum + (newState.assets[item.assetId]?.price || 0) * item.quantity, 0)
        + Object.values(newState.player.marginPositions).reduce((sum, pos) => {
            const asset = newState.assets[pos.assetId];
            if (!asset) return sum;
            const pnl = pos.type === 'long' ? (asset.price - pos.entryPrice) * pos.quantity : (pos.entryPrice - asset.price) * pos.quantity;
            return sum + pos.margin + pnl;
        }, 0);

    if (netWorth < 0 && newState.player.bankruptcyState === 'none') {
        newState.player.bankruptcyState = 'grace_period';
        newState.player.gracePeriodExpiryDate = advanceDate(newState.date, 30);
        newState.player.log = addLog(newState.player.log, 'system', `DANGER: Net worth is negative! You have a 30-day grace period to recover or face bankruptcy.`, newState.date);
    } else if (newState.player.bankruptcyState === 'grace_period') {
        if (netWorth >= 0) {
            newState.player.bankruptcyState = 'none';
            newState.player.gracePeriodExpiryDate = null;
            newState.player.log = addLog(newState.player.log, 'system', `Net worth restored. Bankruptcy avoided.`, newState.date);
        } else if (areDatesEqual(newState.date, newState.player.gracePeriodExpiryDate!)) {
            newState.player.bankruptcyState = 'game_over';
            const currentCountry = COUNTRIES.find(c => c.id === newState.player.currentResidency);
            newState.player.gameOverReason = currentCountry?.isAuthoritarian ? 'execution' : 'prison';
        }
    }


    // Advance the date
    newState.date = advanceDate(newState.date);
    return newState;
};


export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'LOAD_STATE': {
            const loadedState = action.payload;
            // Ensure date objects are correctly parsed if they are strings
            if (typeof loadedState.date === 'string') {
                const d = new Date(loadedState.date);
                loadedState.date = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), dayProgress: 0 };
            }
            return loadedState;
        }
        case 'SET_PAUSED':
            return { ...state, isPaused: action.payload };
        case 'SET_SPEED':
            return { ...state, gameSpeed: action.payload };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload };
        case 'TICK': {
            if (state.isPaused || state.isSimulating) return state;

            const newPriceUpdateAccumulator = state.priceUpdateAccumulator + (action.payload.deltaTime * state.gameSpeed);
            let newAssets = state.assets;
            let newState = { ...state };
            
            if (newPriceUpdateAccumulator >= PRICE_UPDATE_INTERVAL_MS) {
                newAssets = applyIntradayNoise(state.assets);
                
                // Intraday Stop-Loss / Take-Profit Check
                const marginPositions = { ...newState.player.marginPositions };
                let positionClosed = false;
                for (const posId in marginPositions) {
                    const pos = marginPositions[posId];
                    const asset = newAssets[pos.assetId];
                    if (pos.stopLoss && ( (pos.type === 'long' && asset.price <= pos.stopLoss) || (pos.type === 'short' && asset.price >= pos.stopLoss) )) {
                        return gameReducer(newState, { type: 'CLOSE_MARGIN_POSITION', payload: { positionId: posId, closingPrice: pos.stopLoss } });
                    }
                    if (pos.takeProfit && ( (pos.type === 'long' && asset.price >= pos.takeProfit) || (pos.type === 'short' && asset.price <= pos.takeProfit) )) {
                         return gameReducer(newState, { type: 'CLOSE_MARGIN_POSITION', payload: { positionId: posId, closingPrice: pos.takeProfit } });
                    }
                }
            }

            newState = {
                ...state,
                assets: newAssets,
                date: {
                    ...state.date,
                    dayProgress: state.date.dayProgress + ((action.payload.deltaTime * state.gameSpeed) / DAY_DURATION_MS),
                    hour: Math.floor((state.date.dayProgress * 24) % 24),
                },
                priceUpdateAccumulator: newPriceUpdateAccumulator % PRICE_UPDATE_INTERVAL_MS,
            };

            const activeNews = newState.dailyNewsSchedule.find(item => !item.triggered && newState.date.hour >= item.triggerHour);
            if (activeNews) {
                activeNews.triggered = true;
                newState.newsTicker = [activeNews.news, ...newState.newsTicker.slice(0, 9)];
                newState.newsArchive = [activeNews.news, ...newState.newsArchive.slice(0, 99)];
            }

            return newState;
        }
        case 'ADVANCE_DAY': {
            return processDailyUpdates(state);
        }
        case 'SKIP_DAYS': {
            let newState: GameState = { ...state, isSimulating: true, isPaused: true };
            for(let i = 0; i < action.payload.days; i++) {
                newState = processDailyUpdates(newState);
            }
            return { ...newState, isSimulating: false, isPaused: false };
        }
        case 'SET_INITIAL_STATE': {
            const initialState = getInitialState();
            const country = COUNTRIES.find(c => c.id === action.payload.countryId);
            return {
                ...initialState,
                isPaused: false,
                player: {
                    ...initialState.player,
                    name: action.payload.playerName,
                    currentResidency: action.payload.countryId,
                    residencyHistory: [action.payload.countryId],
                    politicalCapital: { [action.payload.countryId]: 100 },
                    cash: country?.id === 'CHE' ? 5000000 : 1000000,
                    log: addLog([], 'system', `Game started in ${country?.name}.`, initialState.date),
                }
            };
        }
        case 'SPOT_TRADE': {
            const { assetId, quantity, price, type } = action.payload;
            const cost = quantity * price;

            if (type === 'buy') {
                if (state.player.cash < cost) return state; // Not enough cash
                if (state.player.cash - cost < -500000) {
                     return { ...state, player: {...state.player, log: addLog(state.player.log, 'system', 'Trade blocked: Exceeds overdraft limit.', state.date)} };
                }
            }
            const newState = { ...state, player: { ...state.player, portfolio: { ...state.player.portfolio } } };
            const assetName = newState.assets[assetId].name;

            if (type === 'buy') {
                newState.player.cash -= cost;
                const existingItem = newState.player.portfolio[assetId];
                if (existingItem) {
                    const totalQuantity = existingItem.quantity + quantity;
                    const totalCost = (existingItem.costBasis * existingItem.quantity) + cost;
                    existingItem.costBasis = totalCost / totalQuantity;
                    existingItem.quantity = totalQuantity;
                } else {
                    newState.player.portfolio[assetId] = { assetId, quantity, costBasis: price };
                }
                newState.player.log = addLog(newState.player.log, 'trade', `Bought ${quantity} of ${assetName} for ${formatCurrency(cost)}.`, newState.date);
            } else { // sell
                const existingItem = newState.player.portfolio[assetId];
                if (!existingItem || existingItem.quantity < quantity) return state;
                newState.player.cash += cost;
                existingItem.quantity -= quantity;
                if (existingItem.quantity <= 0) delete newState.player.portfolio[assetId];
                newState.player.log = addLog(newState.player.log, 'trade', `Sold ${quantity} of ${assetName} for ${formatCurrency(cost)}.`, newState.date);
            }
            return newState;
        }
        case 'OPEN_MARGIN_POSITION': {
             const { assetId, quantity, price, leverage, type, stopLoss, takeProfit } = action.payload;
             const newState = { ...state, player: { ...state.player, marginPositions: { ...state.player.marginPositions } } };
             const assetName = newState.assets[assetId].name;
             const marginCost = (quantity * price) / leverage;
             if(newState.player.cash < marginCost) return state;
             newState.player.cash -= marginCost;
             const newPosition: MarginPosition = { id: crypto.randomUUID(), assetId, quantity, entryPrice: price, leverage, type, margin: marginCost, stopLoss, takeProfit };
             newState.player.marginPositions[newPosition.id] = newPosition;
             newState.player.log = addLog(newState.player.log, 'trade', `Opened ${type} position on ${assetName} with x${leverage} leverage.`, newState.date);
             return newState;
        }
        case 'CLOSE_MARGIN_POSITION': {
            const { positionId, closingPrice } = action.payload;
            const newState = { ...state, player: { ...state.player, marginPositions: { ...state.player.marginPositions } } };
            const position = newState.player.marginPositions[positionId];
            if (!position) return state;
            const asset = newState.assets[position.assetId];
            const price = closingPrice || asset.price;
            const entryValue = position.entryPrice * position.quantity;
            const currentValue = price * position.quantity;
            const pnl = position.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
            const returnedAmount = position.margin + pnl;
            newState.player.cash += returnedAmount;
            delete newState.player.marginPositions[positionId];
            newState.player.log = addLog(newState.player.log, 'trade', `Closed margin position on ${asset.name}. P/L: ${formatCurrency(pnl)}.`, newState.date);
            return newState;
        }
        case 'ANALYST_REPORT_PURCHASED': {
            return { ...state, player: { ...state.player, cash: state.player.cash - action.payload.cost, log: addLog(state.player.log, 'system', action.payload.message, state.date) } };
        }
        case 'ESTABLISH_COMPANY': {
            const newState = { ...state, player: { ...state.player } };
            const companyData = COMPANY_TYPES[action.payload.type];
            const countryModifier = COUNTRIES.find(c => c.id === state.player.currentResidency)?.companyCostModifier || 1;
            const cost = companyData.baseCost * countryModifier;
            if (newState.player.cash < cost) return state;
            newState.player.cash -= cost;
            const newCompany = action.payload;
            newState.player.companies = [...newState.player.companies, newCompany];
            // Check if this fulfills a venture loan
            const unfulfilledVentureLoan = newState.player.ventureLoans.find(vl => !vl.companyId);
            if (unfulfilledVentureLoan) {
                unfulfilledVentureLoan.companyId = newCompany.id;
                newState.player.log = addLog(newState.player.log, 'loan', `${newCompany.name} is now tied to Venture Loan #${unfulfilledVentureLoan.id.slice(0,5)}.`, newState.date);
            }
            newState.player.log = addLog(newState.player.log, 'corporate', `Established new company: ${newCompany.name}.`, newState.date);
            return newState;
        }
        case 'UPGRADE_COMPANY': {
             const newState = { ...state, player: { ...state.player } };
             const companyIndex = newState.player.companies.findIndex(c => c.id === action.payload.companyId);
             if (companyIndex === -1 || newState.player.cash < action.payload.cost) return state;
             newState.player.cash -= action.payload.cost;
             const company = { ...newState.player.companies[companyIndex] };
             switch (action.payload.outcome) {
                 case 'success': company.level += 1; newState.player.log = addLog(newState.player.log, 'corporate', `${company.name} upgraded to level ${company.level}.`, newState.date); break;
                 case 'critical_success': company.level += 2; newState.player.log = addLog(newState.player.log, 'corporate', `Critical success! ${company.name} upgraded to level ${company.level}.`, newState.date); break;
                 case 'complication_cost': newState.player.cash -= action.payload.cost * 0.25; newState.player.log = addLog(newState.player.log, 'corporate', `Complication during upgrade for ${company.name} incurred extra costs!`, newState.date); break;
                 case 'complication_delay': company.effects.push({ type: 'income_halt', durationMonths: 2 }); newState.player.log = addLog(newState.player.log, 'corporate', `Complication during upgrade for ${company.name} has halted its income for 2 months!`, newState.date); break;
             }
             company.monthlyIncome = COMPANY_TYPES[company.type].baseIncome * Math.pow(COMPANY_TYPES[company.type].incomeMultiplier, company.level - 1);
             newState.player.companies[companyIndex] = company;
             return newState;
        }
        case 'EXECUTE_CORPORATE_ACTION': {
            const { companyId, type, cost } = action.payload;
            const newState = { ...state };
            if(newState.player.cash < cost) return state;
            newState.player.cash -= cost;
            const company = newState.player.companies.find(c => c.id === companyId);
            if (!company) return state;
            switch(type) {
                case 'marketing': const news = generatePositiveCompanyNews(company, state.language); newState.newsTicker = [news, ...newState.newsTicker]; newState.newsArchive = [news, ...newState.newsArchive]; break;
                case 'research': newState.globalFactors = { ...newState.globalFactors, techInnovation: Math.min(1, newState.globalFactors.techInnovation + 0.05) }; break;
                case 'lobbying': company.effects.push({ type: 'tax_break', durationMonths: 6 }); newState.player.log = addLog(newState.player.log, 'corporate', `Successful lobbying secured a 6-month tax break for ${company.name}.`, newState.date); break;
            }
            newState.player.log = addLog(newState.player.log, 'corporate', `Executed ${type} action for ${company.name}.`, newState.date);
            return newState;
        }
        case 'TAKE_LOAN': {
            if(state.player.loanActionsThisMonth >= 3) {
                 return { ...state, penaltyRequired: { loanAmount: action.payload } };
            }
            const netWorth = state.player.cash + Object.values(state.player.portfolio).reduce((sum, item) => sum + (state.assets[item.assetId]?.price || 0) * item.quantity, 0);
            const maxLoan = (netWorth) * 2;
            if(state.player.loan.amount + action.payload > maxLoan) return state;
            return { ...state, player: { ...state.player, cash: state.player.cash + action.payload, loan: { ...state.player.loan, amount: state.player.loan.amount + action.payload }, loanActionsThisMonth: state.player.loanActionsThisMonth + 1, log: addLog(state.player.log, 'loan', `Took a loan of ${formatCurrency(action.payload)}.`, state.date) } };
        }
        case 'TAKE_VENTURE_LOAN': {
            const { amount, interestRate } = action.payload;
            const deadlineDate = advanceDate(state.date, 365);
            const newVentureLoan: VentureLoan = { id: crypto.randomUUID(), principal: amount, interestRate, companyId: null, deadlineDate, profitShareRepaid: 0 };
            return { ...state, player: { ...state.player, cash: state.player.cash + amount, ventureLoans: [...state.player.ventureLoans, newVentureLoan], log: addLog(state.player.log, 'loan', `Secured a high-risk Venture Loan of ${formatCurrency(amount)}. You must establish a company within one year.`, state.date) } };
        }
        case 'TAKE_REVIVAL_LOAN': {
             const { amount } = action.payload;
             const revivalLoan: RevivalLoan = { principal: amount, interestRate: 0.20, paymentsRemaining: 6, monthlyPayment: amount * 0.20 }; // Simplified payment
             return { ...state, player: { ...state.player, cash: state.player.cash + amount, revivalLoan, bankruptcyState: 'revival_loan', log: addLog(state.player.log, 'loan', `Took a last-chance Revival Loan of ${formatCurrency(amount)}. Repay it or face the consequences.`, state.date) } };
        }
        case 'REPAY_LOAN': {
            const amount = Math.min(action.payload, state.player.loan.amount, state.player.cash);
            const bonus = amount * 0.02; // 2% bonus
            const effectiveRepayment = amount + bonus;
            return { ...state, player: { ...state.player, cash: state.player.cash - amount, loan: { ...state.player.loan, amount: state.player.loan.amount - effectiveRepayment }, log: addLog(state.player.log, 'loan', `Repaid ${formatCurrency(amount)} of loan (Bonus: ${formatCurrency(bonus)}).`, state.date) } };
        }
        case 'DEFER_LOAN_PAYMENT': {
            if(state.player.loan.defermentsUsed >= 24 || state.player.loan.isDeferredThisMonth) return state;
            const penalty = 2299;
            return { ...state, player: { ...state.player, cash: state.player.cash - penalty, loan: { ...state.player.loan, defermentsUsed: state.player.loan.defermentsUsed + 1, isDeferredThisMonth: true, interestRate: state.player.loan.interestRate * 1.015, amount: state.player.loan.amount + 2299 }, log: addLog(state.player.log, 'loan', `Deferred this month's loan payment. A penalty was applied.`, state.date) } };
        }
        case 'CHOOSE_PENALTY': {
            const { type, loanAmount } = action.payload;
            const newState = {...state, player: {...state.player}, penaltyRequired: null };
            if (type === 'fine') {
                const fine = loanAmount * 0.3;
                newState.player.cash -= fine;
                newState.player.log = addLog(newState.player.log, 'loan', `Paid a fine of ${formatCurrency(fine)} for loan abuse.`, newState.date);
            } else { // ban
                const stateOwnedAssets = Object.values(ASSETS).filter(a => a.isStateOwned).map(a => a.id);
                const expiryDate = advanceDate(state.date, 30);
                const newBan: TradeBan = { assetIds: stateOwnedAssets, expiryDate };
                newState.player.tradeBans = [...newState.player.tradeBans, newBan];
                newState.player.log = addLog(newState.player.log, 'loan', `Received a 30-day trading ban on state-owned assets for loan abuse.`, newState.date);
            }
            return newState;
        }
        case 'CHANGE_RESIDENCY': {
            if (state.player.cash < action.payload.cost) return state;
            const countryName = COUNTRIES.find(c => c.id === action.payload.countryId)?.name || 'an unknown country';
            return { ...state, player: { ...state.player, cash: state.player.cash - action.payload.cost, currentResidency: action.payload.countryId, residencyHistory: [...state.player.residencyHistory, action.payload.countryId], log: addLog(state.player.log, 'politics', `Successfully immigrated to ${countryName}.`, state.date) } };
        }
        case 'EXECUTE_POLITICAL_ACTION': {
            const { type, countryId, party, amount } = action.payload;
            if (state.player.cash < amount) return state;
            const pcGain = Math.floor(amount / 10000);
            return { ...state, player: { ...state.player, cash: state.player.cash - amount, politicalCapital: { ...state.player.politicalCapital, [countryId]: (state.player.politicalCapital[countryId] || 0) + pcGain }, log: addLog(state.player.log, 'politics', `Donated ${formatCurrency(amount)} to ${party} in ${countryId} and gained ${pcGain} Political Capital.`, state.date) } };
        }
        case 'EXECUTE_LOCAL_LOBBY': {
            const { category, costPC } = action.payload;
            const currentPC = state.player.politicalCapital[state.player.currentResidency] || 0;
            if (currentPC < costPC) return state;
            const newState = { ...state };
            newState.player.politicalCapital[newState.player.currentResidency] -= costPC;
            const country = COUNTRIES.find(c => c.id === newState.player.currentResidency)!;
            country.localMarkets.forEach(assetId => {
                if (newState.assets[assetId].category === category) {
                    newState.assets[assetId].trend += 0.0005; // Temporary boost
                }
            });
            newState.player.log = addLog(newState.player.log, 'politics', `Successfully lobbied for the ${category} industry, boosting local market trends.`, newState.date);
            return newState;
        }
        case 'EXECUTE_GLOBAL_INFLUENCE': {
            const { factor, direction, costPC, costCash } = action.payload;
            const totalPC = Object.values(state.player.politicalCapital).reduce((s, v) => s + v, 0);
            if (totalPC < costPC || state.player.cash < costCash) return state;

            const newState = { ...state };
            newState.player.cash -= costCash;
            // Distribute PC cost across countries
            let remainingCost = costPC;
            for (const countryId in newState.player.politicalCapital) {
                const pc = newState.player.politicalCapital[countryId];
                const deduction = Math.min(pc, remainingCost);
                newState.player.politicalCapital[countryId] -= deduction;
                remainingCost -= deduction;
                if (remainingCost <= 0) break;
            }

            const rand = Math.random();
            const effectMagnitude = (direction === 'promote' ? 1 : -1) * 0.15;
            if (rand < 0.7) { // Success
                newState.globalFactors[factor] = Math.max(0, Math.min(1, newState.globalFactors[factor] + effectMagnitude));
                newState.player.log = addLog(newState.player.log, 'politics', `Global influence operation on ${factor} was a success.`, newState.date);
            } else if (rand < 0.9) { // Failure
                newState.player.log = addLog(newState.player.log, 'politics', `Global influence operation on ${factor} failed with no effect.`, newState.date);
            } else { // Backfire
                newState.globalFactors[factor] = Math.max(0, Math.min(1, newState.globalFactors[factor] - effectMagnitude));
                newState.player.log = addLog(newState.player.log, 'politics', `DISASTER! Global influence operation on ${factor} backfired, causing the opposite effect!`, newState.date);
            }
            return newState;
        }
         case 'PLACE_PENDING_ORDER': {
            return { ...state, player: { ...state.player, pendingOrders: [...state.player.pendingOrders, action.payload], log: addLog(state.player.log, 'trade', `Placed a ${action.payload.type} order for ${ASSETS[action.payload.assetId].name}.`, state.date) } };
        }
        case 'CANCEL_PENDING_ORDER': {
            const order = state.player.pendingOrders.find(o => o.id === action.payload.orderId);
            return { ...state, player: { ...state.player, pendingOrders: state.player.pendingOrders.filter(o => o.id !== action.payload.orderId), log: addLog(state.player.log, 'trade', `Cancelled pending order for ${ASSETS[order!.assetId].name}.`, state.date) } };
        }
        case 'DISMISS_MAJOR_EVENT': {
            return { ...state, majorEvent: null };
        }
        default:
            return state;
    }
};