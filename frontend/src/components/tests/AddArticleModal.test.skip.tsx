import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddArticleModal from '../admin/createModule/AddArticleModal';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';

const AddArticleModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <EditorStateProvider>
        <AddArticleModal {...props} />
      </EditorStateProvider>
    </ContentBlockContextProvider>
  </UnitContextProvider>
);

describe('AddArticleModal', () => {
  const onClose = vi.fn();
  const onAddContent = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onAddContent.mockReset();
  });

  it('renders the modal header correctly', () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Article',
    );
  });

  it('allows user to input text into the title field', async () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    const input = screen.getByLabelText('Title');
    await userEvent.type(input, 'Test Article Title');
    expect(input).toHaveValue('Test Article Title');
  });

  it('saves article and adds content block with valid input', async () => {
    const user = userEvent.setup();

    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Article Title');

    const editor = screen.getByRole('textbox', { name: 'Article content' });
    await user.click(editor);
    await user.type(editor, 'Some article content');

    const saveButton = screen.getByRole('button', { name: /save article/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
