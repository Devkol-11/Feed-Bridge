import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import path from 'path';

// Since you are using NodeNext/ESM, we manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
        plugins: [tsconfigPaths()],
        test: {
                globals: true,
                environment: 'node'
        },
        resolve: {
                alias: {
                        '@src': path.resolve(__dirname, './src')
                }
        }
});
