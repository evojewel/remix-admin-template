/**
 * API Client utility for making requests to the backend API
 */

// Base API URL - will be determined at runtime
let API_BASE_URL = 'http://localhost:3001';

// Initialize the API URL based on the environment
export function initApiClient() {
  if (typeof window !== 'undefined') {
    // Client-side, use the location to determine API URL
    API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://your-production-api.com';
    console.log('API client initialized with URL:', API_BASE_URL);
  }
}

// Get the current API base URL
export function getApiBaseUrl() {
  return API_BASE_URL;
}

// Configure the WebSocket URL
export function getWebSocketUrl() {
  // Make sure to remove http:// or https:// and return just the host:port
  return `ws://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws`;
}

// Generic fetch with error handling
export async function apiFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // Make sure endpoint is properly formatted
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log(`Fetching: ${url}`, options);

    // Default timeout of 8 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    // Re-throw to allow component error handling
    throw error;
  }
}

// API methods for common operations
export const api = {
  // Check API status
  checkStatus: () => apiFetch<{status: 'online' | 'offline' | 'checking'}>('/api-status', {
    method: 'GET'
  }),
  
  // Get strategy status
  getStrategyStatus: () => apiFetch('/status', {
    method: 'GET'
  }),
  
  // Update strategy config
  updateConfig: (config: any) => apiFetch('/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  
  // Toggle strategy status
  updateStatus: (isRunning: boolean, exchange: string) => apiFetch('/status', {
    method: 'PUT',
    body: JSON.stringify({ is_running: isRunning, exchange }),
  }),
  
  // Get trade history
  getTrades: () => apiFetch('/trades', {
    method: 'GET'
  }),
  
  // Search for symbols
  searchSymbols: (query: string, exchange = 'NFO') => 
    apiFetch(`/symbols?search=${encodeURIComponent(query)}&exchange=${exchange}`, {
      method: 'GET'
    }),
    
  // Run backtest
  runBacktest: (params: any) => apiFetch('/backtest', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
  
  // Get historical data
  getHistoricalData: (params: any) => apiFetch('/historical-data', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
};

// Initialize the API client (called on app startup)
initApiClient(); 