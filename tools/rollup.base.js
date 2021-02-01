/**
 * @module rollup.base
 */

import clean from './clean';
import wasm from './plugins/wasm';
import treeShake from './plugins/tree-shake';
import typescript from 'rollup-plugin-typescript2';

export default function rollup(esnext) {
  clean(esnext ? ['esm', 'typings'] : ['cjs']);

  const tsconfigOverride = { compilerOptions: { declaration: true, declarationDir: 'typings' } };
  const tsconfig = esnext ? { tsconfigOverride, useTsconfigDeclarationDir: true } : {};

  return {
    input: 'src/index.ts',
    output: {
      interop: false,
      exports: 'auto',
      esModule: false,
      dir: esnext ? 'esm' : 'cjs',
      format: esnext ? 'esm' : 'cjs'
    },
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    external: ['tslib', '@assemblyscript/loader'],
    plugins: [wasm(), typescript(tsconfig), treeShake()]
  };
}
