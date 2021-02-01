/**
 * @module examples
 */

import hex from './hex';
import Buffer from '../src';

let timer: number;
let index: number = 0;

const view: HTMLElement = document.getElementById('view') as HTMLElement;

function onStart() {
  onStop();

  Buffer.init().then(({ Buffer, __newString, __getUint8Array }) => {
    const buffer = new Buffer();

    buffer.write(__newString(`${++index}: A buffer tool using WebAssembly.`));

    view.innerHTML = hex(__getUint8Array(buffer.bytes));

    timer = window.setTimeout(onStart, 16);
  });
}

function onStop() {
  clearTimeout(timer);
}

(document.getElementById('start') as HTMLElement).addEventListener('click', onStart, false);
(document.getElementById('stop') as HTMLElement).addEventListener('click', onStop, false);
