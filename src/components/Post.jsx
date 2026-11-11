// src/components/Post.jsx
// author arrives populated from the backend as { _id, username }
import { Link } from 'react-router-dom';

export default function Post({
  _id,
  title,
  author,
  content,
  createdAt,
  fullPost = false,
}) {
  return (
    <article className="card">
      {fullPost ? (
        <h2>{title}</h2>
      ) : (
        <h3>
          <Link to={`/posts/${_id}`}>{title}</Link>
        </h3>
      )}
      {content && <p>{content}</p>}
      <p className="meta">
        by {author?.username ?? 'unknown'}
        {createdAt && ` · ${new Date(createdAt).toLocaleString()}`}
      </p>
    </article>
  );
}
