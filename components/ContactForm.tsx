
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ContactFormProps {
  userEmail?: string;
  userName?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ userEmail, userName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Save to Supabase for internal records
      const { error: insertError } = await supabase
        .from('inquiries')
        .insert([{
          full_name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: session?.user?.id || null
        }]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setFormData({ ...formData, message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-[48px] p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[180px] font-black text-primary">mail</span>
      </div>

      <div className="max-w-2xl relative z-10">
        <div className="space-y-4 mb-12">
          <h2 className="text-4xl font-black tracking-tighter font-display">Direct Inquiry</h2>
          <p className="text-slate-500 font-medium text-lg">Have a specific question about our curriculum or corporate training? Reach out directly.</p>
        </div>

        {isSuccess ? (
          <div className="bg-green-500/10 border-2 border-green-500/20 p-12 rounded-[40px] text-center space-y-6 animate-in zoom-in-95">
            <div className="size-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl">
              <span className="material-symbols-outlined text-4xl font-black">done_all</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-green-600 dark:text-green-400 font-display">Message Delivered</h3>
              <p className="text-base font-medium text-slate-500">Our support leads will contact you within 24 hours.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  ref={nameInputRef}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white" 
                  placeholder="Jane Learner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white" 
                  placeholder="jane@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Subject</label>
              <div className="relative">
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white appearance-none cursor-pointer"
                >
                  <option>General Inquiry</option>
                  <option>Course Content Feedback</option>
                  <option>Corporate Training</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Your Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white resize-none" 
                placeholder="How can we help you achieve your goals?" 
              />
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-6 bg-slate-900 dark:bg-primary text-white dark:text-background-dark font-bold rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isSubmitting ? (
                <span className="size-6 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-sm">Submit Inquiry</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
