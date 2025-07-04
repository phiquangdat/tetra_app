import { createContext, useContext, useState, type ReactNode } from 'react';
import { createModule } from '../../services/module/moduleApi';

interface ModuleContextProps {
  id: string | null;
  title: string;
  description: string;
  topic: string;
  pointsAwarded: number;
  coverPicture: File | null;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  status: string; // <-- Add this line with a default value where the object is created, e.g., status: 'draft'
}

interface ModuleContextValue extends ModuleContextProps {
  updateModuleField: (key: string, value: any) => void;
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

  const updateModuleField = (key: string, value: any) => {
    setModule((prev) => ({
      ...prev,
      [key]: value,
      isDirty: true,
    }));
  };

  const setModuleState = (newState: Partial<ModuleContextProps>) => {
    setModule((prev) => ({ ...prev, ...newState }));
  };

  const saveModule = async () => {
    if (!module.isDirty || module.isSaving) return;

    setModule((prev) => ({ ...prev, isSaving: true, error: null }));

    const tempCoverUrl = module.coverPicture
      ? URL.createObjectURL(module.coverPicture)
      : '';

    try {
      const responseModule = await createModule({
        ...module,
        points: module.pointsAwarded,
        coverUrl: tempCoverUrl,
        id: module.id ?? '',
        status: module.status, // <-- Ensure status is included here
      });

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
      if (tempCoverUrl) URL.revokeObjectURL(tempCoverUrl);
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
