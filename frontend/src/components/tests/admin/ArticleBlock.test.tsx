import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleBlock from '../../../components/admin/module/ArticleBlock';
import { fetchArticleContentById } from '../../../services/unit/unitApi';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/unit/unitApi', () => ({
  fetchArticleContentById: vi.fn(),
}));

describe('ArticleBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays article content', async () => {
    (fetchArticleContentById as any).mockResolvedValueOnce({
      id: '2',
      title: 'Article Title',
      content: '<p>Article content</p>',
    });

    render(<ArticleBlock id="2" />);

    await waitFor(() => {
      expect(screen.getByText('Article title')).toBeInTheDocument();
      expect(screen.getByText('Article Title')).toBeInTheDocument();
      expect(screen.getByText('Article content')).toBeInTheDocument();
    });
  });
});
