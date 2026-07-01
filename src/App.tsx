import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from './pages/home/HomePage';
import { TestPage } from './pages/test/TestPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/test',
    element: <TestPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
