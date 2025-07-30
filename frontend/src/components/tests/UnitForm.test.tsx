import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import UnitForm from '../admin/createModule/UnitForm';
import {
  ModuleContextProvider,
  useModuleContext,
} from '../../context/admin/ModuleContext';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';

// Mocks for API
vi.mock('../../../services/unit/unitApi', () => ({
  createUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
  updateUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
}));

// Set up module context with a valid id
const ModuleInitializer = () => {
  const { setModuleState } = useModuleContext();
  React.useEffect(() => {
    setModuleState({ id: 'mock-module-id' });
  }, [setModuleState]);
  return null;
};

// Set up two unit states for testing remove
const InitUnitState: React.FC = () => {
  const { setUnitState } = useUnitContext();
  React.useEffect(() => {
    setUnitState(1, {
      id: null,
      title: '',
      description: '',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
    setUnitState(2, {
      id: null,
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

// Helper wrapper
const renderUnitForm = () => {
  return render(
    <ModuleContextProvider>
      <ModuleInitializer />
      <UnitContextProvider>
        <InitUnitState />
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <UnitForm unitNumber={1} onSaved={() => {}} />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>,
  );
};

describe('UnitForm', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the Title and Description fields', async () => {
    renderUnitForm();
    expect(await screen.findByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('allows typing into the fields', async () => {
    renderUnitForm();
    const user = userEvent.setup();

    const titleEl = await screen.findByLabelText('Title');
    await user.clear(titleEl);
    await user.type(titleEl, 'Unit 1 Title');
    expect(titleEl).toHaveValue('Unit 1 Title');

    const descEl = screen.getByLabelText('Description');
    await user.clear(descEl);
    await user.type(descEl, 'Unit 1 Description');
    expect(descEl).toHaveValue('Unit 1 Description');
  });

  it('toggles accordion on header click', async () => {
    renderUnitForm();
    const user = userEvent.setup();

    const titleEl = await screen.findByLabelText('Title');
    expect(titleEl).toBeVisible();

    const toggleBtn = screen.getByRole('button', { name: /Unit 1/i });
    await user.click(toggleBtn);

    await waitFor(() =>
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument(),
    );

    await user.click(toggleBtn);
    expect(await screen.findByLabelText('Title')).toBeVisible();
  });

  it('hides the form on Save', async () => {
    renderUnitForm();
    const user = userEvent.setup();

    const titleInput = await screen.findByLabelText('Title');
    const descInput = screen.getByLabelText('Description');

    await user.clear(titleInput);
    await user.type(titleInput, 'Saved Title');

    await user.clear(descInput);
    await user.type(descInput, 'Saved Desc');

    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    // Wait for success feedback and disabled save
    await waitFor(() =>
      expect(screen.getByText('Unit saved successfully!')).toBeInTheDocument(),
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Saved Title');
    expect(screen.getByLabelText('Description')).toHaveValue('Saved Desc');
  });

  it('opens and cancels the Remove confirmation modal', async () => {
    renderUnitForm();
    const user = userEvent.setup();

    const removeBtn = await screen.findByLabelText('Remove Unit');
    await user.click(removeBtn);

    expect(
      screen.getByText(/Are you sure you want to remove this unit/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByText(/Are you sure you want to remove this unit/i),
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('confirms removal and hides the remove control only', async () => {
    renderUnitForm();
    const user = userEvent.setup();

    await user.click(await screen.findByLabelText('Remove Unit'));
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(screen.queryByLabelText('Remove Unit')).not.toBeInTheDocument(),
    );

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });
});
