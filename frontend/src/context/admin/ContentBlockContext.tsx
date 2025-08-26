import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  type ContentBlock,
  type QuizQuestion,
  type QuizQuestionAnswer,
} from './UnitContext.tsx';
import {
  saveVideoContent,
  type SaveVideoRequest,
  saveArticleContent,
  type SaveArticleRequest,
  saveQuizContent,
  type SaveQuizRequest,
  updateArticleContent,
  updateVideoContent,
  updateQuizContent,
  uploadFile,
} from '../../services/unit/content/unitContentApi.ts';
import { useModuleContext } from './ModuleContext';
import { adjustModulePoints } from '../../utils/pointsHelpers.ts';

interface ContextBlockType extends ContentBlock {
  updateContentField: (key: keyof ContentBlock, value: any) => void;
  markContentAsDirty: () => void;
  setContentState: (newState: Partial<ContentBlock>) => void;
  getContentState: () => ContentBlock;
  saveContent: (
    type: 'article' | 'video' | 'quiz',
    editorContent?: string,
  ) => Promise<ContentBlock | undefined>;
  clearContent: () => void;

  updateQuestion: (index: number, question: QuizQuestion) => void;
  updateAnswer: (
    questionIndex: number,
    answerIndex: number,
    answer: QuizQuestionAnswer,
  ) => void;

  setSelectedFile: (file: File) => void;
  clearSelectedFile: () => void;
  setFileError: (message: string | null) => void;
  getFileError: () => string | null;
}

