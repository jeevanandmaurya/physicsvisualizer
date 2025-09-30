// Minimal polyfills for test environment to satisfy whatwg-url/webidl-conversions
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = class URL {
    constructor(href) { this.href = href; }
    toString() { return this.href; }
  };
}

// Ensure globalThis.window exists for libraries that expect it
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

// Polyfill some webidl-conversions internals if needed
if (!globalThis.Symbol) {
  globalThis.Symbol = () => {};
}
