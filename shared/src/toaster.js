import { bus, EVENTS } from './bus.js';

/**
 * Framework-free toast renderer. The host mounts it once; each remote mounts it
 * too when running standalone. Any micro frontend can call `toast()` without
 * knowing who — if anyone — is rendering.
 */
export function mountToaster({ duration = 2600 } = {}) {
  if (window.__MFE_TOASTER__) return window.__MFE_TOASTER__;

  const container = document.createElement('div');
  container.className = 'toasts';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);

  const icons = { success: '✅', info: 'ℹ️', warn: '⚠️' };

  const off = bus.on(EVENTS.TOAST, ({ message, tone = 'success' }) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.dataset.tone = tone;
    el.innerHTML = `<span aria-hidden="true">${icons[tone] ?? icons.info}</span><span></span>`;
    el.lastElementChild.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  });

  window.__MFE_TOASTER__ = () => {
    off();
    container.remove();
    delete window.__MFE_TOASTER__;
  };
  return window.__MFE_TOASTER__;
}
