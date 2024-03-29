/**
 * @module Buffer
 */

import { SizeOf } from './enum';
import * as CONST from './const';
import * as utils from './utils';
import * as Binary from './Binary';

// Uint8Array 内存 ID
export const UINT8_ARRAY_ID: u32 = idof<Uint8Array>();

/**
 * @class Buffer
 * @classdesc Buffer 类提供用于优化读取，写入以及处理二进制数据的方法和属性
 */
export class Buffer {
  // 缓冲区页大小
  // 容量不足时按页大小增长
  private _pageSize: u16;

  // 已使用字节长度
  private _length: i32 = 0;

  // 读写指针位置
  private _offset: i32 = 0;

  // 初始化字节大小
  private _initLength: i32;

  // 缓冲区数据
  private _bytes: Uint8Array;

  // 缓冲区视图
  private _dataView: DataView;

  /**
   * @constructor
   * @param {u16} [pageSize] 缓冲区分页大小，扩容时将按分页大小增加
   */
  constructor(length: i32 = 0, pageSize: u16 = 4096) {
    this._pageSize = pageSize;
    this._initLength = utils.calcBufferLength(length, pageSize);
    this._bytes = new Uint8Array(this._initLength);
    this._dataView = new DataView(this._bytes.buffer);
  }

  /**
   * @public
   * @property {i32} offset
   * @description 设置读写指针位置，以字节为单位
   * @description 下一次调用读写方法时将在此位置开始读写
   */
  public set offset(value: i32) {
    if (value < 0) {
      throw new RangeError(CONST.OFFSET_INVALID);
    }

    if (value > this._length) {
      throw new RangeError(CONST.OFFSET_OVERFLOW);
    }

    this._offset = value;
  }

  /**
   * @public
   * @property {i32} offset
   * @description 获取读写指针的位置
   * @returns {i32}
   */
  public get offset(): i32 {
    return this._offset;
  }

  /**
   * @public
   * @property {i32} length
   * @description 设置 Buffer 长度
   * @description 如果将长度设置为小于当前长度的值，将会截断该字节数组
   * @description 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧
   */
  public set length(value: i32) {
    if (value < 0) {
      throw new RangeError(CONST.LENGTH_INVALID);
    }

    if (value > this._bytes.length) {
      this.alloc(value - this._offset);
    } else {
      this._length = value;
    }

    if (this._offset > value) {
      this._offset = value;
    }
  }

  /**
   * @public
   * @property {i32} length
   * @description 获取 Buffer 长度
   * @returns {i32}
   */
  public get length(): i32 {
    return this._length;
  }

  /**
   * @public
   * @property {ArrayBuffer} buffer
   * @description 获取 ArrayBuffer 缓冲区
   * @returns {ArrayBuffer}
   */
  public get buffer(): ArrayBuffer {
    return this._bytes.buffer.slice(0, this._length);
  }

  /**
   * @public
   * @property {Uint8Array} bytes
   * @description 获取 Uint8Array 缓冲区
   * @returns {Uint8Array}
   */
  public get bytes(): Uint8Array {
    return this._bytes.slice(0, this._length);
  }

  /**
   * @protected
   * @method alloc
   * @description 分配指定长度的缓冲区大小，如果缓冲区溢出则刷新缓冲区
   * @param {i32} length
   */
  protected alloc(length: i32): void {
    if (length > 0) {
      length += this._offset;

      if (length > this._bytes.length) {
        const bytes: Uint8Array = new Uint8Array(utils.calcBufferLength(length, this._pageSize));

        bytes.set(this._bytes);

        this._bytes = bytes;
        this._dataView = new DataView(bytes.buffer);
      }

      if (length > this._length) {
        this._length = length;
      }
    }
  }

  /**
   * @protected
   * @method stepOffset
   * @description 偏移读写指针
   * @param {i32} offset
   */
  protected stepOffset(offset: i32): void {
    this._offset += offset;
  }

  /**
   * @protected
   * @method assertRead
   * @description 读取断言，防止越界读取
   * @param {number} length
   */
  protected assertRead(length: i32): void {
    if (this._offset + length > this._length) {
      throw new RangeError(CONST.READ_OVERFLOW);
    }
  }

  /**
   * @public
   * @method writeInt8
   * @description 在缓冲区中写入一个有符号整数
   * @param {i8} value 介于 -128 和 127 之间的整数
   */
  public writeInt8(value: i8): void {
    this.alloc(SizeOf.INT8);
    this._dataView.setInt8(this._offset, value);
    this.stepOffset(SizeOf.INT8);
  }

  /**
   * @public
   * @method writeUint8
   * @description 在缓冲区中写入一个无符号整数
   * @param {u8} value 介于 0 和 255 之间的整数
   */
  public writeUint8(value: u8): void {
    this.alloc(SizeOf.UINT8);
    this._dataView.setUint8(this._offset, value);
    this.stepOffset(SizeOf.UINT8);
  }

