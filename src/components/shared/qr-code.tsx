import type { SVGProps } from "react";

// Version 5, error correction level L: enough room for short detail URLs.
const SIZE = 37;
const DATA_CODEWORDS = 108;
const ERROR_CODEWORDS = 26;

function multiply(x: number, y: number) {
  let result = 0;
  for (let bit = 7; bit >= 0; bit--) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> bit) & 1) * x;
  }
  return result;
}

function errorCorrection(data: number[]) {
  const divisor = Array(ERROR_CODEWORDS).fill(0);
  divisor[ERROR_CODEWORDS - 1] = 1;
  let root = 1;
  for (let i = 0; i < ERROR_CODEWORDS; i++) {
    for (let j = 0; j < ERROR_CODEWORDS; j++) {
      divisor[j] = multiply(divisor[j], root);
      if (j + 1 < ERROR_CODEWORDS) divisor[j] ^= divisor[j + 1];
    }
    root = multiply(root, 2);
  }
  const remainder = Array(ERROR_CODEWORDS).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift()!;
    remainder.push(0);
    for (let i = 0; i < ERROR_CODEWORDS; i++) {
      remainder[i] ^= multiply(divisor[i], factor);
    }
  }
  return remainder;
}

export function qrMatrix(value: string): boolean[][] | null {
  const bytes = [...new TextEncoder().encode(value)];
  // Byte mode uses 4 mode bits and 8 length bits for this QR version.
  if (bytes.length > 106) return null;
  const bits: number[] = [];
  const append = (number: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((number >>> i) & 1);
  };
  append(0b0100, 4);
  append(bytes.length, 8);
  bytes.forEach((byte) => append(byte, 8));
  append(0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  }
  while (data.length < DATA_CODEWORDS) data.push(data.length % 2 === 0 ? 0xec : 0x11);
  const codewords = [...data, ...errorCorrection(data)];
  const modules = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  const reserved = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    modules[y][x] = dark;
    reserved[y][x] = true;
  };
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      set(cx + dx, cy + dy, distance !== 2 && distance !== 4);
    }
  };
  finder(3, 3);
  finder(SIZE - 4, 3);
  finder(3, SIZE - 4);
  for (let i = 8; i < SIZE - 8; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  // Format information: error correction level L and mask 0.
  let format = 1 << 3;
  let remainder = format;
  for (let i = 0; i < 10; i++) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  format = ((format << 10) | remainder) ^ 0x5412;
  const formatBit = (i: number) => Boolean((format >>> i) & 1);
  for (let i = 0; i <= 5; i++) set(8, i, formatBit(i));
  set(8, 7, formatBit(6));
  set(8, 8, formatBit(7));
  set(7, 8, formatBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, formatBit(i));
  set(8, SIZE - 8, true);

  let bitIndex = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < SIZE; vertical++) {
      const y = ((right + 1) & 2) === 0 ? SIZE - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (reserved[y][x]) continue;
        const bit = bitIndex < codewords.length * 8
          ? Boolean((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1)
          : false;
        modules[y][x] = bit !== ((x + y) % 2 === 0);
        bitIndex++;
      }
    }
  }
  return modules;
}

export function QrCodeSvg({ value, label = "detail page", ...props }: { value: string; label?: string } & SVGProps<SVGSVGElement>) {
  const matrix = qrMatrix(value);
  if (!matrix) return <p className="text-xs text-rose-700">The detail URL is too long for this QR preview.</p>;
  const path = matrix.flatMap((row, y) => row.flatMap((dark, x) => dark ? `M${x + 4} ${y + 4}h1v1h-1z` : [])).join("");
  return <svg viewBox="0 0 45 45" role="img" aria-label={`QR code for ${label}`} shapeRendering="crispEdges" {...props}>
    <rect width="45" height="45" fill="white" />
    <path d={path} fill="black" />
  </svg>;
}
