// src/components/tests/UnitForm.test.tsx
import React, { useState, useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import UnitForm from '../admin/createModule/UnitForm';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';

vi.mock('../../../services/unit/unitApi', () => ({
  createUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
  updateUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
}));

const InitUnitState: React.FC = () => {
  const { setUnitState } = useUnitContext();
  useEffect(() => {
    setUnitState(1, {
      id: 'unit-1',
      title: '',
      description: '',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
    setUnitState(2, {
      id: 'unit-2',
      title: '',
      description: '',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
  }, [setUnitState]);
  return null;
};

const Preview: React.FC<{ unitNumber: number; onEdit: () => void }> = ({
  unitNumber,
  onEdit,
}) => {
  const { getUnitState } = useUnitContext();
  const unit = getUnitState(unitNumber)!;
  return (
    <div data-testid="preview">
      <h1>{unit.title}</h1>
      <p>{unit.description}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
};

const TestWrapper: React.FC<{ unitNumber: number }> = ({ unitNumber }) => {
  const [visible, setVisible] = useState(true);
  return (
    <ModuleContextProvider>
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <InitUnitState />
            {visible ? (
              <UnitForm
                unitNumber={unitNumber}
                onSaved={() => setVisible(false)}
              />
            ) : (
              <Preview
                unitNumber={unitNumber}
                onEdit={() => setVisible(true)}
              />
            )}
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>
  );
};

describe('UnitForm', () => {
  beforeEach(() => {
    render(<TestWrapper unitNumber={1} />);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Title and Description fields', () => {
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('allows typing into the fields', async () => {
    const user = userEvent.setup();
    const titleEl = screen.getByLabelText('Title');
    await user.clear(titleEl);
    await user.type(titleEl, 'Hello');
    expect(titleEl).toHaveValue('Hello');

    const descEl = screen.getByLabelText('Description');
    await user.clear(descEl);
    await user.type(descEl, 'World');
    expect(descEl).toHaveValue('World');
  });

  it('toggles accordion on header click', async () => {
    const user = userEvent.setup();
    const headerBtn = screen.getByRole('button', { name: /Unit 1/ });

    expect(screen.getByLabelText('Title')).toBeVisible();

    await user.click(headerBtn);
    expect(screen.queryByLabelText('Title')).toBeNull();

    await user.click(headerBtn);
    expect(screen.getByLabelText('Title')).toBeVisible();
  });

  it('hides the form on Save', async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Title'), 'T');
    await user.type(screen.getByLabelText('Description'), 'D');

    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(screen.queryByLabelText('Title')).toBeNull());
    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });

  it('opens and cancels the Remove confirmation modal', async () => {
    const user = userEvent.setup();
    // Remove button present because there are 2 units
    const removeBtn = screen.getByLabelText('Remove Unit');
    await user.click(removeBtn);

    expect(
      screen.getByText(
        /Are you sure you want to remove this unit\? This cannot be undone\./i,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

    expect(
      screen.queryByText(/Are you sure you want to remove this unit\?/i),
    ).toBeNull();

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('confirms removal and hides the remove control only', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Remove Unit'));

    await user.click(screen.getByRole('button', { name: /^Remove$/i }));

    expect(
      screen.queryByText(
        /Are you sure you want to remove this unit\? This cannot be undone\./i,
      ),
    ).toBeNull();

    expect(screen.queryByLabelText('Remove Unit')).toBeNull();

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('allows editing a unit after initial save', async () => {
    const user = userEvent.setup();
    // Step 1: Type values
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Initial Unit Title');
    await user.clear(screen.getByLabelText('Description'));
    await user.type(
      screen.getByLabelText('Description'),
      'Initial Unit Description',
    );
    // Step 2: Save
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    // Step 3: Preview shows saved values
    await waitFor(() =>
      expect(screen.getByText('Initial Unit Title')).toBeInTheDocument(),
    );
    expect(screen.getByText('Initial Unit Description')).toBeInTheDocument();

    // Step 4: Click Edit to return to form
    await user.click(screen.getByRole('button', { name: /^Edit$/i }));

    // Step 5: Update values
    const updatedTitle = screen.getByLabelText('Title');
    const updatedDesc = screen.getByLabelText('Description');
    await user.clear(updatedTitle);
    await user.type(updatedTitle, 'Updated Unit Title');
    await user.clear(updatedDesc);
    await user.type(updatedDesc, 'Updated Unit Description');

    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() =>
      expect(screen.getByText('Updated Unit Title')).toBeInTheDocument(),
    );
    expect(screen.getByText('Updated Unit Description')).toBeInTheDocument();
  });
});
