import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type ContentBlock = {
  type: 'video' | 'article' | 'quiz';
  data: any;
};

export type UnitContextEntry = {
  id: string | null;
  title: string;
  description: string;
  content: ContentBlock[];
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
};

type UnitContextType = {
  unitStates: Record<number, UnitContextEntry>;
  updateUnitField: (
    unitNumber: number,
    key: keyof UnitContextEntry,
    value: any,
  ) => void;
  markUnitAsDirty: (unitNumber: number) => void;
  setUnitState: (
    unitNumber: number,
    newState: Partial<UnitContextEntry>,
  ) => void;
  getUnitState: (unitNumber: number) => UnitContextEntry | undefined;
  getNextUnitNumber: () => number;
};

const createDefaultUnitState = (): UnitContextEntry => ({
  id: null,
  title: '',
  description: '',
  content: [],
  isDirty: false,
  isSaving: false,
  error: null,
});

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitContextProvider = ({ children }: { children: ReactNode }) => {
  const [unitStates, setUnitStates] = useState<
    Record<number, UnitContextEntry>
  >({});

  const updateUnitField = useCallback(
    (unitNumber: number, key: keyof UnitContextEntry, value: any) => {
      setUnitStates((prev) => {
        const currentUnit = prev[unitNumber] || createDefaultUnitState();
        return {
          ...prev,
          [unitNumber]: {
            ...currentUnit,
            [key]: value,
            isDirty:
              key !== 'isDirty' && key !== 'isSaving' && key !== 'error'
                ? true
                : currentUnit.isDirty,
          },
        };
      });
    },
    [],
  );

  const markUnitAsDirty = useCallback((unitNumber: number) => {
    setUnitStates((prev) => {
      const currentUnit = prev[unitNumber] || createDefaultUnitState();
      return {
        ...prev,
        [unitNumber]: {
          ...currentUnit,
          isDirty: true,
        },
      };
    });
  }, []);

  const setUnitState = useCallback(
    (unitNumber: number, newState: Partial<UnitContextEntry>) => {
      setUnitStates((prev) => {
        const currentUnit = prev[unitNumber] || createDefaultUnitState();
        return {
          ...prev,
          [unitNumber]: {
            ...currentUnit,
            ...newState,
          },
        };
      });
    },
    [],
  );

  const getUnitState = useCallback(
    (unitNumber: number) => {
      return unitStates[unitNumber];
    },
    [unitStates],
  );

  const getNextUnitNumber = useCallback(() => {
    const unitNumbers = Object.keys(unitStates).map(Number);
    return unitNumbers.length > 0 ? Math.max(...unitNumbers) + 1 : 1;
  }, [unitStates]);

  const contextValue: UnitContextType = {
    unitStates,
    updateUnitField,
    markUnitAsDirty,
    setUnitState,
    getUnitState,
    getNextUnitNumber,
  };

  return (
    <UnitContext.Provider value={contextValue}>{children}</UnitContext.Provider>
  );
};

export const useUnitContext = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnitContext must be used within a UnitContextProvider');
  }
  return context;
};
