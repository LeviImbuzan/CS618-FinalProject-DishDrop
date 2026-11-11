// src/components/AuthForm.jsx
// Shared username/password form used by the sign up and log in pages.
import { useState } from 'react';

export default function AuthForm({
  title,
  submitLabel,
  pendingLabel,
  mutation,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ username, password });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{title}</h2>

      <label htmlFor="auth-username">Username</label>
      <input
        id="auth-username"
        type="text"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="auth-password">Password</label>
      <input
        id="auth-password"
        type="password"
        autoComplete={
          submitLabel === 'Sign up' ? 'new-password' : 'current-password'
        }
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={!username || !password || mutation.isPending}
      >
        {mutation.isPending ? pendingLabel : submitLabel}
      </button>

      {mutation.isError && <p className="error">{mutation.error.message}</p>}
    </form>
  );
}
