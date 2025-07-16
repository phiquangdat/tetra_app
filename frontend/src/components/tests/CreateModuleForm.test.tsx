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
    expect(saveButton).toBeInTheDocument();
    await userEvent.click(saveButton);
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
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(saveButton);

    expect(screen.getByText(/Module saved successfully!/i)).toBeInTheDocument();
  });
});
