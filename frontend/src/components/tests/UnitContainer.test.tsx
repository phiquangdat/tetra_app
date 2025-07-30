import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import UnitContainer from '../admin/ui/UnitContainer';
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

// 🧪 MOCK API
vi.mock('../../../services/unit/unitApi', () => ({
  createUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
  updateUnit: vi.fn().mockResolvedValue({ id: 'unit-1' }),
}));

// 🧩 Provide initial module context
const ModuleInitializer = () => {
  const { setModuleState } = useModuleContext();
  React.useEffect(() => {
    setModuleState({ id: 'mock-module-id' });
  }, [setModuleState]);
  return null;
};

// 🧩 Provide initial unit state
const InitUnitState: React.FC = () => {
  const { setUnitState } = useUnitContext();
  React.useEffect(() => {
    setUnitState(1, {
      id: null,
      title: 'Initial Title',
      description: 'Initial Description',
      content: [],
      isDirty: false,
      isSaving: false,
      error: null,
    });
  }, [setUnitState]);
  return null;
};

// 🧪 Render helpers
const renderUnitContainer = () => {
  return render(
    <ModuleContextProvider>
      <ModuleInitializer />
      <UnitContextProvider>
        <InitUnitState />
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <UnitContainer unitNumber={1} isOpen={true} onToggle={() => {}} />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UnitContainer', () => {
  it('can edit unit after initial save', async () => {
    renderUnitContainer();
    const user = userEvent.setup();

    // Fill in the form
    const titleEl = await screen.findByLabelText('Title');
    const descEl = screen.getByLabelText('Description');

    await user.clear(titleEl);
    await user.type(titleEl, 'Updated Title');

    await user.clear(descEl);
    await user.type(descEl, 'Updated Description');

    // Save the form
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    // Wait for form to disappear
    await waitFor(() => {
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    });

    // Click "Edit" to re-open the form
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editBtn);

    // Wait for form to reappear
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    // Assert values are retained
    expect(screen.getByLabelText('Title')).toHaveValue('Updated Title');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Updated Description',
    );
  });
});
