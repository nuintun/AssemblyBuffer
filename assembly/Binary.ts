/**
 * @module Binary
 */

/**
 * @type {string[]}
 * @description 已获得的二进制映射表
 */
export const mapping: string[] = [];

// 生成映射表
for (let i: i32 = 0; i < 256; i++) {
  mapping[i] = String.fromCharCode(i);
}
