import { cartStore, formatPrice, navigate, toast } from '@mfe/shared';
import Stars from './Stars.jsx';

export default function ProductCard({ product }) {
  const open = () => navigate(`#/p/${product.id}`);

  const addToCart = () => {
    cartStore.add(product);
    toast(`${product.name} added to cart`);
  };

  return (
    <article className="card">
      <div
        className="thumb"
        style={{ '--tint': product.tint }}
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && open()}
        aria-label={`View ${product.name}`}
      >
        <span aria-hidden="true">{product.emoji}</span>
        {product.badge && <span className="tag">{product.badge}</span>}
      </div>

      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-name" onClick={open}>
          {product.name}
        </h3>
        <Stars rating={product.rating} reviews={product.reviews} />
        <p className="card-blurb">{product.blurb}</p>

        <div className="card-foot">
          <span className="price">
            {formatPrice(product.price)}
            {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
          </span>
          <button className="btn" onClick={addToCart}>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
