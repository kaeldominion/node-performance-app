'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Icons } from '@/lib/iconMapping';
import { useTheme } from '@/contexts/ThemeContext';
import { Users, Zap, Target, TrendingUp, Clock, Trophy, Activity, Calendar, MapPin, X, Sun, Moon, Footprints, Timer } from 'lucide-react';

interface HyroxRace {
  name: string;
  location: string;
  date: string;
  daysUntil: number;
}

export default function HyroxAIBuilderPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [terminalStep, setTerminalStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [upcomingRaces, setUpcomingRaces] = useState<HyroxRace[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [formData, setFormData] = useState({
    equipment: [] as string[],
    trainingLevel: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE',
  });

  const HYROX_EQUIPMENT = [
    'rower',
    'ski_erg',
    'bike_erg',
    'air_bike',
    'dumbbells',
    'kettlebell',
    'sandbag',
    'pull-up bar',
    'running route',
  ];

  const handleGenerate = () => {
    if (formData.equipment.length === 0) {
      alert('Please select at least one piece of equipment');
      return;
    }
    setShowSignupPrompt(true);
  };

  const handleSignupAndRedirect = () => {
    // Build URL with form data as query params
    const params = new URLSearchParams({
      goal: 'CONDITIONING',
      workoutType: 'single',
      workoutDuration: 'hyrox',
      trainingLevel: formData.trainingLevel,
      equipment: formData.equipment.join(','),
    });
    router.push(`/auth/register?redirect=/ai/workout-builder?${params.toString()}`);
  };

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Terminal animation
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setTerminalStep((prev) => {
        if (prev >= 5) {
          setIsAnimating(false);
          return 5;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Load upcoming races (with error handling)
  useEffect(() => {
    const loadRaces = async () => {
      try {
        // Mock race data - in production, this would come from an API
        const mockRaces: HyroxRace[] = [
          {
            name: 'HYROX Singapore',
            location: 'Singapore',
            date: '2025-03-15',
            daysUntil: 100,
          },
          {
            name: 'HYROX London',
            location: 'London, UK',
            date: '2025-04-20',
            daysUntil: 136,
          },
          {
            name: 'HYROX New York',
            location: 'New York, USA',
            date: '2025-05-10',
            daysUntil: 156,
          },
          {
            name: 'HYROX Los Angeles',
            location: 'Los Angeles, USA',
            date: '2025-06-05',
            daysUntil: 182,
          },
        ];

        // Calculate days until for each race
        const today = new Date();
        const racesWithDays = mockRaces.map((race) => {
          const raceDate = new Date(race.date);
          const diffTime = raceDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ...race, daysUntil: diffDays };
        }).filter((race) => race.daysUntil > 0)
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 3);

        setUpcomingRaces(racesWithDays);
      } catch (err) {
        console.error('Failed to load races:', err);
        // Don't show error to user, just use empty array
        setUpcomingRaces([]);
      } finally {
        setLoadingRaces(false);
      }
    };

    loadRaces();
  }, []);

  const terminalSteps = [
    'User input received',
    'Connecting to NØDE AI systems...',
    'Generating workout structure & exercise selection...',
    'Running workout review & feasibility check...',
    'Optimizing tier progression & timing...',
    'Workout generation complete ✓',
  ];

  const nextRace = upcomingRaces[0];

  return (
    <div className="min-h-screen bg-dark text-text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-panel/20 to-dark" />
        <div 
          className="absolute top-16 left-1/4 w-[600px] h-[600px] bg-node-volt/12 blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-500/12 blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-node-volt/5 blur-3xl animate-pulse-slow" 
          style={{ transform: `translate(${-scrollY * 0.15}px, ${scrollY * 0.25}px)` }}
        />
      </div>

      {/* Parallax symbol */}
      <div 
        className="pointer-events-none fixed inset-0 flex items-center justify-center z-0"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="font-heading font-bold text-[55vh] text-text-white/5 leading-none select-none animate-fade-in-slow">
          Ø
        </div>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-overlay opacity-20 z-0" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b thin-border bg-dark/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo className="text-xl transition-transform hover:scale-105" />
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/"
              className="px-5 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
        data-animate
        id="hero"
      >
        <div className="absolute inset-0">
          <div className="grid-overlay" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`transition-all duration-1000 ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center gap-3 mb-8">
              <Icons.AI_BUILDER size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">AI Builder</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold leading-[0.95] tracking-tight drop-shadow-2xl mb-8">
              AI-Powered <span className="text-node-volt animate-glow">HYROX</span> Training
            </h1>
            <div className="flex items-start gap-6 mb-16">
              <div className="w-0.5 h-full bg-node-volt/60 flex-shrink-0 mt-1"></div>
              <p className="text-text-white text-base sm:text-lg max-w-lg font-body leading-loose">
                Generate personalized HYROX workouts tailored to your equipment, fitness level, and race goals. 
                Race-specific training that prepares you for competition day.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-node-volt text-black font-heading font-bold text-sm uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 shadow-[0_10px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_15px_50px_rgba(204,255,0,0.4)] hover:scale-105"
                style={{ color: '#000000' }}
              >
                Generate HYROX Workout
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 thin-border border-text-white/30 text-text-white font-heading font-bold text-sm uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Races Section */}
      {nextRace && (
        <section 
          id="races"
          className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
          data-animate
        >
          <div className="absolute inset-0 grid-overlay opacity-15" />
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div 
              className={`text-center mb-16 transition-all duration-1000 ${
                isVisible.races ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar size={32} className="text-node-volt animate-pulse-slow" />
                <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Upcoming Races</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">
                Are You Ready for <span className="text-node-volt">{nextRace.name}</span>?
              </h2>
              <p className="text-muted-text font-body text-lg leading-loose mb-12 max-w-2xl mx-auto">
                {nextRace.daysUntil} days until race day. Start your personalized HYROX training program today 
                and arrive at the start line fully prepared.
              </p>
              <div className="flex items-center justify-center gap-4 text-muted-text mb-12">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{nextRace.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(nextRace.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <Link
                href="/auth/register"
                className="inline-block px-10 py-5 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/30 text-lg"
                style={{ color: '#000000' }}
              >
                Start Training Now
              </Link>
            </div>

            {upcomingRaces.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                {upcomingRaces.slice(1).map((race, idx) => (
                  <div
                    key={race.name}
                    className={`bg-panel/50 thin-border rounded-lg p-6 hover:border-node-volt transition-all duration-300 ${
                      isVisible.races ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${(idx + 1) * 100}ms` }}
                  >
                    <h3 className="text-xl font-heading font-bold mb-2">{race.name}</h3>
                    <div className="flex items-center gap-2 text-muted-text text-sm mb-4">
                      <MapPin size={14} />
                      <span>{race.location}</span>
                    </div>
                    <div className="text-node-volt font-heading font-bold">
                      {race.daysUntil} days away
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* AI Builder Demo Section */}
      <section 
        id="ai-builder"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-12">
            <Icons.AI_BUILDER size={32} className="text-node-volt animate-pulse-slow" />
            <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">AI Builder</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-12">
            {/* Form Animation */}
            <div 
              className={`transition-all duration-1000 ${
                isVisible['ai-builder'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">
                Sessions in Seconds
              </h2>
              <p className="text-muted-text font-body text-lg leading-loose mb-16">
                Choose your equipment and training level, then let the AI create a personalized HYROX workout tailored to your needs.
              </p>
              <div className="bg-panel/50 thin-border rounded-lg p-6 mt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGenerate();
                  }}
                  className="space-y-6"
                >
                  {/* Training Level */}
                  <div>
                    <label className="block text-sm font-heading font-bold mb-4 text-node-volt uppercase tracking-[0.1em]">
                      Training Level
                    </label>
                    <select
                      value={formData.trainingLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, trainingLevel: e.target.value as any }))}
                      className="w-full bg-dark/80 thin-border rounded px-4 py-3 text-text-white font-body focus:border-node-volt focus:ring-2 focus:ring-node-volt/20 transition-all"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="ELITE">Elite</option>
                    </select>
                  </div>

                  {/* Equipment Selection */}
                  <div>
                    <label className="block text-sm font-heading font-bold mb-4 text-node-volt uppercase tracking-[0.1em]">
                      Equipment Available
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HYROX_EQUIPMENT.map((eq) => (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              equipment: prev.equipment.includes(eq)
                                ? prev.equipment.filter(e => e !== eq)
                                : [...prev.equipment, eq]
                            }));
                          }}
                          className={`px-3 py-2 text-sm font-body rounded thin-border transition-all ${
                            formData.equipment.includes(eq)
                              ? 'bg-node-volt text-black border-node-volt font-bold'
                              : 'bg-panel/50 text-text-white border-border hover:border-node-volt/50'
                          }`}
                        >
                          {eq.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-node-volt text-black font-heading font-bold py-3 rounded uppercase tracking-wider hover:bg-text-white transition-all duration-300"
                    style={{ color: '#000000' }}
                  >
                    Generate HYROX Workout
                  </button>
                </form>
              </div>
            </div>

            {/* Terminal Animation */}
            <div 
              className={`transition-all duration-1000 delay-300 ${
                isVisible['ai-builder'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="bg-panel/50 thin-border rounded-lg p-8 font-mono">
                <div className="flex items-center gap-2 mb-6">
                  <Zap size={24} className="text-node-volt" />
                  <h3 className="text-2xl font-heading font-bold">AI Generation Terminal</h3>
                </div>
                <div className="bg-dark/80 thin-border rounded p-6 space-y-3">
                  {terminalSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        idx <= terminalStep
                          ? 'opacity-100 text-node-volt'
                          : 'opacity-30 text-muted-text'
                      }`}
                    >
                      <span className="text-node-volt">
                        {idx < terminalStep ? '✓' : idx === terminalStep ? '▶' : '○'}
                      </span>
                      <span className="text-sm">{step}</span>
                      {idx === terminalStep && isAnimating && (
                        <span className="animate-pulse text-node-volt">...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deck Player Preview */}
      <section 
        id="deck-player"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div 
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible['deck-player'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Left Side - Text Content */}
            <div>
            <div className="flex items-center gap-3 mb-8">
              <Icons.SESSIONS size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Deck Player</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">
              Cinematic Training Experience
            </h2>
            <p className="text-muted-text font-body text-lg leading-loose">
                Experience your HYROX workouts in cinematic deck mode. Full-screen, distraction-free training with 
                clear tier prescriptions (Silver, Gold, Black) and smooth transitions between exercises.
              </p>
            </div>
            
            {/* Right Side - iPhone Container */}
            <div className="flex justify-center">
              <div className="relative scale-75">
                {/* iPhone Frame */}
                <div className="relative bg-zinc-900 rounded-[3rem] p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10"></div>
                  
                  {/* Screen */}
                  <div className="w-[375px] h-[812px] bg-dark-contrast rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 pt-2 z-20">
                      <div className="text-white text-xs font-bold">9:41</div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Deck Content */}
                    <div className="h-full flex flex-col pt-12">
                      {/* Header */}
                      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-800/50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Icons.HYROX size={16} className="text-node-volt" />
                            <div className="text-node-volt font-mono text-xl font-bold">HX-001</div>
                          </div>
                          <h3 className="text-base font-heading font-bold text-white">HYROX Race Prep</h3>
                        </div>
                        <div className="px-3 py-1.5 bg-node-volt/20 text-node-volt text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
                          <Footprints size={10} />
                          <span>HYROX MODE</span>
                        </div>
                      </div>
                      
                      {/* Training With Section */}
                      <div className="px-6 pt-4 pb-3 border-b border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Users size={14} className="text-zinc-400" />
                          <span className="text-xs text-zinc-400 uppercase tracking-wider font-heading">Training With</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {['Sarah M.', 'Mike T.', 'Emma L.'].map((name, idx) => (
                            <div key={idx} className="w-8 h-8 bg-node-volt/20 rounded-full flex items-center justify-center border border-node-volt/30">
                              <span className="text-[10px] font-bold text-node-volt">{name.split(' ')[0][0]}</span>
                            </div>
                          ))}
                          <div className="w-8 h-8 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
                            <span className="text-[10px] text-zinc-400">+2</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Deck Slide Preview */}
                      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                        <div className="flex items-center gap-3 mb-4">
                          <Timer size={20} className="text-node-volt" />
                          <div className="text-6xl font-heading font-bold text-node-volt">01</div>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                          <Footprints size={24} className="text-white" />
                          <h4 className="text-3xl font-heading font-bold text-white">1KM RUN</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full mb-6">
                          <div className="bg-zinc-800/80 thin-border rounded-lg p-3">
                            <div className="text-[9px] text-zinc-400 mb-1.5 uppercase font-heading flex items-center gap-1">
                              <Trophy size={8} />
                              <span>SILVER</span>
                            </div>
                            <div className="text-xl font-bold text-white">8:00</div>
                          </div>
                          <div className="bg-node-volt/20 thin-border border-node-volt rounded-lg p-3">
                            <div className="text-[9px] text-node-volt mb-1.5 uppercase font-heading font-bold flex items-center gap-1">
                              <Trophy size={8} />
                              <span>GOLD</span>
                            </div>
                            <div className="text-xl font-bold text-node-volt">7:30</div>
                          </div>
                          <div className="bg-zinc-900/80 thin-border rounded-lg p-3">
                            <div className="text-[9px] text-zinc-400 mb-1.5 uppercase font-heading flex items-center gap-1">
                              <Trophy size={8} />
                              <span>BLACK</span>
                            </div>
                            <div className="text-xl font-bold text-white">7:00</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Activity size={14} />
                          <span>Next: 1000m Ski Erg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Feature */}
      <section 
        id="network"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`space-y-6 transition-all duration-1000 ${
              isVisible.network ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-8">
              <Users size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Network</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">
              Train Together. Compete. Elevate.
            </h2>
            <p className="text-muted-text font-body text-lg leading-loose mb-12">
              Stay motivated and accountable through NØDE's powerful network features. Connect with training partners, 
              see real-time activity, and compete together—whether you're training in the same gym or remotely across the world.
            </p>
            
            <ul className="space-y-6 text-text-white font-body leading-loose mb-16">
              {[
                'Connect with training partners via QR code or search',
                'See real-time workout activity from your network',
                'Train together physically or remotely',
                'Compete on leaderboards and challenges',
                'Share workouts and programs instantly',
              ].map((line) => (
                <li key={line} className="flex items-start gap-4">
                  <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-0.5" />
                  <span className="leading-loose">{line}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Link
                href="/auth/register"
                className="inline-block px-8 py-4 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
                style={{ color: '#000000' }}
              >
                Join Network
              </Link>
            </div>
          </div>
          
          <div 
            className={`relative space-y-6 transition-all duration-1000 delay-300 ${
              isVisible.network ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-panel/80 backdrop-blur-md p-6 hover:border-node-volt transition-all duration-300">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading mb-4">
                <span>Network Activity</span>
                <span>Live Feed</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Sarah M.', action: 'completed HYROX Race Prep', time: '2m ago' },
                  { name: 'Mike T.', action: 'leveled up to Level 12', time: '5m ago' },
                  { name: 'Emma L.', action: 'started 1KM Run + Ski Erg', time: '8m ago' },
                  { name: 'Alex K.', action: 'shared a workout', time: '12m ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-panel/50 rounded">
                    <div className="w-8 h-8 bg-node-volt/20 rounded-full flex items-center justify-center">
                      <Users size={14} className="text-node-volt" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-heading font-bold">{activity.name}</div>
                      <div className="text-xs text-muted-text">{activity.action}</div>
                    </div>
                    <div className="text-xs text-muted-text">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* The Power of Community Motivation - moved below live feed */}
            <div className="bg-node-volt/10 thin-border border-node-volt/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Zap size={24} className="text-node-volt flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-heading font-bold mb-4 text-node-volt">
                    The Power of Community Motivation
                  </h4>
                  <p className="text-muted-text leading-loose">
                    Research shows that training with others—even virtually—increases motivation, consistency, and performance. 
                    When you see your network completing workouts, hitting PRs, and leveling up, it creates positive peer pressure 
                    that drives you to show up and push harder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Benefits */}
      <section 
        id="performance"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-12">
            <Target size={32} className="text-node-volt animate-pulse-slow" />
            <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Performance</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-16">
            Optimize Your HYROX Performance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            <div 
              className={`bg-panel/50 thin-border rounded-lg p-8 transition-all duration-1000 ${
                isVisible.performance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-node-volt" />
                <h3 className="text-2xl font-heading font-bold text-node-volt">
                  Race-Specific Training
                </h3>
              </div>
              <p className="text-muted-text leading-loose mb-8">
                Every workout mirrors HYROX race conditions. Running intervals combined with functional movements 
                build the exact fitness needed for race day.
              </p>
              <ul className="space-y-4 text-muted-text leading-loose">
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Running intervals matched to HYROX distances</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Functional movements in race order</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Work-to-rest ratios matching race pacing</span>
                </li>
              </ul>
            </div>

            <div 
              className={`bg-panel/50 thin-border rounded-lg p-8 transition-all duration-1000 delay-200 ${
                isVisible.performance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock size={24} className="text-node-volt" />
                <h3 className="text-2xl font-heading font-bold text-node-volt">
                  Personalized Progression
                </h3>
              </div>
              <p className="text-muted-text leading-loose mb-8">
                The AI adapts to your fitness level, creating workouts that challenge you appropriately. 
                Continuous progress toward your race goals.
              </p>
              <ul className="space-y-4 text-muted-text leading-loose">
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Beginner to elite-level sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Adaptive difficulty based on performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CHECK size={16} className="text-node-volt mt-0.5 flex-shrink-0" />
                  <span className="leading-loose">Progressive overload for improvement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10 overflow-hidden"
        data-animate
      >
        <div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="font-heading font-bold text-[40vh] text-text-white/5 leading-none select-none animate-fade-in-slow">
            Ø
          </div>
        </div>
        
        <div className="absolute inset-0 grid-overlay opacity-10 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
          <div 
            className={`transition-all duration-1000 ${
              isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-10">
              Ready to Transform Your <span className="text-node-volt">HYROX</span> Training?
            </h2>
            <p className="text-muted-text font-body text-lg leading-loose mb-12">
              Join NØDE and start generating personalized HYROX workouts today. Train smarter, compete harder, perform better.
            </p>
          </div>
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-300 ${
              isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Link
              href="/auth/register"
              className="px-10 py-4 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/30"
              style={{ color: '#000000' }}
            >
              Generate HYROX Workout
            </Link>
            <Link
              href="/auth/login"
              className="px-10 py-4 thin-border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border rounded-lg max-w-md w-full p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-heading font-bold">Ready to Generate Your Workout?</h3>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="p-2 hover:bg-panel/50 rounded transition-colors"
              >
                <X size={20} className="text-muted-text" />
              </button>
            </div>
            <p className="text-muted-text leading-loose">
              Sign up for NØDE to generate your personalized HYROX workout. Your form selections will be saved and you'll be redirected to the AI builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSignupAndRedirect}
                className="flex-1 px-6 py-3 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.2em] hover:bg-text-white transition-all duration-300"
                style={{ color: '#000000' }}
              >
                Sign Up & Generate
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="px-6 py-3 thin-border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.2em] hover:border-node-volt hover:text-node-volt transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
