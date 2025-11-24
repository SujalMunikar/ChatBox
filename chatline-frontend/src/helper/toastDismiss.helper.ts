import { toast } from "react-hot-toast";

// Toast dismissal utility: every confirmation view calls createToastDismissController(id).
// We keep a controller per id so repeated submits reuse the same listeners and timeout.
// The controller auto-cleans on timeout, outside click, Esc press, or when the tab hides.
type ToastController = {
  dismiss: () => void;
  attach: () => void;
};

const controllerRegistry = new Map<string, ToastController>();

export const createToastDismissController = (toastId: string) => {
  const existing = controllerRegistry.get(toastId);
  existing?.dismiss();

  if (typeof window === "undefined") {
    const fallback: ToastController = {
      // SSR / tests: just tear down any matching toast without wiring DOM listeners.
      dismiss: () => {
        toast.dismiss(toastId);
        toast.remove(toastId);
        controllerRegistry.delete(toastId);
      },
      attach: () => undefined,
    };
    controllerRegistry.set(toastId, fallback);
    return fallback;
  }

  let timer: number | undefined;

  function cleanup() {
    // Remove the timeout and any window-level listeners before reattaching or exiting early.
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    window.removeEventListener("pointerdown", handlePointerDown, true);
    window.removeEventListener("keydown", handleKeydown, true);
    window.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  function dismiss() {
    // Centralised exit: remove toast UI, detach listeners, and drop the controller from the map.
    toast.dismiss(toastId);
    toast.remove(toastId);
    cleanup();
    controllerRegistry.delete(toastId);
  }

  function handlePointerDown(event: PointerEvent) {
    // Ignore clicks that originate inside the toast; otherwise close it.
    const toastNode = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (toastNode?.contains(event.target as Node)) {
      return;
    }
    dismiss();
  }

  function handleKeydown(event: KeyboardEvent) {
    // Escape provides an accessible keyboard dismissal path.
    if (event.key === "Escape") {
      dismiss();
    }
  }

  function handleVisibilityChange() {
    // If the tab goes to the background we close the toast to avoid stale confirmations.
    if (document.visibilityState === "hidden") {
      dismiss();
    }
  }

  function attach() {
    // Arm the 5s timeout and listen for global interactions that should close the toast.
    cleanup();
    timer = window.setTimeout(dismiss, 10000);
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeydown, true);
    window.addEventListener("visibilitychange", handleVisibilityChange);
  }

  const controller: ToastController = { dismiss, attach };
  controllerRegistry.set(toastId, controller);

  return controller;
};
