import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  BrainCircuit, Target, Map, BookOpen, Users,
  ChevronRight, Zap, CheckCircle2, AlertCircle, TrendingUp,
  Award, Globe, Rocket, ShieldCheck, Cloud, Briefcase,
  GraduationCap, Star, BarChart3, Lock, Menu, X
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import type { CareerPathType, UserProfile } from './types';
import { CAREER_PATHS, QUESTIONS_BY_PATH, ROADMAPS, INDUSTRY_TRENDS } from './data/careerData';
import './index.css';

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
const ICONS: Record<CareerPathType, ReactNode> = {
  'software-dev':   <Rocket size={22} />,
  'data-science':   <Briefcase size={22} />,
  'cybersecurity':  <ShieldCheck size={22} />,
  'ai-ml':          <BrainCircuit size={22} />,
  'cloud-computing':<Cloud size={22} />
};

const CAREER_COLORS: Record<CareerPathType, string> = {
  'software-dev':   '#38bdf8',
  'data-science':   '#a78bfa',
  'cybersecurity':  '#34d399',
  'ai-ml':          '#f472b6',
  'cloud-computing':'#fb923c'
};

const SAMPLE_GROWTH = [
  { month:'Jan', demand:62 }, { month:'Feb', demand:68 }, { month:'Mar', demand:71 },
  { month:'Apr', demand:75 }, { month:'May', demand:82 }, { month:'Jun', demand:89 },
  { month:'Jul', demand:93 },
];

