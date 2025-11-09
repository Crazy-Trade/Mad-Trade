// components/views/BankView.tsx
import React, { useState, useMemo } from 'react';
import { BankViewProps } from '../../game/types';
import { t } from '../../game/translations';
import { formatCurrency, formatPercent } from '../../utils';

const BankView: React.FC<BankViewProps> = ({ loan, netWorth, playerCash, dispatch, language }) => {
    const [loanAmount, setLoanAmount] = useState(100000);
    const [repayAmount, setRepayAmount] = useState(100000);

    const loanLimit = useMemo(() => Math.max(100000, netWorth * 0.5), [netWorth]);
    const canTakeLoan = loan.amount + loanAmount <= loanLimit;
    const canRepayLoan = playerCash >= repayAmount && repayAmount > 0;

    const handleTakeLoan = () => {
        if (!canTakeLoan) return;
        dispatch({ type: 'TAKE_LOAN', payload: loanAmount });
    };

    const handleRepayLoan = () => {
        if (!canRepayLoan) return;
        dispatch({ type: 'REPAY_LOAN', payload: repayAmount });
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loan Status */}
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('bankingServices', language)}</h2>
                <div className="space-y-4">
                     <div className="flex justify-between items-baseline">
                        <span className="text-stone-400">{t('currentLoan', language)}:</span>
                        <span className="font-bold text-lg text-rose-400">{formatCurrency(loan.amount)}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-stone-400">{t('interestRate', language)}:</span>
                        <span className="font-mono text-lg">{formatPercent(loan.interestRate)}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-stone-400">{t('loanLimit', language)}:</span>
                        <span className="font-mono text-lg">{formatCurrency(loanLimit)}</span>
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
