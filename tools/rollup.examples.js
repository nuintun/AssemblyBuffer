/**
 * @module rollup.examples
 */

import banner from './banner.js';
import wasm from './plugins/wasm.js';
import treeShake from './plugins/tree-shake.js';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'examples/index.ts',
  output: {
    banner,
    format: 'umd',
    name: 'Buffer',
    interop: 'auto',
    esModule: false,
    amd: { id: 'buffer' },
    file: 'examples/index.js'
  },
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  },
  plugins: [resolve(), wasm(), typescript(), treeShake()]
};
