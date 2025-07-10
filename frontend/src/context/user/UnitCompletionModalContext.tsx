import { createContext, useContext, useState, type ReactNode } from 'react';

interface UnitCompletionModalContextType {
  isVisible: boolean;
  nextUnitId: string | null;
  moduleId: string | null;
  open: (unitId: string, moduleId: string) => void;
  close: () => void;
}

const UnitCompletionModalContext = createContext<
  UnitCompletionModalContextType | undefined
>(undefined);

export const useUnitCompletionModal = () => {
  const context = useContext(UnitCompletionModalContext);
  if (!context) {
    throw new Error(
      'useUnitCompletionModal must be used within a UnitCompletionModalProvider',
    );
  }
  return context;
};

export const UnitCompletionModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [nextUnitId, setNextUnitId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);

  const open = (unitId: string, moduleId: string) => {
    setNextUnitId(unitId);
    setModuleId(moduleId);
    setIsVisible(true);
  };
  const close = () => {
    setIsVisible(false);
    setNextUnitId(null);
    setModuleId(null);
  };

  return (
    <UnitCompletionModalContext.Provider
      value={{ isVisible, nextUnitId, moduleId, open, close }}
    >
      {children}
    </UnitCompletionModalContext.Provider>
  );
};
