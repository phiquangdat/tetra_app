import React from 'react';

interface UnitsBlockProps {
  children: React.ReactNode;
}

const UnitsBlock: React.FC<UnitsBlockProps> = ({ children }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-[#231942] mb-4">Units</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};

export default UnitsBlock;
