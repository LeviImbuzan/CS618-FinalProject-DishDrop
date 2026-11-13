// src/components/LikeButton.jsx
// Shows a recipe's like count, and lets a logged-in user like or unlike it.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { setLike } from '../api/posts.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LikeButton({ recipe }) {
  const { token, userId } = useAuth();
  const queryClient = useQueryClient();

  const likeCount = recipe.likeCount ?? recipe.likes?.length ?? 0;
  const likedByMe = Boolean(userId && recipe.likes?.includes(userId));
  const label = `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`;

  const likeMutation = useMutation({
    mutationFn: setLike,
    // Refresh this recipe and every sorted version of the list
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', recipe._id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  if (!token) {
    return (
      <p className="like-row">
        <span className="like-count">♥ {label}</span>
        <span className="meta">
          <Link to="/login">Log in</Link> to like this recipe
        </span>
      </p>
    );
  }

  return (
    <p className="like-row">
      <button
        type="button"
        className={likedByMe ? 'liked' : 'secondary'}
        aria-pressed={likedByMe}
        disabled={likeMutation.isPending}
        onClick={() =>
          likeMutation.mutate({ token, postId: recipe._id, liked: !likedByMe })
        }
      >
        {likedByMe ? '♥ Liked' : '♡ Like'}
      </button>
      <span className="like-count">{label}</span>
      {likeMutation.isError && (
        <span className="error">{likeMutation.error.message}</span>
      )}
    </p>
  );
}
