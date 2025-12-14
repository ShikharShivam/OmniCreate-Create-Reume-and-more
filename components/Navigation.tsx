import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Edit3, History, Home, Smartphone } from 'lucide-react';
import { AppMode } from '../types';

interface NavigationProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onShowQR: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentMode, setMode, onShowQR }) => {
  const navItems = [
    { mode: AppMode.HOME, icon: Home, label: 'Home' },
    { mode: AppMode.RESUME, icon: FileText, label: 'Resume' },
    { mode: AppMode.POSTER, icon: Image, label: 'Poster' },
    { mode: AppMode.FORM, icon: Edit3, label: 'Form Fill' },
    { mode: AppMode.HISTORY, icon: History, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-neutral-950/80 backdrop-blur-xl border-t md:border-t-0 md:border-b border-amber-500/20 h-16 md:h-20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 cursor-pointer group" onClick={() => setMode(AppMode.HOME)}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center font-bold text-neutral-900 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <span className="font-serif text-xl">O</span>
          </div>
          <span className="text-xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-wide">
            OmniCreate
          </span>
        </div>

        <div className="flex flex-1 md:flex-none justify-around md:justify-center md:gap-8">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
                currentMode === item.mode
                  ? 'text-amber-400'
                  : 'text-neutral-500 hover:text-amber-200'
              }`}
            >
               {currentMode === item.mode && (
                 <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-100 rounded-lg" />
               )}
              <item.icon className={`w-6 h-6 md:w-5 md:h-5 ${currentMode === item.mode ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}`} />
              <span className="text-xs md:text-sm font-medium tracking-wide">{item.label}</span>
              {currentMode === item.mode && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 md:bottom-auto md:top-full w-full h-0.5 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 hidden md:block shadow-[0_0_10px_#fbbf24]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
           <button 
             onClick={onShowQR}
             className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-900 to-neutral-900 hover:from-emerald-800 hover:to-neutral-800 rounded-full border border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-500/20 group"
           >
             <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
             <span className="text-sm font-medium text-emerald-100">Mobile Connect</span>
           </button>
        </div>
      </div>
    </nav>
  );
};