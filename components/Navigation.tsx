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
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-slate-900/80 backdrop-blur-md border-t md:border-t-0 md:border-b border-slate-700 h-16 md:h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
            O
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            OmniCreate
          </span>
        </div>

        <div className="flex flex-1 md:flex-none justify-around md:justify-center md:gap-8">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-lg transition-all duration-300 ${
                currentMode === item.mode
                  ? 'text-cyan-400 bg-cyan-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
              {currentMode === item.mode && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 md:bottom-auto md:top-full w-full h-0.5 bg-cyan-400 hidden md:block"
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
           <button 
             onClick={onShowQR}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
           >
             <Smartphone className="w-4 h-4 text-cyan-400" />
             <span className="text-sm font-medium">Mobile Connect</span>
           </button>
        </div>
      </div>
    </nav>
  );
};