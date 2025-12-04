'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface TodaySession {
  workoutId: string;
  workoutName: string;
  dayIndex: number;
  date: string;
}

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(204, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(204, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight" style={{ 
              fontFamily: 'var(--font-space-grotesk)',
              letterSpacing: '-0.02em',
            }}>
              Train with the
              <br />
              <span className="text-node-volt">NØDE</span> System
            </h1>
            <p className="text-2xl md:text-3xl text-muted-text max-w-3xl mx-auto mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
              Hybrid Performance Engine
            </p>
            <p className="text-lg text-muted-text max-w-2xl mx-auto mb-12" style={{ fontFamily: 'var(--font-manrope)' }}>
              The training OS for serious athletes. Build strength, develop your engine, and track every rep with precision.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/register"
              className="bg-node-volt text-deep-asphalt font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Start Training
            </Link>
            <Link
              href="#method"
              className="bg-concrete-grey border border-border-dark text-text-white px-8 py-4 rounded-lg hover:bg-tech-grey transition-colors font-medium text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-node-volt rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-node-volt rounded-full" />
          </div>
        </div>
      </section>

      {/* The NØDE Method */}
      <section id="method" className="py-20 bg-concrete-grey border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              The N<span className="text-node-volt">Ø</span>DE Method
            </h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-manrope)' }}>
              Six distinct workout archetypes, each designed for a specific training adaptation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'PR1ME',
                description: 'Strength-focused wave sets. Build maximal strength with progressive loading.',
                color: '#ccff00',
              },
              {
                name: 'FORGE',
                description: 'Hybrid strength. Push/pull supersets and compound movements.',
                color: '#ccff00',
              },
              {
                name: 'ENGIN3',
                description: 'EMOM conditioning. Build work capacity and engine.',
                color: '#4a9eff',
              },
              {
                name: 'CIRCUIT_X',
                description: 'High-intensity circuits. Multiple AMRAP blocks for maximum output.',
                color: '#ff6b6b',
              },
              {
                name: 'CAPAC1TY',
                description: 'Long engine blocks. 12-20 minute sustained efforts.',
                color: '#ff6b6b',
              },
              {
                name: 'FLOWSTATE',
                description: 'Tempo work and mobility. Deload, recovery, and movement quality.',
                color: '#9b59b6',
              },
            ].map((archetype) => (
              <div
                key={archetype.name}
                className="bg-tech-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
              >
                <h3 className="text-3xl font-bold mb-3" style={{ 
                  fontFamily: 'var(--font-space-grotesk)',
                  color: archetype.color,
                }}>
                  {archetype.name}
                </h3>
                <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {archetype.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-deep-asphalt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Everything You Need
            </h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-manrope)' }}>
              A complete training platform built for performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Full-Screen Workout Player
              </h3>
              <p className="text-lg text-muted-text mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
                Immersive deck mode with built-in timers, audio cues, and smooth transitions. 
                Train distraction-free with cinematic presentation.
              </p>
              <ul className="space-y-3 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>EMOM, AMRAP, and countdown timers</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Audio cues and transitions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Tier-based prescriptions (Silver/Gold/Black)</span>
                </li>
              </ul>
            </div>
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-muted-text">Workout Player UI</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 aspect-video flex items-center justify-center order-2 md:order-1">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-muted-text">Progress Dashboard</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Advanced Progress Tracking
              </h3>
              <p className="text-lg text-muted-text mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
                Track every metric that matters. Volume, RPE, strength PRs, and engine development—all visualized beautifully.
              </p>
              <ul className="space-y-3 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Strength progress graphs</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>RPE distribution and trends</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Personal records tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                AI Workout Generator
              </h3>
              <p className="text-lg text-muted-text mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
                Generate custom workouts tailored to your goals, equipment, and available time. 
                Powered by advanced AI that understands the NØDE framework.
              </p>
              <ul className="space-y-3 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Archetype-specific generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Equipment and space filtering</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-node-volt">✓</span>
                  <span>Instant workout creation</span>
                </li>
              </ul>
            </div>
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-muted-text">AI Builder UI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exercise Library */}
      <section className="py-20 bg-concrete-grey border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Comprehensive Exercise Library
            </h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-manrope)' }}>
              120+ exercises with detailed metadata, tier prescriptions, and movement patterns
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Dumbbell Bench Press', 'Kettlebell Clean', 'Sandbag Carry', 'Run 1km'].map((exercise) => (
              <div
                key={exercise}
                className="bg-tech-grey border border-border-dark rounded-lg p-4 text-center hover:border-node-volt transition-colors"
              >
                <div className="text-muted-text text-sm mb-2">{exercise}</div>
                <div className="text-node-volt text-xs">SILVER • GOLD • BLACK</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/auth/register"
              className="inline-block bg-node-volt text-deep-asphalt font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Explore Exercises
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-deep-asphalt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-manrope)' }}>
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: [
                  'Access to workout library',
                  'Basic progress tracking',
                  '3 AI workouts per month',
                ],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Premium',
                price: '$19',
                period: 'month',
                features: [
                  'Unlimited AI workouts',
                  'Advanced analytics',
                  'Program access',
                  'Priority support',
                ],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Coach',
                price: 'Custom',
                period: '',
                features: [
                  'Everything in Premium',
                  'Client management',
                  'Program assignment',
                  'White-label options',
                ],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-concrete-grey border rounded-lg p-8 ${
                  plan.highlight
                    ? 'border-node-volt scale-105'
                    : 'border-border-dark'
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-text text-lg">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-muted-text">
                      <span className="text-node-volt">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full text-center font-bold py-3 rounded-lg transition-opacity ${
                    plan.highlight
                      ? 'bg-node-volt text-deep-asphalt hover:opacity-90'
                      : 'bg-tech-grey border border-border-dark text-text-white hover:bg-concrete-grey'
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
      <section className="py-20 bg-concrete-grey border-t border-border-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl text-muted-text mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
            Join athletes who train with precision, track with purpose, and perform at their peak.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-node-volt text-deep-asphalt font-bold px-12 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Start Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-asphalt border-t border-border-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                N<span className="text-node-volt">Ø</span>DE
              </h3>
              <p className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                The training OS for serious athletes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-text-white">Product</h4>
              <ul className="space-y-2 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#method" className="hover:text-node-volt transition-colors">The Method</Link></li>
                <li><Link href="/programs" className="hover:text-node-volt transition-colors">Programs</Link></li>
                <li><Link href="/progress" className="hover:text-node-volt transition-colors">Progress</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-text-white">Company</h4>
              <ul className="space-y-2 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#" className="hover:text-node-volt transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-node-volt transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border-dark pt-8 text-center text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
            © {new Date().getFullYear()} NØDE Performance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
