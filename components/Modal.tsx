// components/Modal.tsx
import React from 'react';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
    lang: 'en' | 'fa';
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, lang }) => {
    const isRtl = lang === 'fa';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-lg shadow-xl w-full max-w-lg animate-modal-fade-in"
                 onClick={(e) => e.stopPropagation()}>
                <div className={`flex items-center justify-between p-4 border-b border-stone-800 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <h3 className="text-lg font-bold text-amber-400">{title}</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
