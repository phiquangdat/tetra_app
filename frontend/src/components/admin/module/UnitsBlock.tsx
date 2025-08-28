import React, { useEffect, useState } from 'react';
import {
  fetchUnitById,
  fetchUnitTitleByModuleId,
  type UnitContent,
  type UnitDetailsResponse,
} from '../../../services/unit/unitApi';
import UnitsBlock from '../ui/UnitsBlock';
import { useUnitContext } from '../../../context/admin/UnitContext';
import UnitContainer from '../ui/UnitContainer.tsx';

interface UnitsBlockUIProps {
  moduleId: string;
}

const UnitsBlockUI: React.FC<UnitsBlockUIProps> = ({ moduleId }) => {
  const {
    setUnitState,
    setUnitStatesRaw,
    unitStates,
    addUnit,
    getNextUnitNumber,
    setIsEditing,
  } = useUnitContext();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedUnitNumber, setExpandedUnitNumber] = useState<number | null>(
    null,
  );

  const unitNumbers = Object.keys(unitStates)
    .map(Number)
    .sort(
      (a, b) =>
        (unitStates[a]?.sort_order ?? 0) - (unitStates[b]?.sort_order ?? 0),
    );

  const lastUnitNumber = unitNumbers[unitNumbers.length - 1];
  const lastUnit = unitStates[lastUnitNumber];
  const canAddUnit = unitNumbers.length === 0 || !!lastUnit?.id;

  useEffect(() => {
    const loadUnits = async () => {
      try {
        // Reset context by clearing existing states
        setUnitStatesRaw({});
        const previews = await fetchUnitTitleByModuleId(moduleId);

        const detailedUnits = await Promise.all(
          previews.map(async (u: UnitContent) => {
            try {
              const d: UnitDetailsResponse = await fetchUnitById(u.id);
              return { ...u, description: d.description };
            } catch {
              return u;
            }
          }),
        );

        // Store in context
        detailedUnits.forEach((u, i) => {
          setUnitState(i + 1, {
            id: u.id,
            title: u.title,
            description: u.description ?? '',
            sort_order: u.sort_order ?? i * 10,
          });
        });

        detailedUnits.forEach((u, i) => {
          setUnitState(i + 1, {
            id: u.id,
            title: u.title,
            description: u.description ?? '',
          });
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [moduleId, setUnitState]);

  const handleAddUnit = () => {
    const newUnitNumber = getNextUnitNumber();
    addUnit();
    setExpandedUnitNumber(newUnitNumber);
    setIsEditing(newUnitNumber, true);
  };

  if (loading) return <p>Loading units…</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <UnitsBlock unitCount={unitNumbers.length}>
      {unitNumbers.map((unitNumber, index) => (
        <UnitContainer
          unitNumber={unitNumber}
          key={index}
          initialEditMode={false}
          isOpen={expandedUnitNumber === unitNumber}
          onToggle={() =>
            setExpandedUnitNumber((prev) =>
              prev === unitNumber ? null : unitNumber,
            )
          }
        />
      ))}

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

export default UnitsBlockUI;