  /**
   * @method writeBoolean
   * @description 在缓冲区中写入布尔值，true 写 1，false写 0
   * @param {bool} value 布尔值
   */
  public writeBoolean(value: bool): void {
    this.writeUint8(value ? 1 : 0);
  }

  /**
   * @method writeInt16
   * @description 在缓冲区中写入一个 16 位有符号整数
   * @param {i16} value 要写入的 16 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt16(value: i16, littleEndian: bool = false): void {
    this.alloc(SizeOf.INT16);
    this._dataView.setInt16(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.INT16);
  }

  /**
   * @method writeUint16
   * @description 在缓冲区中写入一个 16 位无符号整数
   * @param {u16} value 要写入的 16 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint16(value: u16, littleEndian: bool = false): void {
    this.alloc(SizeOf.UINT16);
    this._dataView.setUint16(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.UINT16);
  }

  /**
   * @method writeInt32
   * @description 在缓冲区中写入一个有符号的 32 位有符号整数
   * @param {i32} value 要写入的 32 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt32(value: i32, littleEndian: bool = false): void {
    this.alloc(SizeOf.INT32);
    this._dataView.setInt32(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.INT32);
  }

  /**
   * @method writeUint32
   * @description 在缓冲区中写入一个无符号的 32 位无符号整数
   * @param {u32} value 要写入的 32 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint32(value: u32, littleEndian: bool = false): void {
    this.alloc(SizeOf.UINT32);
    this._dataView.setUint32(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.UINT32);
  }

  /**
   * @method writeInt64
   * @description 在缓冲区中写入一个无符号的 64 位有符号整数
   * @param {i64} value 要写入的 32 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt64(value: i64, littleEndian: bool = false): void {
    this.alloc(SizeOf.INI64);
    this._dataView.setInt64(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.INI64);
  }

  /**
   * @method writeUint64
   * @description 在缓冲区中写入一个无符号的 64 位无符号整数
   * @param {i64} value 要写入的 64 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint64(value: u64, littleEndian: bool = false): void {
    this.alloc(SizeOf.UINT64);
    this._dataView.setUint64(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.UINT64);
  }

  /**
   * @method writeFloat32
   * @description 在缓冲区中写入一个 IEEE 754 单精度 32 位浮点数
   * @param {f32} value 单精度 32 位浮点数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeFloat32(value: f32, littleEndian: bool = false): void {
    this.alloc(SizeOf.FLOAT32);
    this._dataView.setFloat32(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.FLOAT32);
  }

  /**
   * @method writeFloat64
   * @description 在缓冲区中写入一个 IEEE 754 双精度 64 位浮点数
   * @param {f64} value 双精度 64 位浮点数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeFloat64(value: f64, littleEndian: bool = false): void {
    this.alloc(SizeOf.FLOAT64);
    this._dataView.setFloat64(this._offset, value, littleEndian);
    this.stepOffset(SizeOf.FLOAT64);
  }

  /**
   * @method writeBytes
   * @description 在缓冲区中写入 Uint8Array 对象
   * @param {i32} [begin] Uint8Array 对象开始索引
   * @param {i32} [end] Uint8Array 对象结束索引
   */
  public writeBytes(bytes: Uint8Array, begin: i32 = 0, end: i32 = bytes.length): void {
    bytes = bytes.subarray(begin, end);

    const length: i32 = bytes.length;

    if (length > 0) {
      this.alloc(length);
      this._bytes.set(bytes, this._offset);
      this.stepOffset(length);
    }
  }

  /**
   * @method write
   * @description 将字符串用指定编码写入字节流
   * @param {string} value 要写入的字符串
   * @param {string} [encoding] 字符串编码
   */
  public write(value: string, encoding: string = 'UTF8'): void {
    this.writeBytes(Uint8Array.wrap(utils.stringEncode(value, encoding)));
  }

  /**
   * @method readInt8
   * @description 从缓冲区中读取有符号的整数
   * @returns {i8} 介于 -128 和 127 之间的整数
   */
  public readInt8(): i8 {
    this.assertRead(SizeOf.INT8);

    const value: i8 = this._dataView.getInt8(this._offset);

    this.stepOffset(SizeOf.INT8);

    return value;
  }

  /**
   * @method readUint8
   * @description 从缓冲区中读取无符号的整数
   * @returns {u8} 介于 0 和 255 之间的无符号整数
   */
  public readUint8(): u8 {
    this.assertRead(SizeOf.UINT8);

    const value: u8 = this._dataView.getUint8(this._offset);

    this.stepOffset(SizeOf.UINT8);

    return value;
  }

  /**
   * @method readBoolean
   * @description 从缓冲区中读取布尔值
   * @returns {bool} 如果字节非零，则返回 true，否则返回 false
   */
  public readBoolean(): bool {
    return <bool>this.readUint8();
  }

  /**
   * @method readInt16
   * @description 从缓冲区中读取一个 16 位有符号整数
   * @returns {i16} 介于 -32768 和 32767 之间的 16 位有符号整数
   */
  public readInt16(littleEndian: bool = false): i16 {
    this.assertRead(SizeOf.INT16);

    const value: i16 = this._dataView.getInt16(this._offset, littleEndian);

    this.stepOffset(SizeOf.INT16);

    return value;
  }

