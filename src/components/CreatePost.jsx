// src/components/CreatePost.jsx
// Controlled form that saves a post as the logged-in user, then invalidates
// the cached list so it refetches.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPost } from '../api/posts.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { token } = useAuth();

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setContent('');
    },
  });

  if (!token) {
    return (
      <p className="card">
        <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> to
        share a dish.
      </p>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    createPostMutation.mutate({ title, content, token });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create a post</h2>

      <label htmlFor="create-title">Title</label>
      <input
        id="create-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="create-content">Content</label>
      <textarea
        id="create-content"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button type="submit" disabled={!title || createPostMutation.isPending}>
        {createPostMutation.isPending ? 'Creating...' : 'Create'}
      </button>

      {createPostMutation.isSuccess && (
        <p className="success">Post created successfully!</p>
      )}
      {createPostMutation.isError && (
        <p className="error">{createPostMutation.error.message}</p>
      )}
    </form>
  );
}
