
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent, courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, isWishlisted, onToggleWishlist }) => {
  return (
    <div 
      onClick={() => onClick(course)}
      className="group flex flex-col bg-white dark:bg-[#1f1f14] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:ring-2 hover:ring-primary/40 transition-all duration-300 cursor-pointer relative border border-slate-100 dark:border-slate-800 mx-auto w-full max-w-full"
    >
      <div className="relative w-full aspect-square sm:aspect-video bg-slate-200 overflow-hidden shrink-0">
        <img 
          alt={course.title} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src={course.imageUrl} 
          referrerPolicy="no-referrer"
        />
        
        {/* Wishlist Button - Touch friendly (min 44px) */}
        <button 
          onClick={(e) => onToggleWishlist?.(e, course.id)}
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 size-11 sm:size-10 rounded-full flex items-center justify-center transition-all z-20 shadow-md ${
            isWishlisted 
              ? 'bg-primary text-background-dark scale-110' 
              : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-background-dark'
          }`}
        >
          <span className={`material-symbols-outlined text-xl sm:text-2xl ${isWishlisted ? 'fill-1' : ''}`}>
            favorite
          </span>
        </button>

        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-background-dark text-xs sm:text-sm font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg">
          ${course.price}
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 flex-1 text-left min-w-0">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary leading-none">{course.category}</span>
        <h3 className="text-base sm:text-xl font-black leading-tight line-clamp-2 group-hover:text-primary transition-colors break-words">{course.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-base line-clamp-2 leading-relaxed mt-1 break-words">
          {course.description}
        </p>
        <div className="mt-auto pt-4 sm:pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-primary shrink-0">
            <span className="material-symbols-outlined text-sm sm:text-lg fill-1">star</span>
            <span className="text-xs sm:text-sm font-bold">{course.rating} <span className="hidden xs:inline sm:hidden md:inline">({course.reviews})</span></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm shrink-0">
            <span className="material-symbols-outlined text-sm sm:text-lg">schedule</span>
            <span>{course.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
