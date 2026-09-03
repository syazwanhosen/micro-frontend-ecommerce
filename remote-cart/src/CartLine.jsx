import { cartStore, formatPrice, navigate } from '@mfe/shared';

export default function CartLine({ item }) {
  return (
    <div className="line">
      <div className="line-thumb" style={{ '--tint': item.tint }} aria-hidden="true">
        {item.emoji}
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <span className="card-cat">{item.category}</span>
        <button
          className="card-name"
          style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer' }}
          onClick={() => navigate(`#/p/${item.id}`)}
        >
          {item.name}
        </button>
        <div className="row">
          <div className="qty">
            <button onClick={() => cartStore.setQty(item.id, item.qty - 1)} aria-label={`Decrease ${item.name}`}>
              −
            </button>
            <span>{item.qty}</span>
            <button onClick={() => cartStore.setQty(item.id, item.qty + 1)} aria-label={`Increase ${item.name}`}>
              +
            </button>
          </div>
          <button className="btn btn-danger small" onClick={() => cartStore.remove(item.id)}>
            Remove
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 2, alignItems: 'flex-end' }}>
        <span className="price">{formatPrice(item.price * item.qty)}</span>
        {item.qty > 1 && <span className="tiny muted">{formatPrice(item.price)} each</span>}
      </div>
    </div>
  );
}
