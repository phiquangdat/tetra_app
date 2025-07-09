import React from 'react';
import ModuleDetails from '../ui/ModuleDetails';

interface ModulePageProps {
  id: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  return (
    <div className="mx-auto px-8 py-8 min-h-screen bg-[#FFFFFF] text-left">
      <div className="mb-6">
        <a
          onClick={() => history.back()}
          className="inline-flex items-center text-[#998FC7] hover:text-[#231942] px-3 py-1 rounded-lg hover:bg-[#F9F5FF] hover:border hover:border-[#D4C2FC] active:bg-[#D4C2FC] transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Modules
        </a>
      </div>

      <ModuleDetails id={id} />
    </div>
  );
};

export default ModulePage;
