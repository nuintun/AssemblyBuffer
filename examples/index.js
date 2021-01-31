/**
 * @module index
 */

import hex from './hex';
import Buffer from '../esnext';

const view = document.getElementById('view');

function onClick() {
  Buffer.initialize().then(({ __getUint8Array, __newArray, __newString, Buffer, UINT8_ARRAY_ID }) => {
    const buffer = new Buffer();

    buffer.write(__newString(`A buffer tool using WebAssembly.`), __newString('utf8'));

    view.append(`${hex(__getUint8Array(buffer.bytes))}\r\n`);
  });
}

document.getElementById('button').addEventListener('click', onClick, false);
