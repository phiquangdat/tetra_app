import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddArticleModal from '../admin/createModule/AddArticleModal';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext'; // ✅ CORRECT
import { UnitContextProvider } from '../../context/admin/UnitContext';

const AddArticleModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <AddArticleModal {...props} />
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

  it('calls onAddContent when Save button is clicked with valid input', async () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    await userEvent.type(screen.getByLabelText('Title'), 'Article Title');
    await userEvent.type(
      screen.getByPlaceholderText('Start writing your article...'),
      'This is a test description.',
    );

    const saveButton = screen.getByRole('button', { name: /save/i });

    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(onAddContent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Article Title',
          content: 'This is a test description.',
        }),
      );
    });
  });
});
