// src/components/tests/admin/UnitsBlock.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../context/admin/ModuleContext.tsx', () => ({
  useModuleContext: () => ({
    id: undefined,
    updateModuleField: vi.fn(),
    setModuleState: vi.fn(),
    isEditing: false,
    setIsEditing: vi.fn(),
    isDirty: false,
  }),
  ModuleContextProvider: ({ children }: any) => children,
}));

import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';

vi.mock('../../../components/admin/ui/UnitContainer.tsx', () => ({
  __esModule: true,
  default: ({ unitNumber }: { unitNumber: number }) => {
    const { getUnitState } = useUnitContext();
    const title = getUnitState(unitNumber)?.title ?? '';
    return (
      <div>
        Unit {unitNumber}: {title}
      </div>
    );
  },
}));

// 4) Mock the unit API used by UnitsBlockUI
vi.mock('../../../services/unit/unitApi', () => ({
  fetchUnitTitleByModuleId: vi.fn(),
  fetchUnitById: vi.fn(),
}));

import UnitsBlockUI from '../../../components/admin/module/UnitsBlock';
import * as unitApi from '../../../services/unit/unitApi';

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
    (
      unitApi.fetchUnitTitleByModuleId as unknown as vi.Mock
    ).mockResolvedValueOnce(mockedUnits);
    (unitApi.fetchUnitById as unknown as vi.Mock).mockResolvedValue(
      mockedUnitDetails,
    );

    render(
      <UnitContextProvider>
        <UnitsBlockUI moduleId="test-module-id" />
      </UnitContextProvider>,
    );

    // Use findByText so we naturally wait for the async load + state updates
    expect(await screen.findByText(/Unit 1: Unit One/i)).toBeInTheDocument();
    expect(await screen.findByText(/Unit 2: Unit Two/i)).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    (
      unitApi.fetchUnitTitleByModuleId as unknown as vi.Mock
    ).mockRejectedValueOnce(new Error('API failed'));

    render(
      <UnitContextProvider>
        <UnitsBlockUI moduleId="test-module-id" />
      </UnitContextProvider>,
    );

    expect(await screen.findByText('Failed to load units')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <UnitContextProvider>
        <UnitsBlockUI moduleId="test-module-id" />
      </UnitContextProvider>,
    );
    expect(screen.getByText(/loading units/i)).toBeInTheDocument();
  });
});
