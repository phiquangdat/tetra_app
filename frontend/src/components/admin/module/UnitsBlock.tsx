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
  const { setUnitState, setUnitStatesRaw } = useUnitContext();
  const [unitNumbers, setUnitNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedUnitNumber, setExpandedUnitNumber] = useState<number | null>(
    null,
  );

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
          });
        });

        setUnitNumbers(detailedUnits.map((_, i) => i + 1));
      } catch (err) {
        console.error(err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [moduleId, setUnitState]);

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
    </UnitsBlock>
  );
};

export default UnitsBlockUI;
