import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import UnitItem from '../../admin/ui/UnitItem';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import { ModuleContextProvider } from '../../../context/admin/ModuleContext';
import { ContentBlockContextProvider } from '../../../context/admin/ContentBlockContext';
import { EditorStateProvider } from '../../../utils/editor/contexts/EditorStateContext';

const InitUnitState: React.FC = () => {
  const { setUnitState } = useUnitContext();
  React.useEffect(() => {
    setUnitState(1, {
      id: 'unit-1',
      title: 'Test Unit',
      description: 'Test Description',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
    setUnitState(2, {
      id: 'unit-2',
      title: 'Another Unit',
      description: 'Another Description',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
  }, [setUnitState]);
  return null;
};

const renderUnitItem = (props = {}) => {
  return render(
    <ModuleContextProvider>
      <UnitContextProvider>
        <InitUnitState />
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <UnitItem
              unitNumber={1}
              index={0}
              isOpen={true}
              onToggle={vi.fn()}
              {...props}
            />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>,
  );
};

describe('UnitItem', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders unit title and description', async () => {
    renderUnitItem();
    expect(await screen.findByText('Unit 1: Test Unit')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('shows and cancels the remove confirmation modal', async () => {
    const user = userEvent.setup();
    renderUnitItem();

    const removeBtn = await screen.findByLabelText('Remove Unit');
    await user.click(removeBtn);

    expect(
      screen.getByText(/Are you sure you want to remove this unit/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(
        screen.queryByText(/Are you sure you want to remove this unit/i),
      ).not.toBeInTheDocument(),
    );
  });

  it('confirms removal and closes modal', async () => {
    const user = userEvent.setup();
    renderUnitItem();

    await user.click(await screen.findByLabelText('Remove Unit'));

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(
        screen.queryByText(/Are you sure you want to remove this unit/i),
      ).not.toBeInTheDocument(),
    );
  });

  it('calls onToggle when clicking accordion header', async () => {
    const onToggle = vi.fn();
    renderUnitItem({ onToggle });

    const header = await screen.findByText(/Unit 1: Test Unit/);
    await userEvent.click(header);

    expect(onToggle).toHaveBeenCalled();
  });
});
