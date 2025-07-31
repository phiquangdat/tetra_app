import React, { useEffect, useState } from 'react';
import {
  fetchUnitById,
  fetchUnitTitleByModuleId,
  type UnitContent,
  type UnitDetailsResponse,
} from '../../../services/unit/unitApi';
import UnitsBlock from '../ui/UnitsBlock';
import UnitItem from '../ui/UnitItem';
import { useUnitContext } from '../../../context/admin/UnitContext';

interface UnitsBlockUIProps {
  moduleId: string;
}

const UnitsBlockUI: React.FC<UnitsBlockUIProps> = ({ moduleId }) => {
  const { setUnitState, setUnitStatesRaw } = useUnitContext();
  const [unitNumbers, setUnitNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) return <p>Loading units…</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <UnitsBlock>
      {unitNumbers.map((unitNumber, index) => (
        <UnitItem
          key={unitNumber}
          index={index}
          unitNumber={unitNumber}
          isOpen={expandedId === unitNumber}
          onToggle={() => toggle(unitNumber)}
        />
      ))}
    </UnitsBlock>
  );
};

export default UnitsBlockUI;
