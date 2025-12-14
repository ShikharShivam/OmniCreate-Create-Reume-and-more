import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { ResumeBuilder } from './components/ResumeBuilder';
import { PosterMaker } from './components/PosterMaker';
import { FormFiller } from './components/FormFiller';
import { History } from './components/History';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { AppMode, HistoryItem } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('omniHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (item: HistoryItem) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem('omniHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('omniHistory');
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.RESUME:
        return <ResumeBuilder onSave={addToHistory} />;
      case AppMode.POSTER:
        return <PosterMaker onSave={addToHistory} />;
      case AppMode.FORM:
        return <FormFiller onSave={addToHistory} />;
      case AppMode.HISTORY:
        return <History items={history} onClear={clearHistory} />;
      case AppMode.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-3xl mx-auto space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative"
            >
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 animate-pulse rounded-full" />
              <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-200">
                OmniCreate
              </h1>
              <p className="relative text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
                The ultimate AI suite for professionals. Create resumes, design posters, and fill forms intelligently.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-12">
              {[
                { title: 'Resume Builder', desc: 'Craft professional CVs instantly', mode: AppMode.RESUME, color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
                { title: 'Poster Studio', desc: 'Generate stunning visuals & ads', mode: AppMode.POSTER, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
                { title: 'Smart Forms', desc: 'Auto-fill documents with context', mode: AppMode.FORM, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
              ].map((card) => (
                <motion.button
                  key={card.title}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(card.mode)}
                  className={`relative p-6 rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} backdrop-blur-sm text-left group overflow-hidden`}
                >
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                   <p className="text-sm text-slate-300 mb-4">{card.desc}</p>
                   <div className="flex items-center text-xs font-bold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                     Start <ArrowRight className="w-3 h-3 ml-1" />
                   </div>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-800 w-full flex justify-center">
               <button onClick={() => setShowQR(true)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                 <Sparkles className="w-4 h-4" /> Try on mobile? Scan QR Code
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-0 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-cyan-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <Navigation currentMode={mode} setMode={setMode} onShowQR={() => setShowQR(true)} />
      
      <main className="relative max-w-7xl mx-auto px-4 pt-8 md:pt-32 pb-8 min-h-screen">
        <AnimatePresence mode='wait'>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <QRCodeDisplay isOpen={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
};