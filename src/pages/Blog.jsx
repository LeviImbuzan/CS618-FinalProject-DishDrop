// src/pages/Blog.jsx
// The home page: share a recipe, browse recipes, and chat.
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts.js';
import ChatRoom from '../components/ChatRoom.jsx';
import CreatePost from '../components/CreatePost.jsx';
import Header from '../components/Header.jsx';
import PostList from '../components/PostList.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Blog() {
  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const posts = postsQuery.data ?? [];
  const { token } = useAuth();

  return (
    <main className="page">
      <Header />

      <CreatePost />

      <section>
        <h2>Latest recipes</h2>
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
