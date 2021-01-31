/**
 * @module clean
 * @license MIT
 * @author nuintun
 */

import rimraf from 'rimraf';

export default function clean(esnext) {
  const paths = esnext ? ['esnext', 'typings'] : ['es5'];

  paths.forEach(path => rimraf.sync(path));
}
