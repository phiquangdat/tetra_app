import React, { useEffect, useState } from 'react';
import { fetchUnitTitleByModuleId } from '../../../services/unit/unitApi';
import UnitItem from './UnitItem';

interface UnitsBlockProps {
  moduleId: string;
}

interface UnitPreview {
  id: string;
  title: string;
}

const UnitsBlock: React.FC<UnitsBlockProps> = ({ moduleId }) => {
  const [units, setUnits] = useState<UnitPreview[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const data = await fetchUnitTitleByModuleId(moduleId);
        setUnits(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, [moduleId]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-[#231942] mb-4">Units</h2>
      {loading && <p>Loading units...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-4">
        {units.map((unit, index) => (
          <UnitItem
            key={unit.id}
            id={unit.id}
            title={unit.title}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default UnitsBlock;
