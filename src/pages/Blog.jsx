// src/pages/Blog.jsx
// The home page: share a recipe, browse recipes, and chat.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts.js';
import ChatRoom from '../components/ChatRoom.jsx';
import CreatePost from '../components/CreatePost.jsx';
import Header from '../components/Header.jsx';
import PostList from '../components/PostList.jsx';
import RecipeSorting from '../components/RecipeSorting.jsx';
import { SORT_OPTIONS } from '../api/sortOptions.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Blog() {
  const [sort, setSort] = useState('newest');
  const { sortBy, sortOrder } = SORT_OPTIONS[sort];

  // The sort is part of the query key, so changing it fetches that order
  const postsQuery = useQuery({
    queryKey: ['posts', { sortBy, sortOrder }],
    queryFn: () => getPosts({ sortBy, sortOrder }),
  });

  const posts = postsQuery.data ?? [];
  const { token } = useAuth();

  return (
    <main className="page">
      <Header />

      <CreatePost />

      <section>
        <div className="section-header">
          <h2>Recipes</h2>
          <RecipeSorting value={sort} onChange={setSort} />
        </div>
        {postsQuery.isLoading && <p>Loading recipes...</p>}
        {postsQuery.isError && (
          <p className="error">{postsQuery.error.message}</p>
        )}
        {postsQuery.isSuccess && <PostList posts={posts} />}
      </section>

      {token && <ChatRoom />}
    </main>
  );
}
