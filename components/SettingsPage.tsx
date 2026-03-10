
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SettingsPageProps {
  user: { name: string; email: string } | null;
  onBack: () => void;
  onSave: (newName: string, newEmail?: string) => void;
}

type SettingsSection = 'Profile' | 'Appearance' | 'Notifications' | 'Security' | 'Privacy';

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, onSave }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('Profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const [bio, setBio] = useState('Senior Product Designer exploring the intersection of AI and Human Psychology.');
  const [timezone, setTimezone] = useState('GMT-05:00 (EST)');
  
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [syncWithSystem, setSyncWithSystem] = useState(false);
  const [fontSize, setFontSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Notification States
  const [notifProgress, setNotifProgress] = useState({ email: true, push: true });
  const [notifMarketing, setNotifMarketing] = useState({ email: false, push: false });
  const [notifSecurity, setNotifSecurity] = useState({ email: true, push: true });
  const [digestFrequency, setDigestFrequency] = useState('Daily');

  // Security States
  const [twoFactor, setTwoFactor] = useState(false);
  const [authType, setAuthType] = useState<'app' | 'sms'>('app');

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  // Privacy States
  const [publicProfile, setPublicProfile] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [anonymizedAnalytics, setAnonymizedAnalytics] = useState(true);
  const [profileIndexing, setProfileIndexing] = useState(false);

  // Theme & Appearance Side Effects
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (syncWithSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(isDarkMode);
    }
  }, [isDarkMode, syncWithSystem]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setPasswordError('New password cannot be empty');
      setPasswordStatus('error');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setPasswordStatus('error');
      return;
    }

    setPasswordStatus('updating');
    setPasswordError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordStatus('success');
      setNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password');
      setPasswordStatus('error');
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setSaveError('Name cannot be empty');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSaveError('Please enter a valid email address');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaveError('');
    setSaveStatus('saving');
    setTimeout(() => {
      onSave(trimmedName, trimmedEmail !== user?.email ? trimmedEmail : undefined);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1200);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'Small') return 'text-[0.85rem]';
    if (fontSize === 'Large') return 'text-[1.15rem]';
    return 'text-base';
  };

  const renderProfile = () => (
    <section className="bg-white dark:bg-[#1f1f14] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="size-24 rounded-full border-4 border-primary overflow-hidden shadow-2xl">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f2f20d&color=181811&bold=true`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <button className="absolute bottom-0 right-0 size-8 bg-background-dark text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-sm">photo_camera</span>
          </button>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black">Personal Information</h3>
          <p className="text-xs text-slate-500">Update your profile detail and public avatar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all" 
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bio</label>
          <textarea 
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all resize-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Timezone</label>
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all appearance-none cursor-pointer"
          >
            <option>GMT-05:00 (EST)</option>
            <option>GMT+00:00 (UTC)</option>
            <option>GMT+05:30 (IST)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Language</label>
          <select 
            className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all appearance-none cursor-pointer"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Hindi (HI)</option>
          </select>
        </div>
      </div>
    </section>
  );

  const renderAppearance = () => (
    <section className="bg-white dark:bg-[#1f1f14] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl font-black">Interface Theme</h3>
          <p className="text-xs text-slate-500">Choose your preferred visual style.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
           <button 
            title="Light Mode"
            onClick={() => { setIsDarkMode(false); setSyncWithSystem(false); }}
            className={`p-2 rounded-xl transition-all ${!isDarkMode && !syncWithSystem ? 'bg-white dark:bg-[#1f1f14] shadow-sm text-primary' : 'text-slate-400'}`}
           >
             <span className="material-symbols-outlined text-xl">light_mode</span>
           </button>
           <button 
            title="Dark Mode"
            onClick={() => { setIsDarkMode(true); setSyncWithSystem(false); }}
            className={`p-2 rounded-xl transition-all ${isDarkMode && !syncWithSystem ? 'bg-white dark:bg-[#1f1f14] shadow-sm text-primary' : 'text-slate-400'}`}
           >
             <span className="material-symbols-outlined text-xl">dark_mode</span>
           </button>
           <button 
            title="Sync with System"
            onClick={() => setSyncWithSystem(true)}
            className={`p-2 rounded-xl transition-all ${syncWithSystem ? 'bg-white dark:bg-[#1f1f14] shadow-sm text-primary' : 'text-slate-400'}`}
           >
             <span className="material-symbols-outlined text-xl">settings_brightness</span>
           </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Content Scale</label>
            <span className="text-xs font-black text-primary uppercase">{fontSize}</span>
          </div>
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['Small', 'Medium', 'Large'].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size as any)}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${fontSize === size ? 'bg-white dark:bg-[#1f1f14] text-primary shadow-sm' : 'text-slate-500'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <p className="text-sm font-bold">Reduced Motion</p>
            <p className="text-[10px] text-slate-500 leading-tight">Disable UI animations for a faster feel.</p>
          </div>
          <button 
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${reducedMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Live Preview Card */}
        <div className={`mt-8 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 ${getFontSizeClass()} transition-all`}>
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Scale Preview</p>
           <h4 className="font-black mb-2">Unlock Your Potential</h4>
           <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
             This is how text will appear across the platform with your selected scale. 
             Adjusting this affects readability and information density.
           </p>
        </div>
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="bg-white dark:bg-[#1f1f14] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black">Notification Channels</h3>
        <p className="text-xs text-slate-500">Configure how you receive alerts and updates.</p>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
           <div className="col-span-2">Activity</div>
           <div className="text-center">Email</div>
           <div className="text-center">Push</div>
        </div>
        {[
          { label: 'Learning Progress', desc: 'Module completions & streaks', state: notifProgress, setter: setNotifProgress },
          { label: 'Marketing & Deals', desc: 'Promotions and new launches', state: notifMarketing, setter: setNotifMarketing },
          { label: 'Account Security', desc: 'Logins and security events', state: notifSecurity, setter: setNotifSecurity }
        ].map((item, i) => (
          <div key={i} className="grid grid-cols-4 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="col-span-2 space-y-1">
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-[9px] text-slate-500 leading-tight">{item.desc}</p>
            </div>
            <div className="flex justify-center">
               <button 
                onClick={() => item.setter({...item.state, email: !item.state.email})}
                className={`size-6 rounded-lg flex items-center justify-center transition-all ${item.state.email ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
               >
                 <span className="material-symbols-outlined text-base">mail</span>
               </button>
            </div>
            <div className="flex justify-center">
               <button 
                onClick={() => item.setter({...item.state, push: !item.state.push})}
                className={`size-6 rounded-lg flex items-center justify-center transition-all ${item.state.push ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
               >
                 <span className="material-symbols-outlined text-base">notifications_active</span>
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-4">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Digest Frequency</label>
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {['Instant', 'Daily', 'Weekly'].map((freq) => (
            <button
              key={freq}
              onClick={() => setDigestFrequency(freq)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${digestFrequency === freq ? 'bg-white dark:bg-[#1f1f14] text-primary shadow-sm' : 'text-slate-500'}`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section className="bg-white dark:bg-[#1f1f14] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black">Security & Access</h3>
        <p className="text-xs text-slate-500">Protect your account and managed credentials.</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold">Two-Factor Authentication</p>
              <p className="text-[10px] text-slate-500 leading-tight">Highly recommended for account safety.</p>
            </div>
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {twoFactor && (
            <div className="flex gap-2 animate-in slide-in-from-top-2">
              <button 
                onClick={() => setAuthType('app')}
                className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${authType === 'app' ? 'bg-primary/5 border-primary text-primary' : 'bg-white dark:bg-[#1f1f14] border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                Authenticator App
              </button>
              <button 
                onClick={() => setAuthType('sms')}
                className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${authType === 'sms' ? 'bg-primary/5 border-primary text-primary' : 'bg-white dark:bg-[#1f1f14] border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                SMS Code
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update Password</h4>
           <div className="grid grid-cols-1 gap-4">
              <input 
                type="password" 
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary" 
              />
              <input 
                type="password" 
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#393928] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary" 
              />
              <button
                onClick={handleUpdatePassword}
                disabled={passwordStatus === 'updating'}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  passwordStatus === 'success' 
                    ? 'bg-green-500 text-white' 
                    : passwordStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-background-dark text-white dark:bg-primary dark:text-background-dark hover:scale-[1.02]'
                }`}
              >
                {passwordStatus === 'updating' ? 'Updating...' : 
                 passwordStatus === 'success' ? 'Password Updated!' : 
                 passwordStatus === 'error' ? 'Error Updating' : 'Update Password'}
              </button>
              {passwordError && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{passwordError}</p>
              )}
           </div>
        </div>
      </div>
    </section>
  );

  const renderPrivacy = () => (
    <section className="bg-white dark:bg-[#1f1f14] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black">Privacy Control</h3>
        <p className="text-xs text-slate-500">Manage your data visibility and usage footprint.</p>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Public Profile', desc: 'Allows others to view your earned badges and bio.', state: publicProfile, setter: setPublicProfile },
          { label: 'Show Progress', desc: 'Share your current courses and progress %.', state: showProgress, setter: setShowProgress },
          { label: 'Search Indexing', desc: 'Allow your profile to appear in external search engines.', state: profileIndexing, setter: setProfileIndexing },
          { label: 'Anonymous Analytics', desc: 'Help us improve Shala with anonymized usage data.', state: anonymizedAnalytics, setter: setAnonymizedAnalytics }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
            </div>
            <button 
              onClick={() => item.setter(!item.state)}
              className={`relative w-12 h-6 rounded-full transition-colors ${item.state ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${item.state ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
        <h4 className="text-sm font-black text-red-500 uppercase tracking-tight">Danger Zone</h4>
        <div className="flex gap-4">
          <button className="flex-1 py-4 px-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
            Delete My Account
          </button>
          <button className="flex-1 py-4 px-4 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase rounded-2xl hover:bg-slate-200 transition-all">
            Export My Data (JSON)
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none lg:text-5xl">Account Settings</h1>
          <p className="text-slate-500 dark:text-[#baba9c] text-base md:text-lg">Personalize your professional identity.</p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
           <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`w-full md:w-auto px-8 md:px-10 py-4 md:py-5 font-black rounded-2xl md:rounded-3xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 ${
              saveStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-primary text-background-dark'
            }`}
          >
            {saveStatus === 'saving' ? (
              <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
            ) : saveStatus === 'success' ? (
              <>
                <span className="material-symbols-outlined">done</span>
                SAVED SUCCESSFULLY
              </>
            ) : saveStatus === 'error' ? (
              <>
                <span className="material-symbols-outlined">error</span>
                VALIDATION ERROR
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                SAVE CHANGES
              </>
            )}
          </button>
          {saveError && (
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
              {saveError}
            </p>
          )}
          {saveStatus === 'success' && (
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
              Syncing profile metadata...
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#1f1f14] p-2 md:p-4 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
            <nav className="flex flex-row md:flex-col gap-1 min-w-max md:min-w-0">
              {[
                { id: 'Profile', icon: 'person' },
                { id: 'Appearance', icon: 'palette' },
                { id: 'Notifications', icon: 'notifications' },
                { id: 'Security', icon: 'security' },
                { id: 'Privacy', icon: 'visibility' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all ${activeSection === item.id ? 'bg-primary text-background-dark shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">{item.icon}</span>
                  {item.id.toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-8 bg-background-dark text-white rounded-[40px] shadow-2xl relative overflow-hidden text-left">
             <div className="absolute top-0 right-0 p-6 opacity-10">
               <span className="material-symbols-outlined text-6xl">verified_user</span>
             </div>
             <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Pro Membership</p>
             <h4 className="text-lg font-black leading-tight mb-4">Unlimited AI Tutor & Premium Certifications.</h4>
             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_rgba(242,242,13,0.5)]"></div>
             </div>
             <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Usage: 92% of Monthly Quota</p>
          </div>
        </div>

        <div className="md:col-span-2">
          {activeSection === 'Profile' && renderProfile()}
          {activeSection === 'Appearance' && renderAppearance()}
          {activeSection === 'Notifications' && renderNotifications()}
          {activeSection === 'Security' && renderSecurity()}
          {activeSection === 'Privacy' && renderPrivacy()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
