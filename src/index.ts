import wasm from '../wasm/Buffer.wasm';
import ASModule from '../wasm/Buffer.d';
import { ASUtil, instantiate } from '@assemblyscript/loader';

function fetchWasm(): Blob | ArrayBuffer {
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

let exports: ASUtil & typeof ASModule;

export default {
  async init(): Promise<typeof exports> {
    if (exports) return exports;

    return (exports = await (await instantiate<typeof ASModule>(fetchWasm())).exports);
  }
};

// type WasmByteArray = ASModule.ByteArray;

// const { ByteArray: WasmByteArray, __newString, __newArray, Uint8Array_ID } = instantiateSync<typeof ASModule>(buffer).exports;

// export default class ByteArray {
//   private buffer: WasmByteArray;

//   static from(uint8Array: Uint8Array, offset: number = 0, length: number = -1): ByteArray {
//     offset = Math.max(0, offset);

//     return new ByteArray(uint8Array.slice(offset, offset + length));
//   }

//   constructor(initValue?: Uint8Array | number, pageSize?: number) {
//     if (initValue instanceof Uint8Array) {
//       const uint8ArrayPtr: number = __newArray(Uint8Array_ID, initValue);

//       this.buffer = WasmByteArray.wrap(WasmByteArray.from(uint8ArrayPtr, 0, -1));
//     } else {
//       this.buffer = new WasmByteArray(initValue, pageSize);
//     }
//   }
//   // copy(byteArray: usize, offset: i32, length: i32): void;
//   // writeInt8(value: i8): void;
//   // writeUint8(value: u8): void;
//   // writeBoolean(value: bool): void;
//   // writeInt16(value: i16, littleEndian: bool): void;
//   // writeUint16(value: u16, littleEndian: bool): void;
//   // writeInt32(value: i32, littleEndian: bool): void;
//   // writeUint32(value: u32, littleEndian: bool): void;
//   // writeInt64(value: i64, littleEndian: bool): void;
//   // writeUint64(value: u64, littleEndian: bool): void;
//   // writeFloat32(value: f32, littleEndian: bool): void;
//   // writeFloat64(value: f64, littleEndian: bool): void;
//   write(value: string, encoding: string): void {
//     // this.buffer.write(__newString(value), __newString(encoding));
//     super.write(__newString(value), __newString(encoding));
//   }
//   // readInt8(): i8;
//   // readUint8(): u8;
//   // readBoolean(): bool;
//   // readInt16(littleEndian: bool): i16;
//   // readUint16(littleEndian: bool): u16;
//   // readInt32(littleEndian: bool): i32;
//   // readUint32(littleEndian: bool): u32;
//   // readInt64(littleEndian: bool): i64;
//   // readUint64(littleEndian: bool): u64;
//   // readFloat32(littleEndian: bool): f32;
//   // readFloat64(littleEndian: bool): f64;
//   // read(length: i32, encoding: usize): usize;
//   // inspect(max: i32): usize;
//   // toString(): usize;
// }
