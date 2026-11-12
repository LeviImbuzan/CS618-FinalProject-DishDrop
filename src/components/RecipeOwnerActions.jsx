// src/components/RecipeOwnerActions.jsx
// Edit and delete controls, shown only to the recipe's author.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deletePost, updatePost } from '../api/posts.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import RecipeForm from './RecipeForm.jsx';

export default function RecipeOwnerActions({ recipe }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', recipe._id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/');
    },
  });

  if (editing) {
    return (
      <RecipeForm
        title="Edit recipe"
        submitLabel="Save changes"
        pendingLabel="Saving..."
        initial={recipe}
        mutation={updateMutation}
        onSubmit={(changes) =>
          updateMutation.mutate({ ...changes, token, postId: recipe._id })
        }
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="owner-actions">
      <button type="button" onClick={() => setEditing(true)}>
        Edit recipe
      </button>
      {confirmingDelete ? (
        <>
          <button
            type="button"
            className="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate({ token, postId: recipe._id })}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Yes, delete it'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setConfirmingDelete(false)}
          >
            Keep it
          </button>
        </>
      ) : (
        <button
          type="button"
          className="secondary"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete
        </button>
      )}
      {deleteMutation.isError && (
        <p className="error">{deleteMutation.error.message}</p>
      )}
    </div>
  );
}
