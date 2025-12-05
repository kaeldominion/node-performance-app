import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds timeout for long-running AI requests
});

// Token will be set by components using useApiToken hook
// This is a simpler approach for client-side requests
let currentToken: string | null = null;

export const setApiToken = (token: string | null) => {
  console.log('setApiToken called:', { 
    hasToken: !!token, 
    tokenLength: token?.length,
    tokenPreview: token ? token.substring(0, 30) + '...' : null,
    currentTokenBefore: currentToken ? currentToken.substring(0, 20) + '...' : null,
  });
  currentToken = token;
  console.log('currentToken updated:', { 
    hasToken: !!currentToken,
    tokenLength: currentToken?.length,
  });
};

// Add Clerk token to requests
api.interceptors.request.use((config) => {
  // Check if this is a public endpoint (no auth required)
  const isPublicEndpoint = (config as any).isPublicEndpoint;
  
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
    // Only log token details in development for non-public endpoints
    if (!isPublicEndpoint && process.env.NODE_ENV === 'development') {
      try {
        const parts = currentToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('🔑 Sending request with token:', {
            url: config.url,
            method: config.method,
            tokenPreview: currentToken.substring(0, 30) + '...',
            jwtPayload: {
              sub: payload.sub,
              exp: payload.exp,
              iat: payload.iat,
              iss: payload.iss,
            },
          });
        }
      } catch (e) {
        // Silent fail
      }
    }
  } else if (!isPublicEndpoint) {
    // Only log error for protected endpoints that need a token
    console.error('❌ NO TOKEN AVAILABLE FOR REQUEST:', {
      url: config.url,
      method: config.method,
      currentToken: currentToken,
      tokenIsNull: currentToken === null,
      tokenIsUndefined: currentToken === undefined,
    });
  }
  return config;
});

