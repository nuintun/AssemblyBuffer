import wasm from '../wasm/Buffer.wasm';
import AssemblyBuffer from './AssemblyBuffer.d';
import { ASUtil, instantiate } from '@assemblyscript/loader';

export type AssemblyBuffer = typeof AssemblyBuffer;

function readAssembly(): Blob | ArrayBuffer {
  if (globalThis.atob) {
    const source = globalThis.atob(wasm);
    const { length: sourceLength } = source;
    const bytes = new Uint8Array(sourceLength);

    for (let i = 0; i < sourceLength; i++) {
      bytes[i] = source.charCodeAt(i);
    }

    return bytes.buffer;
  } else {
    return Buffer.from(wasm, 'base64');
  }
}

let buffer: ASUtil & AssemblyBuffer;

export default {
  async init(): Promise<typeof buffer> {
    if (buffer) return buffer;

    return (buffer = (await instantiate<AssemblyBuffer>(readAssembly())).exports);
  }
};
