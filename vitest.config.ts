import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: { include: ['src/**/*.test.ts'], environment: 'node', passWithNoTests: true },
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
});
