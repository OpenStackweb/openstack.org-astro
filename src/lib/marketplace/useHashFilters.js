import { useEffect, useState } from 'react';

// Preserve shareable filter URLs without making the server render browser state.
export function useHashFilters(read, write) {
  const [filters, setFilters] = useState(() => read(''));
  useEffect(() => {
    const update = () => setFilters(read(window.location.hash));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [read]);
  function change(next) {
    setFilters(next);
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search + write(next),
    );
  }
  return [filters, change];
}
