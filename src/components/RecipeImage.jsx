// src/components/RecipeImage.jsx
// Shows the recipe photo, or a placeholder when there is none or it fails to load.
import { useState } from 'react';

export default function RecipeImage({ src, alt, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={`recipe-image placeholder ${className}`}
        aria-hidden="true"
      >
        🍽
      </div>
    );
  }
  return (
    <img
      className={`recipe-image ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}
