// src/components/tests/admin/ContentBlockItem.test.tsx
import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi } from 'vitest';

import ContentBlockItem from '../../../components/admin/module/ContentBlockItem';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';

// Mock implementations of the block components
vi.mock('../../../components/admin/module/VideoBlock', () => ({
  __esModule: true,
  default: () => <div>Mock Video Block</div>,
}));

vi.mock('../../../components/admin/module/ArticleBlock', () => ({
  __esModule: true,
  default: () => <div>Mock Article Block</div>,
}));

vi.mock('../../../components/admin/module/QuizBlock', () => ({
  __esModule: true,
  default: () => <div>Mock Quiz Block</div>,
}));

// Helper component to inject unit context before test
const SetupUnitContext: React.FC = () => {
  const { setUnitStatesRaw } = useUnitContext();
  useEffect(() => {
    setUnitStatesRaw({
      1: {
        id: 'unit1',
        title: 'Title',
        description: 'Description',
        isDirty: false,
        isSaving: false,
        error: null,
        content: [
          {
            id: 'block1',
            type: 'video',
            sortOrder: 1,
            unit_id: 'unit1',
            isDirty: false,
            isSaving: false,
            error: null,
            data: { content: 'some content' },
          },
        ],
      },
    });
  }, []);
  return null;
};

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <UnitContextProvider>
      <SetupUnitContext />
      {component}
    </UnitContextProvider>,
  );
};

describe('ContentBlockItem', () => {
  it('returns null when closed', () => {
    const { container } = renderWithContext(
      <ContentBlockItem
        type="video"
        isOpen={false}
        unitNumber={1}
        blockIndex={0}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders video block when open and type is video', () => {
    renderWithContext(
      <ContentBlockItem
        type="video"
        isOpen={true}
        unitNumber={1}
        blockIndex={0}
      />,
    );
    expect(screen.getByText('Mock Video Block')).toBeInTheDocument();
  });

  it('renders article block when type is article', () => {
    renderWithContext(
      <ContentBlockItem type="article" isOpen={true} id="a1" />,
    );
    expect(screen.getByText('Mock Article Block')).toBeInTheDocument();
  });

  it('renders fallback for unsupported type', () => {
    renderWithContext(<ContentBlockItem type="unsupported" isOpen={true} />);
    expect(screen.getByText('Unsupported content type')).toBeInTheDocument();
  });
});
