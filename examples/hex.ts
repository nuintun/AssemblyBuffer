/**
 * @module hex
 */

'use strict';

function zero(num: number, max: number): string {
  return num.toString(16).toUpperCase().padStart(max, '0');
}

export default function hex(buffer: Uint8Array): string {
  const { length }: Uint8Array = buffer;
  const last: number = length % 16 || 16;
  const rows: number = Math.ceil(length / 16);
  const offsetLength: number = Math.max(6, length.toString(16).length);

  let rowBytes: number;
  let index: number = 0;
  let rowSpaces: number;
  let hex: string = `OFFSET  `;

  for (let i: number = 0; i < 16; i++) {
    hex += ` ${zero(i, 2)}`;
  }

  hex += `\n`;

  if (length) {
    hex += `\n`;
  }

  for (let i: number = 0; i < rows; i++) {
    hex += `${zero(index, offsetLength)}  `;
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
