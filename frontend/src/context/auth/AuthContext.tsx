import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface AuthContextType {
  authToken: string | null;
  userId: string | null;
  userRole: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState({
    authToken: sessionStorage.getItem('jwt_token') || null,
    userId: sessionStorage.getItem('user_id') || null,
    userRole: sessionStorage.getItem('user_role') || null,
  });

  const logout = useCallback(() => {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_role');

    setAuthState({
      authToken: null,
      userId: null,
      userRole: null,
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('jwt_token', authState.authToken || '');
    sessionStorage.setItem('user_id', authState.userId || '');
    sessionStorage.setItem('user_role', authState.userRole || '');
  }, [authState]);

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
