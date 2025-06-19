import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddVideoModal from '../admin/createModule/AddVideoModal';

describe('AddVideoModal', () => {
  beforeEach(() => {
    render(
      <AddVideoModal
        isOpen={true}
        onSave={() => {}}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });

  it('renders the modal header correctly', () => {
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Video',
    );
  });

  it('allows user to input text into the title field', async () => {
    const input = screen.getByLabelText('Title');
    await userEvent.type(input, 'Test Video Title');
    expect(input).toHaveValue('Test Video Title');
  });

  it('calls handleSave when Save button is clicked', async () => {
    const onSave = vi.fn();
    render(<AddVideoModal isOpen={true} onSave={onSave} onClose={() => {}} />);

    const saveButtons = screen.getAllByRole('button', {
      name: /save video/i,
    });
    const saveButton = saveButtons[0];

    await userEvent.click(saveButton);

    waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });
});
