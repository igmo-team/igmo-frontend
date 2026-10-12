import { lazy, Suspense } from 'react';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { PAGE_URL } from './common/constants/pageUrl';
import { HomePage } from './pages/home/HomePage';

const RoomPage = lazy(() =>
  import('./pages/room/RoomPage').then(({ RoomPage }) => ({
    default: RoomPage,
  })),
);

const router = createBrowserRouter([
  {
    path: PAGE_URL.HOME,
    element: <HomePage />,
  },
  {
    path: `${PAGE_URL.ROOM}/:roomCode`,
    element: (
      <Suspense fallback={null}>
        <RoomPage />
      </Suspense>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
