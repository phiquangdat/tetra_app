import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getUserById } from '../../services/user/userApi';
import { getUserTotalPoints } from '../../services/user/userStatsApi';

interface UserContextType {
  userName: string | null;
  points: number | null;
  userNameLoading: boolean;
  pointsLoading: boolean;
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
  const [points, setPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    const fetchUserTotalPoints = async () => {
      if (!authToken) {
        if (!cancelled) setPoints(null);
        return;
      }

      if (!cancelled) setPointsLoading(true);

      try {
        const totalPoints = await getUserTotalPoints();
        if (!cancelled) setPoints(totalPoints);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch user points:', err);
          setPoints((prev) => prev ?? null);
        }
      } finally {
        if (!cancelled) setPointsLoading(false);
      }
    };

    fetchUserTotalPoints();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  return (
    <UserContext.Provider
      value={{ userName, points, userNameLoading, pointsLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
