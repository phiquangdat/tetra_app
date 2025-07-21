import { createContext, useContext, useState, type ReactNode } from 'react';
import { createModule, updateModule } from '../../services/module/moduleApi';
import { isValidImageUrl, isImageUrlRenderable } from '../../utils/validators';

interface ModuleContextProps {
  id: string | null;
  title: string;
  description: string;
  topic: string;
  pointsAwarded: number;
  coverPicture: string | null;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  status: string; // <-- Add this line with a default value where the object is created, e.g., status: 'draft'
}

interface ModuleContextValue extends ModuleContextProps {
  updateModuleField: (key: string, value: any) => Promise<void>;
  markModuleAsDirty: () => void;
  setModuleState: (newState: Partial<ModuleContextProps>) => void;
  saveModule: () => Promise<void>;
}

const initialModuleState: ModuleContextProps = {
  id: null,
  title: '',
  description: '',
  topic: '',
  pointsAwarded: 0,
  coverPicture: null,
  isDirty: false,
  isSaving: false,
  error: null,
  status: 'draft', // <-- Provide a default value here
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

  const markModuleAsDirty = () => {
    setModule((prev) => ({ ...prev, isDirty: true }));
  };

  const updateModuleField = async (key: string, value: any): Promise<void> => {
    let error: string | null = null;

    if (
      key === 'coverPicture' &&
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      try {
        if (!isValidImageUrl(value)) {
          error = 'Invalid image URL format.';
        } else {
          const isRenderable = await isImageUrlRenderable(value);
          if (!isRenderable) {
            error =
              'Image URL is not accessible or does not point to an actual image.';
          }
        }
      } catch (e) {
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

  const setModuleState = (newState: Partial<ModuleContextProps>) => {
    setModule((prev) => ({ ...prev, ...newState }));
  };

  const saveModule = async () => {
    if (!module.isDirty || module.isSaving) return;

    setModule((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      if (module.coverPicture && !isValidImageUrl(module.coverPicture)) {
        throw new Error('Invalid image URL format for cover picture.');
      }

      let responseModule;
      if (module.id) {
        responseModule = await updateModule(module.id, {
          title: module.title,
          description: module.description,
          topic: module.topic,
          points: module.pointsAwarded,
          coverUrl: module.coverPicture ?? '',
          status: module.status,
        });
      } else {
        responseModule = await createModule({
          ...module,
          points: module.pointsAwarded,
          coverUrl: module.coverPicture ?? '',
          id: module.id ?? '',
          status: module.status, // <-- Ensure status is included here
        });
      }

      setModule((prev) => ({
        ...prev,
        id: responseModule.id,
        isDirty: false,
        isSaving: false,
        error: null,
        status: responseModule.status, // Ensure status is preserved after save
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

  return (
    <ModuleContext.Provider
      value={{
        ...module,
        updateModuleField,
        markModuleAsDirty,
        setModuleState,
        saveModule,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};
