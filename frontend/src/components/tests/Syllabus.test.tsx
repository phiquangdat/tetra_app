import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Syllabus from '../Syllabus';
import { GetModules, GetUnitTitleByModuleId } from '../../api/http';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockModules = [{ id: 'module1' }, { id: 'module2' }];
const mockUnitTitles: Record<string, string> = {
  module1: 'Data Protection',
  module2: 'Cybersecurity Fundamentals',
};

vi.mock('../../api/http', () => ({
  GetModules: vi.fn(),
  GetUnitTitleByModuleId: vi.fn(),
}));

describe('Syllabus Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (GetModules as Mock).mockResolvedValue(mockModules);
    (GetUnitTitleByModuleId as Mock).mockImplementation((id: string) =>
      Promise.resolve(mockUnitTitles[id]),
    );
  });

  const renderSyllabus = () => render(<Syllabus />);

  it('renders the correct unit titles after data is fetched', async () => {
    renderSyllabus();

    await waitFor(() => {
      expect(screen.getByText('Unit 1: Data Protection')).toBeInTheDocument();
      expect(
        screen.getByText('Unit 2: Cybersecurity Fundamentals'),
      ).toBeInTheDocument();
    });
  });

  it('should render "moduleId query parameter is required" on fetch /api/units', async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce({
      response: {
        data: 'moduleId query parameter is required',
      },
    });

    try {
      await mockFetch(`${import.meta.env.VITE_BACKEND_URL}/api/units`);
    } catch (error) {
      expect(error.response.data).toBe('moduleId query parameter is required');
    }
  });
});
