/// <reference types="vitest" />
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8', // or 'v8'
        reporter: ['text'], // output formats
        reportsDirectory: './coverage',
        include: ['src/**/*.{js,vue}'], // only measure these files
        exclude: [
          'src/main.js', // entry file
          'src/**/*.d.ts', // type definitions (if any)
          'src/**/__tests__/**', // test files
          'src/**/mocks/**', // mocks
          'src/setupTests.js', // test setup
        ],
      },
    },
  }),
)