  /**
   * @method readUint16
   * @description 从缓冲区中读取一个 16 位无符号整数
   * @returns {u16} 介于 0 和 65535 之间的 16 位无符号整数
   */
  public readUint16(littleEndian: bool = false): u16 {
    this.assertRead(SizeOf.UINT16);

    const value: u16 = this._dataView.getUint16(this._offset, littleEndian);

    this.stepOffset(SizeOf.UINT16);

    return value;
  }

  /**
   * @method readInt32
   * @description 从缓冲区中读取一个 32 位有符号整数
   * @returns {i32} 介于 -2147483648 和 2147483647 之间的 32 位有符号整数
   */
  public readInt32(littleEndian: bool = false): i32 {
    this.assertRead(SizeOf.INT32);

    const value: i32 = this._dataView.getInt32(this._offset, littleEndian);

    this.stepOffset(SizeOf.INT32);

    return value;
  }

  /**
   * @method readUint32
   * @description 从缓冲区中读取一个 32 位无符号整数
   * @returns {u32} 介于 0 和 4294967295 之间的 32 位无符号整数
   */
  public readUint32(littleEndian: bool = false): u32 {
    this.assertRead(SizeOf.UINT32);

    const value: u32 = this._dataView.getUint32(this._offset, littleEndian);

    this.stepOffset(SizeOf.UINT32);

    return value;
  }

  /**
   * @method readInt64
   * @description 从缓冲区中读取一个 64 位有符号整数
   * @returns {i64} 介于 -9223372036854775808 和 9223372036854775807 之间的 64 位有符号整数
   */
  public readInt64(littleEndian: bool = false): i64 {
    this.assertRead(SizeOf.INI64);

    const value: i64 = this._dataView.getInt64(this._offset, littleEndian);

    this.stepOffset(SizeOf.INI64);

    return value;
  }

  /**
   * @method readUint64
   * @description 从缓冲区中读取一个 64 位无符号整数
   * @returns {u64} 介于 0 和 18446744073709551615 之间的 64 位无符号整数
   */
  public readUint64(littleEndian: bool = false): u64 {
    this.assertRead(SizeOf.UINT64);

    const value: u64 = this._dataView.getUint64(this._offset, littleEndian);

    this.stepOffset(SizeOf.UINT64);

    return value;
  }

  /**
   * @method readFloat32
   * @description 从缓冲区中读取一个 IEEE 754 单精度 32 位浮点数
   * @returns {f32} 单精度 32 位浮点数
   */
  public readFloat32(littleEndian: bool = false): f32 {
    this.assertRead(SizeOf.FLOAT32);

    const value: f32 = this._dataView.getFloat32(this._offset, littleEndian);

    this.stepOffset(SizeOf.FLOAT32);

    return value;
  }

  /**
   * @method readFloat64
   * @description 从缓冲区中读取一个 IEEE 754 双精度 64 位浮点数
   * @returns {f64} 双精度 64 位浮点数
   */
  public readFloat64(littleEndian: bool = false): f64 {
    this.assertRead(SizeOf.FLOAT64);

    const value: f64 = this._dataView.getFloat64(this._offset, littleEndian);

    this.stepOffset(SizeOf.FLOAT64);

    return value;
  }

  /**
   * @method writeBytes
   * @description 从缓冲区中读取指定长度的 Uint8Array 对象
   * @param {number} length 读取的字节长度
   * @returns {Uint8Array}
   */
  public readBytes(length: i32): Uint8Array {
    if (length >= 0) {
      const end: i32 = this._offset + length;

      if (end <= this._length) {
        const bytes: Uint8Array = this._bytes.slice(this._offset, end);

        this.stepOffset(length);

        return bytes;
      }
    }

    throw new RangeError(CONST.READ_OVERFLOW);
  }

  /**
   * @method read
   * @description 从缓冲区中读取一个字符串
   * @param {i32} length 读取的字节长度
   * @param {string} [encoding] 字符串编码
   * @returns {string} 指定编码的字符串
   */
  public read(length: i32, encoding: string = 'UTF8'): string {
    return utils.stringDecode(this.readBytes(length).buffer, encoding);
  }

  /**
   * @override
   * @method toString
   * @description 获取 Buffer 二进制编码字符串
   * @returns {string}
   */
  public toString(): string {
    // 二进制编码字符串
    let binary: string = '';

    // 提前获取 bytes，防止重复计算
    const bytes: Uint8Array = this.bytes;
    const length: i32 = bytes.length;

    // 获取二进制编码
    for (let i: i32 = 0; i < length; i++) {
      binary += Binary.mapping[bytes[i]];
    }

    // 返回二进制编码
    return binary;
  }

  /**
   * @public
   * @method clear
   * @description 清除缓冲区数据并重置默认状态
   */
  public clear(): void {
    this._offset = 0;
    this._length = 0;
    this._bytes = new Uint8Array(this._initLength);
    this._dataView = new DataView(this._bytes.buffer);
  }
}
