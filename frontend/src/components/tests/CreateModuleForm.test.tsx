import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import CreateModuleForm from '../admin/createModule/CreateModuleForm';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';
import * as validators from '../../utils/validators';

const renderWithProvider = () => {
  render(
    <ModuleContextProvider>
      <CreateModuleForm />
    </ModuleContextProvider>,
  );
};

vi.mock('../../services/module/moduleApi.ts', () => ({
  createModule: vi.fn().mockResolvedValue({ id: '123', status: 'success' }),
}));

beforeAll(() => {
  window.URL.revokeObjectURL = vi.fn();
  vi.stubGlobal('scrollTo', vi.fn());
});

describe('CreateModuleForm', () => {
  beforeEach(() => {
    renderWithProvider();

    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(true);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(true);
  });

  it('renders the form elements correctly', () => {
    expect(screen.getByLabelText(/Module Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Module Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Module Topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Points Awarded/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover Picture URL/i)).toBeInTheDocument();
  });

  it('allows user to input text into the title field', async () => {
    const titleInput = screen.getByLabelText(/Module Title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'React Basics');
    expect(titleInput).toHaveValue('React Basics');
  });

  it('allows user to select a module topic', async () => {
    const topicSelect = screen.getByLabelText(/Module Topic/i);
    await userEvent.selectOptions(topicSelect, 'cybersecurity');
    expect(topicSelect).toHaveValue('cybersecurity');
  });

  it('allows user to click the Save button', async () => {
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeInTheDocument();
    await userEvent.click(saveButton);
  });

  it('allows user to upload cover picture via URL and shows preview', async () => {
    const imageUrl = 'https://example.com/image.jpg';
    const coverInput = screen.getByLabelText(/cover picture url/i);
    await userEvent.clear(coverInput);
    await userEvent.type(coverInput, imageUrl, { delay: 10 });

    expect(coverInput).toHaveValue(imageUrl);

    const previewImg = await screen.findByAltText(/Module Cover/i);
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute('src', imageUrl);
  });

  it('shows error message when invalid image URL is provided', async () => {
    (validators.isValidImageUrl as vi.Mock).mockReturnValue(false);

    const coverInput = screen.getByLabelText(/cover picture url/i);
    await userEvent.clear(coverInput);
    await userEvent.type(coverInput, 'invalid-url');

    expect(
      await screen.findByText(/Invalid image URL format./i),
    ).toBeInTheDocument();
  });

  it('shows success message after saving module', async () => {
    const titleInput = screen.getByLabelText(/Module Title/i);
    const descriptionInput = screen.getByLabelText(/Module Description/i);
    const topicSelect = screen.getByLabelText(/Module Topic/i);
    const pointsInput = screen.getByLabelText(/Points Awarded/i);
    const coverInput = screen.getByLabelText(/Cover Picture URL/i);
    const saveButton = screen.getByLabelText(/Save Module/i);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Test Module');
    await userEvent.clear(descriptionInput);
    await userEvent.type(
      descriptionInput,
      'This is a test module description.',
    );
    await userEvent.selectOptions(topicSelect, 'cybersecurity');
    await userEvent.clear(pointsInput);
    await userEvent.type(pointsInput, '10');
    await userEvent.clear(coverInput);
    await userEvent.type(coverInput, 'https://example.com/image.jpg');
    await userEvent.click(saveButton);
    screen.findByText((content) =>
      content.includes('Module saved successfully'),
    );
  });

  it('allows editing a module after initial save', async () => {
    // Initial input
    fireEvent.change(screen.getByLabelText(/Module Title/i), {
      target: { value: 'Initial Title' },
    });

    fireEvent.change(screen.getByLabelText(/Module Description/i), {
      target: { value: 'Initial Description' },
    });

    fireEvent.change(screen.getByLabelText(/Module Topic/i), {
      target: { value: 'cybersecurity' },
    });

    fireEvent.change(screen.getByLabelText(/Points Awarded/i), {
      target: { value: '5' },
    });

    fireEvent.change(screen.getByLabelText(/Cover Picture URL/i), {
      target: { value: 'https://example.com/image.jpg' },
    });

    await waitFor(() =>
      expect(screen.getByAltText(/Module Cover/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Module saved successfully/i),
      ).toBeInTheDocument(),
    );

    // Check display
    expect(screen.getByText('Initial Title')).toBeInTheDocument();
    expect(screen.getByText('Initial Description')).toBeInTheDocument();
    expect(screen.getByText('cybersecurity')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Edit flow
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    fireEvent.change(screen.getByLabelText(/Module Title/i), {
      target: { value: 'Updated Title' },
    });

    fireEvent.change(screen.getByLabelText(/Module Description/i), {
      target: { value: 'Updated Description' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() =>
      expect(screen.getByText('Updated Title')).toBeInTheDocument(),
    );
    expect(screen.getByText('Updated Description')).toBeInTheDocument();
  });
});
