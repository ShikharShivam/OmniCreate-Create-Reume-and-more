import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Wand2, Download, RefreshCw } from 'lucide-react';
import { generatePosterImage } from '../services/geminiService';
import { HistoryItem } from '../types';

interface PosterMakerProps {
  onSave: (item: HistoryItem) => void;
}

export const PosterMaker: React.FC<PosterMakerProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16" | "16:9">("9:16");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const base64Image = await generatePosterImage(prompt, aspectRatio);
      setImageSrc(base64Image);
      onSave({
        id: crypto.randomUUID(),
        type: 'POSTER',
        timestamp: Date.now(),
        data: { prompt, aspectRatio },
        preview: base64Image,
        summary: prompt
      });
    } catch (e) {
      console.error(e);
      alert('Failed to generate poster. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-6"
      >
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="text-purple-400" />
            Poster Studio
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic neon city concert poster with the text 'CYBER NIGHT 2025' at the top..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Orientation</label>
              <div className="flex gap-4">
                {[
                  { id: '9:16', label: 'Story/Mobile' },
                  { id: '1:1', label: 'Square' },
                  { id: '16:9', label: 'Landscape' }
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      aspectRatio === ratio.id
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Generate Poster
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8 min-h-[500px]"
      >
        {imageSrc ? (
          <div className="relative group">
            <img 
              src={imageSrc} 
              alt="Generated Poster" 
              className="rounded-lg shadow-2xl max-h-[70vh] object-contain border border-slate-700"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
               <a 
                 href={imageSrc} 
                 download={`omni-poster-${Date.now()}.png`}
                 className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200"
               >
                 <Download className="w-4 h-4" /> Download
               </a>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 space-y-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Wand2 className="w-10 h-10 text-slate-600" />
            </div>
            <p>Your masterpiece will appear here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};