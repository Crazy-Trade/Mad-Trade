// components/views/PortfolioView.tsx
import React from 'react';
import { PortfolioViewProps, PortfolioItem, MarginPosition, GameAction } from '../../game/types';
import { formatCurrency, formatNumber, formatPercent, getFractionDigits } from '../../utils';
import { t } from '../../game/translations';

const PortfolioView: React.FC<PortfolioViewProps> = ({ gameState, dispatch, language }) => {
    const { assets, player } = gameState;
    const spotItems = Object.values(player.portfolio as Record<string, PortfolioItem>);
    const marginItems = Object.values(player.marginPositions as Record<string, MarginPosition>);

    const handleClosePosition = (positionId: string) => {
        dispatch({ type: 'CLOSE_MARGIN_POSITION', payload: { positionId } });
    };

    return (
        <div className="space-y-8">
            {/* Spot Holdings */}
            <div>
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('spotHoldings', language)}</h2>
                <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-800 text-xs text-stone-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('assets', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('quantity', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('avgCost', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('price', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('marketValue', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('unrealizedPNL', language)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spotItems.map(item => {
                                const asset = assets[item.assetId];
                                if (!asset) return null;
                                const marketValue = item.quantity * asset.price;
                                const totalCost = item.quantity * item.costBasis;
                                const pnl = marketValue - totalCost;
                                const pnlPercent = totalCost > 0 ? pnl / totalCost : 0;

                                return (
                                    <tr key={item.assetId} className="border-b border-stone-800 hover:bg-stone-800/50">
                                        <th scope="row" className="px-6 py-4 font-bold text-stone-200">{asset.name}</th>
                                        <td className="px-6 py-4">{formatNumber(item.quantity)}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(item.costBasis, { maximumFractionDigits: getFractionDigits(item.costBasis) })}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(asset.price, { maximumFractionDigits: getFractionDigits(asset.price) })}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(marketValue)}</td>
                                        <td className={`px-6 py-4 font-mono ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Margin Positions */}
            <div>
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('marginPositions', language)}</h2>
                <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-stone-800 text-xs text-stone-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('assets', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('type', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('quantity', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('entryPrice', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('marketValue', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('leverage', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('liquidationPrice', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('pnl', language)}</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {marginItems.map(pos => {
                                const asset = assets[pos.assetId];
                                if (!asset) return null;
                                
                                const entryValue = pos.entryPrice * pos.quantity;
                                const currentValue = asset.price * pos.quantity;
                                const pnl = pos.type === 'long' ? currentValue - entryValue : entryValue - currentValue;
                                const pnlPercent = pos.margin > 0 ? pnl / pos.margin : 0;
                                
                                let liquidationPrice = 0;
                                const maintenanceMargin = 0.025; // Example 2.5%
                                if (pos.type === 'long') {
                                    liquidationPrice = pos.entryPrice * (1 - (1 / pos.leverage) + maintenanceMargin);
                                } else { // short
                                    liquidationPrice = pos.entryPrice * (1 + (1 / pos.leverage) - maintenanceMargin);
                                }

                                return (
                                    <tr key={pos.id} className="border-b border-stone-800 hover:bg-stone-800/50">
                                        <th scope="row" className="px-6 py-4 font-bold text-stone-200">{asset.name}</th>
                                        <td className={`px-6 py-4 font-bold ${pos.type === 'long' ? 'text-emerald-500' : 'text-rose-500'}`}>{pos.type.toUpperCase()}</td>
                                        <td className="px-6 py-4">{formatNumber(pos.quantity)}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(pos.entryPrice, {maximumFractionDigits: getFractionDigits(pos.entryPrice)})}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(currentValue)}</td>
                                        <td className="px-6 py-4 text-violet-400 font-bold">{pos.leverage}x</td>
                                        <td className="px-6 py-4 font-mono text-stone-400">{formatCurrency(liquidationPrice, {maximumFractionDigits: getFractionDigits(liquidationPrice)})}</td>
                                        <td className={`px-6 py-4 font-mono ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(pnl)} ({formatPercent(pnlPercent)})</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleClosePosition(pos.id)} className="font-semibold text-sky-400 hover:text-sky-300">{t('close', language)}</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Orders */}
            <div>
                <h2 className="text-xl font-bold text-amber-400 mb-4">{t('pendingOrders', language)}</h2>
                <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-stone-800 text-xs text-stone-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('assets', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('type', language)}</th>
                                <th scope="col" className="px-6 py-3">{t('quantity', language)}</th>
                                <th scope="col" className="px-6 py-3">Limit Price</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions', language)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {player.pendingOrders.map(order => {
                                const asset = assets[order.assetId];
                                if (!asset) return null;

                                return (
                                    <tr key={order.id} className="border-b border-stone-800 hover:bg-stone-800/50">
                                        <th scope="row" className="px-6 py-4 font-bold text-stone-200">{asset.name}</th>
                                        <td className={`px-6 py-4 font-bold ${order.type === 'buy-limit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {order.type === 'buy-limit' ? 'BUY LIMIT' : 'SELL LIMIT'}
                                        </td>
                                        <td className="px-6 py-4">{formatNumber(order.quantity)}</td>
                                        <td className="px-6 py-4 font-mono">{formatCurrency(order.limitPrice, {maximumFractionDigits: getFractionDigits(order.limitPrice)})}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => dispatch({ type: 'CANCEL_PENDING_ORDER', payload: { orderId: order.id } })} className="font-semibold text-sky-400 hover:text-sky-300">
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PortfolioView;
