import React, { useState, useEffect } from 'react';
import {
  fetchUnitContentById,
  fetchUnitTitleByModuleId,
} from '../../../../services/unit/unitApi';
import UnitItem from './UnitItem';

interface SyllabusProps {
  moduleID: string | null;
}

type Unit = {
  id: string;
  title: string;
  content?: {
    type: 'video' | 'article' | 'quiz';
    title: string;
  }[];
};

const fetchUnitContentByUnitId = async (unitId: string) => {
  try {
    return await fetchUnitContentById(unitId);
  } catch (error) {
    console.log('Error fetching unit content:', error);
    return [];
  }
};

const fetchUnitsByModuleId = async (id: string): Promise<Unit[]> => {
  try {
    return await fetchUnitTitleByModuleId(id);
  } catch (error) {
    console.error('Error fetching units:', error);
    return [{ id, title: 'Error fetching unit', content: [] }];
  }
};

const Syllabus: React.FC<SyllabusProps> = ({ moduleID }) => {
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleID) {
      setErrorMessage('failed to fetch units: units is not found');
      return;
    }

    const fetchUnits = async () => {
      try {
        const unitsData = await fetchUnitsByModuleId(moduleID);
        setUnits(unitsData);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'An unknown error occurred',
        );
      }
    };

    fetchUnits();
  }, [moduleID]);

  const toggleUnit = async (index: number) => {
    const selectedUnit = units[index];

    // Toggle open/close
    setOpenUnit(openUnit === index ? null : index);

    // If content already loaded, skip fetch
    if (selectedUnit.content && selectedUnit.content.length > 0) return;

    try {
      const contentData = await fetchUnitContentByUnitId(selectedUnit.id);

      const mappedContent = contentData.map((item) => ({
        type: item.content_type as 'video' | 'article' | 'quiz',
        title: item.title,
      }));

      // Update only the content of the selected unit
      setUnits((prevUnits) => {
        const updatedUnits = [...prevUnits];
        updatedUnits[index] = {
          ...updatedUnits[index],
          content: mappedContent,
        };
        return updatedUnits;
      });
    } catch (error) {
      console.error('Error loading unit content:', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl p-6 shadow-md w-full mx-auto">
      <h2 className="text-xl font-semibold mb-4">Syllabus</h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {units.map((unit, index) => (
        <UnitItem
          key={unit.id}
          unit={unit}
          isOpen={openUnit === index}
          onToggle={() => toggleUnit(index)}
          index={index}
        />
      ))}
    </div>
  );
};

export default Syllabus;
