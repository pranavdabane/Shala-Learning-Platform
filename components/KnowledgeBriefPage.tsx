
import React, { useState } from 'react';
import { getIndustryBrief } from '../services/gemini';

interface KnowledgeBriefPageProps {
  onBack: () => void;
}

const KnowledgeBriefPage: React.FC<KnowledgeBriefPageProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topics = ['Generative AI', 'Design Systems', 'Microservices', 'Quantum Computing', 'FinTech Trends'];

  const handleGenerate = async (t: string) => {
    setIsLoading(true);
    setTopic(t);
    try {
      const data = await getIndustryBrief(t);
      setBrief(data || '');
    } catch (e) {
      setBrief('Failed to generate brief.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-left">
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-sm font-medium">Return</span>
        </button>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Knowledge Brief Hub</h1>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
          AI-generated situational intelligence. Stay ahead of the curve with deep-dives into emerging industry paradigms.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {topics.map(t => (
          <button 
            key={t}
            onClick={() => handleGenerate(t)}
            disabled={isLoading}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              topic === t 
                ? 'bg-primary text-black shadow-xl scale-105' 
                : 'bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[32px] md:rounded-[50px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center space-y-6">
           <div className="size-16 md:size-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
           <p className="text-xs md:text-sm font-black uppercase text-primary tracking-widest animate-pulse">Aggregating AI Intelligence...</p>
        </div>
      ) : brief ? (
        <div className="bg-background-dark text-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] shadow-2xl border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 hidden md:block">
            <span className="material-symbols-outlined text-[180px] font-black">auto_awesome</span>
          </div>
          <div className="relative z-10 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Report</span>
              <h2 className="text-2xl md:text-4xl font-black">{topic}</h2>
            </div>
            <div className="prose prose-invert prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-strong:text-primary max-w-none whitespace-pre-wrap">
              {brief}
            </div>
            <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
               <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-sm">download</span>
                 Export Brief
               </button>
               <button onClick={() => setBrief('')} className="w-full sm:w-auto px-6 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                 Clear Hub
               </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 md:p-20 rounded-[32px] md:rounded-[50px] border border-slate-100 dark:border-slate-800 text-center space-y-4">
           <div className="size-12 md:size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
             <span className="material-symbols-outlined text-2xl md:text-3xl">lightbulb</span>
           </div>
           <h3 className="text-lg md:text-xl font-bold">Select a topic to generate a brief.</h3>
           <p className="text-xs md:text-sm text-slate-400 max-w-xs mx-auto">Get up-to-the-minute insights on industry-shifting technologies.</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBriefPage;
