import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';
const router = createBrowserRouter(appRoutes);
import { AuthProvider } from './context/auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
