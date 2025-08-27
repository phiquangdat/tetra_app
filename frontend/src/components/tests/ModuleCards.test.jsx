import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
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
      status: 'published',
      coverUrl:
        'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
    },
    {
      id: 2,
      title: 'Cybersecurity Basics',
      description: 'Learn essential cybersecurity practices and threats.',
      points: 40,
      topic: 'Security',
      status: 'draft',
      coverUrl:
        'https://www.theforage.com/blog/wp-content/uploads/2022/12/what-is-cybersecurity.jpg',
    },
  ]),
}));

vi.mock('../../services/user/userModuleProgressApi', () => ({
  getUserModuleProgress: vi.fn().mockResolvedValue([
    {
      moduleId: '1',
      moduleTitle: 'Intro to Python',
      status: 'IN_PROGRESS',
      earned_points: 25,
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

  it('renders header text', async () => {
    await act(async () => {
      renderWithRouter(<ModuleCards />);
    });

    const headerText = screen.getByText(/Learning Modules/i);
    expect(headerText).toBeInTheDocument();
  });

  it('renders a list of module cards', async () => {
    await act(async () => {
      renderWithRouter(<ModuleCards />);
    });

    // Wait for the modules to be loaded
    await waitFor(() => screen.getByText(/Intro to Python/i));

    // Ensure only published module is rendered
    const pythonModule = screen.queryByText(/Intro to Python/i);
    const cybersecurityModule = screen.queryByText(/Cybersecurity Basics/i);

    expect(pythonModule).toBeInTheDocument();
    // Cybersecurity module should not be displayed
    expect(cybersecurityModule).not.toBeInTheDocument();
  });

  it('displays the correct points for each module', async () => {
    await act(async () => {
      renderWithRouter(<ModuleCards />);
    });

    // Wait for the modules to be loaded
    await waitFor(() => screen.queryByText(/Intro to Python/i));

    // Check for correct points for only the published module
    const pythonPoints = screen.queryByText((content, element) => {
      return element?.textContent === 'Points: 50';
    });
    // Cybersecurity module should not be displayed
    const cybersecurityPoints = screen.queryByText((content, element) => {
      return element?.textContent === 'Points: 40';
    });

    expect(pythonPoints).toBeInTheDocument();
    expect(cybersecurityPoints).not.toBeInTheDocument();
  });

  it('displays module cover images correctly', async () => {
    await act(async () => {
      renderWithRouter(<ModuleCards />);
    });

    // Wait for the modules to be loaded
    await waitFor(() => screen.getByAltText(/Intro to Python/i));

    // Check for image elements and their src attributes for the published module
    const pythonImage = screen.getByAltText(/Intro to Python/i);

    expect(pythonImage).toHaveAttribute(
      'src',
      'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
    );
  });

  it('displays an error message if the API call fails', async () => {
    // Mock fetchModules to return an error
    fetchModules.mockRejectedValue(new Error('Failed to fetch modules'));

    await act(async () => {
      renderWithRouter(<ModuleCards />);
    });

    // Wait for error message to appear
    await waitFor(() => screen.getByText(/Failed to load data/i));

    // Validate error message is displayed
    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });
});
