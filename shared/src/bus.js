/**
 * Tiny cross-micro-frontend event bus.
 *
 * Remotes never import the host and never import each other — they emit an
 * event and whoever cares reacts. The host owns routing and toasts, so it is
 * the one listening.
 */
function createBus() {
  const target = new EventTarget();
  return {
    emit(type, detail) {
      target.dispatchEvent(new CustomEvent(type, { detail }));
    },
    on(type, handler) {
      const wrapped = (event) => handler(event.detail);
      target.addEventListener(type, wrapped);
      return () => target.removeEventListener(type, wrapped);
    },
  };
}

export const bus = (window.__MFE_BUS__ ||= createBus());

export const EVENTS = {
  NAVIGATE: 'mfe:navigate',
  TOAST: 'mfe:toast',
};

export const navigate = (to) => bus.emit(EVENTS.NAVIGATE, { to });
export const toast = (message, tone = 'success') => bus.emit(EVENTS.TOAST, { message, tone });
