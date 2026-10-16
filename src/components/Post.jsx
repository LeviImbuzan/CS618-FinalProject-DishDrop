// src/components/Post.jsx
export default function Post({ title, author, content, createdAt }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {content && <p>{content}</p>}
      <p className="meta">
        {author ? `by ${author}` : 'by anonymous'}
        {createdAt && ` · ${new Date(createdAt).toLocaleString()}`}
      </p>
    </article>
  );
}
