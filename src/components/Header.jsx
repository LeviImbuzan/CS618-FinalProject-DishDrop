// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header() {
  const { username, setToken } = useAuth();

  return (
    <header className="site-header">
      <div>
        <Link to="/" className="brand">
          DishDrop
        </Link>
        <p className="tagline">Share the dishes worth making again.</p>
      </div>
      <nav>
        {username ? (
          <>
            <span>
              Logged in as <strong>{username}</strong>
            </span>
            <button type="button" onClick={() => setToken(null)}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
