import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModulePage from '../user/modules/ModulePage';
import * as api from '../../services/module/moduleApi';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

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

  it('renders without crashing and shows loading state', () => {
    vi.spyOn(api, 'fetchModuleById').mockImplementation(
      () => new Promise(() => {}),
    );
    render(<ModulePage id="123" />);
    expect(screen.getByText(/loading module/i)).toBeInTheDocument();
  });

  it('displays error message if fetch fails', async () => {
    vi.spyOn(api, 'fetchModuleById').mockRejectedValue(
      new Error('Network error'),
    );
    render(<ModulePage id="123" />);
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('logs fetched data to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Fetched module:', mockModule);
    });
    consoleSpy.mockRestore();
  });

  it('calls fetchModuleById with the correct id', async () => {
    const fetchSpy = vi
      .spyOn(api, 'fetchModuleById')
      .mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('123');
    });
  });

  it('renders the module title and Start button', async () => {
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
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
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    expect(await screen.findByText(/about this module/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /a beginner-friendly course covering python fundamentals/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/points available/i)).toBeInTheDocument();
  });

  it('renders the Syllabus component with heading', async () => {
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    expect(
      await screen.findByRole('heading', { name: /syllabus/i }),
    ).toBeInTheDocument();
  });
});
