/**
 * @module tests
 */

'use strict';

const hex = require('./hex');
const Buffer = require('../es5');

Buffer.initialize().then(({ __getUint8Array, __newArray, __newString, Buffer, UINT8_ARRAY_ID }) => {
  const buffer = new Buffer();

  buffer.writeBytes(__newArray(UINT8_ARRAY_ID, new Uint8Array([84, 121, 112, 101, 69, 114, 114, 111, 114, 58])));

  buffer.write(__newString(`TypeError: Cannot read property 'toString' of undefined，你哦`), __newString('utf-8'));

  hex(__getUint8Array(buffer.bytes));
});
