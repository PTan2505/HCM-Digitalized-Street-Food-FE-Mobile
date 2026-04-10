/**
 * A lightweight registry for non-serializable callbacks that need to be
 * referenced across navigation boundaries.
 *
 * React Navigation requires all route params to be serializable (no functions).
 * Instead of passing callbacks directly, callers register them here and pass
 * only the opaque string ID as a param. The receiving screen retrieves the
 * callback by ID and removes it on unmount.
 */

let _counter = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _registry = new Map<string, (...args: any[]) => void>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerCallback<T extends (...args: any[]) => void>(
  cb: T
): string {
  const id = `_cb_${++_counter}`;
  _registry.set(id, cb);
  return id;
}

export function invokeCallback(id: string, ...args: unknown[]): void {
  _registry.get(id)?.(...args);
}

export function removeCallback(id: string): void {
  _registry.delete(id);
}
