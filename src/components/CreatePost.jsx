// src/components/CreatePost.jsx
// Saves a recipe as the logged-in user, then invalidates the cached list
// so it refetches.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPost } from '../api/posts.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import RecipeForm from './RecipeForm.jsx';

export default function CreatePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  if (!token) {
    return (
      <p className="card">
        <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> to
        share a recipe.
      </p>
    );
  }

  return (
    <>
      <RecipeForm
        title="Share a recipe"
        submitLabel="Share recipe"
        pendingLabel="Sharing..."
        mutation={createPostMutation}
        onSubmit={(recipe, reset) =>
          createPostMutation.mutate({ ...recipe, token }, { onSuccess: reset })
        }
      />
      {createPostMutation.isSuccess && (
        <p className="success">Recipe shared!</p>
      )}
    </>
  );
}
