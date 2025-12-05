'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Icons } from '@/lib/iconMapping';

export default function HyroxAIBuilderPage() {
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
          <p className="text-xl text-muted-text mb-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-4xl font-heading font-bold mb-8">
            How Our AI Builder Works
          </h2>
          <div className="space-y-6 text-lg text-muted-text">
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

        {/* Equipment Selection */}
        <section className="mb-20">
          <h2 className="text-4xl font-heading font-bold mb-8">
            Customize Your Equipment
          </h2>
          <div className="bg-panel/30 thin-border rounded-lg p-8 mb-6">
            <p className="text-lg text-muted-text mb-6">
              Our AI builder adapts to your available equipment. Whether you train at a fully-equipped gym, 
              a home setup, or have limited equipment, the AI will create workouts that work for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                  Full Gym Equipment
                </h3>
                <ul className="space-y-2 text-muted-text">
                  <li>• Ski Erg</li>
                  <li>• Rowing Machine</li>
                  <li>• Assault Bike</li>
                  <li>• Sandbags & Kettlebells</li>
                  <li>• Wall Balls</li>
                  <li>• Pull-up Bar</li>
                </ul>
              </div>
              <div className="bg-panel/50 thin-border rounded-lg p-6">
                <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                  Home Equipment
                </h3>
                <ul className="space-y-2 text-muted-text">
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
          <p className="text-lg text-muted-text">
            Select your available equipment when generating a workout, and the AI will create sessions that 
            maximize your training with what you have. No equipment? No problem—our AI can generate bodyweight 
            HYROX workouts that build race-specific fitness.
          </p>
        </section>

        {/* HYROX Performance Benefits */}
        <section className="mb-20">
          <h2 className="text-4xl font-heading font-bold mb-8">
            Optimize Your HYROX Performance
          </h2>
          <div className="space-y-8">
            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt">
                Race-Specific Training
              </h3>
              <p className="text-lg text-muted-text mb-4">
                Every workout is designed to mirror HYROX race conditions. The AI creates sessions that combine 
                running intervals with functional movements, building the exact fitness needed for race day.
              </p>
              <ul className="space-y-2 text-muted-text">
                <li>• Running intervals matched to HYROX distances</li>
                <li>• Functional movements in race order</li>
                <li>• Work-to-rest ratios that match race pacing</li>
                <li>• Progressive overload for continuous improvement</li>
              </ul>
            </div>

            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt">
                Personalized Progression
              </h3>
              <p className="text-lg text-muted-text mb-4">
                The AI adapts to your fitness level, creating workouts that challenge you appropriately. As you 
                improve, the workouts become more demanding, ensuring continuous progress toward your race goals.
              </p>
              <ul className="space-y-2 text-muted-text">
                <li>• Beginner-friendly sessions for new HYROX athletes</li>
                <li>• Intermediate workouts for experienced racers</li>
                <li>• Advanced training for competitive athletes</li>
                <li>• Elite-level sessions for podium contenders</li>
              </ul>
            </div>

            <div className="bg-panel/30 thin-border rounded-lg p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-node-volt">
                Comprehensive Movement Patterns
              </h3>
              <p className="text-lg text-muted-text mb-4">
                Our AI understands all HYROX movements and creates workouts that develop strength, endurance, 
                and technique across every exercise you'll face in competition.
              </p>
              <ul className="space-y-2 text-muted-text">
                <li>• Ski Erg technique and power</li>
                <li>• Rowing efficiency and pacing</li>
                <li>• Burpee speed and form</li>
                <li>• Wall ball accuracy and endurance</li>
                <li>• Sandbag strength and stability</li>
                <li>• Running economy and pacing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Race Preparation */}
        <section className="mb-20">
          <h2 className="text-4xl font-heading font-bold mb-8">
            Get Race-Ready
          </h2>
          <div className="space-y-6 text-lg text-muted-text">
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
                  <p className="text-muted-text">
                    Build foundational fitness with longer, lower-intensity sessions that develop aerobic capacity 
                    and movement efficiency.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Load Phase</h4>
                  <p className="text-muted-text">
                    Increase training volume and intensity to build race-specific strength and endurance.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Intensify</h4>
                  <p className="text-muted-text">
                    Focus on race-pace efforts and high-intensity intervals that match HYROX demands.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold mb-2">Peak & Taper</h4>
                  <p className="text-muted-text">
                    Fine-tune performance with race-specific sessions, then taper for optimal race day performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-4xl font-heading font-bold mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                Instant Workout Generation
              </h3>
              <p className="text-muted-text">
                Get a complete HYROX workout in seconds, tailored to your goals and equipment.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                Equipment Flexibility
              </h3>
              <p className="text-muted-text">
                Works with any equipment setup—from full gyms to minimal home equipment.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                Progressive Training
              </h3>
              <p className="text-muted-text">
                Workouts adapt to your level and progress as you improve.
              </p>
            </div>
            <div className="bg-panel/30 thin-border rounded-lg p-6">
              <h3 className="text-xl font-heading font-bold mb-3 text-node-volt">
                Race-Specific Design
              </h3>
              <p className="text-muted-text">
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
          <p className="text-xl text-muted-text mb-8">
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

