// components/ChartModal.tsx
import React, { useState, useMemo, useRef } from 'react';
import { ChartModalProps, PriceHistory, Candle } from '../game/types';
import Modal from './Modal';
import { t } from '../game/translations';
import { formatCurrency, getFractionDigits } from '../utils';

type TimeRange = '3D' | '1W' | '1M' | '1Y';

interface ChartDataPoint extends Candle {
    sma?: number;
}

const ChartModal: React.FC<ChartModalProps> = ({ onClose, asset, language }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartDataPoint } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const chartData = useMemo(() => {
        const history = asset.priceHistory;
        let days: number;
        switch (timeRange) {
            case '3D': days = 3; break;
            case '1W': days = 7; break;
            case '1M': days = 30; break;
            case '1Y': days = 365; break;
            default: days = 30;
        }

        const relevantHistory = history.slice(-days * 2); // Get more data for SMA calculation
        if (relevantHistory.length === 0) return [];

        let aggregatedData: Candle[];
        if (days > 60) {
            const candles: Candle[] = [];
            let weekData: PriceHistory[] = [];
            relevantHistory.forEach((day, index) => {
                weekData.push(day);
                if ((index + 1) % 7 === 0 || index === relevantHistory.length - 1) {
                    candles.push({
                        date: weekData[0].date,
                        open: weekData[0].open,
                        high: Math.max(...weekData.map(d => d.high)),
                        low: Math.min(...weekData.map(d => d.low)),
                        close: weekData[weekData.length - 1].close,
                    });
                    weekData = [];
                }
            });
            aggregatedData = candles;
        } else {
             aggregatedData = relevantHistory;
        }

        // Calculate 7-period SMA
        const dataWithSma: ChartDataPoint[] = aggregatedData.map((d, i, arr) => {
            if (i < 6) return d;
            const sum = arr.slice(i - 6, i + 1).reduce((acc, curr) => acc + curr.close, 0);
            return { ...d, sma: sum / 7 };
        });

        return dataWithSma.slice(-days);

    }, [asset.priceHistory, timeRange]);

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (!svgRef.current || chartData.length === 0) return;
        
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgX = e.clientX - svgRect.left;
        
        const width = 600;
        const padding = 20;
        const chartWidth = width - padding * 2;
        
        const index = Math.round(((svgX - padding) / chartWidth) * (chartData.length - 1));

        if (index >= 0 && index < chartData.length) {
            const dataPoint = chartData[index];
            const x = (index / (chartData.length - 1)) * chartWidth + padding;
            const y = e.clientY - svgRect.top;
            setTooltip({ x, y, data: dataPoint });
        }
    };
    
    const renderChart = () => {
        if (chartData.length < 2) {
            return <div className="h-64 flex items-center justify-center text-stone-500">{t('noData', language)}</div>;
        }

        const width = 600;
        const height = 300;
        const padding = 20;

        const prices = chartData.flatMap(d => [d.open, d.high, d.low, d.close, d.sma].filter(p => p !== undefined) as number[]);
        const minPrice = Math.min(...prices) * 0.99;
        const maxPrice = Math.max(...prices) * 1.01;
        const priceRange = maxPrice - minPrice;

        const candleWidth = (width - padding * 2) / (chartData.length * 1.5);

        const getY = (price: number) => height - padding - ((price - minPrice) / (priceRange || 1)) * (height - padding * 2);
        const getX = (index: number) => (index / (chartData.length - 1)) * (width - padding * 2 - candleWidth) + padding + candleWidth / 2;

        const smaPath = chartData
            .map((d, i) => ({...d, x: getX(i), y: d.sma ? getY(d.sma) : null}))
            .filter(d => d.y !== null)
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.y}`)
            .join(' ');


        return (
            <div className="relative">
                <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
                    {/* Y-axis labels */}
                    <text x={width - padding + 5} y={padding + 5} fill="#a8a29e" fontSize="12" textAnchor="start">{formatCurrency(maxPrice, { maximumFractionDigits: getFractionDigits(maxPrice) })}</text>
                    <text x={width - padding + 5} y={height - padding} fill="#a8a29e" fontSize="12" textAnchor="start">{formatCurrency(minPrice, { maximumFractionDigits: getFractionDigits(minPrice) })}</text>

                    {/* X-axis labels */}
                    <text x={padding} y={height - 5} fill="#a8a29e" fontSize="12" textAnchor="start">{`${chartData[0].date.day}/${chartData[0].date.month}`}</text>
                    <text x={width-padding} y={height-5} fill="#a8a29e" fontSize="12" textAnchor="end">{`${chartData[chartData.length-1].date.day}/${chartData[chartData.length-1].date.month}`}</text>
                    
                    {chartData.map((d, i) => {
                        const x = getX(i);
                        const isUp = d.close >= d.open;
                        const color = isUp ? '#22c55e' : '#ef4444';
                        
                        const openY = getY(d.open);
                        const closeY = getY(d.close);
                        const highY = getY(d.high);
                        const lowY = getY(d.low);

                        return (
                            <g key={i}>
                                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" />
                                <rect x={x - candleWidth / 2} y={isUp ? closeY : openY} width={candleWidth} height={Math.max(1, Math.abs(openY - closeY))} fill={color} />
                            </g>
                        );
                    })}
                    
                    {/* SMA Path */}
                    <path d={smaPath} stroke="#f59e0b" strokeWidth="2" fill="none" />

                </svg>
                {tooltip && (
                    <div className="absolute bg-stone-950/90 border border-stone-700 rounded-md p-2 text-xs text-stone-300 pointer-events-none transition-transform" style={{ top: tooltip.y + 10, left: tooltip.x + 10, transform: `translateX(${tooltip.x > 400 ? '-120%' : '0'})` }}>
                        <div className="font-bold mb-1">{`${tooltip.data.date.day}/${tooltip.data.date.month}/${tooltip.data.date.year}`}</div>
                        <div>O: <span className="font-mono">{formatCurrency(tooltip.data.open, { maximumFractionDigits: getFractionDigits(tooltip.data.open) })}</span></div>
                        <div>H: <span className="font-mono">{formatCurrency(tooltip.data.high, { maximumFractionDigits: getFractionDigits(tooltip.data.high) })}</span></div>
                        <div>L: <span className="font-mono">{formatCurrency(tooltip.data.low, { maximumFractionDigits: getFractionDigits(tooltip.data.low) })}</span></div>
                        <div>C: <span className="font-mono">{formatCurrency(tooltip.data.close, { maximumFractionDigits: getFractionDigits(tooltip.data.close) })}</span></div>
                        {tooltip.data.sma && <div><span className="text-amber-400">{t('sma', language)}:</span> <span className="font-mono">{formatCurrency(tooltip.data.sma, { maximumFractionDigits: getFractionDigits(tooltip.data.sma) })}</span></div>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal onClose={onClose} title={`${t('priceChart', language)}: ${asset.name}`} lang={language}>
            <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                    {(['3D', '1W', '1M', '1Y'] as TimeRange[]).map(range => (
                        <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${timeRange === range ? 'bg-amber-400 text-stone-900' : 'bg-stone-800 hover:bg-stone-700'}`}>
                            {range === '3D' && t('threeDays', language)}
                            {range === '1W' && t('oneWeek', language)}
                            {range === '1M' && '1M'}
                            {range === '1Y' && t('oneYear', language)}
                        </button>
                    ))}
                </div>
                <div>
                    {renderChart()}
                </div>
                 <div className="text-center text-xs text-stone-400">
                    <span className="inline-block w-3 h-3 bg-amber-400 mr-1 align-middle"></span> {t('sma', language)}
                </div>
            </div>
        </Modal>
    );
};

export default ChartModal;