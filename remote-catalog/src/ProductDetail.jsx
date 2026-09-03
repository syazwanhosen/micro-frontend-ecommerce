import { useState } from 'react';
import { cartStore, findProduct, formatPrice, navigate, toast } from '@mfe/shared';
import Stars from './Stars.jsx';

export default function ProductDetail({ productId }) {
  const product = findProduct(productId);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="empty">
        <span className="empty-glyph" aria-hidden="true">🧭</span>
        <h3>We could not find that product</h3>
        <button className="btn btn-ghost" onClick={() => navigate('#/')}>
          Back to the shop
        </button>
      </div>
    );
  }

  const addToCart = () => {
    cartStore.add(product, qty);
    toast(`${qty} × ${product.name} added to cart`);
  };

  const buyNow = () => {
    cartStore.add(product, qty);
    navigate('#/checkout');
  };

  return (
    <section className="stack">
      <button className="btn btn-quiet" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('#/')}>
        ← All products
      </button>

      <div className="detail">
        <div className="thumb thumb-lg" style={{ '--tint': product.tint }}>
          <span aria-hidden="true">{product.emoji}</span>
          {product.badge && <span className="tag">{product.badge}</span>}
        </div>

        <div className="detail-panel">
          <div>
            <span className="card-cat">
              {product.brand} · {product.category}
            </span>
            <h1 style={{ margin: '8px 0 10px' }}>{product.name}</h1>
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>

          <p className="muted">{product.description}</p>

          <div className="row" style={{ gap: 10 }}>
            <span className="price" style={{ fontSize: 28 }}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
          </div>

          <p className="small" style={{ color: product.stock <= 10 ? 'var(--warn)' : 'var(--accent)' }}>
            {product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In stock · ships within 24 hours'}
          </p>

          <div className="row">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button className="btn btn-lg" onClick={addToCart}>
              Add to cart
            </button>
            <button className="btn btn-lg btn-ghost" onClick={buyNow}>
              Buy now
            </button>
          </div>

          <div className="panel panel-pad">
            <h4 style={{ marginBottom: 14 }}>Specifications</h4>
            <dl className="specs">
              {product.specs.map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
