// src/App.jsx
// Infrastructure layer: auth state, the query cache, and the page routes.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import Blog from './pages/Blog.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <Blog /> },
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
]);

export default function App() {
  return (
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthContextProvider>
  );
}
