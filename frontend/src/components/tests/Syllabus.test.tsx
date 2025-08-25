import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Syllabus from '../user/module/syllabus/Syllabus';
import {
  fetchUnitTitleByModuleId,
  fetchUnitContentById,
} from '../../services/unit/unitApi';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/unit/unitApi', () => ({
  fetchUnitTitleByModuleId: vi.fn(),
  fetchUnitContentById: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const ensureModuleStartedMock = vi.fn().mockResolvedValue(undefined);
const setUnitIdMock = vi.fn();
vi.mock('../../context/user/ModuleProgressContext', () => ({
  useModuleProgress: () => ({
    ensureModuleStarted: ensureModuleStartedMock,
    setUnitId: setUnitIdMock,
  }),
}));

const mockModuleId = 'aaeacc19-4619-4f0a-8249-88ce37cf2a50';
const mockUnitTitles = [
  {
    id: mockModuleId,
    title: 'Cybersecurity Essentials',
    content: [],
    hasProgress: true,
  },
];

const mockUnitContent = [
  { content_type: 'video', title: 'Intro Video' },
  { content_type: 'article', title: 'Reading Material' },
  { content_type: 'quiz', title: 'Quiz Yourself' },
];

describe('Syllabus Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (fetchUnitTitleByModuleId as Mock).mockResolvedValue(mockUnitTitles);
    (fetchUnitContentById as Mock).mockResolvedValue(mockUnitContent);
    ensureModuleStartedMock.mockResolvedValue(undefined);
  });

  const renderSyllabus = () => render(<Syllabus units={mockUnitTitles} />);

  it('renders unit titles after successful data fetch', async () => {
    renderSyllabus();

    await waitFor(() =>
      expect(
        screen.getByText('Unit 1: Cybersecurity Essentials'),
      ).toBeInTheDocument(),
    );
  });

  it('displays error message when units is empty', async () => {
    render(<Syllabus units={[]} />);

    await waitFor(() =>
      expect(screen.getByText('No units found')).toBeInTheDocument(),
    );
  });

  it('navigates to the correct unit URL when a unit title is clicked', async () => {
    renderSyllabus();

    const unitTitle = await screen.findByText(
      'Unit 1: Cybersecurity Essentials',
    );
    await userEvent.click(unitTitle);

    await waitFor(() => {
      expect(ensureModuleStartedMock).toHaveBeenCalledTimes(1);
      expect(setUnitIdMock).toHaveBeenCalledWith(mockModuleId);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/user/unit/aaeacc19-4619-4f0a-8249-88ce37cf2a50',
      );
    });
  });

  it('fetches and renders unit content when unit is toggled', async () => {
    renderSyllabus();

    const title = await screen.findByText('Unit 1: Cybersecurity Essentials');

    const clickableRow = title.closest('div')?.parentElement;
    await userEvent.click(clickableRow!);

    await waitFor(() => {
      expect(screen.getByText(/Intro Video/i)).toBeInTheDocument();
      expect(screen.getByText(/Reading Material/i)).toBeInTheDocument();
      expect(screen.getByText(/Quiz Yourself/i)).toBeInTheDocument();
    });
  });
});
