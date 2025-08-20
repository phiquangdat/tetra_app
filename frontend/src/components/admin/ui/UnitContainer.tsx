import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import UnitItem from './UnitItem.tsx';
import UnitForm from './UnitForm.tsx';
import AddContentDropdown from '../createModule/AddContentDropdown.tsx';
import AddArticleModal from '../createModule/AddArticleModal.tsx';
import AddVideoModal from '../createModule/AddVideoModal.tsx';
import AddQuizModal from '../createModule/AddQuizModal.tsx';
import {
  useOutsideClick,
  type UseOutsideClickParams,
} from '../../../hooks/useOutsideClick.ts';

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
  const { getUnitState, setIsEditing, editingBlock, setEditingBlock } =
    useUnitContext();
  const unitState = getUnitState(unitNumber);
  const unitId = unitState?.id ?? '';

  const editContainerRef = useRef<HTMLDivElement | null>(null);

  // Set editing state on initial mount only if undefined
  useEffect(() => {
    if (unitState && typeof unitState.isEditing === 'undefined') {
      setIsEditing(unitNumber, initialEditMode);
    }
  }, [unitState, initialEditMode, setIsEditing, unitNumber]);

  useEffect(() => {
    if (!editingBlock || editingBlock.unitNumber !== unitNumber) return;

    switch (editingBlock.type) {
      case 'article':
        setShowArticleModal(true);
        break;
      case 'video':
        setShowVideoModal(true);
        break;
      case 'quiz':
        setShowQuizModal(true);
        break;
    }
  }, [editingBlock, unitNumber]);

  const isEditing = unitState?.isEditing;

  const exitEditMode = useCallback(() => {
    if (isEditing) setIsEditing(unitNumber, false);
  }, [isEditing, setIsEditing, unitNumber]);

  const outsideClickParams: UseOutsideClickParams = {
    getElement: () => editContainerRef.current,
    onOutside: exitEditMode,
    options: {
      eventType: 'pointerdown',
      enabled: !!isEditing && !!unitState?.id,
      ignore: (target) =>
        !!(target as HTMLElement | null)?.closest?.(
          '[role="dialog"], [data-portal-root], [data-ignore-outside="true"]',
        ),
    },
  };

  useOutsideClick(outsideClickParams);

  // Content‐block modal flags
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  if (!unitState) return null;

  return (
    <>
      <UnitItem
        unitNumber={unitNumber}
        index={unitNumber - 1}
        isOpen={isOpen}
        onToggle={onToggle}
        isEditing={isEditing}
        renderEdit={
          <div ref={editContainerRef}>
            <UnitForm
              unitNumber={unitNumber}
              onSaved={() => setIsEditing(unitNumber, false)}
            />
          </div>
        }
        onEdit={() => setIsEditing(unitNumber, true)}
        addContentComponent={
          <AddContentDropdown
            unitNumber={unitNumber}
            onOpenArticle={() => setShowArticleModal(true)}
            onOpenVideo={() => setShowVideoModal(true)}
            onOpenQuiz={() => setShowQuizModal(true)}
          />
        }
      />

      {/* Article Modal */}
      <AddArticleModal
        isOpen={showArticleModal}
        onClose={() => {
          setShowArticleModal(false);
          setEditingBlock(null);
        }}
        unitId={unitId}
        unitNumber={unitNumber}
      />

      {/* Video Modal */}
      <AddVideoModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setEditingBlock(null);
        }}
        unitId={unitId}
        unitNumber={unitNumber}
      />

      {/* Quiz Modal */}
      <AddQuizModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          setEditingBlock(null);
        }}
        unitId={unitId}
        unitNumber={unitNumber}
      />
    </>
  );
};

export default UnitContainer;
