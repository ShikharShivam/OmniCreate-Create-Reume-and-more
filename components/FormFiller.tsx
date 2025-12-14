import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, User, ChevronRight, Copy, Check, Upload, FileJson, Download, FileUp, Loader2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
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
  const [extractingPdf, setExtractingPdf] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Configure worker for PDF.js
    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    }
  }, []);

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

  const handleExportJSON = () => {
    const data = { userData, formContent, result };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `form_context_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadText = () => {
    if (!result) return;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(result.filledText);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `filled_form_${Date.now()}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('form-result-preview');
    if (!element || !result) return;
    
    // Configure PDF options
    const opt = {
      margin: 15,
      filename: `Filled_Form_${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
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
            if (parsed.userData) setUserData(parsed.userData);
            if (parsed.formContent) setFormContent(parsed.formContent);
            if (parsed.result) setResult(parsed.result);
          } catch (error) {
            console.error(error);
            alert("Error parsing JSON file");
          }
        }
      };
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportPDF = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtractingPdf(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // @ts-ignore
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        setFormContent(prev => (prev ? prev + '\n\n' + fullText : fullText));
    } catch (error) {
        console.error("PDF Extraction error:", error);
        alert("Could not extract text from PDF.");
    } finally {
        setExtractingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
         <div className="flex justify-between items-center bg-neutral-900/50 p-3 rounded-xl border border-amber-500/20">
             <span className="text-sm text-amber-200/70 font-medium pl-2">Session Tools</span>
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
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/20"
                 >
                   <Upload className="w-3 h-3 text-amber-400" /> Import JSON
                 </button>
                 <button 
                   onClick={handleExportJSON}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/20"
                 >
                   <FileJson className="w-3 h-3 text-amber-400" /> Export JSON
                 </button>
            </div>
         </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2 text-amber-400">
            <User className="text-amber-300" />
            Your Data Context
          </h2>
          <textarea
            value={userData}
            onChange={(e) => setUserData(e.target.value)}
            placeholder="Paste your info here (e.g. My name is John Doe, born 1990, address: 123 Main St...)"
            className="w-full h-32 bg-neutral-900/50 border border-emerald-500/20 rounded-xl p-4 focus:ring-1 focus:ring-amber-500 focus:outline-none text-neutral-200 resize-none text-sm transition-all"
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-serif flex items-center gap-2 text-emerald-400">
                    <Edit3 className="text-emerald-300" />
                    Form to Fill
                </h2>
                <input 
                    type="file" 
                    ref={pdfInputRef}
                    onChange={handleImportPDF}
                    accept=".pdf"
                    className="hidden"
                 />
                 <button 
                   onClick={() => pdfInputRef.current?.click()}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-emerald-500/20"
                   disabled={extractingPdf}
                 >
                   {extractingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3 text-emerald-400" />}
                   Upload PDF
                 </button>
            </div>
          
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Paste the form questions or text here... (Or upload PDF to extract text)"
            className="w-full h-32 bg-neutral-900/50 border border-emerald-500/20 rounded-xl p-4 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-neutral-200 resize-none text-sm transition-all"
          />
          
          <button
            onClick={handleFill}
            disabled={loading || !userData || !formContent}
            className="mt-4 w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-900 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-amber-900/20"
          >
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full"/> : (
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
        className="flex flex-col h-full bg-neutral-900/80 rounded-2xl border border-amber-500/20 p-6 overflow-hidden backdrop-blur-md"
      >
        <div className="flex justify-between items-center mb-4 border-b border-amber-500/10 pb-4">
          <h3 className="text-xl font-bold font-serif text-amber-100">Result</h3>
          {result && (
            <div className="flex gap-2">
                <button
                  onClick={handleDownloadText}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors border border-neutral-600"
                  title="Download as Text"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Txt
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors border border-neutral-600"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> PDF
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors border border-neutral-600"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                </button>
            </div>
          )}
        </div>
        
        {result ? (
          <div className="flex-1 overflow-auto space-y-4 custom-scrollbar" id="form-result-preview">
             <div className="bg-neutral-950 p-6 rounded-xl border border-emerald-500/20 font-mono text-sm text-emerald-300 whitespace-pre-wrap shadow-inner">
               <h4 className="text-neutral-500 mb-4 border-b border-neutral-800 pb-2">FILLED FORM OUTPUT</h4>
               {result.filledText}
             </div>
             
             {Object.keys(result.fields).length > 0 && (
               <div className="mt-4">
                 <h4 className="text-sm font-semibold text-amber-500 mb-2 uppercase tracking-wider">Detected Fields</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   {Object.entries(result.fields).map(([key, value]) => (
                     <div key={key} className="bg-neutral-800/50 p-2 rounded border border-neutral-700 text-xs">
                       <span className="text-neutral-400">{key}:</span> <span className="text-emerald-200">{value}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
             <Edit3 className="w-16 h-16 mb-4 opacity-20 text-emerald-500" />
             <p className="font-light text-neutral-400">Filled form content will appear here</p>
           </div>
        )}
      </motion.div>
    </div>
  );
};