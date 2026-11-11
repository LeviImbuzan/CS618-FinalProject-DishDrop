// src/pages/Blog.jsx
// The home page: the create form plus the live list of posts from the backend.
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts.js';
import CreatePost from '../components/CreatePost.jsx';
import Header from '../components/Header.jsx';
import PostList from '../components/PostList.jsx';

export default function Blog() {
  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const posts = postsQuery.data ?? [];

  return (
    <main className="page">
      <Header />

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
