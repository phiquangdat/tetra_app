import { useUnitContext } from '../../../context/admin/UnitContext';
import { BaseContentBlockList } from './BaseContentBlockList.tsx';

interface StateContentBlockListProps {
  unitNumber: number;
}

export const StateContentBlockList: React.FC<StateContentBlockListProps> = ({
  unitNumber,
}) => {
  const { getUnitState } = useUnitContext();
  const unit = getUnitState(unitNumber);
  const blocks = unit?.content ?? [];

  return <BaseContentBlockList blocks={blocks} unitNumber={unitNumber} />;
};
