import React, { useState, useEffect } from 'react';
import { fetchUnitContentById } from '../../../../services/unit/unitApi';
import UnitItem from './UnitItem';
import { type Unit } from '../ModulePage';

interface SyllabusProps {
  units: Unit[];
}

const fetchUnitContentByUnitId = async (unitId: string) => {
  try {
    return await fetchUnitContentById(unitId);
  } catch (error) {
    console.log('Error fetching unit content:', error);
    return [];
  }
};

const Syllabus: React.FC<SyllabusProps> = ({ units }) => {
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [unitsWithContent, setUnitsWithContent] = useState<Unit[]>(units);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sorted = [...units].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    setUnitsWithContent(sorted);
    if (!units || units.length === 0) {
      setErrorMessage('No units found');
    } else {
      setErrorMessage(null);
    }
  }, [units]);

  const toggleUnit = async (index: number) => {
    const selectedUnit = unitsWithContent[index];
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
      setUnitsWithContent((prevUnits) => {
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
    <div className="bg-[#F9F5FF] rounded-2xl p-6 shadow-md w-full mx-auto border border-[#D4C2FC]">
      <h2 className="text-xl font-semibold text-[#231942] mb-4">Syllabus</h2>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {unitsWithContent.map((unit, index) => (
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
