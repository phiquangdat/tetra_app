import { createContext, useContext, useState, type ReactNode } from 'react';

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
}

interface ModuleContextValue extends ModuleContextProps {
  updateModuleField: (key: string, value: any) => void;
  markModuleAsDirty: () => void;
  setModuleState: (newState: Partial<ModuleContextProps>) => void;
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
    setModule((prev) => ({
      ...prev,
      isDirty: true,
    }));
  };

  const updateModuleField = (key: string, value: any) => {
    setModule((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setModuleState = (newState: Partial<ModuleContextProps>) => {
    setModule((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  return (
    <ModuleContext.Provider
      value={{
        ...module,
        updateModuleField,
        markModuleAsDirty,
        setModuleState,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};
