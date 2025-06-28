const data = [
  { name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User' },
  { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'Admin' },
  { name: 'Bob Brown', email: 'bob.brown@example.com', role: 'User' },
];

const headers = ['Id', 'Name', 'Email', 'Role'];

const UserPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Users List</h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-lg font-semibold text-gray-700">
          Total Users: {data.length}
        </p>

        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer">
          Create New User
        </button>
      </div>

      <div className="rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th className="p-4 text-left font-semibold" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={index} className="border-t border-gray-100">
                <td className="p-4 text-gray-900">{index + 1}</td>
                <td className="p-4 text-gray-900 font-medium">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
