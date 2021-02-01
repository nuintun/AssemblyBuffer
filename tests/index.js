/**
 * @module Buffer
 * @license MIT
 * @version 0.0.1
 * @author nuintun
 * @description A buffer tool using WebAssembly.
 * @see https://github.com/nuintun/AssemblyBuffer#readme
 */

'use strict';

/**
 * @module hex
 */
/**
 * @type {string[]}
 * @description 已获得的 hex 映射表
 */
const mapping = [];
// 字母映射表
const alphabet = '0123456789ABCDEF';
// 生成映射表
for (let i = 0; i < 16; ++i) {
    const i16 = i * 16;
    for (let j = 0; j < 16; ++j) {
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
function zero(num, max) {
    return num.toString(16).toUpperCase().padStart(max, '0');
}
/**
 * @function hex
 * @function Hex 查看器
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function hex(buffer) {
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
    return hex;
}

var wasm = "AGFzbQEAAAABVQ9gAX8Bf2ACf38AYAJ/fwF/YAN/f38AYAF/AGAAAGADf39/AX9gBH9/f38AYAN/fn8AYAJ/fwF+YAN/fX8AYAN/fH8AYAF+AX5gAn9/AX1gAn9/AXwCDQEDZW52BWFib3J0AAcDYF8BAQEBAQMFAAIDAgEBAAEDAAIDAAEGAAIBBQECAAAAAQAAAQMBAQAGAAAAAQQBAQEAAAAMAAAAAgMCAgcAAAACAgAGAwMDAwgICgsDAgICAgkJDQ4GAAQABAUEBAQEBQUDAQABBjQKfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38AQQQLfwBBBQt/AUEAC38BQQALfwBBsD0LB/YGMA5VSU5UOF9BUlJBWV9JRAMFBkJ1ZmZlcgMGEkJ1ZmZlciNjb25zdHJ1Y3RvcgBDEUJ1ZmZlciNnZXQ6b2Zmc2V0ACIRQnVmZmVyI3NldDpvZmZzZXQAIxFCdWZmZXIjZ2V0Omxlbmd0aAAhEUJ1ZmZlciNzZXQ6bGVuZ3RoACYRQnVmZmVyI2dldDpidWZmZXIAJxBCdWZmZXIjZ2V0OmJ5dGVzACkYQnVmZmVyI2dldDpyZWFkQXZhaWxhYmxlACoZQnVmZmVyI2dldDpieXRlc0F2YWlsYWJsZQArC0J1ZmZlciNncm93ACURQnVmZmVyI3N0ZXBPZmZzZXQALAxCdWZmZXIjY2xlYXIALRBCdWZmZXIjd3JpdGVJbnQ4AC4RQnVmZmVyI3dyaXRlVWludDgALxNCdWZmZXIjd3JpdGVCb29sZWFuADARQnVmZmVyI3dyaXRlSW50MTYARBJCdWZmZXIjd3JpdGVVaW50MTYARRFCdWZmZXIjd3JpdGVJbnQzMgBGEkJ1ZmZlciN3cml0ZVVpbnQzMgBHEUJ1ZmZlciN3cml0ZUludDY0AEgSQnVmZmVyI3dyaXRlVWludDY0AEkTQnVmZmVyI3dyaXRlRmxvYXQzMgBKE0J1ZmZlciN3cml0ZUZsb2F0NjQASxFCdWZmZXIjd3JpdGVCeXRlcwA8DEJ1ZmZlciN3cml0ZQBMD0J1ZmZlciNyZWFkSW50OAA9EEJ1ZmZlciNyZWFkVWludDgAPhJCdWZmZXIjcmVhZEJvb2xlYW4APxBCdWZmZXIjcmVhZEludDE2AE0RQnVmZmVyI3JlYWRVaW50MTYAThBCdWZmZXIjcmVhZEludDMyAE8RQnVmZmVyI3JlYWRVaW50MzIAUBBCdWZmZXIjcmVhZEludDY0AFERQnVmZmVyI3JlYWRVaW50NjQAUhJCdWZmZXIjcmVhZEZsb2F0MzIAUxJCdWZmZXIjcmVhZEZsb2F0NjQAVBBCdWZmZXIjcmVhZEJ5dGVzAEALQnVmZmVyI3JlYWQAVQ9CdWZmZXIjdG9TdHJpbmcAQgVfX25ldwASBV9fcGluAFgHX191bnBpbgBZCV9fY29sbGVjdABaC19fcnR0aV9iYXNlAwkGbWVtb3J5AgAUX19zZXRBcmd1bWVudHNMZW5ndGgAXggBXwrJSF8JACAAIAE2AgALCQAgACABNgIECwkAIAAgATYCCAuSAgEEfyABKAIAIgJBAXFFBEBBAEHwCUGRAkEOEAAACyACQXxxIgJB/P///wNJQQAgAkEMTxtFBEBBAEHwCUGTAkEOEAAACyACQYACSQRAIAJBBHYhAgUgAkEfIAJnayIDQQRrdkEQcyECIANBB2shAwsgAkEQSUEAIANBF0kbRQRAQQBB8AlBoAJBDhAAAAsgASgCCCEEIAEoAgQiBQRAIAUgBBADCyAEBEAgBCAFEAILIAEgACACIANBBHRqQQJ0aigCYEYEQCAAIAIgA0EEdGpBAnRqIAQ2AmAgBEUEQCAAIANBAnRqIgQoAgRBfiACd3EhASAEIAE2AgQgAUUEQCAAIAAoAgBBfiADd3EQAQsLCwv4AwEHfyABRQRAQQBB8AlByQFBDhAAAAsgASgCACIEQQFxRQRAQQBB8AlBywFBDhAAAAsgAUEEaiABKAIAQXxxaiIFKAIAIgJBAXEEQCAEQXxxQQRqIAJBfHFqIgNB/P///wNJBEACfyAAIAUQBCABIAMgBEEDcXIiBBABIAFBBGogASgCAEF8cWoiBSgCAAshAgsLIARBAnEEQAJ/IAFBBGsoAgAiAygCACIHQQFxRQRAQQBB8AlB4AFBEBAAAAsgB0F8cUEEaiAEQXxxaiIIQfz///8DSQR/IAAgAxAEIAMgCCAHQQNxciIEEAEgAwUgAQsLIQELIAUgAkECchABIARBfHEiA0H8////A0lBACADQQxPG0UEQEEAQfAJQe8BQQ4QAAALIAMgAUEEamogBUcEQEEAQfAJQfABQQ4QAAALIAVBBGsgATYCACADQYACSQRAIANBBHYhAwUgA0EfIANnayIEQQRrdkEQcyEDIARBB2shBgsgA0EQSUEAIAZBF0kbRQRAQQBB8AlBgAJBDhAAAAsgACADIAZBBHRqQQJ0aigCYCEEIAFBABACIAEgBBADIAQEQCAEIAEQAgsgACADIAZBBHRqQQJ0aiABNgJgIAAgACgCAEEBIAZ0chABIAAgBkECdGoiACAAKAIEQQEgA3RyNgIEC9ABAQJ/IAEgAksEQEEAQfAJQf0CQQ4QAAALIAFBE2pBcHFBBGshASACQXBxIQMgACgCoAwiAgRAIAEgAkEEakkEQEEAQfAJQYQDQRAQAAALIAIgAUEQa0YEQAJ/IAIoAgAhBCABQRBrCyEBCwUgASAAQaQMakkEQEEAQfAJQZEDQQUQAAALCyADIAFrIgJBFEkEQA8LIAEgBEECcSACQQhrIgJBAXJyEAEgAUEAEAIgAUEAEAMgAiABQQRqaiICQQIQASAAIAI2AqAMIAAgARAFC5ABAQJ/PwAiAEEBSAR/QQEgAGtAAEEASAVBAAsEQAALQYA+QQAQAUGgygBBADYCAANAIAFBF0kEQCABQQJ0QYA+akEANgIEQQAhAANAIABBEEkEQCAAIAFBBHRqQQJ0QYA+akEANgJgIABBAWohAAwBCwsgAUEBaiEBDAELC0GAPkGkygA/AEEQdBAGQYA+JAALLwAgAEH8////A08EQEHwCEHwCUHOA0EeEAAAC0EMIABBE2pBcHFBBGsgAEEMTRsL3AEBAX8gAUGAAkkEQCABQQR2IQEFQR8gAUEBQRsgAWdrdGpBAWsgASABQf7///8BSRsiAWdrIQIgASACQQRrdkEQcyEBIAJBB2shAgsgAUEQSUEAIAJBF0kbRQRAQQBB8AlBzgJBDhAAAAsgACACQQJ0aigCBEF/IAF0cSIBBH8gACABaCACQQR0akECdGooAmAFIAAoAgBBfyACQQFqdHEiAQR/IAAgAWgiAUECdGooAgQiAkUEQEEAQfAJQdsCQRIQAAALIAAgAmggAUEEdGpBAnRqKAJgBUEACwsLhgEBAn8gASgCACEDIAJBBGpBD3EEQEEAQfAJQekCQQ4QAAALIANBfHEgAmsiBEEQTwRAIAEgAiADQQJxchABIAIgAUEEamoiASAEQQRrQQFyEAEgACABEAUFIAEgA0F+cRABIAFBBGoiACABKAIAQXxxaiAAIAEoAgBBfHFqKAIAQX1xEAELC8IBAQJ/IAAgARAIIgIQCSIBRQRAQQQ/ACIBQRB0QQRrIAAoAqAMR3QgAkEBQRsgAmdrdEEBa2ogAiACQf7///8BSRtqQf//A2pBgIB8cUEQdiEDIAEgAyABIANKG0AAQQBIBEAgA0AAQQBIBEAACwsgACABQRB0PwBBEHQQBiAAIAIQCSIBRQRAQQBB8AlB9ANBEBAAAAsLIAIgASgCAEF8cUsEQEEAQfAJQfYDQQ4QAAALIAAgARAEIAAgASACEAogAQsJACAAIAE2AgwLCQAgACABNgIQCxAAIAAgABACIAAgABADIAALEQAgACABIAAoAgRBA3FyEAILJgEBfyABKAIIIQMgACABIAJyEAIgACADEAMgAyAAEA8gASAAEAMLDQAgACgCAEF8cUEEagtYAQF/IABB7P///wNPBEBB8AhBsAlB/QBBHxAAAAsCfyAAQRBqIQIjAEUEQBAHCyMAIAIQCyICCyABEAwgAiAAEA0gAiMBIwIQECMDIAIQEWokAyACQRRqC2cBAn8CQCACIQQgACABRg0AIAAgAUkEQANAIAQEQCAAIgJBAWohACABIgNBAWohASACIAMtAAA6AAAgBEEBayEEDAELCwUDQCAEBEAgBEEBayIEIABqIAEgBGotAAA6AAAMAQsLCwsLOAEBfyAAQQRrIQEgAEEPcUVBACAAGwR/IAEoAgBBAXFFBUEAC0UEQEEAQfAJQbUEQQMQAAALIAELFAAgASABKAIAQQFyEAEgACABEAULLQAgACACEAsiAkEEaiABQQRqIAEoAgBBfHEQEyABQfw9TwRAIAAgARAVCyACCwoAIAAoAgRBfHELqwIBB38gAEEUayECIABB/D1JBEAgASACKAIMEBIiAyAAIAEgAigCECIAIAAgAUsbEBMgAw8LIAFB7P///wNPBEBB8AhBsAlBjwFBHxAAAAsjAyACEBFrJAMgAEEQayEAIAFBEGohAiMARQRAEAcLIABB/D1JBEAjACAAEBQgAhAWIQAFAkAjACEDIAAQFCEAAkAgAhAIIgUgACgCACIGQXxxIgRNDQAgAEEEaiAAKAIAQXxxaiIHKAIAIghBAXEEQCAFIARBBGogCEF8cWoiBE0EQCADIAcQBCAAIAQgBkEDcXIQAQwCCwsgAyAAIAIQFiEADAELIAMgACAFEAoLCyAAQRRqIgJBFGsiACABEA0gABAXIAAQAyAAKAIIIAAQDyMDIAAQEWokAyACCyUBAX8DQCABBEAgACICQQFqIQAgAkEAOgAAIAFBAWshAQwBCwsL2wEBB39BoAoQDiQBA0AgAUGAAkgEQEEBJARBAkEBEBIiAyABOwEAIAFBzAgoAgBPBEAgAUEASARAQdAKQZALQewAQRYQAAALIAFBAWoiAiEAIAJByAgoAgAiBEECdksEQCAAQf////8ASwRAQcALQZALQQ5BMBAAAAsgBEHACCgCACIGIABBAnQiBRAYIgBqIAUgBGsQGSAAIAZHBEBBwAggADYCAEHECCAANgIAC0HICCAFNgIAC0HACCACEAwLQcQIKAIAIAFBAnRqIAM2AgAgAUEBaiEBDAELCwsJACAAIAE7AQALJAAgACABQf//A3FKBH8gAUH//wNxIgEgACABbbebqmwFIAALC2YBAn8Cf0EMQQQQEiIBRQRAQQxBAhASIQELIAELQQAQASABQQAQAiABQQAQAyAAQfz///8DSwRAQcALQfALQRJBORAAAAsgAEEAEBIiAiAAEBkgASACEAEgASACEAIgASAAEAMgAQsKACAAQRRrKAIQC2wBAn8CQAJAAkAjBEEBaw4DAQECAAsACyAAEB4hAgtBDEEGEBIiAUEAEAEgAUEAEAIgAUEAEAMgABAeIAJJIAJB/P///wNLcgRAQcALQbAMQRlBBxAAAAsgASAAEAEgASAAEAIgASACEAMgAQsJACAAIAE2AhQLBwAgACgCBAsHACAAKAIICxsAIABEAAAAAAAAAAAgAbcgACgCBLekpaoQAwtLACACQQBIBEBB0ApB8AxByA5BExAAAAsgACgCCCACIAEoAghqSARAQdAKQfAMQckOQS8QAAALIAIgACgCBGogASgCBCABKAIIEBMLWAEBfyAAKAIEtyABIAAoAghqt6WqIgEgACgCFCgCCEoEQCABIAAvAQAQHBAdIgIgACgCEEEAECQgACACEA0gACABEAIgAigCACEBQQEkBCAAIAEQHxAgCws6AQF/IAEgACgCBGsiAkEASgRAIAAgAhAlBSACQQBIBEAgACABEAILCyABIAAoAghIBEAgACABEAMLC2UBA38gACgCBCEBQQAgACgCFCgCACIDEB4iACAAQQBKGyECIAFBAEgEfyAAIAFqIgBBACAAQQBKGwUgASAAIAAgAUobCyACayIAQQAgAEEAShsiAEEAEBIiASACIANqIAAQEyABC3UBAX8gACgCCCEDIAFBAEgEfyABIANqIgFBACABQQBKGwUgASADIAEgA0gbCyEBIAJBAEgEfyACIANqIgJBACACQQBKGwUgAiADIAIgA0gbCyABayICQQAgAkEAShsiAxAdIgIoAgQgASAAKAIEaiADEBMgAgsQACAAKAIQQQAgACgCBBAoCw0AIAAoAgQgACgCCGsLEAAgACgCFCgCCCAAKAIIawsOACAAIAEgACgCCGoQIwsxAQF/IABBABADIABBABACIAAgACgCDBAdEA0gACgCECgCACEBQQEkBCAAIAEQHxAgC0ABAn8gAEEBECUgACgCCCICIAAoAhQiAygCCE8EQEHQCkGwDEHtAEEyEAAACyACIAMoAgRqIAE6AAAgAEEBECwLQAECfyAAQQEQJSAAKAIIIgIgACgCFCIDKAIITwRAQdAKQbAMQYABQTIQAAALIAIgAygCBGogAToAACAAQQEQLAsKACAAIAFFRRAvCxQAIABBEHRBGHVB/wFxIABBCHRyCxIAIABBCHQgAEH//wNxQQh2cgsZACAAQYD+g3hxQQh3IABB/4H8B3FBCHhyC0MAIABCCIhC/4H8h/CfwP8AgyAAQv+B/Ifwn8D/AINCCIaEIgBCEIhC//+DgPD/P4MgAEL//4OA8P8/g0IQhoRCIIoLDQAgAEEUaygCEEEBdgv9AQEFfyAAQQh2IgFBpDBqLQAAIAFB7BNqLQAAQdYAbEHsE2ogAEH/AXEiBEEDbmotAAAgBEEDcEECdEHYKGooAgBsQQt2QQZwakECdEHkKGooAgAiAUEIdSECAkAgAUH/AXEiAUECSQ0AIAJB/wFxIQEgAkEIdiEDA0AgAQRAIAQgAyABQQF2IgJqQQF0QaQ0ai0AACIFRgR/IAIgA2pBAXRBpDRqLQABQQJ0QeQoaigCACIBQQh1IQIgAUH/AXEiAUECSQ0DIABBAWsPBSAEIAVJBH8gAgUgAiADaiEDIAEgAmsLCyEBDAELCyAADwsgACACQQAgAUEBc2txaguHBAEKfyAAEDUiCEUEQCAADwsgCEEGbEEBEBIhBkGwDRA1IQMDQCAHIAhJBEAgACAHQQF0ai8BACICQQd2BEACQCAHIAhBAWtJQQAgAkH/rwNrQYEISRsEQCAAIAdBAXRqLwECIgRB/7cDa0GBCEkEQCAHQQFqIQcgBEH/B3EgAiIBQf8HcUEKdHJBgIAEaiICQYCACE8EQCAGIAVBAXRqIAEgBEEQdHI2AgAgBUEBaiEFDAMLCwsgAkHQyQBrQRlNBEAgBiAFQQF0aiACQRprOwEABSACQd8Ba0G49ANNBH8gAyEBQQAhCQJAA0AgASAJTgRAIAEgCWpBA3ZBAnQiBEEBdEGwDWovAQAgAmsiCkUNAiAKQR92BEAgBEEEaiEJBSAEQQRrIQELDAELC0F/IQQLIAQFQX8LIgFBf3MEQCABQQF0QbANaiIBLwEGIQIgBiAFQQF0aiIEIAEoAgI2AgAgBCACOwEEIAUgAkEAR0EBamohBQUgAhA2Qf///wBxIgJBgIAESQRAIAYgBUEBdGogAjsBAAUgBiAFQQF0aiACQYCABGsiAkH/B3FBgLgDckEQdCACQQp2QYCwA3JyNgIAIAVBAWohBQsLCwsFIAYgBUEBdGogAiACQeEAa0EaSUEFdEF/c3E7AQALIAdBAWohByAFQQFqIQUMAQsLIAYgBUEBdBAYC3YBA38gACABRgRAQQEPCyABRUEBIAAbBEBBAA8LIAAQNSICIAEQNUcEQEEADwsCfyAAIQMgAiEAA0AgACICQQFrIQAgAgRAIAMvAQAiAiABLwEAIgRHBEAgAiAEawwDCyADQQJqIQMgAUECaiEBDAELC0EAC0ULrAIBAn8gACABQQF0aiEDIAIhAQNAIAAgA0kEQCAALwEAIgJBgAFJBH8gASACOgAAIAFBAWoFIAJBgBBJBH8gASACQQZ2QcABciACQT9xQYABckEIdHI7AQAgAUECagUgAyAAQQJqS0EAIAJBgPgDcUGAsANGGwRAIAAvAQIiBEGA+ANxQYC4A0YEQCABIAJB/wdxQQp0QYCABGogBEH/B3FyIgJBP3FBgAFyQRh0IAJBBnZBP3FBgAFyQRB0ciACQQx2QT9xQYABckEIdHIgAkESdkHwAXJyNgIAIAFBBGohASAAQQRqIQAMBQsLIAEgAkEMdkHgAXIgAkEGdkE/cUGAAXJBCHRyOwEAIAEgAkE/cUGAAXI6AAIgAUEDagsLIQEgAEECaiEADAELCwtSAQN/AkAgAEGQOSAAGyIDEDVBAXQiAiABQZA5IAEbIgEQNUEBdCIEaiIARQRAQbA5IQAMAQsgAEEBEBIiACADIAIQEyAAIAJqIAEgBBATCyAAC4ECAQN/IAEQNyICQdA3EDgEf0EBBSACQfA3EDgLBEBBACEBIAAiAiACQRRrKAIQaiEDA0AgAiADSQRAIAIvAQAiBEGAAUkEfyABQQFqBSAEQYAQSQR/IAFBAmoFIAMgAkECaktBACAEQYD4A3FBgLADRhsEQCACLwECQYD4A3FBgLgDRgRAIAFBBGohASACQQRqIQIMBQsLIAFBA2oLCyEBIAJBAmohAgwBCwsgAUEAEBIhASAAIAAQNSABEDkgAQ8LIAJBkDgQOAR/QQEFIAJBsDgQOAsEQCAAEB5BABASIgEgACAAEDVBAXQQEyABDwtB0DggARA6QdA5QShBAxAAAAuWAgEEfwJAAkACQAJAIwRBAWsOAwECAwALAAtBACECCyABKAIIIQMLIAJBAE5BACABIgQoAggiAUEAShsEfyADQQBIBH8gASADIAJragUgA0EASgR/IAG3RAAAAAAAAAAAIAMgAmu3paSqBUEACwsFQQALIgZBAEoEQCAAIAYQJSAAKAIQIQcgBCgCCCEFIAJBAEgEfyACIAVqIgFBACABQQBKGwUgAiAFIAIgBUgbCyEBIANBAEgEfyADIAVqIgJBACACQQBKGwUgAyAFIAMgBUgbCyECQQxBBBASIgMgBCgCADYCACADIAEgBCgCBGo2AgQgAyACIAEgASACSBsgAWs2AgggByADIAAoAggQJCAAIAYQLAsLOwECfyAAKAIIIgEgACgCFCICKAIITwRAQdAKQbAMQTNBMhAAAAsgASACKAIEaiwAACEBIABBARAsIAELPAECfyAAKAIIIgEgACgCFCICKAIITwRAQdAKQbAMQcgAQTIQAAALIAEgAigCBGotAAAhASAAQQEQLCABCwkAIAAQPkEARwtJAQF/IAFBAE4EQCABIAAoAghqIgIgACgCBEEBakwEQCAAKAIQIAAoAgggAhAoIQIgACABECwgAg8LC0HQCkGQOkHtA0EFEAAAC8QCAQV/IAAgACABaiIDSwRAQQBB0DpB7QVBBxAAAAsgAUEBdEEBEBIiBSEBA0AgACADSQRAAkAgAC0AACECIABBAWohACACQYABcQRAIAAgA0YNASAALQAAQT9xIQQgAEEBaiEAIAJB4AFxQcABRgRAIAEgBCACQR9xQQZ0cjsBAAUgACADRg0CIAAtAABBP3EhBiAAQQFqIQAgAkHwAXFB4AFGBEAgBiACQQ9xQQx0IARBBnRyciECBSAAIANGDQMgAC0AAEE/cSACQQdxQRJ0IARBDHRyIAZBBnRyciECIABBAWohAAsgAkGAgARJBEAgASACOwEABSABIAJBgIAEayICQQp2QYCwA3IgAkH/B3FBgLgDckEQdHI2AgAgAUECaiEBCwsFIAEgAjsBAAsgAUECaiEBDAILCwsgBSABIAVrEBgLkwEBBH9BsDkhAiAAECkiACgCCCEEA0AgASAESARAIAEgACgCCE8EQEHQCkHwDEGfAUEtEAAACyABIAAoAgRqLQAAIgNBzAgoAgBPBEBB0ApBkAtB3ABBKhAAAAtBxAgoAgAgA0ECdGooAgAiA0UEQEGAO0GQC0HgAEEoEAAACyACIAMQOiECIAFBAWohAQwBCwsgAguIAQACQAJAAkACQCMEDgMBAgMACwALQQAhAQtBgCAhAgsCfyAARQRAQRhBBRASIQALIAALQQAQGyAAQQAQAiAAQQAQAyAAQQAQDCAAQQAQDSAAQQAQICAAIAIQGyAAIAEgAhAcEAwgACAAKAIMEB0QDSAAKAIQKAIAIQFBASQEIAAgARAfECAgAAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBAhAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0ECakhyBEBB0ApBsAxB9ABBBxAAAAsgAyAEKAIEaiACBH8gAQUgARAxCzsBACAAQQIQLAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBAhAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0ECakhyBEBB0ApBsAxBhwFBBxAAAAsgAyAEKAIEaiACBH8gAQUgARAyCzsBACAAQQIQLAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBBBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EEakhyBEBB0ApBsAxB+wBBBxAAAAsgAyAEKAIEaiACBH8gAQUgARAzCzYCACAAQQQQLAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBBBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EEakhyBEBB0ApBsAxBjgFBBxAAAAsgAyAEKAIEaiACBH8gAQUgARAzCzYCACAAQQQQLAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBCBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EIakhyBEBB0ApBsAxBpwFBBxAAAAsgAyAEKAIEaiACBH4gAQUgARA0CzcDACAAQQgQLAtrAQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBCBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EIakhyBEBB0ApBsAxBrgFBBxAAAAsgAyAEKAIEaiACBH4gAQUgARA0CzcDACAAQQgQLAt3AQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBBBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EEakhyBEBB0ApBsAxB3wBBBxAAAAsgAgRAIAMgBCgCBGogATgCAAUgAyAEKAIEaiABvBAzNgIACyAAQQQQLAt3AQJ/AkACQAJAIwRBAWsOAgECAAsAC0EAIQILIABBCBAlIAAoAggiA0EfdiAAKAIUIgQoAgggA0EIakhyBEBB0ApBsAxB5wBBBxAAAAsgAgRAIAMgBCgCBGogATkDAAUgAyAEKAIEaiABvRA0NwMACyAAQQgQLAtYAQF/AkACQAJAIwRBAWsOAgECAAsAC0HQNyECCyABIAIQOyEBQQEkBCABEB4hA0EMQQQQEiICIAE2AgAgAiADNgIIIAIgATYCBEEBJAQgACACQQBBABA8C2sBAn8CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQJqSHIEQEHQCkGwDEE6QQcQAAALIAIgAygCBGouAQAhAiABRQRAIAIQMSECCyAAQQIQLCACQRB0QRB1C2sBAn8CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQJqSHIEQEHQCkGwDEHPAEEHEAAACyACIAMoAgRqLwEAIQIgAUUEQCACEDIhAgsgAEECECwgAkH//wNxC2YBAn8CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQRqSHIEQEHQCkGwDEHCAEEHEAAACyACIAMoAgRqKAIAIQIgAUUEQCACEDMhAgsgAEEEECwgAgtmAQJ/AkACQAJAIwQOAgECAAsAC0EAIQELIAAoAggiAkEfdiAAKAIUIgMoAgggAkEEakhyBEBB0ApBsAxB1wBBBxAAAAsgAiADKAIEaigCACECIAFFBEAgAhAzIQILIABBBBAsIAILaAICfwF+AkACQAJAIwQOAgECAAsAC0EAIQELIAAoAggiAkEfdiAAKAIUIgMoAgggAkEIakhyBEBB0ApBsAxBlwFBBxAAAAsgAiADKAIEaikDACEEIAFFBEAgBBA0IQQLIABBCBAsIAQLaAICfwF+AkACQAJAIwQOAgECAAsAC0EAIQELIAAoAggiAkEfdiAAKAIUIgMoAgggAkEIakhyBEBB0ApBsAxBnwFBBxAAAAsgAiADKAIEaikDACEEIAFFBEAgBBA0IQQLIABBCBAsIAQLbwICfwF9AkACQAJAIwQOAgECAAsAC0EAIQELIAAoAggiAkEfdiAAKAIUIgMoAgggAkEEakhyBEBB0ApBsAxBI0EHEAAACyABBH0gAiADKAIEaioCAAUgAiADKAIEaigCABAzvgshBCAAQQQQLCAEC28CAn8BfAJAAkACQCMEDgIBAgALAAtBACEBCyAAKAIIIgJBH3YgACgCFCIDKAIIIAJBCGpIcgRAQdAKQbAMQSxBBxAAAAsgAQR8IAIgAygCBGorAwAFIAIgAygCBGopAwAQNL8LIQQgAEEIECwgBAuRAQACQAJAAkAjBEEBaw4CAQIACwALQdA3IQILIAAgARBAKAIAIQECQCACEDciAEHQNxA4BH9BAQUgAEHwNxA4CwRAIAEgARAeEEEhAAwBCyAAQZA4EDgEf0EBBSAAQbA4EDgLBEAgARAeQX5xIgJBARASIgAgASACEBMMAQtB0DggAhA6QdA5QT1BAxAAAAsgAAsKACAAKAIEQQNxC1IBAX8gABAXIgFFBEBBACAAQfw9SSAAKAIIG0UEQEEAQbAJQeUAQRIQAAALDwsgACgCCCIARQRAQQBBsAlB6QBBEBAAAAsgASAAEAMgACABEA8LNAEBfyAABEAgAEEUayIBEFZBA0YEQEGAPEGwCUG1AUEHEAAACyABEFcgASMHQQMQEAsgAAsyACAARQRADwsgAEEUayIAEFZBA0cEQEHgPEGwCUHDAUEFEAAACyAAEFcgACMBIwIQEAuuAgEFf0HQChBbQcALEFtBgDsQW0HwCBBbQYA8EFtB4DwQW0GwDRBbQcAIEFsjByIBEBchAANAIAAgAUcEQCAAEFZBA0cEQEEAQbAJQdUBQRAQAAALIABBFGoQXSAAEBchAAwBCwsjAkUhAyMIIgQQFyEAA0AgACAERwRAIAAQViADRwRAQQBBsAlB3wFBEBAAAAsgAEEUahBdIAAQFyEADAELCyMBIgIQFyEAA0AgACACRwRAIAAQViMCRwRAQQBBsAlB6AFBEBAAAAsgABAXIQEgAEH8PUkEQCAAQQAQAiAAQQAQAwUjAyAAEBFrJAMgAEEEaiIAQfw9TwRAIwBFBEAQBwsjACAAEBQQFQsLIAEhAAwBCwsgAiACEAIgAiACEAMgBCQBIAIkCCADJAILJQAgAEUEQA8LIABBFGsiABBWIwJGBEAgABBXIAAjCCMCRRAQCwsQACAAKAIAIgAEQCAAEFsLC5YBAQN/AkACQAJAAkACQAJAAkACQCAAQQhrKAIADgkAAQYCBwMGBwQFCw8LDwsgACgCBCIBIAAoAgxBAnRqIQIDQCABIAJJBEAgASgCACIDBEAgAxBbCyABQQRqIQEMAQsLIAAoAgAQWw8LIAAoAhAiAQRAIAEQWwsgACgCFCIABEAgABBbCw8LDwsACyAAEFwPCyAAEFwLBgAgACQECxIAEBpBsDwQDiQHQZA9EA4kCAsLlypRAEGMCAsBHABBrAgLASwAQbgICw4DAAAAEAAAACAEAAAgBABB3AgLATwAQegICy8BAAAAKAAAAEEAbABsAG8AYwBhAHQAaQBvAG4AIAB0AG8AbwAgAGwAYQByAGcAZQBBnAkLATwAQagJCyUBAAAAHgAAAH4AbABpAGIALwByAHQALwB0AGMAbQBzAC4AdABzAEHcCQsBPABB6AkLJQEAAAAeAAAAfgBsAGkAYgAvAHIAdAAvAHQAbABzAGYALgB0AHMAQbwKCwE8AEHICgsrAQAAACQAAABJAG4AZABlAHgAIABvAHUAdAAgAG8AZgAgAHIAYQBuAGcAZQBB/AoLASwAQYgLCyEBAAAAGgAAAH4AbABpAGIALwBhAHIAcgBhAHkALgB0AHMAQawLCwEsAEG4CwsjAQAAABwAAABJAG4AdgBhAGwAaQBkACAAbABlAG4AZwB0AGgAQdwLCwE8AEHoCwstAQAAACYAAAB+AGwAaQBiAC8AYQByAHIAYQB5AGIAdQBmAGYAZQByAC4AdABzAEGcDAsBPABBqAwLJwEAAAAgAAAAfgBsAGkAYgAvAGQAYQB0AGEAdgBpAGUAdwAuAHQAcwBB3AwLATwAQegMCysBAAAAJAAAAH4AbABpAGIALwB0AHkAcABlAGQAYQByAHIAYQB5AC4AdABzAEGcDQsCTAMAQagNC7YGCAAAADADAADfAFMAUwAAAEkBvAJOAAAA8AFKAAwDAACQA5kDCAMBA7ADpQMIAwEDhwU1BVIFAACWHkgAMQMAAJceVAAIAwAAmB5XAAoDAACZHlkACgMAAJoeQQC+AgAAUB+lAxMDAABSH6UDEwMAA1QfpQMTAwEDVh+lAxMDQgOAHwgfmQMAAIEfCR+ZAwAAgh8KH5kDAACDHwsfmQMAAIQfDB+ZAwAAhR8NH5kDAACGHw4fmQMAAIcfDx+ZAwAAiB8IH5kDAACJHwkfmQMAAIofCh+ZAwAAix8LH5kDAACMHwwfmQMAAI0fDR+ZAwAAjh8OH5kDAACPHw8fmQMAAJAfKB+ZAwAAkR8pH5kDAACSHyofmQMAAJMfKx+ZAwAAlB8sH5kDAACVHy0fmQMAAJYfLh+ZAwAAlx8vH5kDAACYHygfmQMAAJkfKR+ZAwAAmh8qH5kDAACbHysfmQMAAJwfLB+ZAwAAnR8tH5kDAACeHy4fmQMAAJ8fLx+ZAwAAoB9oH5kDAAChH2kfmQMAAKIfah+ZAwAAox9rH5kDAACkH2wfmQMAAKUfbR+ZAwAAph9uH5kDAACnH28fmQMAAKgfaB+ZAwAAqR9pH5kDAACqH2ofmQMAAKsfax+ZAwAArB9sH5kDAACtH20fmQMAAK4fbh+ZAwAArx9vH5kDAACyH7ofmQMAALMfkQOZAwAAtB+GA5kDAAC2H5EDQgMAALcfkQNCA5kDvB+RA5kDAADCH8ofmQMAAMMflwOZAwAAxB+JA5kDAADGH5cDQgMAAMcflwNCA5kDzB+XA5kDAADSH5kDCAMAA9MfmQMIAwED1h+ZA0IDAADXH5kDCANCA+IfpQMIAwAD4x+lAwgDAQPkH6EDEwMAAOYfpQNCAwAA5x+lAwgDQgPyH/ofmQMAAPMfqQOZAwAA9B+PA5kDAAD2H6kDQgMAAPcfqQNCA5kD/B+pA5kDAAAA+0YARgAAAAH7RgBJAAAAAvtGAEwAAAAD+0YARgBJAAT7RgBGAEwABftTAFQAAAAG+1MAVAAAABP7RAVGBQAAFPtEBTUFAAAV+0QFOwUAABb7TgVGBQAAF/tEBT0FAEHsEwuABAcICQoLDAYGBgYGBgYGBgYNBgYOBgYGBgYGBgYPEBESBhMGBgYGBgYGBgYGFBUGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYWFwYGBhgGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBhkGBgYGGgYGBgYGBgYbBgYGBgYGBgYGBgYcBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBh0GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBh4GBgYGBgYGBgYGBgYGBgYGBgYGBgYGAEHbGAsUJCsrKysrKysrAQBUVlZWVlZWVlYAQYIZC58DGAAAACsrKysrKysHKytbVlZWVlZWVkpWVgUxUDFQMVAxUDFQMVAxUDFQJFB5MVAxUDE4UDFQMVAxUDFQMVAxUDFQTjECTg0NTgNOACRuAE4xJm5RTiRQTjkUgRsdHVMxUDFQDTFQMVAxUBtTJFAxAlx7XHtce1x7XHsUeVx7XHtcLStJA0gDeFx7FACWCgErKAYGACoGKiorB7u1Kx4AKwcrKysBKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysBKysrKysrKysrKysrKysrKysrKysrKysqKysrKysrKysrKysrK81GzSsAJSsHAQYBVVZWVlZWVVZWAiSBgYGBgRWBgYEAACsAstGy0bLRstEAAM3MAQDX19fX14OBgYGBgYGBgYGBrKysrKysrKysrBwAAAAAADFQMVAxUDFQMVAxAgAAMVAxUDFQMVAxUDFQMVAxUDFQTjFQMVBOMVAxUDFQMVAxUDFQMVAxAoemh6aHpoemh6aHpoemh6YqKysrKysrKysrKysrAAAAVFZWVlZWVlZWVlZWVgBB/xwLIVRWVlZWVlZWVlZWVlYMAAwqKysrKysrKysrKysrKwcqAQBB1R0LdyorKysrKysrKysrKysrKysrKysrKysrKysrK1ZWbIEVACsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKwdsA0ErK1ZWVlZWVlZWVlZWVlZWLFYrKysrKysrKysrKysrKysrKysrKysBAEH0HgsIDGwAAAAAAAYAQaIfC+gCBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiVWep4mBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBgErK09WViwrf1ZWOSsrVVZWKytPVlYsK39WVoE3dVt7XCsrT1ZWAqwEAAA5KytVVlYrK09WViwrK1ZWMhOBVwBvgX7J134tgYEOfjl/b1cAgYF+FQB+AysrKysrKysrKysrKwcrJCuXKysrKysrKysrKisrKysrVlZWVlaAgYGBgTm7KisrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysBgYGBgYGBgYGBgYGBgYGByaysrKysrKysrKysrKysrNANAE4xArTBwdfXJFAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUNfXU8FH1NfX1wUrKysrKysrKysrKysHAQABAEHlIgsfTjFQMVAxUDFQMVAxUDFQDQAAAAAAJFAxUDFQMVAxUABBpiMLVisrKysrKysrKysreVx7XHtPe1x7XHtce1x7XHtce1x7XHtce1wtKyt5FFx7XC15KlwnXHtce1x7pAAKtFx7XHtPA3g4KysrKysrKysrKysrK08tKysBAEGXJAsBSABBoSQLGyorKysrKysrKysrKysrKysrKysrKysrKysrKwBB3SQLFCsrKysrKysrBwBIVlZWVlZWVlYCAEGoJQsbKysrKysrKysrKysrK1VWVlZWVlZWVlZWVlYOAEHiJQsaJCsrKysrKysrKysrBwBWVlZWVlZWVlZWVlYAQagmCyckKysrKysrKysrKysrKysrKwcAAAAAVlZWVlZWVlZWVlZWVlZWVlYAQYknCxYqKysrKysrKysrK1ZWVlZWVlZWVlYOAEG/JwsWKisrKysrKysrKytWVlZWVlZWVlZWDgBBgCgLFysrKysrKysrKysrVVZWVlZWVlZWVlYOAEHZKAsICAAAVgEAADkAQegoC7wHASAAAADg//8Avx0AAOcCAAB5AAACJAAAAQEAAAD///8AAAAAAQIAAAD+//8BOf//ABj//wGH//8A1P7/AMMAAAHSAAABzgAAAc0AAAFPAAABygAAAcsAAAHPAAAAYQAAAdMAAAHRAAAAowAAAdUAAACCAAAB1gAAAdoAAAHZAAAB2wAAADgAAAMAAAAAsf//AZ///wHI//8CKCQAAAAAAAEBAAAA////ADP//wAm//8Bfv//ASsqAAFd//8BKCoAAD8qAAE9//8BRQAAAUcAAAAfKgAAHCoAAB4qAAAu//8AMv//ADb//wA1//8AT6UAAEulAAAx//8AKKUAAESlAAAv//8ALf//APcpAABBpQAA/SkAACv//wAq//8A5ykAAEOlAAAqpQAAu///ACf//wC5//8AJf//ABWlAAASpQACJEwAAAAAAAEgAAAA4P//AQEAAAD///8AVAAAAXQAAAEmAAABJQAAAUAAAAE/AAAA2v//ANv//wDh//8AwP//AMH//wEIAAAAwv//AMf//wDR//8Ayv//APj//wCq//8AsP//AAcAAACM//8BxP//AKD//wH5//8CGnAAAQEAAAD///8BIAAAAOD//wFQAAABDwAAAPH//wAAAAABMAAAAND//wEBAAAA////AAAAAADACwABYBwAAAAAAAHQlwABCAAAAPj//wIFigAAAAAAAUD0/wCe5/8AwokAANvn/wCS5/8Ak+f/AJzn/wCd5/8ApOf/AAAAAAA4igAABIoAAOYOAAEBAAAA////AAAAAADF//8BQeL/Ah2PAAAIAAAB+P//AAAAAABWAAABqv//AEoAAABkAAAAgAAAAHAAAAB+AAAACQAAAbb//wH3//8A2+P/AZz//wGQ//8BgP//AYL//wIFrAAAAAAAARAAAADw//8BHAAAAQEAAAGj4v8BQd//Abrf/wDk//8CC7EAAQEAAAD///8BMAAAAND//wAAAAABCdb/ARrx/wEZ1v8A1dX/ANjV/wHk1f8BA9b/AeHV/wHi1f8BwdX/AAAAAACg4/8AAAAAAQEAAAD///8CDLwAAAAAAAEBAAAA////Abxa/wGgAwAB/HX/Adha/wAwAAABsVr/AbVa/wG/Wv8B7lr/AdZa/wHrWv8B0P//Ab1a/wHIdf8AAAAAADBo/wBg/P8AAAAAASAAAADg//8AAAAAASgAAADY//8AAAAAAUAAAADA//8AAAAAASAAAADg//8AAAAAASAAAADg//8AAAAAASIAAADe//8AQaUwCwUGJ1FvdwBBtDALEnwAAH8AAAAAAAAAAIOOkpcAqgBB0DALArTEAEHKMQsGxskAAADbAEGjMgsO3gAAAADhAAAAAAAAAOQAQbwyCwHnAEGSMwsB6gBBjTQLAe0AQaQ0C5ADMAwxDXgOfw+AEIERhhKJE4oTjhSPFZAWkxOUF5UYlhmXGpobnBmdHJ4dnx6mH6kfrh+xILIgtyG/IsUjyCPLI90k8iP2JfcmIC06Lj0vPjA/MUAxQzJEM0U0UDVRNlI3UzhUOVk6WztcPGE9Yz5lP2ZAaEFpQmpAa0NsRG9CcUVyRnVHfUiCSYdKiUuKTItMjE2STp1PnlBFV3sdfB19HX9YhlmIWolailqMW45cj1ysXa1erl6vXsJfzGDNYc5hz2LQY9Fk1WXWZtdn8GjxafJq82v0bPVt+W79Lf4t/y1QaVFpUmlTaVRpVWlWaVdpWGlZaVppW2lcaV1pXmlfaYIAgwCEAIUAhgCHAIgAiQDAdc92gImBioKLhYyGjXCdcZ12nneeeJ95n3qge6B8oX2hs6K6o7ujvKS+pcOizKTaptum5Wrqp+un7G7zovio+aj6qfup/KQmsCqxK7JOs4QIYrpju2S8Zb1mvm2/bsBvwXDCfsN/w33PjdCU0avSrNOt1LDVsday18TYxdnG2gBBvDcLARwAQcg3Cw8BAAAACAAAAFUAVABGADgAQdw3CwEcAEHoNwsRAQAAAAoAAABVAFQARgAtADgAQfw3CwEcAEGIOAsRAQAAAAoAAABVAFQARgAxADYAQZw4CwEcAEGoOAsTAQAAAAwAAABVAFQARgAtADEANgBBvDgLATwAQcg4CzEBAAAAKgAAAFUAbgBzAHUAcABwAG8AcgB0AGUAZAAgAGUAbgBjAG8AZABpAG4AZwAgAEH8OAsBHABBiDkLDwEAAAAIAAAAbgB1AGwAbABBnDkLARwAQag5CwEBAEG8OQsBPABByDkLKQEAAAAiAAAAYQBzAHMAZQBtAGIAbAB5AC8AdQB0AGkAbABzAC4AdABzAEH8OQsBPABBiDoLKQEAAAAiAAAAYQBzAHMAZQBtAGIAbAB5AC8AaQBuAGQAZQB4AC4AdABzAEG8OgsBLABByDoLIwEAAAAcAAAAfgBsAGkAYgAvAHMAdAByAGkAbgBnAC4AdABzAEHsOgsBfABB+DoLZQEAAABeAAAARQBsAGUAbQBlAG4AdAAgAHQAeQBwAGUAIABtAHUAcwB0ACAAYgBlACAAbgB1AGwAbABhAGIAbABlACAAaQBmACAAYQByAHIAYQB5ACAAaQBzACAAaABvAGwAZQB5AEHsOwsBPABB+DsLMQEAAAAqAAAATwBiAGoAZQBjAHQAIABhAGwAcgBlAGEAZAB5ACAAcABpAG4AbgBlAGQAQcw8CwE8AEHYPAsvAQAAACgAAABPAGIAagBlAGMAdAAgAGkAcwAgAG4AbwB0ACAAcABpAG4AbgBlAGQAQbA9Cw0JAAAAIAAAAAAAAAAgAEHMPQsNAkEAAAAAAABBAAAAAgBB7D0LCUEAAAACAAAApA==";

// Runtime header offsets
const ID_OFFSET = -8;
const SIZE_OFFSET = -4;

// Runtime ids
const ARRAYBUFFER_ID = 0;
const STRING_ID = 1;
// const ARRAYBUFFERVIEW_ID = 2;

// Runtime type information
const ARRAYBUFFERVIEW = 1 << 0;
const ARRAY = 1 << 1;
const STATICARRAY = 1 << 2;
// const SET = 1 << 3;
// const MAP = 1 << 4;
const VAL_ALIGN_OFFSET = 6;
// const VAL_ALIGN = 1 << VAL_ALIGN_OFFSET;
const VAL_SIGNED = 1 << 11;
const VAL_FLOAT = 1 << 12;
// const VAL_NULLABLE = 1 << 13;
const VAL_MANAGED = 1 << 14;
// const KEY_ALIGN_OFFSET = 15;
// const KEY_ALIGN = 1 << KEY_ALIGN_OFFSET;
// const KEY_SIGNED = 1 << 20;
// const KEY_FLOAT = 1 << 21;
// const KEY_NULLABLE = 1 << 22;
// const KEY_MANAGED = 1 << 23;

// Array(BufferView) layout
const ARRAYBUFFERVIEW_BUFFER_OFFSET = 0;
const ARRAYBUFFERVIEW_DATASTART_OFFSET = 4;
const ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8;
const ARRAYBUFFERVIEW_SIZE = 12;
const ARRAY_LENGTH_OFFSET = 12;
const ARRAY_SIZE = 16;

const BIGINT = typeof BigUint64Array !== "undefined";
const THIS = Symbol();

const STRING_DECODE_THRESHOLD = 32;
const decoder = new TextDecoder("utf-16le");

/** Gets a string from an U32 and an U16 view on a memory. */
function getStringImpl(buffer, ptr) {
  const len = new Uint32Array(buffer)[ptr + SIZE_OFFSET >>> 2] >>> 1;
  const arr = new Uint16Array(buffer, ptr, len);
  if (len <= STRING_DECODE_THRESHOLD) {
    return String.fromCharCode.apply(String, arr);
  }
  return decoder.decode(arr);
}

/** Prepares the base module prior to instantiation. */
function preInstantiate(imports) {
  const extendedExports = {};

  function getString(memory, ptr) {
    if (!memory) return "<yet unknown>";
    return getStringImpl(memory.buffer, ptr);
  }

  // add common imports used by stdlib for convenience
  const env = (imports.env = imports.env || {});
  env.abort = env.abort || function abort(msg, file, line, colm) {
    const memory = extendedExports.memory || env.memory; // prefer exported, otherwise try imported
    throw Error(`abort: ${getString(memory, msg)} at ${getString(memory, file)}:${line}:${colm}`);
  };
  env.trace = env.trace || function trace(msg, n, ...args) {
    const memory = extendedExports.memory || env.memory;
    console.log(`trace: ${getString(memory, msg)}${n ? " " : ""}${args.slice(0, n).join(", ")}`);
  };
  env.seed = env.seed || Date.now;
  imports.Math = imports.Math || Math;
  imports.Date = imports.Date || Date;

  return extendedExports;
}

const E_NOEXPORTRUNTIME = "Operation requires compiling with --exportRuntime";
const F_NOEXPORTRUNTIME = function() { throw Error(E_NOEXPORTRUNTIME); };

/** Prepares the final module once instantiation is complete. */
function postInstantiate(extendedExports, instance) {
  const exports = instance.exports;
  const memory = exports.memory;
  const table = exports.table;
  const __new = exports.__new || F_NOEXPORTRUNTIME;
  const __pin = exports.__pin || F_NOEXPORTRUNTIME;
  const __unpin = exports.__unpin || F_NOEXPORTRUNTIME;
  const __collect = exports.__collect || F_NOEXPORTRUNTIME;
  const __rtti_base = exports.__rtti_base || ~0; // oob if not present

  extendedExports.__new = __new;
  extendedExports.__pin = __pin;
  extendedExports.__unpin = __unpin;
  extendedExports.__collect = __collect;

  /** Gets the runtime type info for the given id. */
  function getInfo(id) {
    const U32 = new Uint32Array(memory.buffer);
    const count = U32[__rtti_base >>> 2];
    if ((id >>>= 0) >= count) throw Error(`invalid id: ${id}`);
    return U32[(__rtti_base + 4 >>> 2) + id * 2];
  }

  /** Gets and validate runtime type info for the given id for array like objects */
  function getArrayInfo(id) {
    const info = getInfo(id);
    if (!(info & (ARRAYBUFFERVIEW | ARRAY | STATICARRAY))) throw Error(`not an array: ${id}, flags=${info}`);
    return info;
  }

  /** Gets the runtime base id for the given id. */
  function getBase(id) {
    const U32 = new Uint32Array(memory.buffer);
    const count = U32[__rtti_base >>> 2];
    if ((id >>>= 0) >= count) throw Error(`invalid id: ${id}`);
    return U32[(__rtti_base + 4 >>> 2) + id * 2 + 1];
  }

  /** Gets the runtime alignment of a collection's values. */
  function getValueAlign(info) {
    return 31 - Math.clz32((info >>> VAL_ALIGN_OFFSET) & 31); // -1 if none
  }

  /** Gets the runtime alignment of a collection's keys. */
  // function getKeyAlign(info) {
  //   return 31 - Math.clz32((info >>> KEY_ALIGN_OFFSET) & 31); // -1 if none
  // }

  /** Allocates a new string in the module's memory and returns its pointer. */
  function __newString(str) {
    if (str == null) return 0;
    const length = str.length;
    const ptr = __new(length << 1, STRING_ID);
    const U16 = new Uint16Array(memory.buffer);
    for (var i = 0, p = ptr >>> 1; i < length; ++i) U16[p + i] = str.charCodeAt(i);
    return ptr;
  }

  extendedExports.__newString = __newString;

  /** Reads a string from the module's memory by its pointer. */
  function __getString(ptr) {
    if (!ptr) return null;
    const buffer = memory.buffer;
    const id = new Uint32Array(buffer)[ptr + ID_OFFSET >>> 2];
    if (id !== STRING_ID) throw Error(`not a string: ${ptr}`);
    return getStringImpl(buffer, ptr);
  }

  extendedExports.__getString = __getString;

  /** Gets the view matching the specified alignment, signedness and floatness. */
  function getView(alignLog2, signed, float) {
    const buffer = memory.buffer;
    if (float) {
      switch (alignLog2) {
        case 2: return new Float32Array(buffer);
        case 3: return new Float64Array(buffer);
      }
    } else {
      switch (alignLog2) {
        case 0: return new (signed ? Int8Array : Uint8Array)(buffer);
        case 1: return new (signed ? Int16Array : Uint16Array)(buffer);
        case 2: return new (signed ? Int32Array : Uint32Array)(buffer);
        case 3: return new (signed ? BigInt64Array : BigUint64Array)(buffer);
      }
    }
    throw Error(`unsupported align: ${alignLog2}`);
  }

  /** Allocates a new array in the module's memory and returns its pointer. */
  function __newArray(id, values) {
    const info = getArrayInfo(id);
    const align = getValueAlign(info);
    const length = values.length;
    const buf = __new(length << align, info & STATICARRAY ? id : ARRAYBUFFER_ID);
    let result;
    if (info & STATICARRAY) {
      result = buf;
    } else {
      const arr = __new(info & ARRAY ? ARRAY_SIZE : ARRAYBUFFERVIEW_SIZE, id);
      const U32 = new Uint32Array(memory.buffer);
      U32[arr + ARRAYBUFFERVIEW_BUFFER_OFFSET >>> 2] = buf;
      U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2] = buf;
      U32[arr + ARRAYBUFFERVIEW_DATALENGTH_OFFSET >>> 2] = length << align;
      if (info & ARRAY) U32[arr + ARRAY_LENGTH_OFFSET >>> 2] = length;
      result = arr;
    }
    const view = getView(align, info & VAL_SIGNED, info & VAL_FLOAT);
    if (info & VAL_MANAGED) {
      for (let i = 0; i < length; ++i) {
        const value = values[i];
        view[(buf >>> align) + i] = value;
      }
    } else {
      view.set(values, buf >>> align);
    }
    return result;
  }

  extendedExports.__newArray = __newArray;

  /** Gets a live view on an array's values in the module's memory. Infers the array type from RTTI. */
  function __getArrayView(arr) {
    const U32 = new Uint32Array(memory.buffer);
    const id = U32[arr + ID_OFFSET >>> 2];
    const info = getArrayInfo(id);
    const align = getValueAlign(info);
    let buf = info & STATICARRAY
      ? arr
      : U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
    const length = info & ARRAY
      ? U32[arr + ARRAY_LENGTH_OFFSET >>> 2]
      : U32[buf + SIZE_OFFSET >>> 2] >>> align;
    return getView(align, info & VAL_SIGNED, info & VAL_FLOAT).subarray(buf >>>= align, buf + length);
  }

  extendedExports.__getArrayView = __getArrayView;

  /** Copies an array's values from the module's memory. Infers the array type from RTTI. */
  function __getArray(arr) {
    const input = __getArrayView(arr);
    const len = input.length;
    const out = new Array(len);
    for (let i = 0; i < len; i++) out[i] = input[i];
    return out;
  }

  extendedExports.__getArray = __getArray;

  /** Copies an ArrayBuffer's value from the module's memory. */
  function __getArrayBuffer(ptr) {
    const buffer = memory.buffer;
    const length = new Uint32Array(buffer)[ptr + SIZE_OFFSET >>> 2];
    return buffer.slice(ptr, ptr + length);
  }

  extendedExports.__getArrayBuffer = __getArrayBuffer;

  /** Copies a typed array's values from the module's memory. */
  function getTypedArray(Type, alignLog2, ptr) {
    return new Type(getTypedArrayView(Type, alignLog2, ptr));
  }

  /** Gets a live view on a typed array's values in the module's memory. */
  function getTypedArrayView(Type, alignLog2, ptr) {
    const buffer = memory.buffer;
    const U32 = new Uint32Array(buffer);
    const bufPtr = U32[ptr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
    return new Type(buffer, bufPtr, U32[bufPtr + SIZE_OFFSET >>> 2] >>> alignLog2);
  }

  /** Attach a set of get TypedArray and View functions to the exports. */
  function attachTypedArrayFunctions(ctor, name, align) {
    extendedExports[`__get${name}`] = getTypedArray.bind(null, ctor, align);
    extendedExports[`__get${name}View`] = getTypedArrayView.bind(null, ctor, align);
  }

  [
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array
  ].forEach(ctor => {
    attachTypedArrayFunctions(ctor, ctor.name, 31 - Math.clz32(ctor.BYTES_PER_ELEMENT));
  });

  if (BIGINT) {
    [BigUint64Array, BigInt64Array].forEach(ctor => {
      attachTypedArrayFunctions(ctor, ctor.name.slice(3), 3);
    });
  }

  /** Tests whether an object is an instance of the class represented by the specified base id. */
  function __instanceof(ptr, baseId) {
    const U32 = new Uint32Array(memory.buffer);
    let id = U32[ptr + ID_OFFSET >>> 2];
    if (id <= U32[__rtti_base >>> 2]) {
      do {
        if (id == baseId) return true;
        id = getBase(id);
      } while (id);
    }
    return false;
  }

  extendedExports.__instanceof = __instanceof;

  // Pull basic exports to extendedExports so code in preInstantiate can use them
  extendedExports.memory = extendedExports.memory || memory;
  extendedExports.table  = extendedExports.table  || table;

  // Demangle exports and provide the usual utility on the prototype
  return demangle(exports, extendedExports);
}

function isResponse(src) {
  return typeof Response !== "undefined" && src instanceof Response;
}

function isModule(src) {
  return src instanceof WebAssembly.Module;
}

/** Asynchronously instantiates an AssemblyScript module from anything that can be instantiated. */
async function instantiate(source, imports = {}) {
  if (isResponse(source = await source)) return instantiateStreaming(source, imports);
  const module = isModule(source) ? source : await WebAssembly.compile(source);
  const extended = preInstantiate(imports);
  const instance = await WebAssembly.instantiate(module, imports);
  const exports = postInstantiate(extended, instance);
  return { module, instance, exports };
}

/** Asynchronously instantiates an AssemblyScript module from a response, i.e. as obtained by `fetch`. */
async function instantiateStreaming(source, imports = {}) {
  if (!WebAssembly.instantiateStreaming) {
    return instantiate(
      isResponse(source = await source)
        ? source.arrayBuffer()
        : source,
      imports
    );
  }
  const extended = preInstantiate(imports);
  const result = await WebAssembly.instantiateStreaming(source, imports);
  const exports = postInstantiate(extended, result.instance);
  return { ...result, exports };
}

/** Demangles an AssemblyScript module's exports to a friendly object structure. */
function demangle(exports, extendedExports = {}) {
  const setArgumentsLength = exports["__argumentsLength"]
    ? length => { exports["__argumentsLength"].value = length; }
    : exports["__setArgumentsLength"] || exports["__setargc"] || (() => { /* nop */ });
  for (let internalName in exports) {
    if (!Object.prototype.hasOwnProperty.call(exports, internalName)) continue;
    const elem = exports[internalName];
    let parts = internalName.split(".");
    let curr = extendedExports;
    while (parts.length > 1) {
      let part = parts.shift();
      if (!Object.prototype.hasOwnProperty.call(curr, part)) curr[part] = {};
      curr = curr[part];
    }
    let name = parts[0];
    let hash = name.indexOf("#");
    if (hash >= 0) {
      const className = name.substring(0, hash);
      const classElem = curr[className];
      if (typeof classElem === "undefined" || !classElem.prototype) {
        const ctor = function(...args) {
          return ctor.wrap(ctor.prototype.constructor(0, ...args));
        };
        ctor.prototype = {
          valueOf() { return this[THIS]; }
        };
        ctor.wrap = function(thisValue) {
          return Object.create(ctor.prototype, { [THIS]: { value: thisValue, writable: false } });
        };
        if (classElem) Object.getOwnPropertyNames(classElem).forEach(name =>
          Object.defineProperty(ctor, name, Object.getOwnPropertyDescriptor(classElem, name))
        );
        curr[className] = ctor;
      }
      name = name.substring(hash + 1);
      curr = curr[className].prototype;
      if (/^(get|set):/.test(name)) {
        if (!Object.prototype.hasOwnProperty.call(curr, name = name.substring(4))) {
          let getter = exports[internalName.replace("set:", "get:")];
          let setter = exports[internalName.replace("get:", "set:")];
          Object.defineProperty(curr, name, {
            get() { return getter(this[THIS]); },
            set(value) { setter(this[THIS], value); },
            enumerable: true
          });
        }
      } else {
        if (name === 'constructor') {
          (curr[name] = (...args) => {
            setArgumentsLength(args.length);
            return elem(...args);
          }).original = elem;
        } else { // instance method
          (curr[name] = function(...args) { // !
            setArgumentsLength(args.length);
            return elem(this[THIS], ...args);
          }).original = elem;
        }
      }
    } else {
      if (/^(get|set):/.test(name)) {
        if (!Object.prototype.hasOwnProperty.call(curr, name = name.substring(4))) {
          Object.defineProperty(curr, name, {
            get: exports[internalName.replace("set:", "get:")],
            set: exports[internalName.replace("get:", "set:")],
            enumerable: true
          });
        }
      } else if (typeof elem === "function" && elem !== setArgumentsLength) {
        (curr[name] = (...args) => {
          setArgumentsLength(args.length);
          return elem(...args);
        }).original = elem;
      } else {
        curr[name] = elem;
      }
    }
  }
  return extendedExports;
}

function readAssembly() {
    if (globalThis.atob) {
        const source = globalThis.atob(wasm);
        const { length: sourceLength } = source;
        const bytes = new Uint8Array(sourceLength);
        for (let i = 0; i < sourceLength; i++) {
            bytes[i] = source.charCodeAt(i);
        }
        return bytes.buffer;
    }
    else {
        return Buffer.from(wasm, 'base64');
    }
}
let buffer;
var Buffer$1 = {
    async init() {
        if (buffer)
            return buffer;
        return (buffer = (await instantiate(readAssembly())).exports);
    }
};

/**
 * @module tests
 */
Buffer$1.init().then(({ Buffer, __getUint8Array, __getString, __newString }) => {
    /**
     * @function byteLength
     * @description 获取字符串指定编码字节长度
     * @param {string} input
     * @param {string} [encoding]
     * @returns {number}
     */
    function byteLength(input, encoding = 'UTF8') {
        const buffer = new Buffer();
        buffer.write(__newString(input), __newString(encoding));
        return buffer.length;
    }
    const buffer = new Buffer();
    const desc = `A buffer tool using WebAssembly.`;
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
    buffer.write(__newString(desc));
    buffer.offset = 0;
    console.log(0xaf, '->', buffer.readInt8());
    console.log(0xfa, '->', buffer.readUint8());
    console.log(0x01, '->', buffer.readBoolean());
    console.log(0xfafc, '->', buffer.readInt16());
    console.log(0xfcfa, '->', buffer.readUint16());
    console.log(0xfafbfcfd, '->', buffer.readInt32());
    console.log(0xfdfbfafc, '->', buffer.readUint32());
    console.log(0xf0f1fafbfcfdfeffn, '->', buffer.readInt64());
    console.log(0xfffefdfcfbfaf1f0n, '->', buffer.readUint64());
    console.log(123456.654321, '->', buffer.readFloat32());
    console.log(987654321.123456789, '->', buffer.readFloat64());
    console.log(desc, '->', __getString(buffer.read(byteLength(desc))));
    process.stdout.write(`\r\n${hex(__getUint8Array(buffer.bytes))}`);
});
