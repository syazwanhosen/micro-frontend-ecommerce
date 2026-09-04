import { Component, Suspense } from 'react';
import { REMOTES } from './remotes.js';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) return this.props.renderError(this.state.error);
    return this.props.children;
  }
}

function FailedRemote({ name }) {
  const entry = `${REMOTES[name]?.origin}/assets/remoteEntry.js`;
  return (
    <div className="remote-error">
      <span style={{ fontSize: 34 }} aria-hidden="true">🔌</span>
      <h3 style={{ color: 'var(--text)' }}>The “{name}” micro frontend is unavailable</h3>
      <p className="small">
        The rest of the page still works — that is the point of the split.{' '}
        {import.meta.env.DEV ? (
          <>
            Start it with <code>npm run serve -w remote-{name}</code> so <code>{entry}</code>{' '}
            responds.
          </>
        ) : (
          <>
            The shell could not fetch <code>{entry}</code>.
          </>
        )}
      </p>
      <button className="btn btn-ghost" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}

/**
 * One remote failing must never take the shell down, so every federated
 * component is mounted behind its own error boundary and its own Suspense.
 */
export default function RemoteBoundary({ name, fallback, silent = false, children }) {
  return (
    <ErrorBoundary
      key={name}
      renderError={() => (silent ? null : <FailedRemote name={name} />)}
    >
      <Suspense fallback={fallback ?? null}>{children}</Suspense>
    </ErrorBoundary>
  );
}
