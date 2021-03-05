/**
 * @module examples
 */

import hex from './hex';
import Buffer from '../src';

let raf: number;
let index: number = 0;

const start: HTMLElement = document.getElementById('start') as HTMLElement;
const stop: HTMLElement = document.getElementById('stop') as HTMLElement;
const view: HTMLTextAreaElement = document.getElementById('view') as HTMLTextAreaElement;

function onStart() {
  onStop();

  Buffer.init().then(({ Buffer, __newString, __getUint8Array }) => {
    const timeStamp: number = window.performance.now();

    const buffer = new Buffer();

    buffer.write(__newString(`${++index}: A buffer tool using WebAssembly.`));

    const performance: number = window.performance.now() - timeStamp;

    view.value = `${hex(__getUint8Array(buffer.bytes))}\r\n\r\nperformance: ${performance}ms`;

    raf = window.requestAnimationFrame(onStart);
  });
}

function onStop() {
  window.cancelAnimationFrame(raf);
}

start.addEventListener('click', onStart, false);
stop.addEventListener('click', onStop, false);
