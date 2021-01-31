/**
 * @module index
 */

import hex from './hex';
import Buffer from '../esnext';

let timer;
let index = 0;

const view = document.getElementById('view');

function onStart() {
  onStop();

  Buffer.initialize().then(({ Buffer, __getUint8Array, __newString }) => {
    const buffer = new Buffer();

    buffer.write(__newString(`${++index}: A buffer tool using WebAssembly.`));

    view.innerHTML = hex(__getUint8Array(buffer.bytes));

    timer = setTimeout(onStart, 100);
  });
}

function onStop() {
  clearTimeout(timer);
}

document.getElementById('start').addEventListener('click', onStart, false);
document.getElementById('stop').addEventListener('click', onStop, false);
