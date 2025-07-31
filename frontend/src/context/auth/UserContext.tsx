import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getUserById } from '../../services/user/userApi';

interface UserContextType {
  userName: string | null;
  points: number | null;
  userNameLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within an UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { userId, authToken } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userNameLoading, setUserNameLoading] = useState(false);

  useEffect(() => {
    try {
      const fetchUser = async () => {
        setUserNameLoading(true);
        const user = await getUserById(userId, authToken);
        setUserName(user?.name || null);
      };
      fetchUser();
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setUserNameLoading(false);
    }
  }, [userId, authToken]);

  return (
    <UserContext.Provider value={{ userName, points: 100, userNameLoading }}>
      {children}
    </UserContext.Provider>
  );
};
