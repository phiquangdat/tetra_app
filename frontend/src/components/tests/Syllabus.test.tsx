import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Syllabus from '../Syllabus/Syllabus';
import { GetUnitTitleByModuleId } from '../../api/http';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fetchUnitContentById } from '../../api/unitsApi';
import userEvent from '@testing-library/user-event';

const mockModuleId = 'aaeacc19-4619-4f0a-8249-88ce37cf2a50';
const mockUnitTitles = [
  { id: mockModuleId, title: 'Cybersecurity Essentials', content: [] },
];

const mockUnitContent = [
  { content_type: 'video', title: 'Intro Video' },
  { content_type: 'article', title: 'Reading Material' },
  { content_type: 'quiz', title: 'Quiz Yourself' },
];

vi.mock('../../api/http', () => ({
  GetUnitTitleByModuleId: vi.fn(),
}));

vi.mock('../../api/unitsApi', () => ({
  fetchUnitContentById: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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

  it('navigates to the correct unit URL when a unit title is clicked', async () => {
    (GetUnitTitleByModuleId as Mock).mockResolvedValueOnce(mockUnitTitles);

    renderSyllabus();

    const unitTitle = await waitFor(() =>
      screen.getByText('Unit 1: Cybersecurity Essentials'),
    );

    unitTitle.click();

    expect(mockNavigate).toHaveBeenCalledWith(
      '/user/unit/aaeacc19-4619-4f0a-8249-88ce37cf2a50',
    );
  });

  it('fetches and renders unit content when unit is toggled', async () => {
    (GetUnitTitleByModuleId as Mock).mockResolvedValueOnce(mockUnitTitles);
    (fetchUnitContentById as Mock).mockResolvedValueOnce(mockUnitContent);

    renderSyllabus();

    await waitFor(() =>
      expect(
        screen.getByText('Unit 1: Cybersecurity Essentials'),
      ).toBeInTheDocument(),
    );

    const outerContainer = screen
      .getByText('Unit 1: Cybersecurity Essentials')
      .closest('div')?.parentElement;

    await userEvent.click(outerContainer!);

    await waitFor(() => {
      expect(screen.getByText(/Intro Video/i)).toBeInTheDocument();
      expect(screen.getByText(/Reading Material/i)).toBeInTheDocument();
      expect(screen.getByText(/Quiz Yourself/i)).toBeInTheDocument();
    });
  });
});
