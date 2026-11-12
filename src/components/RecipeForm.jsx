// src/components/RecipeForm.jsx
// The recipe fields, shared by "Share a recipe" and "Edit recipe".
import { useState } from 'react';
import RecipeImage from './RecipeImage.jsx';

export default function RecipeForm({
  title: heading,
  submitLabel,
  pendingLabel,
  initial = {},
  mutation,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? '');
  // One ingredient per line in the text box, an array in the database
  const [ingredientsText, setIngredientsText] = useState(
    (initial.ingredients ?? []).join('\n')
  );
  const [content, setContent] = useState(initial.content ?? '');

  const ingredients = ingredientsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(
      { title, imageUrl: imageUrl.trim(), ingredients, content },
      // Reset the fields after a successful create
      () => {
        setTitle('');
        setImageUrl('');
        setIngredientsText('');
        setContent('');
      }
    );
  }

  return (
    <form className="card recipe-form" onSubmit={handleSubmit}>
      <h2>{heading}</h2>

      <label htmlFor="recipe-title">Title</label>
      <input
        id="recipe-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="recipe-image">Image URL</label>
      <input
        id="recipe-image"
        type="url"
        placeholder="https://..."
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      {imageUrl.trim() && (
        <RecipeImage src={imageUrl.trim()} alt="Preview" className="preview" />
      )}

      <label htmlFor="recipe-ingredients">Ingredients (one per line)</label>
      <textarea
        id="recipe-ingredients"
        rows={5}
        placeholder={'2 cups flour\n1 tsp salt'}
        value={ingredientsText}
        onChange={(e) => setIngredientsText(e.target.value)}
      />

      <label htmlFor="recipe-content">Instructions</label>
      <textarea
        id="recipe-content"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="form-actions">
        <button
          type="submit"
          disabled={!title || ingredients.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {mutation.isError && <p className="error">{mutation.error.message}</p>}
    </form>
  );
}
