// components/views/LogView.tsx
import React, { useState } from 'react';
// Fix: Correctly import types from the newly defined types file.
import { LogViewProps, LogEntry, LogType } from '../../game/types';
// Fix: Add .js extension to satisfy module resolution.
import { t } from '../../game/translations.js';

type LogFilter = 'all' | 'trade' | 'corporate' | 'system' | 'loan' | 'politics';

const LogView: React.FC<LogViewProps> = ({ log, language }) => {
    const [filter, setFilter] = useState<LogFilter>('all');
    
    const filters: {id: LogFilter, label: string}[] = [
        { id: 'all', label: 'All' },
        { id: 'trade', label: 'Trades' },
        { id: 'corporate', label: 'Corporate' },
        { id: 'loan', label: 'Bank' },
        { id: 'politics', label: 'Politics' },
        { id: 'system', label: 'System' },
    ];

    const filteredLog = [...log].reverse().filter(entry => filter === 'all' || entry.type === filter);

    const getIconForType = (type: LogEntry['type']) => {
        switch (type) {
            case 'trade': return '🔄';
            case 'corporate': return '🏢';
            case 'loan': return '🏦';
            case 'politics': return '🏛️';
            case 'system': return '⚙️';
            default: return '';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-amber-400">{t('eventLog', language)}</h2>
                <div className="flex items-center space-x-2">
                    {filters.map(f => (
                        <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${filter === f.id ? 'bg-amber-400 text-stone-900' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'}`}>
                            {t(f.id as any, language) || f.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                    {filteredLog.map(entry => (
                        <div key={entry.id} className="text-sm flex items-start">
                            <span className="mr-3 mt-0.5">{getIconForType(entry.type)}</span>
                            <div className="flex-grow">
                                <p className="text-stone-300">{entry.message}</p>
                                <p className="text-xs text-stone-500 font-mono">{`Day ${entry.date.day}, Month ${entry.date.month}, ${entry.date.year}`}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LogView;