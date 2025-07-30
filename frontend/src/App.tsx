import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';
import { AuthProvider } from './context/auth/AuthContext';
import CustomToaster from './components/ui/CustomToaster';

const router = createBrowserRouter(appRoutes);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <CustomToaster />
    </AuthProvider>
  );
}
