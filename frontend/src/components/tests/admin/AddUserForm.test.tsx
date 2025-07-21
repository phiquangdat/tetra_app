import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUserForm from '../../admin/users/AddUserForm';
import { createUser } from '../../../services/user/userApi';
import { describe, it, vi, beforeEach, expect } from 'vitest';

vi.mock('../../../services/user/userApi', () => ({
  createUser: vi.fn(),
}));

describe('AddUserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onUserAdded: vi.fn(),
  };

  it('create new user successfully', async () => {
    (createUser as vi.Mock).mockResolvedValue('User created successfully');

    render(<AddUserForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'Admin' },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'secret123',
        role: 'Admin',
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
      expect(screen.getByLabelText(/role/i)).toHaveValue('Learner');
      expect(defaultProps.onUserAdded).toHaveBeenCalledTimes(1);
    });
  });
});
