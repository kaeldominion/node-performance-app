# Exercises & Programs Setup Guide

## 1. Seeding Exercises into Database

### Option A: Using the existing seed script

```bash
cd backend
npm run prisma:seed:exercises
```

This will:
- Read exercises from `backend/prisma/seed-exercises.ts`
- Upsert all exercises (creates new or updates existing)
- Create/update exercise tiers (Silver, Gold, Black)

### Option B: Using the admin API (if you have an admin endpoint)

You can also create exercises via API if you have an admin controller set up.

### Current Exercise Count
The seed file contains **~100+ exercises** covering:
- Strength movements (bench, squat, deadlift variations)
- Engine work (running, rowing, biking)
- Gymnastics (pull-ups, muscle-ups, handstand work)
- Kettlebell flows
- Core and mobility

## 2. Creating Programs

### Program Types

Programs can be created by:
1. **Admin** - System-wide public programs
2. **Coaches** - Programs they create for their clients
3. **Users** - Personal programs (can be shared)

### Program Schema

```typescript
{
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  level?: TrainingLevel; // BEGINNER, INTERMEDIATE, ADVANCED, ELITE
  goal?: TrainingGoal; // STRENGTH, HYPERTROPHY, HYBRID, etc.
  durationWeeks?: number;
  isPublic: boolean; // true = shareable, false = private
  createdBy?: string; // userId (null for system/admin programs)
  coachId?: string; // If created by a coach
  currentCycle?: ProgramCycle; // BASE, LOAD, INTENSIFY, etc.
  workouts: Workout[]; // Array of workouts in the program
}
```

### Creating Programs via API

**Admin/System Program:**
```typescript
POST /programs
{
  "name": "NØDE Core Weekly",
  "slug": "node-core-weekly",
  "description": "6-day hybrid program",
  "level": "INTERMEDIATE",
  "goal": "HYBRID",
  "durationWeeks": 6,
  "isPublic": true,
  "createdBy": null, // or admin userId
  "workouts": [...]
}
```

**Coach Program:**
```typescript
POST /programs
{
  "name": "Hyrox Prep 12-Week",
  "slug": "hyrox-prep-12-week",
  "description": "12-week Hyrox competition prep",
  "level": "ADVANCED",
  "goal": "CONDITIONING",
  "durationWeeks": 12,
  "isPublic": false, // Private to coach
  "createdBy": "coach-user-id",
  "coachId": "coach-profile-id",
  "workouts": [...]
}
```

**User Program:**
```typescript
POST /programs
{
  "name": "My Custom Program",
  "slug": "my-custom-program",
  "description": "Personal training program",
  "isPublic": false, // Private by default
  "createdBy": "user-id",
  "workouts": [...]
}
```

### Program Sharing

- `isPublic: true` - Program appears in public program list
- `isPublic: false` - Only visible to creator (and coach if `coachId` is set)
- Coaches can share programs with specific clients via `ProgramAssignment`

## 3. ChatGPT Integration with Exercises & Workout Examples

### Current State

The AI service (`backend/src/ai/ai.service.ts`) currently:
- ✅ Receives user parameters (goal, level, equipment, time)
- ✅ Has archetype guidance
- ❌ **Does NOT** receive exercise database
- ❌ **Does NOT** receive REVL/Hyrox workout examples

### What Gets Passed to ChatGPT

Currently:
- User parameters (goal, level, equipment, time)
- Archetype guidance (structure and examples)
- System prompt with JSON schema

**Missing:**
- Exercise database (names, equipment, movement patterns)
- REVL workout examples
- Hyrox workout examples

### Recommended Updates

1. **Include Exercise Database in Prompt**
   - Pass exercise names, equipment, movement patterns
   - Helps ChatGPT use correct exercise names
   - Ensures exercises match available equipment

2. **Include REVL/Hyrox Examples**
   - Add workout examples from REVL
   - Add workout examples from Hyrox
   - Helps ChatGPT understand rep schemes, structure, intensity

3. **Exercise Filtering**
   - Filter exercises by available equipment
   - Filter by movement pattern needed
   - Filter by archetype suitability

## 4. Next Steps

### Immediate Actions

1. **Seed Exercises:**
   ```bash
   cd backend
   npm run prisma:seed:exercises
   ```

2. **Update AI Service** to include:
   - Exercise database in prompts
   - REVL workout examples
   - Hyrox workout examples

3. **Create Program DTOs** with proper validation:
   - `CreateProgramDto` with required/optional fields
   - Role-based creation (admin vs user vs coach)
   - Sharing permissions

4. **Add Program Endpoints:**
   - `POST /programs` - Create program (with auth)
   - `GET /programs/my` - Get user's programs
   - `GET /programs/coach` - Get coach's programs
   - `PUT /programs/:id` - Update program
   - `DELETE /programs/:id` - Delete program

### Files to Update

1. `backend/src/ai/ai.service.ts` - Add exercise data and examples
2. `backend/src/programs/dto/create-program.dto.ts` - Create DTO
3. `backend/src/programs/programs.controller.ts` - Add auth guards
4. `backend/src/programs/programs.service.ts` - Add user/coach filtering



