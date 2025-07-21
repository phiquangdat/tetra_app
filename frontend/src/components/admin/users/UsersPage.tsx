import { useEffect, useState } from 'react';
import AddUserForm from './AddUserForm';
import { getUsers } from '../../../services/user/userApi';

const headers = ['Id', 'Name', 'Email', 'Role'];

const UserPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      setData(users);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch users',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = () => {
    fetchUsers();
    setIsOpen(false);
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
                  className="p-4 text-center text-primary"
                >
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-error"
                >
                  {error}
                </td>
              </tr>
            ) : (
              data.map((user, index) => (
                <tr key={index} className="border-t-2 border-background">
                  <td className="p-4 text-primary">{index + 1}</td>
                  <td className="p-4 text-primary font-semibold">
                    {user.name}
                  </td>
                  <td className="p-4 text-primary">{user.email}</td>
                  <td className="p-4 text-primary">{user.role}</td>
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
    </div>
  );
};

export default UserPage;
