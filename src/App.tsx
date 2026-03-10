import { useState, useEffect } from 'react';
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
  AlertCircle
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
  CartesianGrid
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
    "Node.js": 40,
    "System Design": 20,
    "Cloud/AWS": 15,
    "Database": 50
  } as Record<string, number>
};

const requiredSkills: Record<string, number> = {
  "React": 90,
  "TypeScript": 85,
  "Node.js": 80,
  "System Design": 75,
  "Cloud/AWS": 70,
  "Database": 70
};

const industryTrends = [
  { name: 'AI/ML Integration', demand: 95 },
  { name: 'Cloud Native', demand: 88 },
  { name: 'Web3 / Blockchain', demand: 45 },
  { name: 'Serverless', demand: 75 },
  { name: 'Edge Computing', demand: 60 }
];

const learningPaths = [
  {
    id: 1,
    title: "Advanced System Design for Scale",
    provider: "TechPlatform",
    duration: "4 weeks",
    matchScore: 95,
    skills: ["System Design", "Cloud/AWS"],
    type: "Course"
  },
  {
    id: 2,
    title: "Node.js Microservices Masterclass",
    provider: "CodeAcademy",
    duration: "6 weeks",
    matchScore: 88,
    skills: ["Node.js", "Database"],
    type: "Bootcamp"
  },
  {
    id: 3,
    title: "AWS Certified Developer",
    provider: "Amazon",
    duration: "8 weeks",
    matchScore: 82,
    skills: ["Cloud/AWS"],
    type: "Certification"
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
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
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', zIndex: 9999 }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div className="glow-effect" style={{ width: '120px', height: '120px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={64} color="white" />
            </div>
            <div style={{ position: 'absolute', right: -10, top: -10, background: 'var(--status-success)', width: 24, height: 24, borderRadius: '50%', border: '4px solid var(--bg-dark)' }}></div>
          </div>
          <div className="text-center">
            <h1 style={{ fontSize: '3rem', letterSpacing: '2px', background: 'linear-gradient(90deg, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge AI</h1>
            <p className="text-muted mt-2" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Align Your Aspiration.</p>
          </div>

          <div className="mt-8" style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="progress-fill animate-splash-progress" style={{ width: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
          </div>

          <button className="btn btn-secondary mt-12 animate-fade-in" style={{ animationDelay: '2s', opacity: 0 }} onClick={() => setShowSplash(false)}>Skip to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-wrapper ${mounted && !showSplash ? 'animate-fade-in' : ''}`}>
      {/* Navigation */}
      <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="container flex items-center justify-between" style={{ height: '70px' }}>
          <div className="flex items-center gap-2">
            <Compass className="text-accent-primary" size={28} />
            <span className="font-bold text-xl" style={{ letterSpacing: '1px' }}>SkillBridge AI</span>
          </div>

          <div className="flex gap-4">
            <button
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-icon'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Target size={18} /> <span className="hidden-mobile">Dashboard</span>
            </button>
            <button
              className={`btn ${activeTab === 'path' ? 'btn-primary' : 'btn-icon'}`}
              onClick={() => setActiveTab('path')}
            >
              <Map size={18} /> <span className="hidden-mobile">Career Path</span>
            </button>
            <button
              className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-icon'}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <BookOpen size={18} /> <span className="hidden-mobile">Learning</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden-mobile">
              <div className="font-semibold text-sm">{userProfile.name}</div>
              <div className="text-xs text-muted">{userProfile.currentRole}</div>
            </div>
            <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ padding: '2rem 1.5rem', minHeight: 'calc(100vh - 70px)' }}>

        {/* Header Section */}
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Navigation Dashboard</h1>
            <p className="text-muted">Bridging the gap to your target role: <strong className="text-main" style={{ color: 'white' }}>{userProfile.aspiration}</strong></p>
          </div>
          <div className="badge badge-primary glow-effect flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
            <Zap size={16} /> Data-Driven Mode Active
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-3 gap-6 animate-fade-in">
            {/* Overview Card */}
            <div className="card glass-panel flex-col gap-4" style={{ gridColumn: 'span 1' }}>
              <div className="flex items-center gap-2 text-xl font-bold mb-2">
                <Target className="text-accent-secondary" /> Readiness Score
              </div>

              <div className="flex items-center justify-center my-4">
                <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(var(--accent-primary) ${overallProgress}%, rgba(255,255,255,0.1) 0)` }}>
                  <div style={{ position: 'absolute', width: '130px', height: '130px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{overallProgress}%</span>
                    <span className="text-xs text-muted text-center" style={{ marginTop: '-5px' }}>Match</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-muted">
                You are {overallProgress}% ready for a Senior Full Stack Engineer role based on current industry demands.
              </p>

              <button className="btn btn-primary w-full mt-4" style={{ width: '100%' }} onClick={() => setActiveTab('recommendations')}>
                Start Bridging Gap
              </button>
            </div>

            {/* Radar Chart Card */}
            <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <TrendingUp className="text-accent-primary" /> Skill Gap Analysis
              </div>
              <div className="chart-container" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Radar name="Current Skills" dataKey="current" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
                    <Radar name="Required Skills" dataKey="required" stroke="var(--status-warning)" fill="var(--status-warning)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, background: 'var(--accent-primary)', borderRadius: '50%' }}></div> Current</div>
                <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, background: 'var(--status-warning)', borderRadius: '50%' }}></div> Required for Target</div>
              </div>
            </div>

            {/* Industry Trends */}
            <div className="card glass-panel" style={{ gridColumn: 'span 3', marginTop: '1rem' }}>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <Briefcase className="text-accent-tertiary" /> Industry Skill Demands (Live Data)
              </div>
              <div className="chart-container" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryTrends} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-main)', fontSize: 13 }} width={120} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="demand" fill="var(--accent-tertiary)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div className="animate-fade-in grid grid-cols-1 gap-6">
            <div className="card glass-panel relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="flex items-center gap-3">
                  <Map className="text-accent-primary" size={28} /> Career Roadmap
                </h2>
                <span className="badge badge-success">Target: {userProfile.aspiration}</span>
              </div>

              <div className="flex-col gap-8" style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: '2rem', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>

                {/* Step 1 */}
                <div className="flex gap-4 relative">
                  <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 10px var(--status-success)' }}></div>
                  <div className="card flex-1" style={{ borderLeft: '4px solid var(--status-success)', margin: 0 }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg">Master Core Frontend</h3>
                      <span className="badge badge-success"><CheckCircle2 size={12} className="inline mr-1" />Completed</span>
                    </div>
                    <p className="text-sm text-muted mb-3">React, TypeScript, CSS Architecture</p>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', background: 'var(--status-success)' }}></div></div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 relative mt-6">
                  <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
                  <div className="card flex-1 glow-effect" style={{ borderLeft: '4px solid var(--accent-primary)', margin: 0 }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg">Backend Integration & Node.js</h3>
                      <span className="badge badge-primary">Current Focus</span>
                    </div>
                    <p className="text-sm text-muted mb-3">APIs, Express, Database Design, Auth</p>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: '45%' }}></div></div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 relative mt-6 opacity-70">
                  <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>
                  <div className="card flex-1" style={{ borderLeft: '4px solid var(--text-muted)', margin: 0 }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg">System Architecture</h3>
                      <span className="badge text-muted" style={{ border: '1px solid var(--text-muted)' }}>Upcoming</span>
                    </div>
                    <p className="text-sm text-muted mb-3">Scalability, Microservices, Cloud Infrastructure</p>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: '0%' }}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="animate-fade-in">
            <h2 className="flex items-center gap-3 mb-6">
              <Zap className="text-accent-secondary" size={28} /> AI-Curated Learning Path
            </h2>
            <p className="text-muted mb-8">
              Based on your skill gap analysis, here are the top recommendations to achieve your goal of becoming a <strong>{userProfile.aspiration}</strong>.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {learningPaths.map(path => (
                <div key={path.id} className="card glass-panel flex flex-col gap-4 transition-all hover:translate-x-2" style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)' }}>
                    {path.type === 'Course' ? <BookOpen size={24} className="text-accent-primary" /> :
                      path.type === 'Bootcamp' ? <TrendingUp size={24} className="text-status-warning" /> :
                        <Award size={24} className="text-accent-secondary" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg m-0">{path.title}</h3>
                      <span className="badge badge-primary">{path.type}</span>
                    </div>
                    <div className="text-sm text-muted flex items-center gap-4">
                      <span>By {path.provider}</span>
                      <span>•</span>
                      <span>{path.duration}</span>
                      <span>•</span>
                      <span className="flex gap-1">
                        Targets: {path.skills.map((s, index) => (
                          <span key={s}>
                            <span className="text-accent-primary font-medium">{s}</span>
                            {index < path.skills.length - 1 && ', '}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2" style={{ minWidth: '120px' }}>
                    <div className="text-sm font-semibold flex items-center gap-1 text-status-success">
                      <CheckCircle2 size={14} /> {path.matchScore}% Match
                    </div>
                    <button className="btn btn-secondary text-sm" style={{ padding: '0.5rem 1rem' }}>
                      Start <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card glass-panel mt-6" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div className="flex items-start gap-4">
                <AlertCircle className="text-accent-primary mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-accent-primary mb-1">Why these recommendations?</h4>
                  <p className="text-sm text-muted">
                    Our NLP models matched the syllables of your current backend deficiencies (+15% required logic vs +40% actual) against the syllabi of 10,000+ top-rated industry courses. System Design and Cloud infrastructure provide the highest ROI for your career transition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
