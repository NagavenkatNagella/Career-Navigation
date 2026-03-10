import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  BrainCircuit, Target, Map, BookOpen, Users,
  ChevronRight, Zap, CheckCircle2, AlertCircle, TrendingUp,
  Award, Globe, Rocket, ShieldCheck, Cloud, Briefcase,
  Star, BarChart3, Lock, Menu, X, RefreshCw, User,
  FilePlus, Image, MessageSquare, Send, Trash2, Ban,
  FileUp, Paperclip, Heart, MessageCircle, MoreVertical
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import type { CareerPathType, UserProfile, Post, CommunityMessage } from './types';
import { CAREER_PATHS, QUESTIONS_BY_PATH, ROADMAPS, INDUSTRY_TRENDS } from './data/careerData';
import './index.css';

import { auth, db, googleProvider, storage } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, getDoc, setDoc, collection, query, getDocs, 
  where, updateDoc, arrayUnion, onSnapshot, addDoc, 
  arrayRemove, serverTimestamp, deleteDoc, orderBy, limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ─── Motion Variants ─────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// ─── Helpers ────────────────────────────────────────────────
const ICONS: Record<string, ReactNode> = {
  'software-dev':   <Rocket size={22} />,
  'data-science':   <Briefcase size={22} />,
  'cybersecurity':  <ShieldCheck size={22} />,
  'ai-ml':          <BrainCircuit size={22} />,
  'cloud-eng':      <Cloud size={22} />,
  'ui-ux':          <Map size={22} />
};

const CAREER_COLORS: Record<string, string> = {
  'software-dev':   '#38bdf8',
  'data-science':   '#a78bfa',
  'cybersecurity':  '#ef4444',
  'ai-ml':          '#f59e0b',
  'cloud-eng':      '#10b981',
  'ui-ux':          '#ec4899'
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const SAMPLE_GROWTH = [
  { month:'Jan', demand:62 }, { month:'Feb', demand:68 }, { month:'Mar', demand:71 },
  { month:'Apr', demand:75 }, { month:'May', demand:82 }, { month:'Jun', demand:89 },
  { month:'Jul', demand:93 },
];

function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'mentorshipRequests'), 
      where('mentorId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );
    
    const getCount = async () => {
      try {
        const snapshot = await getDocs(q);
        setCount(snapshot.size);
      } catch (err) {
        console.error("Error fetching notification count:", err);
      }
    };
    getCount();
  }, []);

  if (count === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }}
      style={{ 
        position: 'absolute', top: -5, right: -5, 
        minWidth: 20, height: 20, borderRadius: 10, 
        background: '#ef4444', color: '#fff', 
        fontSize: '0.65rem', fontWeight: 800, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        padding: '0 4px', border: '2px solid var(--bg-base)',
        pointerEvents: 'none'
      }}
    >
      {count}
    </motion.div>
  );
}

