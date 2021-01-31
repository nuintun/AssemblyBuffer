/**
 * @module hex
 */

'use strict';

function zero(num, max) {
  return num.toString(16).toUpperCase().padStart(max, '0');
}

export default function hex(buffer) {
  const { length } = buffer;
  const last = length % 16 || 16;
  const rows = Math.ceil(length / 16);
  const offsetLength = Math.max(6, length.toString(16).length);

  let rowBytes;
  let index = 0;
  let rowSpaces;
  let hex = `OFFSET  `;

  for (let i = 0; i < 16; i++) {
    hex += ` ${zero(i, 2)}`;
  }

  hex += `\n`;

  if (length) {
    hex += `\n`;
  }

  for (let i = 0; i < rows; i++) {
    hex += `${zero(index, offsetLength)}  `;
    rowBytes = i === rows - 1 ? last : 16;
    rowSpaces = 16 - rowBytes;

    for (let j = 0; j < rowBytes; j++) {
      hex += ` ${zero(buffer[index++], 2)}`;
    }

    for (let j = 0; j <= rowSpaces; j++) {
      hex += `   `;
    }

    index -= rowBytes;

    for (let j = 0; j < rowBytes; j++) {
      const byte = buffer[index++];

      hex += (byte > 31 && byte < 127) || byte > 159 ? String.fromCharCode(byte) : `.`;
    }

    hex += `\n`;
  }

  return hex;
}
