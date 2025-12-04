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
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt text-text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-deep-asphalt via-concrete-grey/30 to-deep-asphalt" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(204,255,0,0.15),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(74,158,255,0.1),transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 text-center">
          <div className="mb-16 space-y-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tight" style={{ 
              fontFamily: 'var(--font-space-grotesk)',
            }}>
              <span className="block">Train with</span>
              <span className="block text-node-volt drop-shadow-[0_0_40px_rgba(204,255,0,0.6)]">NØDE</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-text max-w-2xl mx-auto font-light leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              The training OS for serious athletes
            </p>
            <p className="text-base sm:text-lg text-muted-text/80 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              Build strength, develop your engine, and track every rep with precision
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/auth/register"
              className="group relative px-10 py-5 bg-node-volt text-deep-asphalt font-bold rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(204,255,0,0.6)]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Start Training
              <span className="absolute inset-0 rounded-2xl bg-node-volt opacity-0 group-hover:opacity-30 blur-2xl transition-opacity" />
            </Link>
            <Link
              href="#features"
              className="px-10 py-5 bg-concrete-grey/80 backdrop-blur-sm border border-border-dark/50 text-text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-tech-grey/80 hover:border-node-volt/30"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-node-volt/40 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-node-volt rounded-full mt-1" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-deep-asphalt to-concrete-grey/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Everything You Need
            </h2>
            <p className="text-xl sm:text-2xl text-muted-text max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              A complete training platform built for performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="space-y-6">
              <h3 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Full-Screen Workout Player
              </h3>
              <p className="text-lg sm:text-xl text-muted-text leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                Immersive deck mode with built-in timers, audio cues, and smooth transitions. Train distraction-free with cinematic presentation.
              </p>
              <ul className="space-y-4 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">EMOM, AMRAP, and countdown timers</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Audio cues and transitions</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Tier-based prescriptions (Silver/Gold/Black)</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-tech-grey to-concrete-grey border border-border-dark/50 rounded-3xl p-16 aspect-video flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-6">📱</div>
                  <p className="text-muted-text text-lg">Workout Player</p>
                </div>
              </div>
              <div className="absolute -inset-2 bg-node-volt/20 rounded-3xl blur-2xl opacity-60" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-tech-grey to-concrete-grey border border-border-dark/50 rounded-3xl p-16 aspect-video flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-6">📊</div>
                  <p className="text-muted-text text-lg">Progress Dashboard</p>
                </div>
              </div>
              <div className="absolute -inset-2 bg-blue-500/20 rounded-3xl blur-2xl opacity-60" />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Advanced Progress Tracking
              </h3>
              <p className="text-lg sm:text-xl text-muted-text leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                Track every metric that matters. Volume, RPE, strength PRs, and engine development—all visualized beautifully.
              </p>
              <ul className="space-y-4 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Strength progress graphs</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">RPE distribution and trends</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Personal records tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h3 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                AI Workout Generator
              </h3>
              <p className="text-lg sm:text-xl text-muted-text leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                Generate custom workouts tailored to your goals, equipment, and available time. Powered by advanced AI that understands the NØDE framework.
              </p>
              <ul className="space-y-4 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Archetype-specific generation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Equipment and space filtering</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-node-volt text-2xl font-bold mt-0.5">✓</span>
                  <span className="text-base leading-relaxed">Instant workout creation</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-tech-grey to-concrete-grey border border-border-dark/50 rounded-3xl p-16 aspect-video flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-6">🤖</div>
                  <p className="text-muted-text text-lg">AI Builder</p>
                </div>
              </div>
              <div className="absolute -inset-2 bg-purple-500/20 rounded-3xl blur-2xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-32 bg-concrete-grey/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              The N<span className="text-node-volt">Ø</span>DE Method
            </h2>
            <p className="text-xl sm:text-2xl text-muted-text max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              Six distinct workout archetypes, each designed for a specific training adaptation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'PR1ME', desc: 'Strength-focused wave sets. Build maximal strength with progressive loading.', color: '#ccff00' },
              { name: 'FORGE', desc: 'Hybrid strength. Push/pull supersets and compound movements.', color: '#ccff00' },
              { name: 'ENGIN3', desc: 'EMOM conditioning. Build work capacity and engine.', color: '#4a9eff' },
              { name: 'CIRCUIT_X', desc: 'High-intensity circuits. Multiple AMRAP blocks for maximum output.', color: '#ff6b6b' },
              { name: 'CAPAC1TY', desc: 'Long engine blocks. 12-20 minute sustained efforts.', color: '#ff6b6b' },
              { name: 'FLOWSTATE', desc: 'Tempo work and mobility. Deload, recovery, and movement quality.', color: '#9b59b6' },
            ].map((archetype) => (
              <div
                key={archetype.name}
                className="group relative bg-tech-grey/50 backdrop-blur-sm border border-border-dark/50 rounded-2xl p-8 hover:border-node-volt/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.1)]"
              >
                <h3 className="text-4xl font-black mb-4" style={{ 
                  fontFamily: 'var(--font-space-grotesk)',
                  color: archetype.color,
                }}>
                  {archetype.name}
                </h3>
                <p className="text-muted-text leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {archetype.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercise Library */}
      <section className="py-32 bg-gradient-to-b from-concrete-grey/50 to-deep-asphalt">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Exercise Library
            </h2>
            <p className="text-xl sm:text-2xl text-muted-text max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              120+ exercises with detailed metadata, tier prescriptions, and movement patterns
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {['Dumbbell Bench Press', 'Kettlebell Clean', 'Sandbag Carry', 'Run 1km'].map((exercise) => (
              <div
                key={exercise}
                className="group bg-tech-grey/50 backdrop-blur-sm border border-border-dark/50 rounded-xl p-6 text-center hover:border-node-volt/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]"
              >
                <div className="text-text-white text-sm font-medium mb-3">{exercise}</div>
                <div className="text-node-volt text-xs font-semibold tracking-wider">SILVER • GOLD • BLACK</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/auth/register"
              className="inline-block px-10 py-4 bg-node-volt text-deep-asphalt font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Explore Exercises
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-deep-asphalt">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Choose Your Plan
            </h2>
            <p className="text-xl sm:text-2xl text-muted-text max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['Access to workout library', 'Basic progress tracking', '3 AI workouts per month'],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Premium',
                price: '$19',
                period: 'month',
                features: ['Unlimited AI workouts', 'Advanced analytics', 'Program access', 'Priority support'],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Coach',
                price: 'Custom',
                period: '',
                features: ['Everything in Premium', 'Client management', 'Program assignment', 'White-label options'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-concrete-grey/50 backdrop-blur-sm border rounded-3xl p-10 transition-all duration-300 ${
                  plan.highlight
                    ? 'border-node-volt/50 scale-105 shadow-[0_0_40px_rgba(204,255,0,0.2)]'
                    : 'border-border-dark/50 hover:border-node-volt/30 hover:scale-[1.02]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-node-volt text-deep-asphalt px-5 py-1.5 rounded-full text-sm font-bold">
                    POPULAR
                  </div>
                )}
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {plan.name}
                  </h3>
                  <div>
                    <span className="text-6xl font-black">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-text text-lg ml-2">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-text">
                      <span className="text-node-volt text-xl font-bold mt-0.5">✓</span>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full text-center font-bold py-4 rounded-2xl transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-node-volt text-deep-asphalt hover:scale-105 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)]'
                      : 'bg-tech-grey/50 border border-border-dark/50 text-text-white hover:bg-concrete-grey/50 hover:border-node-volt/30'
                  }`}
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-concrete-grey/50 to-deep-asphalt">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl sm:text-2xl text-muted-text mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
            Join athletes who train with precision, track with purpose, and perform at their peak.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-14 py-5 bg-node-volt text-deep-asphalt font-bold rounded-2xl text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Start Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-asphalt border-t border-border-dark/50 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                N<span className="text-node-volt">Ø</span>DE
              </h3>
              <p className="text-muted-text text-sm leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                The training OS for serious athletes.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-text-white text-lg">Product</h4>
              <ul className="space-y-3 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#features" className="hover:text-node-volt transition-colors">Features</Link></li>
                <li><Link href="/programs" className="hover:text-node-volt transition-colors">Programs</Link></li>
                <li><Link href="/progress" className="hover:text-node-volt transition-colors">Progress</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-text-white text-lg">Company</h4>
              <ul className="space-y-3 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#" className="hover:text-node-volt transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-text-white text-lg">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border-dark/50 pt-8 text-center text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
            © {new Date().getFullYear()} NØDE Performance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
