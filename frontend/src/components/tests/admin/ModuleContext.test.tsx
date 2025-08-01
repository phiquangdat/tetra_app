import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';

import {
  ModuleContextProvider,
  useModuleContext,
} from '../../../context/admin/ModuleContext';
import * as moduleApi from '../../../services/module/moduleApi';

// Mock toast methods
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../../services/module/moduleApi', async () => {
  return {
    deleteModule: vi.fn(),
  };
});

describe('ModuleContext - removeModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true and show success toast when deletion succeeds', async () => {
    const mockDelete = moduleApi.deleteModule as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockResolvedValueOnce('Module deleted');

    const { result } = renderHook(() => useModuleContext(), {
      wrapper: ({ children }) => (
        <ModuleContextProvider>{children}</ModuleContextProvider>
      ),
    });

    // Set a fake module ID so deleteModule is triggered
    act(() => {
      result.current.setModuleState({ id: 'mock-module-id' });
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.removeModule();
    });

    expect(success!).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith('mock-module-id');
    expect(toast.success).toHaveBeenCalledWith('Module deleted');
  });

  it('should return false and show error toast when deletion fails', async () => {
    const mockDelete = moduleApi.deleteModule as unknown as ReturnType<
      typeof vi.fn
    >;
    mockDelete.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useModuleContext(), {
      wrapper: ({ children }) => (
        <ModuleContextProvider>{children}</ModuleContextProvider>
      ),
    });

    act(() => {
      result.current.setModuleState({ id: 'mock-module-id' });
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.removeModule();
    });

    expect(success!).toBe(false);
    expect(mockDelete).toHaveBeenCalledWith('mock-module-id');
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to delete module. Please try again later.',
    );
  });

  it('should return false if no module ID is set', async () => {
    const { result } = renderHook(() => useModuleContext(), {
      wrapper: ({ children }) => (
        <ModuleContextProvider>{children}</ModuleContextProvider>
      ),
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.removeModule();
    });

    expect(success!).toBe(false);
    expect(moduleApi.deleteModule).not.toHaveBeenCalled();
  });
});
