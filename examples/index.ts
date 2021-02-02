/**
 * @module examples
 */

import hex from './hex';
import Buffer from '../src';

let raf: number;
let index: number = 0;

const view: HTMLElement = document.getElementById('view') as HTMLElement;

function onStart() {
  onStop();

  Buffer.init().then(({ Buffer, __newString, __getUint8Array }) => {
    const buffer = new Buffer();

    buffer.write(__newString(`${++index}: A buffer tool using WebAssembly.`));

    view.innerHTML = hex(__getUint8Array(buffer.bytes));

    raf = window.requestAnimationFrame(onStart);
  });
}

function onStop() {
  window.cancelAnimationFrame(raf);
}

(document.getElementById('start') as HTMLElement).addEventListener('click', onStart, false);
(document.getElementById('stop') as HTMLElement).addEventListener('click', onStop, false);
