import { create } from 'zustand';
import { ZohoAuthService } from '../services/zohoAuth';
import { TokenManager, ZohoTokens } from '../utils/tokenManager';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  tokens: ZohoTokens | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: () => void;
  logout: () => void;
  setTokens: (tokens: ZohoTokens) => void;
  clearError: () => void;
  refreshTokens: () => Promise<boolean>;
}

const authService = new ZohoAuthService();

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  tokens: null,
  isLoading: false,
  error: null,

  // Initialize authentication state
  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const tokens = TokenManager.getTokens();
      const isAuth = authService.isAuthenticated();
      
      if (tokens && isAuth) {
        set({
          isAuthenticated: true,
          tokens,
          user: {
            id: 'zoho-user',
            name: 'Zoho User',
            email: 'user@zoho.com',
          },
        });
        
        // Validate tokens in the background
        const isValid = await authService.validateTokens();
        if (!isValid) {
          // Try to refresh tokens
          const refreshed = await authService.refreshTokensIfNeeded();
          if (!refreshed) {
            get().logout();
          }
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
        isAuthenticated: false,
        user: null,
        tokens: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Initiate login flow
  login: () => {
    try {
      const authUrl = authService.generateAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      console.error('Login error:', error);
      set({
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  },

  // Logout user
  logout: () => {
    authService.logout();
    set({
      isAuthenticated: false,
      user: null,
      tokens: null,
      error: null,
    });
  },

  // Set tokens after successful authentication
  setTokens: (tokens: ZohoTokens) => {
    TokenManager.saveTokens(tokens);
    set({
      isAuthenticated: true,
      tokens,
      user: {
        id: 'zoho-user',
        name: 'Zoho User',
        email: 'user@zoho.com',
      },
      error: null,
    });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Refresh tokens
  refreshTokens: async () => {
    try {
      const newTokens = await TokenManager.refreshTokens();
      if (newTokens) {
        set({ tokens: newTokens });
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      get().logout();
      return false;
    }
  },
}));