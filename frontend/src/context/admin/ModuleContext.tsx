import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
  useCallback,
} from 'react';
import {
  createModule,
  updateModule,
  type ModuleInput,
  deleteModule,
} from '../../services/module/moduleApi';
import { isImageUrlRenderable } from '../../utils/validators';
import toast from 'react-hot-toast';

interface ModuleContextProps {
  id: string | null;
  title: string;
  description: string;
  topic: string;
  pointsAwarded: number;
  coverPicture: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isEditing: boolean;
  error: string | null;
  status: string;
}

interface ModuleContextValue extends ModuleContextProps {
  updateModuleField: (key: string, value: any) => Promise<void>;
  markModuleAsDirty: () => void;
  setModuleState: (newState: Partial<ModuleContextProps>) => void;
  saveModule: () => Promise<void>;
  setIsEditing: (editing: boolean) => void;
  removeModule: () => Promise<boolean>;
  publishModule: () => Promise<void>;
}

export const initialModuleState: ModuleContextProps = {
  id: null,
  title: '',
  description: '',
  topic: '',
  pointsAwarded: 0,
  coverPicture: null,
  isDirty: false,
  isSaving: false,
  isEditing: true,
  error: null,
  status: 'draft',
};

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined);

export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error(
      'useModuleContext must be used within a ModuleContextProvider',
    );
  }
  return context;
};

export const ModuleContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [module, setModule] = useState<ModuleContextProps>(initialModuleState);
  const [isEditing, setIsEditing] = useState(true);

  const markModuleAsDirty = () => {
    setModule((prev) => ({ ...prev, isDirty: true }));
  };

  const updateModuleField = async (key: string, value: any): Promise<void> => {
    let error: string | null = null;

    // Validate cover picture strictly by renderability (no format regex)
    if (
      key === 'coverPicture' &&
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      try {
        const isRenderable = await isImageUrlRenderable(value);
        if (!isRenderable) {
          error =
            'Image URL is not accessible or does not point to an actual image.';
        }
      } catch {
        error = 'Failed to validate cover picture.';
      }
    }

    setModule((prev) => ({
      ...prev,
      [key]: value,
      isDirty: true,
      error,
    }));
  };

  const setModuleState = useCallback(
    (newState: Partial<ModuleContextProps>) => {
      setModule((prev) => ({ ...prev, ...newState }));
    },
    [],
  );

  const saveModule = async () => {
    if (!module.isDirty || module.isSaving) return;

    setModule((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      // Guard at save time as well (in case saveModule is used elsewhere)
      if (module.coverPicture) {
        const ok = await isImageUrlRenderable(module.coverPicture);
        if (!ok) {
          throw new Error(
            'Image URL is not accessible or does not point to an actual image.',
          );
        }
      }

      const moduleInput: ModuleInput = {
        title: module.title,
        description: module.description,
        topic: module.topic,
        points: module.pointsAwarded,
        coverUrl: module.coverPicture ?? '',
        status: module.status,
      };

      let responseModule;
      if (module.id) {
        responseModule = await updateModule(module.id, moduleInput);
      } else {
        responseModule = await createModule(moduleInput);
      }

      setModule((prev) => ({
        ...prev,
        id: responseModule.id,
        isDirty: false,
        isSaving: false,
        error: null,
        status: responseModule.status,
      }));
    } catch (err) {
      setModule((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error occurred while saving module',
      }));
    } finally {
      setModule((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const removeModule = async (): Promise<boolean> => {
    if (!module.id) return false;

    try {
      const message = await deleteModule(module.id);
      toast.success(message);
      return true;
    } catch (err) {
      console.error('Failed to delete module (unknown error):', err);
      toast.error('Failed to delete module. Please try again later.');
      return false;
    }
  };

  const publishModule = async () => {
    if (!module.id) return;

    setModule((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const moduleInput: ModuleInput = {
        title: module.title,
        description: module.description,
        topic: module.topic,
        points: module.pointsAwarded,
        coverUrl: module.coverPicture ?? '',
        status: 'published',
      };

      const updated = await updateModule(module.id, moduleInput);

      setModule((prev) => ({
        ...prev,
        status: updated.status,
        isSaving: false,
        isDirty: false,
      }));

      toast.success('Module published');
    } catch (err) {
      console.error('[publishModule] Failed:', err);
      setModule((prev) => ({
        ...prev,
        isSaving: false,
        error: 'Failed to publish module. Please try again later.',
      }));

      toast.error('Failed to publish module. Please try again later.');
    }
  };

  const contextValue = useMemo(
    () => ({
      ...module,
      isEditing,
      setIsEditing,
      setModuleState,
      updateModuleField,
      markModuleAsDirty,
      saveModule,
      removeModule,
      publishModule,
    }),
    [module, isEditing, setModuleState, updateModuleField],
  );

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};
