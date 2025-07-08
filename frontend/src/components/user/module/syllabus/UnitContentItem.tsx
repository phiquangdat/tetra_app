import { BookIcon, StarIcon, VideoIcon } from '../../../common/Icons';

interface UnitContentItemProps {
  type: 'video' | 'article' | 'quiz';
  title: string;
}

function UnitContentItem({ type, title }: UnitContentItemProps) {
  return (
    <div className="grid grid-cols-[24px_80px_1fr] gap-2 items-center text-[#231942]">
      <div className="w-6 h-6 flex items-center justify-center">
        {type === 'video' ? (
          <VideoIcon color="#231942" />
        ) : type === 'article' ? (
          <BookIcon color="#231942" />
        ) : (
          <StarIcon />
        )}
      </div>
      <div className="capitalize font-medium text-sm text-[#998FC7]">
        {type}
      </div>
      <div>{title}</div>
    </div>
  );
}

export default UnitContentItem;
