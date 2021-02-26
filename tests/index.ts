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
  const desc: string = `A buffer tool using WebAssembly.`;

  buffer.writeInt8(0xaf);
  buffer.writeUint8(0xfa);
  buffer.writeBoolean(0x01);
  buffer.writeInt16(0xfafc);
  buffer.writeUint16(0xfcfa);
  buffer.writeInt32(0xfafbfcfd);
  buffer.writeUint32(0xfdfbfafc);
  // @ts-ignore
  buffer.writeInt64(0xf0f1fafbfcfdfeffn);
  // @ts-ignore
  buffer.writeUint64(0xfffefdfcfbfaf1f0n);
  buffer.writeFloat32(123456.654321);
  buffer.writeFloat64(987654321.123456789);
  buffer.write(__newString(desc));

  console.log(hex(__getUint8Array(buffer.bytes)));

  buffer.offset = 0;

  console.log(0xaf, '->', buffer.readInt8());
  console.log(0xfa, '->', buffer.readUint8());
  console.log(0x01, '->', buffer.readBoolean());
  console.log(0xfafc, '->', buffer.readInt16());
  console.log(0xfcfa, '->', buffer.readUint16());
  console.log(0xfafbfcfd, '->', buffer.readInt32());
  console.log(0xfdfbfafc, '->', buffer.readUint32());
  // @ts-ignore
  console.log(0xf0f1fafbfcfdfeffn, '->', buffer.readInt64());
  // @ts-ignore
  console.log(0xfffefdfcfbfaf1f0n, '->', buffer.readUint64());
  console.log(123456.654321, '->', buffer.readFloat32());
  console.log(987654321.123456789, '->', buffer.readFloat64());
  console.log(desc, '->', __getString(buffer.read(byteLength(desc))));

  console.log(hex(__getUint8Array(buffer.bytes)));
});
