// components/NewsTicker.tsx
import React from 'react';
import { NewsItem } from '../game/types';

interface NewsTickerProps {
    news: NewsItem[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
    if (news.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-ticker inline-block">
                {news.map((item, index) => (
                    <span key={item.id} className="mx-8">
                        <span className="font-bold text-sky-400">{item.source}:</span> {item.headline}
                    </span>
                ))}
            </div>
            {/* Duplicate for seamless looping */}
            <div className="animate-ticker inline-block">
                {news.map((item, index) => (
                    <span key={`${item.id}-dup`} className="mx-8">
                        <span className="font-bold text-sky-400">{item.source}:</span> {item.headline}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;
