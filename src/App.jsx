// src/App.jsx
// Infrastructure layer: auth state, the socket, the query cache, and the
// page routes.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import { SocketContextProvider } from './contexts/SocketContext.jsx';
import NewRecipePopup from './components/NewRecipePopup.jsx';
import Blog from './pages/Blog.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import ViewPost from './pages/ViewPost.jsx';

const queryClient = new QueryClient();

// Wraps every page, so new-recipe popups appear wherever the user is
function Layout() {
  return (
    <>
      <Outlet />
      <NewRecipePopup />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Blog /> },
      { path: '/signup', element: <Signup /> },
      { path: '/login', element: <Login /> },
      { path: '/posts/:postId', element: <ViewPost /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthContextProvider>
      {/* Inside AuthContextProvider because it reads the token */}
      <SocketContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SocketContextProvider>
    </AuthContextProvider>
  );
}
