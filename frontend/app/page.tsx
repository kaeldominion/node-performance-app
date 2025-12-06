'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { workoutsApi, gamificationApi, analyticsApi } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Icons } from '@/lib/iconMapping';
import { GenerationTerminal } from '@/components/workout/GenerationTerminal';
import { NetworkActivityFeed } from '@/components/landing/NetworkActivityFeed';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Calendar, BarChart3, Monitor, ArrowUp, ArrowDown } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({ hero: true });
  const [xpStats, setXpStats] = useState<any>(null);
  const [percentiles, setPercentiles] = useState<any>(null);
  const [monthTrends, setMonthTrends] = useState<any>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
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

  useEffect(() => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      return;
    }

    // Load XP stats and percentiles if signed in
    if (isSignedIn) {
      const loadXpStats = async () => {
        try {
          const stats = await gamificationApi.getStats();
          setXpStats(stats);
        } catch (err) {
          console.error('Failed to load XP stats:', err);
        }
      };
      loadXpStats();

      const loadPercentiles = async () => {
        try {
          const percentilesData = await analyticsApi.getPercentiles();
          setPercentiles(percentilesData);
        } catch (err: any) {
          // Silently fail - percentiles are optional data
          // Only log in development if it's not a 404 (endpoint doesn't exist)
          if (process.env.NODE_ENV === 'development' && err?.response?.status !== 404) {
            console.debug('Percentiles endpoint not available:', err?.response?.status || 'network error');
          }
          setPercentiles(null);
        }
      };
      loadPercentiles();

      const loadMonthTrends = async () => {
        try {
          const trendsData = await analyticsApi.getMonthTrends();
          setMonthTrends(trendsData);
        } catch (err) {
          console.error('Failed to load month trends:', err);
        }
      };
      loadMonthTrends();
    }

    // Use Clerk's isSignedIn as source of truth - redirect if signed in
    if (isSignedIn && !redirecting) {
      setRedirecting(true);
      // Use replace instead of push to avoid adding to history
      router.replace('/dashboard');
    }
  }, [isSignedIn, clerkLoaded, router, redirecting]);

  useEffect(() => {
    // Load recommended workouts for display - wrapped in try/catch to prevent crashes
    const loadRecommended = async () => {
      try {
        const workouts = await workoutsApi.getRecommended();
        if (Array.isArray(workouts)) {
          setRecommendedWorkouts(workouts.slice(0, 3)); // Show top 3
        }
      } catch (err) {
        console.error('Failed to load recommended workouts:', err);
        // Don't show error to user, just don't display recommended section
        setRecommendedWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    
    // Only load if not redirecting
    if (!redirecting) {
      loadRecommended();
    }
  }, [redirecting]);

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

      {/* Top nav */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 border-b thin-border transition-all duration-300 ${
          scrollY > 50 ? 'bg-dark/95 backdrop-blur-lg shadow-lg shadow-node-volt/10' : 'bg-dark/90 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo className="text-xl transition-transform hover:scale-105" />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-text uppercase tracking-[0.2em]">
            <a href="#platform" className="hover:text-node-volt transition-all duration-300 hover:scale-110">Platform</a>
            <a href="#player" className="hover:text-node-volt transition-all duration-300 hover:scale-110">Player</a>
            <a href="#analytics" className="hover:text-node-volt transition-all duration-300 hover:scale-110">Analytics</a>
            <a href="#ai" className="hover:text-node-volt transition-all duration-300 hover:scale-110">AI</a>
            <a href="#network" className="hover:text-node-volt transition-all duration-300 hover:scale-110">Network</a>
            <a href="#scheduler" className="hover:text-node-volt transition-all duration-300 hover:scale-110">Scheduler</a>
            <a href="#hyrox" className="hover:text-node-volt transition-all duration-300 hover:scale-110">HYROX</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {clerkLoaded && (
              isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  className="px-5 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
                >
                  Join
                </Link>
              )
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
        data-animate
        id="hero"
      >
        <div className="absolute inset-0">
          <div className="grid-overlay" />
        </div>

        {/* Experience Level - Top Right */}
        {isSignedIn && xpStats && (
          <div className="absolute top-24 right-4 sm:right-8 z-20">
            <div className="bg-panel/90 backdrop-blur-sm thin-border border-node-volt/30 p-3 sm:p-4 min-w-[180px] sm:min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs text-muted-text uppercase tracking-[0.2em] font-heading">Level</span>
                <span className="text-lg sm:text-xl font-heading font-bold text-node-volt">{xpStats.level}</span>
              </div>
              {xpStats.levelName && (
                <div className="text-[10px] sm:text-xs text-muted-text mb-2 truncate">{xpStats.levelName}</div>
              )}
              {xpStats.progress && (
                <div className="w-full h-1.5 bg-dark/50 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-node-volt to-node-volt/70 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.round((xpStats.progress.progress || 0) * 100)}%` }}
                  />
                </div>
              )}
              {xpStats.xpToNextLevel && (
                <div className="text-[9px] sm:text-[10px] text-node-volt font-bold text-right">
                  {xpStats.xpToNextLevel.toLocaleString()} XP to next
                </div>
              )}
            </div>
          </div>
        )}

        <div 
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div 
            className={`space-y-8 max-w-3xl transition-all duration-1000 ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 thin-border border-node-volt/40 bg-node-volt/10 backdrop-blur-sm animate-fade-in">
              <span className="w-2 h-2 bg-node-volt animate-pulse" />
              <span className="text-[11px] font-heading text-node-volt uppercase tracking-[0.3em]">NØDE OS</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold leading-[0.95] tracking-tight drop-shadow-2xl mb-6">
              BUILDING INFRASTRUCTURE FOR HUMAN <span className="text-node-volt animate-glow">OPTIMIZATION.</span>
            </h1>
            <div className="flex items-start gap-6 mb-10">
              <div className="w-[2px] self-stretch bg-node-volt flex-shrink-0"></div>
              <p className="text-text-white text-base sm:text-lg max-w-lg font-body leading-[2.2]">
                A brutalist training stack for strength, engine, and recovery. Cinematic player, deep analytics, and AI-built sessions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/register"
                className="px-8 py-4 bg-node-volt text-black font-heading font-bold text-sm uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 shadow-[0_10px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_15px_50px_rgba(204,255,0,0.4)] hover:scale-105"
                style={{ color: '#000000' }}
            >
              Start Training
            </Link>
            <button
                onClick={() => {
                  platformRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-8 py-4 thin-border border-text-white/30 text-text-white font-heading font-bold text-sm uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 backdrop-blur-sm bg-panel/30 hover:scale-105"
            >
                Explore Platform
            </button>
          </div>
        </div>

          <div 
            className={`hidden lg:block relative transition-all duration-1000 delay-300 max-w-md ml-auto ${
              isVisible.hero ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{ marginLeft: '4rem' }}
          >
            <div className="absolute -inset-6 bg-node-volt/15 blur-3xl opacity-30 animate-pulse-slow" />
            <AIGeneratorPreview />
          </div>
        </div>
      </section>

      {/* Platform & Archetypes */}
      <section 
        ref={platformRef}
        id="platform" 
        className="relative min-h-screen flex items-center py-32 bg-dark/80 backdrop-blur-sm border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div 
            className={`mb-16 max-w-3xl transition-all duration-1000 ${
              isVisible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Monitor size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">THE NØDE STACK</h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-8">
              Brutalist surfaces, volt highlights, and grid overlays. Every module is built for clarity and intent: train, track, iterate.
            </p>
          </div>

          {/* Stack Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: 'Deck Mode',
                desc: 'Full-screen timer, cues, and section progress. Zero distractions.',
                icon: <Monitor size={24} className="text-node-volt" />,
                delay: 0,
              },
              {
                title: 'Analytics',
                desc: 'RPE, tonnage, pace, and adherence across cycles with clean visuals.',
                icon: <BarChart3 size={24} className="text-node-volt" />,
                delay: 200,
              },
              {
                title: 'AI Builder',
                desc: 'Archetype-aware sessions with equipment filters and fast iterations.',
                icon: <Icons.AI_BUILDER size={24} className="text-node-volt" />,
                delay: 400,
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`group relative bg-panel thin-border p-8 hover:border-node-volt transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20 ${
                  isVisible.platform 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${item.delay || idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-node-volt/0 via-node-volt/5 to-node-volt/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-between mb-6">
                  <div className="w-12 h-12 thin-border flex items-center justify-center group-hover:border-node-volt transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-text font-heading">0{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt">{item.title}</h3>
                <p className="text-sm text-text-white leading-relaxed font-body">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Archetypes Section */}
          <div 
            className={`mb-8 transition-all duration-1000 ${
              isVisible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Training System</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold">Six Core Archetypes</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { name: 'PR1ME', desc: 'Primary Strength', Icon: Icons.PR1ME },
              { name: 'FORGE', desc: 'Strength Supersets', Icon: Icons.FORGE },
              { name: 'ENGIN3', desc: 'Hybrid EMOM', Icon: Icons.ENGIN3 },
              { name: 'CIRCUIT_X', desc: 'Anaerobic MetCon', Icon: Icons.CIRCUIT_X },
              { name: 'CAPAC1TY', desc: 'Long Engine', Icon: Icons.CAPAC1TY },
              { name: 'FLOWSTATE', desc: 'Recovery Flow', Icon: Icons.FLOWSTATE },
            ].map((archetype, idx) => (
              <div
                key={archetype.name}
                className={`bg-panel thin-border p-3 hover:border-node-volt transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20 ${
                  isVisible.platform 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${600 + idx * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <archetype.Icon size={24} className="text-node-volt" />
                  <div>
                    <h3 className="text-sm font-heading font-bold text-node-volt mb-1">{archetype.name}</h3>
                    <p className="text-xs text-muted-text font-body leading-tight">{archetype.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/archetypes"
              className="inline-block px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
            >
              Learn More About Archetypes
            </Link>
          </div>
        </div>
      </section>

      {/* Player Section */}
      <section 
        id="player" 
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`relative order-2 lg:order-1 transition-all duration-1000 ${
              isVisible.player ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-dark backdrop-blur-md overflow-hidden hover:border-node-volt transition-all duration-300">
              {/* Deck Mode Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b thin-border bg-panel/50">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-text uppercase tracking-[0.25em] font-heading">Deck Mode</div>
                  <div className="text-[10px] text-node-volt font-mono">NØDE-001</div>
                </div>
                <div className="text-xs text-muted-text font-heading">2 / 5</div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 bg-panel/50">
                <div className="h-full bg-node-volt" style={{ width: '40%' }} />
              </div>

              {/* Deck Content - EMOM Preview */}
              <div className="min-h-[500px] max-h-[600px] bg-dark p-4 sm:p-6 flex flex-col items-center justify-between overflow-hidden">
                {/* Section Title */}
                <div className="text-center space-y-1 mt-4">
                  <h3 className="text-3xl sm:text-4xl font-heading font-bold text-text-white">EMOM × 12</h3>
                  <p className="text-muted-text text-xs sm:text-sm">45s work : 15s rest</p>
                </div>

                {/* Timer Display */}
                <div className="relative my-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 thin-border border-node-volt rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-heading font-bold text-node-volt">45</div>
                      <div className="text-[10px] sm:text-xs text-muted-text mt-1">WORK</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-node-volt rounded-full animate-pulse" />
                </div>

                {/* Exercise Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md px-2 flex-1 flex items-center">
                  {[
                    { label: '01', name: 'DB Bench Press', reps: '8-10' },
                    { label: '02', name: 'Pull-ups', reps: '5-8' },
                    { label: '03', name: 'KB Swings', reps: '15' },
                    { label: '04', name: 'BikeErg', reps: '12 cal' },
                  ].map((ex) => (
                    <div key={ex.label} className="bg-panel/50 thin-border p-3 sm:p-4 hover:border-node-volt transition-colors">
                      <div className="text-node-volt font-mono text-lg sm:text-xl font-bold mb-1">{ex.label}</div>
                      <div className="text-text-white font-heading font-bold text-xs sm:text-sm mb-1 leading-tight">{ex.name}</div>
                      <div className="text-node-volt text-[10px] sm:text-xs">{ex.reps}</div>
                    </div>
                  ))}
                </div>

                {/* Tier Badges */}
                <div className="flex gap-2 mb-4">
                  <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-zinc-700 text-white text-[10px] sm:text-xs font-bold rounded">SLV: 8</div>
                  <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-600 text-black text-[10px] sm:text-xs font-bold rounded">GLD: 10</div>
                  <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-black border border-zinc-700 text-white text-[10px] sm:text-xs font-bold rounded">BLK: 12</div>
                </div>
              </div>
            </div>
          </div>
          <div 
            className={`space-y-8 order-1 lg:order-2 transition-all duration-1000 delay-300 ${
              isVisible.player ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Monitor size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Immersive Player</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">Full-Screen Workout Player</h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-6">
              Built for IRL sessions: large typography, clean cues, and quick controls. Deck mode keeps you in flow while tracking every section.
            </p>
            <ul className="space-y-4 text-text-white font-body leading-[2.0] mb-8">
              {['Timers & cues tuned for EMOM/AMRAP/Intervals', 'Keyboard shortcuts and quick-jump sections', 'Deck overlay for gym displays'].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-1" />
                  <span>{line}</span>
                </li>
              ))}
              </ul>
            <div className="mt-6">
              <Link
                href="/auth/register"
                className="inline-block px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
              >
                Try Deck Mode
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section 
        id="analytics" 
        className="relative min-h-screen flex items-center py-32 bg-dark/80 backdrop-blur-sm border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`space-y-8 transition-all duration-1000 ${
              isVisible.analytics ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Analytics</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">Measurable Progress</h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-6">
              Volume, RPE distribution, section pacing, and completion rates. Clean visuals with volt highlights for what matters.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  label: 'Completion', 
                  value: '92%',
                  percentileKey: 'completionRate',
                  trendKey: 'completionRate',
                  demoPercentile: 5,
                  demoTrend: 12,
                },
                { 
                  label: 'Avg RPE', 
                  value: '7.8',
                  percentileKey: 'avgRPE',
                  trendKey: 'avgRPE',
                  demoPercentile: 12,
                  demoTrend: -5,
                },
                { 
                  label: 'Sessions/Wk', 
                  value: '4.2',
                  percentileKey: 'sessionsPerWeek',
                  trendKey: 'sessionsPerWeek',
                  demoPercentile: 8,
                  demoTrend: 18,
                },
                { 
                  label: 'PRs This Cycle', 
                  value: '12',
                  percentileKey: 'prCount',
                  trendKey: 'prCount',
                  demoPercentile: 15,
                  demoTrend: 25,
                },
              ].map((stat) => {
                const percentile = percentiles?.[stat.percentileKey] ?? stat.demoPercentile;
                const trend = monthTrends?.[stat.trendKey] ?? stat.demoTrend;
                const isPositive = trend !== null && trend > 0;
                const isNegative = trend !== null && trend < 0;
                
                return (
                  <div key={stat.label} className="p-4 thin-border bg-panel/80">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-text font-heading">{stat.label}</p>
                    <p className="text-2xl font-heading font-bold text-text-white mb-2">{stat.value}</p>
                    {percentile !== null && (
                      <p className="text-sm font-heading font-bold text-node-volt mb-2">
                        Top {percentile}% of NØDE NETWORK
                      </p>
                    )}
                    {trend !== null && (
                      <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                        {isPositive && (
                          <>
                            <ArrowUp size={14} className="text-node-volt" />
                            <span className="text-node-volt">+{Math.abs(trend)}%</span>
                          </>
                        )}
                        {isNegative && (
                          <>
                            <ArrowDown size={14} className="text-node-volt" />
                            <span className="text-node-volt">{trend}%</span>
                          </>
                        )}
                        {!isPositive && !isNegative && trend === 0 && (
                          <span className="text-muted-text">No change</span>
                        )}
                        <span className="text-muted-text text-xs ml-1">vs last month</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible.analytics ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-blue-500/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-panel/80 p-6 space-y-4 hover:border-node-volt transition-all duration-300">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading">
                <span>Analytics</span>
                <span>Cycle</span>
            </div>
              <div className="h-56 bg-gradient-to-b from-panel to-dark thin-border flex items-end gap-2 p-4">
                {[50, 70, 90, 60, 80, 65].map((h, idx) => (
                  <div key={idx} className="flex-1 bg-node-volt/60" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-text font-body">Visualize workload, intensity, and adherence over each block.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI */}
      <section 
        id="ai" 
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-25" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`relative order-2 lg:order-1 transition-all duration-1000 ${
              isVisible.ai ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-panel/80 p-6 space-y-4 hover:border-node-volt transition-all duration-300">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading">
                <span>AI Builder</span>
                <span>Archetypes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'PR1ME', Icon: Icons.PR1ME },
                  { name: 'ENGIN3', Icon: Icons.ENGIN3 },
                  { name: 'FORGE', Icon: Icons.FORGE },
                  { name: 'FLOWSTATE', Icon: Icons.FLOWSTATE },
                ].map((item) => (
                  <div key={item.name} className="p-4 thin-border bg-dark/80 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <item.Icon size={20} className="text-node-volt" />
                      <p className="font-heading font-bold text-text-white">{item.name}</p>
                    </div>
                    <p className="text-[11px] text-muted-text uppercase tracking-[0.2em] font-heading">Preset</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-text font-body">Prompt-aware, equipment-aware, and archetype-aware. Generate clean sessions in seconds.</p>
            </div>
          </div>
          <div 
            className={`space-y-8 order-1 lg:order-2 transition-all duration-1000 delay-300 ${
              isVisible.ai ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icons.AI_BUILDER size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">AI Builder</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">Sessions in Seconds</h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-6">
              Choose an archetype, set equipment and time, and let the builder create balanced work with clear prescriptions.
            </p>
            <ul className="space-y-4 text-text-white font-body leading-[2.0]">
              {['Archetype presets tuned to strength/engine blends', 'Equipment filters for gym / home / travel', 'HYROX-style 90-minute conditioning sessions', 'Instant edit and regenerate flows', 'NØDE-approved curated workouts ready to use instantly'].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-1" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="/auth/register"
                className="inline-block px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
              >
                Build with AI
              </Link>
              <Link
                href="/recommended"
                className="inline-block px-8 py-4 bg-panel/50 thin-border border-border-dark text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 hover:scale-105"
              >
                Browse Recommended
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Network */}
      <section 
        id="network" 
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10 overflow-hidden"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`space-y-6 transition-all duration-1000 ${
              isVisible.network ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icons.USERS size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Network</span>
            </div>
             <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">Connect. Compete. Elevate.</h2>
             <p className="text-muted-text font-body text-lg leading-[2.2] mb-8">
               Build your training network. See what your connections are doing, share progress, and stay motivated through community accountability.
             </p>
 
             <ul className="space-y-4 text-text-white font-body leading-[2.0] mb-8">
              {[
                'Connect with training partners via QR code or search',
                'See real-time workout activity from your network',
                'Share workouts and programs instantly',
                'Compete on leaderboards and challenges',
               ].map((line) => (
                 <li key={line} className="flex items-start gap-3">
                   <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-1" />
                   <span>{line}</span>
                 </li>
               ))}
             </ul>
             <div className="flex flex-col sm:flex-row gap-4 mt-8">
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
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible.network ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-panel/80 backdrop-blur-md p-6 hover:border-node-volt transition-all duration-300">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading mb-4">
                <span>Network Activity</span>
                <span>Live Feed</span>
              </div>
              <NetworkActivityFeed />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-text">
                  <div className="w-2 h-2 bg-node-volt rounded-full animate-pulse" />
                  <span>Real-time updates from your network</span>
                </div>
                <p className="text-sm text-muted-text font-body">
                  See when others complete workouts, level up, or connect with new members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduler Section */}
      <section 
        id="scheduler" 
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`space-y-8 transition-all duration-1000 ${
              isVisible.scheduler ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={32} className="text-node-volt animate-pulse-slow" />
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Workout Scheduler</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">Plan Your Training</h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-6">
              Calendar-based scheduling with drag-and-drop. Schedule individual workouts or entire programs. Visual planning for consistent training blocks.
            </p>
            <ul className="space-y-4 text-text-white font-body leading-[2.0]">
              {[
                'Drag-and-drop workouts to any date',
                'Schedule entire programs with one click',
                'Visual calendar view of your training plan',
                'Track completion and adherence',
                'Set times and notes for each session',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-1" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/auth/register"
                className="inline-block px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
              >
                Start Scheduling
              </Link>
            </div>
          </div>
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible.scheduler ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
            <div className="relative thin-border bg-panel/80 backdrop-blur-md p-6 space-y-4 hover:border-node-volt transition-all duration-300">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading">
                <span>Calendar View</span>
                <span>This Month</span>
              </div>
              <div className="space-y-2">
                {/* Calendar Preview */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] text-muted-text font-heading p-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }, (_, i) => {
                    const day = i + 1;
                    const hasWorkout = day % 7 === 0 || day % 11 === 0;
                    const isToday = day === new Date().getDate();
                    return (
                      <div
                        key={day}
                        className={`aspect-square p-1 text-[10px] ${
                          isToday
                            ? 'bg-node-volt/20 border border-node-volt'
                            : hasWorkout
                            ? 'bg-node-volt/10'
                            : 'bg-dark/40'
                        }`}
                      >
                        <div className={`text-center ${isToday ? 'text-node-volt font-bold' : 'text-muted-text'}`}>
                          {day}
                        </div>
                        {hasWorkout && (
                          <div className="w-full h-1 bg-node-volt/40 mt-0.5 rounded" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t thin-border">
                <div className="flex items-center gap-2 text-xs text-muted-text">
                  <div className="w-2 h-2 bg-node-volt/40 rounded" />
                  <span>Scheduled workout</span>
                </div>
              </div>
              <p className="text-sm text-muted-text font-body">
                Plan weeks and months ahead. Drag workouts between dates, schedule programs, and track your training calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Workouts */}
      {recommendedWorkouts.length > 0 && (
        <section 
          id="recommended" 
          className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
          data-animate
        >
          <div className="absolute inset-0 grid-overlay opacity-15" />
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div 
              className={`text-center mb-20 transition-all duration-1000 ${
                isVisible.recommended ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading block mb-4">Curated Sessions</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">Recommended Workouts</h2>
              <p className="text-muted-text font-body max-w-2xl mx-auto text-lg leading-[2.2]">
                Hand-picked sessions from our team. Proven, effective workouts ready to use instantly—no AI generation needed.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {recommendedWorkouts.map((workout, idx) => (
                <Link
                  key={workout.id}
                  href={`/workouts/${workout.id}`}
                  className={`group bg-panel thin-border p-6 hover:border-node-volt transition-all duration-500 hover:shadow-lg hover:shadow-node-volt/20 hover:scale-105 ${
                    isVisible.recommended 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {workout.displayCode && (
                        <div className="text-node-volt font-mono text-sm mb-1">
                          {workout.displayCode}
                        </div>
                      )}
                      <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
                        {workout.name}
                      </h3>
                      {workout.archetype && (
                        <span className="inline-block px-2 py-1 bg-node-volt/20 text-node-volt text-xs rounded mb-2">
                          {workout.archetype}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-text group-hover:text-node-volt transition-colors">→</span>
                  </div>
                  {workout.description && (
                    <p className="text-muted-text text-sm mb-4 line-clamp-2">
                      {workout.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-text">
                    <span>{workout.sections?.length || 0} sections</span>
                    <span className="text-node-volt font-semibold">Start →</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/workouts/recommended"
                className="inline-block px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
              >
                View All Recommended
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* HYROX Support */}
      <section 
        id="hyrox" 
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10"
        data-animate
      >
        <div className="absolute inset-0 grid-overlay opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div 
              className={`space-y-8 transition-all duration-1000 ${
                isVisible.hyrox ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icons.HYROX size={32} className="text-node-volt animate-pulse-slow" />
                <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">HYROX Support</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">90-Minute Conditioning Sessions</h2>
              <p className="text-muted-text font-body text-lg leading-[2.2] mb-8">
                Full HYROX-style workout generation with 80-90 minute sessions. Perfect for endurance athletes and HYROX competitors.
              </p>
              <ul className="space-y-3 text-text-white font-body leading-[2.0] mb-8">
                {[
                  'Classic HYROX simulations (6-8 rounds)',
                  'Threshold engine intervals (10+ rounds)',
                  'All HYROX stations included',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <Icons.CHECK size={20} className="text-node-volt flex-shrink-0 mt-1" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/auth/register"
                  className="inline-block px-8 py-4 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
                style={{ color: '#000000' }}
                >
                  Generate HYROX Workout
                </Link>
                <Link
                  href="/hyrox-ai-builder"
                  className="inline-block px-8 py-4 thin-border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div 
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible.hyrox ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="absolute -inset-6 bg-node-volt/10 blur-3xl opacity-30 animate-pulse-slow" />
              <div className="relative thin-border bg-panel/80 backdrop-blur-md p-6 space-y-4 hover:border-node-volt transition-all duration-300">
                <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em] font-heading">
                  <span>HYROX Session</span>
                  <span>90 Minutes</span>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-dark/80 thin-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold text-text-white">6 Rounds</span>
                      <span className="text-node-volt text-sm">For Time</span>
                    </div>
                    <div className="text-xs text-muted-text space-y-1">
                      <div>• Run 800m / Bike 4-5 min</div>
                      <div>• SkiErg 600-800m</div>
                      <div>• Sled Push 20-30m</div>
                      <div>• Sled Pull 20-30m</div>
                      <div>• Burpee Broad Jumps 40m</div>
                      <div>• Row 600-800m</div>
                      <div>• Farmers Carry 100m</div>
                    </div>
                  </div>
                  <div className="p-4 bg-dark/80 thin-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold text-text-white">EMOM × 80</span>
                      <span className="text-node-volt text-sm">Rotating Stations</span>
                    </div>
                    <div className="text-xs text-muted-text">
                      Sustained 80-minute engine work with 8-station rotation
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-text font-body">
                  Full HYROX race simulation with all stations, pacing strategies, and partner formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section 
        id="cta"
        className="relative min-h-screen flex items-center py-32 bg-transparent border-t thin-border px-4 sm:px-6 lg:px-8 z-10 overflow-hidden"
        data-animate
      >
        {/* Large Ø Background */}
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-8">
              ACCESS <span className="text-node-volt">NØDE</span> OS
            </h2>
            <p className="text-muted-text font-body text-lg leading-[2.2] mb-12">
              Train with brutalist clarity. Volt highlights. Cinematic player. Analytics and AI built for lifters and coaches.
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
              Start Now
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

      {/* Footer */}
      <footer className="bg-dark border-t thin-border py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-node-volt text-black font-heading font-bold text-sm flex items-center justify-center" style={{ color: '#000000' }}>
              Ø
            </div>
            <span className="font-heading font-bold text-lg">NØDE</span>
            </div>
          <div className="flex gap-6 text-sm text-muted-text font-body">
            <Link href="/programs" className="hover:text-node-volt transition-colors">Programs</Link>
            <Link href="/archetypes" className="hover:text-node-volt transition-colors">Archetypes</Link>
            <Link href="/progress" className="hover:text-node-volt transition-colors">Progress</Link>
            <Link href="/gym" className="hover:text-node-volt transition-colors">Gyms</Link>
          </div>
          <div className="text-sm text-muted-text font-body">
            © {new Date().getFullYear()} NØDE OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// AI Generator Preview Component for Landing Page
function AIGeneratorPreview() {
  const [phase, setPhase] = useState<'form' | 'generating' | 'reviewing' | 'complete'>('form');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['dumbbells', 'barbell']);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('PR1ME');
  const [selectedGoal, setSelectedGoal] = useState<string>('HYBRID');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    // Auto-cycle through phases: form -> generating -> reviewing -> complete -> form
    const phases: Array<'form' | 'generating' | 'reviewing' | 'complete'> = ['form', 'generating', 'reviewing', 'complete'];
    let currentPhaseIndex = 0;

    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      const newPhase = phases[currentPhaseIndex];
      setPhase(newPhase);

      if (newPhase === 'form') {
        setIsGenerating(false);
        setIsReviewing(false);
        // Randomize selections for variety
        const equipmentOptions = ['dumbbells', 'barbell', 'kettlebell', 'rower', 'bike_erg', 'rings'];
        const archetypes = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X'];
        const goals = ['HYBRID', 'STRENGTH', 'CONDITIONING'];
        setSelectedEquipment([
          equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)],
          equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)],
        ].filter((v, i, a) => a.indexOf(v) === i));
        setSelectedArchetype(archetypes[Math.floor(Math.random() * archetypes.length)]);
        setSelectedGoal(goals[Math.floor(Math.random() * goals.length)]);
      } else if (newPhase === 'generating') {
        setIsGenerating(true);
        setIsReviewing(false);
      } else if (newPhase === 'reviewing') {
        setIsGenerating(false);
        setIsReviewing(true);
      } else {
        setIsGenerating(false);
        setIsReviewing(false);
      }
    }, 6000); // Change phase every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const equipmentLabels: Record<string, string> = {
    'dumbbells': 'Dumbbells',
    'barbell': 'Barbell',
    'kettlebell': 'Kettlebell',
    'rower': 'Rower',
    'bike_erg': 'BikeErg',
    'rings': 'Rings',
  };

  const goalIcons: Record<string, any> = {
    'HYBRID': Icons.GOAL_HYBRID,
    'STRENGTH': Icons.GOAL_STRENGTH,
    'CONDITIONING': Icons.GOAL_CONDITIONING,
  };

  const archetypeIcons: Record<string, any> = {
    'PR1ME': Icons.PR1ME,
    'FORGE': Icons.FORGE,
    'ENGIN3': Icons.ENGIN3,
    'CIRCUIT_X': Icons.CIRCUIT_X,
  };

  return (
    <div className="relative thin-border bg-panel/80 backdrop-blur-md p-5 space-y-3 hover:border-node-volt transition-all duration-300">
      <div className="flex justify-between items-start border-b thin-border pb-3 mb-3">
        <div>
          <p className="text-[10px] text-muted-text uppercase tracking-[0.25em] mb-1">AI Workout Builder</p>
          <p className="font-heading text-sm text-node-volt">
            {phase === 'form' ? 'Configure Workout' : phase === 'generating' ? 'Generating...' : phase === 'reviewing' ? 'Reviewing...' : 'Ready'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-text uppercase tracking-[0.25em] mb-1">Status</p>
          <p className="font-heading text-sm text-text-white">
            {phase === 'form' ? 'Setup' : phase === 'generating' ? 'Processing' : phase === 'reviewing' ? 'Optimizing' : 'Complete'}
          </p>
        </div>
      </div>

      {/* Form Phase */}
      {phase === 'form' && (
        <div className="space-y-3 animate-fade-in">
          {/* Goal Selection */}
          <div>
            <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-2 block">Primary Goal</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['HYBRID', 'STRENGTH', 'CONDITIONING'].map((goal) => {
                const Icon = goalIcons[goal];
                return (
                  <button
                    key={goal}
                    className={`px-2 py-2 text-[10px] font-heading font-bold transition-all flex items-center justify-center gap-1 ${
                      selectedGoal === goal
                        ? 'bg-node-volt text-black'
                        : 'bg-dark/80 thin-border text-text-white'
                    }`}
                  >
                    {Icon && <Icon size={14} className={selectedGoal === goal ? 'text-dark' : 'text-node-volt'} />}
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Archetype Selection */}
          <div>
            <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-2 block">Archetype</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X'].map((arch) => {
                const Icon = archetypeIcons[arch];
                return (
                  <button
                    key={arch}
                    className={`px-2 py-2 text-[10px] font-heading font-bold transition-all flex items-center justify-center gap-1 ${
                      selectedArchetype === arch
                        ? 'bg-node-volt text-black border-node-volt'
                        : 'bg-dark/80 thin-border text-text-white'
                    }`}
                  >
                    {Icon && <Icon size={14} className={selectedArchetype === arch ? 'text-black' : 'text-node-volt'} style={selectedArchetype === arch ? { color: '#000000' } : undefined} />}
                    <span>{arch}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-2 block">Equipment</label>
            <div className="flex flex-wrap gap-1.5">
              {selectedEquipment.map((eq) => (
                <div
                  key={eq}
                  className="px-2 py-1 bg-node-volt/20 border border-node-volt/50 text-node-volt text-[10px] font-heading font-bold"
                >
                  {equipmentLabels[eq] || eq}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button className="w-full bg-node-volt text-black font-heading font-bold text-[10px] uppercase tracking-[0.2em] py-2.5 hover:bg-text-white transition-all flex items-center justify-center gap-2" style={{ color: '#000000' }}>
            <Icons.AI_BUILDER size={14} />
            <span>Generate Workout</span>
          </button>
        </div>
      )}

      {/* Terminal Phase (Generating/Reviewing) */}
      {(phase === 'generating' || phase === 'reviewing') && (
        <div className="space-y-3 animate-fade-in">
          <GenerationTerminal
            isGenerating={isGenerating}
            isReviewing={isReviewing}
            error={null}
            workoutReady={false}
            onComplete={() => {}}
          />
        </div>
      )}

      {/* Complete Phase */}
      {phase === 'complete' && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-dark/80 thin-border">
              <h3 className="text-lg font-heading font-bold text-node-volt">AI-Powered</h3>
              <p className="text-[10px] text-muted-text uppercase mt-1">GPT-4o Engine</p>
            </div>
            <div className="p-3 bg-dark/80 thin-border">
              <h3 className="text-lg font-heading font-bold text-text-white">Archetypes</h3>
              <p className="text-[10px] text-muted-text uppercase mt-1">6 Core Types</p>
            </div>
          </div>
          <div className="p-3 bg-dark/80 thin-border text-center">
            <p className="text-xs text-muted-text uppercase tracking-[0.2em] mb-1">Workout Generated</p>
            <Link
              href="/ai/workout-builder"
              className="text-node-volt font-heading font-bold text-sm hover:underline"
            >
              Try It Now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
