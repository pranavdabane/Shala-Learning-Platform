
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: { name: string; text: string; rating: number }) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Save to Supabase
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_name: name,
          comment: text,
          rating: rating,
          user_id: session?.user?.id || null,
          user_role: 'Verified Graduate',
          user_img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f2f20d&color=181811&bold=true`
        }]);

      if (error) throw error;

      onSuccess({ name, text, rating });
      setName('');
      setText('');
      setRating(5);
      onClose();
    } catch (err) {
      console.error("Error saving review:", err);
      alert("Failed to save review to cloud. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1f1f14] w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black tracking-tight">Post Review</h2>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                    star <= rating ? 'bg-primary text-background-dark scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`material-symbols-outlined ${star <= rating ? 'fill-1' : ''}`}>star</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary dark:text-white"
              placeholder="e.g. David Smith"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Feedback</label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary resize-none dark:text-white"
              placeholder="What did you love about the course?"
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-background-dark font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "SUBMIT REVIEW"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
