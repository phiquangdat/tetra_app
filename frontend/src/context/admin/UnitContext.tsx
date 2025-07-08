import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import {
  createUnit,
  type CreateUnitRequest,
} from '../../services/unit/unitApi';

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
  saveUnit: (unitNumber: number, moduleId: string) => Promise<void>;
  removeUnit: (unitNumber: number) => void;
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

  const saveUnit = useCallback(
    async (unitNumber: number, moduleId: string) => {
      const currentUnit = unitStates[unitNumber];

      if (!currentUnit || !currentUnit.isDirty || currentUnit.isSaving) return;

      setUnitState(unitNumber, { isSaving: true, error: null });

      try {
        const unitData: CreateUnitRequest = {
          module_id: moduleId,
          title: currentUnit.title,
          description: currentUnit.description,
        };

        const response = await createUnit(unitData);

        setUnitState(unitNumber, {
          id: response.id,
          isDirty: false,
          error: null,
        });
      } catch (err) {
        setUnitState(unitNumber, {
          error: err instanceof Error ? err.message : 'Failed to save unit',
        });
      } finally {
        setUnitState(unitNumber, { isSaving: false });
      }
    },
    [unitStates, setUnitState],
  );

  const removeUnit = useCallback(
    (unitNumber: number) => {
      if (!unitStates[unitNumber]) return;
      if (Object.keys(unitStates).length <= 1) return;

      setUnitStates((prev) => {
        const sortedUnitNumbers = Object.keys(prev)
          .map(Number)
          .sort((a, b) => a - b);
        const newStates: Record<number, UnitContextEntry> = {};

        let newUnitNumber = 1;
        for (const oldUnitNumber of sortedUnitNumbers) {
          if (oldUnitNumber !== unitNumber) {
            newStates[newUnitNumber] = prev[oldUnitNumber];
            newUnitNumber++;
          }
        }

        return newStates;
      });
    },
    [unitStates],
  );

  const contextValue: UnitContextType = {
    unitStates,
    updateUnitField,
    markUnitAsDirty,
    setUnitState,
    getUnitState,
    getNextUnitNumber,
    saveUnit,
    removeUnit,
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
