import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentBlockList from '../../../components/admin/module/ContentBlockList';
import { fetchUnitContentById } from '../../../services/unit/unitApi';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/unit/unitApi', () => ({
  fetchUnitContentById: vi.fn(),
}));

vi.mock('../../../components/admin/module/ContentBlockItem', () => ({
  default: ({ id }: { id: string }) => <div>Mocked ContentBlockItem {id}</div>,
}));

describe('ContentBlockList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBlocks = [
    { id: '1', title: 'Intro Video', content_type: 'video' },
    { id: '2', title: 'Read Article', content_type: 'article' },
  ];

  it('displays message when no content blocks', async () => {
    (fetchUnitContentById as any).mockResolvedValueOnce([]);
    render(<ContentBlockList unitId="unit1" />);
    await waitFor(() => {
      expect(screen.getByText(/no content blocks/i)).toBeInTheDocument();
    });
  });

  it('renders content blocks and toggles open/close', async () => {
    (fetchUnitContentById as any).mockResolvedValueOnce(mockBlocks);
    render(<ContentBlockList unitId="unit1" />);

    await waitFor(() => {
      expect(screen.getByText('Intro Video')).toBeInTheDocument();
      expect(screen.getByText('Read Article')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Intro Video'));
    expect(
      await screen.findByText('Mocked ContentBlockItem 1'),
    ).toBeInTheDocument();
  });
});
