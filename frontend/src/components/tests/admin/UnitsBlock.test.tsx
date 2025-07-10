import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';
import UnitsBlock from '../../../components/admin/module/UnitsBlock';
import * as unitApi from '../../../services/unit/unitApi';

vi.mock('../../../services/unit/unitApi', async () => {
  return {
    fetchUnitTitleByModuleId: vi.fn(),
  };
});

const mockedUnits = [
  { id: 'unit1', title: 'Unit One' },
  { id: 'unit2', title: 'Unit Two' },
];

describe('UnitsBlock Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays unit titles', async () => {
    const mockFetch = unitApi.fetchUnitTitleByModuleId as unknown as ReturnType<
      typeof vi.fn
    >;
    mockFetch.mockResolvedValueOnce(mockedUnits);

    render(<UnitsBlock moduleId="test-module-id" />);

    await waitFor(() => {
      expect(screen.getByText('Unit 1: Unit One')).toBeInTheDocument();
      expect(screen.getByText('Unit 2: Unit Two')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    const mockFetch = unitApi.fetchUnitTitleByModuleId as unknown as ReturnType<
      typeof vi.fn
    >;
    mockFetch.mockRejectedValueOnce(new Error('API failed'));

    render(<UnitsBlock moduleId="test-module-id" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<UnitsBlock moduleId="test-module-id" />);
    expect(screen.getByText('Loading units...')).toBeInTheDocument();
  });
});
