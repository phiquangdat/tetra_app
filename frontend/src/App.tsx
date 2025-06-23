import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';
import Header from './components/home/Header';

const router = createBrowserRouter(appRoutes);

export default function App() {
  return (
    <>
      <Header />
      <RouterProvider router={router} />
    </>
  );
}
