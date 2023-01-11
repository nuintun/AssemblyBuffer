/**
 * @module clean
 */

const rimraf = require('rimraf');

function clean(paths) {
  if (Array.isArray(paths)) {
    for (const path of paths) {
      rimraf.sync(path);
    }
  } else {
    rimraf.sync(path);
  }
}

clean(['cjs', 'esm', 'wasm', 'typings', 'tests/index.js', 'examples/index.js']);
