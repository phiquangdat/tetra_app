import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';

import UnitsBlockUI from '../../../components/admin/module/UnitsBlock';
import { UnitContextProvider } from '../../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../../context/admin/ContentBlockContext';
import { EditorStateProvider } from '../../../utils/editor/contexts/EditorStateContext';
import * as unitApi from '../../../services/unit/unitApi';

vi.mock('../../../services/unit/unitApi', async () => {
  return {
    fetchUnitTitleByModuleId: vi.fn(),
    fetchUnitById: vi.fn(),
  };
});

const mockedUnits = [
  { id: 'unit1', title: 'Unit One' },
  { id: 'unit2', title: 'Unit Two' },
];

const mockedUnitDetails = {
  description: 'Sample unit description',
};

describe('UnitsBlock Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays unit titles', async () => {
    const fetchTitleMock =
      unitApi.fetchUnitTitleByModuleId as unknown as ReturnType<typeof vi.fn>;
    const fetchDetailsMock = unitApi.fetchUnitById as unknown as ReturnType<
      typeof vi.fn
    >;

    fetchTitleMock.mockResolvedValueOnce(mockedUnits);
    fetchDetailsMock.mockResolvedValue(mockedUnitDetails);

    render(
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>
            {' '}
            {/* ✅ FIXED: required context provider */}
            <UnitsBlockUI moduleId="test-module-id" />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Unit 1: Unit One/i)).toBeInTheDocument();
      expect(screen.getByText(/Unit 2: Unit Two/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    const fetchTitleMock =
      unitApi.fetchUnitTitleByModuleId as unknown as ReturnType<typeof vi.fn>;
    fetchTitleMock.mockRejectedValueOnce(new Error('API failed'));

    render(
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <UnitsBlockUI moduleId="test-module-id" />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <UnitsBlockUI moduleId="test-module-id" />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>,
    );
    expect(screen.getByText(/loading units/i)).toBeInTheDocument();
  });
});
