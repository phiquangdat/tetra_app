import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import UnitPage from '../UnitPage';
import { GetUnitDetailsById } from '../../services/unit/unitApi';

vi.mock('../../services/unit/unitApi', () => ({
  GetUnitDetailsById: vi.fn(),
}));

const MOCK_UNIT_ID = 'aaeacc19-4619-4f0a-8249-88ce37cf2a50';
const URL_UNIT_ID = 'url-unit-id-123';

const MOCK_UNIT_DETAILS = {
  id: '60001777-8024-4e30-abca-9336c66c7b47',
  title: 'Workplace Safety Best Practices',
  description: 'Understand safety protocols and workplace hazard prevention.',
  moduleId: '6be2f963-9454-4792-9bfe-1fa2255b68c1',
} as const;

const UnitPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <UnitPage id={id ?? ''} />;
};

const renderUnitPageWithProps = (id: string = MOCK_UNIT_ID) =>
  render(
    <BrowserRouter>
      <UnitPage id={id} />
    </BrowserRouter>,
  );

const renderUnitPageWithRoute = (unitId: string) =>
  render(
    <MemoryRouter initialEntries={[`/unit/${unitId}`]}>
      <Routes>
        <Route path="/unit/:id" element={<UnitPageWrapper />} />
      </Routes>
    </MemoryRouter>,
  );

const getMockedGetUnitDetailsById = () =>
  GetUnitDetailsById as ReturnType<typeof vi.fn>;

describe('UnitPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when rendered with props', () => {
    it('should call API with the provided unit ID', () => {
      getMockedGetUnitDetailsById().mockResolvedValueOnce(MOCK_UNIT_DETAILS);

      renderUnitPageWithProps();

      expect(GetUnitDetailsById).toHaveBeenCalledWith(MOCK_UNIT_ID);
      expect(GetUnitDetailsById).toHaveBeenCalledTimes(1);
    });

    it('should fetch and display unit details successfully', async () => {
      getMockedGetUnitDetailsById().mockResolvedValueOnce(MOCK_UNIT_DETAILS);

      renderUnitPageWithProps();

      await waitFor(() => {
        expect(screen.getByText(MOCK_UNIT_DETAILS.title)).toBeInTheDocument();
      });

      expect(
        screen.getByText(MOCK_UNIT_DETAILS.description),
      ).toBeInTheDocument();
    });

    it('should display error message when API call fails', async () => {
      getMockedGetUnitDetailsById().mockRejectedValueOnce(
        new Error('API error'),
      );

      renderUnitPageWithProps();

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load unit details'),
        ).toBeInTheDocument();
      });
    });

    it('should display error message when no ID is provided', async () => {
      renderUnitPageWithProps('');

      await waitFor(() => {
        expect(screen.getByText('Unit ID is required')).toBeInTheDocument();
      });

      expect(GetUnitDetailsById).not.toHaveBeenCalled();
    });
  });

  describe('when rendered with URL routing', () => {
    it('should extract unit ID from URL parameter and call API', async () => {
      getMockedGetUnitDetailsById().mockResolvedValueOnce(MOCK_UNIT_DETAILS);

      renderUnitPageWithRoute(URL_UNIT_ID);

      await waitFor(() => {
        expect(GetUnitDetailsById).toHaveBeenCalledWith(URL_UNIT_ID);
      });

      expect(GetUnitDetailsById).toHaveBeenCalledTimes(1);
    });

    it('should display unit details after extracting ID from URL', async () => {
      getMockedGetUnitDetailsById().mockResolvedValueOnce(MOCK_UNIT_DETAILS);

      renderUnitPageWithRoute(URL_UNIT_ID);

      await waitFor(() => {
        expect(screen.getByText(MOCK_UNIT_DETAILS.title)).toBeInTheDocument();
      });

      expect(
        screen.getByText(MOCK_UNIT_DETAILS.description),
      ).toBeInTheDocument();
    });

    it('should handle API errors when using URL routing', async () => {
      getMockedGetUnitDetailsById().mockRejectedValueOnce(
        new Error('Network error'),
      );

      renderUnitPageWithRoute(URL_UNIT_ID);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load unit details'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state initially', () => {
      getMockedGetUnitDetailsById().mockImplementation(
        () => new Promise(() => {}),
      ); // Never resolves

      renderUnitPageWithProps();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading description...')).toBeInTheDocument();
    });
  });
});
