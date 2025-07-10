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

type QuizQuestionAnswer = {
  title: string;
  is_correct: boolean;
  sort_order: number;
};

type QuizQuestion = {
  title: string;
  type: 'true/false' | 'multiple';
  sort_order: number;
  answers: QuizQuestionAnswer[];
};

export interface ContentBlock {
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

// ===========================
// Content Block Context
// ===========================

interface ContextBlockType extends ContentBlock {
  updateContentField: (key: keyof ContentBlock, value: any) => void;
  markContentAsDirty: () => void;
  setContentState: (newState: Partial<ContentBlock>) => void;
  getContentState: () => ContentBlock;
  saveContent: (
    moduleId: string,
    type: 'article' | 'video' | 'quiz',
  ) => Promise<void>;
  clearContent: () => void;
}

const createDefaultContentBlockState = (): ContentBlock => ({
  type: 'article',
  data: {
    title: '',
    content: '',
    url: '',
    points: 0,
    questions: [],
  },
  sortOrder: 0,
  unit_id: '',
  isDirty: false,
  isSaving: false,
  error: null,
});

const ContentBlockContext = createContext<ContextBlockType | undefined>(
  undefined,
);

export const ContentBlockContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [contentBlock, setContentBlock] = useState<ContentBlock>(
    createDefaultContentBlockState(),
  );

  const updateContentField = useCallback(
    (key: keyof ContentBlock, value: any) => {
      setContentBlock((prev) => ({
        ...prev,
        [key]: value,
        isDirty:
          key !== 'isDirty' && key !== 'isSaving' && key !== 'error'
            ? true
            : prev.isDirty,
      }));
    },
    [],
  );

  const markContentAsDirty = useCallback(() => {
    setContentBlock((prev) => ({ ...prev, isDirty: true }));
  }, []);

  const setContentState = useCallback((newState: Partial<ContentBlock>) => {
    setContentBlock((prev) => ({ ...prev, ...newState }));
  }, []);

  const getContentState = useCallback(() => {
    return contentBlock;
  }, [contentBlock]);

  const saveContent = useCallback(
    async (unitId: string, type: 'article' | 'video' | 'quiz') => {
      console.log('moduleId', unitId || 'No unitId provided');
      if (!contentBlock.isDirty || contentBlock.isSaving) return;

      setContentState({ isSaving: true, error: null });

      try {
        // Simulate saving
        // await saveContentToApi();
        setContentState({ isDirty: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setContentState({
          error: error.message || 'Failed to save content',
        });
      } finally {
        setContentState({ isSaving: false });
      }
    },
    [contentBlock, setContentState],
  );

  const clearContent = useCallback(() => {
    setContentBlock(createDefaultContentBlockState());
  }, []);

  const contextValue: ContextBlockType = {
    ...contentBlock,
    updateContentField,
    markContentAsDirty,
    setContentState,
    getContentState,
    saveContent,
    clearContent,
  };

  return (
    <ContentBlockContext.Provider value={contextValue}>
      {children}
    </ContentBlockContext.Provider>
  );
};

export const useContentBlockContext = () => {
  const context = useContext(ContentBlockContext);
  if (!context) {
    throw new Error(
      'useContentBlockContext must be used within a ContentBlockContextProvider',
    );
  }
  return context;
};
