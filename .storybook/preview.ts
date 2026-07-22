import '../src/index.css';
import { withZustandStore } from './decorators/withZustandStore';
import { withMotion } from './decorators/withMotion';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  decorators: [withZustandStore, withMotion],
};

export default preview;
