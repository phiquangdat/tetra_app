import React, { useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import UnitItem from '../ui/UnitItem';
import UnitForm from './UnitForm';
import AddContentDropdown from './AddContentDropdown';
import AddArticleModal from './AddArticleModal';
import AddVideoModal from './AddVideoModal';
import AddQuizModal from './AddQuizModal';

interface UnitContainerProps {
  unitNumber: number;
}

const UnitContainer: React.FC<UnitContainerProps> = ({ unitNumber }) => {
  const { getUnitState } = useUnitContext();
  const unitState = getUnitState(unitNumber);
  const unitId = unitState?.id ?? '';

  // Accordion open/close
  const [isOpen, setIsOpen] = useState(true);
  // Toggle between edit form and preview
  const [isEditing, setIsEditing] = useState(true);

  // Content‐block modal flags
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  return (
    <>
      <UnitItem
        id={unitId}
        unitNumber={unitNumber}
        title={unitState?.title || ''}
        details={{
          id: unitId,
          title: unitState?.title || '',
          description: unitState?.description || '',
        }}
        index={unitNumber - 1}
        isOpen={isOpen}
        onToggle={() => setIsOpen((open) => !open)}
        isEditing={isEditing}
        renderEdit={
          <UnitForm
            unitNumber={unitNumber}
            onSaved={() => setIsEditing(false)}
          />
        }
        onEdit={() => setIsEditing(true)}
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
