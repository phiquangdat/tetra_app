import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import UnitForm from '../admin/createModule/UnitForm';
import {
  UnitContextProvider,
  useUnitContext,
} from '../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';

import { useEffect } from 'react';

import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';

const UnitFormWithProviders = ({ unitNumber }: { unitNumber: number }) => {
  return (
    <ModuleContextProvider>
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>
            <InitUnitState unitNumber={unitNumber} />
            <UnitForm unitNumber={unitNumber} />
          </EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>
  );
};

const InitUnitState = ({ unitNumber }: { unitNumber: number }) => {
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
  }, [setUnitState, unitNumber]);

  return null;
};
describe('UnitForm', () => {
  beforeEach(() => {
    render(<UnitFormWithProviders unitNumber={2} />);
  });

  it('renders the form elements correctly', () => {
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('allows user to input text into the unit title field', async () => {
    const input = screen.getByLabelText('Title');
    await userEvent.type(input, 'Test Unit');
    expect(input).toHaveValue('Test Unit');
  });

  it('allows user to input text into the unit description field', async () => {
    const textarea = screen.getByLabelText('Description');
    await userEvent.type(textarea, 'This is a test description.');
    expect(textarea).toHaveValue('This is a test description.');
  });

  it('toggles unit visibility when clicking on the unit header', async () => {
    const unitHeader = screen.getByText(/Unit 2/i);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();

    await userEvent.click(unitHeader);
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();

    await userEvent.click(unitHeader);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('allows user to click the Save button', async () => {
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(saveButton);
    expect(
      screen.queryByRole('button', { name: /Save/i }),
    ).not.toBeInTheDocument();
  });

  it('allows user to click the Remove button and confirms removal', async () => {
    const removeButton = screen.getByRole('button', { name: /Remove Unit/i });
    await userEvent.click(removeButton);

    expect(
      screen.getByText(/Are you sure you want to remove this unit?/i),
    ).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole('button', { name: /Remove/i });
    await userEvent.click(confirmButtons[0]);

    expect(
      screen.queryByText(
        /Are you sure you want to remove this unit? This action cannot be undone./i,
      ),
    ).not.toBeInTheDocument();
  });

  it('allows user to cancel the removal', async () => {
    const removeButton = screen.getByRole('button', { name: /Remove Unit/i });
    await userEvent.click(removeButton);

    expect(
      screen.getByText(/Are you sure you want to remove this unit?/i),
    ).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(
      screen.queryByText(/Are you sure you want to remove this unit?/i),
    ).not.toBeInTheDocument();
  });

  it('allows editing a unit after initial save', async () => {
    // Step 1: Type title and description
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(titleInput, 'Initial Unit Title');
    await userEvent.type(descriptionInput, 'Initial Unit Description');

    // Step 2: Save the unit
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(saveButton);

    // Step 3: Wait for preview to render with the updated title
    await waitFor(() =>
      expect(screen.getByText('Initial Unit Title')).toBeInTheDocument(),
    );
    expect(screen.getByText('Initial Unit Description')).toBeInTheDocument();

    // Step 4: Click Edit to return to the form
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await userEvent.click(editButton);

    // Step 5: Update the title and description
    const updatedTitle = screen.getByLabelText('Title');
    const updatedDescription = screen.getByLabelText('Description');
    await userEvent.clear(updatedTitle);
    await userEvent.type(updatedTitle, 'Updated Unit Title');
    await userEvent.clear(updatedDescription);
    await userEvent.type(updatedDescription, 'Updated Unit Description');

    // Step 6: Save again
    const secondSaveButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(secondSaveButton);

    // Step 7: Confirm updated values are shown in preview
    await waitFor(() =>
      expect(screen.getByText('Updated Unit Title')).toBeInTheDocument(),
    );
    expect(screen.getByText('Updated Unit Description')).toBeInTheDocument();
  });
});
