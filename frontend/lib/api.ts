import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token will be set by components using useApiToken hook
// This is a simpler approach for client-side requests
let currentToken: string | null = null;

export const setApiToken = (token: string | null) => {
  currentToken = token;
};

// Add Clerk token to requests
api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API call failed:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// Auth API - Clerk handles authentication, these are kept for compatibility
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    // Clerk handles login through their UI components
    throw new Error('Please use Clerk SignIn component for login');
  },
  register: async (data: { email: string; password: string; name?: string }) => {
    // Clerk handles registration through their UI components
    throw new Error('Please use Clerk SignUp component for registration');
  },
  logout: () => {
    // Clerk handles logout through their hooks
    // This is a no-op, use Clerk's signOut() instead
  },
};

// User API
export const userApi = {
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/me/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/me/profile', data);
    return response.data;
  },
  getSchedule: async () => {
    const response = await api.get('/me/schedule');
    return response.data;
  },
  startProgram: async (data: { programId: string; startDate: string }) => {
    const response = await api.post('/me/programs', data);
    return response.data;
  },
};

// Programs API
export const programsApi = {
  getAll: async () => {
    const response = await api.get('/programs');
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/programs/${slug}`);
    return response.data;
  },
};

// Workouts API
export const workoutsApi = {
  getById: async (id: string) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },
  getByShareId: async (shareId: string) => {
    const response = await api.get(`/workouts/share/${shareId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/workouts', data);
    return response.data;
  },
};

// Sessions API
export const sessionsApi = {
  create: async (data: { workoutId: string; startedAt?: string }) => {
    const response = await api.post('/me/sessions', data);
    return response.data;
  },
  complete: async (id: string, data: { durationSec?: number; completed: boolean; rpe?: number; metrics?: any; notes?: string }) => {
    const response = await api.put(`/me/sessions/${id}/complete`, data);
    return response.data;
  },
  getRecent: async () => {
    const response = await api.get('/me/sessions/recent');
    return response.data;
  },
  getByWorkout: async (workoutId: string) => {
    const response = await api.get(`/me/sessions/${workoutId}`);
    return response.data;
  },
};

// AI API
export const aiApi = {
  generateWorkout: async (data: {
    goal: string;
    trainingLevel: string;
    equipment: string[];
    availableMinutes: number;
    archetype?: string;
    sectionPreferences?: string[];
    workoutType?: 'single' | 'week' | 'month' | 'fourDay';
    cycle?: 'BASE' | 'LOAD' | 'INTENSIFY' | 'DELOAD';
  }) => {
    const response = await api.post('/ai/generate-workout', data);
    return response.data;
  },
};

// Admin API - Exercises
export const adminApi = {
  // Exercises
  getExercises: async () => {
    const response = await api.get('/exercises');
    return response.data;
  },
  getExercise: async (id: string) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
  createExercise: async (data: any) => {
    const response = await api.post('/exercises', data);
    return response.data;
  },
  updateExercise: async (id: string, data: any) => {
    const response = await api.patch(`/exercises/${id}`, data);
    return response.data;
  },
  deleteExercise: async (id: string) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/analytics/stats?${params.toString()}`);
    return response.data;
  },
  getStrengthProgress: async (exercise?: string) => {
    const params = exercise ? `?exercise=${exercise}` : '';
    const response = await api.get(`/analytics/strength${params}`);
    return response.data;
  },
  getEngineProgress: async () => {
    const response = await api.get('/analytics/engine');
    return response.data;
  },
  getWeeklySummary: async (weekStart?: string) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    const response = await api.get(`/analytics/weekly${params}`);
    return response.data;
  },
  getMonthlySummary: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    const response = await api.get(`/analytics/monthly?${params.toString()}`);
    return response.data;
  },
  getTrends: async (days: number = 30) => {
    const response = await api.get(`/analytics/trends?days=${days}`);
    return response.data;
  },
  // Coach endpoints for client analytics
  getClientStats: async (clientId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/analytics/clients/${clientId}/stats?${params.toString()}`);
    return response.data;
  },
  getClientTrends: async (clientId: string, days: number = 30) => {
    const response = await api.get(`/analytics/clients/${clientId}/trends?days=${days}`);
    return response.data;
  },
  getLeaderboard: async (metric: 'sessions' | 'hours' | 'rpe' | 'streak' = 'sessions', limit: number = 50) => {
    const response = await api.get(`/analytics/leaderboard?metric=${metric}&limit=${limit}`);
    return response.data;
  },
};

// Coach API
export const coachApi = {
  getProfile: async () => {
    const response = await api.get('/coaches/profile');
    return response.data;
  },
  createProfile: async (data: any) => {
    const response = await api.post('/coaches/profile', data);
    return response.data;
  },
  getClients: async () => {
    const response = await api.get('/coaches/clients');
    return response.data;
  },
  addClient: async (data: { clientId: string; notes?: string; status?: string }) => {
    const response = await api.post('/coaches/clients', data);
    return response.data;
  },
  removeClient: async (clientId: string) => {
    const response = await api.delete(`/coaches/clients/${clientId}`);
    return response.data;
  },
  assignProgram: async (clientId: string, programId: string, startDate?: string) => {
    const response = await api.post(`/coaches/clients/${clientId}/programs/${programId}`, { startDate });
    return response.data;
  },
  getClientAssignments: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/assignments`);
    return response.data;
  },
};

// Gym API
export const gymApi = {
  getProfile: async () => {
    const response = await api.get('/gyms/profile');
    return response.data;
  },
  createProfile: async (data: any) => {
    const response = await api.post('/gyms/profile', data);
    return response.data;
  },
  getMembers: async () => {
    const response = await api.get('/gyms/members');
    return response.data;
  },
  addMember: async (data: { memberId: string; membershipType?: string; status?: string }) => {
    const response = await api.post('/gyms/members', data);
    return response.data;
  },
  removeMember: async (memberId: string) => {
    const response = await api.delete(`/gyms/members/${memberId}`);
    return response.data;
  },
  getClasses: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/gyms/classes?${params.toString()}`);
    return response.data;
  },
  createClass: async (data: {
    name: string;
    scheduledAt: string;
    workoutId?: string;
    maxCapacity?: number;
    instructorId?: string;
  }) => {
    const response = await api.post('/gyms/classes', data);
    return response.data;
  },
  getClass: async (classId: string) => {
    const response = await api.get(`/gyms/classes/${classId}`);
    return response.data;
  },
  updateClass: async (classId: string, data: any) => {
    const response = await api.patch(`/gyms/classes/${classId}`, data);
    return response.data;
  },
  deleteClass: async (classId: string) => {
    const response = await api.delete(`/gyms/classes/${classId}`);
    return response.data;
  },
  getClassAttendance: async (classId: string) => {
    const response = await api.get(`/gyms/classes/${classId}/attendance`);
    return response.data;
  },
  markAttendance: async (classId: string, memberId: string, attended: boolean) => {
    const response = await api.post(`/gyms/classes/${classId}/attendance`, { memberId, attended });
    return response.data;
  },
};

export default api;
