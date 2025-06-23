import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CreateModulePage from '../admin/createModule/CreateModulePage';

describe('CreateModulePage', () => {
  it('renders the Create New Module heading', () => {
    render(<CreateModulePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Create New Module',
    );
  });

  it('renders the CreateModuleForm component', () => {
    render(<CreateModulePage />);
    expect(screen.getByText('Module Details')).toBeInTheDocument();
  });

  it('calls handleSaveDraftModule when Save draft button is clicked', () => {
    const handleSaveDraftModule = vi.fn();
    render(<CreateModulePage />);

    const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
    saveDraftButton.onclick = handleSaveDraftModule;

    saveDraftButton.click();
    expect(handleSaveDraftModule).toHaveBeenCalled();
  });

  it('calls handlePublishModule when Publish button is clicked', () => {
    const handlePublishModule = vi.fn();
    render(<CreateModulePage />);

    const publishButton = screen.getByRole('button', { name: /publish/i });
    publishButton.onclick = handlePublishModule;

    publishButton.click();
    expect(handlePublishModule).toHaveBeenCalled();
  });
});
