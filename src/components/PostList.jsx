// src/components/PostList.jsx
import Post from './Post.jsx';

export default function PostList({ posts = [] }) {
  if (posts.length === 0)
    return <p>No recipes yet. Share the first one above.</p>;

  return (
    <div className="recipe-grid">
      {posts.map((post) => (
        <Post key={post._id} {...post} />
      ))}
    </div>
  );
}
