import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from './pages/home/HomePage';
import { LobbyPage } from './pages/lobby/LobbyPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/lobby/:roomCode',
    element: <LobbyPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
