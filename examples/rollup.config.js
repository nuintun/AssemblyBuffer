/**
 * @module rollup.config
 */

import rimraf from 'rimraf';
import pkg from '../package.json';
import resolve from '@rollup/plugin-node-resolve';

const banner = `/**
 * @module Buffer
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

rimraf.sync('examples/index.bundle.js');

export default {
  input: 'examples/index.js',
  output: {
    banner,
    format: 'umd',
    name: 'Buffer',
    interop: false,
    esModule: false,
    amd: { id: 'buffer' },
    file: 'examples/index.bundle.js'
  },
  plugins: [resolve()],
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  }
};
