// src/components/CreatePost.jsx
// Controlled form that saves a post, then invalidates the cached list so it refetches.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/posts.js';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setAuthor('');
      setContent('');
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    createPostMutation.mutate({ title, author, content });
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

      <label htmlFor="create-author">Author</label>
      <input
        id="create-author"
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
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
