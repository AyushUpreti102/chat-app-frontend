import { Notify } from "quasar";

/** Defaults applied to every toast; override per call via `options` or shortcut args. */
const defaultToast = {
  position: "top",
  timeout: 2800,
  progress: true,
};

/**
 * Show a Quasar Notify toast. Pass a string for a simple positive message, or a full Notify config object.
 * @param {string | import('quasar').QNotifyCreateOptions} messageOrOptions
 * @param {import('quasar').QNotifyCreateOptions} [options] — merged when first arg is a string
 * @returns {() => void} dismiss function
 */
export function showToast(messageOrOptions, options = {}) {
  if (typeof messageOrOptions === "string") {
    return Notify.create({
      ...defaultToast,
      type: "positive",
      message: messageOrOptions,
      ...options,
    });
  }

  return Notify.create({
    ...defaultToast,
    ...messageOrOptions,
  });
}

/**
 * @param {string} message
 * @param {import('quasar').QNotifyCreateOptions} [options]
 */
export function toastSuccess(message, options = {}) {
  return showToast({ type: "positive", message, ...options });
}

/**
 * @param {string} message
 * @param {import('quasar').QNotifyCreateOptions} [options]
 */
export function toastError(message, options = {}) {
  return showToast({ type: "negative", message, ...options });
}

/**
 * @param {string} message
 * @param {import('quasar').QNotifyCreateOptions} [options]
 */
export function toastWarning(message, options = {}) {
  return showToast({ type: "warning", message, ...options });
}

/**
 * @param {string} message
 * @param {import('quasar').QNotifyCreateOptions} [options]
 */
export function toastInfo(message, options = {}) {
  return showToast({ type: "info", message, ...options });
}
