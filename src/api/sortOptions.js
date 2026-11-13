// src/api/sortOptions.js
// The home page's sort choices, each mapped to the backend's sortBy and
// sortOrder query parameters.
export const SORT_OPTIONS = {
  newest: { label: 'Newest first', sortBy: 'createdAt', sortOrder: 'desc' },
  mostLiked: { label: 'Most liked', sortBy: 'likes', sortOrder: 'desc' },
  leastLiked: { label: 'Least liked', sortBy: 'likes', sortOrder: 'asc' },
};
