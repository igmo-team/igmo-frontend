import { lazy, Suspense } from 'react';

import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import RouteErrorFallback from './common/components/RouteErrorFallback';
import { PAGE_URL } from './common/constants/pageUrl';
import { HomePage } from './pages/home/HomePage';
import RoomPageLoading from './pages/room/components/RoomPageLoading';

const RoomPage = lazy(() =>
  import('./pages/room/RoomPage').then(({ RoomPage }) => ({
    default: RoomPage,
  })),
);

const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: PAGE_URL.HOME,
        element: <HomePage />,
      },
      {
        path: `${PAGE_URL.ROOM}/:roomCode`,
        element: (
          <Suspense fallback={<RoomPageLoading />}>
            <RoomPage />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
