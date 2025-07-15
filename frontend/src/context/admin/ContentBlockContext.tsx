import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import type {
  ContentBlock,
  QuizQuestion,
  QuizQuestionAnswer,
} from './UnitContext.tsx';
import {
  saveVideoContent,
  type SaveVideoRequest,
  saveArticleContent,
  type SaveArticleRequest,
} from '../../services/unit/content/unitContentApi.ts';

interface ContextBlockType extends ContentBlock {
  updateContentField: (key: keyof ContentBlock, value: any) => void;
  markContentAsDirty: () => void;
  setContentState: (newState: Partial<ContentBlock>) => void;
  getContentState: () => ContentBlock;
  saveContent: (type: 'article' | 'video' | 'quiz') => Promise<void>;
  clearContent: () => void;

  updateQuestion: (index: number, question: QuizQuestion) => void;
  updateAnswer: (
    questionIndex: number,
    answerIndex: number,
    answer: QuizQuestionAnswer,
  ) => void;
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

export const ContentBlockContext = createContext<ContextBlockType | undefined>(
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
      console.log('updateContentField', updateContentField);
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
        switch (type) {
          case 'video': {
            const { title, content, url } = contentBlock.data;
            const sort_order = contentBlock.sortOrder;

            if (!title || !content || !url) {
              throw new Error('Video title, content, and URL are required');
            }

            try {
              new URL(url);
            } catch {
              throw new Error('Invalid video URL');
            }

            const payload: SaveVideoRequest = {
              unit_id: unitId,
              content_type: 'video',
              title: title as string,
              content: content as string,
              url: url as string,
              sort_order,
            };

            const result = await saveVideoContent(payload);
            setContentState({ id: result.id });
            console.log(
              `[saveContent] Video content saved successfully, ID: ${result.id}`,
            );
            break;
          }
          case 'article': {
            const { title, content } = contentBlock.data;
            const sort_order = contentBlock.sortOrder;

            if (!title || !content) {
              throw new Error('Article title and content are required');
            }

            const payload: SaveArticleRequest = {
              unit_id: unitId,
              content_type: 'article',
              title: title as string,
              content: content as string,
              sort_order,
            };

            const result = await saveArticleContent(payload);
            setContentState({ id: result.id });
            console.log(
              `[saveContent] Article content saved successfully, ID: ${result.id}`,
            );
            break;
          }

          default:
            throw new Error(`Unsupported content type: ${type}`);
        }
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

  const updateQuestion = useCallback(
    (index: number, updatedQuestion: QuizQuestion) => {
      setContentBlock((prev) => {
        const updatedQuestions = [...(prev.data.questions || [])];
        updatedQuestions[index] = updatedQuestion;

        return {
          ...prev,
          data: {
            ...prev.data,
            questions: updatedQuestions,
          },
          isDirty: true,
        };
      });
    },
    [],
  );

  const updateAnswer = useCallback(
    (
      questionIndex: number,
      answerIndex: number,
      updatedAnswer: QuizQuestionAnswer,
    ) => {
      setContentBlock((prev) => {
        const updatedQuestions = [...(prev.data.questions || [])];
        const targetQuestion = { ...updatedQuestions[questionIndex] };
        const updatedAnswers = [...(targetQuestion.answers || [])];

        updatedAnswers[answerIndex] = updatedAnswer;
        targetQuestion.answers = updatedAnswers;
        updatedQuestions[questionIndex] = targetQuestion;

        return {
          ...prev,
          data: {
            ...prev.data,
            questions: updatedQuestions,
          },
          isDirty: true,
        };
      });
    },
    [],
  );

  const contextValue: ContextBlockType = {
    ...contentBlock,
    updateContentField,
    markContentAsDirty,
    setContentState,
    getContentState,
    saveContent,
    clearContent,
    updateQuestion,
    updateAnswer,
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
