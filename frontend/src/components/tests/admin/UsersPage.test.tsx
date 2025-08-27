import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import UsersPage from '../../../components/admin/users/UsersPage';
import * as userApi from '../../../services/user/userApi';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../../services/user/userApi');
vi.mock('../../../context/auth/AuthContext', () => ({
  useAuth: () => ({
    authToken: 'test-token',
    userId: 'admin-id',
    userRole: 'admin',
    logout: vi.fn(),
    setAuth: vi.fn(),
  }),
}));

describe('UsersPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders users after successful fetch', async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue([
      { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
      { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' },
    ]);
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });
});