// ─── App Root ────────────────────────────────────────────────
export default function App() {
  const [view, setView]       = useState<'splash'|'login'|'onboarding'|'assessment'|'main'>('splash');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    name: '', education: '', goal: 'software-dev',
    experienceLevel: 'beginner',
    skills: { Fundamentals:0, 'Core Skills':0, 'Advanced Concepts':0, Tools:0, 'Industry Prep':0 }
  });

  const [qIdx,  setQIdx]  = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setView('login'), 3200);
    return () => clearTimeout(t);
  }, []);

  const handleOnboardingDone = (name:string, edu:string, goal:CareerPathType) => {
    setUser(p => ({ ...p, name, education:edu, goal }));
    setQIdx(0); setScore(0);
    setView('assessment');
  };

  const handleAnswer = (opt: number) => {
    const qs = QUESTIONS_BY_PATH[user.goal];
    const ns = score + (opt === qs[qIdx].correctAnswer ? 1 : 0);
    if (qIdx < qs.length - 1) { setScore(ns); setQIdx(p => p+1); }
    else {
      const base = (ns / qs.length) * 80;
      setUser(p => ({
        ...p,
        skills: {
          Fundamentals: Math.min(100, base + 12),
          'Core Skills': Math.min(100, base),
          'Advanced Concepts': Math.max(8, base - 20),
          Tools: 42,
          'Industry Prep': 14
        }
      }));
      setScore(ns);
      setView('main');
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="relative overflow-x-hidden" style={{ minHeight:'100vh' }}>
      {/* Animated background */}
      <div className="bg-canvas" />
      <div className="bg-grid" />

      <AnimatePresence mode="wait">
        {view === 'splash'      && <SplashScreen key="splash" />}
        {view === 'login'       && <LoginScreen key="login" onLogin={() => setView('onboarding')} />}
        {view === 'onboarding'  && <OnboardingScreen key="ob" onDone={handleOnboardingDone} />}
        {view === 'assessment'  && (
          <AssessmentScreen
            key="as"
            user={user}
            qIdx={qIdx}
            onAnswer={handleAnswer}
          />
        )}
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ position:'relative', zIndex:1 }}>
            {/* NAVBAR */}
            <nav className="navbar" style={{ position:'sticky', top:0, zIndex:200 }}>
              <div className="container flex items-center justify-between" style={{ height:'68px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#38bdf8,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <BrainCircuit size={22} color="#fff" />
                  </div>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.15rem', letterSpacing:'-0.03em' }}>
                    Skill<span style={{ color:'var(--accent-1)' }}>Bridge</span> <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.1em' }}>AI</span>
                  </span>
                </div>

                {/* Desktop tabs */}
                <div className="flex gap-2 hide-mobile" style={{ background:'rgba(255,255,255,0.03)', borderRadius:999, padding:'0.35rem', border:'1px solid var(--border-subtle)' }}>
                  {[
                    { id:'dashboard',       icon:<Target size={15}/>,     label:'Dashboard' },
                    { id:'path',            icon:<Map size={15}/>,        label:'Roadmap' },
                    { id:'recommendations', icon:<BookOpen size={15}/>,   label:'Resources' },
                    { id:'mentors',         icon:<Users size={15}/>,      label:'Mentors' },
                  ].map(t => (
                    <button key={t.id} className={`nav-tab ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
                      {t.icon}<span className="nav-labels">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="hide-mobile" style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:'0.875rem' }}>{user.name}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--accent-1)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {CAREER_PATHS[user.goal].label}
                    </div>
                  </div>
                  <div className="animate-glowPulse" style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#38bdf8,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.9rem', color:'#fff' }}>
                    {user.name?user.name[0].toUpperCase():'U'}
                  </div>
                  {/* Mobile hamburger */}
                  <button className="btn-icon" style={{ display:'none' }} onClick={() => setMobileMenu(p=>!p)} aria-label="menu">
                    {mobileMenu ? <X size={20}/> : <Menu size={20}/>}
                  </button>
                </div>
              </div>

              {/* Mobile menu */}
              <AnimatePresence>
                {mobileMenu && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden', borderTop:'1px solid var(--border-subtle)', padding:'0.75rem', background:'rgba(2,8,23,0.95)' }}>
                    {['dashboard','path','recommendations','mentors'].map(t => (
                      <button key={t} onClick={() => { setActiveTab(t); setMobileMenu(false); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'0.75rem 1rem', borderRadius:12, fontWeight:600, color: activeTab===t ? 'var(--accent-1)':'var(--text-muted)', background: activeTab===t ? 'rgba(56,189,248,0.1)':'transparent', marginBottom:4 }}>
                        {t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            {/* MAIN CONTENT */}
            <main className="container" style={{ paddingTop:'2rem', paddingBottom:'4rem', position:'relative', zIndex:1 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <DashboardTab key="db" user={user} score={score} setActiveTab={setActiveTab} />}
                {activeTab === 'path'      && <RoadmapTab  key="rt" user={user} />}
                {activeTab === 'recommendations' && <ResourcesTab key="res" user={user} />}
                {activeTab === 'mentors'   && <MentorsTab  key="mt" user={user} />}
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
      transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
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

        {/* Center Logo with Zoom & Flow */}
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
              filter: [
                'drop-shadow(0 0 30px rgba(56,189,248,0.3))', 
                'drop-shadow(0 0 60px rgba(56,189,248,0.6))', 
                'drop-shadow(0 0 30px rgba(56,189,248,0.3))'
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 6 }}
          >
            <img 
              src="/logo.png.png" 
              alt="SkillBridge Logo" 
              style={{ 
                width: 'clamp(280px, 45vw, 520px)', 
                height: 'auto', 
                display: 'block' 
              }} 
            />
          </motion.div>
          
          {/* Futuristic Light Scanline Wave */}
          <motion.div
            initial={{ top: '-20%', opacity: 0 }}
            animate={{ top: '120%', opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.5, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: '-10%',
              width: '120%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--accent-1), transparent)',
              boxShadow: '0 0 20px var(--accent-1)',
              zIndex: 7,
              pointerEvents: 'none'
            }}
          />
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
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin:()=>void }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [tab,      setTab]      = useState<'signin'|'signup'>('signin');

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.97 }}
      style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', position:'relative', zIndex:1 }}
    >
      {/* Decorative orbs */}
      <div className="orb orb-blue" style={{ width:600, height:600, top:'-25%', right:'-20%', opacity:0.5, position:'fixed' }} />
      <div className="orb orb-purple" style={{ width:500, height:500, bottom:'-20%', left:'-15%', opacity:0.5, position:'fixed' }} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', maxWidth:980, width:'100%', alignItems:'center' }}>
        {/* Left hero */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="hide-mobile">
          <motion.div variants={fadeUp} className="badge badge-blue" style={{ marginBottom:'1.5rem' }}>
            <Zap size={12} /> Powered by AI
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:'1.25rem' }}>
            Bridge the gap between learning &<br />
            <span style={{ background:'linear-gradient(135deg,#38bdf8,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              industry demand
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color:'var(--text-muted)', lineHeight:1.8, marginBottom:'2rem', fontSize:'1rem' }}>
            Intelligent, data-driven career navigation that aligns your aspirations with real market needs.
          </motion.p>
          <motion.div variants={stagger} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            {[
              { icon:<Target size={18}/>, text:'Personalized skill gap analysis' },
              { icon:<TrendingUp size={18}/>, text:'Real-time industry trend data' },
              { icon:<Award size={18}/>, text:'AI-powered roadmap generation' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} style={{ display:'flex', alignItems:'center', gap:'0.85rem', color:'var(--text-secondary)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(56,189,248,0.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-1)', flexShrink:0 }}>{f.icon}</div>
                <span style={{ fontSize:'0.9rem', fontWeight:500 }}>{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right login card */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="grad-border">
          <div className="glass" style={{ borderRadius:'var(--radius-lg)', padding:'2.5rem' }}>
            {/* Tab toggle */}
            <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:999, padding:4, marginBottom:'2rem', border:'1px solid var(--border-subtle)' }}>
              {(['signin','signup'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'0.6rem', borderRadius:999, fontWeight:700, fontSize:'0.85rem', fontFamily:'var(--font-display)', background:tab===t ? 'linear-gradient(135deg,#38bdf8,#7c3aed)' : 'transparent', color:tab===t ? '#fff':'var(--text-muted)', transition:'all 0.3s' }}>
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.75rem' }}>
              <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(124,58,237,0.2))', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(56,189,248,0.3)' }}>
                <ShieldCheck size={26} color="var(--accent-1)" />
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {tab === 'signup' && (
                <div className="input-wrap">
                  <label className="input-label">Full Name</label>
                  <input className="input-field" type="text" placeholder="John Doe" />
                </div>
              )}
              <div className="input-wrap">
                <label className="input-label">Email Address</label>
                <input className="input-field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <div className="input-wrap">
                <label className="input-label">Password</label>
                <input className="input-field" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button className="btn btn-primary w-full" style={{ width:'100%', padding:'1rem', fontSize:'1rem', marginTop:'0.5rem' }} onClick={onLogin}>
                {tab === 'signin' ? 'Sign In' : 'Create Account'} <ChevronRight size={18} />
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
                <span style={{ fontSize:'0.75rem', color:'var(--text-hint)', fontWeight:600 }}>OR</span>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                {[{ icon:<Globe size={16}/>, label:'Google' }, { icon:<Users size={16}/>, label:'LinkedIn' }].map(s => (
                  <button key={s.label} className="btn btn-ghost" style={{ width:'100%', padding:'0.75rem', fontSize:'0.875rem' }}>{s.icon}{s.label}</button>
                ))}
              </div>
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
function OnboardingScreen({ onDone }: { onDone:(n:string,e:string,g:CareerPathType)=>void }) {
  const [name, setName]   = useState('');
  const [edu,  setEdu]    = useState('');
  const [goal, setGoal]   = useState<CareerPathType>('software-dev');

  return (
    <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }} transition={{ duration:0.5 }}
      style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', position:'relative', zIndex:1 }}
    >
      <div style={{ width:'100%', maxWidth:700 }}>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="glass" style={{ padding:'3rem' }}>
          <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(124,58,237,0.15))', border:'1px solid rgba(56,189,248,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', color:'var(--accent-1)' }}>
              <GraduationCap size={32} />
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, marginBottom:'0.5rem' }}>Build Your Career DNA</h2>
            <p style={{ color:'var(--text-muted)' }}>Tell us about yourself — we'll craft a personalized roadmap.</p>
          </motion.div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="input-wrap">
                <label className="input-label">Full Name</label>
                <input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="input-wrap">
                <label className="input-label">Education</label>
                <input className="input-field" value={edu} onChange={e=>setEdu(e.target.value)} placeholder="e.g. B.Tech CSE" />
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

            <motion.button variants={fadeUp}
              disabled={!name || !edu}
              className="btn btn-primary"
              style={{ width:'100%', padding:'1rem', fontSize:'1rem', marginTop:'0.5rem' }}
              onClick={() => onDone(name, edu, goal)}
            >
              Start My Assessment <ChevronRight size={18} />
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
function MentorsTab({ user }: { user:UserProfile }) {
  const mentors = [
    { name:'Sarah Chen',       role:'Sr. Engineer @ Google',    rating:4.9, sessions:120, tags:['System Design','Go','Cloud'], color:'#38bdf8' },
    { name:'Marcus Thorne',    role:'Product Lead @ Meta',      rating:4.8, sessions:95,  tags:['Scale','Leadership','React'], color:'#a78bfa' },
    { name:'Elena Rodriguez',  role:'AI Researcher @ OpenAI',   rating:5.0, sessions:60,  tags:['LLMs','PyTorch','Research'], color:'#10b981' },
    { name:'Arjun Mehta',      role:'Staff Engineer @ Stripe',  rating:4.9, sessions:88,  tags:['Payments','Distributed','TS'], color:'#f59e0b' },
    { name:'Nina Volkov',      role:'CTO @ YC Startup',         rating:4.7, sessions:72,  tags:['Startup','Fundraising','ML'], color:'#ec4899' },
    { name:'Kai Zhang',        role:'Security Lead @ Microsoft', rating:4.8, sessions:110, tags:['SecOps','Pentesting','Azure'], color:'#fb923c' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      <motion.div variants={fadeUp} style={{ textAlign:'center' }}>
        <span className="badge badge-purple" style={{ marginBottom:'0.75rem' }}>Expert Network</span>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>
          Connect with Industry Leaders
        </h2>
        <p style={{ color:'var(--text-muted)', marginTop:'0.5rem' }}>Matched for <strong style={{ color:'var(--text-primary)' }}>{user.name}</strong> based on your {CAREER_PATHS[user.goal].label} goals</p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem' }}>
        {mentors.map((m, i) => (
          <motion.div key={i} variants={scaleIn} className="card-premium" style={{ padding:'1.75rem', textAlign:'center' }}>
            <div style={{ position:'relative', width:72, height:72, margin:'0 auto 1.25rem' }}>
              <div className="avatar-ring" style={{ background:`linear-gradient(135deg,${m.color},${m.color}88)` }}>
                {m.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div style={{ position:'absolute', bottom:-4, right:-4, width:20, height:20, borderRadius:'50%', background:'#10b981', border:'2px solid var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
              </div>
            </div>
            <h4 style={{ fontFamily:'var(--font-display)', fontWeight:800, marginBottom:'0.25rem' }}>{m.name}</h4>
            <p style={{ fontSize:'0.8rem', color:m.color, fontWeight:700, marginBottom:'0.5rem' }}>{m.role}</p>
            <div style={{ display:'flex', justifyContent:'center', gap:'1.25rem', marginBottom:'1rem' }}>
              <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>⭐ {m.rating}</span>
              <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>{m.sessions} sessions</span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0.4rem', marginBottom:'1.25rem' }}>
              {m.tags.map(t => <span key={t} style={{ padding:'0.25rem 0.6rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, fontSize:'0.7rem', fontWeight:600, color:'var(--text-muted)' }}>{t}</span>)}
            </div>
            <button className="btn btn-ghost" style={{ width:'100%', fontSize:'0.85rem' }}>Request Mentorship</button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Utility ────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
