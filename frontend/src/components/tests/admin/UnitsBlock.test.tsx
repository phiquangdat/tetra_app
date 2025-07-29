import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';
import UnitsBlock from '../../../components/admin/module/UnitsBlock';
import * as unitApi from '../../../services/unit/unitApi';
import { UnitContextProvider } from '../../../context/admin/UnitContext';

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

    render(
      <UnitContextProvider>
        <UnitsBlock moduleId="test-module-id" />
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Unit 1: Unit One/i }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /Unit 2: Unit Two/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    const mockFetch = unitApi.fetchUnitTitleByModuleId as unknown as ReturnType<
      typeof vi.fn
    >;
    mockFetch.mockRejectedValueOnce(new Error('API failed'));

    render(
      <UnitContextProvider>
        <UnitsBlock moduleId="test-module-id" />
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(
      <UnitContextProvider>
        <UnitsBlock moduleId="test-module-id" />
      </UnitContextProvider>,
    );
    expect(screen.getByText(/loading units/i)).toBeInTheDocument();
  });
});
