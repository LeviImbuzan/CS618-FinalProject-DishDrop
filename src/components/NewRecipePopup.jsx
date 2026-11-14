// src/components/NewRecipePopup.jsx
// The real-time popup shown when another user shares a recipe. Clicking it
// opens the new recipe's page.
import { Link } from 'react-router-dom';
import { useNewRecipeAlerts } from '../hooks/useNewRecipeAlerts.js';

export default function NewRecipePopup() {
  const { alerts, dismiss } = useNewRecipeAlerts();
  if (alerts.length === 0) return null;

  return (
    <div className="popup-stack" role="status" aria-live="polite">
      {alerts.map((recipe) => (
        <div key={recipe.id} className="popup">
          <Link
            to={`/posts/${recipe.id}`}
            className="popup-link"
            onClick={() => dismiss(recipe.id)}
          >
            <span className="popup-label">New recipe</span>
            <strong>{recipe.title}</strong>
            <span className="popup-meta">
              by {recipe.author} · View recipe →
            </span>
          </Link>
          <button
            type="button"
            className="popup-close"
            aria-label="Dismiss"
            onClick={() => dismiss(recipe.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
