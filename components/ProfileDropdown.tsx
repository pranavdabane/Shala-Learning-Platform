
import React from 'react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  enrolledCount: number;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  user?: { name: string; email: string } | null;
  isAdmin?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose, enrolledCount, onNavigate, onLogout, user, isAdmin }) => {
  if (!isOpen) return null;

  const displayName = user?.name || "Guest User";
  const displayEmail = user?.email || "not-logged-in@shala.edu";

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose}></div>
      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1f1f14] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-[70] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className={`size-20 rounded-full border-4 overflow-hidden shadow-lg ${isAdmin ? 'border-red-500' : 'border-primary'}`}>
            <img 
              alt="Profile" 
              className="h-full w-full object-cover" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isAdmin ? 'ff0000' : 'f2f20d'}&color=${isAdmin ? 'ffffff' : '181811'}&bold=true`} 
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <h3 className="text-lg font-black tracking-tight">{displayName}</h3>
              {isAdmin && <span className="material-symbols-outlined text-red-500 text-sm">verified</span>}
            </div>
            <p className="text-xs text-slate-500 font-medium">{displayEmail}</p>
          </div>
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Status</p>
              <p className={`text-sm font-black ${isAdmin ? 'text-red-500' : 'text-primary'}`}>{isAdmin ? 'Admin' : 'Pro'}</p>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Impact</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">92%</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-1">
          {isAdmin && (
            <button 
              onClick={() => { onNavigate('admin'); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-500/10 text-red-500 transition-colors text-sm font-black border border-red-500/20"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Admin Control
            </button>
          )}
          <button 
            onClick={() => { onNavigate('mylearning'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-slate-400">school</span>
            My Learning
          </button>
          <button 
            onClick={() => { onNavigate('career-paths'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-slate-400">route</span>
            Career Paths
          </button>
          <button 
            onClick={() => { onNavigate('settings'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-slate-400">settings</span>
            Settings
          </button>
          <button 
            onClick={() => { onLogout(); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm font-black mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
