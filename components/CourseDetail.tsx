
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { getCourseInsights, chatWithTutor } from '../services/gemini';
import { supabase } from '../lib/supabase';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll: () => void;
  isEnrolled?: boolean;
  onSaveCourse?: (course: Course) => void;
  isAdmin?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEnroll, isEnrolled, onSaveCourse, isAdmin }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(course.id === '');
  const [editedCourse, setEditedCourse] = useState<Course>(course);

  useEffect(() => {
    if (course.id) {
      async function fetchInsights() {
        setIsLoadingInsights(true);
        try {
          const data = await getCourseInsights(course);
          setInsights(data || 'Unable to load insights at this time.');
        } catch (error) {
          console.error(error);
          setInsights('Error loading AI insights.');
        } finally {
          setIsLoadingInsights(false);
        }
      }
      fetchInsights();
    } else {
      setInsights('AI insights will be generated once the course is saved.');
      setIsLoadingInsights(false);
    }
  }, [course]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatting) return;

    const userMsg = chatMessage;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsChatting(true);

    try {
      const response = await chatWithTutor(course, userMsg, []);
      const aiResponse = response || 'No response.';
      setChatLog(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('chat_history').insert([{
          user_id: session.user.id,
          user_email: session.user.email,
          message: userMsg,
          response: aiResponse,
          context: `COURSE_${course.id}`
        }]);
      }
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSave = () => {
    onSaveCourse?.(editedCourse);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-xs md:text-sm font-medium">Back to Catalog</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-red-500 text-white' : 'bg-primary text-background-dark'}`}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Course'}
            </button>
          )}
        </div>

        <div className="relative h-48 sm:h-64 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 md:border-4 border-white dark:border-[#1f1f14]">
          <img src={isEditing ? editedCourse.imageUrl : course.imageUrl} className="w-full h-full object-cover" alt={course.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-4 md:p-8">
            <div className="space-y-1 md:space-y-2 w-full">
              {isEditing ? (
                <div className="space-y-2 md:space-y-3 bg-black/40 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm">
                  <input 
                    type="text"
                    value={editedCourse.title}
                    onChange={(e) => setEditedCourse({...editedCourse, title: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 text-white font-black text-lg md:text-3xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Course Title"
                  />
                  <input 
                    type="text"
                    value={editedCourse.imageUrl}
                    onChange={(e) => setEditedCourse({...editedCourse, imageUrl: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg md:rounded-xl px-3 md:px-4 py-1 text-white text-[10px] focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Image URL"
                  />
                </div>
              ) : (
                <>
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary text-background-dark text-[8px] md:text-xs font-bold rounded-full uppercase tracking-widest">
                    {course.category}
                  </span>
                  <h1 className="text-xl md:text-5xl font-black text-white leading-tight line-clamp-2">{course.title}</h1>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white dark:bg-[#1f1f14] p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mb-1 md:mb-2">schedule</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
            {isEditing ? (
              <input 
                type="text"
                value={editedCourse.duration}
                onChange={(e) => setEditedCourse({...editedCourse, duration: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-xs md:text-sm"
              />
            ) : (
              <span className="font-bold text-sm md:text-base">{course.duration}</span>
            )}
          </div>
          <div className="bg-white dark:bg-[#1f1f14] p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mb-1 md:mb-2">star</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span>
            <span className="font-bold text-sm md:text-base">{course.rating} / 5.0</span>
          </div>
          <div className="bg-white dark:bg-[#1f1f14] p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm col-span-2 md:col-span-1">
            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mb-1 md:mb-2">payments</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Price</span>
            {isEditing ? (
              <input 
                type="number"
                value={editedCourse.price}
                onChange={(e) => setEditedCourse({...editedCourse, price: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-xs md:text-sm"
              />
            ) : (
              <span className="font-bold text-lg md:text-xl">${course.price}</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1f1f14] p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              {isEditing ? 'Course Description' : 'AI Knowledge Brief'}
            </div>
            {isEditing && (
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
              >
                Save Changes
              </button>
            )}
          </h2>
          
          {isEditing ? (
            <textarea 
              value={editedCourse.description}
              onChange={(e) => setEditedCourse({...editedCourse, description: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium min-h-[200px] focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter course description..."
            />
          ) : (
            <>
              {isLoadingInsights ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 dark:bg-[#393928] rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-[#393928] rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 dark:bg-[#393928] rounded w-5/6"></div>
                  <div className="h-32 bg-slate-100 dark:bg-[#393928] rounded w-full"></div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {insights}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-background-dark text-white rounded-3xl p-5 md:p-6 shadow-xl border border-primary/20 h-[450px] md:h-[500px] lg:h-[600px] flex flex-col">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="size-9 md:size-10 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-inner">
              <span className="material-symbols-outlined text-xl md:text-2xl">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base leading-none">AI Tutor</h3>
              <span className="text-[9px] md:text-[10px] text-primary uppercase font-bold tracking-tighter">Deep Knowledge Mode</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-1 md:pr-2 no-scrollbar mb-4">
            <div className="bg-slate-800/50 p-3 md:p-4 rounded-2xl rounded-tl-none text-xs md:text-sm leading-relaxed">
              Hi! I'm your Shala AI Tutor. Ask me anything about this course's specific concepts, career paths, or real-world applications.
            </div>
            {chatLog.map((msg, i) => (
              <div 
                key={i} 
                className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-background-dark ml-6 md:ml-8 rounded-tr-none font-medium' 
                    : 'bg-slate-800/50 mr-6 md:mr-8 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isChatting && (
              <div className="flex items-center gap-2 p-3 md:p-4 text-slate-400 text-[10px] md:text-xs">
                <div className="size-1 bg-primary rounded-full animate-bounce"></div>
                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span>Tutor is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="relative mt-auto">
            <input 
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a deep question..."
              className="w-full bg-slate-800 border-none rounded-xl md:rounded-2xl pl-4 pr-12 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-500"
            />
            <button 
              type="submit"
              disabled={isChatting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 md:size-8 bg-primary text-background-dark rounded-lg md:rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">send</span>
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#1f1f14] rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-sm md:text-base mb-3 md:mb-4">Course Highlights</h4>
          <ul className="space-y-2 md:space-y-3">
            <li className="flex items-center gap-3 text-xs md:text-sm">
              <span className="material-symbols-outlined text-primary text-base">verified</span>
              <span>Expert-led instruction</span>
            </li>
            <li className="flex items-center gap-3 text-xs md:text-sm">
              <span className="material-symbols-outlined text-primary text-base">work</span>
              <span>Portfolio-ready projects</span>
            </li>
            <li className="flex items-center gap-3 text-xs md:text-sm">
              <span className="material-symbols-outlined text-primary text-base">history_edu</span>
              <span>Professional Certification</span>
            </li>
          </ul>
          <button 
            onClick={onEnroll}
            className="w-full mt-5 md:mt-6 py-3 md:py-4 bg-primary text-background-dark font-black rounded-xl md:rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all text-xs md:text-sm"
          >
            {isEnrolled ? "CONTINUE LEARNING" : "ENROLL NOW"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
