// components/views/CompaniesView.tsx
import React from 'react';
import { CompaniesViewProps, CompanyType } from '../../game/types';
import { formatCurrency } from '../../utils';
import { t } from '../../game/translations';

const companyTypes: CompanyType[] = ['tech', 'mining', 'pharma', 'media'];

const CompaniesView: React.FC<CompaniesViewProps> = ({ companies, playerCash, setActiveModal, language }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('corporateHoldings', language)}</h2>
                <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-800 text-xs text-stone-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('companyName', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('type', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('level', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('monthlyIncome', language)}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions', language)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id} className="border-b border-stone-800 hover:bg-stone-800/50">
                                    <th scope="row" className="px-6 py-4 font-bold text-stone-200">{company.name}</th>
                                    <td className="px-6 py-4">{t(company.type, language)}</td>
                                    <td className="px-6 py-4">{company.level}</td>
                                    <td className="px-6 py-4 font-mono text-emerald-400">{formatCurrency(company.monthlyIncome)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setActiveModal({ type: 'upgrade-company', company })} className="font-semibold text-violet-400 hover:text-violet-300">
                                            {t('upgrade', language)}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                 <h2 className="text-xl font-bold text-amber-400 mb-4">{t('establishCompany', language)}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {companyTypes.map(type => (
                         <div key={type} className="bg-stone-900 border border-stone-800 rounded-lg p-4 text-center">
                             <h3 className="font-bold text-lg mb-2">{t(type, language)}</h3>
                             <button
                                onClick={() => setActiveModal({type: 'company', companyType: type})}
                                className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                             >
                                 {t('establish', language)}
                            </button>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default CompaniesView;
