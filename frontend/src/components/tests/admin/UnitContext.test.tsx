import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';

import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import * as unitApi from '../../../services/unit/unitApi';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../../services/unit/unitApi', async () => {
  return {
    deleteUnit: vi.fn(),
  };
});

describe('UnitContext - removeUnit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true and shows success toast when deletion succeeds', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockResolvedValueOnce('Unit deleted');

    const { result } = renderHook(() => useUnitContext(), {
      wrapper: ({ children }) => (
        <UnitContextProvider>{children}</UnitContextProvider>
      ),
    });

    // Add unit with an ID
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

    let success: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success!).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith('unit-id-1');
    expect(toast.success).toHaveBeenCalledWith('Unit deleted successfully');
  });

  it('returns false and shows error toast when deletion fails', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUnitContext(), {
      wrapper: ({ children }) => (
        <UnitContextProvider>{children}</UnitContextProvider>
      ),
    });

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

    let success: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to delete unit. Please try again later.',
    );
  });

  it('returns true without calling API when unit has no ID (unsaved)', async () => {
    const mockDelete = unitApi.deleteUnit as unknown as ReturnType<
      typeof vi.fn
    >;

    const { result } = renderHook(() => useUnitContext(), {
      wrapper: ({ children }) => (
        <UnitContextProvider>{children}</UnitContextProvider>
      ),
    });

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

    let success: boolean;
    await act(async () => {
      success = await result.current.removeUnit(1);
    });

    expect(success!).toBe(true);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns false if unit number is not in state', async () => {
    const { result } = renderHook(() => useUnitContext(), {
      wrapper: ({ children }) => (
        <UnitContextProvider>{children}</UnitContextProvider>
      ),
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.removeUnit(42); // no such unit
    });

    expect(success!).toBe(false);
  });
});
