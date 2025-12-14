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
      case 'RESUME': return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'POSTER': return <Image className="w-5 h-5 text-purple-400" />;
      case 'FORM': return <Edit3 className="w-5 h-5 text-green-400" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-orange-400" />
          History
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50">
             <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
             <p>No history yet. Start creating!</p>
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm flex gap-4 items-start"
            >
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-200">{item.type} Generation</h3>
                  <span className="text-xs text-slate-500 font-mono">{formatDate(item.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1 truncate">
                  {item.summary || 'No description'}
                </p>
                {item.preview && (
                  <div className="mt-3">
                    <img 
                      src={item.preview} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg border border-slate-700"
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