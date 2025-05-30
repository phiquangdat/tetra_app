import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EndpointTesting from '../EndpointTesting';
import * as http from '../../api/http';

// Mock the GetAPITest function
vi.mock('../../api/http', async () => {
  const actual = await vi.importActual<typeof import('../../api/http')>('../../api/http');
  return {
    ...actual,
    GetAPITest: vi.fn(),
  };
});

describe('EndpointTesting component', () => {
  const mockResponse = [
    {
      id: 1,
      title: 'Intro to Python',
      description: 'A beginner-friendly course covering Python fundamentals.',
      points: 50,
      topic: 'Programming',
      coverUrl:
        'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
    },
  ];

  it('renders data from API correctly', async () => {
    vi.mocked(http.GetAPITest).mockResolvedValueOnce(mockResponse);

    render(<EndpointTesting />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Intro to Python/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.mocked(http.GetAPITest).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<EndpointTesting />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });
});
