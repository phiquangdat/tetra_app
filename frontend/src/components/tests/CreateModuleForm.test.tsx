import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import CreateModuleForm from '../admin/createModule/CreateModuleForm';
import { ModuleContextProvider } from '../../context/admin/ModuleContext'; // adjust the path if needed

const renderWithProvider = () => {
  render(
    <ModuleContextProvider>
      <CreateModuleForm />
    </ModuleContextProvider>,
  );
};

describe('CreateModuleForm', () => {
  beforeEach(() => {
    renderWithProvider();
  });

  it('renders the form elements correctly', () => {
    expect(screen.getByLabelText(/Module Cover Picture/i)).toBeInTheDocument();
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
});