const createDefaultContentBlockState = (): ContentBlock => ({
  type: 'article',
  data: {
    title: '',
    content: '',
    url: '',
    points: 0,
    questions: [],

    fileName: undefined,
    fileSize: undefined,
    fileMime: undefined,
    fileId: null,
  },
  sortOrder: 0,
  unit_id: '',
  isDirty: false,
  isSaving: false,
  error: null,

  fileBlob: null,
  fileError: null,
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
  const { id: moduleId, updateModuleField } = useModuleContext();

  const UI_KEYS: Array<keyof ContentBlock> = ['fileBlob', 'fileError'];

  const updateContentField = useCallback(
    (key: keyof ContentBlock, value: any) => {
      setContentBlock((prev) => {
        let isDirty = prev.isDirty;

        if (key === 'data' && value && typeof value === 'object') {
          const changed = Object.keys(value).some((k) => {
            return value[k] !== (prev.data as any)[k];
          });
          if (changed) isDirty = true;
        }

        if (key === 'fileBlob') {
          isDirty = true;
        }

        if (UI_KEYS.includes(key) && key === 'fileError') {
          return {
            ...prev,
            [key]: value,
            isDirty,
          };
        }

        return {
          ...prev,
          [key]: value,
          isDirty,
        };
      });
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
    async (
      type: 'article' | 'video' | 'quiz',
      editorContent?: string,
    ): Promise<ContentBlock | undefined> => {
      const unitId = contentBlock.unit_id;
      if (!unitId) {
        console.warn('[saveContent] Missing unit_id in contentBlock');
        return;
      }

      if (!moduleId) throw new Error('[saveContent] Missing module id');

      const savedContent = contentBlock.data.content?.trim() ?? '';
      const newArticleContent = editorContent?.trim() ?? '';
      const isContentDirty = savedContent !== newArticleContent;

      if ((!isContentDirty && !contentBlock.isDirty) || contentBlock.isSaving) {
        console.log('[saveContent] Skipped: Not dirty or already saving');
        return;
      }

      console.log(
        `[saveContent] Saving content block to unit ${unitId}, type: ${type}`,
      );

      setContentState({ isSaving: true, error: null });

      try {
        switch (type) {
          case 'video': {
            const { title, content, url, points } = contentBlock.data;
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
              points: (points as number) ?? 0,
              sort_order,
            };

            let result: { id: string };

            try {
              if (contentBlock.id) {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'edit',
                  payload.points ?? 0,
                  contentBlock.id,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await updateVideoContent(contentBlock.id, payload);
              } else {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'create',
                  payload.points ?? 0,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await saveVideoContent(payload);
              }
              console.log(
                `[saveContent] Video created successfully, ID: ${result.id}`,
              );

              const updatedBlock: ContentBlock = {
                ...contentBlock,
                id: result.id,
                data: {
                  ...contentBlock.data,
                  content: content,
                },
                isDirty: false,
                isSaving: false,
                error: null,
              };

              setContentState(updatedBlock);
              return updatedBlock;
            } catch (err) {
              const error =
                err instanceof Error ? err.message : 'Unknown error occurred';
              console.error('[saveContent] Failed to save article:', error);
              setContentState({ error });
              return;
            }
            break;
          }
          case 'article': {
            const { title, points } = contentBlock.data;
            const content = newArticleContent;
            const sort_order = contentBlock.sortOrder;

            if (!title || !content) {
              throw new Error('Article title and content are required');
            }

            let attachment_id: string | undefined;
            if (contentBlock.fileBlob) {
              try {
                const uploaded = await uploadFile(contentBlock.fileBlob);
                attachment_id = uploaded.id;
              } catch (err) {
                const error =
                  err instanceof Error ? err.message : 'File upload failed';
                console.error('[saveContent] Upload error:', error);
                setContentState({ isSaving: false, fileError: error });
                return;
              }
            }

            const payload: SaveArticleRequest = {
              unit_id: unitId,
              content_type: 'article',
              title: title as string,
              content: content as string,
              points: points as number,
              sort_order,
              attachment_id,
            };

            let result: { id: string };
            try {
              if (contentBlock.id) {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'edit',
                  payload.points ?? 0,
                  contentBlock.id,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await updateArticleContent(contentBlock.id, payload);
              } else {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'create',
                  payload.points ?? 0,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await saveArticleContent(payload);
              }
              console.log(
                `[saveContent] Article created successfully, ID: ${result.id}`,
              );

              const updatedBlock: ContentBlock = {
                ...contentBlock,
                id: result.id,
                data: {
                  ...contentBlock.data,
                  content: content,
                  fileId: attachment_id || contentBlock.data.fileId,
                },
                isDirty: false,
                isSaving: false,
                error: null,
              };

              setContentState(updatedBlock);
              return updatedBlock;
            } catch (err) {
              const error =
                err instanceof Error ? err.message : 'Unknown error occurred';
              console.error('[saveContent] Failed to save article:', error);
              setContentState({ error });
              return;
            }
            break;
          }
          case 'quiz': {
            const { title, content, points, questions } = contentBlock.data;
            const sort_order = contentBlock.sortOrder;

            if (!title || !points || !questions || questions.length === 0) {
              throw new Error(
                'Quiz title, points, and at least one question are required',
              );
            }

            let attachment_id: string | undefined;
            if (contentBlock.fileBlob) {
              try {
                const uploaded = await uploadFile(contentBlock.fileBlob);
                attachment_id = uploaded.id;
              } catch (err) {
                const error =
                  err instanceof Error ? err.message : 'File upload failed';
                console.error('[saveContent] Upload error:', error);
                setContentState({ isSaving: false, fileError: error });
                return;
              }
            }

            const payload: SaveQuizRequest = {
              unit_id: unitId,
              content_type: 'quiz',
              title: title as string,
              content: content as string,
              sort_order,
              points: points as number,
              questions_number: questions.length,
              questions: questions as QuizQuestion[],
              attachment_id,
            };

            let result: { id: string };

            try {
              if (contentBlock.id) {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'edit',
                  payload.points ?? 0,
                  contentBlock.id,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await updateQuizContent(contentBlock.id, payload);
              } else {
                const updatedModule = await adjustModulePoints(
                  moduleId,
                  'create',
                  payload.points ?? 0,
                );
                await updateModuleField(
                  'pointsAwarded',
                  updatedModule.points ?? 0,
                );

                result = await saveQuizContent(payload);
              }
              console.log(
                `[saveContent] Quiz created successfully, ID: ${result.id}`,
              );

              const updatedBlock: ContentBlock = {
                ...contentBlock,
                id: result.id,
                data: {
                  ...contentBlock.data,
                  content: content,
                  fileId: attachment_id || contentBlock.data.fileId,
                },
                isDirty: false,
                isSaving: false,
                error: null,
              };

              setContentState(updatedBlock);
              return updatedBlock;
            } catch (err) {
              const error =
                err instanceof Error ? err.message : 'Unknown error occurred';
              console.error('[saveContent] Failed to save article:', error);
              setContentState({ error });
              return;
            }
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

  const setSelectedFile = useCallback((file: File) => {
    setContentBlock((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        fileName: file.name,
        fileSize: file.size,
        fileMime: file.type || undefined,
      },
      fileBlob: file,
      fileError: null,
      isDirty: true,
    }));
  }, []);

  const clearSelectedFile = useCallback(() => {
    setContentBlock((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        fileName: undefined,
        fileSize: undefined,
        fileMime: undefined,
        fileId: null,
      },
      fileBlob: null,
      fileError: null,
      isDirty: true,
    }));
  }, []);

  const setFileError = useCallback((message: string | null) => {
    setContentBlock((prev) => ({
      ...prev,
      fileError: message,
    }));
  }, []);

  const getFileError = useCallback(() => {
    return contentBlock.fileError ?? null;
  }, [contentBlock.fileError]);

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

    setSelectedFile,
    clearSelectedFile,
    setFileError,
    getFileError,
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
