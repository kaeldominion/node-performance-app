'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Icons } from '@/lib/iconMapping';
import { Users, Zap, Target, TrendingUp, Clock, Share2, Trophy, Activity } from 'lucide-react';

export default function HyroxAIBuilderPage() {
  const [terminalStep, setTerminalStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

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

  const terminalSteps = [
    'User input received',
    'Connecting to NØDE AI systems...',
    'Generating workout structure & exercise selection...',
    'Running workout review & feasibility check...',
    'Optimizing tier progression & timing...',
    'Workout generation complete ✓',
  ];

  return (
    <div className="min-h-screen bg-dark text-text-white">
      {/* Header */}
      <nav className="border-b thin-border bg-dark/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo className="text-xl transition-transform hover:scale-105" />
          </Link>
          <Link
            href="/"
            className="px-5 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 border-b thin-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-heading font-bold mb-6">
            AI-Powered <span className="text-node-volt">HYROX</span> Training
          </h1>
          <p className="text-xl text-muted-text mb-8 leading-relaxed">
            Generate personalized HYROX workouts tailored to your equipment, fitness level, and race goals
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-5 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/30 text-lg"
            style={{ color: '#000000' }}
          >
            Generate HYROX Workout
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* AI Builder Demo */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Icons.AI_BUILDER size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              How Our AI Builder Works
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Form Animation */}
            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <Icons.BOT size={24} className="text-node-volt" />
                <h3 className="text-2xl font-heading font-bold">Workout Generator Form</h3>
              </div>
              <div className="space-y-4 animate-pulse">
                <div className="bg-panel/50 thin-border rounded p-4">
                  <div className="h-4 bg-node-volt/20 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-dark/50 rounded"></div>
                </div>
                <div className="bg-panel/50 thin-border rounded p-4">
                  <div className="h-4 bg-node-volt/20 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-dark/50 rounded"></div>
                </div>
                <div className="bg-panel/50 thin-border rounded p-4">
                  <div className="h-4 bg-node-volt/20 rounded w-1/2 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-node-volt/30 rounded w-16"></div>
                    <div className="h-6 bg-node-volt/30 rounded w-16"></div>
                    <div className="h-6 bg-node-volt/30 rounded w-16"></div>
                  </div>
                </div>
                <div className="bg-node-volt text-black font-heading font-bold text-center py-3 rounded uppercase tracking-wider">
                  Generate Workout
                </div>
              </div>
            </div>

            {/* Terminal Animation */}
            <div className="bg-panel/30 thin-border rounded-lg p-8 font-mono">
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

          <div className="space-y-6 text-lg text-muted-text leading-relaxed">
            <p>
              Our advanced AI workout generator uses machine learning to create HYROX-specific training sessions 
              that prepare you for race day. Simply tell us your goals, available equipment, and training level, 
              and our AI will craft a personalized workout optimized for HYROX performance.
            </p>
            <p>
              The AI considers the unique demands of HYROX racing—combining running with functional fitness movements 
              like ski erg, rowing, burpees, and wall balls. Each generated workout is designed to improve your 
              endurance, strength, and race-specific skills.
            </p>
          </div>
        </section>

        {/* Deck Player Preview */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Icons.Workout size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              Cinematic Deck Player
            </h2>
          </div>
          
          <div className="bg-panel/30 thin-border rounded-lg p-8 mb-6">
            <div className="bg-dark/80 thin-border rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-node-volt font-mono text-3xl font-bold mb-2">HX-001</div>
                  <h3 className="text-2xl font-heading font-bold">HYROX Race Prep</h3>
                </div>
                <div className="px-4 py-2 bg-node-volt/20 text-node-volt text-xs font-bold uppercase">
                  HYROX MODE
                </div>
              </div>
              
              {/* Deck Slide Preview */}
              <div className="bg-panel/50 thin-border rounded-lg p-8 text-center">
                <div className="text-6xl font-heading font-bold mb-4 text-node-volt">01</div>
                <h4 className="text-3xl font-heading font-bold mb-6">1KM RUN</h4>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-800 thin-border rounded p-4">
                    <div className="text-xs text-muted-text mb-1">SILVER</div>
                    <div className="text-xl font-bold">8:00</div>
                  </div>
                  <div className="bg-node-volt/20 thin-border border-node-volt rounded p-4">
                    <div className="text-xs text-node-volt mb-1">GOLD</div>
                    <div className="text-xl font-bold text-node-volt">7:30</div>
                  </div>
                  <div className="bg-zinc-900 thin-border rounded p-4">
                    <div className="text-xs text-muted-text mb-1">BLACK</div>
                    <div className="text-xl font-bold">7:00</div>
                  </div>
                </div>
                <div className="text-sm text-muted-text">Next: 1000m Ski Erg</div>
              </div>
            </div>
            
            <p className="text-lg text-muted-text leading-relaxed">
              Experience your HYROX workouts in cinematic deck mode. Full-screen, distraction-free training with 
              clear tier prescriptions (Silver, Gold, Black) and smooth transitions between exercises. Perfect for 
              race day simulation and focused training sessions.
            </p>
          </div>
        </section>

        {/* Equipment Selection */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Icons.PR1ME size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              Customize Your Equipment
            </h2>
          </div>
          <div className="bg-panel/30 thin-border rounded-lg p-8 mb-6">
            <p className="text-lg text-muted-text mb-6 leading-relaxed">
              Our AI builder adapts to your available equipment. Whether you train at a fully-equipped gym, 
              a home setup, or have limited equipment, the AI will create workouts that work for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <h3 className="text-xl font-heading font-bold mb-3 text-node-volt flex items-center gap-2">
                  <Icons.PR1ME size={20} />
                  Full Gym Equipment
                </h3>
                <ul className="space-y-2 text-muted-text leading-relaxed">
                  <li>• Ski Erg</li>
                  <li>• Rowing Machine</li>
                  <li>• Assault Bike</li>
                  <li>• Sandbags & Kettlebells</li>
                  <li>• Wall Balls</li>
                  <li>• Pull-up Bar</li>
                </ul>
              </div>
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <h3 className="text-xl font-heading font-bold mb-3 text-node-volt flex items-center gap-2">
                  <Activity size={20} />
                  Home Equipment
                </h3>
                <ul className="space-y-2 text-muted-text leading-relaxed">
                  <li>• Dumbbells</li>
                  <li>• Kettlebells</li>
                  <li>• Resistance Bands</li>
                  <li>• Pull-up Bar</li>
                  <li>• Running Space</li>
                  <li>• Bodyweight Exercises</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-text leading-relaxed">
            Select your available equipment when generating a workout, and the AI will create sessions that 
            maximize your training with what you have. No equipment? No problem—our AI can generate bodyweight 
            HYROX workouts that build race-specific fitness.
          </p>
        </section>

        {/* Network Feature */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Users size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              Train Together with Your Network
            </h2>
          </div>
          
          <div className="bg-panel/30 thin-border rounded-lg p-8 mb-6">
            <p className="text-xl text-muted-text mb-8 leading-relaxed">
              Stay motivated and accountable through NØDE's powerful network features. Connect with training partners, 
              see real-time activity from your network, and compete together—whether you're training in the same gym 
              or remotely across the world.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={24} className="text-node-volt" />
                  <h3 className="text-xl font-heading font-bold">Connect & Compete</h3>
                </div>
                <p className="text-muted-text leading-relaxed mb-4">
                  Build your training network by connecting with friends, training partners, and fellow HYROX athletes. 
                  Use QR codes or search to find and connect instantly.
                </p>
                <ul className="space-y-2 text-muted-text leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>Connect via QR code or search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>See real-time workout activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>Share workouts and programs</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy size={24} className="text-node-volt" />
                  <h3 className="text-xl font-heading font-bold">Compete & Motivate</h3>
                </div>
                <p className="text-muted-text leading-relaxed mb-4">
                  Train together physically or remotely. Complete the same workouts, compete on leaderboards, 
                  and push each other to new levels—no matter where you are.
                </p>
                <ul className="space-y-2 text-muted-text leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>Train together in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>Remote competition and challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                    <span>Leaderboards and achievements</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-node-volt/10 thin-border border-node-volt/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Zap size={24} className="text-node-volt flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-heading font-bold mb-2 text-node-volt">
                    The Power of Community Motivation
                  </h4>
                  <p className="text-muted-text leading-relaxed">
                    Research shows that training with others—even virtually—increases motivation, consistency, and performance. 
                    When you see your network completing workouts, hitting PRs, and leveling up, it creates positive peer pressure 
                    that drives you to show up and push harder. Whether you're training side-by-side in the gym or competing 
                    remotely across time zones, the NØDE network keeps you accountable and motivated to reach your HYROX goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HYROX Performance Benefits */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Target size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              Optimize Your HYROX Performance
            </h2>
          </div>
          <div className="space-y-8">
            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt flex items-center gap-2">
                <TrendingUp size={24} />
                Race-Specific Training
              </h3>
              <p className="text-lg text-muted-text mb-4 leading-relaxed">
                Every workout is designed to mirror HYROX race conditions. The AI creates sessions that combine 
                running intervals with functional movements, building the exact fitness needed for race day.
              </p>
              <ul className="space-y-2 text-muted-text leading-relaxed">
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Running intervals matched to HYROX distances</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Functional movements in race order</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Work-to-rest ratios that match race pacing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Progressive overload for continuous improvement</span>
                </li>
              </ul>
            </div>

            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt flex items-center gap-2">
                <Clock size={24} />
                Personalized Progression
              </h3>
              <p className="text-lg text-muted-text mb-4 leading-relaxed">
                The AI adapts to your fitness level, creating workouts that challenge you appropriately. As you 
                improve, the workouts become more demanding, ensuring continuous progress toward your race goals.
              </p>
              <ul className="space-y-2 text-muted-text leading-relaxed">
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Beginner-friendly sessions for new HYROX athletes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Intermediate workouts for experienced racers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Advanced training for competitive athletes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Elite-level sessions for podium contenders</span>
                </li>
              </ul>
            </div>

            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt flex items-center gap-2">
                <Activity size={24} />
                Comprehensive Movement Patterns
              </h3>
              <p className="text-lg text-muted-text mb-4 leading-relaxed">
                Our AI understands all HYROX movements and creates workouts that develop strength, endurance, 
                and technique across every exercise you'll face in competition.
              </p>
              <ul className="space-y-2 text-muted-text leading-relaxed">
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Ski Erg technique and power</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Rowing efficiency and pacing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Burpee speed and form</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Wall ball accuracy and endurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Sandbag strength and stability</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
                  <span>Running economy and pacing</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Race Preparation */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Icons.PROGRAM size={32} className="text-node-volt" />
            <h2 className="text-4xl font-heading font-bold">
              Get Race-Ready
            </h2>
          </div>
          <div className="space-y-6 text-lg text-muted-text leading-relaxed">
            <p>
              Preparing for a HYROX race requires more than just general fitness. You need workouts that 
              specifically target the unique combination of running and functional movements that define HYROX. 
              Our AI builder creates training sessions that prepare you for every aspect of race day.
            </p>
            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt">
                Training Phases
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Base Building</h4>
                  <p className="text-muted-text leading-relaxed">
                    Build foundational fitness with longer, lower-intensity sessions that develop aerobic capacity 
                    and movement efficiency.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Load Phase</h4>
                  <p className="text-muted-text leading-relaxed">
                    Increase training volume and intensity to build race-specific strength and endurance.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Intensify</h4>
                  <p className="text-muted-text leading-relaxed">
                    Focus on race-pace efforts and high-intensity intervals that match HYROX demands.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Peak & Taper</h4>
                  <p className="text-muted-text leading-relaxed">
                    Fine-tune performance with race-specific sessions, then taper for optimal race day performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-24">
          <h2 className="text-4xl font-heading font-bold mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={24} className="text-node-volt" />
                <h3 className="text-xl font-heading font-bold text-node-volt">
                  Instant Workout Generation
                </h3>
              </div>
              <p className="text-muted-text leading-relaxed">
                Get a complete HYROX workout in seconds, tailored to your goals and equipment.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icons.PR1ME size={24} className="text-node-volt" />
                <h3 className="text-xl font-heading font-bold text-node-volt">
                  Equipment Flexibility
                </h3>
              </div>
              <p className="text-muted-text leading-relaxed">
                Works with any equipment setup—from full gyms to minimal home equipment.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={24} className="text-node-volt" />
                <h3 className="text-xl font-heading font-bold text-node-volt">
                  Progressive Training
                </h3>
              </div>
              <p className="text-muted-text leading-relaxed">
                Workouts adapt to your level and progress as you improve.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target size={24} className="text-node-volt" />
                <h3 className="text-xl font-heading font-bold text-node-volt">
                  Race-Specific Design
                </h3>
              </div>
              <p className="text-muted-text leading-relaxed">
                Every workout is designed to improve your HYROX race performance.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 border-t thin-border">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Transform Your HYROX Training?
          </h2>
          <p className="text-xl text-muted-text mb-8 leading-relaxed">
            Join NØDE and start generating personalized HYROX workouts today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-block px-10 py-5 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/30 text-lg"
              style={{ color: '#000000' }}
            >
              Generate HYROX Workout
            </Link>
            <Link
              href="/auth/login"
              className="inline-block px-10 py-5 thin-border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
