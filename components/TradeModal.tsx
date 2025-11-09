// components/TradeModal.tsx
import React, { useState } from 'react';
import { TradeModalProps } from '../game/types';
import Modal from './Modal';
import { formatCurrency, getFractionDigits } from '../utils';
import { PlusIcon, MinusIcon } from './Icons';
import { t } from '../game/translations';

const TradeModal: React.FC<TradeModalProps> = ({ onClose, asset, portfolioItem, playerCash, dispatch, language }) => {
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState<'spot' | 'margin'>('spot');
    const [quantity, setQuantity] = useState(1);
    const [leverage, setLeverage] = useState(2);

    const isBuy = tradeType === 'buy';
    const totalCost = quantity * asset.price;
    const marginCost = totalCost / leverage;
    const canAfford = orderType === 'spot' ? playerCash >= totalCost : playerCash >= marginCost;
    const hasEnoughToSell = portfolioItem ? portfolioItem.quantity >= quantity : false;

    const maxBuy = Math.floor(playerCash / asset.price);
    const maxSell = portfolioItem?.quantity || 0;

    const handleConfirm = () => {
        if (orderType === 'spot') {
            dispatch({ type: 'SPOT_TRADE', payload: { assetId: asset.id, quantity, price: asset.price, type: tradeType } });
        } else { // Margin
            dispatch({ type: 'OPEN_MARGIN_POSITION', payload: { assetId: asset.id, quantity, price: asset.price, leverage, type: isBuy ? 'long' : 'short' } });
        }
        onClose();
    };
    
    return (
        <Modal onClose={onClose} title={`${t('trade', language)} ${asset.name}`} lang={language}>
            <div>
                {/* Order Type Tabs */}
                <div className="flex border-b border-stone-700 mb-4">
                    <button onClick={() => setOrderType('spot')} className={`px-4 py-2 text-sm font-bold ${orderType === 'spot' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-400'}`}>Spot</button>
                    <button onClick={() => setOrderType('margin')} className={`px-4 py-2 text-sm font-bold ${orderType === 'margin' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-400'}`}>Margin</button>
                </div>

                {/* Trade Type Tabs */}
                <div className="flex justify-center space-x-2 mb-4">
                    <button onClick={() => setTradeType('buy')} className={`w-full py-2 rounded-md font-bold ${isBuy ? 'bg-emerald-500 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>{t('buy', language)}</button>
                    <button onClick={() => setTradeType('sell')} className={`w-full py-2 rounded-md font-bold ${!isBuy ? 'bg-rose-500 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>{t(orderType === 'spot' ? 'sell' : 'short', language)}</button>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center justify-between bg-stone-800 p-3 rounded-md mb-4">
                    <span className="text-stone-400">{t('quantity', language)}</span>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="p-1 bg-stone-700 rounded-full"><MinusIcon /></button>
                        <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-24 bg-transparent text-center font-bold text-lg focus:outline-none" />
                        <button onClick={() => setQuantity(q => q+1)} className="p-1 bg-stone-700 rounded-full"><PlusIcon /></button>
                    </div>
                     <button onClick={() => setQuantity(isBuy ? maxBuy : maxSell)} className="text-amber-400 text-xs font-bold hover:underline">{t('max', language)}</button>
                </div>
                
                {/* Leverage Selector */}
                {orderType === 'margin' && (
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-stone-400 mb-2">{t('leverage', language)}</label>
                        <div className="flex justify-center space-x-2">
                            {[2, 5, 10].map(l => (
                                <button key={l} onClick={() => setLeverage(l)} className={`w-full py-2 rounded-md font-bold ${leverage === l ? 'bg-violet-500 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>x{l}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between"><span>{t('price', language)}:</span><span>{formatCurrency(asset.price, { maximumFractionDigits: getFractionDigits(asset.price) })}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span className="text-amber-400">{orderType === 'spot' ? t('total', language) : t('margin', language)}:</span><span className="text-amber-400">{formatCurrency(orderType === 'spot' ? totalCost : marginCost)}</span></div>
                </div>

                {/* Confirm Button */}
                <button 
                    onClick={handleConfirm} 
                    disabled={isBuy ? !canAfford : !hasEnoughToSell}
                    className={`w-full mt-6 py-3 rounded-md font-bold text-white transition-colors ${isBuy ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800' : 'bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800'} disabled:cursor-not-allowed disabled:text-stone-400`}
                >
                    {t('confirm', language)}
                </button>
            </div>
        </Modal>
    );
};

export default TradeModal;
