// ─────────────────────────────────────────────────────────
// SearchBar.tsx — Debounced search input
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search photos and videos...',
  debounceMs = 500,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        id="search-input"
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Search media"
      />
    </div>
  );
}
