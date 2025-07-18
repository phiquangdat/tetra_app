import React, { useEffect, useState } from 'react';
import {
  type UnitContent,
  type UnitDetailsResponse,
  fetchUnitById,
  fetchUnitTitleByModuleId,
} from '../../../services/unit/unitApi';
import UnitsBlock from '../ui/UnitsBlock';
import UnitItem from '../ui/UnitItem';

interface UnitsBlockUIProps {
  moduleId: string;
}

const UnitsBlockUI: React.FC<UnitsBlockUIProps> = ({ moduleId }) => {
  const [units, setUnits] = useState<
    { id: string; title: string; description?: string }[]
  >([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const previews = await fetchUnitTitleByModuleId(moduleId);
        const detailed = await Promise.all(
          previews.map(async (u: UnitContent) => {
            try {
              const d: UnitDetailsResponse = await fetchUnitById(u.id);
              return { ...u, description: d.description };
            } catch {
              return u;
            }
          }),
        );
        setUnits(detailed);
      } catch {
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, [moduleId]);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) return <p>Loading units…</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <UnitsBlock>
      {units.map((u, i) => (
        <UnitItem
          key={u.id}
          index={i}
          id={u.id}
          title={u.title}
          details={{
            id: u.id,
            title: u.title,
            description: u.description || '',
          }}
          isOpen={expandedId === u.id}
          onToggle={() => toggle(u.id)}
          onEdit={() => {
            /* optional edit hook */
          }}
        />
      ))}
    </UnitsBlock>
  );
};

export default UnitsBlockUI;
