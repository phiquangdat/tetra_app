import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ModulePage from '../user/module/ModulePage';
import * as moduleApi from '../../services/module/moduleApi';
import * as unitApi from '../../services/unit/unitApi';
import * as userProgressApi from '../../services/userProgress/userProgressApi';
import { QuizModalProvider } from '../../context/user/QuizModalContext';
import { ModuleProgressProvider } from '../../context/user/ModuleProgressContext';
import { UnitContentProvider } from '../../context/user/UnitContentContext';
import { UnitCompletionModalProvider } from '../../context/user/UnitCompletionModalContext';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const renderWithProvider = (id: string = '123') =>
  render(
    <QuizModalProvider>
      <UnitCompletionModalProvider>
        <UnitContentProvider>
          <ModuleProgressProvider>
            <ModulePage id={id} />
          </ModuleProgressProvider>
        </UnitContentProvider>
      </UnitCompletionModalProvider>
    </QuizModalProvider>,
  );

describe('ModulePage', () => {
  const mockModule = {
    id: '123',
    title: 'Intro to Python',
    description: 'A beginner-friendly course covering Python fundamentals.',
    points: 50,
    topic: 'Programming',
    coverUrl:
      'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
  };

  const mockUnits = [
    { id: 'unit1', title: 'Unit 1: Basics', content: [] },
    { id: 'unit2', title: 'Unit 2: Advanced', content: [] },
  ];

  const mockUserProgress = {
    status: 'IN_PROGRESS',
    last_visited_unit_id: 'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
    last_visited_content_id: '171ddada-d917-4090-a711-3e2b6891eef4',
    earned_points: 0,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(moduleApi, 'fetchModuleById').mockResolvedValue(mockModule);
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockResolvedValue(mockUnits);
    vi.spyOn(userProgressApi, 'getModuleProgress').mockResolvedValue(
      mockUserProgress,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('renders without crashing and shows loading state', () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockImplementation(
      () => new Promise(() => {}),
    );
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockImplementation(
      () => new Promise(() => {}),
    );
    renderWithProvider('123');
    expect(screen.getByText(/loading module/i)).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockRejectedValue(
      new Error('Network error'),
    );
    renderWithProvider('123');
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('logs fetched data to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderWithProvider('123');
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Fetched module:', mockModule);
      expect(consoleSpy).toHaveBeenCalledWith('Fetched units:', mockUnits);
    });
    consoleSpy.mockRestore();
  });

  it('calls moduleApi and unitApi with the correct id', async () => {
    const moduleSpy = vi
      .spyOn(moduleApi, 'fetchModuleById')
      .mockResolvedValue(mockModule);
    const unitsSpy = vi
      .spyOn(unitApi, 'fetchUnitTitleByModuleId')
      .mockResolvedValue(mockUnits);
    renderWithProvider('123');
    await waitFor(() => {
      expect(moduleSpy).toHaveBeenCalledWith('123');
      expect(unitsSpy).toHaveBeenCalledWith('123');
    });
  });

  it('renders module title and Start button when no progress, and hides Continue', async () => {
    vi.spyOn(userProgressApi, 'getModuleProgress').mockRejectedValue(
      new Error('404'),
    );
    renderWithProvider('123');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /intro to python/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /start/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: /continue/i }),
    ).not.toBeInTheDocument();
  });

  it('renders module title and Continue button when progress exists, and hides Start', async () => {
    renderWithProvider('123');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /intro to python/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /start/i }),
    ).not.toBeInTheDocument();
  });

  it('renders no Start or Continue buttons when progress is completed', async () => {
    vi.spyOn(userProgressApi, 'getModuleProgress').mockResolvedValue({
      status: 'COMPLETED',
      last_visited_unit_id: 'unit1',
      last_visited_content_id: 'content1',
      earned_points: 0,
    });

    renderWithProvider('123');

    expect(
      await screen.findByRole('heading', { name: /intro to python/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /start/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /continue/i }),
      ).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/module completed/i)).toBeInTheDocument();
  });

  it('renders the About section with description and points', async () => {
    renderWithProvider('123');
    await waitFor(() => {
      expect(screen.getByText(/about this module/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /a beginner-friendly course covering python fundamentals/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/points available/i)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('renders the Syllabus component with heading', async () => {
    renderWithProvider('123');
    expect(
      await screen.findByRole('heading', { name: /syllabus/i }),
    ).toBeInTheDocument();
  });
});
