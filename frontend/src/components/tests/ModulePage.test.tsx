import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModulePage from '../user/module/ModulePage';
import * as moduleApi from '../../services/module/moduleApi';
import * as unitApi from '../../services/unit/unitApi';
import { QuizModalProvider } from '../../context/user/QuizModalContext.tsx';
import { ModuleProgressProvider } from '../../context/user/ModuleContext';
import { UnitContentProvider } from '../../context/user/UnitContentContext';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const renderWithProvider = (id: string = '123') =>
  render(
    <QuizModalProvider>
      <UnitContentProvider>
        <ModuleProgressProvider>
          <ModulePage id={id} />
        </ModuleProgressProvider>
      </UnitContentProvider>
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

  it('displays error message if fetch fails', async () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockRejectedValue(
      new Error('Network error'),
    );
    renderWithProvider('123');
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('logs fetched data to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(moduleApi, 'fetchModuleById').mockResolvedValue(mockModule);
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockResolvedValue(mockUnits);
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

  it('renders the module title and Start button', async () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockResolvedValue(mockModule);
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockResolvedValue(mockUnits);
    renderWithProvider('123');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Intro to Python/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /start/i }),
      ).toBeInTheDocument();
    });
  });

  it('renders the About section with description and points', async () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockResolvedValue(mockModule);
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockResolvedValue(mockUnits);
    renderWithProvider('123');
    expect(await screen.findByText(/about this module/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /a beginner-friendly course covering python fundamentals/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/points available/i)).toBeInTheDocument();
  });

  it('renders the Syllabus component with heading', async () => {
    vi.spyOn(moduleApi, 'fetchModuleById').mockResolvedValue(mockModule);
    vi.spyOn(unitApi, 'fetchUnitTitleByModuleId').mockResolvedValue(mockUnits);
    renderWithProvider('123');
    expect(
      await screen.findByRole('heading', { name: /syllabus/i }),
    ).toBeInTheDocument();
  });
});
