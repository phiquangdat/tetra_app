import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedHeader from '../components/common/SharedHeader.tsx';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import Footer from '../components/ui/Footer.tsx';
import { ModuleContextProvider } from '../context/admin/ModuleContext.tsx';
import { UnitContextProvider } from '../context/admin/UnitContext.tsx';
import { ContentBlockContextProvider } from '../context/admin/ContentBlockContext.tsx';
import { AuthProvider } from '../context/auth/AuthContext.tsx';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AuthProvider>
        <ModuleContextProvider>
          <UnitContextProvider>
            <ContentBlockContextProvider>
              <div className="min-h-screen flex flex-col">
                <SharedHeader
                  onHamburgerClick={toggleSidebar}
                  isSidebarOpen={sidebarOpen}
                />
                <div className="flex flex-1 relative">
                  <div
                    className={`
              absolute z-50 h-full
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
                  >
                    <AdminSidebar />
                  </div>
                  <main
                    className={`
              flex-1 transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'ml-64' : ''}
            `}
                  >
                    <Outlet />
                  </main>
                </div>
                <Footer />
              </div>
            </ContentBlockContextProvider>
          </UnitContextProvider>
        </ModuleContextProvider>
    </AuthProvider>
  );
};

export default AdminLayout;
