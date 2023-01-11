/**
 * @module rollup.base
 */

import wasm from './plugins/wasm.js';
import treeShake from './plugins/tree-shake.js';
import typescript from '@rollup/plugin-typescript';

export default function rollup(esnext) {
  return {
    input: 'src/index.ts',
    output: {
      interop: 'auto',
      exports: 'auto',
      esModule: false,
      dir: esnext ? 'esm' : 'cjs',
      format: esnext ? 'esm' : 'cjs'
    },
    plugins: [wasm(), typescript(), treeShake()],
    external: ['tslib', '@assemblyscript/loader'],
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    }
  };
}
