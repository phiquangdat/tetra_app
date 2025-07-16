import { useState } from 'react';
import AddUserForm from './AddUserForm';

const data = [
  { name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User' },
  { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'Admin' },
  { name: 'Bob Brown', email: 'bob.brown@example.com', role: 'User' },
];

const headers = ['Id', 'Name', 'Email', 'Role'];

const UserPage = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            {data.map((user, index) => (
              <tr key={index} className="border-t-2 border-background">
                <td className="p-4 text-primary">{index + 1}</td>
                <td className="p-4 text-primary font-semibold">{user.name}</td>
                <td className="p-4 text-primary">{user.email}</td>
                <td className="p-4 text-primary">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default UserPage;
