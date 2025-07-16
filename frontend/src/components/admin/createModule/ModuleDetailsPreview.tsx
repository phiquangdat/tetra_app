import React from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import ModuleDetailsUI from '../ui/ModuleDetails';

interface Props {
  onEdit: () => void;
}

const ModuleDetailsPreview: React.FC<Props> = ({ onEdit }) => {
  const { title, description, topic, pointsAwarded, coverPicture, status } =
    useModuleContext();

  const module = {
    id: '', // not needed for display
    title,
    description,
    topic,
    points: pointsAwarded,
    coverUrl: coverPicture ?? '',
    status,
  };

  return <ModuleDetailsUI module={module} onEdit={onEdit} />;
};

export default ModuleDetailsPreview;
