import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Image, Edit3, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryProps {
  items: HistoryItem[];
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ items, onClear }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'RESUME': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'POSTER': return <Image className="w-5 h-5 text-emerald-400" />;
      case 'FORM': return <Edit3 className="w-5 h-5 text-teal-400" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
        <h2 className="text-2xl font-bold font-serif flex items-center gap-2 text-amber-100">
          <Clock className="text-amber-500" />
          History
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-sm border border-transparent hover:border-red-400/30"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 bg-neutral-900/30 rounded-2xl border border-neutral-800">
             <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
             <p className="font-light">No history yet. Start creating!</p>
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-4 rounded-xl flex gap-4 items-start group hover:border-amber-500/40 transition-colors"
            >
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 group-hover:border-amber-500/20 transition-colors">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-amber-100">{item.type} Generation</h3>
                  <span className="text-xs text-neutral-500 font-mono">{formatDate(item.timestamp)}</span>
                </div>
                <p className="text-sm text-neutral-400 mt-1 truncate">
                  {item.summary || 'No description'}
                </p>
                {item.preview && (
                  <div className="mt-3">
                    <img 
                      src={item.preview} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg border border-neutral-700 group-hover:border-amber-500/30 transition-colors"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};