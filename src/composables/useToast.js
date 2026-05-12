import {
  showToast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
} from "src/utils/toast";

/**
 * Toast helpers for use inside `setup()` (or `<script setup>`).
 * Logic lives in `src/utils/toast.js` so the same API works outside components too.
 */
export function useToast() {
  return {
    showToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  };
}
