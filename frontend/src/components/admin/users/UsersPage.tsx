import { useEffect, useState, useCallback, useMemo } from 'react';
import AddUserForm from './AddUserForm';
import {
  getUsers,
  deleteUser,
  type User,
} from '../../../services/user/userApi';
import { useAuth } from '../../../context/auth/AuthContext';
import toast from 'react-hot-toast';
import { RemoveIcon } from '../../common/Icons';
import ConfirmationModal from '../createModule/ConfirmationModal';

const UserPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { userRole } = useAuth();
  const isAdmin = (userRole || '').toLowerCase() === 'admin';

  const headers = useMemo(() => {
    const base = ['Id', 'Name', 'Email', 'Role'];
    return isAdmin ? [...base, 'Actions'] : base;
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await getUsers();
      setData(users);
    } catch (error) {
      console.error(error);
      let message = 'Failed to fetch users';
      if (
        error instanceof Error &&
        (error.message.includes('401') || error.message.includes('403'))
      ) {
        message = 'You are not authorized. Please log in to view this content.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAdded = () => {
    fetchUsers();
    setIsOpen(false);
  };

  const openDeleteModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId || deleting) return;
    try {
      setDeleting(true);
      await deleteUser(selectedUserId);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
      // keep modal open for retry
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto my-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Users List</h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-base font-semibold text-primary">
          Total Users: {data.length}
        </p>

        <button
          className="bg-surface hover:bg-surfaceHover text-background text-base font-medium px-5 py-2 rounded-lg transition cursor-pointer"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Create New User
        </button>
      </div>

      <div className="rounded-2xl shadow overflow-hidden">
        <table className="w-full bg-cardBackground text-center">
          <thead className="bg-secondary">
            <tr>
              {headers.map((header) => (
                <th
                  className="p-4 font-semibold text-background text-base"
                  key={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-primary font-semibold"
                >
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-error font-semibold"
                >
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-primary"
                >
                  No users found
                </td>
              </tr>
            ) : (
              data.map((user, index) => (
                <tr key={user.id} className="border-t-2 border-background">
                  <td className="p-4 text-primary">{index + 1}</td>
                  <td className="p-4 text-primary font-semibold">
                    {user.name}
                  </td>
                  <td className="p-4 text-primary">{user.email}</td>
                  <td className="p-4 text-primary">{user.role}</td>
                  {isAdmin && (
                    <td className="p-4 text-primary">
                      <span
                        role="button"
                        aria-label={`Delete user ${user.name}`}
                        className="inline-flex items-center gap-2 cursor-pointer text-error hover:text-errorHover"
                        onClick={() => openDeleteModal(user.id)}
                      >
                        <RemoveIcon width={25} height={25} />
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {showDeleteModal && (
        <ConfirmationModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          description="Are you sure you want to delete this user? This cannot be undone."
          confirmText={deleting ? 'Deleting…' : 'Delete'}
        />
      )}
    </div>
  );
};

export default UserPage;
