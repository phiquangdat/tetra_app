import { StateContentBlockList } from '../ui/StateContentBlockList.tsx';
import { ApiContentBlockList } from '../ui/ApiContentBlockList.tsx';

interface ContentBlockListProps {
  unitId: string;
  unitNumber?: number;
}

const ContentBlockList: React.FC<ContentBlockListProps> = ({
  unitId,
  unitNumber,
}) =>
  unitNumber !== undefined ? (
    <StateContentBlockList unitNumber={unitNumber} />
  ) : (
    <ApiContentBlockList unitId={unitId} />
  );

export default ContentBlockList;
