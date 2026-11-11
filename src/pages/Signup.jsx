// src/pages/Signup.jsx
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/users.js';
import AuthForm from '../components/AuthForm.jsx';
import Header from '../components/Header.jsx';

export default function Signup() {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: signup,
    // Account created: send the user to log in with it
    onSuccess: () => navigate('/login', { state: { justSignedUp: true } }),
  });

  return (
    <main className="page">
      <Header />
      <AuthForm
        title="Create an account"
        submitLabel="Sign up"
        pendingLabel="Signing up..."
        mutation={signupMutation}
      />
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
