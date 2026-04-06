import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define user types
interface Permission {
  id: number;
  name: string;
  menuName: string;
}

interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

interface AuthUser {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  profilePicture: string;
  status: string;
  roleId: number;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FIXED: Use proper case for role names
const isCustomer = !!user && user.role?.name === 'customer'; // Use lowercase
  const isAdmin = !!user && user.role?.name === 'Admin';

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Access token refreshed successfully");
        return true;
      } else {
        console.warn("Refresh token failed or expired");
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else if (response.status === 401) {
        console.log("Access token expired, attempting refresh...");
        const refreshSuccess = await refreshAccessToken();
        
        if (refreshSuccess) {
          const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setUser(retryData.user);
            return true;
          }
        }
        
        setUser(null);
        return false;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.warn("Auth check failed:", error);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      console.log("Periodic token refresh...");
      await refreshAccessToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

const login = async (email: string, password: string): Promise<boolean> => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    setUser(data.user);
    
    // console.log(`${data.user.role.name} logged in successfully`);
    return true;
  } catch (error: any) {
    console.error("Login failed:", error.message);
    setUser(null);
    throw error;
  } finally {
    setIsLoading(false);
  }
};;

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn("Logout API failed:", error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isLoading,
      isCustomer,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;