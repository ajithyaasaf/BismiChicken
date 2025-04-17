import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth, onAuthChange, signInWithEmail, signOut } from "../firebase";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
      
      // Store or remove Firebase user in localStorage for API requests
      if (user) {
        // Store minimal user information for auth headers
        localStorage.setItem('firebaseUser', JSON.stringify({
          uid: user.uid,
          email: user.email
        }));
        
        // If user is authenticated, check if they exist in our backend
        apiRequest("POST", "/api/auth/login", { firebaseId: user.uid })
          .catch(error => {
            console.error("Backend login error:", error);
            // If user doesn't exist in our backend, create them
            if (error.message.includes("404")) {
              // The user authenticated in Firebase but doesn't exist in our database yet
              // This could happen if the user was created directly in Firebase console
              if (user.email) {
                return apiRequest("POST", "/api/auth/register", {
                  username: user.email.split('@')[0], // Use the part before @ as username
                  email: user.email,
                  password: "firebase-auth", // This is a placeholder since auth is handled by Firebase
                  firebaseId: user.uid
                });
              }
            }
            throw error;
          })
          .catch(error => {
            console.error("Failed to register user in backend:", error);
            toast({
              title: "Authentication Error",
              description: "Failed to authenticate with the backend server.",
              variant: "destructive"
            });
          });
      } else {
        // Remove from localStorage when logged out
        localStorage.removeItem('firebaseUser');
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to logout";
      setError(errorMessage);
      throw err;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
