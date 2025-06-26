import { ModuleContextProvider } from '../../../context/admin/ModuleContext';
import { useState } from 'react';
import CreateModuleForm from './CreateModuleForm';
import UnitForm from './UnitForm';

type contentBlock = {
  type: 'video' | 'article' | 'quiz';
  data: any; // Placeholder for content data
};

type Unit = {
  unitNumber: number;
  title?: string;
  description?: string;
  content: contentBlock[];
};

const mockUnitsList: Unit[] = [
  {
    unitNumber: 1,
    title: '',
    description: '',
    content: [],
  },
];

function CreateModulePageContent() {
  const [unitsList, setUnitsList] = useState<Unit[]>(mockUnitsList);

  const handleAddUnit = () => {
    const newUnitNumber = unitsList.length + 1;
    setUnitsList([
      ...unitsList,
      { unitNumber: newUnitNumber, title: '', description: '', content: [] },
    ]);
  };

  const handleUnitChange = (index: number, updatedUnit: Unit) => {
    const updatedUnits = [...unitsList];
    updatedUnits[index] = updatedUnit;
    setUnitsList(updatedUnits);
  };

  const handleSaveDraftModule = () => {};

  const handlePublishModule = () => {};

  return (
    <div className="m-0 px-4 py-4 max-w-5xl">
      <h1 className="font-extrabold text-[28px] pb-4">Create New Module</h1>
      <CreateModuleForm />
      <div
        className="max-w-5xl px-16 py-9 my-6 rounded-3xl"
        style={{ backgroundColor: '#F2EAEA' }}
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Units</h2>

        {unitsList.map((unit, index) => (
          <UnitForm
            key={index}
            unitNumber={unit.unitNumber}
            onChange={(updatedUnit) => handleUnitChange(index, updatedUnit)}
          />
        ))}

        <div className="mx-auto my-6 flex justify-center">
          <button
            onClick={handleAddUnit}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-2 rounded-lg cursor-pointer w-44 h-10 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-xl pb-1">+</span>
            Add another unit
          </button>
        </div>

        <div className="mx-auto my-6 flex justify-center gap-2">
          <button
            type="submit"
            onClick={handleSaveDraftModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Save draft
          </button>
          <button
            type="submit"
            onClick={handlePublishModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateModulePage() {
  return (
    <ModuleContextProvider>
      <CreateModulePageContent />
    </ModuleContextProvider>
  );
}

export default CreateModulePage;
