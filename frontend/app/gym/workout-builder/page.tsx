'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, gymApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';

const TRAINING_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
const TRAINING_GOALS = ['STRENGTH', 'HYPERTROPHY', 'HYBRID', 'CONDITIONING', 'FAT_LOSS', 'LONGEVITY'];
const ARCHETYPES = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE'];
const EQUIPMENT_OPTIONS = [
  'dumbbells',
  'kettlebell',
  'barbell',
  'erg',
  'rower',
  'bike',
  'rings',
  'pull-up bar',
  'box',
  'jump rope',
  'sandbag',
  'bodyweight',
];

const CYCLES = ['BASE', 'LOAD', 'INTENSIFY', 'DELOAD'];

export default function GymWorkoutBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'config' | 'schedule' | 'review'>('config');
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    goal: 'HYBRID',
    trainingLevel: 'INTERMEDIATE',
    equipment: [] as string[],
    availableMinutes: 45,
    archetype: '' as string | undefined,
    cycle: 'BASE' as 'BASE' | 'LOAD' | 'INTENSIFY' | 'DELOAD',
    programType: 'month' as 'month' | 'fourWeek',
    startDate: '',
    endDate: '',
    classesPerDay: 4,
    startTime: '06:00',
    endTime: '20:00',
    excludeTimes: [] as string[], // Times to exclude (e.g., ['12:00', '13:00'])
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
    }
  }, [user, authLoading]);

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleGenerateWorkouts = async () => {
    if (formData.equipment.length === 0) {
      setError('Please select at least one piece of equipment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workouts = await aiApi.generateWorkout({
        goal: formData.goal,
        trainingLevel: formData.trainingLevel,
        equipment: formData.equipment,
        availableMinutes: formData.availableMinutes,
        archetype: formData.archetype,
        workoutType: formData.programType === 'fourWeek' ? 'month' : 'month',
        cycle: formData.cycle,
      });
      
      setGeneratedWorkouts(Array.isArray(workouts) ? workouts : [workouts]);
      setStep('schedule');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = () => {
    if (!formData.startDate || !formData.endDate) {
      setError('Please select start and end dates');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days: Date[] = [];
    
    // Get all days in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    // Generate time slots (every hour between start and end time)
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.endTime.split(':').map(Number);
    const timeSlots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      if (!formData.excludeTimes.includes(timeStr)) {
        timeSlots.push(timeStr);
      }
    }

    // Balance workouts across days
    const workoutCount = generatedWorkouts.length;
    const workoutsPerDay = Math.ceil(workoutCount / days.length);
    const balancedSchedule: any[] = [];
    
    // Distribute workouts evenly, ensuring variety
    const workoutIndexes = Array.from({ length: workoutCount }, (_, i) => i);
    let workoutIdx = 0;

    days.forEach((day, dayIdx) => {
      const daySchedule: any[] = [];
      const classesToday = Math.min(formData.classesPerDay, workoutCount - workoutIdx);
      
      // Select different workouts for this day (avoid repetition)
      const selectedWorkouts: number[] = [];
      const availableWorkouts = [...workoutIndexes];
      
      for (let i = 0; i < classesToday && availableWorkouts.length > 0; i++) {
        // Pick a random workout that hasn't been used today
        const randomIdx = Math.floor(Math.random() * availableWorkouts.length);
        const workoutIdx = availableWorkouts.splice(randomIdx, 1)[0];
        selectedWorkouts.push(workoutIdx);
      }

      // Assign times to classes
      selectedWorkouts.forEach((workoutIdx, classIdx) => {
        const timeSlot = timeSlots[classIdx % timeSlots.length];
        const [hour, minute] = timeSlot.split(':').map(Number);
        const scheduledAt = new Date(day);
        scheduledAt.setHours(hour, minute, 0, 0);

        daySchedule.push({
          workout: generatedWorkouts[workoutIdx],
          workoutIdx,
          scheduledAt: scheduledAt.toISOString(),
          time: timeSlot,
          name: `${generatedWorkouts[workoutIdx].name} - ${timeSlot}`,
        });
      });

      balancedSchedule.push({
        date: day.toISOString().split('T')[0],
        dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
        classes: daySchedule,
      });
    });

    setSchedule(balancedSchedule);
    setStep('review');
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      
      // Save all workouts first
      const savedWorkouts = await Promise.all(
        generatedWorkouts.map((workout) => workoutsApi.create(workout))
      );

      // Create gym classes
      const classesToCreate = schedule.flatMap((day) =>
        day.classes.map((classItem: any) => ({
          name: classItem.name,
          scheduledAt: classItem.scheduledAt,
          workoutId: savedWorkouts[classItem.workoutIdx].id,
          maxCapacity: 20,
        }))
      );

      // Bulk create classes
      await gymApi.bulkCreateClasses(classesToCreate);
      
      router.push('/gym/classes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-5xl font-bold mb-8" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Gym Workout Builder
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex-1 h-2 rounded ${step === 'config' ? 'bg-node-volt' : 'bg-tech-grey'}`}></div>
          <div className={`flex-1 h-2 rounded ${step === 'schedule' ? 'bg-node-volt' : 'bg-tech-grey'}`}></div>
          <div className={`flex-1 h-2 rounded ${step === 'review' ? 'bg-node-volt' : 'bg-tech-grey'}`}></div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Configuration */}
        {step === 'config' && (
          <div className="bg-concrete-grey border border-border-dark rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Workout Configuration
            </h2>

            <div className="space-y-6">
              {/* Program Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Program Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'month', label: '4-Week Program', desc: 'Full month cycle' },
                    { value: 'fourWeek', label: 'Custom 4 Weeks', desc: 'Set your own dates' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, programType: type.value as any })}
                      className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                        formData.programType === type.value
                          ? 'bg-node-volt text-dark border-node-volt shadow-lg'
                          : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{type.label}</div>
                      <div className="text-xs opacity-80">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cycle Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Training Cycle</label>
                <div className="grid grid-cols-4 gap-2">
                  {CYCLES.map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setFormData({ ...formData, cycle: cycle as any })}
                      className={`px-4 py-3 rounded border transition-colors ${
                        formData.cycle === cycle
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-text mt-2">
                  {formData.cycle === 'BASE' && 'Establish baseline, moderate intensity'}
                  {formData.cycle === 'LOAD' && 'Increase volume/intensity'}
                  {formData.cycle === 'INTENSIFY' && 'Peak intensity, lower volume'}
                  {formData.cycle === 'DELOAD' && 'Recovery week, lower intensity'}
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
              </div>

              {/* Classes Per Day */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">
                  Classes Per Day: {formData.classesPerDay}
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={formData.classesPerDay}
                  onChange={(e) => setFormData({ ...formData, classesPerDay: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-text mt-1">
                  System will balance 3-4 different workouts, each appearing 2 times per day
                </p>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
              </div>

              {/* Exclude Times */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Exclude Times (e.g., lunch break)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.excludeTimes.map((time) => (
                    <span
                      key={time}
                      className="bg-node-volt/20 border border-node-volt/50 text-node-volt px-3 py-1 rounded-lg flex items-center gap-2"
                    >
                      {time}
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          excludeTimes: formData.excludeTimes.filter((t) => t !== time),
                        })}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="time"
                    id="excludeTime"
                    className="bg-tech-grey border border-border-dark rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const time = input.value;
                        if (time && !formData.excludeTimes.includes(time)) {
                          setFormData({
                            ...formData,
                            excludeTimes: [...formData.excludeTimes, time],
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('excludeTime') as HTMLInputElement;
                      const time = input.value;
                      if (time && !formData.excludeTimes.includes(time)) {
                        setFormData({
                          ...formData,
                          excludeTimes: [...formData.excludeTimes, time],
                        });
                        input.value = '';
                      }
                    }}
                    className="bg-tech-grey border border-border-dark text-text-white px-4 py-2 rounded-lg hover:border-node-volt"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Training Level */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Training Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {TRAINING_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, trainingLevel: level })}
                      className={`px-4 py-2 rounded border transition-colors ${
                        formData.trainingLevel === level
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Primary Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRAINING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, goal })}
                      className={`px-4 py-2 rounded border transition-colors ${
                        formData.goal === goal
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">
                  Available Time: {formData.availableMinutes} minutes
                </label>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={formData.availableMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, availableMinutes: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-text">Available Equipment</label>
                <div className="grid grid-cols-4 gap-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => handleEquipmentToggle(equipment)}
                      className={`px-4 py-2 rounded border transition-colors ${
                        formData.equipment.includes(equipment)
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateWorkouts}
                disabled={loading || formData.equipment.length === 0}
                className="w-full bg-node-volt text-dark font-bold py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-lg"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {loading ? 'Generating Workouts...' : 'Generate Workouts →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 'schedule' && (
          <div className="bg-concrete-grey border border-border-dark rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Schedule Configuration
            </h2>
            <p className="text-muted-text mb-6">
              {generatedWorkouts.length} workouts generated. Configure how they'll be scheduled.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('config')}
                className="bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:border-node-volt"
              >
                ← Back
              </button>
              <button
                onClick={generateSchedule}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90"
              >
                Generate Schedule →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="bg-concrete-grey border border-border-dark rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Review Schedule
            </h2>
            <div className="space-y-6 mb-8">
              {schedule.map((day, idx) => (
                <div key={idx} className="bg-tech-grey border border-border-dark rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {day.dayName} - {day.date}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {day.classes.map((classItem: any, classIdx: number) => (
                      <div
                        key={classIdx}
                        className="bg-concrete-grey border border-border-dark rounded-lg p-4"
                      >
                        <div className="text-node-volt font-bold mb-1">{classItem.time}</div>
                        <div className="text-sm text-muted-text">{classItem.workout.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('schedule')}
                className="bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:border-node-volt"
              >
                ← Back
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Schedule to Calendar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

