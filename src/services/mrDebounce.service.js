const mrDebounceMap = new Map();

export const DEBOUNCE_WAIT_MS = Number(
  process.env.MR_DEBOUNCE_WAIT_MS ?? 30000,
);

export const mrDebounceService = {
  hasKey: (key) => mrDebounceMap.has(key),
  get: (key) => mrDebounceMap.get(key),
  add: (key, value) => mrDebounceMap.set(key, value),
  delete: (key) => mrDebounceMap.delete(key),
};

export default mrDebounceService;
