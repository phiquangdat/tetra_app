import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import {
  useModuleContext,
  initialModuleState,
} from '../../../context/admin/ModuleContext';
import ModuleDetailsUI from '../ui/ModuleDetailsUI';
import ModuleFormFields from '../createModule/ModuleFormFields';
import SaveButton from '../ui/SaveButton.tsx';
import { useModuleSave } from '../../../hooks/useModuleSave';

interface ModuleDetailsProps {
  id: string;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ id }) => {
  const { setModuleState, isEditing, setIsEditing, isDirty } =
    useModuleContext();
  const { handleSave, isSaving, formErrors, showContextError, error } =
    useModuleSave();

  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module | null>(null);

  useEffect(() => {
    setModuleState(initialModuleState);
    setIsEditing(false);

    const loadModule = async () => {
      try {
        const data = await fetchModuleById(id);
        setModuleState({
          id: data.id,
          title: data.title,
          description: data.description,
          topic: data.topic,
          pointsAwarded: data.points,
          coverPicture: data.coverUrl,
          status: data.status,
          isDirty: false,
          error: null,
        });
        setModule(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [id, setModuleState, setIsEditing]);

  if (loading) return <div>Loading module...</div>;
  if (!module) return <div className="text-error">Module not found</div>;

  const cardClasses =
    'bg-cardBackground border border-highlight rounded-3xl p-6 shadow-md text-primary w-full';

  return isEditing ? (
    <>
      {Object.keys(formErrors).length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <ul className="list-disc list-inside">
            {Object.values(formErrors).map((err, idx) => (
              <li key={idx} className="text-sm">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showContextError && error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className={cardClasses}>
        <form>
          <ModuleFormFields />
          <SaveButton
            onClick={handleSave}
            disabled={isSaving}
            isDirty={isDirty}
          />
        </form>
      </div>
    </>
  ) : (
    <ModuleDetailsUI onEdit={() => setIsEditing(true)} />
  );
};

export default ModuleDetails;
