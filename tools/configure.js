/**
 * @module configure
 * @license MIT
 * @author nuintun
 */

import * as fs from 'fs';
import clean from './clean';
import MagicString from 'magic-string';
import typescript from 'rollup-plugin-typescript2';
import { createFilter } from '@rollup/pluginutils';

function wasm() {
  const filter = createFilter(['**/*.wasm']);

  return {
    name: 'rollup-plugin-wasm',
    load(id) {
      if (filter(id)) {
        return new Promise((resolve, reject) => {
          fs.readFile(id, (error, buffer) => {
            if (error != null) reject(error);

            resolve(buffer.toString('base64'));
          });
        });
      }
    },
    transform(code, id) {
      if (filter(id)) {
        return `export default ${JSON.stringify(code)}`;
      }
    }
  };
}

/***
 * @function treeShake
 * @description Fixed tree shaking for typescript and rollup preserve modules
 * @see https://github.com/GiG/rollup-plugin-rename-extensions
 */
function treeShake() {
  return {
    name: 'rollup-plugin-tree-shake',
    generateBundle(options, bundle) {
      const files = Object.entries(bundle);

      for (const [, file] of files) {
        if (!file.isAsset) {
          const code = new MagicString(file.code);

          this.parse(file.code, {
            sourceType: 'module',
            onComment(block, text, start, end) {
              if (block && text === '* @class ') {
                code.overwrite(start, end, '/*#__PURE__*/');
              }
            }
          });

          if (options.sourcemap) {
            file.map = code.generateMap();
          }

          file.code = code.toString();
        }
      }
    }
  };
}

export default function configure(esnext) {
  clean(esnext);

  const tsconfigOverride = { compilerOptions: { declaration: true, declarationDir: 'typings' } };
  const tsconfig = esnext ? { tsconfigOverride, clean: true, useTsconfigDeclarationDir: true } : { clean: true };

  return {
    input: 'src/index.ts',
    output: {
      interop: false,
      exports: 'auto',
      esModule: false,
      format: esnext ? 'esm' : 'cjs',
      dir: esnext ? 'esnext' : 'es5'
    },
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    preserveModules: false,
    external: ['tslib', '@assemblyscript/loader'],
    plugins: [wasm(), typescript(tsconfig), treeShake()]
  };
}
