import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Wand2, Download, RefreshCw, Upload, FileJson } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportJSON = () => {
    const data = { prompt, aspectRatio, imageSrc };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `poster_config_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('poster-preview');
    if (!element || !imageSrc) return;
    
    // Configure PDF options
    const opt = {
      margin: 0,
      filename: `Poster_${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string);
            if (parsed.prompt) setPrompt(parsed.prompt);
            if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
            if (parsed.imageSrc) setImageSrc(parsed.imageSrc);
          } catch (error) {
            console.error(error);
            alert("Error parsing JSON file");
          }
        }
      };
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-6"
      >
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold font-serif flex items-center gap-2 text-emerald-400">
              <ImageIcon className="text-emerald-300" />
              Poster Studio
            </h2>
             <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                    accept=".json"
                    className="hidden"
                 />
                 <button 
                   onClick={triggerFileInput}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-emerald-500/20"
                   title="Import Config"
                 >
                   <Upload className="w-3 h-3 text-emerald-400" /> Import
                 </button>
                 <button 
                   onClick={handleExportJSON}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-emerald-500/20"
                   title="Export Config"
                 >
                   <FileJson className="w-3 h-3 text-emerald-400" /> Export
                 </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-100/70 mb-2 uppercase tracking-wide">Vision Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic neon city concert poster with the text 'CYBER NIGHT 2025' at the top..."
                className="w-full h-32 bg-neutral-900/50 border border-emerald-500/20 rounded-xl p-4 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-neutral-200 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-100/70 mb-2 uppercase tracking-wide">Canvas Ratio</label>
              <div className="flex gap-4">
                {[
                  { id: '9:16', label: 'Story (9:16)' },
                  { id: '1:1', label: 'Square (1:1)' },
                  { id: '16:9', label: 'Wide (16:9)' }
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800'
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
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/30"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Generate Masterpiece
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-neutral-900/50 rounded-2xl border border-amber-500/20 p-8 min-h-[500px] backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-emerald-500/5 pointer-events-none" />
        {imageSrc ? (
          <div className="relative group z-10 flex flex-col items-center">
            <div id="poster-preview" className="inline-block p-2 bg-white rounded-lg">
                <img 
                src={imageSrc} 
                alt="Generated Poster" 
                className="max-h-[60vh] object-contain"
                />
            </div>
            
            <div className="mt-6 flex gap-3">
               <a 
                 href={imageSrc} 
                 download={`omni-poster-${Date.now()}.png`}
                 className="bg-neutral-800 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-neutral-700 transition-colors border border-neutral-600"
               >
                 <Download className="w-4 h-4" /> PNG
               </a>
               <button 
                 onClick={handleDownloadPDF}
                 className="bg-white text-neutral-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-amber-100 transition-colors shadow-lg shadow-white/20"
               >
                 <Download className="w-4 h-4" /> PDF
               </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-neutral-500 space-y-4 z-10">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto border border-neutral-700">
              <Wand2 className="w-12 h-12 text-neutral-600" />
            </div>
            <p className="font-serif italic text-lg text-neutral-400">Your vision will materialize here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};