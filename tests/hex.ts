/**
 * @module hex
 */

/**
 * @type {string[]}
 * @description 已获得的 hex 映射表
 */
const mapping: string[] = [];

// 字母映射表
const alphabet: string = '0123456789ABCDEF';

// 生成映射表
for (let i: number = 0; i < 16; ++i) {
  const i16: number = i * 16;

  for (let j: number = 0; j < 16; ++j) {
    mapping[i16 + j] = alphabet[i] + alphabet[j];
  }
}

/**
 * @function zero
 * @description 数字左边补零操作
 * @param {number} num
 * @param {number} max
 * @returns {string}
 */

function zero(num: number, max: number): string {
  return num.toString(16).toUpperCase().padStart(max, '0');
}

/**
 * @function hex
 * @function Hex 查看器
 * @param {Uint8Array} buffer
 * @returns {string}
 */
export default function hex(buffer: Uint8Array): string {
  const { length }: Uint8Array = buffer;
  const last: number = length % 16 || 16;
  const rows: number = Math.ceil(length / 16);
  const offsetLength: number = Math.max(6, length.toString(16).length);

  let rowBytes: number;
  let index: number = 0;
  let rowSpaces: number;
  let hex: string = `\u001b[36mOFFSET  `;

  for (let i: number = 0; i < 16; i++) {
    hex += ` ${zero(i, 2)}`;
  }

  hex += `\u001b[0m\n`;

  if (length) {
    hex += `\n`;
  }

  for (let i: number = 0; i < rows; i++) {
    hex += `\u001b[36m${zero(index, offsetLength)}\u001b[0m  `;
    rowBytes = i === rows - 1 ? last : 16;
    rowSpaces = 16 - rowBytes;

    for (let j: number = 0; j < rowBytes; j++) {
      hex += ` ${zero(buffer[index++], 2)}`;
    }

    for (let j: number = 0; j <= rowSpaces; j++) {
      hex += `   `;
    }

    index -= rowBytes;

    for (let j: number = 0; j < rowBytes; j++) {
      const byte: number = buffer[index++];

      hex += (byte > 31 && byte < 127) || byte > 159 ? String.fromCharCode(byte) : `.`;
    }

    hex += `\n`;
  }

  return hex;
}
