import { afterEach, vi } from "vitest";

// Reset all mocks and localStorage after each test
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
