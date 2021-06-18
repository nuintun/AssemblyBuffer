/**
 * @module utils
 */

/**
 * @function stringEncode
 * @description 用指定编码编码字符串
 * @param {string} value 需要编码的字符串
 * @param {string} encoding 字符串编码
 * @returns {ArrayBuffer}
 */
// @ts-ignore
@inline
export function stringEncode(value: string, encoding: string): ArrayBuffer {
  const formatted = encoding.toUpperCase();

  if (formatted == 'UTF8' || formatted == 'UTF-8') {
    return String.UTF8.encode(value);
  }

  if (formatted == 'UTF16' || formatted == 'UTF-16') {
    return String.UTF16.encode(value);
  }

  throw new TypeError('Unsupported encoding ' + encoding);
}

/**
 * @function stringDecode
 * @description 用指定编码解码字符串数据
 * @param {ArrayBuffer} buffer 需要解码的字符串数据
 * @param {string} encoding 字符串编码
 * @returns {string}
 */
// @ts-ignore
@inline
export function stringDecode(buffer: ArrayBuffer, encoding: string): string {
  const formatted = encoding.toUpperCase();

  if (formatted == 'UTF8' || formatted == 'UTF-8') {
    return String.UTF8.decode(buffer);
  }

  if (formatted == 'UTF16' || formatted == 'UTF-16') {
    return String.UTF16.decode(buffer);
  }

  throw new TypeError('Unsupported encoding ' + encoding);
}

/**
 * @function calcBufferLength
 * @description 计算适合的 Buffer 长度
 * @param {i32} length 数据字节总大小
 * @param {u16} pageSize 缓冲区页大小
 * @returns {i32}
 */
// @ts-ignore
@inline
export function calcBufferLength(length: i32, pageSize: u16): i32 {
  if (length > <i32>pageSize) {
    const pages: i32 = <i32>Math.ceil(length / pageSize);

    return pages * pageSize;
  } else {
    return length;
  }
}