// Log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if this is a public endpoint - log less verbosely for public endpoints
    const isPublicEndpoint = (error?.config as any)?.isPublicEndpoint;
    
    // Check if it's a network error (no response from server)
    const isNetworkError = !error?.response && error?.request;
    
    if (isNetworkError) {
      // Network error - backend is likely not running or unreachable
      const baseURL = error?.config?.baseURL || api.defaults.baseURL;
      
      // Only log detailed errors in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ NETWORK ERROR - Backend unreachable');
        console.warn('Attempted URL:', baseURL + error?.config?.url);
        console.warn('Base URL:', baseURL);
        console.warn('💡 TROUBLESHOOTING:');
        console.warn('1. Make sure the backend is running on', baseURL);
        console.warn('2. Start the backend: cd backend && npm run start:dev');
        console.warn('3. Verify NEXT_PUBLIC_API_URL is set correctly');
      } else {
        // In production, just log a simple warning
        console.warn('⚠️ Backend server unreachable. Some features may not work.');
      }
    } else if (isPublicEndpoint) {
      // For public endpoints, only log a simple warning
      if (process.env.NODE_ENV === 'development') {
        console.debug('API call failed (backend may be unavailable):', {
          url: error?.config?.url,
          status: error?.response?.status,
          message: error?.message,
        });
      }
    } else {
      // For protected endpoints with server responses, log full error details
      console.error('❌ API call failed');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error response status:', error?.response?.status);
      console.error('Error response statusText:', error?.response?.statusText);
      console.error('Error request:', error?.request);
      console.error('Error config:', error?.config);
      console.error('Error config URL:', error?.config?.url);
      console.error('Error config method:', error?.config?.method);
      console.error('Error stack:', error?.stack);
      
      // Try to stringify for debugging
      try {
        console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      } catch (e) {
        console.error('Could not stringify error:', e);
      }
      
      // Also log in a more readable format
      if (error?.response) {
        // Server responded with error
        console.error('❌ Server Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.response.headers,
        });
        // Log the actual error message from server
        if (error.response.data?.message) {
          console.error('📋 Server error message:', error.response.data.message);
        }
      } else if (error?.request) {
        // Request made but no response (network error)
        // Only log as warning for network errors - backend might be unavailable
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Network Error - Backend may be unavailable:', {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
          });
        }
      } else {
        // Error setting up request
        console.error('❌ Request Setup Error:', {
          message: error?.message,
          error: String(error),
        });
      }
    }
    
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
  getPublicProfile: async (userId: string) => {
    const response = await api.get(`/users/public/${userId}`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
  getPublicProfileStats: async (userId: string) => {
    const response = await api.get(`/users/public/${userId}/stats`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
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
  getSchedule: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const response = await api.get(`/me/programs/schedule${queryString ? `?${queryString}` : ''}`);
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
  createWithWorkouts: async (data: {
    name: string;
    description?: string;
    level?: string;
    goal?: string;
    durationWeeks?: number;
    cycle?: string;
    workouts: any[];
  }) => {
    const response = await api.post('/programs', data);
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
  getRecommended: async () => {
    const response = await api.get('/workouts/recommended', {
      isPublicEndpoint: true, // Mark as public - no auth required
    } as any);
    return response.data;
  },
  getMyWorkouts: async () => {
    const response = await api.get('/workouts/my-workouts');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/workouts', data);
    return response.data;
  },
  toggleRecommended: async (id: string, isRecommended: boolean) => {
    const response = await api.patch(`/workouts/${id}/recommended`, { isRecommended });
    return response.data;
  },
  getAll: async (filters?: {
    search?: string;
    createdBy?: string;
    archetype?: string;
    isRecommended?: boolean;
    startDate?: string;
    endDate?: string;
    isHyrox?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.createdBy) params.append('createdBy', filters.createdBy);
    if (filters?.archetype) params.append('archetype', filters.archetype);
    if (filters?.isRecommended !== undefined) params.append('isRecommended', String(filters.isRecommended));
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.isHyrox !== undefined) params.append('isHyrox', String(filters.isHyrox));
    
    const queryString = params.toString();
    const url = `/workouts/admin-all${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },
  generateShareLink: async (id: string) => {
    const response = await api.post(`/workouts/${id}/share`);
    return response.data;
  },
};

// Schedule API
export const scheduleApi = {
  create: async (data: {
    workoutId?: string;
    programId?: string;
    scheduledDate: string;
    duration?: number;
    notes?: string;
  }) => {
    const response = await api.post('/me/schedule', data);
    return response.data;
  },
  scheduleProgram: async (data: {
    programId: string;
    startDate: string;
    startTime?: string;
  }) => {
    const response = await api.post('/me/schedule/program', data);
    return response.data;
  },
  getSchedule: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/me/schedule?${params.toString()}`);
    return response.data;
  },
  update: async (id: string, data: {
    scheduledDate?: string;
    duration?: number;
    notes?: string;
    order?: number;
  }) => {
    const response = await api.put(`/me/schedule/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/me/schedule/${id}`);
    return response.data;
  },
  reorder: async (updates: Array<{ id: string; scheduledDate: string; order: number }>) => {
    const response = await api.post('/me/schedule/reorder', { updates });
    return response.data;
  },
};

// Network API
export const networkApi = {
  search: async (query: string) => {
    const response = await api.get(`/me/network/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  searchByCode: async (code: string) => {
    const response = await api.get(`/me/network/search-code?code=${encodeURIComponent(code)}`);
    return response.data;
  },
  searchByUsername: async (username: string) => {
    const response = await api.get(`/me/network/username/${encodeURIComponent(username)}`);
    return response.data;
  },
  sendRequest: async (addresseeId: string) => {
    const response = await api.post('/me/network', { addresseeId });
    return response.data;
  },
  acceptRequest: async (requestId: string) => {
    const response = await api.post(`/me/network/${requestId}/accept`);
    return response.data;
  },
  rejectRequest: async (requestId: string) => {
    const response = await api.post(`/me/network/${requestId}/reject`);
    return response.data;
  },
  remove: async (networkUserId: string) => {
    const response = await api.delete(`/me/network/${networkUserId}`);
    return response.data;
  },
  getNetwork: async () => {
    const response = await api.get('/me/network');
    return response.data;
  },
  getActivity: async () => {
    const response = await api.get('/me/network/activity');
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/me/network/pending');
    return response.data;
  },
  getDirectory: async (options?: {
    page?: number;
    limit?: number;
    search?: string;
    minLevel?: number;
    maxLevel?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.minLevel) params.append('minLevel', options.minLevel.toString());
    if (options?.maxLevel) params.append('maxLevel', options.maxLevel.toString());
    const response = await api.get(`/me/network/directory?${params.toString()}`);
    return response.data;
  },
  generateCode: async () => {
    const response = await api.post('/me/network/generate-code');
    return response.data;
  },
  generateShareLink: async (type?: 'code' | 'user') => {
    const response = await api.post('/me/network/share-link', { type });
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
    isHyrox?: boolean;
    includeHyrox?: boolean;
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
  getSystemStats: async () => {
    const response = await api.get('/analytics/admin/system');
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
  getLeaderboard: async (metric: 'sessions' | 'hours' | 'rpe' | 'streak' = 'sessions', limit: number = 50, trending: boolean = false, trendPeriod: '7d' | '30d' = '7d') => {
    const params = new URLSearchParams({
      metric,
      limit: limit.toString(),
      ...(trending && { trending: 'true', trendPeriod }),
    });
    const response = await api.get(`/analytics/leaderboard?${params.toString()}`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
  getPercentiles: async () => {
    const response = await api.get('/analytics/percentiles');
    return response.data;
  },
  getMonthTrends: async () => {
    const response = await api.get('/analytics/month-trends');
    return response.data;
  },
  getMyRank: async () => {
    const response = await api.get('/analytics/my-rank');
    return response.data;
  },
  getTrendComparison: async (period: '1m' | '3m' | '6m' | '1y' = '1m') => {
    const response = await api.get(`/analytics/trend-comparison?period=${period}`);
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
  bulkCreateClasses: async (classes: Array<{
    name: string;
    scheduledAt: string;
    workoutId?: string;
    maxCapacity?: number;
  }>) => {
    const response = await api.post('/gyms/classes/bulk', { classes });
    return response.data;
  },
};

// Gamification API
export const gamificationApi = {
  getStats: async () => {
    const response = await api.get('/gamification/stats');
    return response.data;
  },
  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },
  checkAchievements: async () => {
    const response = await api.post('/gamification/achievements/check');
    return response.data;
  },
};

// Notifications API
export const activityApi = {
  getFeed: async (options?: { page?: number; limit?: number; type?: string; since?: string }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.since) params.append('since', options.since);
    
    const response = await api.get(`/activity/feed?${params.toString()}`);
    return response.data;
  },
  getRecent: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/activity/feed/recent${params}`);
    return response.data;
  },
  getStats: async (days?: number) => {
    const params = days ? `?days=${days}` : '';
    const response = await api.get(`/activity/stats${params}`);
    return response.data;
  },
  getUserActivity: async (userId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/activity/user/${userId}${params}`);
    return response.data;
  },
};

export const notificationsApi = {
  getAll: async () => {
    const response = await api.get('/me/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/me/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (notificationId: string) => {
    const response = await api.post(`/me/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post('/me/notifications/read-all');
    return response.data;
  },
  delete: async (notificationId: string) => {
    const response = await api.delete(`/me/notifications/${notificationId}`);
    return response.data;
  },
  deleteAllRead: async () => {
    const response = await api.delete('/me/notifications/read/all');
    return response.data;
  },
};

export default api;
