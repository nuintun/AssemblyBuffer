/**
 * @module tests
 */

'use strict';

const hex = require('./hex');
const Buffer = require('../es5');

Buffer.init().then(({ Buffer, __getUint8Array, __newString }) => {
  const buffer = new Buffer();

  buffer.write(__newString(`A buffer tool using WebAssembly.`));

  hex(__getUint8Array(buffer.bytes));
});
