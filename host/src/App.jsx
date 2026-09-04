import { useEffect, useState } from 'react';
import { bus, EVENTS } from '@mfe/shared';
import RemoteBoundary from './RemoteBoundary.jsx';
import Inspector from './Inspector.jsx';
import {
  CartBadge,
  CartPage,
  CheckoutPage,
  endpointLabel,
  HOST_LABEL,
  ProductDetail,
  ProductGrid,
  REMOTES,
} from './remotes.js';

function parseRoute(hash) {
  const path = (hash || '#/').replace(/^#/, '');
  if (path.startsWith('/p/')) return { view: 'detail', id: path.slice(3) };
  if (path.startsWith('/cart')) return { view: 'cart' };
  if (path.startsWith('/checkout')) return { view: 'checkout' };
  return { view: 'catalog' };
}

function GridSkeleton() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="skeleton skeleton-card" key={i} />
      ))}
    </div>
  );
}

const PanelSkeleton = () => <div className="skeleton" style={{ height: 420 }} />;

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [showInspector, setShowInspector] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);

    // Routing belongs to the shell. Remotes ask for it over the bus instead of
    // importing a router — that is what keeps them independently deployable.
    const offNavigate = bus.on(EVENTS.NAVIGATE, ({ to }) => {
      if (window.location.hash === to) onHashChange();
      else window.location.hash = to;
    });

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      offNavigate();
    };
  }, []);

  const go = (to) => (event) => {
    event.preventDefault();
    window.location.hash = to;
  };

  return (
    <div className="shell">
      <header className="topbar">
        <a href="#/" className="brand" onClick={go('#/')}>
          <span className="brand-mark" aria-hidden="true">O</span>
          <span className="hide-sm">Orbit Store</span>
        </a>

        <nav className="nav">
          <a href="#/" onClick={go('#/')} aria-current={route.view === 'catalog' ? 'page' : undefined}>
            Shop
          </a>
          <a href="#/cart" onClick={go('#/cart')} aria-current={route.view === 'cart' ? 'page' : undefined}>
            Cart
          </a>
        </nav>

        <span className="spacer" />

        <button className="btn btn-quiet" onClick={() => setShowInspector((v) => !v)}>
          🧩 <span className="hide-sm">MFE map</span>
        </button>

        {/* A remote component living inside the host's own chrome. */}
        <RemoteBoundary name="cart" silent>
          <CartBadge />
        </RemoteBoundary>
      </header>

      <main className="page">
        {route.view === 'catalog' && (
          <RemoteBoundary name="catalog" fallback={<GridSkeleton />}>
            <ProductGrid />
          </RemoteBoundary>
        )}

        {route.view === 'detail' && (
          <RemoteBoundary name="catalog" fallback={<PanelSkeleton />}>
            <ProductDetail productId={route.id} key={route.id} />
          </RemoteBoundary>
        )}

        {route.view === 'cart' && (
          <RemoteBoundary name="cart" fallback={<PanelSkeleton />}>
            <CartPage />
          </RemoteBoundary>
        )}

        {route.view === 'checkout' && (
          <RemoteBoundary name="checkout" fallback={<PanelSkeleton />}>
            <CheckoutPage />
          </RemoteBoundary>
        )}
      </main>

      <footer className="footer">
        Orbit Store — one shell composing three independently deployed micro frontends.
        <br />
        <span className="tiny">
          host {HOST_LABEL}
          {Object.entries(REMOTES).map(([name, meta]) => (
            <span key={name}> · {name} {endpointLabel(meta.origin)}</span>
          ))}{' '}
          · frontend only, no API
        </span>
      </footer>

      {showInspector && <Inspector onClose={() => setShowInspector(false)} />}
    </div>
  );
}
