import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
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
});
