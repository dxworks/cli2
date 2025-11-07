import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['@cli-new/source'],
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
});
