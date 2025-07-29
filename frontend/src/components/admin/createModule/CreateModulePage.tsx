import { useEffect } from 'react';
import {
  initialUnitState,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import CreateModuleForm from './CreateModuleForm';
import UnitsBlock from '../ui/UnitsBlock.tsx';
import { EditorStateProvider } from '../../../utils/editor/contexts/EditorStateContext';
import UnitContainer from './UnitContainer';

const UnitsManager: React.FC = () => {
  const { unitStates, addUnit } = useUnitContext();

  return (
    <UnitsBlock>
      {Object.keys(unitStates).map((key) => {
        const num = parseInt(key, 10);
        return <UnitContainer key={num} unitNumber={num} />;
      })}
      <button
        type="button"
        onClick={addUnit}
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
      >
        Add new unit
      </button>
    </UnitsBlock>
  );
};

function CreateModulePageContent() {
  const { setUnitStatesRaw } = useUnitContext();

  useEffect(() => {
    setUnitStatesRaw({ 1: initialUnitState() });
  }, []);

  const handleSaveDraftModule = () => {};

  const handlePublishModule = () => {};

  return (
    <div className="m-0 px-4 py-4 max-w-5xl">
      <h1 className="font-extrabold text-[28px] pb-4">Create New Module</h1>
      <CreateModuleForm />
      <UnitsManager />
      <div
        className="max-w-5xl px-16 py-9 my-6 rounded-3xl"
        style={{ backgroundColor: '#F2EAEA' }}
      >
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
    <EditorStateProvider>
      <CreateModulePageContent />
    </EditorStateProvider>
  );
}

export default CreateModulePage;
