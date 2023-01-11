/**
 * @module banner
 */

import { createRequire } from 'module';

const pkg = createRequire(import.meta.url)('../package.json');

export default `/**
 * @module QRCode
 * @package ${pkg.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;
