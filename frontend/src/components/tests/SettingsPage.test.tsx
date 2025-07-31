import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import SettingsPage from '../common/SettingsPage';
import userEvent from '@testing-library/user-event';
import {
  getUserById,
  updateUserEmail,
  updateUserName,
} from '../../services/user/userApi';
import { AuthProvider, useAuth } from '../../context/auth/AuthContext';
import React from 'react';

const mockData = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'ADMIN',
};

vi.mock('../../services/user/userApi', () => ({
  getUserById: vi.fn(),
  updateUserEmail: vi.fn(),
  updateUserName: vi.fn(),
}));

vi.mock('../../context/auth/AuthContext', async () => {
  const actual = await vi.importActual('../../context/auth/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const setupAuthContext = (overrides = {}) => {
  (useAuth as vi.Mock).mockReturnValue({
    userId: mockData.id,
    authToken: 'mock-token',
    userRole: mockData.role,
    ...overrides,
  });
};

describe('SettingsPage', () => {
  setupAuthContext();
  beforeEach(() => {
    (getUserById as vi.Mock).mockResolvedValue({
      name: mockData.name,
      email: mockData.email,
      role: mockData.role,
    });
    (updateUserEmail as vi.Mock).mockResolvedValue({
      name: mockData.name,
      email: 'new.email@example.com',
      role: mockData.role,
    });
    (updateUserName as vi.Mock).mockResolvedValue({
      name: 'John Doe123',
      email: mockData.email,
      role: mockData.role,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates user name and email', async () => {
    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(mockData.name)).toBeInTheDocument();
    });

    const editBtn = await screen.findAllByRole('button', { name: /edit/i });
    await userEvent.click(editBtn[0]);
    const nameInput = await screen.findByDisplayValue(mockData.name);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Doe123');
    const saveBtn = await screen.findByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateUserName).toHaveBeenCalledWith(mockData.id, 'John Doe123');
    });

    await userEvent.click(editBtn[1]);
    const emailInput = await screen.findByDisplayValue(mockData.email);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'new.email@example.com');
    await userEvent.click(saveBtn);

    expect(nameInput).toHaveValue('John Doe123');
    expect(emailInput).toHaveValue('new.email@example.com');
  });
});
