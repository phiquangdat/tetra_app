import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UnitContent } from '../services/unit/unitApi';

interface UnitContentContextProps {
  unitId: string;
  contentList: UnitContent[];
  setUnitContent: (unitId: string, content: UnitContent[]) => void;
}

const UnitContentContext = createContext<UnitContentContextProps | undefined>(
  undefined,
);

export const useUnitContent = () => {
  const context = useContext(UnitContentContext);
  if (!context)
    throw new Error('useUnitContent must be used within a UnitContentProvider');
  return context;
};

export const UnitContentProvider = ({ children }: { children: ReactNode }) => {
  const [unitId, setUnitId] = useState<string>('');
  const [contentList, setContentList] = useState<UnitContent[]>([]);

  const setUnitContent = (id: string, content: UnitContent[]) => {
    setUnitId(id);
    setContentList(content);
  };

  return (
    <UnitContentContext.Provider
      value={{ unitId, contentList, setUnitContent }}
    >
      {children}
    </UnitContentContext.Provider>
  );
};
