// src/pages/Blog.jsx
// The home page: the create form plus the live list of posts from the backend.
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

      {token && <ChatRoom />}

      <CreatePost />

      <section>
        <h2>Latest posts</h2>
        {postsQuery.isLoading && <p>Loading posts...</p>}
        {postsQuery.isError && (
          <p className="error">{postsQuery.error.message}</p>
        )}
        {postsQuery.isSuccess && <PostList posts={posts} />}
      </section>
    </main>
  );
}
