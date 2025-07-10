import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddVideoModal from '../admin/createModule/AddVideoModal';
import { ContentBlockContextProvider } from '../../context/admin/UnitContext';

const AddVideoModalWithProviders = (props: any) => {
  return (
    <ContentBlockContextProvider>
      <AddVideoModal {...props} />
    </ContentBlockContextProvider>
  );
};

describe('AddVideoModal', () => {
  it('renders the modal header correctly', () => {
    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onAddContent={() => {}}
        onClose={() => {}}
        unitId="unit-123"
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Video',
    );
  });

  it('allows user to input text into the title field', async () => {
    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onAddContent={() => {}}
        onClose={() => {}}
        unitId="unit-123"
      />,
    );

    const input = screen.getByLabelText('Title');
    await userEvent.type(input, 'Test Video Title');
    expect(input).toHaveValue('Test Video Title');
  });

  it('calls handleSave when Save button is clicked', async () => {
    const onAddContent = vi.fn();

    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onAddContent={onAddContent}
        onClose={() => {}}
        unitId="unit-123"
      />,
    );

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const urlInput = screen.getByPlaceholderText(
      /https:\/\/example\.com\/video\.mp4/i,
    );

    await userEvent.type(titleInput, 'Sample Title');
    await userEvent.type(descriptionInput, 'This is a test description');
    await userEvent.type(
      urlInput,
      'https://www.youtube.com/watch?v=abcdefghijk',
    );

    const saveButton = screen.getByRole('button', { name: /save video/i });

    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(onAddContent).toHaveBeenCalled();
    });
  });
});
