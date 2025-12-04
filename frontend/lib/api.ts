import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Log API URL in development to help debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; name?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
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
};

// User API
export const userApi = {
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/me/profile', data);
    return response.data;
  },
  getActivePrograms: async () => {
    const response = await api.get('/me/programs/active');
    return response.data;
  },
  startProgram: async (data: { programId: string; startDate: string }) => {
    const response = await api.post('/me/programs', data);
    return response.data;
  },
  getSchedule: async () => {
    const response = await api.get('/me/programs/schedule');
    const schedule = response.data || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySession = schedule.find((s: any) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    
    const upcoming = schedule.filter((s: any) => {
      const sessionDate = new Date(s.date);
      return sessionDate > today;
    }).slice(0, 7);
    
    return {
      today: todaySession || null,
      upcoming,
    };
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

export default api;

