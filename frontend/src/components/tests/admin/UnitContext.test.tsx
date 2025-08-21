import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';

import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';

import * as unitApi from '../../../services/unit/unitApi';
import * as contentApi from '../../../services/unit/content/unitContentApi';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../../services/unit/unitApi', () => ({
  deleteUnit: vi.fn(),
}));
vi.mock('../../../services/unit/content/unitContentApi', () => ({
  deleteUnitContent: vi.fn(),
}));

vi.mock('../../../context/admin/ModuleContext.tsx', () => {
  const updateModuleField = vi.fn();
  return {
    useModuleContext: () => ({
      id: undefined, // keep undefined so adjustModulePoints path is skipped
      updateModuleField, // no-op
      setModuleState: vi.fn(),
      isEditing: false,
      setIsEditing: vi.fn(),
      isDirty: false,
    }),
    ModuleContextProvider: ({ children }: any) => children,
    initialModuleState: {
      id: null,
      title: '',
      description: '',
      topic: '',
      pointsAwarded: 0,
      coverPictureUrl: '',
      isDirty: false,
      isSaving: false,
      error: null,
      isEditing: true,
      status: 'draft',
    },
  };
});

vi.mock('../../../utils/pointsHelpers.ts', () => ({
  adjustModulePoints: vi.fn(async () => ({ points: 0 })),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <UnitContextProvider>{children}</UnitContextProvider>
);

describe('UnitContext - removeUnit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true and shows success toast when deletion succeeds', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockResolvedValueOnce('Unit deleted');

    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: 'unit-id-1',
        title: 'Sample',
        description: '',
        content: [],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith('unit-id-1');
    expect(toast.success).toHaveBeenCalledWith('Unit deleted successfully');
  });

  it('returns false and shows error toast when deletion fails', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: 'unit-id-1',
        title: 'Sample',
        description: '',
        content: [],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to delete unit. Please try again later.',
    );
  });

  it('returns true without calling API when unit has no ID (unsaved)', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;

    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: null,
        title: 'Unsaved Unit',
        description: '',
        content: [],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success).toBe(true);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns false if unit number is not in state', async () => {
    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    let success!: boolean;
    await act(async () => {
      success = await result.current.removeUnit(42);
    });

    expect(success).toBe(false);
  });
});

describe('UnitContext - removeUnitContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes unit content and removes block from context on success', async () => {
    const mockDeleteContent =
      contentApi.deleteUnitContent as unknown as ReturnType<typeof vi.fn>;
    mockDeleteContent.mockResolvedValueOnce('Content deleted');

    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: 'unit-id-1',
        title: 'Unit With Content',
        description: '',
        content: [
          {
            id: 'block-1',
            type: 'article',
            data: { title: 'Article' },
            sortOrder: 1,
            unit_id: 'unit-id-1',
            isDirty: false,
            isSaving: false,
            error: null,
          },
        ],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeUnitContent(1, 0);
    });

    expect(ok).toBe(true);
    expect(mockDeleteContent).toHaveBeenCalledWith('block-1');
    expect(result.current.getUnitState(1)!.content.length).toBe(0);
    expect(toast.success).toHaveBeenCalledWith(
      'Content block deleted successfully',
    );
  });

  it('shows error toast and does not remove content if API call fails', async () => {
    const mockDeleteContent =
      contentApi.deleteUnitContent as unknown as ReturnType<typeof vi.fn>;
    mockDeleteContent.mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: 'unit-id-1',
        title: 'Unit With Content',
        description: '',
        content: [
          {
            id: 'block-1',
            type: 'video',
            data: { title: 'Video' },
            sortOrder: 1,
            unit_id: 'unit-id-1',
            isDirty: false,
            isSaving: false,
            error: null,
          },
        ],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeUnitContent(1, 0);
    });

    expect(ok).toBe(false);
    expect(mockDeleteContent).toHaveBeenCalledWith('block-1');
    expect(result.current.getUnitState(1)!.content.length).toBe(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to delete content. Please try again later.',
    );
  });

  it('does nothing and returns false if unit number is invalid', async () => {
    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeUnitContent(99, 0);
    });

    expect(ok).toBe(false);
  });

  it('does nothing and returns false if block index is invalid', async () => {
    const { result } = renderHook(() => useUnitContext(), { wrapper: Wrapper });

    act(() => {
      result.current.setUnitState(1, {
        id: 'unit-id-1',
        title: 'Unit',
        description: '',
        content: [],
        isDirty: false,
        isSaving: false,
        error: null,
        isEditing: false,
      });
    });

    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeUnitContent(1, 5);
    });

    expect(ok).toBe(false);
  });
});
