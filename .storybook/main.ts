import { defineMain } from '@storybook/react-vite/node';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(config) {
    // Storybook ya incluye @vitejs/plugin-react internamente.
    // Solo agregamos tailwindcss y los aliases del proyecto.
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src'),
          '@test': resolve(__dirname, '../test'),
        },
      },
    });
  },
});
