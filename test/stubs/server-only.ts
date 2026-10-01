// Inert stand-in for the `server-only` package under vitest.
// The real package throws on import outside a React Server Component,
// which would block unit-testing the pure helpers in server modules.
export {};
