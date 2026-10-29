import { useEffect, useState } from 'react';

// Tiny hash router: "#/tryon/aurora" -> { name: 'tryon', param: 'aurora' }.
// Hash routing needs no server rewrites, so it works on Vercel as-is.
function read() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [name, param] = hash.split('/');
  return { name: name || 'home', param: param || null };
}

export function useHashRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
