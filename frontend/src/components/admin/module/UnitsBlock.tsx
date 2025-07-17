import React, { useEffect, useState } from 'react';
import {
  fetchUnitById,
  fetchUnitTitleByModuleId,
} from '../../../services/unit/unitApi';
import UnitsBlock from '../ui/UnitsBlock';

interface AdminUnitsBlockProps {
  moduleId: string;
}

const AdminUnitsBlock: React.FC<AdminUnitsBlockProps> = ({ moduleId }) => {
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
        const detailedUnits = await Promise.all(
          previews.map(async (unit: { id: string; title: string }) => {
            try {
              const details = await fetchUnitById(unit.id);
              return { ...unit, description: details.description };
            } catch {
              return { ...unit };
            }
          }),
        );
        setUnits(detailedUnits);
      } catch (err) {
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [moduleId]);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {loading && <p>Loading units...</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && !error && (
        <UnitsBlock
          units={units}
          expandedId={expandedId}
          onToggle={handleToggle}
        />
      )}
    </>
  );
};

export default AdminUnitsBlock;
