export default function Field({ label, name, error, span, ...props }) {
  return (
    <div className="field" style={span === 2 ? { gridColumn: '1 / -1' } : undefined}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} aria-invalid={Boolean(error)} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
