/**
 * @module clean
 */

import rimraf from 'rimraf';

export default function clean(paths) {
  paths = Array.isArray(paths) ? paths : [paths];

  paths.forEach(path => rimraf.sync(path));
}
