// src/pages/Login.jsx
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/users.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import AuthForm from '../components/AuthForm.jsx';
import Header from '../components/Header.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token);
      navigate('/');
    },
  });

  return (
    <main className="page">
      <Header />
      {location.state?.justSignedUp && (
        <p className="success">Account created. Log in to start posting.</p>
      )}
      <AuthForm
        title="Log in"
        submitLabel="Log in"
        pendingLabel="Logging in..."
        mutation={loginMutation}
      />
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </main>
  );
}