// ─── App Root ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<'splash' | 'role-selection' | 'login' | 'onboarding' | 'assessment' | 'main'>('splash');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [role, setRole] = useState<'user' | 'mentor'>('user');

  const [user, setUser] = useState<UserProfile>({
    name: '', education: '', goal: 'software-dev',
    experienceLevel: 'beginner',
    skills: { Fundamentals: 0, 'Core Skills': 0, 'Advanced Concepts': 0, Tools: 0, 'Industry Prep': 0 },
    mentors: [], mentees: []
  });

  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successNotif, setSuccessNotif] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      if (view === 'splash') setView('role-selection');
    }, 1800);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Nav handling only
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const dbRole = userData.role as 'user' | 'mentor' || 'user';
            setRole(dbRole);
            
            if (userData.onboarded) {
              if (view === 'splash' || view === 'role-selection' || view === 'login') {
                setView('main');
                setActiveTab(dbRole === 'mentor' ? 'mentor-stats' : 'dashboard');
              }
            } else if (view === 'splash' || view === 'role-selection' || view === 'login') {
              setView('onboarding');
            }
          }
        } catch (err) {
          console.error("Auth routing failed:", err);
        }
      }
    });
    return () => {
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, [view]);

  // Real-time Profile Sync
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setUser(prev => ({ ...prev, ...data }));
        if (data.role) setRole(data.role);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  useEffect(() => {
    if (successNotif) {
      const timer = setTimeout(() => setSuccessNotif(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successNotif]);

  const handleLoginSucceed = async (selectedRole: 'user' | 'mentor', isOnboarded?: boolean) => {
    setRole(selectedRole);
    try {
      if (auth.currentUser) {
        // If we already know the status from LoginScreen, use it
        if (isOnboarded === true) {
          setView('main');
          setActiveTab(selectedRole === 'mentor' ? 'mentor-stats' : 'dashboard');
          return;
        }

        // Secondary verification: fetch doc if status is unknown or false
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.onboarded) {
            setView('main');
            setActiveTab(selectedRole === 'mentor' ? 'mentor-stats' : 'dashboard');
            return;
          }
        }
      }
    } catch (err: any) {
      console.error("Login verification failed:", err);
    }
    setView('onboarding');
  };

  const handleOnboardingDone = async (name: string, edu: string, goal: CareerPathType, additionalData?: any) => {
    setUser(p => ({ ...p, name, education: edu, goal }));
    
    try {
      if (auth.currentUser) {
        let userData: any = {
          name,
          education: edu,
          goal,
          ...additionalData,
          onboarded: true
        };

        if (role !== 'mentor') {
          userData.skills = {
            Fundamentals: 45,
            'Core Skills': 30,
            'Advanced Concepts': 10,
            Tools: 25,
            'Industry Prep': 15
          };
          setUser(p => ({ ...p, skills: userData.skills }));
        }

        await setDoc(doc(db, 'users', auth.currentUser.uid), userData, { merge: true });
      }
    } catch (err: any) {
      console.error("Onboarding sync failed:", err);
      // Still allow them to enter the dashboard if sync fails locally
      setGlobalError("Profile saved locally. Syncing to cloud in background...");
    }

    if (role === 'mentor') {
      setView('main');
      setActiveTab('mentor-stats');
    } else {
      setView('assessment');
    }
  };

  const handleAnswer = async (opt: number) => {
    const qs = QUESTIONS_BY_PATH[user.goal];
    const ns = score + (opt === qs[qIdx].correctAnswer ? 1 : 0);
    if (qIdx < qs.length - 1) { setScore(ns); setQIdx(p => p+1); }
    else {
      const base = (ns / qs.length) * 80;
      const finalSkills = {
        Fundamentals: Math.min(100, base + 12),
        'Core Skills': Math.min(100, base),
        'Advanced Concepts': Math.max(8, base - 20),
        Tools: 42,
        'Industry Prep': 14
      };
      setUser(p => ({ ...p, skills: finalSkills }));
      setScore(ns);
      
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          skills: finalSkills
        }, { merge: true });
      }

      setView('main');
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="relative overflow-x-hidden" style={{ minHeight:'100vh' }}>
      {/* Animated background */}
      <div className="bg-canvas" />
      <div className="bg-grid" />

      {/* Connectivity Alert */}
      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            style={{ 
              position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', 
              zIndex: 10000, 
              background: globalError.includes('Syncing') ? 'rgba(56, 189, 248, 0.9)' : 'rgba(239, 68, 68, 0.9)', 
              backdropFilter: 'blur(8px)',
              padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            {globalError.includes('Syncing') ? <RefreshCw size={20} color="#fff" className="animate-spin" /> : <AlertCircle size={20} color="#fff" />}
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{globalError}</span>
            <button onClick={() => setGlobalError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, display: 'flex' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successNotif && (
          <motion.div 
            initial={{ y: 80, opacity: 0, scale: 0.9 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 80, opacity: 0, scale: 0.8 }}
            style={{ 
              position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', 
              zIndex: 10000, 
              background: 'rgba(16, 185, 129, 0.98)', 
              backdropFilter: 'blur(16px)',
              padding: '1.25rem 2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px', letterSpacing: '-0.01em' }}>{successNotif.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600 }}>{successNotif.message}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }} />
            <button onClick={() => setSuccessNotif(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, padding: '8px' }}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'splash'      && <SplashScreen key="splash" />}
        {view === 'role-selection' && (
          <RoleSelectionScreen 
            key="role" 
            onSelect={(selectedRole: 'user' | 'mentor') => {
              setRole(selectedRole);
              setView('login');
            }} 
          />
        )}
        {view === 'login'       && <LoginScreen key="login" role={role} onLogin={handleLoginSucceed} />}
        {view === 'onboarding'  && <OnboardingScreen key="ob" role={role} onDone={handleOnboardingDone} />}
        {view === 'assessment'  && (
          <AssessmentScreen
            key="as"
            user={user}
            qIdx={qIdx}
            onAnswer={handleAnswer}
          />
        )}
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', zIndex: 1 }}>
            {/* NAVBAR */}
            <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 200 }}>
              <div className="container flex items-center justify-between" style={{ height: '68px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
                    Skill<span style={{ color: 'var(--accent-1)' }}>Bridge</span> <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{role === 'mentor' ? 'MENTOR' : 'LEARNER'}</span>
                  </span>
                </div>

                {/* Desktop tabs */}
                <div className="flex gap-2 hide-mobile" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 999, padding: '0.35rem', border: '1px solid var(--border-subtle)' }}>
                  {(role === 'mentor'
                    ? [
                      { id: 'mentor-stats', icon: <TrendingUp size={15} />, label: 'Analytics' },
                      { id: 'mentor-users', icon: <Users size={15} />, label: 'Cohorts' },
                      { id: 'chat', icon: <Briefcase size={15} />, label: 'Messages' },
                      { id: 'resources-hub', icon: <BookOpen size={15} />, label: 'Hub' },
                      { id: 'communities', icon: <Globe size={15} />, label: 'Communities' },
                      { id: 'profile', icon: <User size={15} />, label: 'Profile' }
                    ]
                    : [
                      { id: 'dashboard', icon: <Target size={15} />, label: 'Home' },
                      { id: 'path', icon: <Map size={15} />, label: 'Roadmap' },
                      { id: 'recommendations', icon: <Zap size={15} />, label: 'Resources' },
                      { id: 'mentors', icon: <Users size={15} />, label: 'Mentors' },
                      { id: 'chat', icon: <Briefcase size={15} />, label: 'Chat' },
                      { id: 'communities', icon: <Globe size={15} />, label: 'Groups' },
                      { id: 'profile', icon: <User size={15} />, label: 'Profile' }
                    ]).map(t => (
                      <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.icon}<span className="nav-labels">{t.label}</span>
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="hide-mobile" style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name || (role === 'mentor' ? 'Admin Mentor' : 'Learner')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-1)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {role === 'mentor' ? 'Expert Advisor' : CAREER_PATHS[user.goal].label}
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="animate-glowPulse" 
                      style={{ 
                        width: 40, height: 40, borderRadius: 12, 
                        background: activeTab === 'profile' ? '#fff' : 'linear-gradient(135deg,#38bdf8,#7c3aed)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', 
                        color: activeTab === 'profile' ? 'var(--accent-1)' : '#fff',
                        border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                    >
                      {(user.name ? user.name[0] : (role === 'mentor' ? 'M' : 'L')).toUpperCase()}
                    </button>
                    {role === 'mentor' && (
                       <NotificationBadge />
                    )}
                  </div>
                  <button className="btn btn-ghost btn-icon show-mobile" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle Menu">
                    {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                  </button>
                  <button className="btn btn-ghost btn-icon hide-mobile" onClick={() => { auth.signOut(); setView('login'); }} title="Sign Out">
                    <Lock size={18} />
                  </button>
                </div>
              </div>

              {/* Mobile menu */}
              <AnimatePresence>
                {mobileMenu && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border-subtle)', padding: '0.75rem', background: 'rgba(2,8,23,0.95)' }}>
                    {(role === 'mentor'
                      ? ['mentor-stats', 'mentor-users', 'chat', 'resources-hub', 'communities', 'profile']
                      : ['dashboard', 'path', 'recommendations', 'mentors', 'chat', 'communities', 'profile']).map(t => (
                        <button key={t} onClick={() => { setActiveTab(t); setMobileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, color: activeTab === t ? 'var(--accent-1)' : 'var(--text-muted)', background: activeTab === t ? 'rgba(56,189,248,0.1)' : 'transparent', marginBottom: 4 }}>
                          {t.replace('mentor-', '').replace('resources-hub', 'Resources').replace('communities', 'Groups').charAt(0).toUpperCase() + t.replace('mentor-', '').replace('resources-hub', 'Resources').replace('communities', 'Groups').slice(1)}
                        </button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            {/* MAIN CONTENT */}
            <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <DashboardTab key="db" user={user} score={score} setActiveTab={setActiveTab} />}
                {activeTab === 'path' && <RoadmapTab key="rt" user={user} />}
                {activeTab === 'recommendations' && <ResourcesTab key="res" user={user} />}
                {activeTab === 'mentors' && <MentorsTab key="mt" user={user} onNotify={(name) => setSuccessNotif({ title: 'Request Dispatched!', message: `Connected with mentor: ${name}` })} />}
                {activeTab === 'profile' && <ProfileTab key="prof" user={user} setUser={setUser} />}
                {activeTab === 'mentor-stats' && <MentorDashboard key="mstats" />}
                {activeTab === 'mentor-users' && <MentorUserManagement key="musers" />}
                {activeTab === 'chat' && <ChatTab key="chat" user={user} role={role} />}
                {activeTab === 'resources-hub' && <ResourcesHub key="rhub" user={user} role={role} />}
                {activeTab === 'communities' && <CommunitiesTab key="comm" user={user} role={role} onNotify={(msg) => setSuccessNotif({ title: 'Welcome to the Community!', message: msg })} />}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════
function SplashScreen() {
  const [quote, setQuote] = useState("");
  const quotes = [
    "Navigate Tomorrow's Industry, Today.",
    "Bridge the Gap: From Learner to Leader.",
    "Data-Driven Decisions, AI-Powered Future.",
    "Your Career Architecture, Redefined."
  ];

  useEffect(() => {
    const selected = quotes[Math.floor(Math.random() * quotes.length)];
    let i = 0;
    const timer = setInterval(() => {
      setQuote(selected.slice(0, i));
      i++;
      if (i > selected.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const floatingIcons = [
    { icon: <BrainCircuit size={24} />, x: '-30%', y: '-25%', delay: 0 },
    { icon: <Zap size={20} />, x: '35%', y: '-15%', delay: 0.5 },
    { icon: <Rocket size={22} />, x: '-25%', y: '25%', delay: 1 },
    { icon: <Target size={24} />, x: '30%', y: '20%', delay: 1.5 },
    { icon: <Globe size={20} />, x: '0%', y: '-35%', delay: 2 },
  ];

  return (
    <motion.div
      key="sp"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
      transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        background: 'var(--bg-base)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden' 
      }}
    >
      {/* Dynamic Background Atmosphere */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(2,8,23,0.8) 100%)', zIndex: 3 }}></div>
      
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <div className="orb orb-blue" style={{ width: 900, height: 900, top: '-10%', left: '-20%', filter: 'blur(140px)', opacity: 0.4 }} />
        <div className="orb orb-purple" style={{ width: 800, height: 800, bottom: '-15%', right: '-15%', filter: 'blur(140px)', opacity: 0.4 }} />
      </motion.div>

      {/* Floating Background Elements */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            scale: [1, 1.1, 1],
            y: ['0%', '10%', '0%'],
            x: ['0%', '5%', '0%']
          }}
          transition={{ 
            duration: 5 + i, 
            repeat: Infinity, 
            delay: item.delay,
            ease: 'easeInOut' 
          }}
          style={{ 
            position: 'absolute', 
            left: `calc(50% + ${item.x})`, 
            top: `calc(50% + ${item.y})`, 
            color: 'var(--accent-1)',
            zIndex: 2,
            filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.3))'
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Main Branding Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }} 
        animate={{ opacity: 1, scale: 1.05 }} 
        transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }} 
        style={{ textAlign: 'center', position: 'relative', zIndex: 5, width: '100%', maxWidth: '900px' }}
      >
        {/* Revolving Orbiting Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: 'clamp(350px, 60vw, 700px)', 
            height: 'clamp(350px, 60vw, 700px)', 
            border: '1px dashed rgba(56,189,248,0.2)', 
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: 'clamp(450px, 75vw, 850px)', 
            height: 'clamp(450px, 75vw, 850px)', 
            border: '1px solid rgba(124,58,237,0.1)', 
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Center Logo with Quantum Singularity Frame */}
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', padding: 'clamp(50px, 10vw, 100px)' }}>
          {/* Hyper-Space Horizon (Deep Background) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* The Singularity Pulse (Fractal Light) */}
            <motion.div
              animate={{ 
                scale: [1, 1.15, 0.95, 1],
                rotate: [0, 90, 180, 360],
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                width: '130%',
                height: '130%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
                border: '1px solid rgba(56,189,248,0.2)',
                zIndex: -3,
                filter: 'blur(20px)'
              }}
            />

            {/* Orbital Conduits (Proprietary Motion) */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: i % 2 === 0 ? 360 : -360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 15 + i * 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i }
                }}
                style={{
                  position: 'absolute',
                  width: `${110 + i * 15}%`,
                  height: `${110 + i * 15}%`,
                  border: `1px solid rgba(124,58,237,${0.15 - i * 0.04})`,
                  borderRadius: i % 2 === 0 ? '42% 58% 50% 50% / 45% 45% 55% 55%' : '60% 40% 30% 70% / 60% 30% 70% 40%',
                  zIndex: -2,
                }}
              >
                {/* Traveling Data Node */}
                <motion.div
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    width: 6, height: 6,
                    background: 'var(--accent-1)',
                    boxShadow: '0 0 15px var(--accent-1)',
                    borderRadius: '50%',
                    offsetPath: `path('M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0')`, // Placeholder path logic
                    top: '-3px',
                    left: '50%'
                  }}
                />
              </motion.div>
            ))}

            {/* Geometric Singularity Shards */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.2, 0.6, 0.2],
                  height: [20, 40, 20]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  position: 'absolute',
                  width: 2,
                  background: `linear-gradient(to top, transparent, ${i % 2 === 0 ? 'var(--accent-1)' : 'var(--accent-2)'}, transparent)`,
                  transform: `rotate(${i * 30}deg) translateY(clamp(-220px, -30vw, -140px))`,
                  zIndex: 2
                }}
              />
            ))}
          </div>

          {/* Core Content (Logo) */}
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.01, 1],
              filter: [
                'drop-shadow(0 0 30px rgba(56,189,248,0.4))', 
                'drop-shadow(0 0 70px rgba(56,189,248,0.7))', 
                'drop-shadow(0 0 30px rgba(56,189,248,0.4))'
              ]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 6 }}
          >
            <img 
              src="/logo.png" 
              alt="SkillBridge Logo" 
              style={{ 
                width: 'clamp(220px, 32vw, 420px)', 
                height: 'auto', 
                display: 'block',
                filter: 'contrast(1.1) brightness(1.1)'
              }} 
            />
          </motion.div>

          {/* Hyper-Aura Glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 60%)',
            zIndex: -1,
            pointerEvents: 'none'
          }} />
        </div>

        {/* Animated Quotation */}
        <div style={{ marginTop: '2.5rem', minHeight: '1.5rem', overflow: 'hidden' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
              color: 'var(--text-secondary)', 
              fontWeight: 600, 
              letterSpacing: '0.05em',
              textShadow: '0 0 10px rgba(255,255,255,0.1)'
            }}
          >
            {quote}<span style={{ display: 'inline-block', width: '2px', height: '1.2em', background: 'var(--accent-1)', marginLeft: '4px', verticalAlign: 'middle' }}></span>
          </motion.p>
        </div>

        {/* Logo Shadow/Glow Base */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 'clamp(300px, 50vw, 600px)', 
            height: 'clamp(300px, 50vw, 600px)', 
            background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)', 
            zIndex: 4 
          }}
        />
      </motion.div>

      {/* Finishing Touch: Particle Field */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{ 
              duration: 3 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 2 
            }}
            style={{ 
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: i % 2 === 0 ? 'var(--accent-1)' : 'var(--accent-2)',
              borderRadius: '50%',
              filter: 'blur(1.5px)'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROLE SELECTION SCREEN
// ═══════════════════════════════════════════════════════════════
function RoleSelectionScreen({ onSelect }: { onSelect: (role: 'user' | 'mentor') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="orb orb-blue" style={{ width: 600, height: 600, top: '-20%', left: '-10%', opacity: 0.3 }} />
      <div className="orb orb-purple" style={{ width: 500, height: 500, bottom: '-10%', right: '-5%', opacity: 0.3 }} />

      <motion.div 
        variants={fadeUp} initial="hidden" animate="visible"
        style={{ textAlign: 'center', marginBottom: '4rem' }}
      >
        <div className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>Get Started</div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: 900, 
          letterSpacing: '-0.04em',
          marginBottom: '1rem'
        }}>
          Choose Your <span style={{ background: 'linear-gradient(135deg,#38bdf8,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
          Are you looking to accelerate your career growth or ready to guide the next generation of industry leaders?
        </p>
      </motion.div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        width: '100%', 
        maxWidth: '900px' 
      }}>
        {/* Learner Option */}
        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          onClick={() => onSelect('user')}
          className="grad-border"
          style={{ cursor: 'pointer' }}
        >
          <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)', marginBottom: '2rem' }}>
              <Rocket size={40} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Learner</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Access AI-driven roadmaps, personalized assessments, and a vast network of industry mentors to reach your career goals.
            </p>
            <div className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>I want to learn</div>
          </div>
        </motion.div>

        {/* Mentor Option */}
        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          onClick={() => onSelect('mentor')}
          className="grad-border"
          style={{ cursor: 'pointer' }}
        >
          <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-2)', marginBottom: '2rem' }}>
              <Users size={40} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Mentor</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Share your expertise, track learner progress, and help shape the future of talent in the industry.
            </p>
            <div className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>I want to mentor</div>
          </div>
        </motion.div>
      </div>

      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        style={{ marginTop: '4rem', fontSize: '0.875rem', color: 'var(--text-hint)' }}
      >
        You can always switch your perspective later.
      </motion.p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({ role, onLogin }: { role: 'user' | 'mentor'; onLogin: (role: 'user' | 'mentor', onboarded?: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const loadingMsgs = [
    "Authenticating...",
    "Scanning user records...",
    "Synchronizing cloud data...",
    "Optimizing your dashboard...",
    "Almost there..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading && !isSuccess) {
      interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % loadingMsgs.length);
      }, 600); // Faster cycling for 'speed' perception
    }
    return () => clearInterval(interval);
  }, [loading, isSuccess]);

  const triggerSuccess = (finalRole: 'user' | 'mentor', onboarded: boolean = false) => {
    setStatusMsg(`Welcome, ${auth.currentUser?.displayName?.split(' ')[0] || 'User'}!`);
    setIsSuccess(true);
    setTimeout(() => {
      onLogin(finalRole, onboarded);
    }, 300); // Ultra snappy 300ms redirect
  };

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
        triggerSuccess(role, false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          triggerSuccess(data.role as 'user' | 'mentor' || 'user', !!data.onboarded);
        } else {
          triggerSuccess('user', false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      console.log("Initiating Google Sign-In...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Auth success, checking Firestore for user:", user.uid);

      setLoading(true); // Keep loading state until success overlay
      setStatusMsg("Verifying your profile...");
      
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (dbErr: any) {
        console.warn("Firestore fetch error:", dbErr);
      }

      let finalRole = role;
      let isOnboarded = false;
      if (userDoc?.exists()) {
        const data = userDoc.data();
        finalRole = data.role as 'user' | 'mentor' || 'user';
        isOnboarded = !!data.onboarded;
        console.log("Existing user found with role:", finalRole);
        setStatusMsg("Restoring your workspace...");
      } else {
        console.log("New user detected, initializing profile...");
        setStatusMsg("Setting up your new profile...");
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: user.displayName || '',
            role: role,
            createdAt: new Date().toISOString()
          });
        } catch (setErr: any) {
          console.error("Failed to create user doc:", setErr);
        }
      }
      
      setStatusMsg("Login successful!");
      triggerSuccess(finalRole, isOnboarded);
    } catch (err: any) {
      console.error("Google Auth Full Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-In. Please add it in Firebase Console.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in your Firebase project.');
      } else {
        setError(err.message || 'Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', zIndex: 1 }}
    >
      {/* Processing & Success Overlay */}
      <AnimatePresence>
        {(loading || isSuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(2,8,23,0.92)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem'
            }}
          >
            {!isSuccess ? (
              <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Background Shard Particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * 80],
                      y: [0, (i < 3 ? 1 : -1) * 80],
                      rotate: [0, 180]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    style={{ 
                      position: 'absolute', width: 4, height: 4, 
                      background: 'var(--accent-1)', borderRadius: '50%',
                      filter: 'blur(1px)'
                    }}
                  />
                ))}

                {/* Advanced triple ring loader */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'var(--accent-1)',
                    filter: 'drop-shadow(0 0 8px var(--accent-1))'
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute', inset: 12,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'var(--accent-2)',
                    opacity: 0.7
                  }}
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <BrainCircuit size={40} className="gradient-text" style={{ filter: 'drop-shadow(0 0 15px rgba(56,189,248,0.6))' }} />
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--glow-primary)'
                }}
              >
                <motion.svg
                  width="70" height="70" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    d="M20 6L9 17L4 12"
                  />
                </motion.svg>
              </motion.div>
            )}

            <motion.div
              style={{ textAlign: 'center', minHeight: '80px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {isSuccess ? "Identity Verified" : "Accessing SkillBridge"}
              </h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isSuccess ? 'success' : loadingMsgs[msgIndex]}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1.25rem', 
                    letterSpacing: '0.02em', 
                    fontWeight: 600,
                    textShadow: '0 0 20px rgba(56,189,248,0.2)'
                  }}
                >
                  {isSuccess ? statusMsg : loadingMsgs[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Decorative orbs */}
      <div className="orb orb-blue" style={{ width: 600, height: 600, top: '-25%', right: '-20%', opacity: 0.5, position: 'fixed' }} />
      <div className="orb orb-purple" style={{ width: 500, height: 500, bottom: '-20%', left: '-15%', opacity: 0.5, position: 'fixed' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: 980, width: '100%', alignItems: 'center' }}>
        {/* Left hero */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="hide-mobile">
          <motion.div variants={fadeUp} className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>
            <Zap size={12} /> {role === 'mentor' ? 'Expert Portal' : 'Powered by AI'}
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            {role === 'mentor' ? 'Empower the next generation of professionals' : 'Bridge the gap between learning & industry demand'}
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1rem' }}>
            {role === 'mentor' 
              ? 'Join our network of elite mentors and help students navigate their career paths with real-world insights and guidance.'
              : 'Intelligent, data-driven career navigation that aligns your aspirations with real market needs.'}
          </motion.p>
        </motion.div>

        {/* Right login card */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="grad-border">
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Accessing as <span style={{ color: role === 'mentor' ? 'var(--accent-2)' : 'var(--accent-1)', textTransform: 'uppercase' }}>{role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56,189,248,0.2)' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}
              
              <button className="btn btn-ghost w-full" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)' }} onClick={handleGoogleAuth} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{ margin: '0 1rem', fontSize: '0.75rem', color: 'var(--text-hint)', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              {/* Tab toggle */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: 4, border: '1px solid var(--border-subtle)' }}>
                {(['signin', 'signup'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-display)', background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', transition: 'all 0.3s' }}>
                    {t === 'signin' ? 'Email Login' : 'Email Signup'}
                  </button>
                ))}
              </div>

              <div className="input-wrap">
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
              </div>
              <div className="input-wrap">
                <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
              </div>

              <button className="btn btn-primary w-full" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.25rem' }} onClick={handleAuth} disabled={loading}>
                {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════
function OnboardingScreen({ role, onDone }: { role: 'user' | 'mentor'; onDone: (n: string, e: string, g: CareerPathType, extra?: any) => void }) {
  const [name, setName]   = useState(auth.currentUser?.displayName || '');
  const [edu,  setEdu]    = useState('');
  const [goal, setGoal]   = useState<CareerPathType>('software-dev');
  const [bio, setBio]     = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const EDU_SUGGESTIONS = [
    'B.Tech CSE', 'B.Tech ECE', 'B.Com', 'BCA', 'MCA', 'BSc CS', 'MBA', 'M.Tech'
  ];

  const INTEREST_SUGGESTIONS = [
    'Software Development', 'Data Science', 'Cloud Engineering', 'AI/ML', 'UI/UX Design', 'Cybersecurity'
  ];


  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(i => i !== s));

  if (role === 'mentor') {
    return (
      <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }} transition={{ duration:0.5 }}
        style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', position:'relative', zIndex:1 }}
      >
        <div style={{ width:'100%', maxWidth:700 }}>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="glass" style={{ padding:'3rem' }}>
            <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
              <div style={{ width:70, height:70, borderRadius:20, overflow:'hidden', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
                <img src="/logo.png" alt="Logo" style={{ width:'80%', height:'80%', objectFit:'contain' }} />
              </div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, marginBottom:'0.5rem' }}>Setup Mentor Profile</h2>
              <p style={{ color:'var(--text-muted)' }}>Introduce yourself to the community and list your expertise.</p>
            </motion.div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="input-wrap">
                  <label className="input-label">Professional Name</label>
                  <input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Sarah Chen" />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Current Role / Title</label>
                  <input className="input-field" value={edu} onChange={e=>setEdu(e.target.value)} placeholder="Sr. Engineer @ Google" />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="input-wrap">
                <label className="input-label">Professional Bio</label>
                <textarea 
                  className="input-field" 
                  value={bio} 
                  onChange={e=>setBio(e.target.value)} 
                  placeholder="Tell learners about your journey..."
                  style={{ minHeight: '100px', resize: 'vertical', padding: '1rem' }}
                />
              </motion.div>

              <motion.div variants={fadeUp} className="input-wrap">
                <label className="input-label">Expertise / Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input 
                    className="input-field" 
                    value={newSkill} 
                    onChange={e=>setNewSkill(e.target.value)} 
                    placeholder="Add a skill (e.g. React, Python)"
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                  />
                  <button className="btn btn-primary" onClick={handleAddSkill} style={{ height: 'auto' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.8rem', color: 'var(--accent-2)' }}>
                      {s} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.button variants={fadeUp}
                disabled={!name || !edu || skills.length === 0 || processing}
                className="btn btn-primary"
                style={{ width:'100%', padding:'1rem', fontSize:'1rem', marginTop:'0.5rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
                onClick={async () => {
                  setProcessing(true);
                  try {
                    await onDone(name, edu, goal, { bio, skills, role });
                  } finally {
                    setProcessing(false);
                  }
                }}
              >
                {processing ? 'Creating Profile...' : 'Complete Profile'} <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }} transition={{ duration:0.5 }}
      style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', position:'relative', zIndex:1 }}
    >
      <div style={{ width:'100%', maxWidth:700 }}>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="glass" style={{ padding:'3.5rem', borderRadius: '24px' }}>
          <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ width:80, height:80, borderRadius:22, overflow:'hidden', background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', boxShadow: '0 0 40px rgba(56,189,248,0.1)' }}>
              <img src="/logo.png" alt="Logo" style={{ width:'75%', height:'75%', objectFit:'contain' }} />
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2.25rem', fontWeight:900, marginBottom:'0.75rem', letterSpacing: '-0.02em' }}>Professional Profile</h2>
            <p style={{ color:'var(--text-muted)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>Customize your professional journey with precision-mapped career paths.</p>
          </motion.div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="input-wrap">
                <label className="input-label">Full Name</label>
                <input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="input-wrap">
                <label className="input-label">Education / Degree</label>
                <input className="input-field" value={edu} onChange={e=>setEdu(e.target.value)} placeholder="e.g. B.Tech CSE" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {EDU_SUGGESTIONS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setEdu(s)}
                      style={{ 
                        padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', 
                        background: edu === s ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${edu === s ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)'}`,
                        color: edu === s ? 'var(--accent-1)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="input-wrap">
              <label className="input-label">Primary Interests / Goals</label>
              <textarea 
                className="input-field" 
                value={bio} 
                onChange={e=>setBio(e.target.value)} 
                placeholder="What do you hope to achieve with SkillBridge? (e.g. Mastering Cloud, Career switch to AI...)"
                style={{ minHeight: '80px', resize: 'vertical', padding: '1rem' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {INTEREST_SUGGESTIONS.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setBio(p => p ? (p.includes(s) ? p : p + ', ' + s) : s)}
                    style={{ 
                      padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', 
                      background: bio.includes(s) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${bio.includes(s) ? 'var(--accent-2)' : 'rgba(255,255,255,0.1)'}`,
                      color: bio.includes(s) ? 'var(--accent-2)' : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textTransform: 'none'
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="input-wrap">
              <label className="input-label">Current Skills (Optional)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  className="input-field" 
                  value={newSkill} 
                  onChange={e=>setNewSkill(e.target.value)} 
                  placeholder="Add a skill you already have"
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                />
                <button className="btn btn-ghost" onClick={handleAddSkill} style={{ height: 'auto', padding: '0 1.25rem' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontSize: '0.75rem', color: 'var(--accent-1)' }}>
                    {s} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="input-label" style={{ display:'block', marginBottom:'0.75rem' }}>Target Career Domain</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'0.75rem' }}>
                {(Object.entries(CAREER_PATHS) as [CareerPathType, { label:string; description:string }][]).map(([key, info]) => {
                  const active = goal === key;
                  const col    = CAREER_COLORS[key];
                  return (
                    <button key={key} type="button" onClick={() => setGoal(key)}
                      style={{
                        display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.5rem',
                        padding:'1rem', borderRadius:16, textAlign:'left',
                        background: active ? `rgba(${hexToRgb(col)},0.12)` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${active ? col : 'rgba(255,255,255,0.07)'}`,
                        transition:'all 0.25s', cursor:'pointer',
                        boxShadow: active ? `0 0 20px ${col}30` : 'none'
                      }}
                    >
                      <div style={{ color: active ? col : 'var(--text-muted)', transition:'color 0.2s' }}>{ICONS[key]}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.875rem', color: active ? col : 'var(--text-primary)' }}>{info.label}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', lineHeight:1.4 }}>{info.description}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {formError && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>{formError}</p>}

            <motion.button variants={fadeUp}
              disabled={processing}
              className="btn btn-primary"
              style={{ 
                width:'100%', padding:'1.25rem', fontSize:'1.1rem', marginTop:'1rem',
                boxShadow: (processing) ? 'none' : '0 10px 40px rgba(56,189,248,0.3)',
                background: (processing) ? 'rgba(255,255,255,0.1)' : 'var(--btn-primary-bg)',
                opacity: processing ? 0.7 : 1
              }}
              onClick={async () => {
                if (!name || !edu || !bio || !goal) {
                  setFormError('Please fill in all required fields (Name, Education, Bio, and Domain).');
                  return;
                }
                setFormError('');
                setProcessing(true);
                try {
                  await onDone(name, edu, goal, { bio, skills, role: role, onboardedAt: new Date().toISOString() });
                } catch (err) {
                  setFormError('Connection issue. Please try again.');
                } finally {
                  setProcessing(false);
                }
              }}
            >
              {processing ? 'Synchronizing Profile...' : 'Complete Setup & Enter Dashboard'} <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ASSESSMENT
// ═══════════════════════════════════════════════════════════════
function AssessmentScreen({ user, qIdx, onAnswer }: { user:UserProfile; qIdx:number; onAnswer:(i:number)=>void }) {
  const qs  = QUESTIONS_BY_PATH[user.goal];
  const q   = qs[qIdx];
  const pct = ((qIdx + 1) / qs.length) * 100;

  return (
    <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
      style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', position:'relative', zIndex:1 }}
    >
      <div style={{ width:'100%', maxWidth:620 }}>
        <div className="glass" style={{ padding:'2.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
            <span className="badge badge-blue"><Zap size={11} /> Assessment</span>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600 }}>
              {qIdx+1} / {qs.length}
            </span>
          </div>

          {/* Progress */}
          <div className="progress-track" style={{ marginBottom:'2.5rem', height:4 }}>
            <div className="progress-fill" style={{ width:`${pct}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.35 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, marginBottom:'2rem', lineHeight:1.3 }}>{q.question}</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {q.options.map((opt, i) => (
                  <button key={i} type="button" onClick={() => onAnswer(i)}
                    style={{
                      display:'flex', alignItems:'center', gap:'1rem',
                      padding:'1rem 1.25rem', borderRadius:14, textAlign:'left',
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                      color:'var(--text-primary)', fontWeight:500, fontSize:'0.95rem',
                      transition:'all 0.25s', cursor:'pointer', fontFamily:'var(--font-body)'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(56,189,248,0.08)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(56,189,248,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'; }}
                  >
                    <span style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                      {String.fromCharCode(65+i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <p style={{ marginTop:'2rem', textAlign:'center', fontSize:'0.8rem', color:'var(--text-hint)', fontWeight:600 }}>SKILL: {q.skillMapped}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════
function DashboardTab({ user, score, setActiveTab }: { user:UserProfile; score:number; setActiveTab:(t:string)=>void }) {
  const radarData = Object.entries(user.skills).map(([skill, value]) => ({ skill, value, fullMark:100 }));
  const readinessScore = Math.round((score / 3) * 100);
  const circumference  = 2 * Math.PI * 56;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      {/* Hero row */}
      <motion.div variants={fadeUp} style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontWeight:600, fontSize:'0.875rem', marginBottom:'0.35rem' }}>Welcome back,</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>
              {user.name}'s <span style={{ background:'linear-gradient(135deg,#38bdf8,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{CAREER_PATHS[user.goal].label}</span> Journey
            </h2>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <div className="badge badge-blue"><Zap size={11} /> AI Optimized</div>
            <div className="badge badge-live"><span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} /> Live Data</div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem' }}>
        {[
          { label:'Readiness Score', value:`${readinessScore}%`, icon:<Award size={20}/>, color:'#38bdf8' },
          { label:'Skills Assessed', value:'5',     icon:<BarChart3 size={20}/>, color:'#a78bfa' },
          { label:'Gaps Identified', value:'3',     icon:<AlertCircle size={20}/>, color:'#f59e0b' },
          { label:'Career Match',    value:'94%',   icon:<Target size={20}/>, color:'#10b981' },
        ].map((s, i) => (
          <div key={i} className="card-premium" style={{ padding:'1.5rem' }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, marginBottom:'1rem' }}>{s.icon}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.04em', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, marginTop:'0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Radar + Readiness */}
      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="card-premium" style={{ padding:'1.75rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>Skill Architecture</h3>
            <span className="badge badge-purple">Radar View</span>
          </div>
          <div style={{ height:300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill:'var(--text-muted)', fontSize:12, fontWeight:600 }} />
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12, color:'var(--text-primary)' }} />
                <Radar name="You" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} dot={{ fill:'#38bdf8', r:4 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium" style={{ padding:'1.75rem', display:'flex', flexDirection:'column' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>Readiness Score</h3>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
            <div style={{ position:'relative', width:160, height:160 }}>
              <svg width="160" height="160" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle cx="80" cy="80" r="56" fill="none" stroke="url(#grad)" strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * readinessScore) / 100}
                  strokeLinecap="round" style={{ transition:'stroke-dashoffset 1.5s ease' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', fontWeight:900, letterSpacing:'-0.04em', background:'linear-gradient(135deg,#38bdf8,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{readinessScore}%</span>
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, marginTop:2 }}>READY</span>
              </div>
            </div>
            <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-muted)', lineHeight:1.6 }}>
              Strong foundation in <strong style={{ color:'var(--text-primary)' }}>{user.goal.split('-')[0]}</strong> fundamentals. Bridge gap in <strong style={{ color:'var(--accent-1)' }}>Advanced Concepts</strong>.
            </p>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => setActiveTab('path')}>View Roadmap <ChevronRight size={16}/></button>
          </div>
        </div>
      </motion.div>

      {/* Market demand trend */}
      <motion.div variants={fadeUp} className="card-premium" style={{ padding:'1.75rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>Market Demand Trend</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:2 }}>Hiring demand for {CAREER_PATHS[user.goal].label} roles (2024)</p>
          </div>
          <span className="badge badge-live"><span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} /> Live</span>
        </div>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SAMPLE_GROWTH}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12 }} />
              <Area type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2.5} fill="url(#areaGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Industry trends + Skill gap */}
      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="card-premium" style={{ padding:'1.75rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.25rem' }}>Industry Intelligence</h3>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INDUSTRY_TRENDS} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12 }} />
                <Bar dataKey="demand" fill="#7c3aed" radius={[0, 4, 4, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium" style={{ padding:'1.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f59e0b' }}><AlertCircle size={22}/></div>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1rem' }}>Skill Gap Analysis</h3>
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>3 gaps to bridge</p>
            </div>
          </div>
          {[
            { skill:'System Design', gap:68, color:'#ef4444' },
            { skill:'Cloud Native',  gap:52, color:'#f59e0b' },
            { skill:'Advanced DS',   gap:38, color:'#a78bfa' },
          ].map(g => (
            <div key={g.skill} style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'0.4rem' }}>
                <span style={{ fontWeight:600, color:'var(--text-secondary)' }}>{g.skill}</span>
                <span style={{ color:g.color, fontWeight:700 }}>{g.gap}% gap</span>
              </div>
              <div className="progress-track">
                <div style={{ height:'100%', width:`${100-g.gap}%`, background:g.color, borderRadius:999, transition:'width 1.2s ease' }} />
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ width:'100%', marginTop:'0.75rem', fontSize:'0.85rem' }} onClick={() => setActiveTab('recommendations')}>
            Fix Gaps <ChevronRight size={14}/>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROADMAP TAB
// ═══════════════════════════════════════════════════════════════
function RoadmapTab({ user }: { user:UserProfile }) {
  const roadmap = ROADMAPS[user.goal];
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:'3rem' }}>
        <span className="badge badge-blue" style={{ marginBottom:'0.75rem' }}>Sequential Growth</span>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>
          Your {CAREER_PATHS[user.goal].label} Roadmap
        </h2>
        <p style={{ color:'var(--text-muted)', marginTop:'0.5rem' }}>Personalized for <strong style={{ color:'var(--text-primary)' }}>{user.name}</strong> · {user.education}</p>
      </motion.div>

      <div style={{ position:'relative', maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
        <div style={{ position:'absolute', left:'2.4rem', top:'5rem', bottom:'2rem', width:2, background:'linear-gradient(to bottom, #38bdf8, rgba(56,189,248,0))' }} />
        {roadmap.map((step, i) => (
          <motion.div key={i} variants={fadeUp} style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>
            <div className={`roadmap-dot ${step.status}`} style={{ marginTop:'0.25rem' }}>
              {step.status === 'completed' ? <CheckCircle2 size={28}/> : step.status === 'current' ? <Zap size={28} className="animate-float"/> : <Lock size={22}/>}
            </div>
            <div className={`card-premium flex-1 ${step.status === 'current' ? 'animate-glowPulse' : ''}`} style={{ padding:'1.5rem', opacity: step.status === 'locked' ? 0.6 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                <h4 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>{step.title}</h4>
                <span className={`badge ${step.status==='completed'?'badge-green':step.status==='current'?'badge-blue':'badge-purple'}`}>
                  {step.status}
                </span>
              </div>
              <p style={{ color:'var(--text-muted)', marginBottom:'1rem', fontSize:'0.9rem' }}>{step.description}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {step.technologies.map(t => (
                  <span key={t} style={{ padding:'0.3rem 0.7rem', background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)', borderRadius:6, fontSize:'0.72rem', fontWeight:700, color:'var(--accent-1)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESOURCES TAB
// ═══════════════════════════════════════════════════════════════
function ResourcesTab({ user }: { user:UserProfile }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      <motion.div variants={fadeUp} style={{ padding:'2.5rem', borderRadius:'var(--radius-xl)', background:'linear-gradient(135deg,rgba(56,189,248,0.12),rgba(124,58,237,0.12))', border:'1px solid rgba(56,189,248,0.2)' }}>
        <div className="badge badge-blue" style={{ marginBottom:'1rem' }}>AI Curated</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:900, marginBottom:'0.5rem' }}>Curated Skill Bridge</h2>
        <p style={{ color:'var(--text-muted)' }}>Resources to close your {CAREER_PATHS[user.goal].label} skill gaps and accelerate hiring readiness.</p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {[
          { icon:<BookOpen size={22}/>, title:'Advanced System Design', sub:'8-week intensive course · Industry experts', color:'var(--accent-1)', badge:'badge-blue', badgeTxt:'Top Pick' },
          { icon:<Rocket size={22}/>, title:'Portfolio Project Challenge', sub:'Build & deploy a full-scale platform', color:'#10b981', badge:'badge-green', badgeTxt:'PRO' },
          { icon:<Star size={22}/>, title:'Mock Interview Simulator', sub:'50+ domain-specific interview questions', color:'#a78bfa', badge:'badge-purple', badgeTxt:'New' },
          { icon:<Globe size={22}/>, title:'Open Source Contribution', sub:'Top repositories matching your skill level', color:'#f59e0b', badge:'badge-amber', badgeTxt:'Bonus' },
        ].map((r, i) => (
          <div key={i} className="card-premium" style={{ padding:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${r.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:r.color }}>{r.icon}</div>
              <span className={`badge ${r.badge}`}>{r.badgeTxt}</span>
            </div>
            <h4 style={{ fontFamily:'var(--font-display)', fontWeight:800, marginBottom:'0.4rem' }}>{r.title}</h4>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'1.25rem' }}>{r.sub}</p>
            <button className="btn btn-ghost" style={{ width:'100%', fontSize:'0.85rem' }}>Start Now <ChevronRight size={14}/></button>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="card-premium" style={{ padding:'2rem', borderLeft:'4px solid var(--accent-1)', display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>
        <div style={{ width:52, height:52, borderRadius:16, background:'rgba(56,189,248,0.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-1)', flexShrink:0 }}><BrainCircuit size={28}/></div>
        <div>
          <h4 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', marginBottom:'0.5rem' }}>AI Reasoner Insight</h4>
          <p style={{ color:'var(--text-muted)', lineHeight:1.8, fontSize:'0.9rem' }}>
            Based on your <strong style={{ color:'var(--text-primary)' }}>{user.education}</strong> background, we recommend focusing on <strong style={{ color:'var(--accent-1)' }}>Practical Infrastructure</strong>. 
            85% of Tier-1 interviews in {CAREER_PATHS[user.goal].label} now prioritize architecture over syntax mastery.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}



// ═══════════════════════════════════════════════════════════════
// MENTORS TAB
// ═══════════════════════════════════════════════════════════════
function MentorsTab({ user, onNotify }: { user:UserProfile, onNotify: (mentorName: string) => void }) {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), where('role', '==', 'mentor'));
        const querySnapshot = await getDocs(q);
        const mentorList = querySnapshot.docs.map(doc => {
          const m = doc.data();
          return {
            id: doc.id,
            name: m.name || 'Professional Mentor',
            role: m.education || 'Expert Advisor',
            rating: m.rating || (4.7 + Math.random() * 0.3),
            sessions: m.sessions || Math.floor(Math.random() * 40) + 5,
            tags: Array.isArray(m.skills) ? m.skills : ['Expertise'],
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
          };
        });
        setMentors(mentorList);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleRequestMentorship = async (mentor: any) => {
    if (!auth.currentUser) {
      alert("Please login to request mentorship.");
      return;
    }
    
    try {
      const requestId = `${auth.currentUser.uid}_${mentor.id}`;
      await setDoc(doc(db, 'mentorshipRequests', requestId), {
        learnerId: auth.currentUser.uid,
        learnerName: user.name,
        learnerEmail: auth.currentUser.email || '',
        mentorId: mentor.id,
        mentorName: mentor.name,
        status: 'pending',
        timestamp: new Date().toISOString()
      }, { merge: true });
      onNotify(mentor.name);
    } catch (err) {
      console.error("Error sending request:", err);
      // Fallback for UI if error occurs
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      <motion.div variants={fadeUp} style={{ textAlign:'center' }}>
        <span className="badge badge-purple" style={{ marginBottom:'0.75rem' }}>Expert Network</span>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>
          Connect with Industry Leaders
        </h2>
        <p style={{ color:'var(--text-muted)', marginTop:'0.5rem' }}>Matched for <strong style={{ color:'var(--text-primary)' }}>{user.name}</strong> based on your {CAREER_PATHS[user.goal].label} goals</p>
      </motion.div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--accent-1)" />
        </div>
      ) : mentors.length > 0 ? (
        <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem' }}>
          {mentors.map((m, i) => (
            <motion.div key={i} variants={scaleIn} className="card-premium" style={{ padding:'1.75rem', textAlign:'center' }}>
              <div style={{ position:'relative', width:72, height:72, margin:'0 auto 1.25rem' }}>
                <div className="avatar-ring" style={{ background:`linear-gradient(135deg,${m.color},${m.color}88)` }}>
                  {m.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div style={{ position:'absolute', bottom:-4, right:-4, width:20, height:20, borderRadius:'50%', background:'#10b981', border:'2px solid var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
                </div>
              </div>
              <h4 style={{ fontFamily:'var(--font-display)', fontWeight:800, marginBottom:'0.25rem' }}>{m.name}</h4>
              <p style={{ fontSize:'0.8rem', color:m.color, fontWeight:700, marginBottom:'0.5rem' }}>{m.role}</p>
              <div style={{ display:'flex', justifyContent:'center', gap:'1.25rem', marginBottom:'1rem' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>⭐ {m.rating.toFixed(1)}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>{m.sessions} sessions</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0.4rem', marginBottom:'1.25rem' }}>
                {(Array.isArray(m.tags) ? m.tags : ['Expertise']).slice(0, 3).map((t: string) => <span key={t} style={{ padding:'0.25rem 0.6rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, fontSize:'0.7rem', fontWeight:600, color:'var(--text-muted)' }}>{t}</span>)}
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ width:'100%', fontSize:'0.85rem' }}
                onClick={() => handleRequestMentorship(m)}
              >
                Request Mentorship
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="glass" style={{ padding:'4rem 2rem', textAlign:'center', borderRadius:24 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(56,189,248,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', color:'var(--accent-1)' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:800, marginBottom:'0.5rem' }}>No Active Mentors Yet</h3>
          <p style={{ color:'var(--text-muted)', maxWidth:400, margin:'0 auto' }}>We're currently onboarding mentors in the {CAREER_PATHS[user.goal].label} domain. Check back soon!</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// (Consolidated)

// ═══════════════════════════════════════════════════════════════
// MENTOR DASHBOARD
// ═══════════════════════════════════════════════════════════════
function MentorDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'user'));
        const snapshot = await getDocs(q);
        setUserCount(snapshot.size);
      } catch (err) {
        console.error("Stats fetch failed:", err);
      }
    };
    
    const fetchRequests = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'mentorshipRequests'), 
          where('mentorId', '==', auth.currentUser.uid),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchStats();
    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId: string, learnerId: string, action: 'accepted' | 'rejected') => {
    try {
      if (!auth.currentUser) return;
      
      const updateObj: any = { 
        status: action,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'mentorshipRequests', requestId), updateObj);

      if (action === 'accepted') {
        // Update Mentor document with Mentees
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          mentees: arrayUnion(learnerId)
        });
        
        // Update Learner document with Mentor
        await updateDoc(doc(db, 'users', learnerId), {
          mentors: arrayUnion(auth.currentUser.uid)
        });

        // Initialize a shared chat session
        const chatRoomId = [auth.currentUser.uid, learnerId].sort().join('_');
        await setDoc(doc(db, 'chats', chatRoomId), {
          participants: [auth.currentUser.uid, learnerId],
          lastMessage: 'Mentorship started!',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        alert("Mentorship established! You can now chat and share resources.");
      }
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Failed to update request.");
    }
  };

  const stats = [
    { label: 'Total Learners', value: userCount.toLocaleString() || '0', trend: '+12%', icon: <Users size={20} />, color: '#38bdf8' },
    { label: 'Active Progress', value: Math.floor(userCount * 0.6).toString(), trend: '+5%', icon: <Zap size={20} />, color: '#f59e0b' },
    { label: 'Skill Gaps Bridged', value: (userCount * 3).toString(), trend: '+28%', icon: <Target size={20} />, color: '#10b981' },
    { label: 'Avg. Readiness', value: '76%', trend: '+3%', icon: <TrendingUp size={20} />, color: '#a78bfa' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {stats.map((s, i) => (
          <motion.div key={i} variants={scaleIn} className="card-premium" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</h3>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{s.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
        <div className="card-premium" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Briefcase size={20} color="var(--accent-1)" />
            Mentorship Requests
            {requests.length > 0 && <span className="badge badge-purple">{requests.length} New</span>}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', maxHeight: 500, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {requests.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>All caught up! No pending requests.</p>
              </div>
            ) : (
              requests.map((req) => (
                <motion.div 
                  key={req.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, 
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{req.learnerName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.learnerEmail}</p>
                    </div>
                    <div className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Pending</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                      onClick={() => handleRequestAction(req.id, req.learnerId, 'accepted')}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      onClick={() => handleRequestAction(req.id, req.learnerId, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        <div className="card-premium" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Readiness Distribution</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { range: '0-20%', count: 120 },
                { range: '21-40%', count: 340 },
                { range: '41-60%', count: 480 },
                { range: '61-80%', count: 290 },
                { range: '81-100%', count: 54 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12 }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Critical Learning Gaps</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'System Design', value: 72, color: '#ef4444' },
                { label: 'Cloud Architecture', value: 58, color: '#f59e0b' },
              ].map((gap, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{gap.label}</span>
                    <span style={{ color: gap.color, fontWeight: 700 }}>{gap.value}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${gap.value}%`, background: gap.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Data Structures', value: 45, color: '#38bdf8' },
                { label: 'DevOps CI/CD', value: 39, color: '#10b981' },
              ].map((gap, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{gap.label}</span>
                    <span style={{ color: gap.color, fontWeight: 700 }}>{gap.value}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${gap.value}%`, background: gap.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>Send Learning Blast</button>
        </div>
      </div>
    </motion.div>
  );
}
function ProfileTab({ user, setUser }: { user: UserProfile; setUser: React.Dispatch<React.SetStateAction<UserProfile>> }) {
  const [name, setName] = useState(user.name);
  const [edu, setEdu] = useState(user.education);
  const [bio, setBio] = useState(user.bio || '');
  const [skills, setSkills] = useState(Object.keys(user.skills || {}));
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(i => i !== s));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        // Convert skills back to SkillSet map (preserving values if they exist)
        const skillMap: any = {};
        skills.forEach(s => skillMap[s] = user.skills?.[s] || 25);
        
        const updatedData = {
          name,
          education: edu,
          bio,
          skills: skillMap,
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedData, { merge: true });
        
        setUser(prev => ({ 
          ...prev, 
          name, 
          education: edu, 
          bio, 
          skills: skillMap 
        }));
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <motion.div variants={fadeUp} className="card-premium" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Profile Settings</h2>
            <p style={{ color: 'var(--text-muted)' }}>Manage your cloud-synced professional identity.</p>
          </div>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,#38bdf8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 900 }}>
            {name[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="input-wrap">
            <label className="input-label">Full Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-wrap">
            <label className="input-label">Education / Expertise</label>
            <input className="input-field" value={edu} onChange={e => setEdu(e.target.value)} />
          </div>
        </div>

        <div className="input-wrap" style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Professional Bio / Career Interest</label>
          <textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} />
        </div>

        <div className="input-wrap" style={{ marginBottom: '2rem' }}>
          <label className="input-label">Core Skills</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input className="input-field" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === 'Enter' && handleAddSkill()} />
            <button className="btn btn-ghost" onClick={handleAddSkill} style={{ height: 'auto' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {skills.map(s => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontSize: '0.85rem', color: 'var(--accent-1)' }}>
                {s} <X size={14} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => removeSkill(s)} />
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            disabled={isSaving}
            onClick={handleSave} 
            style={{ 
              padding: '1rem 3rem', 
              fontSize: '1rem',
              background: saved ? '#10b981' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
              transition: 'all 0.3s'
            }}
          >
            {isSaving ? 'Syncing...' : (saved ? <>Saved <CheckCircle2 size={18} style={{ marginLeft: 8 }} /></> : 'Update Cloud Profile')}
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="card-premium" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
        <ShieldCheck size={20} />
        <p style={{ fontSize: '0.85rem' }}>Your data is securely stored in Firebase Cloud with real-time syncing enabled across all sessions.</p>
      </motion.div>
    </motion.div>
  );
}


function MentorUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth.currentUser) return;
      try {
        setLoading(true);
        const mentorDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const mentees = mentorDoc.data()?.mentees || [];
        
        if (mentees.length === 0) {
          setUsers([]);
          return;
        }

        const q = query(collection(db, 'users'), where('__name__', 'in', mentees));
        const querySnapshot = await getDocs(q);
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching mentees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDisconnect = async (learnerId: string) => {
    if (!auth.currentUser || !window.confirm("Are you sure you want to remove this learner? This will terminate your mentorship connection.")) return;
    try {
      // Remove learner from mentor
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        mentees: arrayRemove(learnerId)
      });
      // Remove mentor from learner
      await updateDoc(doc(db, 'users', learnerId), {
        mentors: arrayRemove(auth.currentUser.uid)
      });
      
      setUsers(prev => prev.filter(u => u.id !== learnerId));
      if (selectedUser?.id === learnerId) setSelectedUser(null);
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>Learner Performance Tracking</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyze and guide active learners on the SkillBridge platform.</p>
      </div>

      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Learner</th>
              <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Path</th>
              <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Readiness</th>
              <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}><RefreshCw className="animate-spin" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No accepted learners found. Accepted requests will appear here.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.3s' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#38bdf8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.email.split('@')[0]}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span className="badge badge-blue">Generalist</span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: 6, width: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: '45%', background: '#10b981', borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>45%</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
                    <button onClick={() => setSelectedUser(u)} className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>Review Details</button>
                    <button onClick={() => handleDisconnect(u.id)} className="btn btn-ghost" style={{ padding:8, color:'#ef4444' }} title="Terminate Mentorship">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card-premium" style={{ marginTop:'2rem', padding:'2.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'var(--accent-1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:900 }}>{selectedUser.name?.[0] || selectedUser.email?.[0]}</div>
              <div>
                <h3 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:'0.25rem' }}>{selectedUser.name || 'Anonymous User'}</h3>
                <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Target: {selectedUser.goal ? CAREER_PATHS[selectedUser.goal as CareerPathType].label : 'General Development'}</p>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelectedUser(null)}>Close Overview</button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'2rem' }}>
            <div>
              <h4 style={{ fontWeight:800, marginBottom:'1.5rem', fontSize:'1.1rem' }}>Skill Proficiency</h4>
              <div style={{ height:300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={Object.entries(selectedUser.skills || {}).map(([name, value]) => ({ name, value }))}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Radar dataKey="value" stroke="var(--accent-1)" fill="var(--accent-1)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight:800, marginBottom:'1.5rem', fontSize:'1.1rem' }}>Development Bio</h4>
              <div style={{ background:'rgba(255,255,255,0.03)', padding:'1.5rem', borderRadius:16, border:'1px solid var(--border-subtle)', marginBottom:'1.5rem' }}>
                <p style={{ fontSize:'0.9rem', lineHeight:1.6, color:'var(--text-muted)' }}>{selectedUser.bio || "This learner hasn't provided a bio yet, but is actively making progress on their designated roadmap."}</p>
              </div>
              <div className="card-premium" style={{ padding:'1.5rem', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.1)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', color:'#10b981', fontWeight:800, fontSize:'0.9rem', marginBottom:'0.5rem' }}>
                  <TrendingUp size={18}/> Performance Insight
                </div>
                <p style={{ fontSize:'0.85rem' }}>Learner shows strong aptitude in {Object.entries(selectedUser.skills || { 'Fundamentals': 10 }).sort((a:any, b:any) => b[1]-a[1])[0]?.[0]}. Recommend focusing on practical projects.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHAT & MESSAGING
// ═══════════════════════════════════════════════════════════════
function ChatTab({ user, role }: { user: UserProfile, role: 'user' | 'mentor' }) {
  const [peers, setPeers] = useState<any[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch connected peers
  useEffect(() => {
    const fetchPeers = async () => {
      if (!auth.currentUser) return;
      try {
        const peerIds = role === 'mentor' ? (user.mentees || []) : (user.mentors || []);
        if (peerIds.length === 0) {
          setLoading(false);
          return;
        }
        
        const q = query(collection(db, 'users'), where('__name__', 'in', peerIds));
        const snapshot = await getDocs(q);
        setPeers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching chat peers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeers();
  }, [user, role]);

  // Real-time message listener
  useEffect(() => {
    if (!selectedPeer || !auth.currentUser) return;
    const roomId = [auth.currentUser.uid, selectedPeer.id].sort().join('_');
    const q = query(collection(db, `chats/${roomId}/messages`), where('timestamp', '!=', null));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setMessages(msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    });
    return () => unsubscribe();
  }, [selectedPeer]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedPeer || !auth.currentUser) return;
    const roomId = [auth.currentUser.uid, selectedPeer.id].sort().join('_');
    try {
      const msgData = {
        senderId: auth.currentUser.uid,
        text: input,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, `chats/${roomId}/messages`), msgData);
      await updateDoc(doc(db, 'chats', roomId), {
        lastMessage: input,
        updatedAt: new Date().toISOString()
      });
      setInput('');
    } catch (err) {
      console.error("Chat send error:", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedPeer || !auth.currentUser) return;
    setLoading(true);
    const roomId = [auth.currentUser.uid, selectedPeer.id].sort().join('_');
    try {
      const storageRef = ref(storage, `chats/${roomId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const msgData = {
        senderId: auth.currentUser.uid,
        text: `Shared a file: ${file.name}`,
        fileUrl: url,
        fileName: file.name,
        timestamp: new Date().toISOString()
      };
      
      await addDoc(collection(db, `chats/${roomId}/messages`), msgData);
      await updateDoc(doc(db, 'chats', roomId), {
        lastMessage: `📎 ${file.name}`,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Chat file upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><RefreshCw className="animate-spin" size={32} color="var(--accent-1)" /></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
      {/* Sidebar */}
      <div className="card-premium" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight:800, fontSize:'1.1rem' }}>Messages</h3>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {peers.length === 0 ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.85rem' }}>No connections yet. Establish mentorship to start chatting.</div>
          ) : peers.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPeer(p)}
              style={{ 
                padding:'1rem 1.5rem', cursor:'pointer', 
                background: selectedPeer?.id === p.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                borderLeft: selectedPeer?.id === p.id ? '4px solid var(--accent-1)' : '4px solid transparent',
                transition:'0.2s'
              }}
            >
              <div style={{ fontWeight:700 }}>{p.name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.education || 'Expert'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="card-premium" style={{ padding:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {selectedPeer ? (
          <>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>{selectedPeer.name[0]}</div>
                <span style={{ fontWeight:800 }}>{selectedPeer.name}</span>
              </div>
              <span className="badge badge-green" style={{ fontSize:'0.65rem' }}>Active Session</span>
            </div>
            <div style={{ flex:1, padding:'1.5rem', overflowY:'auto', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {messages.map(m => (
                <div key={m.id} style={{ 
                  alignSelf: m.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
                  maxWidth:'75%', padding:'0.75rem 1rem', borderRadius:16,
                  background: m.senderId === auth.currentUser?.uid ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                  color: m.senderId === auth.currentUser?.uid ? '#fff' : 'inherit',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  {m.fileUrl ? (
                    <div style={{ padding:'0.5rem', background:'rgba(255,255,255,0.1)', borderRadius:12, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <FileUp size={18} />
                      </div>
                      <div style={{ flex:1, overflow:'hidden' }}>
                        <div style={{ fontWeight:700, fontSize:'0.8rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.fileName}</div>
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.7rem', color: m.senderId === auth.currentUser?.uid ? '#fff' : 'var(--accent-1)', fontWeight:800 }}>Download Resource</a>
                      </div>
                    </div>
                  ) : null}
                  <div style={{ fontSize:'0.9rem' }}>{m.text}</div>
                  <div style={{ fontSize:'0.6rem', opacity:0.6, marginTop:'0.25rem', textAlign:'right' }}>{new Date(m.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                </div>
              ))}
              {messages.length === 0 && <div style={{ textAlign:'center', margin:'auto', color:'var(--text-muted)' }}>Send a message to start the conversation!</div>}
            </div>
            <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <label style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.03)', borderRadius:12, cursor:'pointer', border:'1px solid var(--border-subtle)' }} title="Attach File">
                <input type="file" style={{ display:'none' }} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }} />
                <Paperclip size={18} color="var(--text-muted)" />
              </label>
              <input 
                className="input-field" 
                placeholder="Type a message..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage} style={{ borderRadius:12, height:42, padding:'0 1.5rem' }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ margin:'auto', textAlign:'center', padding:'4rem' }}>
            <Briefcase size={48} style={{ opacity:0.1, marginBottom:'1.5rem' }} />
            <h3 style={{ fontWeight:800 }}>Select a Conversation</h3>
            <p style={{ color:'var(--text-muted)', maxWidth:300 }}>Connect with your professional network to start real-time mentorship guidance.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESOURCES HUB
// ═══════════════════════════════════════════════════════════════
function ResourcesHub({ user, role }: { user: UserProfile, role: 'user' | 'mentor' }) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', url: '', type: 'link' as any, description: '' });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const q = role === 'mentor' 
          ? query(collection(db, 'resources'), where('addedBy', '==', auth.currentUser?.uid))
          : query(collection(db, 'resources'), where('category', '==', user.goal));
        const snapshot = await getDocs(q);
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Resource fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [user.goal, role]);

  const handleAdd = async () => {
    if (!newRes.title || !newRes.url) return;
    try {
      const data = {
        ...newRes,
        addedBy: auth.currentUser?.uid,
        category: user.goal,
        timestamp: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'resources'), data);
      setResources([{ id: docRef.id, ...data }, ...resources]);
      setShowAdd(false);
      setNewRes({ title: '', url: '', type: 'link', description: '' });
    } catch (err) {
      console.error("Error adding resource:", err);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:900 }}>Resource Library</h2>
          <p style={{ color:'var(--text-muted)' }}>{role === 'mentor' ? 'Curate and distribute learning materials to your cohort.' : 'Explore expert-curated materials tailored to your path.'}</p>
        </div>
        {role === 'mentor' && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Material</button>
        )}
      </div>

      {showAdd && (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="card-premium" style={{ padding:'2rem', border:'1px solid var(--accent-1)' }}>
          <h3 style={{ fontWeight:800, marginBottom:'1.5rem' }}>Upload New Material</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
            <div className="input-wrap">
              <label className="input-label">Title</label>
              <input className="input-field" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} placeholder="e.g. Advanced System Design PDF" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Resource URL / Link</label>
              <input className="input-field" value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem' }}>
            {(['link', 'video', 'pdf', 'note'] as const).map(t => (
              <button key={t} onClick={() => setNewRes({...newRes, type: t})} className={`tab-btn ${newRes.type === t ? 'active' : ''}`} style={{ textTransform:'capitalize', padding:'0.5rem 1.5rem' }}>{t}</button>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}>Publish to Cohort</button>
          </div>
        </motion.div>
      )}

      {loading ? <div style={{ textAlign:'center', padding:'4rem' }}><RefreshCw className="animate-spin" size={32} /></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'1.5rem' }}>
          {resources.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} className="card-premium" style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-1)' }}>
                  {r.type === 'video' ? <Zap size={20}/> : r.type === 'pdf' ? <Award size={20}/> : <Globe size={20}/>}
                </div>
                <span className="badge badge-purple" style={{ textTransform:'uppercase', fontSize:'0.65rem' }}>{r.type}</span>
              </div>
              <h4 style={{ fontWeight:800, marginBottom:'0.5rem' }}>{r.title}</h4>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'1.5rem', minHeight:'3rem' }}>{r.description || 'Professional-grade material curated for industry readiness.'}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ width:'100%', fontSize:'0.85rem' }}>Access Resource <ChevronRight size={14}/></a>
            </motion.div>
          ))}
          {resources.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'4rem', opacity:0.3 }}>No resources found in this category.</div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMMUNITIES & GROUPS
// ═══════════════════════════════════════════════════════════════
function CommunitiesTab({ user, role, onNotify }: { user: UserProfile, role: 'user' | 'mentor', onNotify?: (msg: string) => void }) {
  const [cmTab, setCmTab] = useState<'feed' | 'groups' | 'chat'>('feed');
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [globalMsgs, setGlobalMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreate, setShowCreate] = useState(false);
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');

  const [postInput, setPostInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // 1. Fetch Groups
    const unsubGroups = onSnapshot(collection(db, 'groups'), (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Fetch Posts
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Fetch Global Chat
    const chatQuery = query(collection(db, 'globalChat'), orderBy('timestamp', 'asc'), limit(100));
    const unsubChat = onSnapshot(chatQuery, (snap) => {
      setGlobalMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => { unsubGroups(); unsubPosts(); unsubChat(); };
  }, []);

  const handleCreatePost = async (fileUrl?: string, fileName?: string) => {
    if (!postInput.trim() && !fileUrl) return;
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser?.uid,
        authorName: user.name || auth.currentUser?.email?.split('@')[0],
        text: postInput,
        timestamp: new Date().toISOString(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        likes: [],
        comments: []
      });
      setPostInput('');
    } catch (err) { console.error("Post failed:", err); }
  };

  const handleSendGlobal = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, 'globalChat'), {
        senderId: auth.currentUser?.uid,
        senderName: user.name || auth.currentUser?.email?.split('@')[0],
        text: chatInput,
        timestamp: new Date().toISOString()
      });
      setChatInput('');
    } catch (err) { console.error("Chat send failed:", err); }
  };

  const handleCreateGroup = async () => {
    if (!gName || !gDesc) return;
    try {
      const data = {
        name: gName,
        description: gDesc,
        mentorId: auth.currentUser?.uid,
        mentorName: user.name,
        members: [auth.currentUser?.uid],
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'groups'), data);
      setGroups([{ id: docRef.id, ...data }, ...groups]);
      setShowCreate(false);
      setGName(''); setGDesc('');
    } catch (err) {
      console.error("Group creation failed:", err);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(auth.currentUser.uid)
      });
      if (onNotify) onNotify("Welcome to the community! Connect with your peers.");
    } catch (err) { console.error("Join failed:", err); }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (cmTab === 'feed') handleCreatePost(url, file.name);
      // Logic for adding to chat could be here too if needed
    } catch (err) { console.error("Upload failed:", err); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderBottom:'1px solid var(--border-subtle)', paddingBottom:'1.25rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:900, marginBottom:'0.25rem' }}>Skill Hub</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Forge connections and share industry insights.</p>
        </div>
        <div style={{ display:'flex', gap:'0.4rem', background:'rgba(255,255,255,0.03)', padding:'0.35rem', borderRadius:14 }}>
          {(['feed', 'groups', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setCmTab(t)} className={`tab-btn ${cmTab === t ? 'active' : ''}`} style={{ textTransform:'capitalize', minWidth:90, fontSize:'0.85rem' }}>{t}</button>
          ))}
        </div>
      </div>

      {cmTab === 'feed' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div className="card-premium" style={{ padding:'1.5rem' }}>
             <div style={{ display:'flex', gap:'1rem' }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'var(--accent-1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800 }}>{user.name?.[0] || 'U'}</div>
                <div style={{ flex:1 }}>
                   <textarea 
                    value={postInput} 
                    onChange={e => setPostInput(e.target.value)} 
                    placeholder="Share an insight or resource..." 
                    style={{ width:'100%', background:'transparent', border:'none', color:'var(--text-primary)', fontSize:'0.95rem', resize:'none', minHeight:60, outline:'none', padding:'0.5rem 0' }}
                   />
                   <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'1rem', borderTop:'1px solid var(--border-subtle)' }}>
                      <div style={{ display:'flex', gap:'1rem' }}>
                        <label style={{ cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', fontWeight:600 }}>
                          <input type="file" style={{ display:'none' }} onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }} />
                          <Paperclip size={16} /> {uploading ? 'Uploading...' : 'Attach Resource'}
                        </label>
                      </div>
                      <button className="btn btn-primary" onClick={() => handleCreatePost()} style={{ padding:'0.5rem 1.5rem', fontSize:'0.85rem' }} disabled={uploading}>Post Insight</button>
                   </div>
                </div>
             </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {posts.length === 0 && !loading && (
              <div style={{ textAlign:'center', padding:'4rem', opacity:0.4 }}>
                <MessageSquare size={48} style={{ margin:'0 auto 1rem' }} />
                <p>No activity yet. Be the first to share something!</p>
              </div>
            )}
            {posts.map(post => (
              <motion.div key={post.id} className="card-premium" style={{ padding:'1.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-1)', fontWeight:800 }}>{post.authorName?.[0]}</div>
                    <div>
                      <h4 style={{ fontWeight:800, fontSize:'0.95rem' }}>{post.authorName}</h4>
                      <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Just now'}</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding:6 }}><MoreVertical size={16}/></button>
                </div>
                <p style={{ fontSize:'0.95rem', lineHeight:1.6, color:'var(--text-primary)', marginBottom: post.fileUrl ? '1.25rem' : '1.25rem', whiteSpace: 'pre-wrap' }}>{post.text}</p>
                {post.fileUrl && (
                  <div style={{ marginBottom:'1.25rem', padding:'1rem', borderRadius:14, background:'rgba(56,189,248,0.04)', border:'1px solid rgba(56,189,248,0.1)', display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:'rgba(56,189,248,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-1)' }}><FileUp size={20}/></div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:'0.85rem', marginBottom:2 }}>{post.fileName || 'Shared Document'}</p>
                      <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent-1)', fontSize:'0.75rem', fontWeight:800 }}>Download Resource</a>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', gap:'1.5rem' }}>
                   <button className="btn btn-ghost" style={{ gap:'0.4rem', fontSize:'0.8rem', padding:'4px 8px' }}><Heart size={16} /> 0</button>
                   <button className="btn btn-ghost" style={{ gap:'0.4rem', fontSize:'0.8rem', padding:'4px 8px' }}><MessageCircle size={16} /> 0</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {cmTab === 'groups' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
           <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontWeight:800, fontSize:'1.1rem' }}>Discover Professional Communities</h3>
            {role === 'mentor' && <button className="btn btn-primary" style={{ padding:'0.5rem 1.25rem', fontSize:'0.85rem' }} onClick={() => setShowCreate(true)}>Create Community</button>}
          </div>

          {showCreate && (
             <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="card-premium" style={{ padding:'1.75rem' }}>
              <h4 style={{ fontWeight:800, marginBottom:'1.25rem' }}>Establish New Cohort</h4>
              <div className="input-wrap" style={{ marginBottom:'1rem' }}>
                <label className="input-label">Community Name</label>
                <input className="input-field" value={gName} onChange={e => setGName(e.target.value)} placeholder="e.g. Advanced AI/ML Ethics" />
              </div>
              <div className="input-wrap" style={{ marginBottom:'1.5rem' }}>
                <label className="input-label">Mission Statement</label>
                <textarea className="input-field" value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="What will this group achieve?" />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateGroup}>Establish</button>
              </div>
            </motion.div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' }}>
            {groups.map(g => (
              <div key={g.id} className="card-premium" style={{ padding:'1.5rem', display:'flex', flexDirection:'column' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', marginBottom:'1.25rem' }}>
                  <Globe size={20} />
                </div>
                <h3 style={{ fontWeight:800, marginBottom:'0.5rem', fontSize:'1.1rem' }}>{g.name}</h3>
                <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:'1.5rem', lineHeight:1.5, flex:1 }}>{g.description}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'var(--text-muted)' }}>
                    <Users size={14} /> <span style={{ fontSize:'0.75rem', fontWeight:600 }}>{g.members?.length || 0}</span>
                  </div>
                  {g.members?.includes(auth.currentUser?.uid) ? (
                    <span className="badge badge-green" style={{ fontSize:'0.7rem' }}>Member</span>
                  ) : (
                    <button className="btn btn-primary" style={{ padding:'0.4rem 1.25rem', fontSize:'0.8rem' }} onClick={() => joinGroup(g.id)}>Join Base</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {cmTab === 'chat' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card-premium" style={{ height:550, display:'flex', flexDirection:'column', overflow:'hidden' }}>
           <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border-subtle)', background:'rgba(255,255,255,0.01)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                 <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 10px #10b981' }} />
                 <h4 style={{ fontWeight:800, fontSize:'0.95rem' }}>Global Mentorship Chat</h4>
              </div>
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>Live Sync Active</span>
           </div>
           
           <div style={{ flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.875rem', background:'rgba(0,0,0,0.1)' }}>
              {globalMsgs.length === 0 && <div style={{ textAlign:'center', paddingTop:'4rem', opacity:0.3, fontSize:'0.85rem' }}>Connected. Start a conversation...</div>}
              {globalMsgs.map((msg) => (
                <div key={msg.id} style={{ alignSelf: msg.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start', maxWidth:'85%' }}>
                   <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:4, fontWeight:700, textAlign: msg.senderId === auth.currentUser?.uid ? 'right' : 'left' }}>{msg.senderName}</div>
                   <div style={{ padding:'0.6rem 1.1rem', borderRadius:14, borderTopRightRadius: msg.senderId === auth.currentUser?.uid ? 0 : 14, borderTopLeftRadius: msg.senderId === auth.currentUser?.uid ? 14 : 0, background: msg.senderId === auth.currentUser?.uid ? 'var(--accent-1)' : 'rgba(255,255,255,0.06)', color: msg.senderId === auth.currentUser?.uid ? '#fff' : 'var(--text-primary)', fontSize:'0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {msg.text}
                   </div>
                </div>
              ))}
           </div>

           <div style={{ padding:'1.25rem', borderTop:'1px solid var(--border-subtle)', background:'var(--bg-card)' }}>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                 <input 
                  className="input-field" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendGlobal()}
                  placeholder="Share a message with everyone..." 
                  style={{ height:46, fontSize:'0.9rem' }}
                 />
                 <button className="btn btn-primary" style={{ width:46, height:46, padding:0, borderRadius:12 }} onClick={handleSendGlobal}><Send size={18}/></button>
              </div>
           </div>
        </motion.div>
      )}
    </div>
  );
}

