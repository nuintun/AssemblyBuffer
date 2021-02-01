/**
 * @module wasm
 */

import * as fs from 'fs';
import { createFilter } from '@rollup/pluginutils';

/**
 * @function wasm
 * @description 处理 WebAssembly
 */
export default function wasm() {
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
