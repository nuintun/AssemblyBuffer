import wasm from '../wasm/Buffer.wasm';
import { ASUtil, instantiate } from '@assemblyscript/loader';
import type { Buffer as InternalBuffer } from '../wasm/Buffer';

type InternalExport = {
  Buffer: typeof InternalBuffer;
};

type Export = ASUtil & InternalExport;

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

let buffer: Export;

export { InternalBuffer as Buffer };

export default {
  async init(): Promise<typeof buffer> {
    if (buffer) return buffer;

    return (buffer = (await instantiate<InternalExport>(readAssembly())).exports);
  }
};
