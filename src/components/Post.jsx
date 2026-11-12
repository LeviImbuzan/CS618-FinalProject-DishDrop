// src/components/Post.jsx
// One recipe: a compact card in the list, or the full recipe on its own page.
// author arrives populated from the backend as { _id, username }
import { Link } from 'react-router-dom';
import RecipeImage from './RecipeImage.jsx';

export default function Post({
  _id,
  title,
  author,
  ingredients = [],
  imageUrl,
  content,
  createdAt,
  fullPost = false,
}) {
  const byline = (
    <p className="meta">
      by {author?.username ?? 'unknown'}
      {createdAt && ` · ${new Date(createdAt).toLocaleDateString()}`}
    </p>
  );

  if (!fullPost) {
    return (
      <article className="card recipe-card">
        <Link to={`/posts/${_id}`} className="recipe-card-image">
          <RecipeImage src={imageUrl} alt={title} />
        </Link>
        <div className="recipe-card-body">
          <h3>
            <Link to={`/posts/${_id}`}>{title}</Link>
          </h3>
          <p className="meta">
            {ingredients.length} ingredient{ingredients.length === 1 ? '' : 's'}
            {ingredients.length > 0 &&
              `: ${ingredients.slice(0, 3).join(', ')}${ingredients.length > 3 ? ', ...' : ''}`}
          </p>
          {byline}
        </div>
      </article>
    );
  }

  return (
    <article className="card recipe-full">
      <RecipeImage src={imageUrl} alt={title} className="hero" />
      <h2>{title}</h2>
      {byline}
      <h3>Ingredients</h3>
      <ul className="ingredients">
        {ingredients.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {content && (
        <>
          <h3>Instructions</h3>
          <p className="instructions">{content}</p>
        </>
      )}
    </article>
  );
}
