// components/OrderModal.tsx
import React, { useState } from 'react';
import { OrderModalProps, PendingOrder } from '../game/types';
import Modal from './Modal';
import { formatCurrency, getFractionDigits } from '../utils';
import { PlusIcon, MinusIcon } from './Icons';
import { t } from '../game/translations';

const OrderModal: React.FC<OrderModalProps> = ({ onClose, asset, portfolioItem, playerCash, dispatch, language }) => {
    const [orderType, setOrderType] = useState<'buy-limit' | 'sell-limit'>('buy-limit');
    const [quantity, setQuantity] = useState(1);
    const [limitPrice, setLimitPrice] = useState(asset.price);

    const isBuy = orderType === 'buy-limit';
    const totalCost = quantity * limitPrice;
    
    const canAfford = playerCash >= totalCost;
    const hasEnoughToSell = portfolioItem ? portfolioItem.quantity >= quantity : false;

    const maxBuy = limitPrice > 0 ? Math.floor(playerCash / limitPrice) : 0;
    const maxSell = portfolioItem?.quantity || 0;

    const handleConfirm = () => {
        const newOrder: PendingOrder = {
            id: crypto.randomUUID(),
            assetId: asset.id,
            type: orderType,
            quantity,
            limitPrice,
        };
        dispatch({ type: 'PLACE_PENDING_ORDER', payload: newOrder });
        onClose();
    };
    
    return (
        <Modal onClose={onClose} title={`${t('order', language)} ${asset.name}`} lang={language}>
            <div>
                {/* Order Type Tabs */}
                <div className="flex justify-center space-x-2 mb-4">
                    <button onClick={() => setOrderType('buy-limit')} className={`w-full py-2 rounded-md font-bold ${isBuy ? 'bg-emerald-500 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>{t('buy', language)} Limit</button>
                    <button onClick={() => setOrderType('sell-limit')} className={`w-full py-2 rounded-md font-bold ${!isBuy ? 'bg-rose-500 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>{t('sell', language)} Limit</button>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center justify-between bg-stone-800 p-3 rounded-md mb-4">
                    <span className="text-stone-400">{t('quantity', language)}</span>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 bg-stone-700 rounded-full"><MinusIcon /></button>
                        <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-24 bg-transparent text-center font-bold text-lg focus:outline-none" />
                        <button onClick={() => setQuantity(q => q + 1)} className="p-1 bg-stone-700 rounded-full"><PlusIcon /></button>
                    </div>
                     <button onClick={() => setQuantity(isBuy ? maxBuy : maxSell)} className="text-amber-400 text-xs font-bold hover:underline">{t('max', language)}</button>
                </div>

                {/* Limit Price Input */}
                <div className="flex items-center justify-between bg-stone-800 p-3 rounded-md mb-4">
                    <span className="text-stone-400">Limit Price</span>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="number" 
                            value={limitPrice} 
                            onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)} 
                            step={asset.price < 1 ? 0.001 : 0.1}
                            className="w-32 bg-transparent text-right font-bold text-lg focus:outline-none" 
                        />
                    </div>
                </div>
                
                {/* Summary */}
                <div className="bg-stone-950 p-4 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between"><span>Current Price:</span><span>{formatCurrency(asset.price, { maximumFractionDigits: getFractionDigits(asset.price) })}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span className="text-amber-400">{t('total', language)}:</span><span className="text-amber-400">{formatCurrency(totalCost)}</span></div>
                </div>

                {/* Confirm Button */}
                <button 
                    onClick={handleConfirm} 
                    disabled={(isBuy ? !canAfford : !hasEnoughToSell) || quantity <= 0}
                    className={`w-full mt-6 py-3 rounded-md font-bold text-white transition-colors ${isBuy ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800' : 'bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800'} disabled:cursor-not-allowed disabled:text-stone-400`}
                >
                    {t('placeOrder', language)}
                </button>
            </div>
        </Modal>
    );
};

export default OrderModal;
