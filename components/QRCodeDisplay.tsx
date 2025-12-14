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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Scan to Mobile</h3>
            <p className="text-slate-600 mb-6">Open this app instantly on your phone.</p>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG value={url} size={200} level="H" includeMargin />
            </div>
            
            <p className="text-xs text-slate-400 mt-6">
              Works on iOS and Android camera apps
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};