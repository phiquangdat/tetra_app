import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddQuizModal from '../admin/createModule/AddQuizModal';

describe('AddQuizModal', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onSave.mockReset();
  });

  it('renders the modal and allows editing points field', async () => {
    render(<AddQuizModal isOpen={true} onClose={onClose} onSave={onSave} />);

    const pointsInput = screen.getByLabelText(/points/i);
    expect(pointsInput).toBeInTheDocument();

    expect(pointsInput).toHaveValue(0);

    await userEvent.clear(pointsInput);
    await userEvent.type(pointsInput, '25');

    expect(pointsInput).toHaveValue(25);
  });

  it('shows validation error when points are 0 and trying to save', async () => {
    render(<AddQuizModal isOpen={true} onClose={onClose} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /save/i });

    await userEvent.click(saveButton);

    expect(
      await screen.findByText(/points must be greater than zero/i),
    ).toBeInTheDocument();

    expect(onSave).not.toHaveBeenCalled();
  });

  it('allows user input the description', async () => {
    render(<AddQuizModal isOpen={true} onClose={onClose} onSave={onSave} />);

    const descriptionInput = screen.getByLabelText(/quiz description/i);
    expect(descriptionInput).toBeInTheDocument();

    await userEvent.type(descriptionInput, 'This is a quiz description');

    expect(descriptionInput).toHaveValue('This is a quiz description');
  });
});
