import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Save, Upload, FileJson, FileUp } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
import { generateResume } from '../services/geminiService';
import { ResumeData, HistoryItem } from '../types';

interface ResumeBuilderProps {
  onSave: (item: HistoryItem) => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onSave }) => {
  const [input, setInput] = useState('');
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractingPdf, setExtractingPdf] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Configure worker for PDF.js
    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    }
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await generateResume(input);
      setResume(data);
      onSave({
        id: crypto.randomUUID(),
        type: 'RESUME',
        timestamp: Date.now(),
        data: data,
        summary: data.fullName + ' - ' + data.skills.slice(0, 3).join(', ')
      });
    } catch (e) {
      console.error(e);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element || !resume) return;
    
    // Configure PDF options
    const opt = {
      margin: 10,
      filename: `${resume.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    // Generate PDF
    html2pdf().set(opt).from(element).save();
  };

  const handleExportJSON = () => {
    if (!resume) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${resume.fullName.replace(/\s+/g, '_')}_Resume.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string);
            // Basic validation check
            if (parsed.fullName && Array.isArray(parsed.experience)) {
              setResume(parsed);
              if (parsed.summary) setInput(parsed.summary);
              onSave({
                id: crypto.randomUUID(),
                type: 'RESUME',
                timestamp: Date.now(),
                data: parsed,
                summary: 'Imported: ' + parsed.fullName
              });
            } else {
              alert("Invalid resume JSON structure");
            }
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

        setInput(prev => (prev ? prev + '\n\n' + fullText : fullText));
    } catch (error) {
        console.error("PDF Extraction error:", error);
        alert("Could not extract text from PDF. Ensure it is a text-based PDF.");
    } finally {
        setExtractingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2 text-amber-400">
              <FileText className="text-amber-300" />
              Resume Profile
            </h2>
            <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={pdfInputRef}
                    onChange={handleImportPDF}
                    accept=".pdf"
                    className="hidden"
                 />
                 <button 
                   onClick={() => pdfInputRef.current?.click()}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/20"
                   title="Extract text from PDF Resume"
                   disabled={extractingPdf}
                 >
                   {extractingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3 text-amber-400" />}
                   Upload PDF
                 </button>

                 <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                    accept=".json"
                    className="hidden"
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/20"
                   title="Import Resume JSON"
                 >
                   <Upload className="w-3 h-3 text-amber-400" /> Import JSON
                 </button>
            </div>
          </div>
          <p className="text-neutral-400 mb-4 font-light">
            Describe your background or upload an existing PDF resume to extract details. The AI will forge it into gold standard.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I am a software engineer with 5 years of experience... (Or upload PDF to fill this)"
            className="w-full h-64 bg-neutral-900/50 border border-emerald-500/20 rounded-xl p-4 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-neutral-200 resize-none transition-all"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !input}
              className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-amber-900/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Generate Resume'}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col h-[80vh] min-h-[500px]"
      >
        <div className="bg-neutral-900/90 p-4 rounded-t-2xl border border-amber-500/20 border-b-0 flex justify-between items-center backdrop-blur-sm">
           <span className="text-sm font-semibold text-amber-200/80 uppercase tracking-widest">Preview</span>
           <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                disabled={!resume}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-neutral-600 disabled:opacity-50"
                title="Export as JSON"
              >
                <FileJson className="w-3 h-3" /> Export JSON
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!resume}
                className="text-xs bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                title="Download as PDF"
              >
                <Download className="w-3 h-3" /> Save PDF
              </button>
           </div>
        </div>
        
        <div className="bg-white text-slate-900 p-8 rounded-b-2xl shadow-2xl overflow-y-auto flex-1 border border-amber-500/20 border-t-0">
          {resume ? (
            <div className="space-y-6" id="resume-preview">
              <div className="border-b-2 border-slate-900 pb-4">
                <h1 className="text-3xl font-serif font-bold text-slate-900">{resume.fullName}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 font-medium">
                  <span>{resume.email}</span>
                  <span className="text-amber-500">•</span>
                  <span>{resume.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-amber-300 pb-1 text-slate-800">Professional Summary</h3>
                <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-amber-300 pb-1 text-slate-800">Experience</h3>
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-900">{exp.role}</h4>
                      <span className="text-sm text-slate-500">{exp.period}</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700 mb-1">{exp.company}</div>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-amber-300 pb-1 text-slate-800">Education</h3>
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-900">{edu.school}</h4>
                      <span className="text-sm text-slate-500">{edu.year}</span>
                    </div>
                    <div className="text-sm text-emerald-700">{edu.degree}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-amber-300 pb-1 text-slate-800">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-sm text-slate-700 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center shadow-inner">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <p className="font-serif italic text-lg text-slate-400">Your professional legacy awaits</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};