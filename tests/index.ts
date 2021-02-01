/**
 * @module tests
 */

import hex from './hex';
import Buffer from '../src';

Buffer.init().then(({ Buffer, __getUint8Array, __newString }) => {
  // @ts-ignore
  const buffer: Buffer = new Buffer();

  // @ts-ignore
  buffer.write(__newString(`A buffer tool using WebAssembly.`));

  // @ts-ignore
  process.stdout.write(hex(__getUint8Array(buffer.bytes)));
});
