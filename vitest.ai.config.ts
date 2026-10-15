import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/main/aiAssist.test.ts', 'tests/main/aiCapture.test.ts', 'tests/shared/aiFeatures.test.ts', 'tests/renderer/showcase.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/main/aiAssist.ts', 'src/shared/aiFeatures.ts', 'site/page.ts'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
