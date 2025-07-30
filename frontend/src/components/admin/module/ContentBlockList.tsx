import React from 'react';
import { StateContentBlockList } from '../ui/StateContentBlockList';
import { useUnitContext } from '../../../context/admin/UnitContext';
import { BaseContentBlockList } from '../ui/BaseContentBlockList';

interface ContentBlockListProps {
  unitNumber?: number;
}

const ContentBlockList: React.FC<ContentBlockListProps> = ({ unitNumber }) => {
  const { getUnitState } = useUnitContext();

  // If context-based rendering
  if (unitNumber !== undefined) {
    const unit = getUnitState(unitNumber);
    const content = unit?.content ?? [];

    return <BaseContentBlockList blocks={content} unitNumber={unitNumber} />;
  }

  // Otherwise fallback to API fetch only
  return <StateContentBlockList unitNumber={-1} />; // fallback (shouldn't really happen)
};

export default ContentBlockList;
