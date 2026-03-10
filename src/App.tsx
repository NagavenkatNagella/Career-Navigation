import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Map,
  Compass,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Users,
  Star,
  Globe,
  Rocket,
  BrainCircuit,
  ShieldCheck,
  Cloud,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import type { CareerPathType, UserProfile } from './types';
import { CAREER_PATHS, QUESTIONS_BY_PATH, ROADMAPS, INDUSTRY_TRENDS } from './data/careerData';
import './index.css';

// --- STYLES & VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

// --- COMPONENTS ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'login' | 'onboarding' | 'assessment' | 'main'>('login');

  // User State
  const [user, setUser] = useState<UserProfile>({
    name: '',
    education: '',
    goal: 'software-dev',
    experienceLevel: 'beginner',
    skills: {
      "Fundamentals": 0,
      "Core Skills": 0,
      "Advanced Concepts": 0,
      "Tools": 0,
      "Industry Prep": 0
    }
  });

  // Assessment State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- Handlers ---

  const handleStartOnboarding = (name: string, education: string, goal: CareerPathType) => {
    setUser(prev => ({ ...prev, name, education, goal }));
    setView('assessment');
  };

  const handleAssessmentComplete = (finalScore: number) => {
    // Generate initial skills based on assessment
    const baseValue = (finalScore / 3) * 80;
    const newSkills = {
      "Fundamentals": baseValue + 10,
      "Core Skills": baseValue,
      "Advanced Concepts": baseValue - 20 < 0 ? 5 : baseValue - 20,
      "Tools": 40,
      "Industry Prep": 10
    };
    setUser(prev => ({ ...prev, skills: newSkills }));
    setView('main');
    setActiveTab('dashboard');
  };

  // --- Views ---

  const SplashView = () => (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', overflow: 'hidden', position: 'fixed', inset: 0, zIndex: 10000 }}>
      <div className="bg-mesh"></div>
      <div className="bg-noise"></div>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ 
            rotate: [0, 360],
            boxShadow: ['0 0 40px var(--accent-glow)', '0 0 80px var(--accent-glow)', '0 0 40px var(--accent-glow)'],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: 'linear' }, 
            boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ width: '160px', height: '160px', background: 'var(--grad-primary)', borderRadius: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem', position: 'relative' }}
        >
          <div style={{ position: 'absolute', inset: '-10px', background: 'var(--grad-primary)', borderRadius: '54px', filter: 'blur(15px)', opacity: 0.3 }}></div>
          <BrainCircuit size={80} color="white" />
        </motion.div>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.05em', background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>SkillBridge AI</h1>
        <div style={{ overflow: 'hidden' }}>
          <motion.p 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-muted" 
            style={{ letterSpacing: '8px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 600 }}
          >
            Bridge the Industry Gap
          </motion.p>
        </div>
        <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '2rem auto', borderRadius: '1px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', background: 'var(--accent-primary)' }}
          />
        </div>
      </motion.div>
    </div>
  );

  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="container min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
          <div className="card glass-panel p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={120} />
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary">
                <ShieldCheck size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-center mb-2">Welcome Back</h2>
            <p className="text-muted text-center mb-10">Sign in to continue your career journey.</p>
            
            <div className="space-y-6">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="input-field" 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-field" 
                />
              </div>
              <button 
                onClick={() => setView('onboarding')}
                className="btn btn-primary w-full py-4 text-lg font-bold"
              >
                Sign In <ChevronRight size={20} />
              </button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-muted font-bold">Or continue with</span></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="btn btn-secondary py-3"><Globe size={18} /> Google</button>
                <button className="btn btn-secondary py-3"><Users size={18} /> LinkedIn</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const OnboardingView = () => {
    const [name, setName] = useState('');
    const [education, setEducation] = useState('');
    const [goal, setGoal] = useState<CareerPathType>('software-dev');

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container max-w-2xl mt-20">
        <div className="card glass-panel p-10">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <GraduationCap size={48} className="text-accent-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Build Your Career DNA</h2>
            <p className="text-muted">Tell us who you are, and where you want to go.</p>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="input-field" />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label">Highest Education</label>
              <input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="input-field" />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label">Target Career Domain</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {(Object.entries(CAREER_PATHS) as [CareerPathType, any][]).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setGoal(key);
                    }}
                    className={`btn text-left justify-start gap-4 p-5 border-2 transition-all duration-300 rounded-[2rem] w-full relative overflow-hidden group ${goal === key
                        ? 'border-accent-primary bg-accent-primary/20 shadow-[0_0_30px_rgba(56,189,248,0.3)] ring-2 ring-accent-primary/50'
                        : 'border-white/5 bg-white/5 opacity-80 hover:opacity-100 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${goal === key ? 'bg-accent-primary text-white' : 'bg-white/10 text-muted group-hover:bg-white/20'}`}>
                      {key === 'software-dev' && <Rocket size={20} />}
                      {key === 'data-science' && <Briefcase size={20} />}
                      {key === 'cybersecurity' && <ShieldCheck size={20} />}
                      {key === 'ai-ml' && <BrainCircuit size={20} />}
                      {key === 'cloud-computing' && <Cloud size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-lg leading-tight transition-colors ${goal === key ? 'text-accent-primary' : 'text-main'}`}>{info.label}</span>
                      <span className="text-xs text-muted mt-1 opacity-80">{info.description}</span>
                    </div>
                    {goal === key && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle2 size={24} />
                      </motion.div>
                    )}
                  </button>

                ))}
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              disabled={!name || !education}
              onClick={() => handleStartOnboarding(name, education, goal)}
              className="btn btn-primary w-full py-4 mt-6 disabled:opacity-30"
            >
              Analyze My Profile <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const AssessmentView = () => {
    const questions = QUESTIONS_BY_PATH[user.goal];
    const question = questions[currentQuestionIndex];

    const handleAnswer = (optionIndex: number) => {
      let newScore = score;
      if (optionIndex === question.correctAnswer) newScore += 1;
      setScore(newScore);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleAssessmentComplete(newScore);
      }
    };

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container max-w-xl mt-20">
        <div className="card glass-panel p-10">
          <div className="flex justify-between items-center mb-10">
            <span className="badge-primary px-3 py-1">Initial Assessment</span>
            <span className="text-xs text-muted">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>

          <motion.div key={question.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-8 leading-tight">{question.question}</h2>
            <div className="space-y-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(idx)}
                  className="btn btn-secondary w-full text-left justify-start p-6 rounded-[1.5rem] hover:border-accent-primary hover:bg-accent-primary/5 transition-all duration-300 group relative border-2 border-white/5"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 group-hover:bg-accent-primary group-hover:text-white transition-all font-bold">{String.fromCharCode(65 + idx)}</span>
                  <span className="text-lg font-medium">{option}</span>
                </button>

              ))}
            </div>
          </motion.div>

          <div className="mt-12 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent-primary transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>
      </motion.div>
    );
  };

  const MainDashboard = () => {
    const roadmap = ROADMAPS[user.goal];
    const radarData = Object.entries(user.skills).map(([key, value]) => ({
      skill: key,
      current: value,
      fullMark: 100
    }));

    return (
      <div className="app-wrapper min-h-screen">
        <nav className="glass-panel sticky top-0 z-[100] border-none" style={{ background: 'rgba(2, 6, 23, 0.8)' }}>
          <div className="container flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="badge-primary p-2 rounded-xl"><Compass size={24} /></div>
              <span className="font-bold text-xl uppercase tracking-tighter">SkillBridge <span className="text-accent-primary">AI</span></span>
            </div>

            <div className="flex gap-2">
              {['dashboard', 'path', 'recommendations', 'mentors'].map(tab => (
                <button
                  key={tab}
                  className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-icon'}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ borderRadius: '12px' }}
                >
                  {tab === 'dashboard' && <Target size={18} />}
                  {tab === 'path' && <Map size={18} />}
                  {tab === 'recommendations' && <BookOpen size={18} />}
                  {tab === 'mentors' && <Users size={18} />}
                  <span className={activeTab === tab ? 'block ml-2' : 'hidden'}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden-mobile">
                <div className="font-bold text-sm">{user.name}</div>
                <div className="text-[10px] text-accent-primary font-bold">MATCH: {CAREER_PATHS[user.goal].label}</div>
              </div>
              <div className="avatar glow-effect w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center font-bold">AD</div>
            </div>
          </div>
        </nav>

        <main className="container py-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="db" variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-12 gap-6">
                <div className="col-span-12 card glass-panel shadow-none border-white/5 bg-transparent p-0 mb-6 flex flex-col md:flex-row justify-between items-end gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl font-black mb-2">Accelerating your {CAREER_PATHS[user.goal].label} journey.</h2>
                    <p className="text-muted">Targeting roles at <span className="text-main font-semibold">Google, Meta, and Scale AI</span> based on your current performance trends.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="badge-primary flex items-center gap-2 px-6 py-3 rounded-2xl"><Zap size={20} className="animate-pulse" /> Intelligence Optimized</div>
                  </div>
                </div>

                {/* Skill Radar */}
                <div className="col-span-12 lg:col-span-7 card glass-panel">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Target className="text-accent-primary" /> Skill Architecture</h3>
                    <div className="text-[10px] uppercase tracking-widest font-black text-muted">Assessment Based Profile</div>
                  </div>
                  <div style={{ height: '350px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 13 }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '16px' }} />
                        <Radar name="Your Profile" dataKey="current" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Readiness */}
                <div className="col-span-12 lg:col-span-5 card glass-panel shimmer">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Award className="text-accent-secondary" /> Readiness Score</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <circle cx="96" cy="96" r="88" fill="none" stroke="var(--accent-secondary)" strokeWidth="12" strokeDasharray="552.9" strokeDashoffset={552.9 - (552.9 * (score / 3 * 100)) / 100} strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center">
                        <div className="text-5xl font-black">{Math.round(score / 3 * 100)}%</div>
                        <div className="text-[10px] uppercase font-bold text-muted">Initial Match</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-center text-muted">You have a strong foundation in <span className="text-white">{user.goal.split('-')[0]} fundamentals</span>, but need to bridge gap in <span className="text-accent-primary">Advanced Concepts</span>.</p>
                    <button className="btn btn-primary w-full" onClick={() => setActiveTab('path')}>Explore Roadmap <ChevronRight size={16} /></button>
                  </div>
                </div>

                {/* Trends */}
                <div className="col-span-12 card glass-panel">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-accent-tertiary" /> Market Intelligence</h3>
                      <p className="text-sm text-muted">Demand trends in {CAREER_PATHS[user.goal].label}</p>
                    </div>
                    <div className="badge-primary px-4 py-2">LIVE DATA</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {INDUSTRY_TRENDS.slice(0, 5).map((trend, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-accent-tertiary/30 transition-all hover:-translate-y-1">
                        <div className="text-2xl font-black text-accent-tertiary mb-1">{trend.growth}</div>
                        <div className="text-sm font-bold text-main mb-3">{trend.name}</div>
                        <div className="h-1 w-full bg-white/5 rounded-full"><div className="h-full bg-accent-tertiary" style={{ width: `${trend.demand}%` }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="col-span-12 card glass-panel bg-grad-glow">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-status-warning/10 rounded-3xl border border-status-warning/20">
                      <AlertCircle className="text-status-warning" size={40} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-1">Skill Gap Analysis</h3>
                      <p className="text-muted">We've identified <span className="text-status-warning font-bold">3 critical gaps</span> between your current profile and {CAREER_PATHS[user.goal].label} requirements.</p>
                      <div className="flex gap-4 mt-4">
                        {["System Design", "Cloud Native", "Advanced DS"].map(gap => (
                          <div key={gap} className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-main flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-status-warning"></div> {gap}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setActiveTab('recommendations')}>Fix Gaps Now</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'path' && (
              <motion.div key="path" variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <div className="badge-primary mb-4">SEQUENTIAL GROWTH</div>
                  <h2 className="text-4xl font-extrabold mb-4">Structured {CAREER_PATHS[user.goal].label} Roadmap</h2>
                  <p className="text-muted">Personalized path for <span className="text-main font-bold">{user.name}</span> based on {user.education} background.</p>
                </div>

                <div className="relative space-y-12">
                  <div className="absolute left-[39px] top-6 bottom-6 w-1 bg-white/5 rounded-full"></div>
                  {roadmap.map((step, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="flex gap-8 group">
                      <div className={`w-20 h-20 rounded-3xl shrink-0 flex items-center justify-center border-2 transition-all group-hover:scale-110 ${step.status === 'completed' ? 'bg-status-success/20 border-status-success text-status-success' : step.status === 'current' ? 'bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'bg-white/5 border-white/10 text-muted opacity-50'}`}>
                        {step.status === 'completed' ? <CheckCircle2 size={36} /> : step.status === 'current' ? <Zap size={36} className="animate-float" /> : <ShieldCheck size={30} />}
                      </div>
                      <div className={`flex-1 card glass-panel transition-all ${step.status === 'current' ? 'border-accent-primary/50 shadow-2xl scale-[1.02]' : 'opacity-80'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xl font-bold">{step.title}</h4>
                          <span className={`badge uppercase text-[10px] ${step.status === 'completed' ? 'badge-success' : step.status === 'current' ? 'badge-primary animate-pulse' : 'text-muted'}`}>{step.status}</span>
                        </div>
                        <p className="text-muted mb-4">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.technologies.map(tech => <span key={tech} className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-accent-primary uppercase tracking-widest">{tech}</span>)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div key="rec" variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 p-10 rounded-[40px] border border-white/10">
                  <h2 className="text-3xl font-black mb-2">Curated Skill Bridge</h2>
                  <p className="text-muted">Resources and projects strategically selected to reduce your hiring turnaround time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card glass-panel group hover:border-accent-primary/50 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-accent-primary/10 rounded-2xl"><BookOpen size={24} className="text-accent-primary" /></div>
                      <h3 className="text-xl font-bold">Top Verified Resource</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="font-bold mb-1">Advanced {user.goal === 'software-dev' ? 'System Design' : 'Data Engineering'} Course</div>
                        <div className="text-xs text-muted">Provided by Industry Experts • 8 Weeks</div>
                        <button className="btn btn-primary w-full mt-4 py-2 text-sm">Enroll Now <ChevronRight size={14} /></button>
                      </div>
                    </div>
                  </div>

                  <div className="card glass-panel group hover:border-status-success/50 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-status-success/10 rounded-2xl"><Rocket size={24} className="text-status-success" /></div>
                      <h3 className="text-xl font-bold">Portfolio Project</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="font-bold mb-1">Scalable {user.goal.split('-')[0].toUpperCase()} Application</div>
                      <p className="text-xs text-muted mb-4">Build and deploy a full-scale platform demonstrating {user.goal} principles.</p>
                      <div className="flex gap-2">
                        <span className="badge badge-success text-[8px]">Hiring Bonus</span>
                        <span className="badge badge-primary text-[8px]">PRO Portfolio</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card glass-panel flex items-start gap-8 p-10" style={{ borderLeft: '12px solid var(--accent-primary)' }}>
                  <div className="p-4 bg-accent-primary/10 rounded-2xl shrink-0"><AlertCircle className="text-accent-primary" size={32} /></div>
                  <div>
                    <h4 className="text-2xl font-black mb-2">AI Reasoner Insight</h4>
                    <p className="text-muted leading-relaxed">Based on your {user.education} background and assessment performance, we recommend focusing on <span className="text-main font-bold">Practical Infrastructure</span>. Recent trends in {CAREER_PATHS[user.goal].label} show that 85% of interview blocks at Tier-1 companies now prioritize architecture over syntax mastery.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mentors' && (
              <motion.div key="mentors" variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black mb-4">Connect with Industry Experts</h2>
                  <p className="text-muted">Personalized mentor matches based on your {CAREER_PATHS[user.goal].label} aspirations.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Sarah Chen", role: "Sr. Engineer @ Google", rating: 4.9, tags: ["System Design", "Go"] },
                    { name: "Marcus Thorne", role: "Product Lead @ Meta", rating: 4.8, tags: ["Scale", "Leadership"] },
                    { name: "Elena Rodriguez", role: "AI Researcher @ OpenAI", rating: 5.0, tags: ["LLMs", "PyTorch"] }
                  ].map((mentor, i) => (
                    <motion.div key={i} variants={itemVariants} className="card glass-panel p-8 text-center border-white/5 hover:border-accent-primary/40 transition-all">
                      <div className="w-20 h-20 bg-accent-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-accent-primary font-black text-2xl">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{mentor.name}</h3>
                      <p className="text-accent-primary text-sm font-bold mb-4">{mentor.role} • ⭐ {mentor.rating}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {mentor.tags.map(t => <span key={t} className="text-[10px] px-2 py-1 bg-white/5 rounded-md border border-white/10">{t}</span>)}
                      </div>
                      <button className="btn btn-secondary w-full">Request Mentorship</button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  };

  if (showSplash) return <SplashView />;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="bg-mesh"></div>
      <div className="bg-noise"></div>
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <LoginView />
          </motion.div>
        )}
        {view === 'onboarding' && (
          <motion.div key="onboarding" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
            <OnboardingView />
          </motion.div>
        )}
        {view === 'assessment' && (
          <motion.div key="assessment" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            <AssessmentView />
          </motion.div>
        )}
        {view === 'main' && (
          <motion.div key="main" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <MainDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
