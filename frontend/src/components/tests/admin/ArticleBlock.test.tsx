import React from 'react';
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

vi.mock('../../../services/unit/unitApi', () => ({
  fetchArticleContentById: vi.fn(),
}));

import { UnitContextProvider } from '../../../context/admin/UnitContext';
import ArticleBlock from '../../../components/admin/module/ArticleBlock';
import { fetchArticleContentById } from '../../../services/unit/unitApi';

describe('ArticleBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays article content', async () => {
    (fetchArticleContentById as unknown as vi.Mock).mockResolvedValueOnce({
      id: '2',
      title: 'Article Title',
      content: '<p>Article content</p>',
      points: 5,
    });

    render(
      <UnitContextProvider>
        <ArticleBlock id="2" />
      </UnitContextProvider>,
    );

    expect(await screen.findByText('Article title')).toBeInTheDocument();

    expect(await screen.findByText('Article Title')).toBeInTheDocument();
    expect(await screen.findByText('Article content')).toBeInTheDocument();
  });
});
