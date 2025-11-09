// components/views/BankView.tsx
import React, { useState, useMemo } from 'react';
// Fix: Import `PortfolioItem` to correctly type `reduce` callback.
import { BankViewProps, Asset, PortfolioItem } from '../../game/types';
import { formatCurrency, formatPercent, formatNumber } from '../../utils.js';
import { t } from '../../game/translations.js';
import { ASSETS } from '../../game/database.js';

const BankView: React.FC<BankViewProps> = ({ loan, ventureLoans, revivalLoan, bankruptcyState, companies, netWorth, playerCash, date, dispatch, setActiveModal, language, politicalCapital, portfolio }) => {
    const [loanAmount, setLoanAmount] = useState(100000);
    const [ventureLoanAmount, setVentureLoanAmount] = useState(10000000);
    
    // Eligibility for Venture Loan
    // Fix: Correctly calculate politicalCapitalTotal from props.
    const politicalCapitalTotal = useMemo(() => Object.values(politicalCapital).reduce((sum, val) => sum + val, 0), [politicalCapital]);
    const highIncomeCompany = useMemo(() => companies.some(c => c.monthlyIncome > 200000), [companies]);
    // Fix: Correctly calculate stateOwnedAssetsValue from portfolio prop.
    const stateOwnedAssetsValue = useMemo(() => {
        return Object.values(portfolio).reduce<number>((sum, item: PortfolioItem) => {
            const asset = ASSETS[item.assetId];
            if (asset && asset.isStateOwned) {
                return sum + (asset.price * item.quantity);
            }
            return sum;
        }, 0);
    }, [portfolio]);

    const canGetVentureLoan = politicalCapitalTotal >= 300 || highIncomeCompany || stateOwnedAssetsValue >= 400000;


    const handleTakeLoan = () => dispatch({ type: 'TAKE_LOAN', payload: loanAmount });
    const handleRepayLoan = () => dispatch({ type: 'REPAY_LOAN', payload: Math.min(loanAmount, loan.amount) });
    const handleDeferPayment = () => dispatch({ type: 'DEFER_LOAN_PAYMENT' });
    const handleTakeVentureLoan = () => dispatch({ type: 'TAKE_VENTURE_LOAN', payload: { amount: ventureLoanAmount, interestRate: 0.075 } });
    const handleTakeRevivalLoan = () => dispatch({ type: 'TAKE_REVIVAL_LOAN', payload: { amount: 1000000 } });

    const maxLoan = Math.max(0, (netWorth + playerCash) * 2 - loan.amount);

    const renderRequirement = (label: string, met: boolean) => (
        <div className={`text-xs flex items-center ${met ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span className="mr-2">{met ? '✔' : '✖'}</span>
            <span>{label}</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Standard Loan */}
                <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-amber-400 mb-4">{t('standardLoan', language)}</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span>{t('loanBalance', language)}:</span><span className="font-mono text-rose-400">{formatCurrency(loan.amount)}</span></div>
                        <div className="flex justify-between"><span>{t('interestRate', language)}:</span><span className="font-mono">{formatPercent(loan.interestRate / 12)} / mo</span></div>
                         <div className="flex justify-between"><span>{t('maxLoan', language)}:</span><span className="font-mono">{formatCurrency(maxLoan)}</span></div>

                        <div className="pt-4 space-y-2">
                             <input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                            <div className="flex space-x-2">
                                <button onClick={handleTakeLoan} disabled={loanAmount > maxLoan} className="w-full py-2 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800">{t('takeLoan', language)}</button>
                                <button onClick={handleRepayLoan} disabled={loan.amount <= 0 || playerCash < loanAmount} className="w-full py-2 rounded-md font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800">{t('repayLoan', language)}</button>
                            </div>
                             <button onClick={handleDeferPayment} disabled={loan.defermentsUsed >= 24 || loan.isDeferredThisMonth} className="w-full py-2 rounded-md font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-sm">{t('deferPayment', language)} ({24 - loan.defermentsUsed} left)</button>
                        </div>
                    </div>
                </div>

                 {/* Venture Capital Loan */}
                <div className="bg-stone-900 border-2 border-violet-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-violet-400 mb-4">Venture Capital Loan</h2>
                    <p className="text-sm text-stone-400 mb-4">Secure a massive loan for expansion. Requires establishing a new company within 1 year. The bank takes 20% of the new company's income until 30% of the principal is repaid, on top of monthly loan payments.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <h4 className="font-bold mb-2">Eligibility (Meet one):</h4>
                             <div className="space-y-1">
                                {/* Fix: These checks now work with correctly typed and calculated values. */}
                                {renderRequirement(`> 300 PC (${formatNumber(politicalCapitalTotal)})`, politicalCapitalTotal >= 300)}
                                {renderRequirement(`Company Income > $200k/mo`, highIncomeCompany)}
                                {renderRequirement(`> $400k in State Assets (${formatCurrency(stateOwnedAssetsValue)})`, stateOwnedAssetsValue >= 400000)}
                             </div>
                        </div>
                         <div>
                            <input type="number" value={ventureLoanAmount} onChange={e => setVentureLoanAmount(Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                            <button onClick={handleTakeVentureLoan} disabled={!canGetVentureLoan || playerCash < 0} className="w-full py-2 rounded-md font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800">Apply for Venture Loan</button>
                         </div>
                    </div>
                </div>

                {/* Revival Loan (Conditional) */}
                {bankruptcyState === 'grace_period' && (
                    <div className="bg-rose-900/50 border-2 border-rose-500 rounded-lg p-6 animate-pulse">
                        <h2 className="text-xl font-bold text-rose-300 mb-4">Emergency Revival Loan</h2>
                        <p className="text-sm text-rose-200 mb-4">You are in a grace period. This last-chance loan offers a massive cash injection at a punitive 20% interest rate to avoid bankruptcy. Failure to make the 6 monthly payments will result in immediate game over.</p>
                        <button onClick={handleTakeRevivalLoan} className="w-full py-3 rounded-md font-bold text-white bg-rose-600 hover:bg-rose-700">Accept Revival Loan ({formatCurrency(1000000)})</button>
                    </div>
                )}


            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('analystDesk', language)}</h2>
                <div className="space-y-3">
                    <button onClick={() => setActiveModal({ type: 'analyst', analysisType: 'analysis' })} className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-600">{t('trendAnalysis', language)} ({formatCurrency(35000)})</button>
                    <button onClick={() => setActiveModal({ type: 'analyst', analysisType: 'prediction' })} className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-600">{t('marketPrediction', language)} ({formatCurrency(70000)})</button>
                </div>
            </div>
        </div>
    );
};

export default BankView;