import React, { useMemo, useState } from 'react';
import ModuleDetails from './ModuleDetails.tsx';
import UnitsBlock from './UnitsBlock.tsx';
import ConfirmationModal from '../createModule/ConfirmationModal.tsx';
import { useNavigate } from 'react-router-dom';
import { useModuleContext } from '../../../context/admin/ModuleContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';

interface ModulePageProps {
  id: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  const { publishModule, status } = useModuleContext();
  const { unitStates } = useUnitContext();
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const navigate = useNavigate();

  const handleConfirmPublish = async () => {
    await publishModule();
    navigate('/admin/modules');
  };

  const canPublish = useMemo(() => {
    if (!id) return false;

    const units = Object.values(unitStates);
    if (units.length === 0) return false;

    // At least one saved unit that has at least one saved content block
    return units.some(
      (u) =>
        !!u.id && Array.isArray(u.content) && u.content.some((c) => !!c.id),
    );
  }, [id, unitStates]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 min-h-screen bg-background text-left">
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
      <UnitsBlock moduleId={id} />

      <div className="mx-auto my-2 mt-5 flex justify-center">
        {status !== 'published' && (
          <div className="relative group">
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => canPublish && setShowPublishConfirm(true)}
              className={`w-36 h-10 rounded-lg transition ${
                canPublish
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-highlight text-primary opacity-50 cursor-not-allowed'
              }`}
            >
              Publish
            </button>

            {!canPublish && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-2 bg-error/10 text-error text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Save the module, plus at least one unit with at least one saved
                content block.
              </div>
            )}
          </div>
        )}
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
};

export default ModulePage;
