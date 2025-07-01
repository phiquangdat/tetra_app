import { Outlet } from 'react-router-dom';
import SharedHeader from '../components/common/SharedHeader.tsx';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import Footer from '../components/ui/Footer.tsx';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SharedHeader />
      <div className="flex flex-1">
        <div className="w-64 border-r border-gray-200 bg-gradient-to-b from-[#28262C] to-[#14248A]">
          <AdminSidebar />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
