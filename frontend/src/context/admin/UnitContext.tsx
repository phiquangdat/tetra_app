import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import {
  createUnit,
  fetchUnitContentById,
  type UnitInput,
  updateUnit,
} from '../../services/unit/unitApi';

export type QuizQuestionAnswer = {
  title: string;
  is_correct: boolean;
  sort_order: number;
};

export type QuizQuestion = {
  title: string;
  type: 'true/false' | 'multiple';
  sort_order: number;
  answers: QuizQuestionAnswer[];
};

export interface ContentBlock {
  id?: string;
  type: 'article' | 'video' | 'quiz';
  data: {
    title: string;
    content?: string;
    url?: string; // for video
    points?: number; // for quiz
    questions?: QuizQuestion[]; // for quiz
  };
  sortOrder: number;
  unit_id?: string;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

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
  addContentBlock: (unitNumber: number, block: ContentBlock) => void;
  removeContentBlock: (unitNumber: number, blockIndex: number) => void;
  addUnit: () => void;
  setUnitStatesRaw: (state: Record<number, UnitContextEntry>) => void;
  loadUnitContentIntoState: (
    unitId: string,
    unitNumber: number,
  ) => Promise<void>;
};

export const initialUnitState = (): UnitContextEntry => ({
  id: null,
  title: '',
  description: '',
  content: [],
  isDirty: false,
  isSaving: false,
  error: null,
});

export const UnitContext = createContext<UnitContextType | undefined>(
  undefined,
);

export const UnitContextProvider = ({ children }: { children: ReactNode }) => {
  const [unitStates, setUnitStates] = useState<
    Record<number, UnitContextEntry>
  >({});

  const updateUnitField = useCallback(
    (unitNumber: number, key: keyof UnitContextEntry, value: any) => {
      setUnitStates((prev) => {
        const currentUnit = prev[unitNumber] || initialUnitState();
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
      const currentUnit = prev[unitNumber] || initialUnitState();
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
        const currentUnit = prev[unitNumber] || initialUnitState();
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

  const addUnit = useCallback(() => {
    setUnitStates((prev) => {
      const next = Object.keys(prev).length
        ? Math.max(...Object.keys(prev).map(Number)) + 1
        : 1;
      return { ...prev, [next]: initialUnitState() };
    });
  }, []);

  const saveUnit = useCallback(
    async (unitNumber: number, moduleId: string) => {
      const currentUnit = unitStates[unitNumber];

      if (!currentUnit || !currentUnit.isDirty || currentUnit.isSaving) return;

      setUnitState(unitNumber, { isSaving: true, error: null });

      try {
        const unitData: UnitInput = {
          module_id: moduleId,
          title: currentUnit.title,
          description: currentUnit.description,
        };

        let response;
        if (currentUnit.id) {
          response = await updateUnit(currentUnit.id, unitData);
        } else {
          response = await createUnit(unitData);
        }

        setUnitState(unitNumber, {
          id: response.id,
          isDirty: false,
          error: null,
        });
      } catch (err: unknown) {
        const error = err as Error;
        setUnitState(unitNumber, {
          error: error.message || 'Failed to save unit',
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

  const addContentBlock = useCallback(
    (unitNumber: number, block: ContentBlock) => {
      setUnitStates((prev) => {
        const currentUnit = prev[unitNumber] || initialUnitState();
        return {
          ...prev,
          [unitNumber]: {
            ...currentUnit,
            content: [...currentUnit.content, block],
            isDirty: true,
          },
        };
      });
      console.log('Content is added: ', block);
    },
    [],
  );

  const removeContentBlock = useCallback(
    (unitNumber: number, blockIndex: number) => {
      setUnitStates((prev) => {
        const currentUnit = prev[unitNumber];
        if (!currentUnit) return prev;

        const updatedContent = [...currentUnit.content];
        updatedContent.splice(blockIndex, 1);

        return {
          ...prev,
          [unitNumber]: {
            ...currentUnit,
            content: updatedContent,
            isDirty: true,
          },
        };
      });
    },
    [],
  );

  const setUnitStatesRaw = (newState: Record<number, UnitContextEntry>) => {
    setUnitStates(newState);
  };

  // Add to UnitContext
  const loadUnitContentIntoState = useCallback(
    async (unitId: string, unitNumber: number) => {
      try {
        const fetched = await fetchUnitContentById(unitId);
        const blocks: ContentBlock[] = fetched
          .map((u) => ({
            id: u.id,
            type: u.content_type as ContentBlock['type'],
            data: { title: u.title },
            sortOrder: u.sort_order,
            unit_id: unitId,
            isDirty: false,
            isSaving: false,
            error: null,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setUnitState(unitNumber, { content: blocks });
      } catch (err) {
        console.error(`Failed to load unit ${unitId} content`, err);
      }
    },
    [setUnitState],
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
    addContentBlock,
    removeContentBlock,
    addUnit,
    setUnitStatesRaw,
    loadUnitContentIntoState,
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
