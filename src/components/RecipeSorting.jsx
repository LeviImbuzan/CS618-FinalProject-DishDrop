// src/components/RecipeSorting.jsx
// One dropdown for the home page's sort order.
import { SORT_OPTIONS } from '../api/sortOptions.js';

export default function RecipeSorting({ value, onChange }) {
  return (
    <label className="sort-control">
      Sort by{' '}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
          <option key={key} value={key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
