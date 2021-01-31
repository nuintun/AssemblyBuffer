/**
 * @module hex
 */

'use strict';

function zero(num, max) {
  return num.toString(16).toUpperCase().padStart(max, '0');
}

module.exports = function hex(buffer) {
  const { length } = buffer;
  const last = length % 16 || 16;
  const rows = Math.ceil(length / 16);
  const offsetLength = Math.max(6, length.toString(16).length);

  let rowBytes;
  let index = 0;
  let rowSpaces;
  let hex = `\u001b[36mOFFSET  `;

  for (let i = 0; i < 16; i++) {
    hex += ` ${zero(i, 2)}`;
  }

  hex += `\u001b[0m\n`;

  if (length) {
    hex += `\n`;
  }

  for (let i = 0; i < rows; i++) {
    hex += `\u001b[36m${zero(index, offsetLength)}\u001b[0m  `;
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

  process.stdout.write(hex);
};
