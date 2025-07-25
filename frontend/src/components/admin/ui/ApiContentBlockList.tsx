import { useEffect, useState } from 'react';
import {
  fetchUnitContentById,
  type UnitContent,
} from '../../../services/unit/unitApi';
import { BaseContentBlockList } from './BaseContentBlockList.tsx';
import type { ContentBlock } from '../../../context/admin/UnitContext.tsx';

interface ApiContentBlockListProps {
  unitId: string;
}

export const ApiContentBlockList: React.FC<ApiContentBlockListProps> = ({
  unitId,
}) => {
  const [fetched, setFetched] = useState<UnitContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchUnitContentById(unitId)
      .then(setFetched)
      .catch(() => setError('Failed to load content blocks from API'))
      .finally(() => setLoading(false));
  }, [unitId]);

  if (loading) return <p>Loading content blocks…</p>;
  if (error) return <p className="text-error">{error}</p>;

  const blocks: ContentBlock[] = fetched.map((u) => ({
    id: u.id,
    type: u.content_type as ContentBlock['type'],
    data: { title: u.title },
    sortOrder: u.sort_order,
    unit_id: unitId,
    isDirty: false,
    isSaving: false,
    error: null,
  }));

  return <BaseContentBlockList blocks={blocks} />;
};
