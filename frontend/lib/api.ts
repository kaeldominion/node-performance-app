import axios from 'axios';

// Log API URL at module load time for debugging
const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
if (typeof window !== 'undefined') {
  console.log('🌐 API Configuration:', {
    baseURL: apiBaseURL,
    envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using default localhost:4000)',
    isProduction: process.env.NODE_ENV === 'production',
  });
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 300 seconds (5 minutes) timeout for long-running AI requests
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
    // Only log warning (not error) for protected endpoints without token
    // This can happen during initial load before auth is ready, which is normal
    // Only log as error in production if we're sure auth should be ready
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Request made without token (may be normal during initial load):', {
        url: config?.url || 'unknown',
        method: config?.method || 'unknown',
        baseURL: config?.baseURL,
        isPublicEndpoint: false,
      });
    }
    // In production, only log if we have URL info (to avoid noise)
    else if (config?.url) {
      console.warn('⚠️ Request made without token:', config.url);
    }
  }
  return config;
});

// Log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // IMMEDIATE logging of raw error for debugging - ALWAYS log, not just in development
    console.log('🔍 [INTERCEPTOR] Raw error received:', {
      error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
      errorMessage: error?.message,
      errorCode: error?.code,
      errorName: error?.name,
      errorStack: error?.stack,
      isAxiosError: error?.isAxiosError,
      hasResponse: !!error?.response,
      hasRequest: !!error?.request,
      hasConfig: !!error?.config,
      configUrl: error?.config?.url,
      configMethod: error?.config?.method,
      // Try direct property access
      directMessage: (error as any)?.message,
      directCode: (error as any)?.code,
      directName: (error as any)?.name,
    });
    
    // Safety check: ensure error is an object
    if (!error || typeof error !== 'object') {
      console.error('❌ API call failed - Invalid error type:', {
        errorType: typeof error,
        errorValue: error,
        errorString: String(error),
      });
      return Promise.reject(error);
    }
    
    // Handle case where error is an empty object or has no useful properties
    const errorKeys = Object.keys(error || {});
    if (errorKeys.length === 0) {
      // Try to get properties using Object.getOwnPropertyNames (includes non-enumerable)
      const allProps = error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [];
      console.error('❌ API call failed - Empty error object (enumerable keys):', {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorString: String(error),
        enumerableKeys: errorKeys,
        allPropertyNames: allProps,
        stack: error?.stack,
        // Try to access common error properties directly
        message: (error as any)?.message,
        name: (error as any)?.name,
        code: (error as any)?.code,
        response: (error as any)?.response,
        request: (error as any)?.request,
        config: (error as any)?.config,
        isAxiosError: (error as any)?.isAxiosError,
      });
      // Try to get more info from the error itself
      const fallbackError = {
        message: (error as any)?.message || 'Unknown error - empty error object',
        name: (error as any)?.name || 'Error',
        code: (error as any)?.code,
        stack: (error as any)?.stack,
        toString: (error as any)?.toString?.(),
        isAxiosError: (error as any)?.isAxiosError,
        hasResponse: !!(error as any)?.response,
        hasRequest: !!(error as any)?.request,
        hasConfig: !!(error as any)?.config,
      };
      console.error('❌ API call failed (fallback with direct property access):', fallbackError);
      return Promise.reject(error);
    }
    
    // Extract error status early to determine if we should log verbosely
    const errorStatus = error?.response?.status || error?.status || error?.statusCode;
    const isExpected401 = errorStatus === 401 && !currentToken;
    
    // Only log raw error details in development for unexpected errors
    if (process.env.NODE_ENV === 'development' && !isExpected401) {
      console.debug('🔍 Error received in interceptor:', {
        status: errorStatus,
        url: error?.config?.url,
        hasResponse: !!error?.response,
        hasRequest: !!error?.request,
        errorKeys: Object.keys(error || {}),
      });
    }
    
    // Check if this is a public endpoint - log less verbosely for public endpoints
    const isPublicEndpoint = (error?.config as any)?.isPublicEndpoint;
    
    // Check if it's a network error (no response from server) or timeout
    const isNetworkError = !error?.response && error?.request;
    const isTimeoutError = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT');
    
    if (isNetworkError || isTimeoutError) {
      // Network error - backend is likely not running or unreachable
      const baseURL = error?.config?.baseURL || api.defaults.baseURL;
      const fullURL = baseURL + error?.config?.url;
      
      // Log network/timeout errors with full details
      const errorType = isTimeoutError ? 'Request timed out' : 'Connection failed';
      console.error(`❌ ${errorType}:`, {
        baseURL: baseURL,
        endpoint: error?.config?.url,
        method: error?.config?.method,
        fullURL: fullURL,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorName: error?.name,
        errorType: typeof error,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        timeout: isTimeoutError,
        envAPIUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using default)',
        // Log raw error for debugging
        rawError: error,
      });
      
      // Only log troubleshooting once per session to avoid console spam
      if (!(window as any).__backendUnreachableLogged) {
        console.warn('⚠️ Backend unreachable or request timed out - some features may be unavailable', {
          baseURL: baseURL,
          endpoint: error?.config?.url,
          errorType,
        });
        (window as any).__backendUnreachableLogged = true;
        
        // Only log detailed errors in development
        if (process.env.NODE_ENV === 'development') {
          console.debug('💡 TROUBLESHOOTING:', {
            attemptedURL: fullURL,
            method: error?.config?.method,
            timeout: isTimeoutError ? 'Request timed out' : 'Connection failed',
            errorCode: error?.code,
            errorMessage: error?.message,
            envAPIUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using default)',
          });
          console.debug('1. Make sure the backend is running on', baseURL);
          console.debug('2. Start the backend: cd backend && npm run start:dev');
          console.debug('3. Verify NEXT_PUBLIC_API_URL is set correctly');
          if (isTimeoutError) {
            console.debug('4. Request timed out - the AI generation may be taking too long');
            console.debug('5. Check backend logs for OpenAI API issues');
          }
        }
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
      // First, check if error is actually an object and has properties
      const errorIsValid = error && typeof error === 'object' && Object.keys(error).length > 0;
      
      // Extract error details first
      const errorStatus = error?.response?.status || error?.status || error?.statusCode;
      const errorUrl = error?.config?.url || error?.request?.responseURL || error?.url || 'unknown';
      const errorMethod = (error?.config?.method || error?.method || 'unknown').toUpperCase();
      
      // Check if this is an expected 401 (no token = expected, token present = unexpected)
      const isExpected401 = errorStatus === 401 && !currentToken;
      
      if (!errorIsValid) {
        // Error is empty, null, undefined, or not an object
        if (!isExpected401) {
          console.error('❌ API call failed - Invalid error object:', {
            errorType: typeof error,
            errorValue: error,
            errorString: String(error),
            errorKeys: error ? Object.keys(error) : [],
          });
        }
      } else {
        // Safely extract error information - always try to get useful details
        const errorStatusText = error?.response?.statusText;
        const errorData = error?.response?.data;
        
        // Extract error message with better handling for validation errors
        let errorMessage = error?.message || 'Unknown error';
        if (errorData) {
          // Check for validation error array (NestJS validation pipe format)
          if (Array.isArray(errorData.message)) {
            errorMessage = `Validation failed: ${errorData.message.join(', ')}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        }
        
        // Build comprehensive error info - ALWAYS include method and URL (even if 'unknown')
        // Extract method with multiple fallbacks
        let extractedMethod = errorMethod;
        if (!extractedMethod || extractedMethod === 'UNKNOWN' || extractedMethod === 'unknown') {
          extractedMethod = error?.config?.method?.toUpperCase() || 
                           error?.method?.toUpperCase() || 
                           'UNKNOWN';
        }
        
        // Extract URL with multiple fallbacks
        let extractedUrl = errorUrl;
        if (!extractedUrl || extractedUrl === 'unknown') {
          extractedUrl = error?.config?.url || 
                        error?.config?.baseURL || 
                        error?.request?.responseURL || 
                        error?.url || 
                        'unknown';
        }
        
        // Build errorInfo object - always ensure it has at least method and url
        const errorInfo: any = {
          method: extractedMethod,
          url: extractedUrl,
        };
        
        // Always include status if available
        if (errorStatus) {
          errorInfo.status = errorStatus;
          if (errorStatusText) errorInfo.statusText = errorStatusText;
        }
        
        // Include message if available and meaningful
        if (errorMessage && errorMessage !== 'Unknown error' && errorMessage !== '') {
          errorInfo.message = errorMessage;
        }
        
        // Include response data if available (but limit size)
        if (errorData) {
          try {
            if (typeof errorData === 'object' && errorData !== null) {
              const dataStr = JSON.stringify(errorData);
              if (dataStr.length < 500) {
                errorInfo.data = errorData;
              } else {
                errorInfo.data = 'Response data too large to display';
              }
            } else {
              errorInfo.data = String(errorData);
            }
          } catch (e) {
            errorInfo.data = 'Could not serialize response data';
          }
        }
        
        // Add diagnostic info to help with debugging - always add these
        errorInfo.hasResponse = !!error?.response;
        errorInfo.hasRequest = !!error?.request;
        errorInfo.hasConfig = !!error?.config;
        
        // Always add raw error details for debugging if we don't have good info
        if (!errorInfo.status && !errorInfo.message) {
          errorInfo.errorType = typeof error;
          errorInfo.errorConstructor = error?.constructor?.name;
          if (error?.message) errorInfo.rawMessage = error.message;
          if (error?.stack) errorInfo.hasStack = true;
          // Add all available error properties for debugging
          if (error && typeof error === 'object') {
            errorInfo.errorKeys = Object.keys(error);
            // Try to extract any useful info from the error object
            if (error.code) errorInfo.code = error.code;
            if (error.name) errorInfo.name = error.name;
          }
        }
        
        // Handle 401 errors differently based on whether token exists
        if (errorStatus === 401) {
          if (!currentToken) {
            // Expected 401 - no token yet (during initial load)
            // Only log in development and as debug, not error
            if (process.env.NODE_ENV === 'development') {
              console.debug('🔐 Authentication required (no token yet):', {
                url: errorInfo.url,
                method: errorInfo.method,
                note: 'This is expected during initial page load before auth is ready',
              });
            }
            // Don't log as error - this is expected behavior
            return Promise.reject(error);
          } else {
            // Unexpected 401 - token exists but is invalid/expired
            console.warn('🔐 Authentication failed (token may be expired):', errorInfo);
            console.warn('   Token exists but was rejected - user may need to log in again');
          }
        } else {
          // For non-401 errors, always log
          // Ensure errorInfo is a valid object with at least some properties
          const errorInfoKeys = Object.keys(errorInfo || {});
          const hasValidMethod = errorInfo?.method && errorInfo.method !== 'UNKNOWN' && errorInfo.method !== 'unknown';
          const hasValidUrl = errorInfo?.url && errorInfo.url !== 'unknown';
          
          // If errorInfo is empty or invalid, use fallback
          if (errorInfoKeys.length === 0 || !hasValidMethod || !hasValidUrl) {
            // Fallback: log raw error with all available info
            const fallbackInfo: any = {
              method: extractedMethod || error?.config?.method || error?.method || 'UNKNOWN',
              url: extractedUrl || error?.config?.url || error?.request?.responseURL || error?.url || 'unknown',
              status: error?.response?.status || error?.status || error?.statusCode,
              message: error?.message || error?.response?.data?.message || 'No error message available',
              errorType: typeof error,
              errorConstructor: error?.constructor?.name,
              errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
              hasResponse: !!error?.response,
              hasRequest: !!error?.request,
              hasConfig: !!error?.config,
            };
            
            // Try to extract more info from nested objects
            if (error?.config) {
              fallbackInfo.configKeys = Object.keys(error.config);
              fallbackInfo.configUrl = error.config.url;
              fallbackInfo.configMethod = error.config.method;
              fallbackInfo.configBaseURL = error.config.baseURL;
            }
            if (error?.response) {
              fallbackInfo.responseStatus = error.response.status;
              fallbackInfo.responseStatusText = error.response.statusText;
              fallbackInfo.responseData = error.response.data;
            }
            if (error?.request) {
              fallbackInfo.requestResponseURL = error.request.responseURL;
            }
            
            console.error('❌ API call failed (fallback logging):', fallbackInfo);
            // Also log the raw error for deep debugging
            if (process.env.NODE_ENV === 'development') {
              console.error('Raw error object:', error);
              console.error('ErrorInfo that was empty:', errorInfo);
              console.error('ErrorInfo keys:', errorInfoKeys);
            }
          } else {
            // Ensure errorInfo is properly formatted before logging
            // Always include base properties, even if they're defaults
            const logInfo: any = {
              method: String(errorInfo?.method || 'UNKNOWN'),
              url: String(errorInfo?.url || 'unknown'),
              hasResponse: errorInfo?.hasResponse ?? false,
              hasRequest: errorInfo?.hasRequest ?? false,
              hasConfig: errorInfo?.hasConfig ?? false,
            };
            
            // Add optional properties if they exist
            if (errorInfo?.status) logInfo.status = errorInfo.status;
            if (errorInfo?.statusText) logInfo.statusText = errorInfo.statusText;
            if (errorInfo?.message) logInfo.message = errorInfo.message;
            if (errorInfo?.data) logInfo.data = errorInfo.data;
            
            // Check if we have meaningful info
            const hasMeaningfulInfo = logInfo.status || logInfo.message || 
              (logInfo.method && logInfo.method !== 'UNKNOWN' && logInfo.url && logInfo.url !== 'unknown');
            
            // ALWAYS log something - if logInfo seems empty, add raw error details
            // Also check if logInfo will serialize to {} (only has undefined/null values)
            const logInfoKeys = Object.keys(logInfo).filter(k => logInfo[k] !== undefined && logInfo[k] !== null);
            const willBeEmpty = logInfoKeys.length === 0 || (!hasMeaningfulInfo && logInfoKeys.length <= 3);
            
            if (willBeEmpty) {
              // Try to extract all possible error information
              const rawErrorDetails: any = {
                errorType: typeof error,
                errorConstructor: error?.constructor?.name,
                errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
                errorMessage: error?.message,
                errorStack: error?.stack,
                // Axios-specific
                isAxiosError: error?.isAxiosError,
                code: error?.code,
                name: error?.name,
                // Config info
                configUrl: error?.config?.url,
                configMethod: error?.config?.method,
                configBaseURL: error?.config?.baseURL,
                configTimeout: error?.config?.timeout,
                // Response info
                responseStatus: error?.response?.status,
                responseStatusText: error?.response?.statusText,
                responseData: error?.response?.data,
                responseHeaders: error?.response?.headers,
                // Request info
                requestReadyState: error?.request?.readyState,
                requestStatus: error?.request?.status,
                requestResponseURL: error?.request?.responseURL,
                // Try to stringify the entire error
                errorString: String(error),
              };
              
              // Try to get all property names (including non-enumerable)
              if (error && typeof error === 'object') {
                try {
                  rawErrorDetails.allPropertyNames = Object.getOwnPropertyNames(error);
                  // Try to access common properties directly
                  rawErrorDetails.directProperties = {
                    message: (error as any).message,
                    name: (error as any).name,
                    code: (error as any).code,
                    stack: (error as any).stack,
                    isAxiosError: (error as any).isAxiosError,
                    response: (error as any).response,
                    request: (error as any).request,
                    config: (error as any).config,
                  };
                } catch (e) {
                  rawErrorDetails.propertyExtractionError = String(e);
                }
              }
              
              console.error('❌ API call failed - Empty error info, logging comprehensive error details:', rawErrorDetails);
              console.error('❌ Raw error object (full dump):', error);
              // Also try to stringify the error to see if it has hidden properties
              try {
                console.error('❌ Error JSON (if possible):', JSON.stringify(error, Object.getOwnPropertyNames(error)));
              } catch (e) {
                console.error('❌ Could not stringify error:', e);
              }
            } else {
              // Build final log info with all available data
              const finalLogInfo: any = {
                method: logInfo.method,
                url: logInfo.url,
                hasResponse: logInfo.hasResponse,
                hasRequest: logInfo.hasRequest,
                hasConfig: logInfo.hasConfig,
              };
              
              // Add optional fields if they exist
              if (logInfo.status) finalLogInfo.status = logInfo.status;
              if (logInfo.statusText) finalLogInfo.statusText = logInfo.statusText;
              if (logInfo.message) finalLogInfo.message = logInfo.message;
              if (logInfo.data) finalLogInfo.data = logInfo.data;
              
              // If we still don't have meaningful info, add error details
              if (!finalLogInfo.status && !finalLogInfo.message && 
                  (finalLogInfo.method === 'UNKNOWN' || finalLogInfo.url === 'unknown')) {
                finalLogInfo.errorDetails = {
                  errorType: typeof error,
                  errorConstructor: error?.constructor?.name,
                  errorMessage: error?.message,
                  errorCode: error?.code,
                  errorName: error?.name,
                  isAxiosError: error?.isAxiosError,
                  hasResponse: !!error?.response,
                  hasRequest: !!error?.request,
                  hasConfig: !!error?.config,
                  configUrl: error?.config?.url,
                  configMethod: error?.config?.method,
                  responseStatus: error?.response?.status,
                  responseData: error?.response?.data,
                  requestStatus: error?.request?.status,
                };
              }
              
              // For 400 errors, always log the response data to see validation errors
              if (finalLogInfo.status === 400 && error?.response?.data) {
                console.error('❌ Validation Error Details:', error.response.data);
                if (Array.isArray(error.response.data.message)) {
                  console.error('❌ Validation Error Messages:');
                  error.response.data.message.forEach((msg: string, idx: number) => {
                    console.error(`  ${idx + 1}. ${msg}`);
                  });
                }
                finalLogInfo.validationErrors = error.response.data;
                if (Array.isArray(error.response.data.message)) {
                  finalLogInfo.validationMessages = error.response.data.message;
                }
              }
              
              // For 500 errors, also log the response data to see server errors
              if (finalLogInfo.status === 500 && error?.response?.data) {
                console.error('❌ Server Error Details:', error.response.data);
                console.error('❌ Server Error Message:', error.response.data.message || error.response.data.error || 'Unknown server error');
                finalLogInfo.serverError = error.response.data;
              }
              
              console.error('❌ API call failed:', finalLogInfo);
              
              // ALWAYS log raw error for debugging
              console.error('❌ Raw error object:', error);
              console.error('❌ Error keys:', error && typeof error === 'object' ? Object.keys(error) : []);
              console.error('❌ Error string:', String(error));
            }
          }
          
          // If errorInfo seems incomplete, also log raw error for debugging
          if (!errorInfo.status && !errorInfo.message && process.env.NODE_ENV === 'development') {
            console.debug('Raw error object for debugging:', {
              errorType: typeof error,
              errorConstructor: error?.constructor?.name,
              errorKeys: error ? Object.keys(error) : [],
              hasResponse: !!error?.response,
              hasRequest: !!error?.request,
              hasConfig: !!error?.config,
              fullError: error,
            });
          }
        }
      }
      
      // Log additional details in development for non-expected errors
      if (process.env.NODE_ENV === 'development' && !isExpected401) {
        if (error?.response) {
          // Server responded with error - log details
          console.debug('📋 Server error details:', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            method: error.config?.method,
          });
        } else if (error?.request && !error?.response) {
          // Network error - already handled above, but log additional context
          console.debug('📋 Network error details:', {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
          });
        }
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
  deleteAdmin: async (id: string) => {
    const response = await api.delete(`/workouts/admin/${id}`);
    return response.data;
  },
  generateShareLink: async (id: string) => {
    const response = await api.post(`/workouts/${id}/share`);
    return response.data;
  },
  getTopRated: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/workouts/top-rated${params}`);
    return response.data;
  },
  addFavorite: async (id: string) => {
    const response = await api.post(`/workouts/${id}/favorite`);
    return response.data;
  },
  removeFavorite: async (id: string) => {
    const response = await api.delete(`/workouts/${id}/favorite`);
    return response.data;
  },
  getFavorites: async () => {
    const response = await api.get('/workouts/favorites');
    return response.data;
  },
  copyWorkout: async (id: string) => {
    const response = await api.post(`/workouts/${id}/copy`);
    return response.data;
  },
  getShareQR: async (id: string) => {
    const response = await api.get(`/workouts/${id}/share-qr`);
    return response.data;
  },
  createRating: async (id: string, ratingData: {
    sessionLogId?: string;
    starRating: number;
    difficultyRating?: number;
    enjoymentRating?: number;
    effectivenessRating?: number;
    wouldDoAgain?: boolean;
    tags?: string[];
    notes?: string;
    favoriteExercises?: string[];
  }) => {
    const response = await api.post(`/workouts/${id}/ratings`, ratingData);
    return response.data;
  },
  getRatings: async (id: string) => {
    const response = await api.get(`/workouts/${id}/ratings`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
  getUserRating: async (id: string) => {
    const response = await api.get(`/workouts/${id}/ratings/user`);
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
  complete: async (id: string, data: { durationSec?: number; completed: boolean; rpe?: number; metrics?: any; notes?: string; bypassValidation?: boolean }) => {
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
    // Log the request data for debugging
    console.log('📤 Sending workout generation request:', {
      goal: data.goal,
      trainingLevel: data.trainingLevel,
      equipment: data.equipment,
      availableMinutes: data.availableMinutes,
      archetype: data.archetype,
      sectionPreferences: data.sectionPreferences,
      workoutType: data.workoutType,
      cycle: data.cycle,
      isHyrox: data.isHyrox,
      includeHyrox: data.includeHyrox,
    });
    const response = await api.post('/ai/generate-workout', data);
    return response.data;
  },
};

// Exercises API (public endpoints)
export const exercisesApi = {
  getAll: async () => {
    const response = await api.get('/exercises', {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/exercises/${id}`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
  search: async (query: string) => {
    const params = new URLSearchParams({ q: query });
    const response = await api.get(`/exercises?${params.toString()}`, {
      isPublicEndpoint: true,
    } as any);
    return response.data;
  },
};

// Admin API - Exercises
export const adminApi = {
  syncClerkUsers: async () => {
    const response = await api.post('/admin/users/sync-clerk');
    return response.data;
  },
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
    try {
      const response = await api.get('/analytics/percentiles');
      return response.data;
    } catch (error: any) {
      // Silently handle 404s (endpoint doesn't exist yet)
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
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
  upgradeToCoach: async (data: any) => {
    const response = await api.post('/coaches/upgrade', data);
    return response.data;
  },
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
  assignWorkout: async (clientId: string, data: { workoutId: string; scheduledFor?: string; dueDate?: string; notes?: string }) => {
    const response = await api.post(`/coaches/clients/${clientId}/workouts`, data);
    return response.data;
  },
  getClientWorkouts: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/workouts`);
    return response.data;
  },
  getClientUpcomingWorkouts: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/workouts/upcoming`);
    return response.data;
  },
  updateWorkoutAssignmentStatus: async (assignmentId: string, data: { status: string; clientNotes?: string }) => {
    const response = await api.put(`/coaches/workouts/assignments/${assignmentId}/status`, data);
    return response.data;
  },
  searchClients: async (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    const response = await api.get(`/coaches/search-clients?${params.toString()}`);
    return response.data;
  },
  sendInvitation: async (data: { clientId: string; message?: string }) => {
    const response = await api.post('/coaches/invitations', data);
    return response.data;
  },
  acceptInvitation: async (coachId: string, inviteCode?: string) => {
    const response = await api.post(`/coaches/invitations/${coachId}/accept`, { inviteCode });
    return response.data;
  },
  declineInvitation: async (coachId: string) => {
    const response = await api.post(`/coaches/invitations/${coachId}/decline`);
    return response.data;
  },
  getPendingInvitations: async () => {
    const response = await api.get('/coaches/invitations/pending');
    return response.data;
  },
  getClientProgress: async (clientId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/coaches/clients/${clientId}/progress?${params.toString()}`);
    return response.data;
  },
  getClientStats: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/stats`);
    return response.data;
  },
  getClientWorkoutHistory: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/history`);
    return response.data;
  },
  getClientTrends: async (clientId: string, metric?: string) => {
    const params = metric ? `?metric=${metric}` : '';
    const response = await api.get(`/coaches/clients/${clientId}/trends${params}`);
    return response.data;
  },
  scheduleSession: async (data: { clientId: string; scheduledAt: string; workoutId?: string; location?: string }) => {
    const response = await api.post('/coaches/sessions', data);
    return response.data;
  },
  generateQRCode: async (sessionId: string) => {
    const response = await api.post(`/coaches/sessions/${sessionId}/qr-code`);
    return response.data;
  },
  checkInWithQR: async (sessionId: string, qrCodeId: string) => {
    const response = await api.post(`/coaches/sessions/${sessionId}/check-in`, { qrCodeId });
    return response.data;
  },
  startSession: async (sessionId: string) => {
    const response = await api.post(`/coaches/sessions/${sessionId}/start`);
    return response.data;
  },
  completeSession: async (sessionId: string, data: { notes?: string; clientFeedback?: string }) => {
    const response = await api.post(`/coaches/sessions/${sessionId}/complete`, data);
    return response.data;
  },
  getUpcomingSessions: async () => {
    const response = await api.get('/coaches/sessions');
    return response.data;
  },
  getClientSessions: async (clientId: string) => {
    const response = await api.get(`/coaches/clients/${clientId}/sessions`);
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
  getAllAchievements: async () => {
    const response = await api.get('/gamification/achievements/all');
    return response.data;
  },
  checkAchievements: async () => {
    const response = await api.post('/gamification/achievements/check');
    return response.data;
  },
};

// Feedback API
export const feedbackApi = {
  create: async (data: {
    type: 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL_FEEDBACK' | 'UI_UX_FEEDBACK' | 'PERFORMANCE_ISSUE' | 'OTHER';
    title: string;
    description: string;
    category?: string;
    pageUrl?: string;
    userAgent?: string;
    metadata?: any;
  }) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
  getMyFeedback: async () => {
    const response = await api.get('/feedback/my-feedback');
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
