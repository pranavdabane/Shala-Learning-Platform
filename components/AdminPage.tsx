
import React, { useState, useEffect } from 'react';
import { Course, Category } from '../types';
import { supabase } from '../lib/supabase';

interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceEndTime?: number;
  platformFee: number;
  enableAiTutor: boolean;
  defaultCurrency: string;
  minWithdrawal: number;
  allowGuestReviews: boolean;
}

interface AdminPageProps {
  onBack: () => void;
  onEditCourse: (course: Course) => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  platformSettings: PlatformSettings;
  setPlatformSettings: (settings: PlatformSettings) => void;
  legalContent: any;
  setLegalContent: (content: any) => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  login_count?: number;
  last_login_at?: string;
}

interface UserReview {
  id: string;
  user_name: string;
  comment: string;
  rating: number;
  created_at: string;
  user_id?: string;
}

interface PlatformEnrollment {
  id: string;
  created_at: string;
  payment_method: string;
  order_id: string;
  progress: number;
  course_id: string;
  user_id: string;
}

interface WishlistEntry {
  user_id: string;
  course_id: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  activity_type: 'LOGIN' | 'REGISTER';
  created_at: string;
}

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_id?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  message: string;
  response: string;
  created_at: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
  onBack, 
  onEditCourse, 
  courses, 
  setCourses,
  platformSettings,
  setPlatformSettings
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reviews' | 'enrollments' | 'wishlist' | 'courses' | 'activity' | 'inquiries' | 'explorer' | 'chats'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [enrollments, setEnrollments] = useState<PlatformEnrollment[]>([]);
  const [wishlistEntries, setWishlistEntries] = useState<WishlistEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [explorerTable, setExplorerTable] = useState<string>('profiles');

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [uRes, rRes, eRes, wRes, aRes, iRes, cRes, chatRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').order('created_at', { ascending: false }),
        supabase.from('wishlist').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*'),
        supabase.from('chat_history').select('*').order('created_at', { ascending: false })
      ]);

      setUsers(uRes.data || []);
      setReviews(rRes.data || []);
      setEnrollments(eRes.data || []);
      setWishlistEntries(wRes.data || []);
      setActivityLogs(aRes.data || []);
      setInquiries(iRes.data || []);
      setChatMessages(chatRes.data || []);
      
      if (cRes.data && cRes.data.length > 0) {
        setCourses(cRes.data as Course[]);
      }
    } catch (err) {
      console.error("Database Audit Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from('reviews').delete().match({ id });
    if (!error) setReviews(prev => prev.filter(r => r.id !== id));
  };

  const UserDetailView = ({ user }: { user: UserProfile }) => {
    const userEnrollments = enrollments.filter(e => e.user_id === user.id);
    const userWishlist = wishlistEntries.filter(w => w.user_id === user.id);
    const userReviews = reviews.filter(r => r.user_id === user.id);

    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-background-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-2xl bg-white dark:bg-surface-dark h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=f2f20d&color=181811&bold=true`} className="size-20 rounded-3xl shadow-xl" alt="" />
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black">{user.full_name}</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{user.email}</p>
                <div className="flex justify-center sm:justify-start gap-4 mt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary transition-all self-end sm:self-auto">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-12">
            {/* ENROLLMENTS SECTION */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">receipt_long</span>
                  Course Enrollments ({userEnrollments.length})
                </h3>
              </div>
              <div className="space-y-3">
                {userEnrollments.length > 0 ? userEnrollments.map(e => {
                  const course = courses.find(c => c.id === e.course_id);
                  return (
                    <div key={e.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold text-sm">{course?.title || 'Unknown Course'}</p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-[9px] font-black uppercase text-primary">Ref: #{e.order_id || '99X'}</p>
                          <p className="text-[9px] font-black uppercase text-slate-400">Paid via: {e.payment_method || 'CREDIT CARD'}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black text-slate-500">{new Date(e.created_at).toLocaleDateString()}</p>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded">Progress: {e.progress}%</span>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400 italic">No enrollments yet.</p>}
              </div>
            </section>

            {/* WISHLIST SECTION */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">favorite</span>
                  Wishlist Activity ({userWishlist.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userWishlist.length > 0 ? userWishlist.map(w => {
                  const course = courses.find(c => c.id === w.course_id);
                  return (
                    <div key={w.course_id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center gap-3">
                       <img src={course?.imageUrl} className="size-10 rounded-lg object-cover" alt="" />
                       <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black truncate">{course?.title}</p>
                         <p className="text-[8px] text-slate-400 font-bold">Added {new Date(w.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400 italic">Wishlist is empty.</p>}
              </div>
            </section>

            {/* REVIEWS SECTION */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">rate_review</span>
                  Feedback History ({userReviews.length})
                </h3>
              </div>
              <div className="space-y-3">
                {userReviews.length > 0 ? userReviews.map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between mb-2 gap-1">
                      <div className="flex text-amber-500">
                        {Array.from({length: 5}).map((_, i) => <span key={i} className={`material-symbols-outlined text-[10px] ${i < r.rating ? 'fill-1' : ''}`}>star</span>)}
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{r.comment}"</p>
                  </div>
                )) : <p className="text-xs text-slate-400 italic">No reviews posted.</p>}
              </div>
            </section>

            {/* ACTIVITY HISTORY SECTION */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Session Activity ({activityLogs.filter(l => l.user_id === user.id).length})
                </h3>
              </div>
              <div className="space-y-2">
                {activityLogs.filter(l => l.user_id === user.id).map(log => (
                  <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${log.activity_type === 'REGISTER' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                      <p className="text-xs font-black uppercase tracking-widest">{log.activity_type}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {activityLogs.filter(l => l.user_id === user.id).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No recorded activity logs.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Cloud Profiles', value: users.length.toString(), icon: 'person_search', color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Verified Sales', value: enrollments.length.toString(), icon: 'account_balance_wallet', color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'Global Interest', value: wishlistEntries.length.toString(), icon: 'favorite', color: 'text-red-500', bg: 'bg-red-500/5' },
          { label: 'Platform Sentiment', value: reviews.length.toString(), icon: 'forum', color: 'text-amber-500', bg: 'bg-amber-500/5' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl group">
            <div className={`size-12 md:size-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${stat.color}`}>
              <span className="material-symbols-outlined text-3xl md:text-4xl font-black">{stat.icon}</span>
            </div>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{stat.label}</p>
            <p className="text-3xl md:text-4xl font-black tracking-tighter font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-black text-white p-8 md:p-16 rounded-[48px] md:rounded-[64px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 hidden lg:block pointer-events-none">
          <span className="material-symbols-outlined text-[180px] font-black text-primary">monitoring</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter font-display">Platform Intelligence Hub</h3>
            <p className="text-zinc-400 max-w-2xl font-medium text-sm md:text-xl leading-relaxed">Monitoring real-time activity across the cloud infrastructure. Audit student engagement metrics and financial history with precision.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => setActiveTab('users')} className="w-full sm:w-auto px-10 py-5 bg-primary text-background-dark font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">Open User Hub</button>
            <button onClick={() => setActiveTab('enrollments')} className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Audit Sales</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
      (u.email?.toLowerCase() || '').includes(userSearchQuery.toLowerCase()) ||
      (u.full_name?.toLowerCase() || '').includes(userSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-white dark:bg-zinc-900/50 rounded-[48px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
        <div className="p-10 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div>
            <h3 className="text-2xl font-black font-display">Student Intelligence Hub</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2">Select a student for deep-dive audit</p>
          </div>
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">search</span>
              <input 
                type="text"
                placeholder="Search by Gmail..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 transition-colors border border-zinc-100 dark:border-zinc-800">
              <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[500px] no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                {['Learner Profile', 'Email Identity', 'Joined On', 'Enrollments', 'Actions'].map(h => (
                  <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filteredUsers.map((u) => {
                const count = enrollments.filter(e => e.user_id === u.id).length;
                return (
                  <tr key={u.id} onClick={() => setSelectedUser(u)} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                    <td className="px-10 py-6 flex items-center gap-4">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=FACC15&color=000000&bold=true`} className="size-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" alt="" />
                      <div className="flex flex-col">
                        <span className="text-base font-black group-hover:text-primary transition-colors font-display">{u.full_name || 'Verified Learner'}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">ID: {u.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-zinc-500 font-bold">{u.email}</td>
                    <td className="px-10 py-6 text-[11px] text-zinc-400 uppercase font-black tracking-widest">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full ${count > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                        {count} {count === 1 ? 'TRACK' : 'TRACKS'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <button className="size-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all border border-zinc-100 dark:border-zinc-800">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="py-32 text-center text-zinc-400 italic font-medium">No student profiles matched your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20 pt-2 md:pt-0">
      {selectedUser && <UserDetailView user={selectedUser} />}
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 text-left">
        <div className="space-y-4 w-full lg:w-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-1 shadow-2xl shadow-red-500/20">
            <span className="material-symbols-outlined text-sm font-black">verified_user</span>
            Command Center Active
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.85] lg:text-8xl font-display">Control Center</h1>
          <p className="text-zinc-500 text-sm sm:text-2xl font-medium max-w-2xl leading-tight tracking-tight">Global oversight of student lifecycle, cloud fulfillment, and platform intelligence.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
          <button 
            onClick={() => { setActiveTab('courses'); onEditCourse?.({ id: '', title: '', description: '', price: 0, category: Category.TECHNOLOGY, imageUrl: '', rating: 0, reviews: 0, duration: '', instructor: '' }); }}
            className="px-10 py-5 bg-primary text-background-dark font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl font-black">add</span>
            Add New Track
          </button>
          <button onClick={onBack} className="px-10 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-2xl">logout</span>
            Exit Admin
          </button>
        </div>
      </div>

      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 group/admin-tabs">
        <div className="flex p-3 bg-zinc-100 dark:bg-zinc-950 rounded-[32px] md:rounded-[48px] w-full overflow-x-auto no-scrollbar shadow-inner border border-zinc-200 dark:border-white/5 scroll-smooth snap-x">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
              { id: 'users', label: 'User Hub', icon: 'group' },
              { id: 'activity', label: 'Activity Log', icon: 'history' },
              { id: 'enrollments', label: 'Sales Log', icon: 'payments' },
              { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
              { id: 'inquiries', label: 'Inquiries', icon: 'mail' },
              { id: 'chats', label: 'AI Chats', icon: 'smart_toy' },
              { id: 'reviews', label: 'Feedback', icon: 'rate_review' },
              { id: 'courses', label: 'Catalog', icon: 'inventory' },
              { id: 'explorer', label: 'Explorer', icon: 'database' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 snap-start border-2 ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-zinc-900 text-primary shadow-2xl border-primary scale-[1.05] z-10' 
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-primary' : ''}`}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Gradient Masks for scroll indication */}
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-background-light dark:from-background-dark to-transparent pointer-events-none opacity-40 group-hover/admin-tabs:opacity-100 transition-opacity"></div>
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-background-light dark:from-background-dark to-transparent pointer-events-none opacity-40 group-hover/admin-tabs:opacity-100 transition-opacity"></div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        
        {activeTab === 'wishlist' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="text-xl font-black">Global Wishlist Audit</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoring student interest across the catalog</p>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    {['Student', 'Course Interest', 'Added On'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {wishlistEntries.map((w, idx) => {
                    const user = users.find(u => u.id === w.user_id);
                    const course = courses.find(c => c.id === w.course_id);
                    return (
                      <tr key={`${w.user_id}-${w.course_id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold">{user?.full_name || 'Learner'}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{user?.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={course?.imageUrl} className="size-8 rounded-lg object-cover" alt="" />
                            <p className="text-sm font-bold">{course?.title || 'Archived Track'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">{new Date(w.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {wishlistEntries.length === 0 && (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">No wishlist data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="text-xl font-black">Inquiry Ledger</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Direct messages from the contact infrastructure</p>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    {['Sender', 'Subject', 'Message', 'Date'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {inquiries.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold">{i.full_name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{i.email}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/20">
                          {i.subject}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed max-w-md">"{i.message}"</td>
                      <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">{new Date(i.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {inquiries.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No inquiries recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="text-xl font-black">Raw Database Explorer</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Direct JSON audit of Supabase collections</p>
              </div>
              <select 
                value={explorerTable}
                onChange={(e) => setExplorerTable(e.target.value)}
                className="bg-white dark:bg-border-dark border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="profiles">Profiles Table</option>
                <option value="enrollments">Enrollments Table</option>
                <option value="reviews">Reviews Table</option>
                <option value="wishlist">Wishlist Table</option>
                <option value="activity_log">Activity Log Table</option>
                <option value="inquiries">Inquiries Table</option>
                <option value="courses">Courses Table</option>
                <option value="chat_history">AI Chat History</option>
              </select>
            </div>
            <div className="p-8">
              <div className="bg-slate-900 rounded-3xl p-6 overflow-auto max-h-[600px] shadow-inner">
                <pre className="text-emerald-400 text-[10px] font-mono leading-relaxed">
                  {JSON.stringify(
                    explorerTable === 'profiles' ? users :
                    explorerTable === 'enrollments' ? enrollments :
                    explorerTable === 'reviews' ? reviews :
                    explorerTable === 'wishlist' ? wishlistEntries :
                    explorerTable === 'activity_log' ? activityLogs :
                    explorerTable === 'inquiries' ? inquiries :
                    explorerTable === 'chat_history' ? chatMessages :
                    courses,
                    null, 2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="text-xl font-black">AI Tutor Interactions</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit of student questions and AI responses</p>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    {['Student', 'Interaction', 'Timestamp'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {chatMessages.map((chat) => (
                    <tr key={chat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold">{users.find(u => u.id === chat.user_id)?.full_name || 'Learner'}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{chat.user_email}</p>
                      </td>
                      <td className="px-8 py-5 space-y-2 max-w-xl">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <p className="text-[10px] font-black text-primary uppercase mb-1">Student Q:</p>
                          <p className="text-xs italic">"{chat.message}"</p>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                          <p className="text-[10px] font-black text-primary uppercase mb-1">AI Tutor A:</p>
                          <p className="text-xs line-clamp-2">{chat.response}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">{new Date(chat.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {chatMessages.length === 0 && (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">No AI chat logs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="text-xl font-black">User Activity Log</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time audit of every login and registration</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input 
                    type="text"
                    placeholder="Search activity..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-border-dark border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <button onClick={fetchData} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <span className={`material-symbols-outlined ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    {['Learner', 'Event', 'User ID', 'Timestamp'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {activityLogs
                    .filter(log => 
                      (log.email?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase()) ||
                      (log.full_name?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase()) ||
                      (log.activity_type?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase())
                    )
                    .map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => {
                        const user = users.find(u => u.id === log.user_id);
                        if (user) setSelectedUser(user);
                      }}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.full_name)}&background=181811&color=ffffff&bold=true`} className="size-8 rounded-lg" alt="" />
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{log.full_name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{log.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${log.activity_type === 'REGISTER' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {log.activity_type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[10px] text-slate-400 font-mono">
                        {log.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {activityLogs.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
           <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
               <div>
                 <h3 className="text-xl font-black">Sales Ledger</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Trail: Every cloud enrollment processed</p>
               </div>
             </div>
             <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                   <tr>
                     {['Reference', 'Student', 'Course', 'Payment How', 'Date'].map(h => (
                       <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {enrollments.map((e) => (
                     <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5 text-xs font-black text-primary">#{e.order_id || 'PRO'}</td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-bold">{users.find(u => u.id === e.user_id)?.full_name || 'Student'}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{users.find(u => u.id === e.user_id)?.email}</p>
                       </td>
                       <td className="px-8 py-5 text-sm font-bold truncate max-w-[200px]">{courses.find(c => c.id === e.course_id)?.title || 'Archived'}</td>
                       <td className="px-8 py-5">
                         <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border ${e.payment_method === 'UPI' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                           {e.payment_method || 'CARD'}
                         </span>
                       </td>
                       <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">{new Date(e.created_at).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
              <h3 className="text-xl font-black">Feedback Hub</h3>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    {['Reviewer', 'Rating', 'Comment', 'Moderation'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-black text-sm">{r.user_name}</td>
                      <td className="px-8 py-5 text-amber-500">
                        <div className="flex">{Array.from({length: 5}).map((_, i) => <span key={i} className={`material-symbols-outlined text-xs ${i < r.rating ? 'fill-1' : ''}`}>star</span>)}</div>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed max-w-md">"{r.comment}"</td>
                      <td className="px-8 py-5">
                         <button onClick={() => handleDeleteReview(r.id)} className="text-red-500 p-2 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                           <span className="material-symbols-outlined text-lg">delete</span>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-left">
                <h3 className="text-xl font-black">Course Catalog Management</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage cloud-hosted learning tracks</p>
              </div>
              <button 
                onClick={() => onEditCourse({
                  id: `course-${Date.now()}`,
                  title: 'New Course Title',
                  description: 'Course description goes here...',
                  category: Category.TECHNOLOGY,
                  price: 49.99,
                  rating: 5.0,
                  duration: '10h 30m',
                  imageUrl: 'https://picsum.photos/seed/course/800/600',
                  instructor: 'New Instructor'
                })}
                className="px-8 py-4 bg-primary text-background-dark font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                <span className="material-symbols-outlined font-black">add</span>
                Add New Track
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-500 text-left">
              {courses.map(course => (
                <div key={course.id} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 group">
                  <div className="flex gap-4">
                    <img src={course.imageUrl} className="size-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-primary mb-1">{course.category}</p>
                      <h4 className="font-bold text-sm leading-tight line-clamp-2">{course.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="space-y-1"><p className="text-[10px] text-slate-400 font-bold uppercase">Price</p><p className="text-sm font-black text-primary">${course.price}</p></div>
                    <button onClick={() => onEditCourse(course)} className="px-6 py-2 bg-background-dark text-white text-[10px] font-black uppercase rounded-lg hover:bg-primary hover:text-background-dark transition-all shadow-sm">Edit Track</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
