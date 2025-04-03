
import React, { createContext, useContext, useState, useEffect } from "react";

interface Educator {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: string;
  courses: string[];
}

interface AuthContextType {
  currentUser: Educator | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
  semester: string;
  courses: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Educator | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for user data on initial load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Mock login function (would connect to backend in real implementation)
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to verify credentials
    // For now, we'll use mock data for demonstration
    try {
      // Mock successful login for "test@example.com" with password "password"
      if (email === "test@example.com" && password === "password") {
        const user = {
          id: "1",
          name: "Test Educator",
          email: "test@example.com",
          department: "Computer Science",
          semester: "4",
          courses: ["ML", "ACN", "DBMS"]
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
        return true;
      }
      
      // Check localStorage for registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const user = registeredUsers.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          semester: user.semester,
          courses: user.courses
        };
        
        setCurrentUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Mock register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // In a real app, this would make an API call to register the user
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      
      // Check if email already exists
      if (registeredUsers.some((user: any) => user.email === userData.email)) {
        return false;
      }
      
      // Create new user with ID
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`
      };
      
      // Add to registered users
      registeredUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
