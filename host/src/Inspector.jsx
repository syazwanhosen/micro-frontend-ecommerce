import { useEffect, useState } from 'react';
import { endpointLabel, HOST_LABEL, REMOTES, remoteStatus } from './remotes.js';

const LABEL = { idle: 'not loaded yet', loading: 'loading…', ready: 'loaded', error: 'failed' };

/**
 * A dev-facing panel that makes the architecture visible: which remotes the
 * shell has actually pulled in, and from where.
 */
export default function Inspector({ onClose }) {
  const [status, setStatus] = useState(remoteStatus.get);

  useEffect(() => remoteStatus.subscribe(setStatus), []);

  return (
    <aside className="inspector">
      <div className="row-between" style={{ marginBottom: 6 }}>
        <h4>Micro frontends</h4>
        <button className="btn btn-quiet tiny" onClick={onClose} aria-label="Close inspector">
          ✕
        </button>
      </div>

      <div className="inspector-row">
        <span className="dot" data-status="ready" />
        <span>
          <strong>host</strong> · shell
        </span>
        <span className="inspector-port">{HOST_LABEL}</span>
      </div>

      {Object.entries(REMOTES).map(([name, meta]) => (
        <div className="inspector-row" key={name}>
          <span className="dot" data-status={status[name]} />
          <span>
            <strong>{name}</strong>
            <span className="tiny muted"> · {LABEL[status[name]]}</span>
          </span>
          <span className="inspector-port">{endpointLabel(meta.origin)}</span>
        </div>
      ))}

      <p className="tiny muted" style={{ marginTop: 10 }}>
        Remotes load on demand over Module Federation. Navigate around and watch
        them switch on.
      </p>
    </aside>
  );
}
