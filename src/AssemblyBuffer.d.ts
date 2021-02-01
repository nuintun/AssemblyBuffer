declare namespace AssemblyBuffer {
  export const UINT8_ARRAY_ID: number;
  export class Buffer {
    static wrap(ptr: number): Buffer;
    constructor(length?: number, pageSize?: number);
    protected grow(length: number): void;
    protected seek(offset: number): void;
    public readonly buffer: number;
    public readonly bytes: number;
    public offset: number;
    public length: number;
    public readAvailable: number;
    public bytesAvailable: number;
    public writeInt8(value: number): void;
    public writeUint8(value: number): void;
    public writeBoolean(value: 0 | 1): void;
    public writeInt16(value: number, littleEndian?: 0 | 1): void;
    public writeUint16(value: number, littleEndian?: 0 | 1): void;
    public writeInt32(value: number, littleEndian?: 0 | 1): void;
    public writeUint32(value: number, littleEndian?: 0 | 1): void;
    public writeInt64(value: bigint, littleEndian?: 0 | 1): void;
    public writeUint64(value: bigint, littleEndian?: 0 | 1): void;
    public writeFloat32(value: number, littleEndian?: 0 | 1): void;
    public writeFloat64(value: number, littleEndian?: 0 | 1): void;
    public writeBytes(bytes: number, begin?: number, end?: number): void;
    public write(value: number, encoding?: number): void;
    public readInt8(): number;
    public readUint8(): number;
    public readBoolean(): 0 | 1;
    public readInt16(littleEndian?: 0 | 1): number;
    public readUint16(littleEndian?: 0 | 1): number;
    public readInt32(littleEndian?: 0 | 1): number;
    public readUint32(littleEndian?: 0 | 1): number;
    public readInt64(littleEndian?: 0 | 1): bigint;
    public readUint64(littleEndian?: 0 | 1): bigint;
    public readFloat32(littleEndian?: 0 | 1): number;
    public readFloat64(littleEndian?: 0 | 1): number;
    public readBytes(length: number): number;
    public read(length: number, encoding?: number): number;
    public clear(): void;
    public valueOf(): number;
    public toString(): number;
  }
}

export default AssemblyBuffer;
