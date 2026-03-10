
import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (view: any) => void;
  onAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  enrolledCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  user?: { name: string; email: string } | null;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onNavigate, 
  onAuth,
  onLogout,
  onToggleMobileMenu,
  currentView, 
  cartCount, 
  wishlistCount, 
  enrolledCount, 
  isLoggedIn,
  isAdmin,
  user,
  isMobileMenuOpen
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${isAdmin ? 'ff0000' : 'f2f20d'}&color=${isAdmin ? 'ffffff' : '181811'}&bold=true`
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuDiAlEG1u2oD4veMA6KReqiK8KyL6dRFVRuvjZpTYs8frCMyYDwvCBHESnpNR4gwXfFruyaiJ1N3DTaQJ8S6j9ui9r_-qHflL-iBseKFyeqSIrxledClSUlXRzyGEFk3yt0p2X-TH0h4TAwFdgL8A9mxTPWWOscI7XpeQy-hi6RwNo5ayL_xxDstPGKk9EVJYYo6jfDIf9EkThAd5_GzQXbMHTp-ibAWxvScE_vEtW7oAKTOIfqZ2jmWi3Brfi-lMLx_ASnZPCt_h07";

  return (
    <header className="sticky top-0 z-50 border-b border-solid border-slate-200 dark:border-[#393928] bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-10">
        <button 
          onClick={onToggleMobileMenu}
          className="lg:hidden flex size-11 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#393928] transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div 
          className="flex items-center gap-2 lg:gap-4 text-slate-900 dark:text-white cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className={`size-9 lg:size-11 flex items-center justify-center rounded-xl text-background-dark group-hover:scale-110 transition-transform ${isAdmin ? 'bg-red-500' : 'bg-primary'}`}>
            <span className="material-symbols-outlined text-xl lg:text-3xl font-black">{isAdmin ? 'admin_panel_settings' : 'school'}</span>
          </div>
          <h2 className="text-lg lg:text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="hidden xs:inline">Shala</span>
            {isAdmin && (
              <span className="bg-red-500 text-white text-[10px] lg:text-xs px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
                Admin
              </span>
            )}
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'home' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'catalog' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
          >
            Catalog
          </button>
          {isAdmin ? (
            <button 
              onClick={() => onNavigate('admin')}
              className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'admin' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-red-500'}`}
            >
              Admin
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('mylearning')}
              className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'mylearning' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
            >
              My Learning
            </button>
          )}
        </nav>
      </div>

        <div className="flex flex-1 justify-end gap-2 lg:gap-6 items-center">
          <label className="flex flex-col min-w-0 flex-1 sm:min-w-48 max-w-72 h-11 lg:h-12 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 lg:pl-4 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-xl lg:text-2xl">search</span>
            </div>
            <input 
              className="form-input block w-full pl-10 lg:pl-12 pr-4 lg:pr-6 rounded-xl border-none bg-slate-100 dark:bg-[#393928] text-sm lg:text-base focus:ring-2 focus:ring-primary placeholder:text-slate-400 dark:text-white transition-all h-full" 
              placeholder="Search tracks..." 
              onChange={(e) => onSearch(e.target.value)}
            />
          </label>
          
          <button 
            onClick={() => onNavigate('wishlist')}
            className={`relative flex size-11 lg:size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#393928] hover:bg-primary/20 transition-colors ${currentView === 'wishlist' ? 'ring-2 ring-primary bg-primary/10' : ''}`}
          >
            <span className="material-symbols-outlined text-xl lg:text-3xl">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 lg:size-6 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-black text-background-dark leading-none shadow-lg">
                {wishlistCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => onNavigate('cart')}
            className={`relative flex size-11 lg:size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#393928] hover:bg-primary/20 transition-colors ${currentView === 'cart' ? 'ring-2 ring-primary bg-primary/10' : ''}`}
          >
            <span className="material-symbols-outlined text-xl lg:text-3xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 lg:size-6 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-black text-background-dark leading-none shadow-lg">
                {cartCount}
              </span>
            )}
          </button>
          
          {isLoggedIn ? (
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`size-11 lg:size-12 rounded-full border-2 overflow-hidden cursor-pointer hover:scale-105 transition-transform ${isAdmin ? 'border-red-500' : 'border-primary'}`}
              >
                <img 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                  src={avatarUrl} 
                />
              </div>
              <ProfileDropdown 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)}
                enrolledCount={enrolledCount}
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <button 
              onClick={() => onAuth('signup')}
              className="px-3 sm:px-5 py-2 text-xs lg:text-sm font-bold bg-primary text-background-dark rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 whitespace-nowrap"
            >
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Join Now</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
