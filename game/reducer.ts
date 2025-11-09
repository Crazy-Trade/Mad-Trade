// game/reducer.ts
import { GameState, GameAction, PortfolioItem, MarginPosition, Company, LogEntry, CompanyEffect, UpgradeOutcome } from './types';
import { getInitialState, COMPANY_TYPES, COUNTRIES } from './database';
import { DAY_DURATION_MS, PRICE_UPDATE_INTERVAL_MS, applyIntradayNoise, updateAllPrices, processEvents, generateDailyNewsSchedule } from './engine';

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
            return { ...state, language: action.payload };
        
        case 'TICK': {
            if (state.isPaused) return state;

            const { deltaTime } = action.payload;
            const newDayProgress = state.date.dayProgress + (deltaTime * state.gameSpeed) / DAY_DURATION_MS;
            
            const newState = { ...state };
            let newPriceAccumulator = state.priceUpdateAccumulator + (deltaTime * state.gameSpeed);

            if (newPriceAccumulator >= PRICE_UPDATE_INTERVAL_MS) {
                newState.assets = applyIntradayNoise(state.assets);
                newPriceAccumulator = 0;
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
                date: { ...state.date, dayProgress: newDayProgress, hour: currentHour },
                priceUpdateAccumulator: newPriceAccumulator,
                dailyNewsSchedule: newSchedule,
                newsTicker: newsAdded ? newTicker : state.newsTicker,
            };
        }
        
        case 'ADVANCE_DAY': {
            const nextDay = new Date(state.date.year, state.date.month - 1, state.date.day + 1);
            
            // Monthly updates
            let playerCash = state.player.cash;
            let playerLoan = state.player.loan.amount;
            const newCompanies = JSON.parse(JSON.stringify(state.player.companies)) as Company[];
            let newLog = [...state.player.log];

            if (nextDay.getDate() === 1) {
                let totalIncome = 0;
                newCompanies.forEach(company => {
                    let companyIncome = company.monthlyIncome;
                    const incomeHaltEffect = company.effects.find(e => e.type === 'income_halt');
                    if(incomeHaltEffect) {
                        companyIncome = 0;
                        incomeHaltEffect.durationMonths -= 1;
                        if (incomeHaltEffect.durationMonths <= 0) {
                            company.effects = company.effects.filter(e => e.type !== 'income_halt');
                        }
                    }
                    totalIncome += companyIncome;
                });
                playerCash += totalIncome;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'corporate', message: `Received $${totalIncome.toFixed(2)} in monthly income.`});

                const countryTax = COUNTRIES.find(c => c.id === state.player.currentResidency)?.taxRate || 0;
                const taxAmount = totalIncome * countryTax;
                playerCash -= taxAmount;
                newLog.push({id: crypto.randomUUID(), date: state.date, type: 'system', message: `Paid $${taxAmount.toFixed(2)} in corporate taxes.`});

                if (playerLoan > 0) {
                    const interestAmount = playerLoan * (state.player.loan.interestRate / 12);
                    playerCash -= interestAmount;
                    newLog.push({id: crypto.randomUUID(), date: state.date, type: 'loan', message: `Paid $${interestAmount.toFixed(2)} in loan interest.`});
                }
            }

            const eventsResult = processEvents(state);
            const newsScheduleResult = generateDailyNewsSchedule(state);

            return {
                ...state,
                date: {
                    year: nextDay.getFullYear(),
                    month: nextDay.getMonth() + 1,
                    day: nextDay.getDate(),
                    hour: 0,
                    dayProgress: 0,
                },
                assets: updateAllPrices({ ...state, globalFactors: eventsResult.globalFactors || state.globalFactors }),
                globalFactors: newsScheduleResult.factors,
                ...eventsResult,
                majorEvent: state.majorEventQueue.length > 0 ? state.majorEventQueue[0] : null,
                majorEventQueue: state.majorEventQueue.slice(1),
                dailyNewsSchedule: newsScheduleResult.schedule,
                newsTicker: [], // Clear ticker for the new day
                player: {
                    ...state.player,
                    cash: playerCash,
                    companies: newCompanies,
                    log: newLog,
                },
            };
        }

        case 'SKIP_TO_NEXT_DAY':
            return {
                ...state,
                date: { ...state.date, dayProgress: 1 }
            };

        case 'SET_INITIAL_STATE': {
            const { countryId } = action.payload;
            const politicalCapital = { [countryId]: 100 };
            return {
                ...state,
                isPaused: false,
                player: {
                    ...state.player,
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

        case 'TAKE_LOAN':
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash + action.payload,
                    loan: { ...state.player.loan, amount: state.player.loan.amount + action.payload }
                }
            };
        
        case 'REPAY_LOAN':
            const repayAmount = Math.min(action.payload, state.player.loan.amount);
            if(state.player.cash < repayAmount) return state;
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - repayAmount,
                    loan: { ...state.player.loan, amount: state.player.loan.amount - repayAmount }
                }
            };

        case 'CHANGE_RESIDENCY': {
            const { countryId, cost } = action.payload;
            if (state.player.cash < cost) return state;

            const newLogEntry: LogEntry = { id: crypto.randomUUID(), date: state.date, type: 'system', message: `Changed residency to ${countryId} for $${cost.toFixed(2)}.` };
            
            return {
                ...state,
                player: {
                    ...state.player,
                    cash: state.player.cash - cost,
                    currentResidency: countryId,
                    residencyHistory: [...state.player.residencyHistory, countryId],
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
