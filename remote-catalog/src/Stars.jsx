export default function Stars({ rating, reviews }) {
  const full = Math.round(rating);
  return (
    <span className="rating">
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(5 - full)}
      </span>
      <span>
        {rating.toFixed(1)}
        {reviews != null && ` (${reviews.toLocaleString()})`}
      </span>
    </span>
  );
}
