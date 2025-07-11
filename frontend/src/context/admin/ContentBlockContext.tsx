import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import type { ContentBlock } from './UnitContext.tsx';

interface ContextBlockType extends ContentBlock {
  updateContentField: (key: keyof ContentBlock, value: any) => void;
  markContentAsDirty: () => void;
  setContentState: (newState: Partial<ContentBlock>) => void;
  getContentState: () => ContentBlock;
  saveContent: (type: 'article' | 'video' | 'quiz') => Promise<void>;
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
    async (type: 'article' | 'video' | 'quiz') => {
      const unitId = contentBlock.unit_id;
      if (!unitId) {
        console.warn('[saveContent] Missing unit_id in contentBlock');
        return;
      }

      if (!contentBlock.isDirty || contentBlock.isSaving) {
        console.log('[saveContent] Skipped: Not dirty or already saving');
        return;
      }

      console.log(
        `[saveContent] Saving content block to unit ${unitId}, type: ${type}`,
      );
      console.log('[saveContent] Data:', contentBlock.data);

      setContentState({ isSaving: true, error: null });

      try {
        // Here must be calls to API functions made
        // to save content blocks to the backend

        setContentState({ isDirty: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setContentState({
          error: error.message || 'Error saving content',
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
