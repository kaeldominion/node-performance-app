'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [maxLoadingReached, setMaxLoadingReached] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxLoadingReached(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
  const shouldShowLoading = authLoading && hasToken && !maxLoadingReached && !user;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text font-body">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-deep-asphalt text-text-white relative overflow-hidden">
      {/* Parallax symbol */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="font-heading font-bold text-[55vh] text-text-white/5 leading-none select-none">
          Ø
        </div>
      </div>

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-asphalt/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-node-volt text-deep-asphalt font-heading font-bold text-lg flex items-center justify-center rounded">
              Ø
            </div>
            <span className="font-heading font-bold tracking-tight text-xl">NØDE</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-text uppercase tracking-[0.2em]">
            <a href="#platform" className="hover:text-node-volt transition-colors">Platform</a>
            <a href="#player" className="hover:text-node-volt transition-colors">Player</a>
            <a href="#analytics" className="hover:text-node-volt transition-colors">Analytics</a>
            <a href="#ai" className="hover:text-node-volt transition-colors">AI</a>
          </div>
          <Link
            href="/auth/register"
            className="hidden md:inline-block px-5 py-2 border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-deep-asphalt transition-colors"
          >
            Join
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-deep-asphalt via-concrete-grey/20 to-deep-asphalt" />
          <div className="absolute top-16 left-1/4 w-[600px] h-[600px] bg-node-volt/12 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-500/12 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-node-volt/40 rounded-full bg-node-volt/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-node-volt animate-pulse" />
              <span className="text-[11px] font-heading text-node-volt uppercase tracking-[0.3em]">Performance OS</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-7xl font-heading font-bold leading-[0.95] tracking-tight drop-shadow-2xl">
              BUILDING INFRASTRUCTURE FOR HUMAN <span className="text-node-volt">OPTIMIZATION.</span>
            </h1>
            <p className="text-text-white text-base sm:text-lg max-w-lg border-l-2 border-node-volt/60 pl-5 font-body leading-relaxed">
              A brutalist training stack for strength, engine, and recovery. Cinematic player, deep analytics, and AI-built sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-node-volt text-deep-asphalt font-heading font-bold text-sm uppercase tracking-[0.25em] hover:bg-text-white transition-colors shadow-[0_10px_40px_rgba(204,255,0,0.25)]"
              >
                Start Training
              </Link>
              <Link
                href="#platform"
                className="px-8 py-4 border border-text-white/30 text-text-white font-heading font-bold text-sm uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-colors backdrop-blur-sm bg-black/30"
              >
                Explore Platform
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute -inset-6 bg-node-volt/15 blur-3xl rounded-full opacity-30" />
            <div className="relative border border-border-dark/80 bg-concrete-grey/60 backdrop-blur-lg p-6 space-y-4 thin-shadow">
              <div className="flex justify-between items-start border-b border-border-dark pb-4">
                <div>
                  <p className="text-[10px] text-muted-text uppercase tracking-[0.25em] mb-1">Location</p>
                  <p className="font-heading text-base text-text-white">Digital / IRL</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-text uppercase tracking-[0.25em] mb-1">Focus</p>
                  <p className="font-heading text-base text-node-volt">Strength & Engine</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-deep-asphalt/70 border border-border-dark">
                  <h3 className="text-xl font-heading font-bold text-text-white">Deck Mode</h3>
                  <p className="text-[10px] text-muted-text uppercase mt-1">Immersive Player</p>
                </div>
                <div className="p-3 bg-deep-asphalt/70 border border-border-dark">
                  <h3 className="text-xl font-heading font-bold text-node-volt">RPE</h3>
                  <p className="text-[10px] text-muted-text uppercase mt-1">Precision Logging</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-deep-asphalt/70 border border-border-dark">
                  <h3 className="text-xl font-heading font-bold text-text-white">AI</h3>
                  <p className="text-[10px] text-muted-text uppercase mt-1">Session Builder</p>
                </div>
                <div className="p-3 bg-deep-asphalt/70 border border-border-dark">
                  <h3 className="text-xl font-heading font-bold text-node-volt">Ø</h3>
                  <p className="text-[10px] text-muted-text uppercase mt-1">Brutalist UI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Sections */}
      <section id="platform" className="py-20 bg-deep-asphalt border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">THE NØDE STACK</h2>
            <p className="text-muted-text font-body">
              Brutalist surfaces, volt highlights, and grid overlays. Every module is built for clarity and intent: train, track, iterate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Deck Mode',
                desc: 'Full-screen timer, cues, and section progress. Zero distractions.',
                icon: (
                  <svg className="w-6 h-6 text-node-volt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
                  </svg>
                ),
              },
              {
                title: 'Analytics',
                desc: 'RPE, tonnage, pace, and adherence across cycles with clean visuals.',
                icon: (
                  <svg className="w-6 h-6 text-node-volt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 13l9 0" />
                  </svg>
                ),
              },
              {
                title: 'AI Builder',
                desc: 'Archetype-aware sessions with equipment filters and fast iterations.',
                icon: (
                  <svg className="w-6 h-6 text-node-volt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-6-6h12" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative bg-concrete-grey/50 border border-border-dark rounded-2xl p-6 hover:border-node-volt transition-colors overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-node-volt/0 via-node-volt/5 to-node-volt/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full border border-border-dark flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-text">01</span>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-text leading-relaxed font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player Section */}
      <section id="player" className="py-20 bg-deep-asphalt border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl rounded-full opacity-30" />
            <div className="relative thin-border bg-concrete-grey/70 backdrop-blur-md p-8 space-y-4">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em]">
                <span>Deck Mode</span>
                <span>Now Playing</span>
              </div>
              <div className="h-64 rounded-2xl bg-gradient-to-br from-tech-grey to-concrete-grey border border-border-dark flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-node-volt flex items-center justify-center text-node-volt font-heading font-bold">
                  Ø
                </div>
              </div>
              <div className="flex gap-3 text-sm text-muted-text font-body">
                <span className="px-3 py-2 rounded-lg border border-border-dark">EMOM</span>
                <span className="px-3 py-2 rounded-lg border border-border-dark">RPE 8</span>
                <span className="px-3 py-2 rounded-lg border border-border-dark">Wave</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Immersive Player</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold">Full-Screen Workout Player</h2>
            <p className="text-muted-text font-body">
              Built for IRL sessions: large typography, clean cues, and quick controls. Deck mode keeps you in flow while tracking every section.
            </p>
            <ul className="space-y-3 text-text-white font-body">
              {['Timers & cues tuned for EMOM/AMRAP/Intervals', 'Keyboard shortcuts and quick-jump sections', 'Deck overlay for gym displays'].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="text-node-volt font-heading font-bold">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-deep-asphalt transition-colors"
            >
              Try Deck Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="py-20 bg-deep-asphalt border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">Analytics</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold">Measurable Progress</h2>
            <p className="text-muted-text font-body">
              Volume, RPE distribution, section pacing, and completion rates. Clean visuals with volt highlights for what matters.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Completion', value: '92%' },
                { label: 'Avg RPE', value: '7.8' },
                { label: 'Sessions/Wk', value: '4.2' },
                { label: 'PRs This Cycle', value: '12' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 border border-border-dark rounded-xl bg-concrete-grey/50">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-text">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold text-text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-blue-500/10 blur-3xl rounded-full opacity-30" />
            <div className="relative border border-border-dark bg-concrete-grey/60 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em]">
                <span>Analytics</span>
                <span>Cycle</span>
              </div>
              <div className="h-56 bg-gradient-to-b from-tech-grey to-deep-asphalt rounded-xl border border-border-dark flex items-end gap-2 p-4">
                {[50, 70, 90, 60, 80, 65].map((h, idx) => (
                  <div key={idx} className="flex-1 bg-node-volt/60 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-text font-body">Visualize workload, intensity, and adherence over each block.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="py-20 bg-deep-asphalt border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 bg-node-volt/10 blur-3xl rounded-full opacity-30" />
            <div className="relative border border-border-dark bg-concrete-grey/60 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-xs text-muted-text uppercase tracking-[0.25em]">
                <span>AI Builder</span>
                <span>Archetypes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['PR1ME', 'ENGIN3', 'FORGE', 'FLOWSTATE'].map((item) => (
                  <div key={item} className="p-4 border border-border-dark rounded-lg bg-deep-asphalt/70 text-center">
                    <p className="font-heading font-bold text-text-white">{item}</p>
                    <p className="text-[11px] text-muted-text uppercase tracking-[0.2em]">Preset</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-text font-body">Prompt-aware, equipment-aware, and archetype-aware. Generate clean sessions in seconds.</p>
            </div>
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-node-volt uppercase tracking-[0.25em] text-xs font-heading">AI Builder</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold">Sessions in Seconds</h2>
            <p className="text-muted-text font-body">
              Choose an archetype, set equipment and time, and let the builder create balanced work with clear prescriptions.
            </p>
            <ul className="space-y-3 text-text-white font-body">
              {['Archetype presets tuned to strength/engine blends', 'Equipment filters for gym / home / travel', 'Instant edit and regenerate flows'].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="text-node-volt font-heading font-bold">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 border border-node-volt text-node-volt font-heading font-bold uppercase tracking-[0.25em] hover:bg-node-volt hover:text-deep-asphalt transition-colors"
            >
              Build with AI
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-concrete-grey/10 border-t border-border-dark">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold">Access the NØDE</h2>
          <p className="text-muted-text font-body">
            Train with brutalist clarity. Volt highlights. Cinematic player. Analytics and AI built for lifters and coaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-10 py-4 bg-node-volt text-deep-asphalt font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-colors"
            >
              Start Now
            </Link>
            <Link
              href="/auth/login"
              className="px-10 py-4 border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-asphalt border-t border-border-dark py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-node-volt text-deep-asphalt font-heading font-bold text-sm flex items-center justify-center rounded">
              Ø
            </div>
            <span className="font-heading font-bold text-lg">NØDE</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-text font-body">
            <Link href="/programs" className="hover:text-node-volt transition-colors">Programs</Link>
            <Link href="/progress" className="hover:text-node-volt transition-colors">Progress</Link>
            <Link href="/gym" className="hover:text-node-volt transition-colors">Gyms</Link>
          </div>
          <div className="text-sm text-muted-text font-body">
            © {new Date().getFullYear()} NØDE Performance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
