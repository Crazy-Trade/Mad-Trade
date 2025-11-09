// components/ChartModal.tsx
import React, { useState, useMemo } from 'react';
import { ChartModalProps, PriceHistory } from '../game/types';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatCurrency, getFractionDigits } from '../utils';

type TimeRange = 3 | 7 | 365;

const ChartModal: React.FC<ChartModalProps> = ({ onClose, asset, language }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>(7);

    const chartData = useMemo(() => {
        return asset.priceHistory.slice(-timeRange);
    }, [asset.priceHistory, timeRange]);

    const renderChart = () => {
        if (chartData.length < 2) {
            return <div className="h-64 flex items-center justify-center text-stone-500">{t('noData', language)}</div>;
        }

        const width = 500;
        const height = 200;
        const padding = 20;

        const prices = chartData.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
            const y = height - padding - ((d.price - minPrice) / (priceRange || 1)) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');
        
        const isUp = chartData[chartData.length - 1].price >= chartData[0].price;
        const strokeColor = isUp ? '#22c55e' : '#ef4444';

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Gradient */}
                <defs>
                    <linearGradient id={`gradient-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis labels */}
                <text x={width - padding + 5} y={padding + 5} fill="#a8a29e" fontSize="10" textAnchor="start">{formatCurrency(maxPrice, { maximumFractionDigits: getFractionDigits(maxPrice) })}</text>
                <text x={width - padding + 5} y={height - padding} fill="#a8a29e" fontSize="10" textAnchor="start">{formatCurrency(minPrice, { maximumFractionDigits: getFractionDigits(minPrice) })}</text>

                {/* X-axis labels */}
                <text x={padding} y={height - 5} fill="#a8a29e" fontSize="10" textAnchor="start">{`${chartData[0].date.day}/${chartData[0].date.month}`}</text>
                <text x={width-padding} y={height-5} fill="#a8a29e" fontSize="10" textAnchor="end">{`${chartData[chartData.length-1].date.day}/${chartData[chartData.length-1].date.month}`}</text>
                
                {/* Area fill */}
                <polygon points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`} fill={`url(#gradient-${asset.id})`} />
                
                {/* Line */}
                <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    points={points}
                    style={{
                        strokeDasharray: 500,
                        strokeDashoffset: 500,
                        animation: 'dash 1s ease-out forwards'
                    }}
                />
                 <style>{`
                    @keyframes dash {
                        to {
                            stroke-dashoffset: 0;
                        }
                    }
                `}</style>
            </svg>
        );
    };

    return (
        <Modal onClose={onClose} title={`${t('priceChart', language)}: ${asset.name}`} lang={language}>
            <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                    {[3, 7, 365].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as TimeRange)}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${timeRange === range ? 'bg-amber-400 text-stone-900' : 'bg-stone-800 hover:bg-stone-700'}`}
                        >
                            {range === 3 && t('threeDays', language)}
                            {range === 7 && t('oneWeek', language)}
                            {range === 365 && t('oneYear', language)}
                        </button>
                    ))}
                </div>
                <div>
                    {renderChart()}
                </div>
            </div>
        </Modal>
    );
};

export default ChartModal;