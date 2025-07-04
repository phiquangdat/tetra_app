import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedHeader from '../components/common/SharedHeader.tsx';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import Footer from '../components/ui/Footer.tsx';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex flex-col">
      <SharedHeader
        onHamburgerClick={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="w-64 border-r border-gray-200 bg-gradient-to-b from-[#28262C] to-[#14248A]">
            <AdminSidebar />
          </div>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
