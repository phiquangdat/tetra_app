import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModulePage from '../ModulePage';
import * as api from '../../api/modules';

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
    await wairFor(() => {
      expect(
        screen.getByRole('heading', { name: /Intro to Python/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    });
  });

  it('renders the About section with description and points', async () => {
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    await waitFor(() => {
      expect(screen.getByText(/about this module/i)).toBeInTheDocument();
    });
  });

  it('renders the Syllabus placeholder', async () => {
    vi.spyOn(api, 'fetchModuleById').mockResolvedValue(mockModule);
    render(<ModulePage id="123" />);
    await wairFor(() => {
      expect(screen.getByText(/syllabus placeholder/i)).toBeInTheDocument();
    });
  });
});
