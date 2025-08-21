import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it } from 'vitest';

import ContentBlockList from '../../../components/admin/module/ContentBlockList';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';

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

vi.mock('../../../components/admin/module/ContentBlockItem', () => ({
  __esModule: true,
  default: ({ blockIndex, type, isOpen }: any) =>
    isOpen ? (
      <div data-testid={`content-item-${blockIndex}`}>{`${type}:open`}</div>
    ) : null,
}));

const SeedUnit: React.FC<{
  unitNumber: number;
  blocks: Array<{
    id?: string;
    type: 'video' | 'article' | 'quiz';
    title: string;
    content?: string;
  }>;
}> = ({ unitNumber, blocks, children }) => {
  const { setUnitState } = useUnitContext();
  useEffect(() => {
    setUnitState(unitNumber, {
      id: `unit-${unitNumber}`,
      title: `Unit ${unitNumber}`,
      description: 'desc',
      content: blocks.map((b, idx) => ({
        id: b.id ?? `${b.type}-${idx}`,
        type: b.type,
        data: { title: b.title, content: b.content ?? '' },
        sortOrder: idx * 10,
        unit_id: `unit-${unitNumber}`,
        isDirty: false,
        isSaving: false,
        error: null,
      })),
      isDirty: false,
      isSaving: false,
      error: null,
      isEditing: false,
    });
  }, [setUnitState, unitNumber, blocks]);
  return <>{children}</>;
};

const renderWithProviders = (ui: React.ReactNode) =>
  render(<UnitContextProvider>{ui}</UnitContextProvider>);

describe('ContentBlockList', () => {
  it('shows empty state when there are no blocks', () => {
    renderWithProviders(
      <SeedUnit unitNumber={1} blocks={[]}>
        <ContentBlockList unitNumber={1} />
      </SeedUnit>,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: /content blocks/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/no content blocks available/i),
    ).toBeInTheDocument();
  });

  it('renders rows for each block and toggles open/close on click', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SeedUnit
        unitNumber={2}
        blocks={[
          { type: 'video', title: 'Intro Video', content: 'v1' },
          { type: 'article', title: 'Getting Started', content: 'a1' },
          { type: 'quiz', title: 'Quick Check' },
        ]}
      >
        <ContentBlockList unitNumber={2} />
      </SeedUnit>,
    );

    expect(screen.getByText('Intro Video')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Quick Check')).toBeInTheDocument();

    expect(screen.queryByTestId('content-item-0')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content-item-1')).not.toBeInTheDocument();

    await user.click(screen.getByText('Intro Video'));
    expect(screen.getByTestId('content-item-0')).toBeInTheDocument();
    expect(screen.queryByTestId('content-item-1')).not.toBeInTheDocument();

    await user.click(screen.getByText('Getting Started'));
    expect(screen.queryByTestId('content-item-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('content-item-1')).toBeInTheDocument();

    await user.click(screen.getByText('Getting Started'));
    expect(screen.queryByTestId('content-item-1')).not.toBeInTheDocument();
  });
});
