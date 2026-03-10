
import React from 'react';

interface BottomNavProps {
  onNavigate: (view: any) => void;
  currentView: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, currentView, isLoggedIn, isAdmin }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'catalog', label: 'Catalog', icon: 'menu_book' },
    { id: 'mylearning', label: 'Learning', icon: 'trending_up' },
    { id: 'cart', label: 'Cart', icon: 'shopping_cart' },
    { id: isAdmin ? 'admin' : 'settings', label: isAdmin ? 'Admin' : 'Settings', icon: isAdmin ? 'admin_panel_settings' : 'settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 lg:hidden px-4 pb-safe">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all relative ${
              currentView === item.id 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <span className={`material-symbols-outlined text-3xl ${currentView === item.id ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {item.label}
            </span>
            {currentView === item.id && (
              <div className="absolute bottom-2 size-1.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
