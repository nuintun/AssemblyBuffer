/**
 * @module Buffer
 * @license MIT
 * @version 0.0.1
 * @author nuintun
 * @description A buffer tool using WebAssembly.
 * @see https://github.com/nuintun/buffer#readme
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

  var wasm = "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NgIIIw4gADYCACMOIAE2AgQgAkEASARAQbAKQeANQcgOQRMQAAALIw4gATYCCCABKAIIIQMjDiAANgIIIAAoAgggAiADakgEQEGwCkHgDUHJDkEvEAAACyACIAAoAgRqIAEoAgQgASgCCBAaIw5BDGokDguSAQECfyMOQQxrJA4QMiMOQgA3AwAjDkEANgIIIAAoAgS3IAEgACgCCGq3paoiAiAAKAIUKAIISgRAIw4gAiAALwEAEB4QNCIBNgIAIw4gATYCBCMOIAAoAhAiAzYCCCABIANBABA2IAAgARAgIAAgAhABIw4gASgCACIBNgIIQQEkCiAAIAEQNRAiCyMOQQxqJA4LqAEBAX8jDkEMayQOEDIjDkIANwMAIw5BADYCCCMOIAA2AgAjDiAANgIEIAAoAgghAyABQQBIBH8gASADaiIBQQAgAUEAShsFIAEgAyABIANIGwshASMOIAJBAEgEfyACIANqIgJBACACQQBKGwUgAiADIAIgA0gbCyABayICQQAgAkEAShsiAhA0IgM2AgggAygCBCABIAAoAgRqIAIQGiMOQQxqJA4gAws2AQF/Iw5BBGskDhAyIw5BADYCACMOIAAoAhAiATYCACABQQAgACgCBBA4IQAjDkEEaiQOIAALbAECfyMOQQRrJA4QMiMOQQA2AgAjDiAANgIAIABBARA3Iw4gACgCFCICNgIAIAAoAggiAyACKAIITwRAQbAKQaANQYABQTIQAAALIAMgAigCBGogAToAACMOIAA2AgAgAEEBECMjDkEEaiQOC8MBAQJ/Iw5BDGskDhAyIw5CADcDACMOQQA2AggjDiAAIgM2AgAjDiAANgIEIAAoAgghBCABQQBIBH8gASAEaiIAQQAgAEEAShsFIAEgBCABIARIGwshACACQQBIBH8gAiAEaiIBQQAgAUEAShsFIAIgBCACIARIGwshAiMOQQxBBBAZIgE2AgggASADKAIAIgQ2AgAgASAEQQAQHCABIAAgAygCBGo2AgQgASACIAAgACACSBsgAGs2AggjDkEMaiQOIAELxQEBAn8jDkEMayQOEDIjDkIANwMAIw5BADYCCCMOIAE2AgAgAiIEQQBOQQAgASgCCCICQQBKGwR/IANBAEgEfyACIAMgBGtqBSADQQBKBH8gArdEAAAAAAAAAAAgAyAEa7elpKoFQQAL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VlZWVlZWVlZWVlYAQe8dCyFUVlZWVlZWVlZWVlZWDAAMKisrKysrKysrKysrKysHKgEAQcUeC3cqKysrKysrKysrKysrKysrKysrKysrKysrKytWVmyBFQArKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysHbANBKytWVlZWVlZWVlZWVlZWVixWKysrKysrKysrKysrKysrKysrKysrAQBB5B8LCAxsAAAAAAAGAEGSIAvoAgYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlVnqeJgYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYlBiUGJQYBKytPVlYsK39WVjkrK1VWVisrT1ZWLCt/VlaBN3Vbe1wrK09WVgKsBAAAOSsrVVZWKytPVlYsKytWVjITgVcAb4F+ydd+LYGBDn45f29XAIGBfhUAfgMrKysrKysrKysrKysHKyQrlysrKysrKysrKyorKysrK1ZWVlZWgIGBgYE5uyorKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrAYGBgYGBgYGBgYGBgYGBgcmsrKysrKysrKysrKysrKzQDQBOMQK0wcHX1yRQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVAxUDFQMVDX11PBR9TX19cFKysrKysrKysrKysrBwEAAQBB1SMLH04xUDFQMVAxUDFQMVAxUA0AAAAAACRQMVAxUDFQMVAAQZYkC1YrKysrKysrKysrK3lce1x7T3tce1x7XHtce1x7XHtce1x7XHtcLSsreRRce1wteSpcJ1x7XHtce6QACrRce1x7TwN4OCsrKysrKysrKysrKytPLSsrAQBBhyULAUgAQZElCxsqKysrKysrKysrKysrKysrKysrKysrKysrKysAQc0lCxQrKysrKysrKwcASFZWVlZWVlZWAgBBmCYLGysrKysrKysrKysrKytVVlZWVlZWVlZWVlZWDgBB0iYLGiQrKysrKysrKysrKwcAVlZWVlZWVlZWVlZWAEGYJwsnJCsrKysrKysrKysrKysrKysHAAAAAFZWVlZWVlZWVlZWVlZWVlZWAEH5JwsWKisrKysrKysrKytWVlZWVlZWVlZWDgBBrygLFiorKysrKysrKysrVlZWVlZWVlZWVg4AQfAoCxcrKysrKysrKysrK1VWVlZWVlZWVlZWDgBBySkLCAgAAFYBAAA5AEHYKQu8BwEgAAAA4P//AL8dAADnAgAAeQAAAiQAAAEBAAAA////AAAAAAECAAAA/v//ATn//wAY//8Bh///ANT+/wDDAAAB0gAAAc4AAAHNAAABTwAAAcoAAAHLAAABzwAAAGEAAAHTAAAB0QAAAKMAAAHVAAAAggAAAdYAAAHaAAAB2QAAAdsAAAA4AAADAAAAALH//wGf//8ByP//AigkAAAAAAABAQAAAP///wAz//8AJv//AX7//wErKgABXf//ASgqAAA/KgABPf//AUUAAAFHAAAAHyoAABwqAAAeKgAALv//ADL//wA2//8ANf//AE+lAABLpQAAMf//ACilAABEpQAAL///AC3//wD3KQAAQaUAAP0pAAAr//8AKv//AOcpAABDpQAAKqUAALv//wAn//8Auf//ACX//wAVpQAAEqUAAiRMAAAAAAABIAAAAOD//wEBAAAA////AFQAAAF0AAABJgAAASUAAAFAAAABPwAAANr//wDb//8A4f//AMD//wDB//8BCAAAAML//wDH//8A0f//AMr//wD4//8Aqv//ALD//wAHAAAAjP//AcT//wCg//8B+f//AhpwAAEBAAAA////ASAAAADg//8BUAAAAQ8AAADx//8AAAAAATAAAADQ//8BAQAAAP///wAAAAAAwAsAAWAcAAAAAAAB0JcAAQgAAAD4//8CBYoAAAAAAAFA9P8Anuf/AMKJAADb5/8Akuf/AJPn/wCc5/8Anef/AKTn/wAAAAAAOIoAAASKAADmDgABAQAAAP///wAAAAAAxf//AUHi/wIdjwAACAAAAfj//wAAAAAAVgAAAar//wBKAAAAZAAAAIAAAABwAAAAfgAAAAkAAAG2//8B9///ANvj/wGc//8BkP//AYD//wGC//8CBawAAAAAAAEQAAAA8P//ARwAAAEBAAABo+L/AUHf/wG63/8A5P//AguxAAEBAAAA////ATAAAADQ//8AAAAAAQnW/wEa8f8BGdb/ANXV/wDY1f8B5NX/AQPW/wHh1f8B4tX/AcHV/wAAAAAAoOP/AAAAAAEBAAAA////Agy8AAAAAAABAQAAAP///wG8Wv8BoAMAAfx1/wHYWv8AMAAAAbFa/wG1Wv8Bv1r/Ae5a/wHWWv8B61r/AdD//wG9Wv8ByHX/AAAAAAAwaP8AYPz/AAAAAAEgAAAA4P//AAAAAAEoAAAA2P//AAAAAAFAAAAAwP//AAAAAAEgAAAA4P//AAAAAAEgAAAA4P//AAAAAAEiAAAA3v//AEGVMQsFBidRb3cAQaQxCxJ8AAB/AAAAAAAAAACDjpKXAKoAQcAxCwK0xABBujILBsbJAAAA2wBBkzMLDt4AAAAA4QAAAAAAAADkAEGsMwsB5wBBgjQLAeoAQf00CwHtAEGUNQuQAzAMMQ14Dn8PgBCBEYYSiROKE44UjxWQFpMTlBeVGJYZlxqaG5wZnRyeHZ8eph+pH64fsSCyILchvyLFI8gjyyPdJPIj9iX3JiAtOi49Lz4wPzFAMUMyRDNFNFA1UTZSN1M4VDlZOls7XDxhPWM+ZT9mQGhBaUJqQGtDbERvQnFFckZ1R31IgkmHSolLikyLTIxNkk6dT55QRVd7HXwdfR1/WIZZiFqJWopajFuOXI9crF2tXq5er17CX8xgzWHOYc9i0GPRZNVl1mbXZ/Bo8WnyavNr9Gz1bflu/S3+Lf8tUGlRaVJpU2lUaVVpVmlXaVhpWWlaaVtpXGldaV5pX2mCAIMAhACFAIYAhwCIAIkAwHXPdoCJgYqCi4WMho1wnXGddp53nnifeZ96oHugfKF9obOiuqO7o7ykvqXDosyk2qbbpuVq6qfrp+xu86L4qPmo+qn7qfykJrAqsSuyTrOECGK6Y7tkvGW9Zr5tv27Ab8Fwwn7Df8N9z43QlNGr0qzTrdSw1bHWstfE2MXZxtoAQaw4CwEcAEG4OAsPAQAAAAgAAABVAFQARgA4AEHMOAsBHABB2DgLEQEAAAAKAAAAVQBUAEYALQA4AEHsOAsBHABB+DgLEQEAAAAKAAAAVQBUAEYAMQA2AEGMOQsBHABBmDkLEwEAAAAMAAAAVQBUAEYALQAxADYAQaw5CwE8AEG4OQsxAQAAACoAAABVAG4AcwB1AHAAcABvAHIAdABlAGQAIABlAG4AYwBvAGQAaQBuAGcAIABB7DkLARwAQfg5Cw8BAAAACAAAAG4AdQBsAGwAQYw6CwEcAEGYOgsBAQBBrDoLATwAQbg6CykBAAAAIgAAAGEAcwBzAGUAbQBiAGwAeQAvAHUAdABpAGwAcwAuAHQAcwBB7DoLATwAQfg6CykBAAAAIgAAAGEAcwBzAGUAbQBiAGwAeQAvAGkAbgBkAGUAeAAuAHQAcwBBrDsLASwAQbg7CyMBAAAAHAAAAH4AbABpAGIALwBzAHQAcgBpAG4AZwAuAHQAcwBB3DsLAXwAQeg7C2UBAAAAXgAAAEUAbABlAG0AZQBuAHQAIAB0AHkAcABlACAAbQB1AHMAdAAgAGIAZQAgAG4AdQBsAGwAYQBiAGwAZQAgAGkAZgAgAGEAcgByAGEAeQAgAGkAcwAgAGgAbwBsAGUAeQBB3DwLATwAQeg8CzEBAAAAKgAAAE8AYgBqAGUAYwB0ACAAYQBsAHIAZQBhAGQAeQAgAHAAaQBuAG4AZQBkAEGcPQsBPABBqD0LLwEAAAAoAAAATwBiAGoAZQBjAHQAIABpAHMAIABuAG8AdAAgAHAAaQBuAG4AZQBkAEHgPQsNCQAAACAAAAAAAAAAIABB/D0LDQJBAAAAAAAAQQAAAAIAQZw+CwlBAAAAAgAAAKQ=";

  function fetchWasm() {
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
  let exports$1;
  var index = {
      async init() {
          if (exports$1)
              return exports$1;
          return (exports$1 = await (await instantiate(fetchWasm())).exports);
      }
  };

  /**
   * @module index
   */

  let timer;
  let index$1 = 0;

  const view = document.getElementById('view');

  function onStart() {
    onStop();

    index.init().then(({ Buffer, __getUint8Array, __newString }) => {
      const buffer = new Buffer();

      buffer.write(__newString(`${++index$1}: A buffer tool using WebAssembly.`));

      view.innerHTML = hex(__getUint8Array(buffer.bytes));

      timer = setTimeout(onStart, 100);
    });
  }

  function onStop() {
    clearTimeout(timer);
  }

  document.getElementById('start').addEventListener('click', onStart, false);
  document.getElementById('stop').addEventListener('click', onStop, false);

})));
