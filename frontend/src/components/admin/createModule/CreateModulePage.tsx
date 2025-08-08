import { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import CreateModuleForm from './CreateModuleForm';
import UnitsBlock from '../ui/UnitsBlock.tsx';
import UnitContainer from '../ui/UnitContainer.tsx';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useModuleContext } from '../../../context/admin/ModuleContext.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { useNavigate } from 'react-router-dom';

const UnitsManager: React.FC = () => {
  const { unitStates, addUnit, getNextUnitNumber } = useUnitContext();
  const [expandedUnitNumber, setExpandedUnitNumber] = useState<number | null>(
    1,
  );

  const unitNumbers = Object.keys(unitStates)
    .map(Number)
    .sort((a, b) => a - b);
  const lastUnitNumber = unitNumbers[unitNumbers.length - 1];
  const lastUnit = unitStates[lastUnitNumber];
  const canAddUnit = unitNumbers.length === 0 || !!lastUnit?.id; // must be saved (have an ID) if not the first

  const handleAddUnit = () => {
    const newUnitNumber = getNextUnitNumber();
    addUnit();
    setExpandedUnitNumber(newUnitNumber);
  };

  return (
    <UnitsBlock unitCount={unitNumbers.length}>
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
      <div className="flex justify-center mt-4">
        <div className="relative group inline-block">
          <button
            type="button"
            onClick={handleAddUnit}
            disabled={!canAddUnit}
            className={`px-4 py-2 rounded-lg transition ${
              canAddUnit
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-highlight text-primary opacity-50 cursor-not-allowed'
            }`}
          >
            Add new unit
          </button>

          {!canAddUnit && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-2 bg-error/10 text-error text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Please save the current unit before adding a new one.
            </div>
          )}
        </div>
      </div>
    </UnitsBlock>
  );
};

function CreateModulePageContent() {
  const { setUnitStatesRaw } = useUnitContext();
  const [ready, setReady] = useState(false);
  const { clearContent } = useContentBlockContext();
  const { publishModule, status } = useModuleContext();
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUnitStatesRaw({});
    clearContent();
    setReady(true);
  }, []);

  if (!ready) {
    return <div>Initializing form...</div>;
  }

  const handleConfirmPublish = async () => {
    await publishModule();
    navigate('/admin/modules');
  };

  return (
    <div className="mx-auto max-w-5xl min-h-screen bg-background px-4 py-6 text-left">
      <h1 className="font-extrabold text-[28px] pb-4 text-primary">
        Create New Module
      </h1>
      <CreateModuleForm />
      <UnitsManager />
      <div
        className="max-w-5xl px-6 sm:px-10 py-8 my-6 rounded-3xl"
        // style={{ backgroundColor: '#F2EAEA' }}
      >
        <div className="mx-auto my-2 flex justify-center">
          {status !== 'published' && (
            <div className="mx-auto my-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(true)}
                className="
                    inline-flex items-center justify-center
                    bg-surface text-white
                    border border-highlight
                    text-sm px-4 py-2 rounded-lg
                    cursor-pointer
                    hover:bg-surfaceHover
                    focus:outline-none focus:ring-2 focus:ring-highlight/60 focus:ring-offset-2 focus:ring-offset-background
                    transition-colors duration-200 w-36 h-10
                  "
              >
                Publish
              </button>
            </div>
          )}
        </div>
      </div>
      {showPublishConfirm && (
        <ConfirmationModal
          title="Publish Module"
          description="Are you sure you want to publish this module? Once published, it will be visible to users."
          onCancel={() => setShowPublishConfirm(false)}
          onConfirm={handleConfirmPublish}
          confirmText="Publish"
        />
      )}
    </div>
  );
}

function CreateModulePage() {
  return <CreateModulePageContent />;
}

export default CreateModulePage;
