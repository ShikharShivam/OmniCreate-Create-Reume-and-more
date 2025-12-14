import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Save, Upload, FileJson } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { generateResume } from '../services/geminiService';
import { ResumeData, HistoryItem } from '../types';

interface ResumeBuilderProps {
  onSave: (item: HistoryItem) => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onSave }) => {
  const [input, setInput] = useState('');
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
              // Set input to summary to give context if user wants to regenerate/edit prompt
              if (parsed.summary) {
                  setInput(parsed.summary);
              }
              // Add to history as an "Imported" item
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
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-cyan-400" />
              Resume Profile
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
                   className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-600"
                   title="Import Resume JSON"
                 >
                   <Upload className="w-3 h-3" /> Import
                 </button>
            </div>
          </div>
          <p className="text-slate-400 mb-4">
            Describe your professional background, skills, and education. The AI will structure it into a professional format.
            Or import a previously saved JSON resume.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I am a software engineer with 5 years of experience in React and Node.js. I worked at TechCorp from 2020 to 2024 improving site performance by 20%. I have a CS degree from University X..."
            className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-200 resize-none"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !input}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/20"
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
        <div className="bg-slate-800/80 p-4 rounded-t-2xl border-x border-t border-slate-700 flex justify-between items-center backdrop-blur-sm">
           <span className="text-sm font-semibold text-slate-300">Preview</span>
           <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                disabled={!resume}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as JSON"
              >
                <FileJson className="w-3 h-3" /> Export JSON
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!resume}
                className="text-xs bg-red-600/80 hover:bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                title="Download as PDF"
              >
                <Download className="w-3 h-3" /> Save PDF
              </button>
           </div>
        </div>
        
        <div className="bg-white text-slate-900 p-8 rounded-b-2xl shadow-2xl overflow-y-auto flex-1 border-x border-b border-slate-700">
          {resume ? (
            <div className="space-y-6" id="resume-preview">
              <div className="border-b-2 border-slate-900 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{resume.fullName}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                  <span>{resume.email}</span>
                  <span>•</span>
                  <span>{resume.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1">Professional Summary</h3>
                <p className="text-sm leading-relaxed">{resume.summary}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1">Experience</h3>
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold">{exp.role}</h4>
                      <span className="text-sm text-slate-500">{exp.period}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{exp.company}</div>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1">Education</h3>
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold">{edu.school}</h4>
                      <span className="text-sm text-slate-500">{edu.year}</span>
                    </div>
                    <div className="text-sm text-slate-700">{edu.degree}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-1 rounded text-sm text-slate-700 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p>Your professional resume will appear here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};