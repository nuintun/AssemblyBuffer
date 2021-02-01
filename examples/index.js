/**
 * @module Buffer
 * @license MIT
 * @version 0.0.1
 * @author nuintun
 * @description A buffer tool using WebAssembly.
 * @see https://github.com/nuintun/AssemblyBuffer#readme
 */

(function (factory) {
  typeof define === 'function' && define.amd ? define('buffer', factory) :
  factory();
}((function () { 'use strict';

  /**
   * @module hex
   */
  function zero(num, max) {
      return num.toString(16).toUpperCase().padStart(max, '0');
  }
  function hex(buffer) {
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

  var wasm = "AGFzbQEAAAABVQ9gAX8Bf2ACf38AYAJ/fwF/YAN/f38AYAF/AGAAAGADf39/AX9gBH9/f38AYAN/fn8AYAJ/fwF+YAN/fX8AYAN/fH8AYAF+AX5gAn9/AX1gAn9/AXwCDQEDZW52BWFib3J0AAcDYF8BAQEBAQMFAAIDAgEBAAEDAAIDAAEGAAIBBQECAAAAAQAAAQMBAQAGAAAAAQQBAQEAAAAMAAAAAgMCAgcAAAACAgAGAwMDAwgICgsDAgICAgkJDQ4GAAQABAUEBAQEBQUDAQABBjQKfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38AQQQLfwBBBQt/AUEAC38BQQALfwBBsD0LB/AGMA5VSU5UOF9BUlJBWV9JRAMFBkJ1ZmZlcgMGEkJ1ZmZlciNjb25zdHJ1Y3RvcgBDEUJ1ZmZlciNnZXQ6b2Zmc2V0ACIRQnVmZmVyI3NldDpvZmZzZXQAIxFCdWZmZXIjZ2V0Omxlbmd0aAAhEUJ1ZmZlciNzZXQ6bGVuZ3RoACYRQnVmZmVyI2dldDpidWZmZXIAJxBCdWZmZXIjZ2V0OmJ5dGVzACkYQnVmZmVyI2dldDpyZWFkQXZhaWxhYmxlACoZQnVmZmVyI2dldDpieXRlc0F2YWlsYWJsZQArC0J1ZmZlciNncm93ACULQnVmZmVyI3NlZWsALAxCdWZmZXIjY2xlYXIALRBCdWZmZXIjd3JpdGVJbnQ4AC4RQnVmZmVyI3dyaXRlVWludDgALxNCdWZmZXIjd3JpdGVCb29sZWFuADARQnVmZmVyI3dyaXRlSW50MTYARBJCdWZmZXIjd3JpdGVVaW50MTYARRFCdWZmZXIjd3JpdGVJbnQzMgBGEkJ1ZmZlciN3cml0ZVVpbnQzMgBHEUJ1ZmZlciN3cml0ZUludDY0AEgSQnVmZmVyI3dyaXRlVWludDY0AEkTQnVmZmVyI3dyaXRlRmxvYXQzMgBKE0J1ZmZlciN3cml0ZUZsb2F0NjQASxFCdWZmZXIjd3JpdGVCeXRlcwA8DEJ1ZmZlciN3cml0ZQBMD0J1ZmZlciNyZWFkSW50OAA9EEJ1ZmZlciNyZWFkVWludDgAPhJCdWZmZXIjcmVhZEJvb2xlYW4APxBCdWZmZXIjcmVhZEludDE2AE0RQnVmZmVyI3JlYWRVaW50MTYAThBCdWZmZXIjcmVhZEludDMyAE8RQnVmZmVyI3JlYWRVaW50MzIAUBBCdWZmZXIjcmVhZEludDY0AFERQnVmZmVyI3JlYWRVaW50NjQAUhJCdWZmZXIjcmVhZEZsb2F0MzIAUxJCdWZmZXIjcmVhZEZsb2F0NjQAVBBCdWZmZXIjcmVhZEJ5dGVzAEALQnVmZmVyI3JlYWQAVQ9CdWZmZXIjdG9TdHJpbmcAQgVfX25ldwASBV9fcGluAFgHX191bnBpbgBZCV9fY29sbGVjdABaC19fcnR0aV9iYXNlAwkGbWVtb3J5AgAUX19zZXRBcmd1bWVudHNMZW5ndGgAXggBXwq/SF8JACAAIAE2AgALCQAgACABNgIECwkAIAAgATYCCAuSAgEEfyABKAIAIgJBAXFFBEBBAEHwCUGRAkEOEAAACyACQXxxIgJB/P///wNJQQAgAkEMTxtFBEBBAEHwCUGTAkEOEAAACyACQYACSQRAIAJBBHYhAgUgAkEfIAJnayIDQQRrdkEQcyECIANBB2shAwsgAkEQSUEAIANBF0kbRQRAQQBB8AlBoAJBDhAAAAsgASgCCCEEIAEoAgQiBQRAIAUgBBADCyAEBEAgBCAFEAILIAEgACACIANBBHRqQQJ0aigCYEYEQCAAIAIgA0EEdGpBAnRqIAQ2AmAgBEUEQCAAIANBAnRqIgQoAgRBfiACd3EhASAEIAE2AgQgAUUEQCAAIAAoAgBBfiADd3EQAQsLCwv4AwEHfyABRQRAQQBB8AlByQFBDhAAAAsgASgCACIEQQFxRQRAQQBB8AlBywFBDhAAAAsgAUEEaiABKAIAQXxxaiIFKAIAIgJBAXEEQCAEQXxxQQRqIAJBfHFqIgNB/P///wNJBEACfyAAIAUQBCABIAMgBEEDcXIiBBABIAFBBGogASgCAEF8cWoiBSgCAAshAgsLIARBAnEEQAJ/IAFBBGsoAgAiAygCACIHQQFxRQRAQQBB8AlB4AFBEBAAAAsgB0F8cUEEaiAEQXxxaiIIQfz///8DSQR/IAAgAxAEIAMgCCAHQQNxciIEEAEgAwUgAQsLIQELIAUgAkECchABIARBfHEiA0H8////A0lBACADQQxPG0UEQEEAQfAJQe8BQQ4QAAALIAMgAUEEamogBUcEQEEAQfAJQfABQQ4QAAALIAVBBGsgATYCACADQYACSQRAIANBBHYhAwUgA0EfIANnayIEQQRrdkEQcyEDIARBB2shBgsgA0EQSUEAIAZBF0kbRQRAQQBB8AlBgAJBDhAAAAsgACADIAZBBHRqQQJ0aigCYCEEIAFBABACIAEgBBADIAQEQCAEIAEQAgsgACADIAZBBHRqQQJ0aiABNgJgIAAgACgCAEEBIAZ0chABIAAgBkECdGoiACAAKAIEQQEgA3RyNgIEC9ABAQJ/IAEgAksEQEEAQfAJQf0CQQ4QAAALIAFBE2pBcHFBBGshASACQXBxIQMgACgCoAwiAgRAIAEgAkEEakkEQEEAQfAJQYQDQRAQAAALIAIgAUEQa0YEQAJ/IAIoAgAhBCABQRBrCyEBCwUgASAAQaQMakkEQEEAQfAJQZEDQQUQAAALCyADIAFrIgJBFEkEQA8LIAEgBEECcSACQQhrIgJBAXJyEAEgAUEAEAIgAUEAEAMgAiABQQRqaiICQQIQASAAIAI2AqAMIAAgARAFC5ABAQJ/PwAiAEEBSAR/QQEgAGtAAEEASAVBAAsEQAALQYA+QQAQAUGgygBBADYCAANAIAFBF0kEQCABQQJ0QYA+akEANgIEQQAhAANAIABBEEkEQCAAIAFBBHRqQQJ0QYA+akEANgJgIABBAWohAAwBCwsgAUEBaiEBDAELC0GAPkGkygA/AEEQdBAGQYA+JAALLwAgAEH8////A08EQEHwCEHwCUHOA0EeEAAAC0EMIABBE2pBcHFBBGsgAEEMTRsL3AEBAX8gAUGAAkkEQCABQQR2IQEFQR8gAUEBQRsgAWdrdGpBAWsgASABQf7///8BSRsiAWdrIQIgASACQQRrdkEQcyEBIAJBB2shAgsgAUEQSUEAIAJBF0kbRQRAQQBB8AlBzgJBDhAAAAsgACACQQJ0aigCBEF/IAF0cSIBBH8gACABaCACQQR0akECdGooAmAFIAAoAgBBfyACQQFqdHEiAQR/IAAgAWgiAUECdGooAgQiAkUEQEEAQfAJQdsCQRIQAAALIAAgAmggAUEEdGpBAnRqKAJgBUEACwsLhgEBAn8gASgCACEDIAJBBGpBD3EEQEEAQfAJQekCQQ4QAAALIANBfHEgAmsiBEEQTwRAIAEgAiADQQJxchABIAIgAUEEamoiASAEQQRrQQFyEAEgACABEAUFIAEgA0F+cRABIAFBBGoiACABKAIAQXxxaiAAIAEoAgBBfHFqKAIAQX1xEAELC8IBAQJ/IAAgARAIIgIQCSIBRQRAQQQ/ACIBQRB0QQRrIAAoAqAMR3QgAkEBQRsgAmdrdEEBa2ogAiACQf7///8BSRtqQf//A2pBgIB8cUEQdiEDIAEgAyABIANKG0AAQQBIBEAgA0AAQQBIBEAACwsgACABQRB0PwBBEHQQBiAAIAIQCSIBRQRAQQBB8AlB9ANBEBAAAAsLIAIgASgCAEF8cUsEQEEAQfAJQfYDQQ4QAAALIAAgARAEIAAgASACEAogAQsJACAAIAE2AgwLCQAgACABNgIQCxAAIAAgABACIAAgABADIAALEQAgACABIAAoAgRBA3FyEAILJgEBfyABKAIIIQMgACABIAJyEAIgACADEAMgAyAAEA8gASAAEAMLDQAgACgCAEF8cUEEagtYAQF/IABB7P///wNPBEBB8AhBsAlB/QBBHxAAAAsCfyAAQRBqIQIjAEUEQBAHCyMAIAIQCyICCyABEAwgAiAAEA0gAiMBIwIQECMDIAIQEWokAyACQRRqC2cBAn8CQCACIQQgACABRg0AIAAgAUkEQANAIAQEQCAAIgJBAWohACABIgNBAWohASACIAMtAAA6AAAgBEEBayEEDAELCwUDQCAEBEAgBEEBayIEIABqIAEgBGotAAA6AAAMAQsLCwsLOAEBfyAAQQRrIQEgAEEPcUVBACAAGwR/IAEoAgBBAXFFBUEAC0UEQEEAQfAJQbUEQQMQAAALIAELFAAgASABKAIAQQFyEAEgACABEAULLQAgACACEAsiAkEEaiABQQRqIAEoAgBBfHEQEyABQfw9TwRAIAAgARAVCyACCwoAIAAoAgRBfHELqwIBB38gAEEUayECIABB/D1JBEAgASACKAIMEBIiAyAAIAEgAigCECIAIAAgAUsbEBMgAw8LIAFB7P///wNPBEBB8AhBsAlBjwFBHxAAAAsjAyACEBFrJAMgAEEQayEAIAFBEGohAiMARQRAEAcLIABB/D1JBEAjACAAEBQgAhAWIQAFAkAjACEDIAAQFCEAAkAgAhAIIgUgACgCACIGQXxxIgRNDQAgAEEEaiAAKAIAQXxxaiIHKAIAIghBAXEEQCAFIARBBGogCEF8cWoiBE0EQCADIAcQBCAAIAQgBkEDcXIQAQwCCwsgAyAAIAIQFiEADAELIAMgACAFEAoLCyAAQRRqIgJBFGsiACABEA0gABAXIAAQAyAAKAIIIAAQDyMDIAAQEWokAyACCyUBAX8DQCABBEAgACICQQFqIQAgAkEAOgAAIAFBAWshAQwBCwsL2wEBB39BoAoQDiQBA0AgAUGAAkgEQEEBJARBAkEBEBIiAyABOwEAIAFBzAgoAgBPBEAgAUEASARAQdAKQZALQewAQRYQAAALIAFBAWoiAiEAIAJByAgoAgAiBEECdksEQCAAQf////8ASwRAQcALQZALQQ5BMBAAAAsgBEHACCgCACIGIABBAnQiBRAYIgBqIAUgBGsQGSAAIAZHBEBBwAggADYCAEHECCAANgIAC0HICCAFNgIAC0HACCACEAwLQcQIKAIAIAFBAnRqIAM2AgAgAUEBaiEBDAELCwsJACAAIAE7AQALJAAgACABQf//A3FKBH8gAUH//wNxIgEgACABbbebqmwFIAALC2YBAn8Cf0EMQQQQEiIBRQRAQQxBAhASIQELIAELQQAQASABQQAQAiABQQAQAyAAQfz///8DSwRAQcALQfALQRJBORAAAAsgAEEAEBIiAiAAEBkgASACEAEgASACEAIgASAAEAMgAQsKACAAQRRrKAIQC2wBAn8CQAJAAkAjBEEBaw4DAQECAAsACyAAEB4hAgtBDEEGEBIiAUEAEAEgAUEAEAIgAUEAEAMgABAeIAJJIAJB/P///wNLcgRAQcALQbAMQRlBBxAAAAsgASAAEAEgASAAEAIgASACEAMgAQsJACAAIAE2AhQLBwAgACgCBAsHACAAKAIICxEAIAAgAbcgACgCBLekqhADC0sAIAJBAEgEQEHQCkHwDEHIDkETEAAACyAAKAIIIAIgASgCCGpIBEBB0ApB8AxByQ5BLxAAAAsgAiAAKAIEaiABKAIEIAEoAggQEwtYAQF/IAAoAgS3IAEgACgCCGq3paoiASAAKAIUKAIISgRAIAEgAC8BABAcEB0iAiAAKAIQQQAQJCAAIAIQDSAAIAEQAiACKAIAIQFBASQEIAAgARAfECALCzoBAX8gASAAKAIEayICQQBKBEAgACACECUFIAJBAEgEQCAAIAEQAgsLIAEgACgCCEgEQCAAIAEQAwsLZQEDfyAAKAIEIQFBACAAKAIUKAIAIgMQHiIAIABBAEobIQIgAUEASAR/IAAgAWoiAEEAIABBAEobBSABIAAgACABShsLIAJrIgBBACAAQQBKGyIAQQAQEiIBIAIgA2ogABATIAELdQEBfyAAKAIIIQMgAUEASAR/IAEgA2oiAUEAIAFBAEobBSABIAMgASADSBsLIQEgAkEASAR/IAIgA2oiAkEAIAJBAEobBSACIAMgAiADSBsLIAFrIgJBACACQQBKGyIDEB0iAigCBCABIAAoAgRqIAMQEyACCxAAIAAoAhBBACAAKAIEECgLDQAgACgCBCAAKAIIawsQACAAKAIUKAIIIAAoAghrCw4AIAAgASAAKAIIahAjCzEBAX8gAEEAEAMgAEEAEAIgACAAKAIMEB0QDSAAKAIQKAIAIQFBASQEIAAgARAfECALQAECfyAAQQEQJSAAKAIIIgIgACgCFCIDKAIITwRAQdAKQbAMQe0AQTIQAAALIAIgAygCBGogAToAACAAQQEQLAtAAQJ/IABBARAlIAAoAggiAiAAKAIUIgMoAghPBEBB0ApBsAxBgAFBMhAAAAsgAiADKAIEaiABOgAAIABBARAsCwoAIAAgAUVFEC8LFAAgAEEQdEEYdUH/AXEgAEEIdHILEgAgAEEIdCAAQf//A3FBCHZyCxkAIABBgP6DeHFBCHcgAEH/gfwHcUEIeHILQwAgAEIIiEL/gfyH8J/A/wCDIABC/4H8h/CfwP8Ag0IIhoQiAEIQiEL//4OA8P8/gyAAQv//g4Dw/z+DQhCGhEIgigsNACAAQRRrKAIQQQF2C/0BAQV/IABBCHYiAUGkMGotAAAgAUHsE2otAABB1gBsQewTaiAAQf8BcSIEQQNuai0AACAEQQNwQQJ0QdgoaigCAGxBC3ZBBnBqQQJ0QeQoaigCACIBQQh1IQICQCABQf8BcSIBQQJJDQAgAkH/AXEhASACQQh2IQMDQCABBEAgBCADIAFBAXYiAmpBAXRBpDRqLQAAIgVGBH8gAiADakEBdEGkNGotAAFBAnRB5ChqKAIAIgFBCHUhAiABQf8BcSIBQQJJDQMgAEEBaw8FIAQgBUkEfyACBSACIANqIQMgASACawsLIQEMAQsLIAAPCyAAIAJBACABQQFza3FqC4cEAQp/IAAQNSIIRQRAIAAPCyAIQQZsQQEQEiEGQbANEDUhAwNAIAcgCEkEQCAAIAdBAXRqLwEAIgJBB3YEQAJAIAcgCEEBa0lBACACQf+vA2tBgQhJGwRAIAAgB0EBdGovAQIiBEH/twNrQYEISQRAIAdBAWohByAEQf8HcSACIgFB/wdxQQp0ckGAgARqIgJBgIAITwRAIAYgBUEBdGogASAEQRB0cjYCACAFQQFqIQUMAwsLCyACQdDJAGtBGU0EQCAGIAVBAXRqIAJBGms7AQAFIAJB3wFrQbj0A00EfyADIQFBACEJAkADQCABIAlOBEAgASAJakEDdkECdCIEQQF0QbANai8BACACayIKRQ0CIApBH3YEQCAEQQRqIQkFIARBBGshAQsMAQsLQX8hBAsgBAVBfwsiAUF/cwRAIAFBAXRBsA1qIgEvAQYhAiAGIAVBAXRqIgQgASgCAjYCACAEIAI7AQQgBSACQQBHQQFqaiEFBSACEDZB////AHEiAkGAgARJBEAgBiAFQQF0aiACOwEABSAGIAVBAXRqIAJBgIAEayICQf8HcUGAuANyQRB0IAJBCnZBgLADcnI2AgAgBUEBaiEFCwsLCwUgBiAFQQF0aiACIAJB4QBrQRpJQQV0QX9zcTsBAAsgB0EBaiEHIAVBAWohBQwBCwsgBiAFQQF0EBgLdgEDfyAAIAFGBEBBAQ8LIAFFQQEgABsEQEEADwsgABA1IgIgARA1RwRAQQAPCwJ/IAAhAyACIQADQCAAIgJBAWshACACBEAgAy8BACICIAEvAQAiBEcEQCACIARrDAMLIANBAmohAyABQQJqIQEMAQsLQQALRQusAgECfyAAIAFBAXRqIQMgAiEBA0AgACADSQRAIAAvAQAiAkGAAUkEfyABIAI6AAAgAUEBagUgAkGAEEkEfyABIAJBBnZBwAFyIAJBP3FBgAFyQQh0cjsBACABQQJqBSADIABBAmpLQQAgAkGA+ANxQYCwA0YbBEAgAC8BAiIEQYD4A3FBgLgDRgRAIAEgAkH/B3FBCnRBgIAEaiAEQf8HcXIiAkE/cUGAAXJBGHQgAkEGdkE/cUGAAXJBEHRyIAJBDHZBP3FBgAFyQQh0ciACQRJ2QfABcnI2AgAgAUEEaiEBIABBBGohAAwFCwsgASACQQx2QeABciACQQZ2QT9xQYABckEIdHI7AQAgASACQT9xQYABcjoAAiABQQNqCwshASAAQQJqIQAMAQsLC1IBA38CQCAAQZA5IAAbIgMQNUEBdCICIAFBkDkgARsiARA1QQF0IgRqIgBFBEBBsDkhAAwBCyAAQQEQEiIAIAMgAhATIAAgAmogASAEEBMLIAALgQIBA38gARA3IgJB0DcQOAR/QQEFIAJB8DcQOAsEQEEAIQEgACICIAJBFGsoAhBqIQMDQCACIANJBEAgAi8BACIEQYABSQR/IAFBAWoFIARBgBBJBH8gAUECagUgAyACQQJqS0EAIARBgPgDcUGAsANGGwRAIAIvAQJBgPgDcUGAuANGBEAgAUEEaiEBIAJBBGohAgwFCwsgAUEDagsLIQEgAkECaiECDAELCyABQQAQEiEBIAAgABA1IAEQOSABDwsgAkGQOBA4BH9BAQUgAkGwOBA4CwRAIAAQHkEAEBIiASAAIAAQNUEBdBATIAEPC0HQOCABEDpB0DlBKEEDEAAAC5YCAQR/AkACQAJAAkAjBEEBaw4DAQIDAAsAC0EAIQILIAEoAgghAwsgAkEATkEAIAEiBCgCCCIBQQBKGwR/IANBAEgEfyABIAMgAmtqBSADQQBKBH8gAbdEAAAAAAAAAAAgAyACa7elpKoFQQALCwVBAAsiBkEASgRAIAAgBhAlIAAoAhAhByAEKAIIIQUgAkEASAR/IAIgBWoiAUEAIAFBAEobBSACIAUgAiAFSBsLIQEgA0EASAR/IAMgBWoiAkEAIAJBAEobBSADIAUgAyAFSBsLIQJBDEEEEBIiAyAEKAIANgIAIAMgASAEKAIEajYCBCADIAIgASABIAJIGyABazYCCCAHIAMgACgCCBAkIAAgBhAsCws7AQJ/IAAoAggiASAAKAIUIgIoAghPBEBB0ApBsAxBM0EyEAAACyABIAIoAgRqLAAAIQEgAEEBECwgAQs8AQJ/IAAoAggiASAAKAIUIgIoAghPBEBB0ApBsAxByABBMhAAAAsgASACKAIEai0AACEBIABBARAsIAELCQAgABA+QQBHC0kBAX8gAUEATgRAIAEgACgCCGoiAiAAKAIEQQFqTARAIAAoAhAgACgCCCACECghAiAAIAEQLCACDwsLQdAKQZA6Qe0DQQUQAAALxAIBBX8gACAAIAFqIgNLBEBBAEHQOkHtBUEHEAAACyABQQF0QQEQEiIFIQEDQCAAIANJBEACQCAALQAAIQIgAEEBaiEAIAJBgAFxBEAgACADRg0BIAAtAABBP3EhBCAAQQFqIQAgAkHgAXFBwAFGBEAgASAEIAJBH3FBBnRyOwEABSAAIANGDQIgAC0AAEE/cSEGIABBAWohACACQfABcUHgAUYEQCAGIAJBD3FBDHQgBEEGdHJyIQIFIAAgA0YNAyAALQAAQT9xIAJBB3FBEnQgBEEMdHIgBkEGdHJyIQIgAEEBaiEACyACQYCABEkEQCABIAI7AQAFIAEgAkGAgARrIgJBCnZBgLADciACQf8HcUGAuANyQRB0cjYCACABQQJqIQELCwUgASACOwEACyABQQJqIQEMAgsLCyAFIAEgBWsQGAuTAQEEf0GwOSECIAAQKSIAKAIIIQQDQCABIARIBEAgASAAKAIITwRAQdAKQfAMQZ8BQS0QAAALIAEgACgCBGotAAAiA0HMCCgCAE8EQEHQCkGQC0HcAEEqEAAAC0HECCgCACADQQJ0aigCACIDRQRAQYA7QZALQeAAQSgQAAALIAIgAxA6IQIgAUEBaiEBDAELCyACC4gBAAJAAkACQAJAIwQOAwECAwALAAtBACEBC0GAICECCwJ/IABFBEBBGEEFEBIhAAsgAAtBABAbIABBABACIABBABADIABBABAMIABBABANIABBABAgIAAgAhAbIAAgASACEBwQDCAAIAAoAgwQHRANIAAoAhAoAgAhAUEBJAQgACABEB8QICAAC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEECECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQJqSHIEQEHQCkGwDEH0AEEHEAAACyADIAQoAgRqIAIEfyABBSABEDELOwEAIABBAhAsC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEECECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQJqSHIEQEHQCkGwDEGHAUEHEAAACyADIAQoAgRqIAIEfyABBSABEDILOwEAIABBAhAsC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEEECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQRqSHIEQEHQCkGwDEH7AEEHEAAACyADIAQoAgRqIAIEfyABBSABEDMLNgIAIABBBBAsC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEEECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQRqSHIEQEHQCkGwDEGOAUEHEAAACyADIAQoAgRqIAIEfyABBSABEDMLNgIAIABBBBAsC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEIECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQhqSHIEQEHQCkGwDEGnAUEHEAAACyADIAQoAgRqIAIEfiABBSABEDQLNwMAIABBCBAsC2sBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEIECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQhqSHIEQEHQCkGwDEGuAUEHEAAACyADIAQoAgRqIAIEfiABBSABEDQLNwMAIABBCBAsC3cBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEEECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQRqSHIEQEHQCkGwDEHfAEEHEAAACyACBEAgAyAEKAIEaiABOAIABSADIAQoAgRqIAG8EDM2AgALIABBBBAsC3cBAn8CQAJAAkAjBEEBaw4CAQIACwALQQAhAgsgAEEIECUgACgCCCIDQR92IAAoAhQiBCgCCCADQQhqSHIEQEHQCkGwDEHnAEEHEAAACyACBEAgAyAEKAIEaiABOQMABSADIAQoAgRqIAG9EDQ3AwALIABBCBAsC1gBAX8CQAJAAkAjBEEBaw4CAQIACwALQdA3IQILIAEgAhA7IQFBASQEIAEQHiEDQQxBBBASIgIgATYCACACIAM2AgggAiABNgIEQQEkBCAAIAJBAEEAEDwLawECfwJAAkACQCMEDgIBAgALAAtBACEBCyAAKAIIIgJBH3YgACgCFCIDKAIIIAJBAmpIcgRAQdAKQbAMQTpBBxAAAAsgAiADKAIEai4BACECIAFFBEAgAhAxIQILIABBAhAsIAJBEHRBEHULawECfwJAAkACQCMEDgIBAgALAAtBACEBCyAAKAIIIgJBH3YgACgCFCIDKAIIIAJBAmpIcgRAQdAKQbAMQc8AQQcQAAALIAIgAygCBGovAQAhAiABRQRAIAIQMiECCyAAQQIQLCACQf//A3ELZgECfwJAAkACQCMEDgIBAgALAAtBACEBCyAAKAIIIgJBH3YgACgCFCIDKAIIIAJBBGpIcgRAQdAKQbAMQcIAQQcQAAALIAIgAygCBGooAgAhAiABRQRAIAIQMyECCyAAQQQQLCACC2YBAn8CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQRqSHIEQEHQCkGwDEHXAEEHEAAACyACIAMoAgRqKAIAIQIgAUUEQCACEDMhAgsgAEEEECwgAgtoAgJ/AX4CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQhqSHIEQEHQCkGwDEGXAUEHEAAACyACIAMoAgRqKQMAIQQgAUUEQCAEEDQhBAsgAEEIECwgBAtoAgJ/AX4CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQhqSHIEQEHQCkGwDEGfAUEHEAAACyACIAMoAgRqKQMAIQQgAUUEQCAEEDQhBAsgAEEIECwgBAtvAgJ/AX0CQAJAAkAjBA4CAQIACwALQQAhAQsgACgCCCICQR92IAAoAhQiAygCCCACQQRqSHIEQEHQCkGwDEEjQQcQAAALIAEEfSACIAMoAgRqKgIABSACIAMoAgRqKAIAEDO+CyEEIABBBBAsIAQLbwICfwF8AkACQAJAIwQOAgECAAsAC0EAIQELIAAoAggiAkEfdiAAKAIUIgMoAgggAkEIakhyBEBB0ApBsAxBLEEHEAAACyABBHwgAiADKAIEaisDAAUgAiADKAIEaikDABA0vwshBCAAQQgQLCAEC5EBAAJAAkACQCMEQQFrDgIBAgALAAtB0DchAgsgACABEEAoAgAhAQJAIAIQNyIAQdA3EDgEf0EBBSAAQfA3EDgLBEAgASABEB4QQSEADAELIABBkDgQOAR/QQEFIABBsDgQOAsEQCABEB5BfnEiAkEBEBIiACABIAIQEwwBC0HQOCACEDpB0DlBPUEDEAAACyAACwoAIAAoAgRBA3ELUgEBfyAAEBciAUUEQEEAIABB/D1JIAAoAggbRQRAQQBBsAlB5QBBEhAAAAsPCyAAKAIIIgBFBEBBAEGwCUHpAEEQEAAACyABIAAQAyAAIAEQDws0AQF/IAAEQCAAQRRrIgEQVkEDRgRAQYA8QbAJQbUBQQcQAAALIAEQVyABIwdBAxAQCyAACzIAIABFBEAPCyAAQRRrIgAQVkEDRwRAQeA8QbAJQcMBQQUQAAALIAAQVyAAIwEjAhAQC64CAQV/QdAKEFtBwAsQW0GAOxBbQfAIEFtBgDwQW0HgPBBbQbANEFtBwAgQWyMCRSEDIwgiBBAXIQADQCAAIARHBEAgABBWIANHBEBBAEGwCUHWAUEQEAAACyAAQRRqEF0gABAXIQAMAQsLIwciARAXIQADQCAAIAFHBEAgABBWQQNHBEBBAEGwCUHfAUEQEAAACyAAQRRqEF0gABAXIQAMAQsLIwEiAhAXIQADQCAAIAJHBEAgABBWIwJHBEBBAEGwCUHoAUEQEAAACyAAEBchASAAQfw9SQRAIABBABACIABBABADBSMDIAAQEWskAyAAQQRqIgBB/D1PBEAjAEUEQBAHCyMAIAAQFBAVCwsgASEADAELCyACIAIQAiACIAIQAyAEJAEgAiQIIAMkAgslACAARQRADwsgAEEUayIAEFYjAkYEQCAAEFcgACMIIwJFEBALCxAAIAAoAgAiAARAIAAQWwsLlgEBA38CQAJAAkACQAJAAkACQAJAIABBCGsoAgAOCQABBgIHAwYHBAULDwsPCyAAKAIEIgEgACgCDEECdGohAgNAIAEgAkkEQCABKAIAIgMEQCADEFsLIAFBBGohAQwBCwsgACgCABBbDwsgACgCECIBBEAgARBbCyAAKAIUIgAEQCAAEFsLDwsPCwALIAAQXA8LIAAQXAsGACAAJAQLEgAQGkGwPBAOJAdBkD0QDiQICwuXKlEAQYwICwEcAEGsCAsBLABBuAgLDgMAAAAQAAAAIAQAACAEAEHcCAsBPABB6AgLLwEAAAAoAAAAQQBsAGwAbwBjAGEAdABpAG8AbgAgAHQAbwBvACAAbABhAHIAZwBlAEGcCQsBPABBqAkLJQEAAAAeAAAAfgBsAGkAYgAvAHIAdAAvAHQAYwBtAHMALgB0AHMAQdwJCwE8AEHoCQslAQAAAB4AAAB+AGwAaQBiAC8AcgB0AC8AdABsAHMAZgAuAHQAcwBBvAoLATwAQcgKCysBAAAAJAAAAEkAbgBkAGUAeAAgAG8AdQB0ACAAbwBmACAAcgBhAG4AZwBlAEH8CgsBLABBiAsLIQEAAAAaAAAAfgBsAGkAYgAvAGEAcgByAGEAeQAuAHQAcwBBrAsLASwAQbgLCyMBAAAAHAAAAEkAbgB2AGEAbABpAGQAIABsAGUAbgBnAHQAaABB3AsLATwAQegLCy0BAAAAJgAAAH4AbABpAGIALwBhAHIAcgBhAHkAYgB1AGYAZgBlAHIALgB0AHMAQZwMCwE8AEGoDAsnAQAAACAAAAB+AGwAaQBiAC8AZABhAHQAYQB2AGkAZQB3AC4AdABzAEHcDAsBPABB6AwLKwEAAAAkAAAAfgBsAGkAYgAvAHQAeQBwAGUAZABhAHIAcgBhAHkALgB0AHMAQZwNCwJMAwBBqA0LtgYIAAAAMAMAAN8AUwBTAAAASQG8Ak4AAADwAUoADAMAAJADmQMIAwEDsAOlAwgDAQOHBTUFUgUAAJYeSAAxAwAAlx5UAAgDAACYHlcACgMAAJkeWQAKAwAAmh5BAL4CAABQH6UDEwMAAFIfpQMTAwADVB+lAxMDAQNWH6UDEwNCA4AfCB+ZAwAAgR8JH5kDAACCHwofmQMAAIMfCx+ZAwAAhB8MH5kDAACFHw0fmQMAAIYfDh+ZAwAAhx8PH5kDAACIHwgfmQMAAIkfCR+ZAwAAih8KH5kDAACLHwsfmQMAAIwfDB+ZAwAAjR8NH5kDAACOHw4fmQMAAI8fDx+ZAwAAkB8oH5kDAACRHykfmQMAAJIfKh+ZAwAAkx8rH5kDAACUHywfmQMAAJUfLR+ZAwAAlh8uH5kDAACXHy8fmQMAAJgfKB+ZAwAAmR8pH5kDAACaHyofmQMAAJsfKx+ZAwAAnB8sH5kDAACdHy0fmQMAAJ4fLh+ZAwAAnx8vH5kDAACgH2gfmQMAAKEfaR+ZAwAAoh9qH5kDAACjH2sfmQMAAKQfbB+ZAwAApR9tH5kDAACmH24fmQMAAKcfbx+ZAwAAqB9oH5kDAACpH2kfmQMAAKofah+ZAwAAqx9rH5kDAACsH2wfmQMAAK0fbR+ZAwAArh9uH5kDAACvH28fmQMAALIfuh+ZAwAAsx+RA5kDAAC0H4YDmQMAALYfkQNCAwAAtx+RA0IDmQO8H5EDmQMAAMIfyh+ZAwAAwx+XA5kDAADEH4kDmQMAAMYflwNCAwAAxx+XA0IDmQPMH5cDmQMAANIfmQMIAwAD0x+ZAwgDAQPWH5kDQgMAANcfmQMIA0ID4h+lAwgDAAPjH6UDCAMBA+QfoQMTAwAA5h+lA0IDAADnH6UDCANCA/If+h+ZAwAA8x+pA5kDAAD0H48DmQMAAPYfqQNCAwAA9x+pA0IDmQP8H6kDmQMAAAD7RgBGAAAAAftGAEkAAAAC+0YATAAAAAP7RgBGAEkABPtGAEYATAAF+1MAVAAAAAb7UwBUAAAAE/tEBUYFAAAU+0QFNQUAABX7RAU7BQAAFvtOBUYFAAAX+0QFPQUAQewTC4AEBwgJCgsMBgYGBgYGBgYGBg0GBg4GBgYGBgYGBg8QERIGEwYGBgYGBgYGBgYUFQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBhYXBgYGGAYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGGQYGBgYaBgYGBgYGBhsGBgYGBgYGBgYGBhwGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGHQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGHgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYAQdsYCxQkKysrKysrKysBAFRWVlZWVlZWVgBBghkLnwMYAAAAKysrKysrKwcrK1tWVlZWVlZWSlZWBTFQMVAxUDFQMVAxUDFQMVAkUHkxUDFQMThQMVAxUDFQMVAxUDFQMVBOMQJODQ1OA04AJG4ATjEmblFOJFBOORSBGx0dUzFQMVANMVAxUDFQG1MkUDECXHtce1x7XHtcexR5XHtce1wtK0kDSAN4XHsUAJYKASsoBgYAKgYqKisHu7UrHgArBysrKwErKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKwErKysrKysrKysrKysrKysrKysrKysrKyorKysrKysrKysrKysrzUbNKwAlKwcBBgFVVlZWVlZVVlYCJIGBgYGBFYGBgQAAKwCy0bLRstGy0QAAzcwBANfX19fXg4GBgYGBgYGBgYGsrKysrKysrKysHAAAAAAAMVAxUDFQMVAxUDECAAAxUDFQMVAxUDFQMVAxUDFQMVBOMVAxUE4xUDFQMVAxUDFQMVAxUDECh6aHpoemh6aHpoemh6aHpiorKysrKysrKysrKysAAABUVlZWVlZWVlZWVlZWAEH/HAshVFZWVlZWVlZWVlZWVgwADCorKysrKysrKysrKysrByoBAEHVHQt3KisrKysrKysrKysrKysrKysrKysrKysrKysrVlZsgRUAKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrB2wDQSsrVlZWVlZWVlZWVlZWVlYsVisrKysrKysrKysrKysrKysrKysrKwEAQfQeCwgMbAAAAAAABgBBoh8L6AIGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJVZ6niYGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGASsrT1ZWLCt/VlY5KytVVlYrK09WViwrf1ZWgTd1W3tcKytPVlYCrAQAADkrK1VWVisrT1ZWLCsrVlYyE4FXAG+BfsnXfi2BgQ5+OX9vVwCBgX4VAH4DKysrKysrKysrKysrByskK5crKysrKysrKysqKysrKytWVlZWVoCBgYGBObsqKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKwGBgYGBgYGBgYGBgYGBgYHJrKysrKysrKysrKysrKys0A0ATjECtMHB19ckUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQ19dTwUfU19fXBSsrKysrKysrKysrKwcBAAEAQeUiCx9OMVAxUDFQMVAxUDFQMVANAAAAAAAkUDFQMVAxUDFQAEGmIwtWKysrKysrKysrKyt5XHtce097XHtce1x7XHtce1x7XHtce1x7XC0rK3kUXHtcLXkqXCdce1x7XHukAAq0XHtce08DeDgrKysrKysrKysrKysrTy0rKwEAQZckCwFIAEGhJAsbKisrKysrKysrKysrKysrKysrKysrKysrKysrAEHdJAsUKysrKysrKysHAEhWVlZWVlZWVgIAQaglCxsrKysrKysrKysrKysrVVZWVlZWVlZWVlZWVg4AQeIlCxokKysrKysrKysrKysHAFZWVlZWVlZWVlZWVgBBqCYLJyQrKysrKysrKysrKysrKysrBwAAAABWVlZWVlZWVlZWVlZWVlZWVgBBiScLFiorKysrKysrKysrVlZWVlZWVlZWVg4AQb8nCxYqKysrKysrKysrK1ZWVlZWVlZWVlYOAEGAKAsXKysrKysrKysrKytVVlZWVlZWVlZWVg4AQdkoCwgIAABWAQAAOQBB6CgLvAcBIAAAAOD//wC/HQAA5wIAAHkAAAIkAAABAQAAAP///wAAAAABAgAAAP7//wE5//8AGP//AYf//wDU/v8AwwAAAdIAAAHOAAABzQAAAU8AAAHKAAABywAAAc8AAABhAAAB0wAAAdEAAACjAAAB1QAAAIIAAAHWAAAB2gAAAdkAAAHbAAAAOAAAAwAAAACx//8Bn///Acj//wIoJAAAAAAAAQEAAAD///8AM///ACb//wF+//8BKyoAAV3//wEoKgAAPyoAAT3//wFFAAABRwAAAB8qAAAcKgAAHioAAC7//wAy//8ANv//ADX//wBPpQAAS6UAADH//wAopQAARKUAAC///wAt//8A9ykAAEGlAAD9KQAAK///ACr//wDnKQAAQ6UAACqlAAC7//8AJ///ALn//wAl//8AFaUAABKlAAIkTAAAAAAAASAAAADg//8BAQAAAP///wBUAAABdAAAASYAAAElAAABQAAAAT8AAADa//8A2///AOH//wDA//8Awf//AQgAAADC//8Ax///ANH//wDK//8A+P//AKr//wCw//8ABwAAAIz//wHE//8AoP//Afn//wIacAABAQAAAP///wEgAAAA4P//AVAAAAEPAAAA8f//AAAAAAEwAAAA0P//AQEAAAD///8AAAAAAMALAAFgHAAAAAAAAdCXAAEIAAAA+P//AgWKAAAAAAABQPT/AJ7n/wDCiQAA2+f/AJLn/wCT5/8AnOf/AJ3n/wCk5/8AAAAAADiKAAAEigAA5g4AAQEAAAD///8AAAAAAMX//wFB4v8CHY8AAAgAAAH4//8AAAAAAFYAAAGq//8ASgAAAGQAAACAAAAAcAAAAH4AAAAJAAABtv//Aff//wDb4/8BnP//AZD//wGA//8Bgv//AgWsAAAAAAABEAAAAPD//wEcAAABAQAAAaPi/wFB3/8But//AOT//wILsQABAQAAAP///wEwAAAA0P//AAAAAAEJ1v8BGvH/ARnW/wDV1f8A2NX/AeTV/wED1v8B4dX/AeLV/wHB1f8AAAAAAKDj/wAAAAABAQAAAP///wIMvAAAAAAAAQEAAAD///8BvFr/AaADAAH8df8B2Fr/ADAAAAGxWv8BtVr/Ab9a/wHuWv8B1lr/Aeta/wHQ//8BvVr/Ach1/wAAAAAAMGj/AGD8/wAAAAABIAAAAOD//wAAAAABKAAAANj//wAAAAABQAAAAMD//wAAAAABIAAAAOD//wAAAAABIAAAAOD//wAAAAABIgAAAN7//wBBpTALBQYnUW93AEG0MAsSfAAAfwAAAAAAAAAAg46SlwCqAEHQMAsCtMQAQcoxCwbGyQAAANsAQaMyCw7eAAAAAOEAAAAAAAAA5ABBvDILAecAQZIzCwHqAEGNNAsB7QBBpDQLkAMwDDENeA5/D4AQgRGGEokTihOOFI8VkBaTE5QXlRiWGZcamhucGZ0cnh2fHqYfqR+uH7EgsiC3Ib8ixSPII8sj3STyI/Yl9yYgLTouPS8+MD8xQDFDMkQzRTRQNVE2UjdTOFQ5WTpbO1w8YT1jPmU/ZkBoQWlCakBrQ2xEb0JxRXJGdUd9SIJJh0qJS4pMi0yMTZJOnU+eUEVXex18HX0df1iGWYhaiVqKWoxbjlyPXKxdrV6uXq9ewl/MYM1hzmHPYtBj0WTVZdZm12fwaPFp8mrza/Rs9W35bv0t/i3/LVBpUWlSaVNpVGlVaVZpV2lYaVlpWmlbaVxpXWleaV9pggCDAIQAhQCGAIcAiACJAMB1z3aAiYGKgouFjIaNcJ1xnXaed554n3mfeqB7oHyhfaGzorqju6O8pL6lw6LMpNqm26blauqn66fsbvOi+Kj5qPqp+6n8pCawKrErsk6zhAhiumO7ZLxlvWa+bb9uwG/BcMJ+w3/Dfc+N0JTRq9Ks063UsNWx1rLXxNjF2cbaAEG8NwsBHABByDcLDwEAAAAIAAAAVQBUAEYAOABB3DcLARwAQeg3CxEBAAAACgAAAFUAVABGAC0AOABB/DcLARwAQYg4CxEBAAAACgAAAFUAVABGADEANgBBnDgLARwAQag4CxMBAAAADAAAAFUAVABGAC0AMQA2AEG8OAsBPABByDgLMQEAAAAqAAAAVQBuAHMAdQBwAHAAbwByAHQAZQBkACAAZQBuAGMAbwBkAGkAbgBnACAAQfw4CwEcAEGIOQsPAQAAAAgAAABuAHUAbABsAEGcOQsBHABBqDkLAQEAQbw5CwE8AEHIOQspAQAAACIAAABhAHMAcwBlAG0AYgBsAHkALwB1AHQAaQBsAHMALgB0AHMAQfw5CwE8AEGIOgspAQAAACIAAABhAHMAcwBlAG0AYgBsAHkALwBpAG4AZABlAHgALgB0AHMAQbw6CwEsAEHIOgsjAQAAABwAAAB+AGwAaQBiAC8AcwB0AHIAaQBuAGcALgB0AHMAQew6CwF8AEH4OgtlAQAAAF4AAABFAGwAZQBtAGUAbgB0ACAAdAB5AHAAZQAgAG0AdQBzAHQAIABiAGUAIABuAHUAbABsAGEAYgBsAGUAIABpAGYAIABhAHIAcgBhAHkAIABpAHMAIABoAG8AbABlAHkAQew7CwE8AEH4OwsxAQAAACoAAABPAGIAagBlAGMAdAAgAGEAbAByAGUAYQBkAHkAIABwAGkAbgBuAGUAZABBzDwLATwAQdg8Cy8BAAAAKAAAAE8AYgBqAGUAYwB0ACAAaQBzACAAbgBvAHQAIABwAGkAbgBuAGUAZABBsD0LDQkAAAAgAAAAAAAAACAAQcw9Cw0CQQAAAAAAAEEAAAACAEHsPQsJQQAAAAIAAACk";

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
   * @module examples
   */
  let timer;
  let index = 0;
  const view = document.getElementById('view');
  function onStart() {
      onStop();
      Buffer$1.init().then(({ Buffer, __newString, __getUint8Array }) => {
          const buffer = new Buffer();
          buffer.write(__newString(`${++index}: A buffer tool using WebAssembly.`));
          view.innerHTML = hex(__getUint8Array(buffer.bytes));
          timer = window.setTimeout(onStart, 16);
      });
  }
  function onStop() {
      clearTimeout(timer);
  }
  document.getElementById('start').addEventListener('click', onStart, false);
  document.getElementById('stop').addEventListener('click', onStop, false);

})));
