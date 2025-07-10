import { useEffect } from 'react';
import { ModuleContextProvider } from '../../../context/admin/ModuleContext';
import {
  UnitContextProvider,
  ContentBlockContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import CreateModuleForm from './CreateModuleForm';
import UnitForm from './UnitForm';

function CreateModulePageContent() {
  const { unitStates, setUnitState, getNextUnitNumber } = useUnitContext();

  const unitNumbers = Object.keys(unitStates)
    .map(Number)
    .sort((a, b) => a - b);

  const handleAddUnit = () => {
    const nextUnitNumber = getNextUnitNumber();
    setUnitState(nextUnitNumber, {
      id: null,
      title: '',
      description: '',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
  };

  useEffect(() => {
    if (unitNumbers.length === 0) {
      handleAddUnit();
    }
  }, []);

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

        {unitNumbers.map((unitNumber) => (
          <UnitForm key={unitNumber} unitNumber={unitNumber} />
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
            type="button"
            onClick={handleSaveDraftModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Save draft
          </button>
          <button
            type="button"
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
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <CreateModulePageContent />
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>
  );
}

export default CreateModulePage;
