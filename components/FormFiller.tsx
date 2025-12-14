import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, User, ChevronRight, Copy, Check } from 'lucide-react';
import { fillFormSmartly } from '../services/geminiService';
import { HistoryItem } from '../types';

interface FormFillerProps {
  onSave: (item: HistoryItem) => void;
}

export const FormFiller: React.FC<FormFillerProps> = ({ onSave }) => {
  const [userData, setUserData] = useState('');
  const [formContent, setFormContent] = useState('');
  const [result, setResult] = useState<{ filledText: string, fields: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFill = async () => {
    if (!userData.trim() || !formContent.trim()) return;
    setLoading(true);
    try {
      const data = await fillFormSmartly(formContent, userData);
      setResult(data);
      onSave({
        id: crypto.randomUUID(),
        type: 'FORM',
        timestamp: Date.now(),
        data: data,
        summary: 'Form filled with user data'
      });
    } catch (e) {
      console.error(e);
      alert('Failed to fill form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.filledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <User className="text-green-400" />
            Your Data Context
          </h2>
          <textarea
            value={userData}
            onChange={(e) => setUserData(e.target.value)}
            placeholder="Paste your info here (e.g. My name is John Doe, born 1990, address: 123 Main St...)"
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:outline-none text-slate-200 resize-none text-sm"
          />
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Edit3 className="text-blue-400" />
            Form to Fill
          </h2>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Paste the form questions or text here..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-200 resize-none text-sm"
          />
          
          <button
            onClick={handleFill}
            disabled={loading || !userData || !formContent}
            className="mt-4 w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-green-900/20"
          >
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : (
              <>
                Auto-Fill Form <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-800 p-6 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-200">Result</h3>
          {result && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-600"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        
        {result ? (
          <div className="flex-1 overflow-auto space-y-4">
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-green-300 whitespace-pre-wrap">
               {result.filledText}
             </div>
             
             {Object.keys(result.fields).length > 0 && (
               <div className="mt-4">
                 <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Detected Fields</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   {Object.entries(result.fields).map(([key, value]) => (
                     <div key={key} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs">
                       <span className="text-slate-400">{key}:</span> <span className="text-slate-200">{value}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
             <Edit3 className="w-12 h-12 mb-4 opacity-50" />
             <p>Filled form content will appear here</p>
           </div>
        )}
      </motion.div>
    </div>
  );
};