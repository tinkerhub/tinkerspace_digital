// screenValue null/undefined means "inherit" — fall back to the global value.
export function resolveSetting(screenValue, globalValue) {
  return screenValue ?? globalValue;
}
