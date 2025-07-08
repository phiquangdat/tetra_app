import React from 'react';

const ModulePageContainer: React.FC = () => {
  return (
    <div className="mx-auto px-8 py-8 min-h-screen bg-[#FFFFFF] text-left">
      <div className="mb-6">
        <a
          onClick={() => {
            return;
          }}
          className="inline-flex items-center text-[#998FC7] hover:text-[#231942] px-3 py-1 rounded-lg hover:bg-[#F9F5FF] hover:border hover:border-[#D4C2FC] active:bg-[#D4C2FC] transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Modules
        </a>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#231942] tracking-tight">
          Module title
        </h1>
      </div>
    </div>
  );
};

export default ModulePageContainer;
