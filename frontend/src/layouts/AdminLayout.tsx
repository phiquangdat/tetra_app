import { Outlet } from 'react-router-dom';
import SharedHeader from '../components/common/SharedHeader.tsx';

function AdminLayout() {
  return (
    <div>
      <SharedHeader />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
