import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ isOpen, onClose }) => {
  const url = window.location.href;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(251,191,36,0.1)] text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-amber-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold font-serif text-amber-100 mb-2">Scan to Mobile</h3>
            <p className="text-neutral-400 mb-6">Open this luxury suite instantly on your phone.</p>
            
            <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
              <QRCodeSVG value={url} size={200} level="H" includeMargin />
            </div>
            
            <p className="text-xs text-neutral-500 mt-6">
              Works on iOS and Android camera apps
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};