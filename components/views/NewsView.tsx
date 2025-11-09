// components/views/NewsView.tsx
import React from 'react';
import { NewsViewProps } from '../../game/types';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../../game/translations.js';

const NewsView: React.FC<NewsViewProps> = ({ newsArchive, language }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-amber-400 mb-4">{t('newsArchive', language)}</h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 h-[60vh] overflow-y-auto">
                {newsArchive.length === 0 ? (
                    <p className="text-stone-500 text-center">{t('noNews', language)}</p>
                ) : (
                    <div className="space-y-4">
                        {newsArchive.map(item => (
                            <div key={item.id} className="text-sm border-b border-stone-800 pb-2">
                                <p className="text-stone-300">
                                    <span className={`font-bold ${item.isMajor ? 'text-rose-500' : 'text-sky-400'}`}>{item.source}:</span> {item.headline}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsView;