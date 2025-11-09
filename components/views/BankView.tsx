// components/views/BankView.tsx
import React, { useState, useMemo } from 'react';
import { BankViewProps } from '../../game/types';
import { t } from '../../game/translations';
import { formatCurrency, formatPercent } from '../../utils';

const BankView: React.FC<BankViewProps> = ({ loan, netWorth, playerCash, dispatch, setActiveModal, language }) => {
    const [loanAmount, setLoanAmount] = useState(100000);
    const [repayAmount, setRepayAmount] = useState(100000);

    const loanLimit = useMemo(() => Math.max(100000, netWorth * 0.5), [netWorth]);
    const canTakeLoan = loan.amount + loanAmount <= loanLimit;
    const canRepayLoan = playerCash >= (repayAmount * 0.98) && repayAmount > 0; // Account for discount
    const monthlyPayment = loan.amount > 0 ? (loan.amount * 0.02) + (loan.amount * (loan.interestRate / 12)) : 0;
    const canDefer = loan.defermentsUsed < 24 && !loan.isDeferredThisMonth;

    const handleTakeLoan = () => {
        if (!canTakeLoan) return;
        dispatch({ type: 'TAKE_LOAN', payload: loanAmount });
    };

    const handleRepayLoan = () => {
        if (!canRepayLoan) return;
        dispatch({ type: 'REPAY_LOAN', payload: repayAmount });
    };

    const handleDeferPayment = () => {
        if (!canDefer) return;
        dispatch({ type: 'DEFER_LOAN_PAYMENT' });
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loan Status & Analyst */}
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold text-amber-400 mb-4">{t('bankingServices', language)}</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-stone-400">{t('currentLoan', language)}:</span>
                            <span className="font-bold text-lg text-rose-400">{formatCurrency(loan.amount)}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-stone-400">{t('monthlyPayment', language)}:</span>
                            <span className="font-mono text-lg">{formatCurrency(monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-stone-400">{t('interestRate', language)}:</span>
                            <span className="font-mono text-lg">{formatPercent(loan.interestRate)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-stone-400">{t('loanLimit', language)}:</span>
                            <span className="font-mono text-lg">{formatCurrency(loanLimit)}</span>
                        </div>
                         <div className="border-t border-stone-800 my-4"></div>
                        <button 
                            onClick={handleDeferPayment} 
                            disabled={!canDefer}
                            className="w-full bg-yellow-600 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors disabled:bg-stone-700 disabled:cursor-not-allowed disabled:text-stone-400"
                        >
                            {loan.isDeferredThisMonth ? 'Payment Deferred' : t('deferPayment', language)}
                        </button>
                         <p className="text-center text-xs text-stone-400">
                             {canDefer 
                                ? t('defermentsRemaining', language, { count: (24 - loan.defermentsUsed).toString() })
                                : t('noDeferments', language)
                             }
                         </p>
                    </div>
                </div>
                 <div>
                    <h2 className="text-xl font-bold text-amber-400 mb-4 mt-8">{t('analyst', language)}</h2>
                    <div className="space-y-3">
                         <button
                            onClick={() => setActiveModal({ type: 'analyst', analysisType: 'prediction' })}
                            className="w-full bg-violet-600 text-white font-bold py-2 px-4 rounded-md hover:bg-violet-700 transition-colors"
                         >
                             {t('marketPrediction', language)} ({formatCurrency(70000)})
                        </button>
                        <button
                            onClick={() => setActiveModal({ type: 'analyst', analysisType: 'analysis' })}
                            className="w-full bg-violet-600 text-white font-bold py-2 px-4 rounded-md hover:bg-violet-700 transition-colors"
                         >
                             {t('trendAnalysis', language)} ({formatCurrency(35000)})
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('takeLoan', language)}</h3>
                    <div className="flex space-x-2">
                        <input type="number" step="10000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        <button onClick={handleTakeLoan} disabled={!canTakeLoan} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
                            {t('confirm', language)}
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('repayLoan', language)}</h3>
                     <p className="text-xs text-stone-400 mb-2">Receive a 2% discount on early manual repayments.</p>
                    <div className="flex space-x-2">
                        <input type="number" step="10000" value={repayAmount} onChange={e => setRepayAmount(Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        <button onClick={handleRepayLoan} disabled={!canRepayLoan} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-emerald-800 disabled:cursor-not-allowed">
                            {t('confirm', language)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankView;
