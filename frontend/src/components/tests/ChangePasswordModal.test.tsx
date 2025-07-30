import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ChangePasswordModal from '../common/ChangePasswordModal';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { updateUserPassword } from '../../services/user/userApi';

const mockData = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'ADMIN',
};

vi.mock('../../context/auth/AuthContext', async () => {
  const actual = await vi.importActual('../../context/auth/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../services/user/userApi', () => ({
  updateUserPassword: vi.fn(),
}));

const setupAuthContext = (overrides = {}) => {
  (useAuth as vi.Mock).mockReturnValue({
    userId: mockData.id,
    authToken: 'mock-token',
    userRole: mockData.role,
    ...overrides,
  });
};

describe('ChangePasswordModal', () => {
  const onClose = vi.fn();

  it('updates user password', async () => {
    setupAuthContext();
    render(<ChangePasswordModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText(/change password/i)).toBeInTheDocument();
    });

    const oldPasswordInput = await screen.findByLabelText(/current password/i, {
      selector: 'input',
    });
    await userEvent.type(oldPasswordInput, 'oldPassword');

    const newPasswordInput = await screen.findByLabelText(/^New password$/i, {
      selector: 'input',
    });
    await userEvent.type(newPasswordInput, 'newPassword');

    const confirmPasswordInput = await screen.findByLabelText(
      /confirm new password/i,
      {
        selector: 'input',
      },
    );
    await userEvent.type(confirmPasswordInput, 'newPassword');

    const saveButton = await screen.findByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(updateUserPassword).toHaveBeenCalledWith(
        mockData.id,
        'oldPassword',
        'newPassword',
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
