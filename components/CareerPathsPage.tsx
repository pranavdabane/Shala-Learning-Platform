
import React, { useState, useEffect } from 'react';
import { CAREER_PATHS, COURSES, CareerPath } from '../constants';
import { getCareerPathOutlook } from '../services/gemini';
import { Course } from '../types';

interface CareerPathsPageProps {
  enrolledCourseIds: string[];
  onSelectCourse: (course: Course) => void;
  onBack: () => void;
}

const CareerPathsPage: React.FC<CareerPathsPageProps> = ({ enrolledCourseIds, onSelectCourse, onBack }) => {
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [outlook, setOutlook] = useState<string>('');
  const [loadingOutlook, setLoadingOutlook] = useState(false);

  useEffect(() => {
    if (selectedPath) {
      async function fetchOutlook() {
        setLoadingOutlook(true);
        try {
          const text = await getCareerPathOutlook(selectedPath.title);
          setOutlook(text || '');
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingOutlook(false);
        }
      }
      fetchOutlook();
    }
  }, [selectedPath]);

  const getMatchPercentage = (path: CareerPath) => {
    const matched = path.courseIds.filter(id => enrolledCourseIds.includes(id)).length;
    return Math.round((matched / path.courseIds.length) * 100);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Return</span>
          </button>
          <h1 className="text-4xl font-black tracking-tight leading-none lg:text-5xl">Career Paths</h1>
          <p className="text-slate-500 dark:text-[#baba9c] text-lg max-w-2xl">
            Go beyond individual courses. Follow a curated trajectory to master high-demand professional roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CAREER_PATHS.map((path) => {
          const match = getMatchPercentage(path);
          const isActive = selectedPath?.id === path.id;

          return (
            <div 
              key={path.id}
              onClick={() => setSelectedPath(path)}
              className={`group relative p-6 md:p-8 rounded-[32px] cursor-pointer transition-all duration-500 border-2 ${
                isActive 
                  ? 'bg-background-dark text-white border-primary shadow-2xl' 
                  : 'bg-white dark:bg-[#1f1f14] border-slate-100 dark:border-slate-800 hover:border-primary/40'
              }`}
            >
              {match > 0 && (
                <div className="absolute top-4 right-4 bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded-lg">
                  {match}% MATCH
                </div>
              )}
              
              <div className={`size-14 rounded-2xl mb-6 flex items-center justify-center transition-colors ${
                isActive ? 'bg-primary text-background-dark' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary'
              }`}>
                <span className="material-symbols-outlined text-3xl font-bold">{path.icon}</span>
              </div>

              <h3 className="text-xl font-black mb-2">{path.title}</h3>
              <p className={`text-sm leading-relaxed mb-6 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                {path.description}
              </p>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>Target Role:</span>
                <span className="text-xs font-bold">{path.role}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPath && (
        <div className="bg-white dark:bg-[#1f1f14] rounded-[32px] md:rounded-[40px] p-6 md:p-8 lg:p-12 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-8">
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  AI Market Outlook
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 md:p-6 rounded-2xl md:rounded-3xl min-h-[100px] flex items-center justify-center italic text-slate-600 dark:text-slate-300">
                  {loadingOutlook ? (
                    <div className="flex gap-2">
                      <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <p className="leading-relaxed text-sm md:text-base">"{outlook || "Select a path to see AI-driven market trends."}"</p>
                  )}
                </div>
              </div>

              <div className="text-left">
                <h4 className="text-base md:text-lg font-black mb-4">Core Competencies</h4>
                <div className="flex flex-wrap gap-2">
                  {['Strategic Leadership', 'Technical Architecture', 'Data Analysis', 'Scale Operations'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 text-left">
              <h4 className="text-lg md:text-xl font-black">Path Curriculum</h4>
              <div className="space-y-4">
                {selectedPath.courseIds.map((id, index) => {
                  const course = COURSES.find(c => c.id === id);
                  if (!course) return null;
                  const isEnrolled = enrolledCourseIds.includes(id);

                  return (
                    <div 
                      key={id} 
                      onClick={() => onSelectCourse(course)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#393928]/30 hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      <div className="size-10 flex items-center justify-center bg-background-dark text-white rounded-xl text-xs font-black shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{course.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{course.category}</span>
                          {isEnrolled && (
                            <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              ENROLLED
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">east</span>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => {
                  const firstUnenrolled = selectedPath.courseIds.find(id => !enrolledCourseIds.includes(id));
                  const courseToEnroll = COURSES.find(c => c.id === (firstUnenrolled || selectedPath.courseIds[0]));
                  if (courseToEnroll) onSelectCourse(courseToEnroll);
                }}
                className="w-full py-4 bg-background-dark text-white dark:bg-primary dark:text-background-dark font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
              >
                START YOUR JOURNEY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPathsPage;
