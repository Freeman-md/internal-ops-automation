import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        projects: [
            {
                test: {
                    include: [
                        'tests/unit/**/*.{test,spec}.ts',
                        'tests/**/*.unit.{test,spec}.ts',
                    ],
                    name: 'unit',
                    environment: 'node',
                },
            },
            {
                test: {
                    name: 'browser',
                    include: [
                        'tests/browser/**/*.{test,spec}.ts',
                        'tests/**/*.browser.{test,spec}.ts',
                    ],
                    browser: {
                        provider: playwright(),
                        enabled: true,

                        instances: [
                            { browser: 'chromium' }
                        ]
                    }
                }
            }
        ]
    }
}) 
