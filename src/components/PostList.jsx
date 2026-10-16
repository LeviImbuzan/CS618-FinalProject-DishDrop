// src/components/PostList.jsx
import Post from './Post.jsx';

export default function PostList({ posts = [] }) {
  if (posts.length === 0)
    return <p>No posts yet. Create the first one above.</p>;

  return (
    <div className="post-list">
      {posts.map((post) => (
        <Post key={post._id} {...post} />
      ))}
    </div>
  );
}
