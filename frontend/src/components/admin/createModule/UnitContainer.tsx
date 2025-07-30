import React, { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import UnitItem from '../ui/UnitItem';
import UnitForm from './UnitForm';
import AddContentDropdown from './AddContentDropdown';
import AddArticleModal from './AddArticleModal';
import AddVideoModal from './AddVideoModal';
import AddQuizModal from './AddQuizModal';

interface UnitContainerProps {
  unitNumber: number;
  initialEditMode?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const UnitContainer: React.FC<UnitContainerProps> = ({
  unitNumber,
  initialEditMode = true,
  isOpen,
  onToggle,
}) => {
  const { getUnitState, setIsEditing } = useUnitContext();
  const unitState = getUnitState(unitNumber);
  const unitId = unitState?.id ?? '';

  // Set editing state on initial mount only if undefined
  useEffect(() => {
    if (unitState && typeof unitState.isEditing === 'undefined') {
      setIsEditing(unitNumber, initialEditMode);
    }
  }, [unitState, initialEditMode, setIsEditing, unitNumber]);

  const isEditing = unitState?.isEditing;

  // Content‐block modal flags
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  return (
    <>
      <UnitItem
        unitNumber={unitNumber}
        index={unitNumber - 1}
        isOpen={isOpen}
        onToggle={onToggle}
        isEditing={isEditing}
        renderEdit={
          <UnitForm
            unitNumber={unitNumber}
            onSaved={() => setIsEditing(unitNumber, false)}
          />
        }
        onEdit={() => setIsEditing(unitNumber, true)}
        addContentComponent={
          <AddContentDropdown
            unitNumber={unitNumber}
            disabled={!unitId || Boolean(unitState?.isSaving)}
            onOpenArticle={() => setShowArticleModal(true)}
            onOpenVideo={() => setShowVideoModal(true)}
            onOpenQuiz={() => setShowQuizModal(true)}
          />
        }
      />

      {/* Article Modal */}
      <AddArticleModal
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        unitId={unitId}
        unitNumber={unitNumber}
      />

      {/* Video Modal */}
      <AddVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        unitId={unitId}
        unitNumber={unitNumber}
      />

      {/* Quiz Modal */}
      <AddQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        unitId={unitId}
        unitNumber={unitNumber}
      />
    </>
  );
};

export default UnitContainer;
