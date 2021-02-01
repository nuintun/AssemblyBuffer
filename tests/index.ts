/**
 * @module tests
 */

import hex from './hex';
import Buffer from '../src';

Buffer.init().then(({ Buffer, __getUint8Array, __getString, __newString }) => {
  /**
   * @function byteLength
   * @description 获取字符串指定编码字节长度
   * @param {string} input
   * @param {string} [encoding]
   * @returns {number}
   */
  function byteLength(input: string, encoding: string = 'UTF8'): number {
    const buffer = new Buffer();

    buffer.write(__newString(input), __newString(encoding));

    return buffer.length;
  }

  const buffer = new Buffer();

  buffer.writeInt8(0xaf);
  buffer.writeUint8(0xfa);
  buffer.writeBoolean(0x01);
  buffer.writeInt16(0xfafc);
  buffer.writeUint16(0xfcfa);
  buffer.writeInt32(0xfafbfcfd);
  buffer.writeUint32(0xfdfbfafc);
  buffer.writeInt64(0xf0f1fafbfcfdfeffn);
  buffer.writeUint64(0xfffefdfcfbfaf1f0n);
  buffer.writeFloat32(123456.654321);
  buffer.writeFloat64(987654321.123456789);
  buffer.write(__newString(`A buffer tool using WebAssembly.`));

  buffer.offset = 0;

  console.log(buffer.readInt8());
  console.log(buffer.readUint8());
  console.log(buffer.readBoolean());
  console.log(buffer.readInt16());
  console.log(buffer.readUint16());
  console.log(buffer.readInt32());
  console.log(buffer.readUint32());
  console.log(buffer.readInt64());
  console.log(buffer.readUint64());
  console.log(buffer.readFloat32());
  console.log(buffer.readFloat64());
  console.log(__getString(buffer.read(byteLength(`A buffer tool using WebAssembly.`))));

  process.stdout.write(`\r\n${hex(__getUint8Array(buffer.bytes))}`);
});
