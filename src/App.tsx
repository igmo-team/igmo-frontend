import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { PAGE_URL } from './common/constants/pageUrl';
import { HomePage } from './pages/home/HomePage';
import { RoomPage } from './pages/room/RoomPage';

const router = createBrowserRouter([
  {
    path: PAGE_URL.HOME,
    element: <HomePage />,
  },
  {
    path: `${PAGE_URL.ROOM}/:roomCode`,
    element: <RoomPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
