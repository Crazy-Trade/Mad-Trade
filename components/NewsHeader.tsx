// components/NewsHeader.tsx
import React from 'react';
import { MajorEvent, NewsItem, Language } from '../game/types';
import NewsTicker from './NewsTicker';
import { t } from '../game/translations';

interface NewsHeaderProps {
    majorEvent: MajorEvent | null;
    tickerNews: NewsItem[];
    language: Language;
}

const NewsHeader: React.FC<NewsHeaderProps> = ({ majorEvent, tickerNews, language }) => {
    return (
        <div className="bg-stone-900 border-b-2 border-amber-400 shadow-lg">
            <div className="p-4 px-6 border-b border-stone-800">
                <h2 className="text-lg font-bold text-rose-500">{t('breakingNews', language)}</h2>
                <p className="text-stone-300">
                    {majorEvent ? t(majorEvent.titleKey, language) : 'Market activity is stable. Analysts watch for key economic indicators.'}
                </p>
            </div>
            <div className="bg-stone-800/50 p-2 text-stone-300 text-sm">
                <NewsTicker news={tickerNews} />
            </div>
        </div>
    );
};

export default NewsHeader;