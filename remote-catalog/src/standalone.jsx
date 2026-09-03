/**
 * Standalone entry — lets the catalog run on its own at :5001 with no host.
 * This is the point of a micro frontend: it is deployable and testable alone.
 */
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { bus, EVENTS, mountToaster } from '@mfe/shared';
import ProductGrid from './ProductGrid.jsx';
import ProductDetail from './ProductDetail.jsx';
import '@mfe/shared/styles.css';

function Standalone() {
  const [route, setRoute] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    // Outside the host nobody owns navigation, so the remote handles its own.
    const off = bus.on(EVENTS.NAVIGATE, ({ to }) => {
      window.location.hash = to;
    });
    return () => {
      window.removeEventListener('hashchange', onHash);
      off();
    };
  }, []);

  const detailId = route.startsWith('#/p/') ? route.slice(4) : null;

  return (
    <div className="shell">
      <div className="standalone-banner">
        <span aria-hidden="true">🧩</span> catalog micro frontend · running standalone on :5001
      </div>
      <main className="page">
        {detailId ? <ProductDetail productId={detailId} /> : <ProductGrid />}
      </main>
    </div>
  );
}

mountToaster();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
