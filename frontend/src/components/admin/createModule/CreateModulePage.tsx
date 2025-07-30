import { useEffect, useState } from 'react';
import {
  initialUnitState,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import CreateModuleForm from './CreateModuleForm';
import UnitsBlock from '../ui/UnitsBlock.tsx';
import UnitContainer from './UnitContainer';

const UnitsManager: React.FC = () => {
  const { unitStates, addUnit } = useUnitContext();
  const [expandedUnitNumber, setExpandedUnitNumber] = useState<number | null>(
    1,
  );

  return (
    <UnitsBlock>
      {Object.keys(unitStates).map((key) => {
        const num = parseInt(key, 10);
        const isOpen = expandedUnitNumber === num;
        return (
          <UnitContainer
            key={num}
            unitNumber={num}
            initialEditMode={true}
            isOpen={isOpen}
            onToggle={() =>
              setExpandedUnitNumber((prev) => (prev === num ? null : num))
            }
          />
        );
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
  const { setUnitStatesRaw, unitStates } = useUnitContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Clear all existing units
    setUnitStatesRaw({});
    // Then initialize unit 1
    setUnitStatesRaw({ 1: initialUnitState() });
    setTimeout(() => {
      setUnitStatesRaw({ 1: initialUnitState() });
      setReady(true);
    }, 0);
  }, []);

  if (!ready || Object.keys(unitStates).length === 0) {
    return <div>Initializing form...</div>;
  }

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
  return <CreateModulePageContent />;
}

export default CreateModulePage;
