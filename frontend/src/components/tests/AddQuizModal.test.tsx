import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddQuizModal from '../admin/createModule/AddQuizModal';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';

const AddQuizModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <AddQuizModal {...props} />
    </ContentBlockContextProvider>
  </UnitContextProvider>
);

describe('AddQuizModal', () => {
  const onClose = vi.fn();
  const onAddContent = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onAddContent.mockReset();
  });

  it('renders the modal and allows editing points field', async () => {
    render(
      <AddQuizModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const pointsInput = screen.getByLabelText(/points/i);
    expect(pointsInput).toBeInTheDocument();

    expect(pointsInput).toHaveValue(0);

    await userEvent.clear(pointsInput);
    await userEvent.type(pointsInput, '25');

    expect(pointsInput).toHaveValue(25);
  });

  it('shows validation error when points are 0 and trying to save', async () => {
    render(
      <AddQuizModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    const saveButton = screen.getByRole('button', { name: /save/i });

    await userEvent.click(saveButton);

    expect(onAddContent).not.toHaveBeenCalled();
  });
});
