import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import CreateModuleForm from '../admin/createModule/CreateModuleForm';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';

const renderWithProvider = () => {
  render(
    <ModuleContextProvider>
      <CreateModuleForm />
    </ModuleContextProvider>,
  );
};

vi.mock('../../../utils/validators', async () => {
  return {
    isValidImageUrl: vi.fn().mockImplementation((url: string) => {
      return url.endsWith('.png') || url.endsWith('.jpg');
    }),
    isImageUrlRenderable: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('../../services/module/moduleApi.ts', () => ({
  createModule: vi.fn().mockResolvedValue({ id: '123', status: 'success' }),
}));

beforeAll(() => {
  window.URL.revokeObjectURL = vi.fn();
});

describe('CreateModuleForm', () => {
  beforeEach(() => {
    renderWithProvider();
  });

  it('renders the form elements correctly', () => {
    expect(screen.getByLabelText(/Module Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Module Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Module Topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Points Awarded/i)).toBeInTheDocument();
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
    await userEvent.click(saveButton);
    expect(saveButton).toBeInTheDocument();
  });

  it('allows user upload cover picture via URL', async () => {
    const imageUrl = 'https://example.com/image.jpg';
    const coverInput = screen.getByLabelText(/cover picture url/i);
    await userEvent.clear(coverInput);
    await userEvent.type(coverInput, imageUrl);
    expect(coverInput).toHaveValue(imageUrl);
  });

  it('shows error message when invalid image URL is provided', async () => {
    const coverInput = screen.getByLabelText(/cover picture url/i);
    await userEvent.clear(coverInput);
    await userEvent.type(coverInput, 'invalid-url');

    expect(screen.getByText(/Invalid image URL format./i)).toBeInTheDocument();
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
});
