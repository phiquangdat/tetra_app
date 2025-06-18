import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

import ModuleCards from '../user/modules/ModuleCards';
import { fetchModules } from '../../services/module/moduleApi';

// Mock the successful API call (fetchModules) to return mock data
vi.mock('../../services/module/moduleApi', () => ({
  fetchModules: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Intro to Python',
      description: 'A beginner-friendly course covering Python fundamentals.',
      points: 50,
      topic: 'Programming',
      coverUrl:
        'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
    },
    {
      id: 2,
      title: 'Cybersecurity Basics',
      description: 'Learn essential cybersecurity practices and threats.',
      points: 40,
      topic: 'Security',
      coverUrl:
        'https://www.theforage.com/blog/wp-content/uploads/2022/12/what-is-cybersecurity.jpg',
    },
  ]),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ModuleCards', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    cleanup();
    vi.clearAllMocks();
  });

  it('renders header text', () => {
    renderWithRouter(<ModuleCards />);
    const headerText = screen.getByText(/Learning Modules/i);
    expect(headerText).toBeInTheDocument();
  });

  it('renders a list of module cards', async () => {
    renderWithRouter(<ModuleCards />);

    // Wait for the modules to be loaded
    await waitFor(() => screen.getByText(/Intro to Python/i));

    // Check if both modules are displayed
    const pythonModule = screen.getByText(/Intro to Python/i);
    const cybersecurityModule = screen.getByText(/Cybersecurity Basics/i);
    expect(pythonModule).toBeInTheDocument();
    expect(cybersecurityModule).toBeInTheDocument();
  });

  it('displays the correct points for each module', async () => {
    renderWithRouter(<ModuleCards />);

    // Wait for the modules to be loaded
    await waitFor(() => screen.getByText(/Intro to Python/i));

    // Check for correct points
    const pythonPoints = screen.getByText((content, element) => {
      return element?.textContent === 'Points: 50';
    });
    const cybersecurityPoints = screen.getByText((content, element) => {
      return element?.textContent === 'Points: 40';
    });

    expect(pythonPoints).toBeInTheDocument();
    expect(cybersecurityPoints).toBeInTheDocument();
  });

  it('displays module cover images correctly', async () => {
    renderWithRouter(<ModuleCards />);

    // Wait for the modules to be loaded
    await waitFor(() => screen.getByAltText(/Intro to Python/i));

    // Check for image elements and their src attributes
    const pythonImage = screen.getByAltText(/Intro to Python/i);
    const cybersecurityImage = screen.getByAltText(/Cybersecurity Basics/i);

    expect(pythonImage).toHaveAttribute(
      'src',
      'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
    );
    expect(cybersecurityImage).toHaveAttribute(
      'src',
      'https://www.theforage.com/blog/wp-content/uploads/2022/12/what-is-cybersecurity.jpg',
    );
  });

  it('displays an error message if the API call fails', async () => {
    // Mock fetchModules to return an error
    fetchModules.mockRejectedValue(new Error('Failed to fetch modules'));

    renderWithRouter(<ModuleCards />);

    // Wait for error message to appear
    await waitFor(() => screen.getByText(/Failed to load data/i));

    // Validate error message is displayed
    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });
});
