// src/components/Post.jsx
// author arrives populated from the backend as { _id, username }
export default function Post({ title, author, content, createdAt }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {content && <p>{content}</p>}
      <p className="meta">
        by {author?.username ?? 'unknown'}
        {createdAt && ` · ${new Date(createdAt).toLocaleString()}`}
      </p>
    </article>
  );
}
