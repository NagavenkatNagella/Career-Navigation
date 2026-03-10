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
  Rocket
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
import './index.css';

// Mock Data
const userProfile = {
  name: "Alex Dev",
  currentRole: "Junior Frontend Developer",
  aspiration: "Senior Full Stack Engineer",
  currentSkills: {
    "React": 85,
    "TypeScript": 70,
    "Node.js": 45,
    "System Design": 25,
    "Cloud/AWS": 20,
    "Database": 55
  } as Record<string, number>
};

const requiredSkills: Record<string, number> = {
  "React": 95,
  "TypeScript": 90,
  "Node.js": 85,
  "System Design": 80,
  "Cloud/AWS": 75,
  "Database": 80
};

const industryTrends = [
  { name: 'AI/ML Integration', demand: 98, color: 'var(--accent-primary)' },
  { name: 'Cloud Native', demand: 92, color: 'var(--accent-secondary)' },
  { name: 'Distributed Systems', demand: 85, color: 'var(--accent-tertiary)' },
  { name: 'Serverless', demand: 78, color: 'var(--accent-quaternary)' },
  { name: 'DevSecOps', demand: 72, color: 'var(--status-warning)' }
];

const learningPaths = [
  {
    id: 1,
    title: "Advanced System Design for Scale",
    provider: "SkillBridge Premium",
    duration: "4 weeks",
    matchScore: 98,
    skills: ["System Design", "Cloud/AWS"],
    type: "Expert Course",
    difficulty: "Advanced"
  },
  {
    id: 2,
    title: "Node.js Microservices Masterclass",
    provider: "Industry Leaders",
    duration: "6 weeks",
    matchScore: 92,
    skills: ["Node.js", "Database"],
    type: "Specialization",
    difficulty: "Intermediate"
  },
  {
    id: 3,
    title: "AWS Certified Solutions Architect",
    provider: "Amazon Web Services",
    duration: "12 weeks",
    matchScore: 89,
    skills: ["Cloud/AWS"],
    type: "Certification",
    difficulty: "Advanced"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const radarData = Object.keys(requiredSkills).map(skill => ({
    skill,
    current: userProfile.currentSkills[skill],
    required: requiredSkills[skill],
    fullMark: 100,
  }));

  const overallProgress = Math.round(
    Object.keys(requiredSkills).reduce((acc, curr) =>
      acc + (userProfile.currentSkills[curr] / requiredSkills[curr]) * 100
      , 0) / Object.keys(requiredSkills).length
  );

  if (showSplash) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', overflow: 'hidden', position: 'fixed', inset: 0, zIndex: 10000 }}>
        <div className="bg-mesh"></div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}
        >
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{
                rotate: 360,
                boxShadow: ['0 0 20px var(--accent-glow)', '0 0 50px var(--accent-glow)', '0 0 20px var(--accent-glow)']
              }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, boxShadow: { duration: 3, repeat: Infinity } }}
              style={{ width: '140px', height: '140px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Compass size={80} color="white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              style={{ position: 'absolute', right: -15, top: -15, background: 'var(--status-success)', padding: '8px', borderRadius: '50%', border: '4px solid var(--bg-dark)', color: 'white' }}
            >
              <CheckCircle2 size={24} />
            </motion.div>
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-2px', background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              SkillBridge AI
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted mt-2"
              style={{ letterSpacing: '6px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 500 }}
            >
              Your Career, Reimagined.
            </motion.p>
          </div>

          <div style={{ width: '300px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary))' }}
            ></motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="btn btn-secondary mt-8"
            onClick={() => setShowSplash(false)}
          >
            Launch Intelligence
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-wrapper min-h-screen relative">
      <div className="bg-mesh"></div>

      {/* Premium Navigation */}
      <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'rgba(2, 6, 23, 0.8)' }}>
        <div className="container flex items-center justify-between" style={{ height: '80px' }}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="badge-primary" style={{ padding: '8px', borderRadius: '12px' }}>
              <Compass size={28} className="text-accent-primary" />
            </div>
            <span className="font-bold text-2xl" style={{ letterSpacing: '-1px' }}>SkillBridge <span className="text-accent-primary">AI</span></span>
          </motion.div>

          <div className="flex gap-2">
            {[
              { id: 'dashboard', icon: Target, label: 'Dashboard' },
              { id: 'path', icon: Map, label: 'Roadmap' },
              { id: 'recommendations', icon: BookOpen, label: 'Learning' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-icon'}`}
                style={{ borderRadius: '12px', padding: activeTab === tab.id ? '0.75rem 1.25rem' : '0.75rem' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={20} />
                <span className={activeTab === tab.id ? 'block' : 'hidden'}>{tab.label}</span>
              </button>
            ))}
          </div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="text-right hidden-mobile">
              <div className="font-bold text-sm">{userProfile.name}</div>
              <div className="text-xs text-muted flex items-center gap-1 justify-end">
                <Star size={10} className="text-status-warning" /> PRO Account
              </div>
            </div>
            <div className="avatar glow-effect" style={{ width: '45px', height: '45px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
              AD
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '3rem 1.5rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Header Card */}
              <motion.div variants={itemVariants} className="col-span-12 flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-extrabold mb-2">Welcome back, Alex.</h2>
                  <p className="text-muted flex items-center gap-2">
                    Target: <span className="text-main font-semibold px-2 py-0.5 rounded-lg bg-white/5">{userProfile.aspiration}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></span>
                    <span className="text-accent-primary font-medium">Tracking Optimal Path</span>
                  </p>
                </div>
                <div className="badge-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg border-white/10">
                  <Rocket size={20} className="animate-float" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Intelligence Status</div>
                    <div className="text-sm font-bold">Active & Optimizing</div>
                  </div>
                </div>
              </motion.div>

              {/* Readiness Score Card */}
              <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 card glass-panel shimmer">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl flex items-center gap-2"><Target className="text-accent-secondary" /> Readiness</h3>
                  <span className="text-xs font-bold text-accent-secondary bg-accent-secondary/10 px-2 py-1 rounded-md">+4.2% this week</span>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="8"
                        strokeDasharray="282.7"
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{ strokeDashoffset: 282.7 - (282.7 * overallProgress) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white' }}>{overallProgress}%</span>
                      <span className="text-xs uppercase tracking-[3px] text-muted -mt-2">Global Match</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Current Level</span>
                    <span className="font-bold">Intermediate</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${overallProgress}%` }}></div></div>
                  <p className="text-xs text-muted leading-relaxed text-center italic">
                    "Focusing on System Design will increase your score by 12 points."
                  </p>
                  <button className="btn btn-primary w-full shadow-lg" onClick={() => setActiveTab('recommendations')}>
                    Close Skill Gaps <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Radar Chart Card */}
              <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 card glass-panel">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl flex items-center gap-2"><TrendingUp className="text-accent-primary" /> Skill Architecture</h3>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-primary"></span> Current</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/20"></span> Target</span>
                  </div>
                </div>

                <div style={{ height: '360px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      />
                      <Radar name="Target Profile" dataKey="required" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.1)" fillOpacity={0.1} />
                      <Radar name="Your Profile" dataKey="current" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bar Chart Trends */}
              <motion.div variants={itemVariants} className="col-span-12 card glass-panel">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl flex items-center gap-2"><Globe className="text-accent-tertiary" /> Market Intelligence</h3>
                    <p className="text-sm text-muted mt-1">Real-time demand across top tech hubs</p>
                  </div>
                  <div className="badge-primary">Live Updates</div>
                </div>

                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryTrends} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '12px', color: 'white' }} />
                      <Bar dataKey="demand" radius={[10, 10, 0, 0]} barSize={50}>
                        {industryTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'path' && (
            <motion.div
              key="path"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="badge-primary mb-4">Trajectory Path</div>
                <h2 className="text-4xl font-extrabold mb-4">Your Intelligent Journey</h2>
                <p className="text-muted max-w-xl">We've mapped your evolution from a Junior Developer to a Senior Full Stack Engineer. Follow the sequence for maximum career acceleration.</p>
              </div>

              <div className="relative space-y-12">
                {/* Visual Connector Line */}
                <div className="absolute left-[39px] top-4 bottom-4 w-1 bg-gradient-to-b from-status-success via-accent-primary to-white/5 rounded-full"></div>

                {/* Milestone 1 */}
                <motion.div variants={itemVariants} className="flex gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-status-success/20 border-2 border-status-success flex items-center justify-center text-status-success shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="flex-1 card glass-panel">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xl font-bold">Frontend Foundations</h4>
                      <span className="badge badge-success px-4 py-1.5 rounded-xl">Verified</span>
                    </div>
                    <p className="text-muted leading-relaxed">
                      You have demonstrated mastery in <span className="text-main">React v18, TypeScript 5.0</span>, and modern state management. This is the bedrock of your stack.
                    </p>
                    <div className="flex gap-2 mt-4 text-xs">
                      {['React', 'TypeScript', 'CSS/PostCSS'].map(s => <span key={s} className="bg-white/5 px-2 py-1 rounded-md border border-white/10">{s}</span>)}
                    </div>
                  </div>
                </motion.div>

                {/* Milestone 2 */}
                <motion.div variants={itemVariants} className="flex gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-accent-primary/20 border-2 border-accent-primary flex items-center justify-center text-accent-primary shadow-[0_0_20px_rgba(56,189,248,0.3)] shimmer">
                    <Briefcase size={36} />
                  </div>
                  <div className="flex-1 card glass-panel shadow-2xl border-accent-primary/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xl font-bold">Full Stack Integration</h4>
                      <span className="badge badge-primary px-4 py-1.5 rounded-xl animate-pulse">Critical Phase</span>
                    </div>
                    <p className="text-muted leading-relaxed">
                      Bridge your skills by deep-diving into <span className="text-main">Distributed Systems and Node.js Architectures</span>. This transition represents 60% of your career growth potential.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-accent-primary">Estimated completion: 8 weeks</span>
                        <span>45% Progress</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: '45%' }}></div></div>
                    </div>
                  </div>
                </motion.div>

                {/* Milestone 3 */}
                <motion.div variants={itemVariants} className="flex gap-8 relative z-10 opacity-50">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center text-muted">
                    <Rocket size={36} />
                  </div>
                  <div className="flex-1 card glass-panel">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xl font-bold">Cloud-Native Mastery</h4>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-60">Locked</span>
                    </div>
                    <p className="text-muted">
                      Deploy scalable infrastructure using <span className="text-main">AI-driven auto-scaling, Kubernetes</span>, and serverless edge computing.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="learning"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                    <Zap size={32} className="text-accent-primary animate-float" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">AI Recommended Stacks</h2>
                    <p className="text-muted">High-ROI knowledge acquisition tailored to your unique profile and current market gaps.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {learningPaths.map((path, idx) => (
                  <motion.div
                    key={path.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="card glass-panel flex flex-col md:flex-row items-center gap-8 group"
                  >
                    <div className="w-full md:w-48 h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center relative overflow-hidden">
                      {path.id === 1 ? <BookOpen size={40} className="text-accent-primary" /> :
                        path.id === 2 ? <TrendingUp size={40} className="text-accent-tertiary" /> :
                          <Award size={40} className="text-accent-secondary" />}
                      <div className="absolute top-0 right-0 p-3">
                        <div className="badge-primary text-[10px]">{path.difficulty}</div>
                      </div>
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold group-hover:text-accent-primary transition-colors">{path.title}</h3>
                        <span className="badge-primary px-3 py-1 bg-accent-primary/5 border-accent-primary/20 text-accent-primary">{path.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                        <span className="flex items-center gap-1.5"><Globe size={14} /> {path.provider}</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={14} /> {path.duration}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} /> 12.5k Enrolled</span>
                      </div>
                      <div className="flex gap-2">
                        {path.skills.map(s => <span key={s} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider">{s}</span>)}
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 min-w-[160px]">
                      <div className="text-2xl font-black text-status-success flex items-center gap-2">
                        {path.matchScore}% <span className="text-[10px] uppercase tracking-widest text-muted">Match</span>
                      </div>
                      <button className="btn btn-primary w-full group-hover:shadow-[0_0_20px_var(--accent-glow)]">
                        Unlock Content <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="card glass-panel" style={{ borderLeft: '10px solid var(--accent-primary)', background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1), transparent)' }}>
                <div className="flex items-start gap-6">
                  <div className="p-3 bg-accent-primary/20 rounded-xl">
                    <AlertCircle className="text-accent-primary" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">AI Reasoning Engine</h4>
                    <p className="text-muted leading-relaxed">
                      Our intelligence analyzed 14.5M job descriptions across LinkedIn, Glassdoor, and Indeed. <span className="text-accent-primary font-semibold">92% of "Senior Full Stack" roles</span> now mandate experience with cloud-native system design. We've prioritized these courses to minimize your "Time-to-Hire" by an estimated <span className="text-main font-bold">3.5 months</span>.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="container py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between text-muted text-sm gap-6">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-accent-primary" />
            <span className="font-bold">SkillBridge AI v4.2.0</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-main">Neural Engine</a>
            <a href="#" className="hover:text-main">Privacy Architecture</a>
            <a href="#" className="hover:text-main">API Access</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-dark bg-accent-secondary flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
            </div>
            <span>+150k Active Navigators</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
