import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { PAGE_URL } from './common/constants/pageUrl';
import { HomePage } from './pages/home/HomePage';
import { LobbyPage } from './pages/lobby/LobbyPage';

const router = createBrowserRouter([
  {
    path: PAGE_URL.HOME,
    element: <HomePage />,
  },
  {
    path: `${PAGE_URL.LOBBY}/:roomCode`,
    element: <LobbyPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
