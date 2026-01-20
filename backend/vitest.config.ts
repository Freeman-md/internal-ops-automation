import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "node:path";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        projects: [
            {
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "src"),
                    },
                },
                test: {
                    include: [
                        'tests/unit/**/*.{test,spec}.ts',
                        'tests/**/*.unit.{test,spec}.ts',
                        'tests/integration/**/*.{test,spec}.ts',
                        'tests/**/*.integration.{test,spec}.ts',
                    ],
                    name: 'unit',
                    environment: 'node',
                },
            },
            {
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "src"),
                    },
                },
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
