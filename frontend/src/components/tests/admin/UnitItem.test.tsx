import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnitItem from '../../../components/admin/module/UnitItem';
import { fetchUnitById } from '../../../services/unit/unitApi';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/unit/unitApi', async () => {
  const actual = await vi.importActual<
    typeof import('../../../services/unit/unitApi')
  >('../../../services/unit/unitApi');

  return {
    ...actual,
    fetchUnitById: vi.fn(), // already mocked
    fetchUnitContentById: vi.fn().mockResolvedValue([]), // 👈 add default mock
  };
});

const mockUnitDetails = {
  id: '1',
  title: 'Mock Unit',
  description: 'Mock description',
  moduleId: 'm1',
};

describe('UnitItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (isOpen = false) =>
    render(
      <UnitItem
        id="1"
        title="Mock Unit"
        index={0}
        isOpen={isOpen}
        onToggle={vi.fn()}
      />,
    );

  it('displays unit title with index', () => {
    renderComponent();
    expect(screen.getByText('Unit 1: Mock Unit')).toBeInTheDocument();
  });

  it('calls fetch and displays unit details when open', async () => {
    (fetchUnitById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockUnitDetails,
    );

    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText('Unit title')).toBeInTheDocument();
      expect(screen.getByText('Mock Unit')).toBeInTheDocument();
      expect(screen.getByText('Unit description')).toBeInTheDocument();
      expect(screen.getByText('Mock description')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (fetchUnitById as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('API error'),
    );

    renderComponent(true);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch unit details'),
      ).toBeInTheDocument();
    });
  });

  it('does not fetch details when closed', () => {
    renderComponent(false);
    expect(fetchUnitById).not.toHaveBeenCalled();
  });
});
