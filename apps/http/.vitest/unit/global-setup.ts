/**
 * Runs once in a separate Node process before all tests.
 * Keep Workers-specific polyfills in `setup-files/test-setup.ts` (same isolate as tests).
 */
export default function globalSetup() {
  // Place one-off env or server bootstrapping here if needed.
}
