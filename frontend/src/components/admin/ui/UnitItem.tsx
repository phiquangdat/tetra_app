import React, { useEffect, useState, type ReactNode } from 'react';
import { fetchUnitById } from '../../../services/unit/unitApi';
import Accordion from './Accordion';
import ContentBlockList from '../module/ContentBlockList';

export interface UnitItemProps {
  id: string;
  title: string;
  details?: UnitDetails;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  renderEdit?: ReactNode;
  isEditing?: boolean;
  addContentComponent?: ReactNode;
  onEdit?: () => void;
}

export interface UnitDetails {
  id: string;
  title: string;
  description: string;
  moduleId?: string;
}

const UnitItem: React.FC<UnitItemProps> = ({
  id,
  title,
  details,
  index,
  isOpen,
  onToggle,
  isEditing = false,
  renderEdit,
  onEdit,
  addContentComponent,
}) => {
  const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(
    details ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (details) {
      setUnitDetails(details);
    }
  }, [details]);

  useEffect(() => {
    if (isOpen && !details && !loading) {
      setLoading(true);
      fetchUnitById(id)
        .then(setUnitDetails)
        .catch(() => setError('Failed to fetch unit details'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, details]);

  return (
    <Accordion
      header={`Unit ${index + 1}: ${title}`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {loading && <p>Loading unit details…</p>}
      {error && <p className="text-error">{error}</p>}

      {/* If we're in edit mode and were given a form, render it */}
      {isEditing && renderEdit ? (
        <>{renderEdit}</>
      ) : unitDetails ? (
        /* Otherwise render the normal preview: */
        <>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-semibold">Unit title</p>
              <p>{unitDetails.title}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Unit description</p>
              <p>{unitDetails.description}</p>
            </div>
          </div>

          {/* Optional “Edit” button in preview mode */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
            >
              Edit
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-2">Loading unit details…</p>
      )}

      {/* Always render these two below, whether in edit or preview */}
      {addContentComponent}

      <div className="mt-6">
        <ContentBlockList unitId={id} />
      </div>
    </Accordion>
  );
};

export default UnitItem;
