# NØDE Platform Upgrade Plan

## Overview
Transforming NØDE from a basic workout app into a comprehensive "Training OS" with multiple user types, advanced features, and professional architecture.

## ✅ Phase 1: Foundation (COMPLETED)
- [x] Updated database schema with new models
- [x] Added UserRole enum (SUPERADMIN, HOME_USER, COACH, GYM_OWNER)
- [x] Added SubscriptionTier enum
- [x] Enhanced UserProfile with space, injuries, limitations
- [x] Created Coach system (CoachProfile, CoachClient, ProgramAssignment)
- [x] Created Gym system (GymProfile, GymMember, GymClass, GymClassAttendance)
- [x] Created WorkoutTemplate model for archetype structures
- [x] Enhanced SessionLog with detailed metrics, heart rate, program tracking

## 🔄 Phase 2: Core Backend Modules (IN PROGRESS)
- [ ] Update User service to handle roles and subscriptions
- [ ] Create Coach module (service, controller, DTOs)
- [ ] Create Gym module (service, controller, DTOs)
- [ ] Create Template module (service, controller, DTOs)
- [ ] Enhance Workout service with template support
- [ ] Enhance Session service with detailed metrics
- [ ] Update Auth to handle role-based access

## 📋 Phase 3: Enhanced Features
- [ ] Upgrade Workout Player (full-screen deck mode, timers, audio)
- [ ] Enhanced Progress Tracking (graphs, volume, RPE analysis)
- [ ] AI Engine improvements (better filtering, caching, validation)
- [ ] Program Engine enhancements (multi-week blocks, auto-adjust)

## 🎨 Phase 4: Frontend Modules
- [ ] Premium Landing Page
- [ ] Enhanced Workout Player UI
- [ ] Coach Portal UI
- [ ] Gym Portal UI
- [ ] Progress Dashboard with graphs
- [ ] Admin enhancements

## 💳 Phase 5: Business Layer
- [ ] Stripe integration for subscriptions
- [ ] Payment processing
- [ ] Subscription management
- [ ] Billing portal

## 🌐 Phase 6: Community Features
- [ ] Leaderboards
- [ ] Workout sharing
- [ ] Social features
- [ ] Coach pages

## Current Status
**Foundation Complete** - Database schema updated with all new models. Ready to build backend services.

