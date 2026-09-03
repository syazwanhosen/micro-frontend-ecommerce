import { useMemo, useState } from 'react';
import { categories, products } from '@mfe/shared';
import ProductCard from './ProductCard.jsx';

const SORTS = {
  featured: { label: 'Featured', compare: () => 0 },
  'price-asc': { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
  rating: { label: 'Top rated', compare: (a, b) => b.rating - a.rating },
};

export default function ProductGrid() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((p) => category === 'All' || p.category === category)
      .filter(
        (p) =>
          !needle ||
          p.name.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle) ||
          p.blurb.toLowerCase().includes(needle),
      )
      .sort(SORTS[sort].compare);
  }, [query, category, sort]);

  return (
    <section className="stack">
      <div>
        <h1>Everything for the desk you actually want</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          {products.length} products, served by the <strong>catalog</strong> micro frontend.
        </p>
      </div>

      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            value={query}
            placeholder="Search products, brands…"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </label>

        <div className="chips">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
        >
          {Object.entries(SORTS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <span className="empty-glyph" aria-hidden="true">🗃️</span>
          <h3>Nothing matches “{query}”</h3>
          <p className="small">Try a different search or clear the category filter.</p>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
