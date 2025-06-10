import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Syllabus from '../Syllabus';
import { GetUnitTitleByModuleId } from '../../api/http';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockModuleId = 'aaeacc19-4619-4f0a-8249-88ce37cf2a50';
const mockUnitTitles = [
  { moduleId: mockModuleId, title: 'Cybersecurity Essentials' },
];

vi.mock('../../api/http', () => ({
  GetUnitTitleByModuleId: vi.fn(),
}));

describe('Syllabus Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderSyllabus = () => render(<Syllabus moduleID={mockModuleId} />);

  it('renders unit titles after successful data fetch', async () => {
    (GetUnitTitleByModuleId as Mock).mockResolvedValueOnce(mockUnitTitles);

    renderSyllabus();

    await waitFor(() =>
      expect(
        screen.getByText('Unit 1: Cybersecurity Essentials'),
      ).toBeInTheDocument(),
    );
  });

  it('displays error message when moduleID is not valid', async () => {
    render(<Syllabus moduleID={null} />);

    await waitFor(() =>
      expect(
        screen.getByText('failed to fetch units: units is not found'),
      ).toBeInTheDocument(),
    );
  });
});
