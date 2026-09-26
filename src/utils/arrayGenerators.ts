export interface ArrayPreset {
  id: string;
  label: string;
  description: string;
  generator: (size?: number) => number[];
}

export function generateRandomArray(size: number = 10, min: number = 5, max: number = 95): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateSortedArray(size: number = 10): number[] {
  const step = Math.floor(80 / size);
  return Array.from({ length: size }, (_, i) => 10 + i * step);
}

export function generateReversedArray(size: number = 10): number[] {
  return generateSortedArray(size).reverse();
}

export function generateNearlySortedArray(size: number = 10): number[] {
  const arr = generateSortedArray(size);
  // Swap 1 or 2 adjacent pairs
  if (arr.length > 3) {
    const idx = Math.floor(Math.random() * (arr.length - 2)) + 1;
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  }
  return arr;
}

export function generateFewUniqueArray(size: number = 10): number[] {
  const pool = [15, 42, 78];
  return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
}

export function parseCustomArray(inputStr: string): { data: number[]; error?: string } {
  const trimmed = inputStr.trim();
  if (!trimmed) {
    return { data: [], error: 'Please enter at least 2 numbers separated by commas or spaces.' };
  }

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const numbers: number[] = [];

  for (const part of parts) {
    const n = Number(part);
    if (isNaN(n)) {
      return { data: [], error: `Invalid number: "${part}". Please enter numbers only.` };
    }
    numbers.push(Math.round(n));
  }

  if (numbers.length < 2) {
    return { data: [], error: 'Array must have at least 2 elements.' };
  }

  if (numbers.length > 25) {
    return { data: [], error: 'For optimal visualization, array length is limited to 25 elements.' };
  }

  return { data: numbers };
}
