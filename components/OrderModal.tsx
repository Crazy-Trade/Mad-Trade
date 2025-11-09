// components/OrderModal.tsx
import React from 'react';
import Modal from './Modal';
import { Language } from '../game/types';
import { t } from '../game/translations';

interface OrderModalProps {
    onClose: () => void;
    assetName: string;
    language: Language;
}

const OrderModal: React.FC<OrderModalProps> = ({ onClose, assetName, language }) => {
    return (
        <Modal onClose={onClose} title={`${t('order', language)} ${assetName}`} lang={language}>
            <p className="text-stone-400">Advanced orders (Stop-Loss, Take-Profit, Limit Buy) are planned for a future update. Please use Spot or Margin trading for now.</p>
        </Modal>
    );
};

export default OrderModal;
